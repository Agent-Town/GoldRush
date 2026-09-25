#!/bin/bash
# map-play-proofs-1 item 3: the one re-run each, ALONE on a warm server, for every map whose first
# pass ran under the landing's load (03:15Z-04:31Z). One map per locked command, both projects.
S=/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad
D="/Users/robin/Claude/Projects/Gold Rush/scripts/attended/dlock.sh"
for id in e1-baron e2-incline e3-fairground e3-canyon-works; do
  "$D" "$S/batch-run.sh" "rr-$id" "$id" > "$S/batch-rr-$id.log" 2>&1
done
echo "RERUNS DONE $(date -u '+%Y-%m-%dT%H:%M:%SZ')" > "$S/drive-rerun.done"
