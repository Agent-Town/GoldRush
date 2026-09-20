#!/bin/bash
# One bisect step: check the detached worktree out at $1, replay the reel through the seam,
# append one line to the ledger. Usage: bisect.sh <sha> [reel] [cap]
set -e
BASE=/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad
SHA="$1"
REEL="${2:-$BASE/wt-relay/artifacts/gauntlet-heat11-20260903/rides/e7-relay-rush/opus/work/attempt-1-tape.json}"
CAP="${3:-20400}"
OUT="$BASE/wt-relay/artifacts/relay-rush-replays-again/bisect"
mkdir -p "$OUT"
cd "$BASE/wt-bisect"
git checkout --detach "$SHA" >/dev/null 2>&1
FULL=$(git rev-parse --short "$SHA")
/opt/homebrew/bin/node "$BASE/wt-relay/artifacts/relay-rush-replays-again/probe.mjs" "$BASE/wt-bisect" "$REEL" 3600 "$CAP" 2>/dev/null > "$OUT/$FULL.json"
/opt/homebrew/bin/node -e '
const fs=require("fs");
const j=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));
const sha=process.argv[2];
const subject=process.argv[3];
const line=[sha, j.verdict ?? (j.bootError?"BOOT-ERROR":"?"), "steps="+(j.steps??"-"),
  "wave="+(j.final?.wave??"-"), "t="+(j.final?.t??"-"), "gold="+(j.final?.gold??"-"),
  "hash="+(j.result?.eventLogHash??"-"), (j.bootError?("boot:"+j.bootError.slice(0,120)):""), subject].join(" | ");
console.log(line);
fs.appendFileSync(process.argv[4], line+"\n");
' "$OUT/$FULL.json" "$FULL" "$(git log -1 --format=%s "$SHA" | cut -c1-60)" "$OUT/ledger.txt"
