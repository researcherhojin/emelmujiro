# Umami security build

<!-- cspell:ignore redocly -->

This rebuild keeps Umami 3.4.0 application code and migrations at upstream commit
`ec0ff50388c264ed8ce46f00967e92f7e71476ae`. The Dockerfile verifies the source
archive checksum and pins the Node base and official geography-data image by
digest. Only `geo/` is copied from the official Umami image. Its application and
dependencies are rebuilt from source. Dependabot bumps that image's tag on its
own, so it can run ahead of the application (3.5.0 for `geo/` since #796); the
application version moves only through the steps under Updating the recipe.

The builder uses Next 16.4.6, sharp 0.35.5 and shell-quote 1.11.0.
Build dependency fixes also cover MCP server and client 2.3.0, brace-expansion
1.1.21, 2.1.7 and 5.0.12, fast-uri 3.1.9, source-map-js 1.2.2,
postcss-selector-parser 7.1.6, undici 8.12.2, serialize-javascript 7.1.3,
zod 4.6.7, vite 8.1.6, vitest 4.1.12, minimatch 11.0.3 and glob 14.0.3
(GHSA-g3hv-75wg-m249, GHSA-3g3m-2fjr-6pw4). `@redocly/openapi-core` 1.34.19 is
patched to import minimatch 11's named export. Both dependency
graphs retain upstream's deepmerge-ts 8.0.2 and mysql2 3.23.1 security overrides.
The builder lock backports deepmerge PR #274's `__proto__` rejection for
deepmerge 4.3.1 because npm has no patched release; a build-time regression
check covers the vulnerable null-target and null-prototype cases. The runtime
lock contains no deepmerge package.
picomatch 4.0.4 and 4.0.5 in the builder lock fall in GHSA-fc5q-39xc-vjpf,
which has no fixed release. `trivyignore.yaml` accepts them until 2026-12-02
(#806). The runtime lock has no picomatch, and the copy that Next compiles in
has no version for an image scan to match.
The upstream Dockerfile's separate runtime install omitted those overrides; this
recipe gives that install its own frozen lockfile. Runtime contains no global
npm, pnpm or Yarn installation, and no curl: the Compose healthcheck uses BusyBox
`wget`, and a grep of the running container's `/app/scripts` found no curl. Upstream startup uses Node and the local Prisma
CLI, so migrations still execute before the server starts as UID 1001.

## Build and verify

From the repository root:

```sh
docker build -t emelmujiro/umami:3.4.0-security-6 docker/umami
sh docker/umami/verify.sh
```

Verification creates its own Docker network and PostgreSQL container with a
memory-backed database. The app binds an automatically assigned loopback port.
It checks migrations, non-root startup, login, tracker delivery, event ingestion,
analytics and data retention after restarting the app. Cleanup removes only the
containers and network created by that invocation. It does not load `.env` or
mount production volumes. `UMAMI_TEST_IMAGE` and `UMAMI_TEST_DB_IMAGE` can select
other locally built candidates.

PR CI's `Docker Images` job runs the same build and `verify.sh`, with
`UMAMI_TEST_IMAGE=emelmujiro/umami:ci-check`, for every PR that changes a
non-Markdown file under `docker/umami/`, so an edit to this README alone
builds nothing. It pushes nothing and uses no layer cache. The deploy applies
the same rule: `auto-deploy.sh` rebuilds the analytics images only for a
non-Markdown change under `docker/umami`, `docker/postgres` or
`docker-compose.yml`.

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
