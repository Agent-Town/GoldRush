#!/bin/bash
# test-truth-2 batch D, ONE locked command (scripts/attended/dlock.sh): attribution of the one adjacent
# red, "cold lantern relight costs survive run suspend and continue" (desktop; 2 of 4 branch runs red
# under load, restoredWave 2 where 1 is pinned; this task's diff does not touch it). The same test five
# times on clean main (5325) and five times on the branch (5323), same batch, desktop, one worker.
set -u
W=/Users/robin/Claude/Projects/wt-tt2
C=/Users/robin/Claude/Projects/wt-tt2-control
S=/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush-history-local/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/tt2
export PATH=/opt/homebrew/bin:$PATH
stamp() { date -u '+%Y-%m-%dT%H:%M:%SZ'; }
descendants() { local p; for p in $(pgrep -P "$1" 2>/dev/null); do descendants "$p"; echo "$p"; done; }
stop_server() {
  local vp=$1 port=$2 kid
  for kid in $(descendants "$vp"); do kill "$kid" 2>/dev/null; done
  kill "$vp" 2>/dev/null
  sleep 3
  if curl -s -o /dev/null --max-time 3 "http://127.0.0.1:$port/"; then echo "WARNING: $port still answering"; else echo "port $port released"; fi
}
wait_ready() {
  local port=$1 ct="" i
  for i in $(seq 1 90); do
    ct=$(curl -s -o /dev/null -D - "http://127.0.0.1:$port/@vite/client" 2>/dev/null | tr -d '\r' | grep -i '^content-type:' | head -1)
    case "$ct" in *javascript*) echo "vite dev up on $port $(stamp) ($ct)"; return 0;; esac
    sleep 2
  done
  echo "VITE NOT READY on $port (last: '$ct')"
  return 1
}
step() { echo; echo "== $1 $(stamp) | load $(uptime | sed 's/.*load averages*: //')"; }
PW="npx playwright test --workers=1 --reporter=line"
T="cold lantern relight costs survive run suspend and continue"

echo "BATCH D start $(stamp)"
echo "branch $(git -C "$W" rev-parse HEAD) control $(git -C "$C" rev-parse HEAD)"
( cd "$C" && exec npx vite --host 127.0.0.1 --port 5325 --strictPort ) > "$S/vite-5325-d.log" 2>&1 &
CVP=$!
if wait_ready 5325; then
  cd "$C" || exit 9
  export GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5325
  step "CONTROL relight x5, desktop"
  $PW e2e/e1-night-shift.spec.ts -g "$T" --repeat-each=5 --project=desktop-chrome; echo "rc=$?"
fi
stop_server "$CVP" 5325
( cd "$W" && exec npx vite --host 127.0.0.1 --port 5323 --strictPort ) > "$S/vite-5323-d.log" 2>&1 &
BVP=$!
if wait_ready 5323; then
  cd "$W" || exit 9
  export GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5323
  step "BRANCH relight x5, desktop"
  $PW e2e/e1-night-shift.spec.ts -g "$T" --repeat-each=5 --project=desktop-chrome; echo "rc=$?"
fi
stop_server "$BVP" 5323
echo
echo "BATCH D END $(stamp)"
