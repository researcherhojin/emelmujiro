---
status: approved
module: infra
created: 2026-11-08
updated: 2026-11-14
---

# The independent backup copy keeps arriving when the MacBook is off the home LAN

## Intent

<!-- cspell:ignore plutil bootout -->

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
- **Open questions**: none. Deferred on 2026-11-08; the owner answered both on 2026-11-14:
  - **Remote path: SSH through the existing Cloudflare Tunnel**, behind Cloudflare Access with a service token. Rejected: Tailscale (a third-party daemon and account on the production host) and R2 push (the largest change, and a new receipt path).
  - **Relax the receipt window to 168 h (7 days).** A MacBook that is asleep or away for a week no longer alarms; the independent copy may then be up to 7 days old. Rejected: keeping 36 h, 48 h and 72 h.

## Spec

- **Approach**:
  - **Host (owner, needs sudo).** Add one ingress rule, an SSH hostname with `service: ssh://localhost:22`, above the `http_status:404` catch-all in the locally managed tunnel config the running `cloudflared` reads, and keep the user copy identical. Check it with `cloudflared tunnel ingress validate` and `cloudflared tunnel ingress rule`, restart the daemon, then `cloudflared tunnel route dns <tunnel> <hostname>` (the host already has `cert.pem`). sshd, its keys and `authorized_keys` are unchanged: the tunnel ends at the same `localhost:22` the LAN path reaches.
  - **Cloudflare dashboard (owner).** One self-hosted Access application for that hostname, with one policy whose action is **Service Auth** and which includes only a new service token, `emelmujiro-backup-pull`, with a one-year duration. Its Client Secret is shown once and goes straight into the MacBook token file.
  - **MacBook.** `brew install cloudflared`. The token goes in a 0600 file outside the repository and `.private` sync (path in `.private/operations.md`). A new `scripts/backup/access-ssh-proxy.sh` takes that path as an argument, reads the file and execs `cloudflared access ssh --hostname "$1"` with the id and secret in `TUNNEL_SERVICE_TOKEN_ID` / `TUNNEL_SERVICE_TOKEN_SECRET` (`cloudflared` 2026.9.3 `access ssh --help` lists both), so the secret never appears in argv or `ps`. A `Host` alias in `~/.ssh/config` uses it as `ProxyCommand` and sets `HostKeyAlias` to the existing `.local` name, so `BatchMode=yes` reuses the host key already verified on the LAN and rejects a different key at the tunnel end.
  - **`scripts/backup/pull-backup.py`.** `--host` may be given more than once. Each run probes every host with `ssh … <host> true` under its own subprocess `timeout=` (with a `ProxyCommand`, `ConnectTimeout` does not bound a `cloudflared` that waits for a browser login), logs one line per host, and uses the first that answered for every later call. Probing the fallback on every LAN run keeps a broken tunnel path visible long before the 168 h window would; the LaunchAgent passes the `.local` name first and the tunnel alias second, so the LAN stays the primary path and Cloudflare is only the fallback. When none answers it prints one line naming each host and its failure and exits non-zero, instead of a traceback per run.
  - **Receipt window.** `offsiteFresh()` (`scripts/security/operations.ts`) uses a named 168 h limit for both `completedAt` and `backedUpAt`. The operations report itself, the image report and the refresh check keep 36 h.
  - Rejected: always using the tunnel (it would make every pull depend on Cloudflare while on the LAN); passing the token as flags (it would show in `ps`); a token in `.private/` (that directory syncs between machines, while the key never leaves this MacBook).
- **Files and interfaces**:
  - `scripts/backup/pull-backup.py`: repeated `--host`, the probe, the one-line failure.
  - `scripts/backup/access-ssh-proxy.sh` (new): `ProxyCommand` wrapper; refuses a token file that is not mode 0600.
  - `scripts/backup/test-backup-verify.py`: host selection cases (first answers; first fails and second answers; none answers; a probe that hangs past its timeout).
  - `scripts/security/operations.ts` and `scripts/tests/operations.test.ts`: the 168 h limit, with cases at 167 h (fresh) and 169 h (stale).
  - `.claude/rules/ci.md` › Scheduled security operations and `docs/intents/infra/security-operations.md`: the receipt window sentence.
  - `CHANGELOG.md`: one entry.
  - Outside the repo: the host tunnel config, the Access application and token, the MacBook token file, `~/.ssh/config`, and the LaunchAgent `ProgramArguments` (replaced as a whole array with `plutil -replace … -json`, then read back). The hostname, the alias and the steps go in `.private/operations.md`.
- **Out of scope**:
  - A MacBook that is asleep or off: no path fixes it, and the 168 h window is the answer for that case.
  - sshd hardening and key rotation on the host.
  - The 36 h windows for the operations, image and refresh reports.
  - Moving the private key or decrypting anywhere but this MacBook.
