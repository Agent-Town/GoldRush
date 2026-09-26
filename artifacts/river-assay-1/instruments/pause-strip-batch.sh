#!/bin/bash
# river-assay-1 evidence batch (not a gate): is a recorded pause the ONLY thing between a paused run and its verdict?
# The paused River reel recorded on the tip (a8c5af79, one set_pause at t=50, resume unrecorded) with its set_pause
# action removed, replayed through the worker's seam and judged by the real worker (dry run). If its replay reproduces
# the hash the live run computed WITH the pause, a pause has no effect on the event log and the cure is to leave it
# out of the replay. Run under the drain lock. Usage: pause-strip-batch.sh <tip> <port> <port>
set -u
export PATH=/opt/homebrew/bin:$PATH
TIP=$1; RP=$2; WP=$3
I=$TIP/artifacts/river-assay-1/instruments
H=$TIP/artifacts/river-assay-1/human
cd "$TIP" || exit 2
node -e '
const t = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
t.inputLog.entries = t.inputLog.entries.map((e) => ({ ...e, a: (e.a ?? []).filter((a) => a.type !== "set_pause") }));
require("fs").writeFileSync(process.argv[2], JSON.stringify(t));
' "$H/paused-river-desktop.json" "$H/paused-river-desktop-stripped.json"
echo "tip $(git rev-parse --short HEAD) start $(date -u +%FT%TZ)"
GR_ASSAY_REPLAY_PORT=$RP node scripts/assay-replay.mjs "$H/paused-river-desktop-stripped.json" > "$H/replay-paused-river-stripped.out" 2> "$H/replay-paused-river-stripped.err"
echo "stripped replay rc=$? $(head -c 400 "$H/replay-paused-river-stripped.out")"
GR_ASSAY_REPLAY_PORT=$WP node "$I/worker-verdicts.mjs" "$H/worker-verdicts-paused-stripped.json" "paused-river-stripped=$H/paused-river-desktop-stripped.json" 2>&1 | grep -v ExperimentalWarning | grep -v trace-warnings | tail -2
echo "end $(date -u +%FT%TZ)"
