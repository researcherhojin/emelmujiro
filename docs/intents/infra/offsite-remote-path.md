---
status: approved
module: infra
created: 2026-11-08
updated: 2026-11-14
---

# The independent backup copy keeps arriving when the MacBook is off the home LAN

## Intent

<!-- cspell:ignore plutil bootout killpg Popen forcecommand permittty disableforwarding -->

- **Problem**: the independent-copy job reaches the host only by its `.local` mDNS name, which resolves only on the home LAN (`scripts/backup/pull-backup.py`, `ssh -4 … <host>.local`). Off that LAN, every hourly pull fails, and the receipt the watchdog checks goes stale 36 h after the snapshot it covers.
  - 2026-11-08: the receipt for snapshot `20261106T170002Z` expired at about 05:00Z, so `offsite` was false for about 8 h alongside `images` (#739). The `20261107T170001Z` archive arrived only at 13:05Z (22:05 KST), after the MacBook rejoined the LAN and the agent was started by hand (`launchctl kickstart`).
  - `backend/logs/backup-pull.log` holds 168 successful pulls and 46 failed ones (counted 2026-11-08). The failed pulls are 29 `Could not resolve hostname` and 8 `Operation timed out`. The other 9 tracebacks have no matched message.
  - 31 archives arrived between 2026-10-23 and 2026-11-08 (local file times). The longest gap between arrivals was 41.5 h (2026-11-07 04:35 → 2026-11-08 22:05 KST), and the next longest was 27.5 h (2026-11-05 21:00 → 2026-11-07 00:28 KST).
- **Outcome wanted**: when the MacBook is awake and online on any network, the hourly job copies, decrypts and verifies the newest archive and writes the receipt, as it does today on the LAN. The private key still never leaves the MacBook, and the host still holds only the recipient certificate.
- **Affected systems**: `scripts/backup/pull-backup.py`, the `com.emelmujiro.backup-pull` LaunchAgent, host remote-access configuration, `docs/intents/infra/security-operations.md` (its Spec chose the MacBook copy), and `.claude/rules/ci.md` › Scheduled security operations. Host and key details: `.private/operations.md` › Security operations and encrypted backups.
- **Constraints**:
  - The repo is public. Host names, addresses and credentials stay in `.private/`.
  - Docker ports bind to `127.0.0.1` only (`CLAUDE.md` › Deployment), so the host must not open a new public port.
  - Any new credential on the MacBook is a separate one, never the deploy secret (history in `.private/operations.md`).
  - Package inventories, host details and backup contents never reach GitHub (`ci.md` › Scheduled security operations).
- **Open questions**: none. Deferred on 2026-11-08; the owner answered both on 2026-11-14:
  - **Remote path: SSH through the existing Cloudflare Tunnel**, behind Cloudflare Access with a service token. Rejected: Tailscale (a third-party daemon and account on the production host) and R2 push (the largest change, and a new receipt path).
  - **Relax the receipt window to 168 h (7 days).** A MacBook that is asleep or away for a week no longer alarms; the independent copy may then be up to 7 days old. Rejected: keeping 36 h, 48 h and 72 h.

## Spec

- **Approach**:
  - **Order.** The Access application and its Service Auth policy exist before the hostname resolves: the ingress rule and DNS record come last, so sshd is never reachable through the tunnel without Access in front.
  - **Host (owner, needs sudo).** Add one ingress rule, an SSH hostname with `service: ssh://localhost:22`, above the `http_status:404` catch-all in the locally managed tunnel config the running `cloudflared` reads, and keep the user copy identical. Check it with `cloudflared tunnel ingress validate` and `cloudflared tunnel ingress rule`, restart the daemon, then `cloudflared tunnel route dns <tunnel> <hostname>` (the host already has `cert.pem`). sshd, its keys and `authorized_keys` are unchanged: the tunnel ends at the same `localhost:22` the LAN path reaches.
  - **Cloudflare dashboard (owner).** One self-hosted Access application for that hostname, with one policy whose action is **Service Auth** and which includes only a new service token, `emelmujiro-backup-pull`, with a one-year duration. Its Client Secret is shown once and goes straight into the MacBook token file.
  - **MacBook.** `brew install cloudflared`. The token goes in a 0600 file outside the repository and `.private` sync (path in `.private/operations.md`). A new `scripts/backup/access-ssh-proxy.sh` takes that path as an argument, reads the file and execs `cloudflared access ssh --hostname <hostname>` (arguments: token file first, hostname second) with the id and secret in `TUNNEL_SERVICE_TOKEN_ID` / `TUNNEL_SERVICE_TOKEN_SECRET` (`cloudflared` 2026.9.3 `access ssh --help` lists both). That keeps the secret out of argv; it is still in the `cloudflared` process environment, readable by the same user or root, which the token file's 0600 mode already concedes. A `Host` alias in `~/.ssh/config` uses it as `ProxyCommand`, sets `HostKeyAlias` to the existing `.local` name (present in `known_hosts`, checked 2026-11-14) and `StrictHostKeyChecking yes`, so the host key already verified on the LAN is required and a different key at the tunnel end is rejected rather than prompted for. The LaunchAgent's `PATH` already includes `/opt/homebrew/bin` (read from its plist on 2026-11-14); the wrapper still calls `cloudflared` by absolute path.
  - **`scripts/backup/pull-backup.py`.** `--host` may be given more than once. Each run probes every host (`probe` with `--identity`, `true` without) under a 30 s limit, logs one line per host, and uses the first that answered for every later call. The probe runs in its own process group (`start_new_session=True`) and kills the whole group on timeout, because with a `ProxyCommand` neither `ConnectTimeout` nor killing `ssh` alone stops a `cloudflared` that waits for a browser login. Probing the fallback on every LAN run records its state in `backup-pull.log`; that is a record, not an alert, so a broken tunnel path is noticed only when someone reads the log or the 168 h window lapses. A failure after the probe (the `LATEST` read, the archive copy or the receipt write) fails that run without trying the other host; the next hourly run probes again. The LaunchAgent passes the `.local` name first and the tunnel alias second, so the LAN stays the primary path and Cloudflare is only the fallback. When none answers it prints one line naming each host and its failure and exits non-zero, instead of a traceback per run.
  - **Receipt window.** `offsiteFresh()` (`scripts/security/operations.ts`) uses a named 168 h limit for both `completedAt` and `backedUpAt`. The operations report check (`operations.ts`, `readOperations` path) and the refresh check in the same file, and `MAX_AGE_MS` in `scripts/security/report.ts`, keep 36 h. The deploy webhook imports `operations.ts` and recomputes `offsite` on every `/security-report` request, so the new window takes effect only after the webhook restart `ci.md` › Scheduled security operations requires.
  - **New exposure, stated.** Today sshd on the host is reachable only from the LAN. Afterwards anyone holding the service token reaches the sshd authentication surface from the internet, and still needs an SSH key the host accepts. The token and the MacBook's SSH keys live on the same laptop, so without a limit a compromised MacBook would give a host login from anywhere instead of only from the LAN. The owner chose on 2026-11-14 to bound it (next bullet).
  - **Least privilege for the tunnel and the job.**
    - A key restriction alone does not bound it, because the MacBook's general key would still log in through the tunnel. The bound is by source: `cloudflared` reaches `localhost:22`, so every tunnel session arrives from loopback, and a drop-in `/etc/ssh/sshd_config.d/200-backup-tunnel.conf` (the host's `sshd_config` includes that directory) applies `Match Address 127.0.0.1,::1` with `ForceCommand` set to the backup server script, `DisableForwarding yes` (TCP, agent, X11 and Unix-socket forwarding; `AllowStreamLocalForwarding` defaults to yes) and `PermitTTY no`. Any key arriving through the tunnel then gets only the backup verbs. LAN logins are unchanged. Loopback identifies the route, not `cloudflared`: any other loopback client on the host gets the same restriction and still needs an SSH key. The included `Match` does not leak into the main file, and an administrative `ForceCommand` wins over a key's `command=` (both checked in the OpenSSH sources, 2026-11-14); `cloudflared` may dial either `127.0.0.1` or `::1`, so both are matched.
    - The job itself uses a dedicated key with `restrict,command="<repo>/scripts/backup/backup-serve.sh"` in `authorized_keys`, so it has the same four verbs on the LAN too.
    - `scripts/backup/backup-serve.sh` (new, host side) reads `SSH_ORIGINAL_COMMAND` and validates the whole string and accepts exactly: `probe` (prints `ok` and the client address from `SSH_CONNECTION`, so a live session shows which source it came from); `latest` (prints `backups/LATEST`); `get <name>` (name must match `^[0-9]{8}T[0-9]{6}Z-[a-f0-9]{8}[.]cms$` and exist in `backups/`; streams the file); `receipt` (reads up to 4097 bytes of stdin and rejects 4097, checks the receipt schema, requires `backup` to name an existing archive and `backedUpAt` to equal that archive's manifest `completedAt`, then writes `offsite.json` through a private `mktemp` file beside it and `mv`). It resolves the security directory from its own path, uses no `eval` or `source`, and rejects an unset or empty command, extra arguments, whitespace other than the single separator, and everything else with exit 2. Binding the receipt to the host's own manifest closes a pre-existing gap: today any schema-valid receipt with fresh timestamps reads as fresh, even for an archive name that does not exist.
    - **Switch-over.** `pull-backup.py` speaks the verbs only when given `--identity` (the dedicated key); without it, it sends today's shell commands. The merged code therefore runs exactly as now until the LaunchAgent edit adds `--identity` and the alias, which happens only after the host has the forced command and the key.
  - Rejected: always using the tunnel (it would make every pull depend on Cloudflare while on the LAN); passing the token as flags (it would show in `ps`); a token in `.private/` (that directory syncs between machines, while the key never leaves this MacBook).
- **Files and interfaces**:
  - `scripts/backup/pull-backup.py`: repeated `--host`, the probe, the one-line failure, and `--identity` for the dedicated key (`-o IdentitiesOnly=yes`), which also switches it to the verbs.
  - `scripts/backup/access-ssh-proxy.sh` (new): `ProxyCommand` wrapper; refuses a token file that is not mode 0600.
  - `scripts/backup/backup-serve.sh` (new): the forced command; its cases go in `scripts/backup/test-backup-verify.py`, run against a temporary copy of the directory layout (each verb; a bad name, `../` in a name, a valid-looking name that does not exist; a 4097-byte, malformed, unknown-archive or mismatched-`backedUpAt` receipt; an unknown verb; extra arguments; a newline or `;` in the command; an empty or unset command).
  - `scripts/backup/test-backup-verify.py`: host selection cases (first answers; first fails and second answers; none answers), and a real hanging probe whose child process spawns a grandchild, checked gone after the timeout.
  - `scripts/security/operations.ts` and `scripts/tests/operations.test.ts`: the 168 h limit. The existing case that expects 37 h to be stale changes to 169 h, and a 167 h case expects fresh.
  - `.claude/rules/ci.md` › Scheduled security operations and `docs/intents/infra/security-operations.md`: the receipt window sentence.
  - `CHANGELOG.md`: one entry.
  - Outside the repo: a webhook restart, the sshd drop-in and the dedicated key's `authorized_keys` line on the host, the host tunnel config, the Access application and token, the MacBook token file, `~/.ssh/config`, and the LaunchAgent `ProgramArguments` (replaced as a whole array with `plutil -replace … -json`, then read back). The hostname, the alias and the steps go in `.private/operations.md`.
- **Out of scope**:
  - A MacBook that is asleep or off: no path fixes it, and the 168 h window is the answer for that case.
  - sshd hardening beyond the loopback `Match` block, and rotating the host's existing keys.
  - The 36 h windows for the operations, image and refresh reports.
  - Moving the private key or decrypting anywhere but this MacBook.
- **Done when**:
  1. `npm run check:scripts` passes, including the 167 h / 169 h receipt cases, the three host-selection cases and the process-group timeout case.
  2. On the host, `cloudflared tunnel ingress validate` prints `OK`, and `cloudflared tunnel ingress rule ssh://<hostname>` matches the `ssh://localhost:22` rule.
  3. On the host: `sudo sshd -t` passes; `sudo sshd -T -C addr=127.0.0.1,user=<user>,host=localhost` and the same with `addr=::1` print `forcecommand <repo>/scripts/backup/backup-serve.sh`, `disableforwarding yes` and `permittty no`; with a LAN address they print `forcecommand none`. A new LAN login (not the session kept open) still gets a shell.
  4. Through the tunnel, by real sessions, not configuration output: `probe` prints a loopback address; with the general key, `ssh -o BatchMode=yes -o IdentitiesOnly=yes -i <general key> <alias> id` gets the script's refusal, not a uid; a `-N -L 9999:localhost:8000` session's listener refuses an actual `curl http://localhost:9999/api/health/`; a `-N -L <local socket>:<host socket>` attempt is refused too.
  5. Access rejects the SSH transport itself: `ssh -o BatchMode=yes -o ProxyCommand='<cloudflared> access ssh --hostname %h' <hostname> true` under `timeout 40` fails with no token, with a made-up token, and with a valid token that the policy does not include; with the real token through the wrapper, `ssh -o BatchMode=yes <alias> true` exits 0.
  6. With the token file at mode 0644, `ssh -o BatchMode=yes <alias> true` exits non-zero and the wrapper prints why.
  7. After the webhook restart, `/security-report` still answers and a receipt older than 36 h but newer than 168 h reads as fresh in the next host job.
  8. Under launchd, on the LAN: after the plist edit, `launchctl kickstart -k` logs `host <alias>: ok` beside the `.local` line.
  9. End to end on the LAN, forcing the fallback: `pull-backup.py --identity <dedicated key> --host nonexistent.invalid --host <alias> …` logs `Encrypted backup copied, decrypted, and verified on independent storage`, the host's receipt names the newest archive, and a host job rerun reports `offsite: true`.
  10. Off the home LAN (where `<host>.local` does not resolve), the LaunchAgent's next run succeeds through the alias. This needs the MacBook away, so it is confirmed afterwards and tracked as a journal Backlog row, as is the token's one-year expiry.

## Plan

Code first, so the owner's host and dashboard steps land on a merged, tested client.

1. **Receipt window.** In `scripts/security/operations.ts`, add `OFFSITE_MAX_AGE_MS = 168 * 3600000` and use it in `offsiteFresh()` for both keys. The two other `36 * 3600000` checks in that file (lines 29 and 151 on 2026-11-14) and `report.ts`'s `MAX_AGE_MS` stay. In `scripts/tests/operations.test.ts`, change the 37 h stale case to 169 h and add a 167 h fresh case. 168 h = 7 × 24.
2. **Server script.** Write `scripts/backup/backup-serve.sh` as specified, `shellcheck` clean, with its cases in `test-backup-verify.py` (Files and interfaces).
3. **Host selection.** In `scripts/backup/pull-backup.py`, make `--host` `action="append"`, validate each value with the existing regex, and add `select_host(hosts, run)`: for every host run `ssh -4 -o BatchMode=yes -o ConnectTimeout=10 <host> probe` (`true` without `--identity`) through `Popen(start_new_session=True)` with a 30 s wait, and on timeout `os.killpg` the group before reaping it; log `host <name>: ok` or `host <name>: <reason>`, and return the first that succeeded; raise a one-line error naming each failure when none did. Catch that error in `main` and exit 1 without a traceback. `run` is injected so the tests need no network. Add `--identity <key>` with `-o IdentitiesOnly=yes`; only then send `probe`, `latest`, `get <name>` and `receipt` instead of `true` and the three shell commands. Without `--identity` nothing changes.
4. **Tests.** In `scripts/backup/test-backup-verify.py`, load `pull-backup.py` by path like `backup-verify.py`, and cover: first host ok; first fails, second ok (both probed, second chosen); none ok (exit 1, one line); a real probe command that starts a background grandchild and sleeps past a 1 s limit counts as a failure, and the grandchild's pid is gone afterwards.
5. **Wrapper.** `scripts/backup/access-ssh-proxy.sh <token-file> <hostname>`: `set -euo pipefail`; refuse unless the file is a regular file with mode `600` owned by the caller (`stat -f %Lp`/`%u` on macOS); read two lines without `source`; export `TUNNEL_SERVICE_TOKEN_ID` / `TUNNEL_SERVICE_TOKEN_SECRET`; `exec /opt/homebrew/bin/cloudflared access ssh --hostname "$2"`. `shellcheck` clean.
6. **Docs.** `.claude/rules/ci.md` and `docs/intents/infra/security-operations.md`: receipt window 168 h, reports still 36 h. `CHANGELOG.md` entry. `npm run check:scripts`, `npm run spell`, prettier.
7. **Review and ship the code.** `intent-reviewer` and `/code-review`, each in a fresh context, then PR and merge, with `status` and `Outcome` updated in the PR or the next commit (README steps 5–6). The merged code changes nothing until the LaunchAgent passes `--identity` and a second `--host`, except the receipt window, which the host job uses at 02:00 and the webhook only after its restart.
8. **Owner, webhook restart** (`.private/operations.md`), then Done when 7.
9. **Owner, dashboard first.** Access self-hosted application for the hostname, Service Auth policy, token `emelmujiro-backup-pull` for one year. Whether a Zero Trust organization already exists, and the plan's seat terms, are unverified: check them on the dashboard first.
10. **Owner, host (sudo), only after 9.** Install the sshd drop-in and the dedicated key's `authorized_keys` line, `sudo sshd -t`, then Done when 3, and keep a LAN SSH session open while reloading sshd so a mistake cannot lock the owner out. Then add the ingress rule to both config copies, `cloudflared tunnel ingress validate`, `cloudflared tunnel ingress rule ssh://<hostname>`, restart the daemon, `cloudflared tunnel route dns`. Steps with real names go in `.private/operations.md`.
11. **MacBook.** `brew install cloudflared`, write the token file (0600), add the `~/.ssh/config` alias with `ProxyCommand` and `HostKeyAlias`, then replace the LaunchAgent `ProgramArguments` as a whole array (`plutil -replace ProgramArguments -json '[…]'`, read back with `plutil -extract`), `launchctl bootout` / `bootstrap`.
12. **Verify.** Done when 2, 4, 5, 6, 8 and 9 in order, then journal Backlog rows for 10 and for the token's expiry date.

Risks and how each would show:

- A `known_hosts` miss on the alias: `Host key verification failed` in Done when 5. Fix the `HostKeyAlias`.
- `cloudflared` waiting for a browser (token wrong or policy not Service Auth): the probe's 30 s limit fires, the process group is killed, and the log names the alias.
- The webhook not restarted: `/security-report` keeps judging receipts by 36 h; Done when 7 catches it.
- The ingress rule placed after the catch-all: check 2's `ingress rule` matches `http_status:404`.
- The loopback `Match` not applying (a `Match` inside an included file, or an IPv6 loopback source): Done when 3 shows it before the tunnel opens, and 4 confirms it through the tunnel.
- Any other loopback SSH use on the host stops working: none is known (2026-11-14); Done when 3's output makes a regression visible.
- The LaunchAgent edit inserting instead of replacing (seen on these Macs on 2026-10-29): the `plutil -extract` read-back shows an extra argument.
- A broken fallback while on the LAN: recorded in `backup-pull.log` every hour but not alerted; it surfaces only when read, or after 168 h away.

## Outcome

<!-- Filled when status becomes shipped or dropped. -->
