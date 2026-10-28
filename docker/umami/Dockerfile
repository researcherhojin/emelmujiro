# syntax=docker/dockerfile:1
# cspell:ignore nextjs nodejs geolite npmrc libc yarnpkg deepmerge
# Keep upstream application code and migrations fixed; rebuild security patches.
FROM ghcr.io/umami-software/umami:3.4.1@sha256:e69d1a7932e9dab0fc523edc7be1f3a53f3c261f57856fc2167ae74a8fc022e8 AS geolite
FROM node:22-alpine@sha256:fe4f6d74e20370acb04ad889077d14d0f64a9c8ea6a42bc60cddf1e844699914 AS base
RUN apk upgrade --no-cache && apk add --no-cache libc6-compat

FROM base AS tooling
RUN apk add --no-cache patch && npm install --global pnpm@12.3.4

FROM tooling AS source
WORKDIR /app
ADD --checksum=sha256:9d4d765e4d5b303af1cc0491da7e1592eb5ad8ced6c35780dce2bb2c274182f2 https://api.github.com/repos/umami-software/umami/tarball/ec0ff50388c264ed8ce46f00967e92f7e71476ae /tmp/umami.tar.gz
RUN tar -xzf /tmp/umami.tar.gz --strip-components=1 -C /app && rm /tmp/umami.tar.gz
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY patches/deepmerge@4.3.1.patch ./patches/deepmerge@4.3.1.patch
RUN pnpm install --frozen-lockfile
COPY scripts/verify-deepmerge-patch.cjs ./scripts/verify-deepmerge-patch.cjs
RUN mkdir -p /tmp/deepmerge-patch-test \
    && npm pack deepmerge@4.3.1 --pack-destination /tmp/deepmerge-patch-test \
    && tar -xzf /tmp/deepmerge-patch-test/deepmerge-4.3.1.tgz --strip-components=1 -C /tmp/deepmerge-patch-test \
    && patch -p1 -d /tmp/deepmerge-patch-test < patches/deepmerge@4.3.1.patch \
    && node scripts/verify-deepmerge-patch.cjs /tmp/deepmerge-patch-test \
    && rm -rf node_modules/deepmerge \
    && ln -s /tmp/deepmerge-patch-test node_modules/deepmerge

FROM source AS builder
COPY --from=geolite /app/geo ./geo
RUN cp docker/proxy.ts src/proxy.ts
ENV DATABASE_URL=postgresql://user:pass@localhost:5432/dummy \
    NEXT_TELEMETRY_DISABLED=1 DISABLE_TELEMETRY=1 SKIP_BUILD_GEO=1
RUN pnpm build:docker

FROM tooling AS runtime-deps
WORKDIR /app
COPY runner/package.json runner/pnpm-workspace.yaml runner/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod \
    && ls node_modules/.pnpm/@prisma+engines@7.10.0/node_modules/@prisma/engines/*engine*

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3000
LABEL org.opencontainers.image.source="https://github.com/umami-software/umami" \
    org.opencontainers.image.revision="ec0ff50388c264ed8ce46f00967e92f7e71476ae" \
    org.opencontainers.image.version="3.4.0-security-4"
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs \
    && rm -rf /usr/local/lib/node_modules/npm /opt/yarn-* \
    && rm -f /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/yarn /usr/local/bin/yarnpkg
COPY --from=runtime-deps /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/generated ./generated
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=geolite /app/geo ./geo
USER nextjs
EXPOSE 3000
CMD ["sh", "scripts/start-docker.sh"]
