#!/bin/bash
# land-queue.sh <cmd...>: run ONE landing at a time (the landing lock ~/.goldrush/land.lock, mkdir-atomic, reclaimed when
# the holder pid is gone), admitted only when the host's 1-minute load average is under GR_LAND_LOAD_MAX (default 20).
# Why (2026-09-25, F-LAND-1): landings and implementer batteries shared one drain lock (dlock.sh); at load 9 it had become a
# six-way queue in which the two landings had waited 61 and 52 minutes behind four batteries, and the lock is not FIFO.
# Batteries keep dlock.sh. Landings serialize among themselves here and gate on LOAD instead, because the only thing a
# concurrent battery can cost a landing is a load-class row, which the drain attributes by reading the log (F-PP3-6).
set -u
LOCK="$HOME/.goldrush/land.lock"; MAX="${GR_LAND_LOAD_MAX:-20}"
until mkdir "$LOCK" 2>/dev/null; do
  H=$(awk '{print $1}' "$LOCK/holder" 2>/dev/null)
  if [ -n "$H" ] && ! kill -0 "$H" 2>/dev/null; then echo "land-queue: reclaiming the landing lock from dead holder $H" >&2; rm -rf "$LOCK"; continue; fi
  sleep 15
done
echo "$$ $(date -u '+%Y-%m-%dT%H:%MZ') $*" > "$LOCK/holder"
trap 'rm -rf "$LOCK"' EXIT
for i in $(seq 1 480); do L1=$(sysctl -n vm.loadavg | awk '{print int($2)}'); [ "$L1" -lt "$MAX" ] && break; sleep 30; done
echo "land-queue: admitted at load $(sysctl -n vm.loadavg) $(date -u '+%H:%MZ')" >&2
"$@"
