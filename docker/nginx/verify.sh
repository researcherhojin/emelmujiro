#!/bin/sh
# Check a candidate frontend image with the repo's nginx.conf, off-network.
set -eu
image=${1:-emelmujiro/nginx:security-candidate}
config=${2:-frontend/nginx.conf}
name="nginx-image-check-$(date +%s)-$$"
html=$(mktemp -d)
cleanup() {
    docker rm -f "$name" >/dev/null 2>&1 || true
    rm -rf "$html"
}
trap cleanup EXIT HUP INT TERM
printf '%s\n' '<!doctype html><title>index</title>' >"$html/index.html"
printf '%s\n' '<!doctype html><title>app</title>' >"$html/app.html"
chmod 755 "$html"
chmod 644 "$html/index.html" "$html/app.html"
# nginx resolves proxy_pass hosts at start, so both upstreams get loopback entries.
set -- --network none --add-host backend:127.0.0.1 --add-host umami:127.0.0.1 \
    -v "$(cd "$(dirname "$config")" && pwd)/$(basename "$config"):/etc/nginx/nginx.conf:ro" \
    -v "$html:/usr/share/nginx/html:ro"
docker run --rm "$@" "$image" nginx -t
docker run -d --name "$name" "$@" "$image" >/dev/null
attempts=0
# The Compose healthcheck uses the image's BusyBox wget, so it must exist and work.
until docker exec "$name" wget -q -O /dev/null http://127.0.0.1/ 2>/dev/null; do
    attempts=$((attempts + 1))
    if [ "$attempts" -ge 30 ]; then
        docker logs "$name"
        exit 1
    fi
    sleep 1
done
docker exec "$name" nginx -v
docker exec "$name" sh -c 'apk info -v 2>/dev/null | grep "^zlib-"'
printf '%s\n' 'PASS: nginx -t, served / through BusyBox wget off-network'
