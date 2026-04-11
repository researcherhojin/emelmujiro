#!/usr/bin/env bash
# scripts/setup-dev-machine.sh
#
# One-shot bootstrap for a fresh macOS dev machine.
# Idempotent — safe to re-run on a fully-set-up machine.
#
# DEFAULT MODE (restore + install):
#   ./scripts/setup-dev-machine.sh
#
#   1. Preflight (macOS, Homebrew, repo root)
#   2. Install missing tools (node@24, python@3.12, uv, gh, 1password-cli)
#   3. Verify gh + op CLI auth
#   4. Restore .env / backend/.env / backend/.env.production /
#      frontend/.env.production from 1Password Secure Notes
#   5. Install JS + Python dependencies (make install)
#   6. Run Django migrations (idempotent)
#   7. Configure git for two-device safety (pull.rebase, autoStash)
#   8. Verify the setup (calls `make verify-setup`)
#
# SAVE MODE (run on the SOURCE machine, e.g. Mac mini, ONCE):
#   ./scripts/setup-dev-machine.sh --save-secrets
#
#   Reads the 4 local .env files and saves each as a 1Password Secure Note
#   so the default mode can restore them on the next machine. Idempotent —
#   updates existing items if they already exist.
#
# OPTIONAL FLAGS:
#   --with-playwright   Also install Playwright Chromium (~150 MB; needed
#                       only if you run E2E tests on this machine)
#   --skip-secrets      Skip the secret restore step (use if you're going
#                       to manually copy .env files later)

set -euo pipefail

# ----------------------------------------------------------------------
# Pretty printing
# ----------------------------------------------------------------------
RED=$'\033[0;31m'
GREEN=$'\033[0;32m'
YELLOW=$'\033[1;33m'
BLUE=$'\033[0;34m'
DIM=$'\033[2m'
RESET=$'\033[0m'

ok()      { printf "${GREEN}✓${RESET} %s\n" "$*"; }
warn()    { printf "${YELLOW}⚠${RESET}  %s\n" "$*"; }
err()     { printf "${RED}✗${RESET} %s\n" "$*" >&2; }
info()    { printf "${BLUE}→${RESET} %s\n" "$*"; }
header()  { printf "\n${BLUE}═══ %s ═══${RESET}\n" "$*"; }
hint()    { printf "${DIM}  %s${RESET}\n" "$*"; }

# ----------------------------------------------------------------------
# Argument parsing
# ----------------------------------------------------------------------
MODE="restore"
WITH_PLAYWRIGHT=false
SKIP_SECRETS=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --save-secrets)
      MODE="save"
      shift
      ;;
    --with-playwright)
      WITH_PLAYWRIGHT=true
      shift
      ;;
    --skip-secrets)
      SKIP_SECRETS=true
      shift
      ;;
    -h|--help)
      sed -n '3,40p' "$0"
      exit 0
      ;;
    *)
      err "Unknown flag: $1"
      hint "Run with --help for usage."
      exit 1
      ;;
  esac
done

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

# ----------------------------------------------------------------------
# 1Password item naming convention.
#
# Each .env file maps to a Secure Note item with this exact title. The
# script searches across all vaults — only the title needs to match.
# ----------------------------------------------------------------------
SECRET_TITLES=(
  "emelmujiro:.env"
  "emelmujiro:backend/.env"
  "emelmujiro:backend/.env.production"
  "emelmujiro:frontend/.env.production"
)
SECRET_PATHS=(
  ".env"
  "backend/.env"
  "backend/.env.production"
  "frontend/.env.production"
)

# ======================================================================
# Phase 1: Preflight
# ======================================================================
header "Phase 1: Preflight"

if [[ "$OSTYPE" != "darwin"* ]]; then
  err "macOS only (detected: $OSTYPE)"
  exit 1
fi
ok "macOS detected"

if ! command -v brew >/dev/null 2>&1; then
  err "Homebrew not installed."
  hint "Install first:"
  hint "  /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
  exit 1
fi
ok "Homebrew available"

if [[ ! -d ".git" ]]; then
  err "Not in a git repo. Run from the emelmujiro repo root."
  exit 1
