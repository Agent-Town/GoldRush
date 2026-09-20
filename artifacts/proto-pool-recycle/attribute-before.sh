#!/bin/bash
# ATTRIBUTION RUN — measures the SAME probes against the pre-prototype tree, so every
# "this moved" claim is attributed to the prototype rather than to main's own drift.
#
# Safe because the prototype is already COMMITTED: the two files are checked out from the
# commit's parent, measured, then restored from the commit. The restore runs on every exit
# path (trap), so an interrupt cannot leave the tree swapped.
#
# Usage: bash artifacts/proto-pool-recycle/attribute-before.sh
set -u
export PATH="$HOME/.nvm/versions/node/v26.4.0/bin:$PATH"
cd "$(dirname "$0")/../.." || exit 1

FILES="src/entities/pools.ts src/systems/WrangleSystem.ts"
OUT="artifacts/proto-pool-recycle/attribution.txt"
# The pre-prototype tip this branch was cut from. Pinned by HASH, not by HEAD~n: later
# evidence commits keep moving HEAD, and a relative pointer would silently measure the
# wrong tree (the task-sequencing git-log-window trap).
BASE="c3e3c856e"

restore() {
  echo "--- restoring prototype tree" >&2
  git checkout HEAD -- $FILES
  git status --short -- $FILES >&2
}
trap restore EXIT

echo "=== BEFORE tree ($BASE, pre-prototype) ===" | tee "$OUT"
git checkout "$BASE" -- $FILES || exit 1
git diff --stat HEAD -- $FILES | tee -a "$OUT"

echo "" | tee -a "$OUT"
echo "-- glow-mesa idle-01 (BEFORE) --" | tee -a "$OUT"
node artifacts/proto-pool-recycle/idle-probe.mjs --contract e6-glow-mesa --seed e6-glow-mesa-01 2>/dev/null | tee -a "$OUT"

echo "-- glow-mesa PROVER seed 01 (BEFORE) --" | tee -a "$OUT"
node artifacts/e6-glow-mesa/prover.mjs --seed e6-glow-mesa-01 --quiet 2>/dev/null | tail -1 | tee -a "$OUT"

echo "-- glow-mesa PROVER seed 02 (BEFORE) --" | tee -a "$OUT"
node artifacts/e6-glow-mesa/prover.mjs --seed e6-glow-mesa-02 --quiet 2>/dev/null | tail -1 | tee -a "$OUT"

echo "" | tee -a "$OUT"
echo "=== restoring, then AFTER tree (HEAD) ===" | tee -a "$OUT"
git checkout HEAD -- $FILES

echo "-- glow-mesa PROVER seed 02 (AFTER) --" | tee -a "$OUT"
node artifacts/e6-glow-mesa/prover.mjs --seed e6-glow-mesa-02 --quiet 2>/dev/null | tail -1 | tee -a "$OUT"

echo "done." | tee -a "$OUT"
