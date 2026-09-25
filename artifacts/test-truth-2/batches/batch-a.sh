#!/bin/bash
# test-truth-2 batch A, ONE locked command (scripts/attended/dlock.sh): the controls on clean main
# (detached worktree wt-tt2-control, vite dev on 5325), then the branch (wt-tt2, vite dev on 5323):
# the probes, the cured Night Shift and Twin Banks tests, and the ten secured pairs of 2026-09-25.
# Every server is started, waited for and stopped (by PID, with its descendants) inside this script.
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

echo "BATCH A start $(stamp)"
echo "branch $(git -C "$W" rev-parse HEAD) (dirty: $(git -C "$W" status --porcelain --untracked-files=no | wc -l | tr -d ' ') tracked files)"
echo "control $(git -C "$C" rev-parse HEAD)"

# ---------------------------------------------------------------- control, clean main, 5325
( cd "$C" && exec npx vite --host 127.0.0.1 --port 5325 --strictPort ) > "$S/vite-5325-a.log" 2>&1 &
CVP=$!
echo "control vite pid $CVP"
if wait_ready 5325; then
  cd "$C" || exit 9
  export GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5325
  step "CONTROL night-shift: ramps + lantern post, both projects"
  $PW e2e/e1-night-shift.spec.ts -g "loads Night Shift contract data and ramps|lantern post is Night Shift gated" $BOTH; echo "rc=$?"
  step "CONTROL twin-banks: seeded diagnostics x5, both projects"
  $PW e2e/e1-twin-banks.spec.ts -g "seeded Twin Banks diagnostics are stable" --repeat-each=5 $BOTH; echo "rc=$?"
  step "CONTROL beauty-twin-banks: reed field, both projects"
  $PW e2e/beauty-twin-banks.spec.ts -g "the reed field is alive in a still frame" $BOTH; echo "rc=$?"
  step "CONTROL secure: e10-river desktop"
  GR_PLAYABILITY_SECURE=1 GR_SECURE_CONTRACTS=e10-river $PW e2e/playability-secure.spec.ts --project=desktop-chrome --trace=off; echo "rc=$?"
fi
stop_server "$CVP" 5325

# ---------------------------------------------------------------- branch, 5323
( cd "$W" && exec npx vite --host 127.0.0.1 --port 5323 --strictPort ) > "$S/vite-5323-a.log" 2>&1 &
BVP=$!
echo "branch vite pid $BVP"
if wait_ready 5323; then
  cd "$W" || exit 9
  export GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5323
  step "PROBES night-shift + reed-field, both projects"
  $PW -c artifacts/test-truth-2/probes/probe.config.ts night-shift.probe.ts reed-field.probe.ts $BOTH; echo "rc=$?"
  step "PROBE twin-banks readiness x2, both projects"
  $PW -c artifacts/test-truth-2/probes/probe.config.ts twin-banks-ready.probe.ts --repeat-each=2 $BOTH; echo "rc=$?"
  step "BRANCH night-shift: ramps + lantern post, both projects"
  $PW e2e/e1-night-shift.spec.ts -g "loads Night Shift contract data and ramps|lantern post is Night Shift gated" $BOTH; echo "rc=$?"
  step "BRANCH twin-banks: seeded diagnostics x5, both projects"
  $PW e2e/e1-twin-banks.spec.ts -g "seeded Twin Banks diagnostics are stable" --repeat-each=5 $BOTH; echo "rc=$?"
  step "BRANCH secure: the four maps secured on both projects, both projects"
  GR_PLAYABILITY_SECURE=1 GR_SECURE_CONTRACTS=e2-pressure-garden,e3-blackout-ridge,e10-last-claim,e10-river $PW e2e/playability-secure.spec.ts $BOTH --trace=off; echo "rc=$?"
  step "BRANCH secure: e9-devils-alley desktop"
  GR_PLAYABILITY_SECURE=1 GR_SECURE_CONTRACTS=e9-devils-alley $PW e2e/playability-secure.spec.ts --project=desktop-chrome --trace=off; echo "rc=$?"
  step "BRANCH secure: e9-seed-run mobile"
  GR_PLAYABILITY_SECURE=1 GR_SECURE_CONTRACTS=e9-seed-run $PW e2e/playability-secure.spec.ts --project=mobile-chrome --trace=off; echo "rc=$?"
fi
stop_server "$BVP" 5323
echo
echo "BATCH A END $(stamp)"
