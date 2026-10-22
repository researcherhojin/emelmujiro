# cspell:ignore gosu setgroups setgid setuid
FROM postgres:15.19-alpine3.24

# Keep the official root entrypoint and its directory ownership setup. Its only
# gosu invocation switches to the named postgres user before starting the server.
# Alpine's packaged su-exec performs that same setgroups/setgid/setuid/exec flow.
RUN set -eux; \
    apk add --no-cache su-exec=0.3-r0; \
    test "$(grep -c 'exec gosu postgres' /usr/local/bin/docker-entrypoint.sh)" = 1; \
    sed -i 's/exec gosu postgres/exec \/sbin\/su-exec postgres/' /usr/local/bin/docker-entrypoint.sh; \
    if grep -q gosu /usr/local/bin/docker-entrypoint.sh; then exit 1; fi; \
    rm /usr/local/bin/gosu /usr/local/bin/su-exec; \
    ln -s /sbin/su-exec /usr/local/bin/su-exec; \
    test "$(su-exec postgres id -u)" = 70; \
    test "$(su-exec postgres id -g)" = 70; \
    su-exec nobody true

# ci-check: exercises the Docker Images job; reverted before merge
