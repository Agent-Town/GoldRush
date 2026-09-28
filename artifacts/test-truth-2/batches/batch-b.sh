#!/bin/bash
# test-truth-2 batch B, ONE locked command (scripts/attended/dlock.sh). Control (clean main, 5325): the
# three touched spec files whole, both projects, for attribution. Branch (5323): the final Night Shift
# and reed tests three times on both projects, the three spec files whole, the Last Claim board probe,
# and the one re-run each of the two pairs that died within 2 s of their secure in batch A.
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
BOTH="--project=desktop-chrome --project=mobile-chrome"
SPECS="e2e/e1-night-shift.spec.ts e2e/e1-twin-banks.spec.ts e2e/beauty-twin-banks.spec.ts"

echo "BATCH B start $(stamp)"
echo "branch $(git -C "$W" rev-parse HEAD) (dirty tracked e2e: $(git -C "$W" status --porcelain --untracked-files=no -- e2e | wc -l | tr -d ' '))"
echo "control $(git -C "$C" rev-parse HEAD)"

( cd "$C" && exec npx vite --host 127.0.0.1 --port 5325 --strictPort ) > "$S/vite-5325-b.log" 2>&1 &
CVP=$!
echo "control vite pid $CVP"
if wait_ready 5325; then
  cd "$C" || exit 9
  export GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5325
  step "CONTROL the three touched spec files whole, both projects"
  $PW $SPECS $BOTH; echo "rc=$?"
fi
stop_server "$CVP" 5325

( cd "$W" && exec npx vite --host 127.0.0.1 --port 5323 --strictPort ) > "$S/vite-5323-b.log" 2>&1 &
BVP=$!
echo "branch vite pid $BVP"
if wait_ready 5323; then
  cd "$W" || exit 9
  export GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5323
  step "BRANCH night-shift: ramps + lantern post x3, both projects"
  $PW e2e/e1-night-shift.spec.ts -g "loads Night Shift contract data and ramps|lantern post is Night Shift gated" --repeat-each=3 $BOTH; echo "rc=$?"
  step "BRANCH beauty-twin-banks: reed field x3, both projects"
  $PW e2e/beauty-twin-banks.spec.ts -g "the reed field is alive in a still frame" --repeat-each=3 $BOTH; echo "rc=$?"
  step "BRANCH the three touched spec files whole, both projects"
  $PW $SPECS $BOTH; echo "rc=$?"
  step "PROBE last-claim board, both projects"
  $PW -c artifacts/test-truth-2/probes/probe.config.ts last-claim-board.probe.ts $BOTH; echo "rc=$?"
  step "BRANCH secure re-run: e2-pressure-garden desktop"
  GR_PLAYABILITY_SECURE=1 GR_SECURE_CONTRACTS=e2-pressure-garden $PW e2e/playability-secure.spec.ts --project=desktop-chrome --trace=off; echo "rc=$?"
  step "BRANCH secure re-run: e9-seed-run mobile"
  GR_PLAYABILITY_SECURE=1 GR_SECURE_CONTRACTS=e9-seed-run $PW e2e/playability-secure.spec.ts --project=mobile-chrome --trace=off; echo "rc=$?"
fi
stop_server "$BVP" 5323
echo
echo "BATCH B END $(stamp)"
