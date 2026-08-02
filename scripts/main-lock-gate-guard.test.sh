#!/bin/bash
# s1402 / F-1402-1 — guard for the runner's MAIN-SLOT LOCK GATE (scripts/lane-runner-v3.sh).
#
# The gate decides whether the lane runner may dispatch a task into the main slot (= the repo
# root working tree) while a fire holds STATUS.md line-1. It has two failure directions, and they
# are not symmetric:
#   FALSE-BLOCK   -> main starved while nothing holds it. Costs throughput. (The s1393..s1402 bug:
#                   §4's line-2 archive bullet satisfied a `head -2` read of the gate.)
#   FALSE-RELEASE -> runner dispatches into a tree a fire owns. Costs correctness — two writers on
#                   main at once, the Mistake #12 / §6 serialisation shape.
#
# This test does NOT re-implement the predicate. Re-implementing it would measure a copy and stay
# green while the runner rotted. It EXTRACTS the live condition from lane-runner-v3.sh and
# evaluates that, so editing the runner edits what is under test.
#
# Exit 0 = gate correct on every fixture. Exit 1 = at least one wrong verdict. Exit 2 = misuse.
set -u

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RUNNER="$ROOT/scripts/lane-runner-v3.sh"

[ -r "$RUNNER" ] || { echo "MISUSE: cannot read $RUNNER"; exit 2; }

# The gate must read line 1 ONLY. A `head -2` (or more) re-opens the false-block class no matter
# how the string match is written, so assert the read width structurally as well as behaviourally.
if grep -q 'head -2 "\$ROOT/STATUS.md"' "$RUNNER"; then
  echo "FAIL(structure): the main-lock gate reads head -2; the lock lives on line 1 only (F-1402-1)"
  exit 1
fi

cond=$(grep -o '\[\[ "\$l1" == .*\]\]' "$RUNNER" | head -1)
[ -n "$cond" ] || { echo "MISUSE: could not extract the gate condition from $RUNNER"; exit 2; }

fail=0
check() { # check <expected HOLD|FREE> <description> <line-1 text>
  local want="$1" desc="$2" l1="$3" got
  if eval "if $cond; then true; else false; fi"; then got=HOLD; else got=FREE; fi
  if [ "$got" != "$want" ]; then
    echo "FAIL: expected $want, got $got — $desc"
    echo "      line-1: ${l1:0:100}"
    fail=1
  fi
}

# --- lock lines: every historical form a fire has actually written. All must HOLD. ---
check HOLD "form 1 lock (§1.2 canonical, s1402)" \
  'ACTIVE 2026-08-02T20:37Z (s1402 fire) — draining the twin-banks cure'
check HOLD "form 2 lock (s1393/s1398: stamp after ACTIVE)" \
  'Last updated: ACTIVE 2026-08-02T14:41Z (s1393 fire) — drain lane-c e1-claim-geometry'
# The form the OLD `grep "ACTIVE 2"` gate could not see: 31 of 58 measured lock states looked
# like this, and every one of them left main open to dispatch. This is the false-release fixture.
check HOLD "form 3 lock (s1392: ACTIVE after the session tag) — the false-release case" \
  'Last updated: 2026-08-02T14:14Z (s1392 fire) ACTIVE — draining e1-headless-the-claim-reland'
check HOLD "stamp refresh mid-fire (§2 orders these after each drain)" \
  'ACTIVE 2026-08-02T18:19Z (s1398 fire) — refresh after drain 1'

# --- handoff lines: main is free. ---
check FREE "plain handoff (§4)" \
  'Last updated: 2026-08-02T20:25Z s1401 handoff, lock CLEARED — nothing to drain'
# A handoff's prose quotes other sessions freely, including the word ACTIVE and past stamps.
# This is why the gate keys on "lock CLEARED" and not on the absence of "ACTIVE".
check FREE "handoff whose prose quotes an ACTIVE stamp — the false-block case" \
  'Last updated: 2026-08-02T20:25Z s1401 handoff, lock CLEARED — s1400 wrote ACTIVE 2026-08-02T19:14Z and died'

# --- fail-safe direction: a malformed handoff must HOLD main, never open it. ---
check HOLD "malformed handoff missing 'lock CLEARED' must fail SAFE (hold, not release)" \
  'Last updated: 2026-08-02T21:00Z s1403 handoff — ACTIVE work described but the clear phrase is absent'

if [ "$fail" -eq 0 ]; then
  echo "PASS: main-lock gate correct on 7 fixtures (4 lock forms hold, 2 handoff forms release, 1 fails safe)"
  exit 0
fi
echo "main-lock gate is WRONG — see failures above"
exit 1
