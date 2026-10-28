#!/bin/sh
# cspell:ignore tmpfs
# Disposable SQLite and loopback port only; never reads deployment secrets.
set -eu
image=$1
commit=$2
name="backend-image-check-$$"
cleanup() { docker rm -f "$name" >/dev/null 2>&1 || true; }
trap cleanup EXIT
trap 'exit 130' HUP INT TERM
docker run -d --name "$name" --tmpfs /app/data:uid=1000,gid=1000 \
  -e SECRET_KEY=isolated-image-check-not-production -e DATABASE_URL= \
  -e SQLITE_DIR=/app/data -e SECURE_SSL_REDIRECT=False -e ALLOWED_HOSTS=localhost,127.0.0.1 \
  -p 127.0.0.1::8000 "$image" >/dev/null
port=$(docker port "$name" 8000/tcp)
case "$port" in 127.0.0.1:*) ;; *) exit 1 ;; esac
for attempt in $(seq 1 90); do
  if body=$(curl -fsS --max-time 2 "http://$port/api/health/"); then
    printf '%s' "$body" | python3 -c 'import json,sys; r=json.load(sys.stdin); assert r["status"] == "healthy" and r["commit"] == sys.argv[1]' "$commit"
    docker exec "$name" uv run python manage.py migrate --check
    exit 0
  fi
  sleep 2
done
exit 1
