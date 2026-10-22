#!/bin/sh
# cspell:ignore psql
# Exercise only newly created resources; never mount a production volume.
set -eu
image=${1:-emelmujiro/postgres:security-candidate}
name="postgres-image-check-$(date +%s)-$$"
volume="$name-data"
cleanup() {
    docker rm -f "$name" >/dev/null 2>&1 || true
    docker volume rm "$volume" >/dev/null 2>&1 || true
}
trap cleanup EXIT HUP INT TERM
docker volume create "$volume" >/dev/null
docker run -d --name "$name" --network none \
    -e POSTGRES_PASSWORD=isolated-image-check \
    -v "$volume:/var/lib/postgresql/data" "$image" >/dev/null
wait_ready() {
    attempts=0
    until docker exec "$name" pg_isready -h 127.0.0.1 -U postgres >/dev/null 2>&1; do
        attempts=$((attempts + 1))
        if [ "$attempts" -ge 60 ]; then
            docker logs "$name"
            return 1
        fi
        sleep 1
    done
}
wait_ready
docker exec "$name" sh -c 'test "$(stat -c %u /proc/1)" = 70; test "$(stat -c %g /proc/1)" = 70'
docker exec "$name" psql -U postgres -v ON_ERROR_STOP=1 -c \
    'CREATE TABLE image_check (value integer); INSERT INTO image_check VALUES (42);'
docker restart --time 20 "$name" >/dev/null
wait_ready
value=$(docker exec "$name" psql -U postgres -Atc 'SELECT value FROM image_check')
test "$value" = 42
docker exec "$name" psql -U postgres -Atc 'SHOW server_version'
printf '%s\n' 'PASS: initialization, postgres UID/GID 70, clean restart and persisted row'
