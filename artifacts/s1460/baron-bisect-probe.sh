#!/bin/bash
# s1460 — bisect predicate for the Baron driver event-log divergence (F-1460-1).
#
# Subject: scripts/gr-sim.test.mjs "the Baron driver runs the declared fight..."
# The pinned expectation (kills 869 / fnv1a32:b9566c6d) was set at 653c7fef, BEFORE the
# bisect window, so the predicate is stable across every commit under test.
#
# Measured before bisecting: GREEN at 80308b70, RED at 57097d8a, and the actual value is
# byte-identical on Node 26.4.0 and 23.11.1 (so this is NOT the cross-engine class).
#
# exit 0   = good (assertion holds)
# exit 1   = bad  (assertion diverges)
# exit 125 = skip (tree could not be evaluated — vite/module failure, not a verdict)

set -u
OUT="$(node --test --test-name-pattern 'Baron driver' scripts/gr-sim.test.mjs 2>&1)"

# An infrastructure failure is NOT a verdict — skip rather than blame the commit.
if ! printf '%s' "$OUT" | grep -q 'Baron driver runs the declared fight'; then
  echo "SKIP: probe never reached the Baron test"
  exit 125
fi

if printf '%s' "$OUT" | grep -qE '^. pass 1'; then
  echo "GOOD: $(git rev-parse --short HEAD)"
  exit 0
fi

echo "BAD:  $(git rev-parse --short HEAD)  $(printf '%s' "$OUT" | grep -o "kills: [0-9]*" | head -2 | tr '\n' ' ')"
exit 1
