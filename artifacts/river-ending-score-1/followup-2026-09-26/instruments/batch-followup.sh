#!/bin/bash
# Follow-up battery (coordinator 2026-09-26): the spec and the master's three adjacent specs on the branch tip, the F-RES1-4
# probe on the tip and on the pre-change tip, the new spec on the pre-change tip (the hold's control), and existing tapes
# replayed on base and tip. Every server is started and stopped here by its own PID.
export PATH=/opt/homebrew/bin:$PATH
S=/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush-history-local/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/rvs1
WT=/Users/robin/Claude/Projects/wt-rvs1
PRE="$S/wt-prefix"
BASE="$S/wt-base"
EV="$WT/artifacts/river-ending-score-1/followup-2026-09-26"
mkdir -p "$EV"
stamp() { echo "$1 $(date -u +%FT%TZ) load $(uptime | sed 's/.*averages: //')"; }
waitport() { for i in $(seq 1 90); do curl -sf "http://127.0.0.1:$1/" > /dev/null && return 0; sleep 1; done; return 1; }
stamp "FOLLOWUP start (tip $(git -C "$WT" rev-parse --short HEAD), pre-change $(git -C "$PRE" rev-parse --short HEAD), base $(git -C "$BASE" rev-parse --short HEAD))"

# 1. The branch tip on 5448.
cd "$WT" || exit 1
"$WT/node_modules/.bin/vite" --host 127.0.0.1 --port 5448 --strictPort > "$S/vite-fu-tip.log" 2>&1 &
VPID=$!
waitport 5448 && echo "tip vite $VPID ready" || echo "tip vite NOT ready"
node "$S/probe.mjs" "http://127.0.0.1:5448" "$S/fu-tip-warm.json" desktop idle; echo "tip warm rc=$?"
GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5448 GR_REFRESH_EVIDENCE=1 PLAYWRIGHT_JSON_OUTPUT_NAME="$EV/spec-results.json" npx playwright test e2e/river-ending-score.spec.ts --project=desktop-chrome --project=mobile-chrome --workers=1 --reporter=line,json --trace=off --output="$S/results-fu-spec" > "$EV/spec-both-projects.log" 2>&1
echo "SPEC_RC=$?"; stamp "spec done"
GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5448 npx playwright test e2e/task-025-bandits-dont-swim.spec.ts e2e/m2-01-build-menu.spec.ts e2e/charter-press-totality.spec.ts --project=desktop-chrome --project=mobile-chrome --workers=1 --reporter=line --trace=off --output="$S/results-fu-adj" > "$EV/adjacent-three.log" 2>&1
echo "ADJ_RC=$?"; stamp "adjacent done"
node "$S/playbook-guard-probe.mjs" "http://127.0.0.1:5448" "$EV/playbook-probe-tip-desktop.json" desktop tip; echo "probe tip desktop rc=$?"
node "$S/playbook-guard-probe.mjs" "http://127.0.0.1:5448" "$EV/playbook-probe-tip-mobile.json" mobile tip; echo "probe tip mobile rc=$?"
kill $VPID; wait $VPID 2>/dev/null; echo "tip vite stopped ($VPID)"

# 2. The pre-change tip (bea0a4dcb) on 5450: the new spec is the hold's control, the probe is F-RES1-4's.
cp "$WT/e2e/river-ending-score.spec.ts" "$PRE/e2e/river-ending-score.spec.ts"
cd "$PRE" || exit 1
"$PRE/node_modules/.bin/vite" --host 127.0.0.1 --port 5450 --strictPort > "$S/vite-fu-pre.log" 2>&1 &
PVPID=$!
waitport 5450 && echo "pre vite $PVPID ready" || echo "pre vite NOT ready"
node "$S/probe.mjs" "http://127.0.0.1:5450" "$S/fu-pre-warm.json" desktop idle; echo "pre warm rc=$?"
GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5450 PLAYWRIGHT_JSON_OUTPUT_NAME="$EV/control-prechange-spec-results.json" npx playwright test e2e/river-ending-score.spec.ts --project=desktop-chrome --project=mobile-chrome --workers=1 --reporter=line,json --trace=off --output="$S/results-fu-pre" > "$EV/control-prechange-spec.log" 2>&1
echo "PRE_SPEC_RC=$?"
node "$S/playbook-guard-probe.mjs" "http://127.0.0.1:5450" "$EV/playbook-probe-prechange-desktop.json" desktop prechange; echo "probe pre desktop rc=$?"
node "$S/playbook-guard-probe.mjs" "http://127.0.0.1:5450" "$EV/playbook-probe-prechange-mobile.json" mobile prechange; echo "probe pre mobile rc=$?"
kill $PVPID; wait $PVPID 2>/dev/null; echo "pre vite stopped ($PVPID)"
stamp "pre-change done"

# 3. Existing tapes replayed on base (be37d83cf) and on the tip: the agent arm and the browser arm.
AGENT_TAPES="$WT/artifacts/gauntlet-heat14-e3949bfa/rides/the-claim/work/probe-idle-tape.json $WT/artifacts/board-tape-gold/current-grammar/e3-moth-season.tape.json"
i=0
for T in $AGENT_TAPES; do
  i=$((i+1))
  (cd "$BASE" && node scripts/assay-replay-agent.mjs "$T" > "$EV/replay-agent-$i-base.out" 2> "$S/replay-agent-$i-base.err"); RB=$?
  (cd "$WT" && node scripts/assay-replay-agent.mjs "$T" > "$EV/replay-agent-$i-tip.out" 2> "$S/replay-agent-$i-tip.err"); RT=$?
  cmp -s "$EV/replay-agent-$i-base.out" "$EV/replay-agent-$i-tip.out" && SAME=identical || SAME=DIFFER
  cmp -s <(grep -v 'ExperimentalWarning\|trace-warnings' "$S/replay-agent-$i-base.err") <(grep -v 'ExperimentalWarning\|trace-warnings' "$S/replay-agent-$i-tip.err") && SAMEERR=identical || SAMEERR=DIFFER
  echo "agent tape $i $(basename "$T"): base rc=$RB tip rc=$RT stdout $SAME stderr $SAMEERR ($(wc -c < "$EV/replay-agent-$i-tip.out" | tr -d ' ') bytes)"
done
BROWSER_REELS="$WT/artifacts/river-ending-score-1/reel-desktop-chrome.json $WT/artifacts/river-ending-score-1/probes/reel-desktop-chrome-relabelled-the-claim.json"
i=0
for T in $BROWSER_REELS; do
  i=$((i+1))
  (cd "$BASE" && GR_ASSAY_REPLAY_PORT=5449 node scripts/assay-replay.mjs "$T" > "$EV/replay-browser-$i-base.out" 2> "$S/replay-browser-$i-base.err"); RB=$?
  (cd "$WT" && GR_ASSAY_REPLAY_PORT=5449 node scripts/assay-replay.mjs "$T" > "$EV/replay-browser-$i-tip.out" 2> "$S/replay-browser-$i-tip.err"); RT=$?
  SAME=$(node -e "const f=(p)=>{const o=JSON.parse(require('fs').readFileSync(p,'utf8'));delete o.wallMs;return JSON.stringify(o)};console.log(f(process.argv[1])===f(process.argv[2])?'identical (wallMs excluded)':'DIFFER')" "$EV/replay-browser-$i-base.out" "$EV/replay-browser-$i-tip.out" 2>&1)
  echo "browser reel $i $(basename "$T"): base rc=$RB tip rc=$RT $SAME"
done
stamp "FOLLOWUP end"
echo BATCH-DONE
