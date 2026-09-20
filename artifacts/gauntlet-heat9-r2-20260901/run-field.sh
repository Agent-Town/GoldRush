#!/bin/sh
set -u

rider=$1
base='/Users/robin/Claude/Projects/Gold Rush/worktrees/lane-b/artifacts/gauntlet-heat9-r2-20260901'

for contract in the-claim e1-night-shift e2-hill-mine e1-baron; do
  case "$contract" in
    the-claim) seed=e1-the-claim-01 ;;
    *) seed=$contract-01 ;;
  esac
  dir="$base/$rider/$contract"
  mkdir -p "$dir"
  attempt=1
  while [ "$attempt" -le 3 ]; do
    continuation=
    [ "$attempt" -gt 1 ] && continuation=continuation
    echo "START $rider $contract attempt-$attempt"
    node "$base/rider-driver.mjs" "$rider" "$contract" "$seed" \
      "$dir/attempt-$attempt.tape.json" "$dir/attempt-$attempt.log" \
      "$dir/attempt-$attempt.reasoning.md" $continuation
    status=$?
    echo "END $rider $contract attempt-$attempt status=$status"
    if [ "$status" -eq 0 ] && [ -f "$dir/attempt-$attempt.tape.json" ] && \
       [ "$(jq -r '.outcome.secured' "$dir/attempt-$attempt.tape.json")" = true ]; then
      echo "SECURED $rider $contract attempt-$attempt"
      break
    fi
    attempt=$((attempt + 1))
  done
done
