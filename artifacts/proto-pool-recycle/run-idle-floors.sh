#!/bin/bash
# Runs the idle-floor probe over the three sick maps, both bench seeds each.
# Usage: bash artifacts/proto-pool-recycle/run-idle-floors.sh <out.jsonl>
set -u
export PATH="$HOME/.nvm/versions/node/v26.4.0/bin:$PATH"
cd "$(dirname "$0")/../.." || exit 1
OUT="$1"
: > "$OUT"
for pair in \
  "e6-showroom e6-showroom-01" \
  "e6-showroom e6-showroom-02" \
  "e6-picnic e6-picnic-01" \
  "e6-picnic e6-picnic-02" \
  "e6-half-life-hollow e6-half-life-hollow-01" \
  "e6-half-life-hollow e6-half-life-hollow-02" ; do
  set -- $pair
  echo "--- $1 / $2" >&2
  node artifacts/proto-pool-recycle/idle-probe.mjs --contract "$1" --seed "$2" 2>/dev/null >> "$OUT" \
    || echo "{\"contract\":\"$1\",\"seed\":\"$2\",\"error\":\"probe failed\"}" >> "$OUT"
done
cat "$OUT"
