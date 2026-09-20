#!/bin/zsh
# HEAT 13 QUEUE — one ride at a time, in the master's order, nice'd (other implementers share this host).
# ADAPTED FROM HEAT 12: (1) the queue file is an argument so a second block can follow the first
# without editing the script; (2) a DISK GUARD before every ride — heat 12's F-HEAT12-3 recorded a
# host-wide out-of-diskspace that stopped a `git commit` mid-heat, and this host started heat 13 with
# 4.0 GiB free. Under 700 MiB the queue stops rather than half-writing a ride's evidence.
cd "$(dirname "$0")"
QUEUE="${1:-queue.txt}"
MIN_FREE_MB=700
while IFS='|' read -r n contract seed stake gen wall; do
  [ -z "$contract" ] && continue
  FREE_MB=$(df -m /System/Volumes/Data | awk 'NR==2{print $4}')
  if [ "$FREE_MB" -lt "$MIN_FREE_MB" ]; then
    echo "=== QUEUE HALTED before $n $contract: only ${FREE_MB} MiB free (< ${MIN_FREE_MB}) $(date -u +%H:%M:%SZ) ==="
    exit 3
  fi
  echo "=== QUEUE $n $contract (gen $gen, wall ${wall}s, free ${FREE_MB}MiB) $(date -u +%H:%M:%SZ) ==="
  nice -n 5 node ride-one.mjs --n="$n" --contract="$contract" --seed="$seed" --generation="$gen" --stake="$stake" --wall="$wall" 2>&1 | tee "rides/$contract.driver.log"
done < "$QUEUE"
echo "=== QUEUE $QUEUE DRAINED $(date -u +%H:%M:%SZ) ==="
