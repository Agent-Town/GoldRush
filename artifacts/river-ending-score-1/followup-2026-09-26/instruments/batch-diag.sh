#!/bin/bash
# F-RES1-7 diagnostic: the stream-slot bookkeeping after a stopped playbook replay, on the tip (River) and on base (Claim).
export PATH=/opt/homebrew/bin:$PATH
S=/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush-history-local/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/rvs1
WT=/Users/robin/Claude/Projects/wt-rvs1
BASE="$S/wt-base"
EV="$WT/artifacts/river-ending-score-1/followup-2026-09-26"
stamp() { echo "$1 $(date -u +%FT%TZ) load $(uptime | sed 's/.*averages: //')"; }
waitport() { for i in $(seq 1 90); do curl -sf "http://127.0.0.1:$1/" > /dev/null && return 0; sleep 1; done; return 1; }
stamp "DIAG start"
cd "$WT" || exit 1
"$WT/node_modules/.bin/vite" --host 127.0.0.1 --port 5448 --strictPort > "$S/vite-diag-tip.log" 2>&1 &
VPID=$!
waitport 5448 && echo "tip vite $VPID ready" || echo "tip vite NOT ready"
node "$S/probe.mjs" "http://127.0.0.1:5448" "$S/diag-tip-warm.json" desktop idle; echo "tip warm rc=$?"
node "$S/playbook-reel-diag.mjs" "http://127.0.0.1:5448" "$EV/stream-slot-diag-tip-river.json" river; echo "diag tip river rc=$?"
node "$S/playbook-reel-diag.mjs" "http://127.0.0.1:5448" "$EV/stream-slot-diag-tip-claim.json" claim; echo "diag tip claim rc=$?"
kill $VPID; wait $VPID 2>/dev/null; echo "tip vite stopped ($VPID)"
cd "$BASE" || exit 1
"$BASE/node_modules/.bin/vite" --host 127.0.0.1 --port 5450 --strictPort > "$S/vite-diag-base.log" 2>&1 &
BVPID=$!
waitport 5450 && echo "base vite $BVPID ready" || echo "base vite NOT ready"
node "$S/probe.mjs" "http://127.0.0.1:5450" "$S/diag-base-warm.json" desktop idle; echo "base warm rc=$?"
node "$S/playbook-reel-diag.mjs" "http://127.0.0.1:5450" "$EV/stream-slot-diag-base-claim.json" claim; echo "diag base claim rc=$?"
kill $BVPID; wait $BVPID 2>/dev/null; echo "base vite stopped ($BVPID)"
stamp "DIAG end"
echo BATCH-DONE
