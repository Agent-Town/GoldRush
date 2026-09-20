#!/usr/bin/env bash
# THE CANONICAL IDLE FLOOR, run exactly the way `scripts/null-floor-anchors.mjs` runs it:
# `gr-sim --policy=idle`, which submits NO orders at all (it never calls submitOrders).
# Two seeds x two repeats; the repeat is the determinism control.
set -u
cd "$(dirname "$0")/../.."
for seed in 01 02; do
  for run in 1 2; do
    printf 'e6-picnic-%s run%s ' "$seed" "$run"
    node scripts/gr-sim.mjs --contract e6-picnic --seed "e6-picnic-$seed" --policy=idle 2>/dev/null | tail -1
  done
done
