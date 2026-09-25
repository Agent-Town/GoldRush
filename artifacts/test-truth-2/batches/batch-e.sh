#!/bin/bash
# test-truth-2 batch E, ONE locked command (scripts/attended/dlock.sh): the attribution batch D could
# not give. Batch D's control ran the relight test 5 of 5 green, and all 5 branch runs died at BOOT
# ("The trail washed out": the dev server's runtime dependency optimisation broke the Game.ts chunk),
# before the test body ran. Here each server is warmed with one real boot first (warm.mjs), and the
# arms interleave, control, branch, control, branch, five runs each, desktop, one worker.
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
arm() {
  local label=$1 dir=$2 port=$3 round=$4 vp
  ( cd "$dir" && exec npx vite --host 127.0.0.1 --port "$port" --strictPort ) > "$S/vite-$port-e$round.log" 2>&1 &
  vp=$!
  if wait_ready "$port"; then
    cd "$dir" || exit 9
    export GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:$port
    step "$label round $round: warm-up boot"
    node "$W/artifacts/test-truth-2/batches/warm.mjs" "http://127.0.0.1:$port"; echo "warm rc=$?"
    step "$label round $round: relight x5, desktop"
    $PW e2e/e1-night-shift.spec.ts -g "$T" --repeat-each=5 --project=desktop-chrome; echo "rc=$?"
  fi
  stop_server "$vp" "$port"
}

echo "BATCH E start $(stamp)"
echo "branch $(git -C "$W" rev-parse HEAD) control $(git -C "$C" rev-parse HEAD)"
arm CONTROL "$C" 5325 1
arm BRANCH "$W" 5323 1
arm CONTROL "$C" 5325 2
arm BRANCH "$W" 5323 2
echo
echo "BATCH E END $(stamp)"
