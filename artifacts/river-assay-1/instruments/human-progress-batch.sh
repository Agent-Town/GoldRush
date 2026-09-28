#!/bin/bash
# river-assay-1 evidence batch (not a gate): where the human seed-run reel's replay stops, on the tip and the base,
# against two controls: the same reel with its seven set_pause actions removed, and the same-laws human reel
# (a6c04f80), which completes. Run under the drain lock. Usage: human-progress-batch.sh <tip> <base> <port>
set -u
export PATH=/opt/homebrew/bin:$PATH
TIP=$1; BASE=$2; P=$3
I=$TIP/artifacts/river-assay-1/instruments
H=$TIP/artifacts/river-assay-1/human
CONTROL=$TIP/artifacts/sol/map-art-campaign-2/run-10/phone-hud/failures/e2e-hud/same-laws-harvest-parity-m-6a30d-rider-rate-tick-per-command-desktop-chrome/same-laws-tape.json
node -e '
const t = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
t.inputLog.entries = t.inputLog.entries.map((e) => ({ ...e, a: (e.a ?? []).filter((a) => a.type !== "set_pause") }));
require("fs").writeFileSync(process.argv[2], JSON.stringify(t));
' "$H/seedrun-human-reel.json" "$H/seedrun-human-reel-nopause.json"
cd "$TIP" || exit 2
echo "tip $(git rev-parse --short HEAD) start $(date -u +%FT%TZ) load $(sysctl -n vm.loadavg)"
GR_ASSAY_REPLAY_PORT=$P node "$I/replay-progress.mjs" "$H/seedrun-human-reel.json" "$H/progress-tip.json" 2>&1 | grep -v ExperimentalWarning | grep -v trace-warnings
GR_ASSAY_REPLAY_PORT=$P node "$I/replay-progress.mjs" "$H/seedrun-human-reel-nopause.json" "$H/progress-tip-nopause.json" 2>&1 | grep -v ExperimentalWarning | grep -v trace-warnings
GR_ASSAY_REPLAY_PORT=$P node "$I/replay-progress.mjs" "$CONTROL" "$H/progress-tip-control-a6c04f80.json" 2>&1 | grep -v ExperimentalWarning | grep -v trace-warnings
cd "$BASE" || exit 2
echo "base $(git rev-parse --short HEAD) start $(date -u +%FT%TZ)"
GR_ASSAY_REPLAY_PORT=$P node "$I/replay-progress.mjs" "$H/seedrun-human-reel.json" "$H/progress-base.json" 2>&1 | grep -v ExperimentalWarning | grep -v trace-warnings
echo "end $(date -u +%FT%TZ)"