fi
REMOTE_URL=$(git remote get-url origin 2>/dev/null || true)
if [[ "$REMOTE_URL" != *"emelmujiro"* ]]; then
  err "This doesn't look like the emelmujiro repo (remote: $REMOTE_URL)"
  exit 1
fi
ok "Inside emelmujiro repo"

# ======================================================================
# Phase 2: Install required tools (idempotent)
# ======================================================================
header "Phase 2: Install required tools"

install_brew_pkg() {
  local pkg="$1"
  if brew list "$pkg" >/dev/null 2>&1; then
    ok "$pkg already installed"
  else
    info "Installing $pkg..."
    brew install "$pkg"
    ok "$pkg installed"
  fi
}

install_brew_pkg "node@24"
install_brew_pkg "python@3.12"
install_brew_pkg "uv"
install_brew_pkg "gh"
install_brew_pkg "1password-cli"

# node@24 is keg-only (not in PATH by default after brew install)
NODE24_BIN="$(brew --prefix node@24)/bin"
if [[ ":$PATH:" != *":$NODE24_BIN:"* ]]; then
  warn "node@24 is not on your PATH."
  hint "Add this to ~/.zshrc and restart your shell:"
  hint "  export PATH=\"$NODE24_BIN:\$PATH\""
  export PATH="$NODE24_BIN:$PATH"
  info "Temporarily added to PATH for this script run."
fi
ok "node $(node --version)"

# ======================================================================
# Phase 3: Verify CLI auth
# ======================================================================
header "Phase 3: Verify CLI auth"

if gh auth status >/dev/null 2>&1; then
  GH_USER=$(gh api user -q .login 2>/dev/null || echo "?")
  ok "gh authenticated as $GH_USER"
else
  err "gh not authenticated."
  hint "Run: gh auth login"
  hint "Then re-run this script."
  exit 1
fi

if [[ "$SKIP_SECRETS" == "false" ]]; then
  # `op whoami` works only when signed in for the current shell session
  if op whoami >/dev/null 2>&1; then
    ok "1Password CLI signed in as $(op whoami 2>/dev/null | head -1)"
  else
    err "1Password CLI not signed in for this shell."
    hint "Sign in for this session:"
    hint "  eval \$(op signin)"
    hint "Then re-run this script."
    hint ""
    hint "Or skip secrets and copy .env files manually:"
    hint "  ./scripts/setup-dev-machine.sh --skip-secrets"
    exit 1
  fi
fi

# ======================================================================
# Phase 4: Save OR Restore secrets via 1Password
# ======================================================================
extract_note_from_op() {
  # Read a Secure Note's content via 1Password CLI.
  # Prints content to stdout. Exits non-zero if item not found.
  local title="$1"
  op item get "$title" --format=json 2>/dev/null | python3 -c "
import json, sys
try:
    d = json.load(sys.stdin)
    notes = [f.get('value', '') for f in d.get('fields', []) if f.get('purpose') == 'NOTES']
    if notes and notes[0]:
        sys.stdout.write(notes[0])
        sys.exit(0)
    sys.exit(2)
except (json.JSONDecodeError, KeyError):
    sys.exit(1)
"
}

save_note_to_op() {
  # Create or update a Secure Note in 1Password with file content.
  local title="$1" file="$2"
  if ! [[ -f "$file" ]]; then
    warn "$file does not exist locally — skipping save"
    return 0
  fi
  local content
  content=$(<"$file")
  if op item get "$title" >/dev/null 2>&1; then
    info "Updating existing item: $title"
    op item edit "$title" "notesPlain=$content" >/dev/null
    ok "Updated $title (from $file)"
  else
    info "Creating new item: $title"
    op item create --category="Secure Note" --title="$title" "notesPlain=$content" >/dev/null
    ok "Created $title (from $file)"
  fi
}

if [[ "$MODE" == "save" ]]; then
  header "Phase 4: Save local secrets to 1Password"
  warn "This will read your local .env files and write them to 1Password."
  warn "Existing items with the same title will be UPDATED in place."
  warn ""
  for i in "${!SECRET_TITLES[@]}"; do
    save_note_to_op "${SECRET_TITLES[$i]}" "${SECRET_PATHS[$i]}"
  done
  ok "All available secrets saved to 1Password."
  hint "Now on your other machine, run:"
  hint "  ./scripts/setup-dev-machine.sh"
  exit 0
