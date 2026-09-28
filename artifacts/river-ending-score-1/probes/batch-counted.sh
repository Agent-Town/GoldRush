#!/bin/bash
# Counted evidence batch on the branch: vite on 5448 (warm boot first), the slice's spec on both projects with evidence
# refreshed, the adjacent suites on both projects, the assay browser arm on the produced reels, the raw River idle probe.
export PATH=/opt/homebrew/bin:$PATH
S=/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush-history-local/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/rvs1
WT=/Users/robin/Claude/Projects/wt-rvs1
PORT=5448
EV="$WT/artifacts/river-ending-score-1"
cd "$WT" || exit 1; mkdir -p "$EV"
stamp() { echo "$1 $(date -u +%FT%TZ) load $(uptime | sed 's/.*averages: //')"; }
stamp "BATCH start"
"$WT/node_modules/.bin/vite" --host 127.0.0.1 --port $PORT --strictPort > "$S/vite-counted.log" 2>&1 &
VPID=$!
echo "vite pid $VPID"
for i in $(seq 1 90); do curl -sf "http://127.0.0.1:$PORT/" > /dev/null && break; sleep 1; done
curl -sf "http://127.0.0.1:$PORT/" > /dev/null && echo "vite ready after ${i}s" || echo "vite NOT ready"
node "$S/probe.mjs" "http://127.0.0.1:$PORT" "$S/counted-warm.json" desktop idle; echo "warm rc=$?"
export GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:$PORT
GR_REFRESH_EVIDENCE=1 PLAYWRIGHT_JSON_OUTPUT_NAME="$EV/spec-results.json" npx playwright test e2e/river-ending-score.spec.ts --project=desktop-chrome --project=mobile-chrome --workers=1 --reporter=line,json --trace=off --output="$S/results-spec" > "$EV/spec-both-projects.log" 2>&1
echo "SPEC_RC=$?"; stamp "spec done"
npx playwright test e2e/task-025-bandits-dont-swim.spec.ts e2e/m2-01-build-menu.spec.ts e2e/charter-press-totality.spec.ts e2e/cp05-river.spec.ts e2e/e10-finale-staging.spec.ts e2e/cp04-lever.spec.ts e2e/cp02-charter-boot.spec.ts e2e/cp03-press-loop.spec.ts e2e/tape-01-run-tape.spec.ts e2e/assay-auto-tape.spec.ts e2e/live-seed-rotation.spec.ts e2e/locked-win.spec.ts e2e/door-epic-submit.spec.ts --project=desktop-chrome --project=mobile-chrome --workers=1 --reporter=line --trace=off --output="$S/results-adjacent" > "$EV/adjacent-both-projects.log" 2>&1
echo "ADJACENT_RC=$?"; stamp "adjacent done"
PROBE_SEED_E10=1 PROBE_IDLE_MS=45000 node "$S/probe.mjs" "http://127.0.0.1:$PORT" "$S/counted-raw-river-idle.json" desktop raw-river; echo "raw-idle rc=$?"
kill $VPID; wait $VPID 2>/dev/null
echo "vite stopped ($VPID)"
for p in desktop-chrome mobile-chrome; do
  if [ -f "$EV/reel-$p.json" ]; then
    GR_ASSAY_REPLAY_PORT=5449 node scripts/assay-replay.mjs "$EV/reel-$p.json" > "$EV/assay-browser-$p.json" 2> "$EV/assay-browser-$p.err"; echo "assay-browser $p rc=$?"
    node "$S/relabel-reel.mjs" "$EV/reel-$p.json" "$S/reel-$p-relabelled-the-claim.json" > /dev/null
    GR_ASSAY_REPLAY_PORT=5449 node scripts/assay-replay.mjs "$S/reel-$p-relabelled-the-claim.json" > "$EV/assay-browser-relabelled-$p.json" 2> "$EV/assay-browser-relabelled-$p.err"; echo "assay-browser-relabelled $p rc=$?"
  fi
done
# CONTROL: the same spec on the base commit (detached worktree, vite 5450), both projects: the "before" of the run-6 bank assertion.
C="$S/control-base"
cp "$WT/e2e/river-ending-score.spec.ts" "$C/e2e/river-ending-score.spec.ts"
cd "$C" || exit 1
"$C/node_modules/.bin/vite" --host 127.0.0.1 --port 5450 --strictPort > "$S/vite-control.log" 2>&1 &
CVPID=$!
echo "control vite pid $CVPID"
for i in $(seq 1 90); do curl -sf "http://127.0.0.1:5450/" > /dev/null && break; sleep 1; done
node "$S/probe.mjs" "http://127.0.0.1:5450" "$S/control-warm.json" desktop idle; echo "control warm rc=$?"
GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5450 PLAYWRIGHT_JSON_OUTPUT_NAME="$S/control-spec-results.json" npx playwright test e2e/river-ending-score.spec.ts --project=desktop-chrome --project=mobile-chrome --workers=1 --reporter=line,json --trace=off --output="$S/results-control" > "$EV/control-base-spec.log" 2>&1
echo "CONTROL_SPEC_RC=$?"
kill $CVPID; wait $CVPID 2>/dev/null
echo "control vite stopped ($CVPID)"
cd "$WT" || exit 1; mkdir -p "$EV"
unset GR_CAPTURE_EXTERNAL_SERVER GR_CAPTURE_BASE_URL
stamp "node-guards start"
GR_GUARD_NO_ARTIFACT=1 npm run test:node-guards > "$EV/node-guards.log" 2>&1
echo "NODE_GUARDS_RC=$?"
stamp "BATCH end"
echo BATCH-DONE
