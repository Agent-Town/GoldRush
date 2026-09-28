#!/bin/bash
# land-held.sh <tag> — land one attended config with the fires held ONLY around the gates (F-LAND-12, proven on sph1 2026-09-28):
# wait for a fire gap (STATUS line 1 "lock CLEARED" and no tasks/.fire.lock), take the hold, run land-queue.sh land.sh, release the hold
# the moment the gates log carries "verdict:" so the landing's own fast-forward is never blocked by our lock, then wait for land.sh.
# Everything is appended to ~/.goldrush/land/<tag>-run.out. Usage: nohup bash scripts/attended/land-held.sh <tag> &
export PATH=/opt/homebrew/bin:$PATH; R="/Users/robin/Claude/Projects/Gold Rush"; cd "$R" || exit 1
TAG=${1:?tag}; CFG="scripts/attended/landings/$TAG.json"; [ -f "$CFG" ] || { echo "no config $CFG"; exit 2; }
OUT="$HOME/.goldrush/land/$TAG-run.out"; G="$HOME/.goldrush/land/$TAG-gates.txt"
node scripts/attended/land-lib.cjs validate "$CFG" >/dev/null 2>&1 || true   # land.sh validates again and refuses loudly; this is only an early hint
for i in $(seq 1 240); do head -1 STATUS.md | grep -qE "lock CLEARED" && [ ! -d tasks/.fire.lock ] && break; sleep 30; done
bash scripts/attended/fire-hold.sh start >> "$OUT" 2>&1 || { echo "fire hold refused $(date -u '+%H:%MZ')" >> "$OUT"; exit 1; }
trap 'bash scripts/attended/fire-hold.sh stop >> "$OUT" 2>&1; echo "fire hold released (exit) $(date -u "+%H:%MZ")" >> "$OUT"' EXIT
echo "fire hold on $(date -u '+%H:%MZ'); landing $TAG" >> "$OUT"
GR_LAND_LOAD_MAX=${GR_LAND_LOAD_MAX:-40} /bin/bash scripts/attended/land-queue.sh /bin/bash scripts/attended/land.sh "$CFG" >> "$OUT" 2>&1 &
LP=$!
for i in $(seq 1 720); do grep -qE "^verdict:" "$G" 2>/dev/null && break; kill -0 $LP 2>/dev/null || break; sleep 15; done
bash scripts/attended/fire-hold.sh stop >> "$OUT" 2>&1; echo "fire hold released at the verdict ($(grep -E '^verdict:' "$G" 2>/dev/null | tail -1)) $(date -u '+%H:%MZ')" >> "$OUT"; trap - EXIT
wait $LP; RC=$?; echo "landing wrapper exited rc=$RC $(date -u '+%H:%MZ')" >> "$OUT"; exit $RC
