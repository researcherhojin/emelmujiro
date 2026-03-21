#!/bin/bash
set -e

# Periodic SiteVisit cleanup via Docker exec
# Add to crontab: 0 2 * * * /path/to/emelmujiro/scripts/cleanup-sitevisits.sh >> /var/log/sitevisit-cleanup.log 2>&1

CONTAINER="emelmujiro-backend"
DAYS="${1:-90}"

if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') ERROR: Container ${CONTAINER} is not running"
    exit 1
fi

echo "$(date '+%Y-%m-%d %H:%M:%S') Starting SiteVisit cleanup (older than ${DAYS} days)..."
docker exec "${CONTAINER}" python manage.py cleanup_sitevisits --days "${DAYS}"
echo "$(date '+%Y-%m-%d %H:%M:%S') Cleanup complete."
