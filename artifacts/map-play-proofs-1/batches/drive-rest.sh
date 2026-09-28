#!/bin/bash
# map-play-proofs-1: the remaining locked commands, one after another, each its own lock hold.
S=/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad
D="/Users/robin/Claude/Projects/Gold Rush/scripts/attended/dlock.sh"
R="$S/batch-run.sh"
rm -f "$S/drive-rest.done" 2>/dev/null
"$D" "$R" b1b e3-fairground --project=mobile-chrome > "$S/batch-b1b.log" 2>&1
"$D" "$R" b2 e4-dust-flats,e4-gusher-county,e4-boneyard,e8-far-side,e8-low-orbit,e8-eclipse > "$S/batch-b2.log" 2>&1
"$D" "$R" b3 e9-dome-basin,e9-seed-run,e9-devils-alley,e9-old-canal,e10-last-claim,e10-river > "$S/batch-b3.log" 2>&1
echo "DRIVE DONE $(date -u '+%Y-%m-%dT%H:%M:%SZ')" > "$S/drive-rest.done"
