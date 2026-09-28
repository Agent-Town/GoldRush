#!/bin/bash
# scripts/launch-video/batch.sh <capture-script.mjs> [args...]: ONE launch-film capture batch (task launch-video-capture-2).
#
# Run it only inside the attended drain lock, detached, the way the runbook says
# (docs/marketing/launch-video/treatment.md, "Capture runbook" §1):
#   nohup "/Users/robin/Claude/Projects/Gold Rush/scripts/attended/dlock.sh" bash scripts/launch-video/batch.sh \
#     scripts/launch-video/02-the-claim.mjs > ~/.goldrush/launch-video/logs/<batch>.out 2>&1 &
# It starts the dev server on port 5322 (5323 when 5322 is taken; it says which), runs the one capture script
# against it under a watchdog, and stops the server by the PID it started. It refuses to start on a host whose
# 1-minute load is above GR_LV_LOAD_MAX (default 60): a take at 1x needs a quiet host, and waiting is cheaper
# than a stuttering take. It never holds the lock idle: a refused start exits at once.
set -u
export PATH=/opt/homebrew/bin:$PATH
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT" || exit 2
SCRIPT="${1:?usage: batch.sh <capture-script.mjs> [args...]}"; shift
LOAD_MAX="${GR_LV_LOAD_MAX:-60}"
MAX_SECONDS="${GR_LV_MAX_SECONDS:-3600}"
LOGDIR="${GR_LV_OUT:-$HOME/.goldrush/launch-video}/logs"; mkdir -p "$LOGDIR"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"

LOAD1="$(sysctl -n vm.loadavg | awk '{print $2}')"
echo "batch ${STAMP}: script=${SCRIPT} load1=${LOAD1} max=${LOAD_MAX}"
if awk -v l="$LOAD1" -v m="$LOAD_MAX" 'BEGIN { exit !(l > m) }'; then
  echo "batch REFUSED: 1-minute load ${LOAD1} is above ${LOAD_MAX}; retry on a quieter host"
  exit 75
fi

PORT=5322
if lsof -nP -iTCP:${PORT} -sTCP:LISTEN > /dev/null 2>&1; then PORT=5323; fi
if lsof -nP -iTCP:${PORT} -sTCP:LISTEN > /dev/null 2>&1; then echo "batch REFUSED: ports 5322 and 5323 are both taken"; exit 75; fi
echo "batch port=${PORT}"

node node_modules/vite/bin/vite.js --host 127.0.0.1 --port "${PORT}" --strictPort > "${LOGDIR}/vite-${STAMP}.log" 2>&1 &
VPID=$!
echo "batch vite pid=${VPID}"
stop_vite() {
  if kill -0 "${VPID}" 2> /dev/null; then kill "${VPID}"; wait "${VPID}" 2> /dev/null; fi
  echo "batch vite pid=${VPID} stopped"
}
trap stop_vite EXIT

READY=0
for _ in $(seq 1 90); do
  if curl -s -o /dev/null --max-time 2 "http://127.0.0.1:${PORT}/"; then READY=1; break; fi
  sleep 1
done
if [ "${READY}" != 1 ]; then echo "batch FAILED: vite did not answer on ${PORT}"; exit 3; fi
# Warm the module graph once (the dependency pre-bundle lives in this checkout's .vite-cache/).
curl -s -o /dev/null --max-time 60 "http://127.0.0.1:${PORT}/src/main.ts"

GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL="http://127.0.0.1:${PORT}" node "${SCRIPT}" "$@" &
NPID=$!
echo "batch capture pid=${NPID}"
ELAPSED=0
while kill -0 "${NPID}" 2> /dev/null; do
  if [ "${ELAPSED}" -ge "${MAX_SECONDS}" ]; then
    echo "batch WATCHDOG: capture pid=${NPID} still running after ${MAX_SECONDS}s, stopping it (a hang is a finding)"
    kill "${NPID}"
    break
  fi
  sleep 5
  ELAPSED=$((ELAPSED + 5))
done
wait "${NPID}"; RC=$?
echo "batch capture rc=${RC} load1-now=$(sysctl -n vm.loadavg | awk '{print $2}')"
exit "${RC}"
