#!/bin/zsh
# HEAT 12 QUEUE — one ride at a time, in the master's order, nice'd (other implementers share this host).
cd "$(dirname "$0")"
while IFS='|' read -r n contract seed stake gen wall; do
  [ -z "$contract" ] && continue
  echo "=== QUEUE $n $contract (gen $gen, wall ${wall}s) $(date -u +%H:%M:%SZ) ==="
  nice -n 5 node ride-one.mjs --n="$n" --contract="$contract" --seed="$seed" --generation="$gen" --stake="$stake" --wall="$wall" 2>&1 | tee "rides/$contract.driver.log"
done < queue.txt
echo "=== QUEUE DRAINED $(date -u +%H:%M:%SZ) ==="
