#!/bin/sh
# cspell:ignore tmpfs nextjs pgready pageviews psql
# Disposable database and network only; never reads the deployment environment.
set -eu
cd "$(dirname "$0")"
image=${UMAMI_TEST_IMAGE:-emelmujiro/umami:3.4.0-security-1}
database_image=${UMAMI_TEST_DB_IMAGE:-postgres:15.19-alpine}
name="umami-security-test-$$"
app="$name-app"
db="$name-db"
cleanup() {
    status=$?
    if [ "$status" -ne 0 ]; then docker logs "$app" 2>/dev/null || true; fi
    docker rm -f "$app" "$db" >/dev/null 2>&1 || true
    docker network rm "$name" >/dev/null 2>&1 || true
    exit "$status"
}
trap cleanup EXIT
trap 'exit 130' INT TERM
docker network create "$name" >/dev/null
docker run -d --name "$db" --network "$name" --network-alias database \
    --tmpfs /var/lib/postgresql/data \
    -e POSTGRES_DB=umami -e POSTGRES_USER=umami -e POSTGRES_PASSWORD=isolated-test \
    "$database_image" >/dev/null
pgready=false
for attempt in $(seq 1 60); do
    if docker exec "$db" pg_isready -U umami -d umami >/dev/null 2>&1; then pgready=true; break; fi
    sleep 1
done
[ "$pgready" = true ]
docker run -d --name "$app" --network "$name" -p 127.0.0.1::3000 \
    -e DATABASE_URL=postgresql://umami:isolated-test@database:5432/umami \
    -e APP_SECRET=isolated-security-verification-only \
    -e DISABLE_BOT_CHECK=1 -e DISABLE_TELEMETRY=1 -e DISABLE_UPDATES=1 \
    "$image" >/dev/null
[ "$(docker exec "$app" id -u)" = 1001 ]
port=$(docker port "$app" 3000/tcp)
case "$port" in 127.0.0.1:*) ;; *) echo "Expected loopback port, got $port"; exit 1;; esac
wait_for_app() {
    for attempt in $(seq 1 90); do
        if curl -fsS --connect-timeout 1 --max-time 3 "http://$port/api/heartbeat" >/dev/null 2>&1; then return; fi
        sleep 2
    done
    return 1
}
wait_for_app
docker exec -i "$app" node --input-type=module < verify.mjs
# A second start must accept the already-migrated schema and retain the event.
docker restart "$app" >/dev/null
port=$(docker port "$app" 3000/tcp)
wait_for_app
[ "$(docker exec "$db" psql -U umami -d umami -Atc 'SELECT count(*) FROM website_event')" = 1 ]
docker exec "$db" psql -U umami -d umami -Atc \
    'SELECT count(*) AS completed_migrations FROM _prisma_migrations WHERE finished_at IS NOT NULL'
echo 'PASS: non-root startup, migration, login, tracker, event persistence and restart'