- **Done when**:
  1. `npm run check:scripts` passes, including the new 167 h / 169 h receipt cases and the three host-selection cases.
  2. On the host, `cloudflared tunnel ingress validate` prints `OK`, and `cloudflared tunnel ingress rule ssh://<hostname>` matches the `ssh://localhost:22` rule.
  3. `curl -sI https://<hostname>` from the MacBook returns 401, 403 or an Access login redirect (no token, no access), and `ssh <alias> true` through the wrapper exits 0.
  4. With `access-token` at mode 0644, `ssh <alias> true` exits non-zero and the wrapper prints why.
  5. End to end on the LAN, forcing the fallback: `pull-backup.py --host nonexistent.invalid --host <alias> …` logs `Encrypted backup copied, decrypted, and verified on independent storage`, the host's receipt names the newest archive, and a host job rerun reports `offsite: true`.
  6. Off the home LAN (where `<host>.local` does not resolve), the LaunchAgent's next run succeeds through the alias. This needs the MacBook away, so it is confirmed afterwards and tracked as a journal Backlog row, as is the token's one-year expiry.

## Plan

Code first, so the owner's host and dashboard steps land on a merged, tested client.

1. **Receipt window.** In `scripts/security/operations.ts`, add `OFFSITE_MAX_AGE_MS = 168 * 3600000` and use it in `offsiteFresh()` for both keys. The other three `36 * 3600000` checks stay. Add cases to `scripts/tests/operations.test.ts`: receipt and snapshot at 167 h fresh, at 169 h stale. 168 h = 7 × 24.
2. **Host selection.** In `scripts/backup/pull-backup.py`, make `--host` `action="append"`, validate each value with the existing regex, and add `select_host(hosts, run)`: for every host run `ssh -4 -o BatchMode=yes -o ConnectTimeout=10 <host> true` with `timeout=30`, log `host <name>: ok` or `host <name>: <reason>`, and return the first that succeeded; raise a one-line error naming each failure when none did. Catch that error in `main` and exit 1 without a traceback. `run` is injected so the tests need no network.
3. **Tests.** In `scripts/backup/test-backup-verify.py`, load `pull-backup.py` by path like `backup-verify.py`, and cover: first host ok; first fails, second ok (both probed, second chosen); none ok (exit 1, one line); a probe raising `TimeoutExpired` counts as a failure.
4. **Wrapper.** `scripts/backup/access-ssh-proxy.sh <token-file> <hostname>`: `set -euo pipefail`; refuse unless the file is a regular file with mode `600` owned by the caller (`stat -f %Lp`/`%u` on macOS); read two lines without `source`; export `TUNNEL_SERVICE_TOKEN_ID` / `TUNNEL_SERVICE_TOKEN_SECRET`; `exec cloudflared access ssh --hostname "$2"`. `shellcheck` clean.
5. **Docs.** `.claude/rules/ci.md` and `docs/intents/infra/security-operations.md`: receipt window 168 h, reports still 36 h. `CHANGELOG.md` entry. `npm run check:scripts`, `npm run spell`, prettier.
6. **Review and ship the code.** `intent-reviewer`, then PR and merge. This step changes nothing on the running system: the LaunchAgent still passes one `--host`, and the host only reads the window when the 02:00 job runs.
7. **Owner, host (sudo).** Add the ingress rule to both config copies, `cloudflared tunnel ingress validate`, `cloudflared tunnel ingress rule ssh://<hostname>`, restart the daemon, `cloudflared tunnel route dns`. Steps with real names go in `.private/operations.md`.
8. **Owner, dashboard.** Access self-hosted application for the hostname, Service Auth policy, token `emelmujiro-backup-pull` for one year. Whether a Zero Trust organization already exists, and the plan's seat terms, are unverified: check them on the dashboard first.
9. **MacBook.** `brew install cloudflared`, write the token file (0600), add the `~/.ssh/config` alias with `ProxyCommand` and `HostKeyAlias`, then replace the LaunchAgent `ProgramArguments` as a whole array (`plutil -replace ProgramArguments -json '[…]'`, read back with `plutil -extract`), `launchctl bootout` / `bootstrap`.
10. **Verify.** Done when 2–5 in order, then a journal Backlog row for 6 and for the token expiry.

Risks and how each would show:

- A `known_hosts` miss on the alias: `Host key verification failed` in check 3. Fix the `HostKeyAlias`.
- `cloudflared` waiting for a browser (token wrong or policy not Service Auth): the probe's `timeout=30` fires and the log names the alias.
- The ingress rule placed after the catch-all: check 2's `ingress rule` matches `http_status:404`.
- The LaunchAgent edit inserting instead of replacing (seen on these Macs on 2026-10-29): the `plutil -extract` read-back shows an extra argument.
- The 168 h window hiding a broken LAN path: it cannot, because every run logs each host's result.

## Outcome

<!-- Filled when status becomes shipped or dropped. -->
