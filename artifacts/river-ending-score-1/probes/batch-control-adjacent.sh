#!/bin/bash
# Attribution control for the adjacent reds: the same four spec files on the BASE commit (detached worktree at be37d83cf,
# vite 5450), both projects, one worker. A red here too predates this slice.
export PATH=/opt/homebrew/bin:$PATH
S=/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush-history-local/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/rvs1
C="$S/control-base"
EV=/Users/robin/Claude/Projects/wt-rvs1/artifacts/river-ending-score-1
stamp() { echo "$1 $(date -u +%FT%TZ) load $(uptime | sed 's/.*averages: //')"; }
stamp "CONTROL-ADJ start (base $(git -C "$C" rev-parse --short HEAD))"
cd "$C" || exit 1
"$C/node_modules/.bin/vite" --host 127.0.0.1 --port 5450 --strictPort > "$S/vite-control-adj.log" 2>&1 &
CVPID=$!
echo "control vite pid $CVPID"
for i in $(seq 1 90); do curl -sf "http://127.0.0.1:5450/" > /dev/null && break; sleep 1; done
node "$S/probe.mjs" "http://127.0.0.1:5450" "$S/control-adj-warm.json" desktop idle; echo "control warm rc=$?"
GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5450 npx playwright test e2e/assay-auto-tape.spec.ts e2e/cp03-press-loop.spec.ts e2e/cp04-lever.spec.ts e2e/cp05-river.spec.ts --project=desktop-chrome --project=mobile-chrome --workers=1 --reporter=line --trace=off --output="$S/results-control-adj" > "$EV/control-base-adjacent-reds.log" 2>&1
echo "CONTROL_ADJ_RC=$?"
kill $CVPID; wait $CVPID 2>/dev/null
echo "control vite stopped ($CVPID)"
# Replay diagnostics (branch tree, own vite on 5451 per run): where the replayed hero goes, which seams are live.
cd /Users/robin/Claude/Projects/wt-rvs1 || exit 1
node "$S/replay-diag.mjs" "$EV/reel-desktop-chrome.json" "$S/diag-river-reel-desktop.json" 5451; echo "diag river rc=$?"
node "$S/replay-diag.mjs" "$S/reel-desktop-chrome-relabelled-the-claim.json" "$S/diag-relabelled-desktop.json" 5451; echo "diag relabelled rc=$?"
stamp "CONTROL-ADJ end"
echo BATCH-DONE
