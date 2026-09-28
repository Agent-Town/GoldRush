#!/bin/bash
# river-assay-1 evidence batch (not a gate): the one real human county standing the tree holds, replayed through the
# worker's seam and judged by the real worker (dry run, nothing posted), on the tip and on the base, so the answer to
# "would the door's pending human standings verify?" is measured rather than argued. The standing is row 0 of
# artifacts/ops/seedrun-board-backup-20260822.json: e9-seed-run, secured, 20 waves, 600 s, a keyboard walk whose reel
# holds 500 diagonal ticks at 0.707, submitted 2026-08-20; the live door rejected it then ("instrument exited 143").
# Run under the drain lock. Usage: human-reel-batch.sh <tip checkout> <base checkout> <replay port> <worker port>
set -u
export PATH=/opt/homebrew/bin:$PATH
TIP=$1; BASE=$2; RP=$3; WP=$4
I=$TIP/artifacts/river-assay-1/instruments
ROOT=$TIP/artifacts/river-assay-1/human
mkdir -p "$ROOT"
node -e '
const [row] = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
const { secured, waves, timeAlive, gold, baseValue } = row;
require("fs").writeFileSync(process.argv[2], JSON.stringify({ score: { secured, waves, timeAlive, gold, baseValue }, tape: row.tape }));
require("fs").writeFileSync(process.argv[3], JSON.stringify(row.tape));
' "$TIP/artifacts/ops/seedrun-board-backup-20260822.json" "$ROOT/seedrun-human-submission.json" "$ROOT/seedrun-human-reel.json"
for arm in tip base; do
  W=$TIP; [ "$arm" = base ] && W=$BASE
  OUT=$ROOT/$arm; mkdir -p "$OUT"
  cd "$W" || exit 2
  echo "$arm start $(date -u +%FT%TZ) head $(git rev-parse --short HEAD) load $(sysctl -n vm.loadavg)"
  start=$(date +%s)
  GR_ASSAY_REPLAY_PORT=$RP node scripts/assay-replay.mjs "$ROOT/seedrun-human-reel.json" > "$OUT/replay.out" 2> "$OUT/replay.err"
  echo "$arm replay rc=$? $(( $(date +%s) - start ))s $(head -c 400 "$OUT/replay.out")"
  GR_ASSAY_REPLAY_PORT=$WP node "$I/worker-verdicts.mjs" "$OUT/worker-verdicts.json" "seedrun-human=$ROOT/seedrun-human-submission.json" > "$OUT/worker.log" 2>&1
  echo "$arm worker rc=$? $(node -e 'const v=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));for(const r of (v.rows??v))console.log(JSON.stringify({verdict:r.verdict,claimedHash:r.claimedHash,replayedHash:r.replayedHash,reason:r.reason,wallMs:r.wallMs}))' "$OUT/worker-verdicts.json" 2>&1)"
done
echo "end $(date -u +%FT%TZ)"
