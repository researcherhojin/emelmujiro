#!/bin/bash
set -e

# Unified port management script
# Usage:
#   ./scripts/ports.sh          # Check port status (interactive)
#   ./scripts/ports.sh --kill   # Kill dev ports non-interactively

PORTS_DEV=(5173 8000)
PORTS_INFRA=(5432 6379)
LABELS=([5173]="Frontend" [8000]="Backend" [5432]="PostgreSQL" [6379]="Redis")

kill_port() {
    local port=$1
    local pids
    pids=$(lsof -ti:"$port" 2>/dev/null) || true
    if [ -n "$pids" ]; then
        echo "$pids" | xargs kill -15 2>/dev/null || true
        sleep 2
        # Force kill any remaining processes
        for pid in $pids; do
            if kill -0 "$pid" 2>/dev/null; then
                kill -9 "$pid" 2>/dev/null || true
            fi
        done
    fi
    echo "  ✅ Port $port (${LABELS[$port]}) cleared"
}

check_port() {
    local port=$1
    local label="${LABELS[$port]}"
    if lsof -Pi :"$port" -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "  ❌ Port $port ($label) is in use"
        return 1
    else
        echo "  ✅ Port $port ($label) is available"
        return 0
    fi
}

if [[ "$1" == "--kill" ]]; then
    echo "🧹 Killing dev ports..."
    for port in "${PORTS_DEV[@]}"; do
        if lsof -Pi :"$port" -sTCP:LISTEN -t >/dev/null 2>&1; then
            kill_port "$port"
        fi
    done
    echo "✨ Port cleanup complete"
else
    echo "🔍 Checking port status..."
    for port in "${PORTS_DEV[@]}" "${PORTS_INFRA[@]}"; do
        check_port "$port" || true
    done
    echo "✨ Port check complete"
fi
