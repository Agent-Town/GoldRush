#!/bin/bash
# Exploration batch 1 (base code, before any change): vite on 5447 in wt-rvs1, the River probes, vite stopped by PID.
export PATH=/opt/homebrew/bin:$PATH
S=/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush-history-local/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/rvs1
WT=/Users/robin/Claude/Projects/wt-rvs1
PORT=5447
cd "$WT" || exit 1
echo "load: $(uptime)"
"$WT/node_modules/.bin/vite" --host 127.0.0.1 --port $PORT --strictPort > "$S/vite-probe1.log" 2>&1 &
VPID=$!
echo "vite pid $VPID"
for i in $(seq 1 90); do curl -sf "http://127.0.0.1:$PORT/" > /dev/null && break; sleep 1; done
curl -sf "http://127.0.0.1:$PORT/" > /dev/null && echo "vite ready after ${i}s" || echo "vite NOT ready"
# warm boot (not counted)
node "$S/probe.mjs" "http://127.0.0.1:$PORT" "$S/probe1-warm.json" desktop idle; echo "warm rc=$?"
node "$S/probe.mjs" "http://127.0.0.1:$PORT" "$S/probe1-lever-desktop.json" desktop lever-river; echo "lever-desktop rc=$?"
PROBE_IDLE=1 PROBE_IDLE_MS=15000 node "$S/probe.mjs" "http://127.0.0.1:$PORT" "$S/probe1-lever-idle-desktop.json" desktop lever-river; echo "lever-idle rc=$?"
node "$S/probe.mjs" "http://127.0.0.1:$PORT" "$S/probe1-raw-desktop.json" desktop raw-river; echo "raw rc=$?"
node "$S/probe.mjs" "http://127.0.0.1:$PORT" "$S/probe1-lever-mobile.json" mobile lever-river; echo "lever-mobile rc=$?"
kill $VPID; wait $VPID 2>/dev/null
echo "vite stopped ($VPID)"
echo BATCH-DONE
