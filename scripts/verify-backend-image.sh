#!/bin/sh
# cspell:ignore fetchone
# Disposable SQLite volume and loopback port only; never reads deployment secrets.
set -eu
image=$1
commit=$2
previous_image=${3:-$image}
previous_commit=${4:-$commit}
name="backend-image-check-$$"
volume="$name-data"
cleanup() {
  docker rm -f "$name" >/dev/null 2>&1 || true
  docker volume rm "$volume" >/dev/null 2>&1 || true
}
trap cleanup EXIT
trap 'exit 130' HUP INT TERM
# The runtime runs the venv directly; uv's bundled crates kept the image scan red (#705).
if docker run --rm --entrypoint sh "$image" -c 'command -v uv || command -v uvx'; then
  echo "uv must not ship in the runtime image" >&2
  exit 1
fi
docker volume create "$volume" >/dev/null
start_and_verify() {
  target=$1
  expected=$2
  docker run -d --name "$name" -v "$volume:/app/data" \
    -e SECRET_KEY=isolated-image-check-not-production -e DATABASE_URL= \
    -e SQLITE_DIR=/app/data -e SECURE_SSL_REDIRECT=False -e ALLOWED_HOSTS=localhost,127.0.0.1 \
    -p 127.0.0.1::8000 "$target" >/dev/null
  port=$(docker port "$name" 8000/tcp)
  case "$port" in 127.0.0.1:*) ;; *) return 1 ;; esac
  for attempt in $(seq 1 90); do
    if body=$(curl -fsS --max-time 2 "http://$port/api/health/"); then
      printf '%s' "$body" | python3 -c 'import json,sys; r=json.load(sys.stdin); assert r["status"] == "healthy" and r["commit"] == sys.argv[1]' "$expected"
      docker exec "$name" /app/.venv/bin/python manage.py migrate --check
      return 0
    fi
    sleep 2
  done
  return 1
}
start_and_verify "$image" "$commit"
docker exec "$name" python -c "import sqlite3; c=sqlite3.connect('/app/data/db.sqlite3'); c.execute('CREATE TABLE refresh_probe (value INTEGER)'); c.execute('INSERT INTO refresh_probe VALUES (42)'); c.commit()"
# Rehearse rollback and reapplication without touching production data or ports.
docker rm -f "$name" >/dev/null
start_and_verify "$previous_image" "$previous_commit"
docker exec "$name" python -c "import sqlite3; c=sqlite3.connect('/app/data/db.sqlite3'); assert c.execute('SELECT value FROM refresh_probe').fetchone()[0] == 42"
docker rm -f "$name" >/dev/null
start_and_verify "$image" "$commit"
docker exec "$name" python -c "import sqlite3; c=sqlite3.connect('/app/data/db.sqlite3'); assert c.execute('SELECT value FROM refresh_probe').fetchone()[0] == 42"
echo 'PASS: backend migration, health commit, rollback, reapplication and persisted SQLite row'
