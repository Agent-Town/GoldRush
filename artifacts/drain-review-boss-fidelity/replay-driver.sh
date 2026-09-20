#!/bin/bash
# $1 = tree root, $2 = reels dir, $3 = out dir, $4 = port
set -u
export PATH=/opt/homebrew/bin:$PATH
cd "$1" || exit 1
mkdir -p "$3"
for f in "$2"/*.json; do
  c=$(basename "$f" .json)
  if [ -s "$3/$c.out" ] && grep -q eventLogHash "$3/$c.out"; then echo "SKIP $c"; continue; fi
  s=$(date +%s)
  GR_ASSAY_REPLAY_PORT="$4" ASSAY_BOOT_TIMEOUT_MS=180000 ASSAY_PLAYBACK_TIMEOUT_MS=300000 node scripts/assay-replay.mjs "$f" > "$3/$c.out" 2> "$3/$c.err"
  rc=$?
  echo "$c rc=$rc $(( $(date +%s) - s ))s :: $(tail -1 "$3/$c.out" 2>/dev/null | head -c 300)"
done
