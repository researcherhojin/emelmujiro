FROM nginx:1.31.8-alpine-slim

# Upstream rebuilds this tag only when it chooses to, so take Alpine package
# fixes here (#739). nginx.conf and the site stay bind mounts in Compose.
RUN apk upgrade --no-cache
