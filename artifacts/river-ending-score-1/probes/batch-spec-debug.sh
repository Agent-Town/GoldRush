#!/bin/bash
# Debug run of the new spec on the branch (not counted): vite on 5448, desktop then mobile, vite stopped by PID.
export PATH=/opt/homebrew/bin:$PATH
S=/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush-history-local/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/rvs1
WT=/Users/robin/Claude/Projects/wt-rvs1
PORT=5448
cd "$WT" || exit 1
echo "load: $(uptime)"
"$WT/node_modules/.bin/vite" --host 127.0.0.1 --port $PORT --strictPort > "$S/vite-spec-debug.log" 2>&1 &
VPID=$!
echo "vite pid $VPID"
for i in $(seq 1 90); do curl -sf "http://127.0.0.1:$PORT/" > /dev/null && break; sleep 1; done
curl -sf "http://127.0.0.1:$PORT/" > /dev/null && echo "vite ready after ${i}s" || echo "vite NOT ready"
node "$S/probe.mjs" "http://127.0.0.1:$PORT" "$S/spec-debug-warm.json" desktop idle; echo "warm rc=$?"
GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:$PORT npx playwright test e2e/river-ending-score.spec.ts --project=desktop-chrome --workers=1 --reporter=line --trace=off > "$S/spec-debug-desktop.log" 2>&1
echo "desktop rc=$?"
kill $VPID; wait $VPID 2>/dev/null
echo "vite stopped ($VPID)"
echo BATCH-DONE
