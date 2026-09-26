#!/bin/bash
# river-assay-1 evidence batch (not a gate): does a reel recorded on THIS build survive one pause? A River run on the
# tip with one pause and one resume (KeyP twice, GR_RVA1_PAUSE=1), then its replay: where it stops, and the worker's
# own seam (scripts/assay-replay.mjs, one attempt). Run under the drain lock. Usage: paused-reel-batch.sh <tip> <port> <port>
set -u
export PATH=/opt/homebrew/bin:$PATH
TIP=$1; RP=$2; PP=$3
I=$TIP/artifacts/river-assay-1/instruments
H=$TIP/artifacts/river-assay-1/human
cd "$TIP" || exit 2
echo "tip $(git rev-parse --short HEAD) start $(date -u +%FT%TZ) load $(sysctl -n vm.loadavg)"
GR_RVA1_PAUSE=1 GR_DIAG_PORT=$RP node "$I/record-reel.mjs" river desktop "$H/paused-river-desktop.json" 2>&1 | grep -v ExperimentalWarning | grep -v trace-warnings
node -e '
const t = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
const acts = t.inputLog.entries.flatMap((e) => (e.a ?? []).map((a) => ({ t: e.t, ...a })));
console.log("recorded actions", JSON.stringify(acts), "outcome", JSON.stringify(t.outcome), "ticks", t.inputLog.durationTicks);
' "$H/paused-river-desktop.json"
GR_ASSAY_REPLAY_PORT=$PP node "$I/replay-progress.mjs" "$H/paused-river-desktop.json" "$H/progress-paused-river-desktop.json" 2>&1 | grep -v ExperimentalWarning | grep -v trace-warnings
start=$(date +%s)
GR_ASSAY_REPLAY_PORT=$PP node scripts/assay-replay.mjs "$H/paused-river-desktop.json" > "$H/replay-paused-river-desktop.out" 2> "$H/replay-paused-river-desktop.err"
echo "assay-replay rc=$? $(( $(date +%s) - start ))s out $(head -c 300 "$H/replay-paused-river-desktop.out") err $(grep -v ExperimentalWarning "$H/replay-paused-river-desktop.err" | grep -v trace-warnings | head -c 300)"
echo "end $(date -u +%FT%TZ)"
