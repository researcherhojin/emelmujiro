---
status: draft
module: infra
created: 2026-11-08
updated: 2026-11-08
---

# The independent backup copy keeps arriving when the MacBook is off the home LAN

## Intent

- **Problem**: the independent-copy job reaches the host only by its `.local` mDNS name, which resolves only on the home LAN (`scripts/backup/pull-backup.py`, `ssh -4 … <host>.local`). Off that LAN, every hourly pull fails, and the receipt the watchdog checks goes stale 36 h after the snapshot it covers.
  - 2026-11-08: the receipt for snapshot `20261106T170002Z` expired at about 05:00Z, so `offsite` was false for about 8 h alongside `images` (#739). The `20261107T170001Z` archive arrived only at 13:05Z (22:05 KST), after the MacBook rejoined the LAN and the agent was started by hand (`launchctl kickstart`).
  - `backend/logs/backup-pull.log` holds 168 successful pulls and 46 failed ones (counted 2026-11-08). The failed pulls are 29 `Could not resolve hostname` and 8 `Operation timed out`. The other 9 tracebacks have no matched message.
  - 31 archives arrived between 2026-10-23 and 2026-11-08 (local file times). The longest gap between arrivals was 41.5 h (2026-11-07 04:35 → 2026-11-08 22:05 KST), and the next longest was 27.5 h (2026-11-05 21:00 → 2026-11-07 00:28 KST).
- **Outcome wanted**: when the MacBook is awake and online on any network, the hourly job copies, decrypts and verifies the newest archive and writes the receipt, as it does today on the LAN. The private key still never leaves the MacBook, and the host still holds only the recipient certificate.
- **Affected systems**: `scripts/backup/pull-backup.py`, the `com.emelmujiro.backup-pull` LaunchAgent, host remote-access configuration, `docs/intents/infra/security-operations.md` (its Spec chose the MacBook copy), and `.claude/rules/ci.md` › Scheduled security operations. Host and key details: `.private/operations.md` › Security operations and encrypted backups.
- **Constraints**:
  - The repo is public. Host names, addresses and credentials stay in `.private/`.
  - Docker ports bind to `127.0.0.1` only (`CLAUDE.md` › Deployment), so the host must not open a new public port.
  - The deploy secret was rotated on 2026-11-02 after a transcript leak (`.private/operations.md`). Any new credential on the MacBook is a separate one, never the deploy secret.
  - Package inventories, host details and backup contents never reach GitHub (`ci.md` › Scheduled security operations).
- **Open questions** (the owner deferred both on 2026-11-08; the work is planned for later):
  - **Which remote path to use.** Every option keeps the private key on the MacBook and opens no public port. Answered by the owner choosing one:
    - **Tailscale on both machines.** `pull-backup.py` would SSH to the host's Tailscale name, so this is the smallest code change. It adds a third-party daemon and account to the production host.
    - **SSH through the existing Cloudflare Tunnel.** An SSH hostname goes behind Cloudflare Access with a service token, and the MacBook connects through `cloudflared` as an SSH `ProxyCommand`. This adds no new vendor. The Access setup lives in the dashboard, and the token needs custody like any other credential.
    - **Push through R2.** The host uploads the already-encrypted archive to Cloudflare R2. The MacBook downloads it there and reports the receipt to an authenticated endpoint behind the tunnel. This needs no SSH, but it is the largest change and needs a new receipt path.
  - **Whether a MacBook that is asleep or switched off for more than 36 h should still alarm.** No network path fixes that case. Answered by the owner choosing one:
    - Keep 36 h, so a missing independent copy stays a real signal.
    - Relax the window, accepting an older independent copy.

## Spec

<!-- Filled when status becomes approved. -->

## Plan

<!-- Filled before the first edit. Plan mode output goes here. -->

## Outcome

<!-- Filled when status becomes shipped or dropped. -->
