#!/usr/bin/env bash
set -euo pipefail
export LC_ALL=C
export PATH="/opt/homebrew/bin:/usr/local/bin:/Applications/Docker.app/Contents/Resources/bin:$PATH"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NODE_BIN="$(command -v node)"
"$NODE_BIN" -e 'if (Number(process.versions.node.split(".")[0]) < 24) { console.error("Node 24 or newer is required"); process.exit(1); }'
TOOLS="$ROOT/backend/logs/security/tools"
# Cron treats percent signs specially, even inside shell quotes.
case "$ROOT$NODE_BIN" in
  *"'"*|*'%'*|*$'\n'*) echo "Unsupported path for cron" >&2; exit 1 ;;
esac
case "$(uname -s)-$(uname -m)" in
  Darwin-arm64) archive=macOS-ARM64; checksum=11a9b6cd2752011b54f01ea4bd0dbfa9f0c41dc6538d5a3f9d23955f471bf4e5 ;;
  Darwin-x86_64) archive=macOS-64bit; checksum=7aa762eacd582052d053b62dcf972a1ab058abe39a57ccae234ed8894945b6b7 ;;
  Linux-x86_64) archive=Linux-64bit; checksum=c7cbe3137fb8a48a17574bede3dd6beb16742d1e9772929940fc90082c39d9c0 ;;
  *) echo "Unsupported scanner platform" >&2; exit 1 ;;
esac
mkdir -p "$TOOLS"
chmod 700 "$ROOT/backend/logs/security" "$TOOLS"
TEMP="$(mktemp -d)"
trap 'rm -rf "$TEMP"' EXIT
curl -fsSL --max-time 180 --retry 2 \
  "https://github.com/aquasecurity/trivy/releases/download/v0.76.1/trivy_0.76.1_$archive.tar.gz" \
  -o "$TEMP/trivy.tar.gz"
printf '%s  %s\n' "$checksum" "$TEMP/trivy.tar.gz" | shasum -a 256 -c -
tar -xzf "$TEMP/trivy.tar.gz" -C "$TEMP" trivy
install -m 700 "$TEMP/trivy" "$TOOLS/trivy"
"$TOOLS/trivy" --version
cd "$ROOT"
# Do not replace existing jobs when the current crontab cannot be read.
if ! crontab -l > "$TEMP/crontab" 2> "$TEMP/error"; then
  if ! grep -qi 'no crontab for' "$TEMP/error"; then
    cat "$TEMP/error" >&2
    exit 1
  fi
fi
grep -vF 'scripts/scan-running-images.ts' "$TEMP/crontab" > "$TEMP/updated" || true
printf "23 4 * * * cd '%s' && TRIVY_BIN='%s/trivy' '%s' scripts/scan-running-images.ts >> '%s/backend/logs/security-scan.log' 2>&1\n" \
  "$ROOT" "$TOOLS" "$NODE_BIN" "$ROOT" >> "$TEMP/updated"
crontab "$TEMP/updated"
echo 'Installed daily image scan at 04:23 in the host timezone.'
