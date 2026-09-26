#!/bin/bash
# river-assay-1 evidence batch (not a gate). Replays the River reels and the existing verified agent reels through the
# seam the assay worker spawns (scripts/assay-replay.mjs), the River reels through the headless arm alone, and then
# runs the real worker (dry run) over all of them. Run from the checkout root, under the drain lock, with
# GR_ASSAY_REPLAY_PORT set to a scratch port. Usage: replay-batch.sh <outdir> [extra label=file ...]
set -u
OUT=$1; shift
mkdir -p "$OUT"
R=artifacts/river-assay-1/reels
H15=artifacts/gauntlet-heat15-cd24d12d
REELS=(
  "report-desktop-3f5a03c5=$R/report-desktop-3f5a03c5.json"
  "report-phone-647005f9=$R/report-phone-647005f9.json"
  "run7-desktop-a1a3a3f5=$R/run7-desktop-a1a3a3f5.json"
  "run7-phone-b9509309=$R/run7-phone-b9509309.json"
  "heat15-probe-b131e18e=$H15/probe/submission.json"
  "heat15-r1-f3a9c00c=$H15/rides/r1/submission.json"
  "heat15-r2-b92da1bf=$H15/rides/r2/submission.json"
  "heat14-era6-idle-a45ba9ac=artifacts/gauntlet-heat14-e3949bfa/rides/the-claim/work/probe-idle-tape.json"
  "$@"
)
echo "batch start $(date -u +%FT%TZ) load $(sysctl -n vm.loadavg) head $(git rev-parse --short HEAD) port ${GR_ASSAY_REPLAY_PORT:-unset}" | tee "$OUT/batch.log"
for spec in "${REELS[@]}"; do
  label=${spec%%=*}; file=${spec#*=}
  # A door submission carries the reel under `tape`; the instrument reads a bare reel or a `{ reel }` wrapper.
  reel="$OUT/input-$label.json"
  node -e "const p=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'));require('fs').writeFileSync(process.argv[2],JSON.stringify(p.tape??p.reel??p))" "$file" "$reel"
  start=$(date +%s)
  node scripts/assay-replay.mjs "$reel" > "$OUT/replay-$label.out" 2> "$OUT/replay-$label.err"
  rc=$?
  echo "replay $label rc=$rc $(( $(date +%s) - start ))s $(head -c 400 "$OUT/replay-$label.out")" | tee -a "$OUT/batch.log"
done
# The headless arm alone: the River reels (refused), and the two agent tapes the landings pin byte for byte through it
# (an idle agent tape carries no agent_orders, so the worker's seam routes it to the browser arm instead).
for label in report-desktop-3f5a03c5 run7-desktop-a1a3a3f5 heat14-era6-idle-a45ba9ac heat15-probe-b131e18e; do
  node scripts/assay-replay-agent.mjs "$OUT/input-$label.json" > "$OUT/agent-$label.out" 2> "$OUT/agent-$label.err"
  echo "agent-arm $label rc=$? $(head -c 300 "$OUT/agent-$label.out") $(grep -v ExperimentalWarning "$OUT/agent-$label.err" | grep -v trace-warnings | head -c 300)" | tee -a "$OUT/batch.log"
done
node artifacts/river-assay-1/instruments/worker-verdicts.mjs "$OUT/worker-verdicts.json" "${REELS[@]}" 2>&1 | tee -a "$OUT/batch.log"
echo "worker rc=${PIPESTATUS[0]}" | tee -a "$OUT/batch.log"
echo "batch end $(date -u +%FT%TZ) load $(sysctl -n vm.loadavg)" | tee -a "$OUT/batch.log"
