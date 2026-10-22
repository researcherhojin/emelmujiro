# syntax=docker/dockerfile:1
# cspell:ignore nextjs nodejs geolite npmrc libc yarnpkg
# Keep upstream application code and migrations fixed; rebuild security patches.
FROM ghcr.io/umami-software/umami:3.4.0@sha256:85909afc45bdcda1917394594a087421fdbb05610fded0fa9f6fb861abb2f367 AS geolite
FROM node:25-alpine@sha256:bdf2cca6fe3dabd014ea60163eca3f0f7015fbd5c7ee1b0e9ccb4ced6eb02ef4 AS base
RUN apk upgrade --no-cache && apk add --no-cache curl libc6-compat

FROM base AS tooling
RUN npm install --global pnpm@12.3.4

FROM tooling AS source
WORKDIR /app
ADD --checksum=sha256:9d4d765e4d5b303af1cc0491da7e1592eb5ad8ced6c35780dce2bb2c274182f2 https://api.github.com/repos/umami-software/umami/tarball/ec0ff50388c264ed8ce46f00967e92f7e71476ae /tmp/umami.tar.gz
RUN tar -xzf /tmp/umami.tar.gz --strip-components=1 -C /app && rm /tmp/umami.tar.gz
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

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
    org.opencontainers.image.version="3.4.0-security-1"
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
