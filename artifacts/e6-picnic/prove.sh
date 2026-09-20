#!/usr/bin/env bash
# Both bench seeds, twice each. The repeat is the determinism control: a "secured" claim that does
# not reproduce byte-identically is not a measurement (§F-PROTO-5). `--contract e6-picnic` is
# passed EXPLICITLY on every run — never inherited from a default.
set -u
cd "$(dirname "$0")/../.."
here="artifacts/e6-picnic"
for seed in 01 02; do
  for run in 1 2; do
    printf 'e6-picnic-%s run%s ' "$seed" "$run"
    node "$here/prover.mjs" --contract e6-picnic --seed "e6-picnic-$seed" \
      2>"$here/secure-$seed-run$run.log" | tail -1
  done
done
