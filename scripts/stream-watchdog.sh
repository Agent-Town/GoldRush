#!/usr/bin/env bash
set -u

ROOT=${GOLD_RUSH_ROOT:-"$(cd "$(dirname "$0")/.." && pwd)"}
LOG=${STREAM_HEALTH_LOG:-"$ROOT/logs/stream-health.log"}
HOST=${OBS_WEBSOCKET_HOST:-127.0.0.1}
PORT=${OBS_WEBSOCKET_PORT:-4455}
mkdir -p "$(dirname "$LOG")"
note() { printf '[stream] %s %s\n' "$(date '+%F %T')" "$*" >> "$LOG"; }

if pgrep -ix OBS >/dev/null 2>&1 || pgrep -f '/OBS.app/' >/dev/null 2>&1; then
  obs=alive
else
  obs=down
fi

if nc -z -w 1 "$HOST" "$PORT" >/dev/null 2>&1; then
  websocket=reachable
  if command -v obs-cli >/dev/null 2>&1; then
    status=$(obs-cli stream status 2>&1 | tr '\n' ' ')
  else
    status='unknown (install/configure obs-cli for authenticated status)'
  fi
else
  websocket=unreachable
  status=unknown
fi

note "obs=$obs websocket=$websocket stream=$status"
printf 'OBS: %s; websocket: %s; stream: %s\n' "$obs" "$websocket" "$status"
