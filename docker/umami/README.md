# Umami security build

This rebuild keeps Umami 3.4.0 application code and migrations at upstream commit
`ec0ff50388c264ed8ce46f00967e92f7e71476ae`. The Dockerfile verifies the source
archive checksum and pins the Node base and official geography-data image by
digest. Only `geo/` is copied from the official Umami image. Its application and
dependencies are rebuilt from source.

The builder uses Next 16.3.8, sharp 0.35.5 and shell-quote 1.11.0.
Build dependency fixes also cover MCP server 2.3.0, brace-expansion 1.1.21
and 2.1.7, fast-uri 3.1.8 and source-map-js 1.2.2. Both dependency
graphs retain upstream's deepmerge-ts 8.0.2 and mysql2 3.23.1 security overrides.
The upstream Dockerfile's separate runtime install omitted those overrides; this
recipe gives that install its own frozen lockfile. Runtime contains no global
npm, pnpm or Yarn installation. Upstream startup uses Node and the local Prisma
CLI, so migrations still execute before the server starts as UID 1001.

## Build and verify

From the repository root:

```sh
docker build -t emelmujiro/umami:3.4.0-security-1 docker/umami
sh docker/umami/verify.sh
```

Verification creates its own Docker network and PostgreSQL container with a
memory-backed database. The app binds an automatically assigned loopback port.
It checks migrations, non-root startup, login, tracker delivery, event ingestion,
analytics and data retention after restarting the app. Cleanup removes only the
containers and network created by that invocation. It does not load `.env` or
mount production volumes. `UMAMI_TEST_IMAGE` and `UMAMI_TEST_DB_IMAGE` can select
other locally built candidates.

Scan the final image with Trivy and retain its JSON report. A successful build
alone does not establish that all reported vulnerabilities have been removed.
Alpine package upgrades resolve against the current stable repositories; record
the final image digest alongside the scan for the deployed artifact.

## Updating the recipe

1. Download the new upstream commit archive, verify its origin, record its SHA256
   checksum, and update the Dockerfile's source URL and checksum together. Review
   upstream's Dockerfile, startup scripts, manifest and workspace settings.
2. Refresh `package.json` and `pnpm-workspace.yaml` from that source, retaining
   only required security patches. Keep the upstream application version intact
   and review migrations before changing the upstream commit.
3. In the full source checkout, overlay those two files and run
   `npx --yes pnpm@12.3.4 install --lockfile-only --ignore-scripts`. Copy the
   resulting `pnpm-lock.yaml` into this directory. The full checkout is required
   because it contains upstream's API-client and MCP workspaces.
4. Update the runtime manifest and overrides in `runner/`, then run the same
   lockfile command from that directory. Keep Prisma versions synchronized with
   the builder and Dockerfile's engine assertion. Neither build stage resolves
   new dependency versions during a normal build.
5. Refresh the Node base digest and the official image used for `geo/`. The
   geography database stays at that image's snapshot until this pin is updated;
   do not replace it with an unchecked download from a moving branch.
6. Rebuild, run the disposable verification and scan again. Deploy the exact
   tested image and record its digest. Remove this custom recipe once an official
   release provides the fixes and passes the same checks.