fi

if [[ "$SKIP_SECRETS" == "false" ]]; then
  header "Phase 4: Restore secrets from 1Password"

  MISSING=()
  for i in "${!SECRET_TITLES[@]}"; do
    title="${SECRET_TITLES[$i]}"
    dest="${SECRET_PATHS[$i]}"

    if [[ -f "$dest" && -s "$dest" ]]; then
      ok "$dest already exists (skipping — delete the file to force restore)"
      continue
    fi

    if content=$(extract_note_from_op "$title"); then
      mkdir -p "$(dirname "$dest")"
      printf '%s' "$content" >"$dest"
      ok "Restored $dest from 1Password"
    else
      MISSING+=("$title|$dest")
    fi
  done

  if [[ ${#MISSING[@]} -gt 0 ]]; then
    err "Missing 1Password Secure Notes:"
    for entry in "${MISSING[@]}"; do
      title="${entry%|*}"
      dest="${entry#*|}"
      hint "  - Title: $title  →  $dest"
    done
    hint ""
    hint "On your source machine (where the .env files exist), run:"
    hint "  ./scripts/setup-dev-machine.sh --save-secrets"
    hint ""
    hint "Or create them manually in 1Password as Secure Notes with the"
    hint "exact titles above and the file content in the Notes field."
    exit 1
  fi
else
  header "Phase 4: Skipping secret restore (--skip-secrets)"
  warn "Don't forget to manually create the 4 .env files before running the app:"
  for path in "${SECRET_PATHS[@]}"; do
    hint "  - $path"
  done
fi

# ======================================================================
# Phase 5: Install dependencies
# ======================================================================
header "Phase 5: Install JS + Python dependencies"

info "Running make install..."
make install
ok "Dependencies installed"

# ======================================================================
# Phase 6: Backend migrations (idempotent — no-op if schema is current)
# ======================================================================
header "Phase 6: Backend migrations"

(
  cd backend
  DATABASE_URL="" uv run python manage.py migrate --noinput
)
ok "Migrations up-to-date"

# ======================================================================
# Phase 7: Optional Playwright install
# ======================================================================
if [[ "$WITH_PLAYWRIGHT" == "true" ]]; then
  header "Phase 7: Install Playwright Chromium"
  (cd frontend && npx playwright install chromium)
  ok "Playwright Chromium installed"
else
  header "Phase 7: Skipping Playwright (use --with-playwright to enable)"
  hint "Run later if you want E2E tests on this machine:"
  hint "  cd frontend && npx playwright install chromium"
fi

# ======================================================================
# Phase 8: Configure git for two-device safety
# ======================================================================
header "Phase 8: Configure git for two-device workflow"

# Auto-rebase on pull (avoids merge commits when both devices push)
if [[ "$(git config --global pull.rebase || true)" == "true" ]]; then
  ok "git pull.rebase already true"
else
  git config --global pull.rebase true
  ok "Set git pull.rebase=true (no more merge commits from two-device pulls)"
fi

# Auto-stash before rebase (lets you pull even with uncommitted local changes)
if [[ "$(git config --global rebase.autoStash || true)" == "true" ]]; then
  ok "git rebase.autoStash already true"
else
  git config --global rebase.autoStash true
  ok "Set git rebase.autoStash=true (auto-stashes uncommitted work during rebase)"
fi

# ======================================================================
# Phase 9: Verify the setup
# ======================================================================
header "Phase 9: Verify"

if make verify-setup; then
  ok "All verification checks passed"
else
  err "Verification failed — see output above"
  exit 1
fi

# ======================================================================
# Final summary
# ======================================================================
printf "\n${GREEN}═══════════════════════════════════════════${RESET}\n"
printf "${GREEN}  ✓  Dev machine setup complete${RESET}\n"
printf "${GREEN}═══════════════════════════════════════════${RESET}\n\n"

hint "Next steps:"
hint "  npm run dev              # Start frontend :5173 + backend :8000"
hint "  make help                # See available commands"
hint ""
hint "Daily two-device hygiene (now automated by git config):"
hint "  - 'git pull' is now 'git pull --rebase' globally"
hint "  - 'git rebase' auto-stashes uncommitted work"
hint "  - Branch protection on main blocks force-push (sanity net)"
