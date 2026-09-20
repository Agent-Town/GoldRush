#!/bin/bash
# s1205 — re-measure the node-guards battery N times on the MERGED tree.
# The defect being cured is a load-dependent race in child-process capture, so a
# quiet green is the weak arm; run this both quiet and under load.
# Usage: bash s1205-battery.sh <runs> <label>
cd "$(dirname "$0")/../.." || exit 2
runs="${1:-5}"
label="${2:-quiet}"
reds=0
for i in $(seq 1 "$runs"); do
  start=$(date +%s)
  out=$(npm run test:node-guards 2>&1)
  rc=$?
  end=$(date +%s)
  line=$(printf '%s\n' "$out" | grep -E '^# (tests|pass|fail)' | tr '\n' ' ')
  echo "[$label $i/$runs] rc=$rc  $((end-start))s  $line"
  if [ "$rc" -ne 0 ]; then
    reds=$((reds+1))
    printf '%s\n' "$out" | grep -E 'not ok|AssertionError|truncated' | head -6
  fi
done
echo "[$label] RED $reds / $runs"
