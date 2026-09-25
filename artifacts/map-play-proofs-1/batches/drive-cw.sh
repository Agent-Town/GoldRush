#!/bin/bash
# map-play-proofs-1: re-run the one pair the harness-stopped batch left as a partial row.
S=/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad
D="/Users/robin/Claude/Projects/Gold Rush/scripts/attended/dlock.sh"
"$D" "$S/batch-run.sh" cwmob e3-canyon-works --project=mobile-chrome > "$S/batch-cwmob.log" 2>&1
echo "CW DONE $(date -u '+%Y-%m-%dT%H:%M:%SZ')" > "$S/drive-cw.done"
