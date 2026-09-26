#!/bin/bash
# test-truth-2 batch C, ONE locked command (scripts/attended/dlock.sh), branch only (vite dev on 5323):
# the cured Night Shift and reed tests three more times as SEPARATE invocations so each run's numbers
# are kept (batch B's desktop Night Shift repeats died at boot under load 47 to 55: timing, re-run
# alone); the one non-named red of batch B's whole-file run ("cold lantern relight costs survive run
# suspend and continue", desktop, a 15 s wait under load 55, green on the control) re-run alone; and
# the Last Claim board probe, now pressing the finale's own "Return to the Ark".
set -u
W=/Users/robin/Claude/Projects/wt-tt2
S=/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush-history-local/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/tt2
R=$W/artifacts/test-truth-2/runs
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

echo "BATCH C start $(stamp)"
echo "branch $(git -C "$W" rev-parse HEAD) (dirty tracked e2e: $(git -C "$W" status --porcelain --untracked-files=no -- e2e | wc -l | tr -d ' '))"
( cd "$W" && exec npx vite --host 127.0.0.1 --port 5323 --strictPort ) > "$S/vite-5323-c.log" 2>&1 &
BVP=$!
echo "branch vite pid $BVP"
if wait_ready 5323; then
  cd "$W" || exit 9
  export GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5323
  for n in 1 2 3; do
    step "BRANCH night-shift: ramps + lantern post, run $n of 3, both projects"
    $PW e2e/e1-night-shift.spec.ts -g "loads Night Shift contract data and ramps|lantern post is Night Shift gated" $BOTH; echo "rc=$?"
    for p in desktop-chrome mobile-chrome; do
      cp artifacts/night-dusk/$p-hero-brightness.json "$R/c$n-$p-hero-brightness.json" 2>/dev/null
      cp artifacts/night-lanterns/$p-sprite-luminance.json "$R/c$n-$p-sprite-luminance.json" 2>/dev/null
    done
  done
  for n in 1 2 3; do
    step "BRANCH beauty-twin-banks: reed field, run $n of 3, both projects"
    $PW e2e/beauty-twin-banks.spec.ts -g "the reed field is alive in a still frame" $BOTH; echo "rc=$?"
    cp artifacts/beauty-twin-banks/latest/reed-motion.json "$R/c$n-reed-motion.json" 2>/dev/null
  done
  step "BRANCH night-shift: cold lantern relight survives suspend, desktop x3 (batch B's one load-shaped non-named red)"
  $PW e2e/e1-night-shift.spec.ts -g "cold lantern relight costs survive run suspend and continue" --repeat-each=3 --project=desktop-chrome; echo "rc=$?"
  step "PROBE last-claim board with Return to the Ark, both projects"
  $PW -c artifacts/test-truth-2/probes/probe.config.ts last-claim-board.probe.ts $BOTH; echo "rc=$?"
fi
stop_server "$BVP" 5323
echo
echo "BATCH C END $(stamp)"
