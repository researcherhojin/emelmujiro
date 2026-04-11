#!/usr/bin/env bash
# scripts/setup-dev-machine.sh
#
# One-shot bootstrap for a fresh macOS dev machine.
# Idempotent — safe to re-run on a fully-set-up machine.
#
# Phases:
#   1. Preflight (macOS, Homebrew, repo root with emelmujiro remote)
#   2. Install missing tools (node@24, python@3.12, uv, gh)
#   3. Verify gh CLI auth
#   4. Generate local dev .env files from .env.example templates
#      (per-machine random SECRET_KEY — no inter-device secret sync needed)
#   5. Install JS + Python dependencies (make install)
#   6. Run Django migrations (idempotent)
#   7. Optional: Playwright Chromium (--with-playwright)
#   8. Configure git for two-device safety (pull.rebase, autoStash)
#   9. Verify the setup (calls `make verify-setup`)
#
# DESIGN: This script does NOT manage production secrets. Production
# .env.production files (real SECRET_KEY, real reCAPTCHA, real Sentry
# DSN) live ONLY on the machine that runs `auto-deploy.sh` (Mac mini)
# and in GitHub Actions secrets — they intentionally never reach a
# dev-only machine like a MacBook. Principle of least privilege: a
# stolen/lost MacBook cannot leak production credentials.
#
# OPTIONAL FLAGS:
#   --with-playwright   Also install Playwright Chromium (~150 MB; needed
#                       only if you run E2E tests on this machine)

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
WITH_PLAYWRIGHT=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --with-playwright)
      WITH_PLAYWRIGHT=true
      shift
      ;;
    -h|--help)
      sed -n '3,30p' "$0"
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
# Cross-platform sed -i wrapper (macOS BSD vs GNU)
# ----------------------------------------------------------------------
sedi() {
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "$@"
  else
    sed -i "$@"
  fi
}

# ======================================================================
header "Phase 1: Preflight"
# ======================================================================

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
header "Phase 2: Install required tools"
# ======================================================================

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
header "Phase 3: Verify CLI auth"
# ======================================================================

if gh auth status >/dev/null 2>&1; then
  GH_USER=$(gh api user -q .login 2>/dev/null || echo "?")
  ok "gh authenticated as $GH_USER"
else
  err "gh not authenticated."
  hint "Run: gh auth login"
  hint "Then re-run this script."
  exit 1
fi

# ======================================================================
header "Phase 4: Generate local dev .env files"
# ======================================================================
#
# This generates ONLY the files needed for local dev — never the
# .env.production files. Each call is idempotent: existing files are
# preserved as-is (delete them manually to force regeneration).

# (1) Root .env — Docker orchestration only, no real secrets
if [[ -f .env ]]; then
  ok ".env already exists (preserved)"
elif [[ -f .env.example ]]; then
  cp .env.example .env
  ok "Created .env from .env.example"
else
  err ".env.example missing — repo state is wrong"
  exit 1
fi

# (2) backend/.env — local dev Django config with random per-machine SECRET_KEY
if [[ -f backend/.env ]]; then
  ok "backend/.env already exists (preserved)"
elif [[ -f backend/.env.example ]]; then
  cp backend/.env.example backend/.env
  # Django requires SECRET_KEY >= 50 chars. token_urlsafe(50) gives ~67 chars.
  # Per-machine random value — does not need to match other devices.
  RANDOM_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe(50))')
  # Escape & and / for sed substitution safety
  ESCAPED_KEY=$(printf '%s\n' "$RANDOM_KEY" | sed -e 's/[\/&]/\\&/g')
  sedi "s|^SECRET_KEY=.*|SECRET_KEY=$ESCAPED_KEY|" backend/.env
  # Local dev sane defaults — DEBUG=True, allow localhost
  sedi "s|^DEBUG=.*|DEBUG=True|" backend/.env
  sedi "s|^SECURE_SSL_REDIRECT=.*|SECURE_SSL_REDIRECT=False|" backend/.env
  ok "Created backend/.env with random SECRET_KEY + DEBUG=True"
else
  err "backend/.env.example missing — repo state is wrong"
  exit 1
fi

# (3) backend/.env.production — INTENTIONALLY NOT CREATED on dev machines.
# Production secrets only live on Mac mini (auto-deploy.sh source) and
# GitHub Actions secrets. See script header for the rationale.
ok "backend/.env.production intentionally absent (production-only file)"

# (4) frontend/.env.production — same. Local dev uses defaults from
# Vite + the dev proxy in vite.config.ts. Production builds run on
# Mac mini (auto-deploy.sh) and CI, both of which have the file.
ok "frontend/.env.production intentionally absent (production-only file)"

# ======================================================================
header "Phase 5: Install JS + Python dependencies"
# ======================================================================

info "Running make install..."
make install
ok "Dependencies installed"

# ======================================================================
header "Phase 6: Backend migrations"
# ======================================================================

(
  cd backend
  DATABASE_URL="" uv run python manage.py migrate --noinput
)
ok "Migrations up-to-date"

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
header "Phase 8: Configure git for two-device workflow"
# ======================================================================

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
header "Phase 9: Verify"
# ======================================================================

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
hint ""
hint "What this machine intentionally does NOT have:"
hint "  - backend/.env.production    (production Django secrets — Mac mini only)"
hint "  - frontend/.env.production   (production Vite secrets — Mac mini only)"
hint "  This is least-privilege by design: a stolen dev machine cannot"
hint "  leak production credentials."
