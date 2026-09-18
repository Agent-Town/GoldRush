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

# s1659 / F-1659-2 — WIDENED from one predicate to the CLASS. `scripts/health-watch.sh`
# asks the same "is line-1 a live lock?" question for its stale-lock alarm, with its own
# copy. F-1402-1 cured the runner's copy in s1402; the sibling sat uncured for 257 fires
# and was measurably worse in BOTH directions (11 of 324 real locks missed, 134 of 1432
# handoffs false-positive). Both are now extracted and evaluated against the SAME fixtures
# below, so a future cure to one cannot silently leave the other behind.
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RUNNER="$ROOT/scripts/lane-runner-v3.sh"
HEALTH="$ROOT/scripts/health-watch.sh"

[ -r "$RUNNER" ] || { echo "MISUSE: cannot read $RUNNER"; exit 2; }
[ -r "$HEALTH" ] || { echo "MISUSE: cannot read $HEALTH"; exit 2; }

# The gate must read line 1 ONLY. A `head -2` (or more) re-opens the false-block class no matter
# how the string match is written, so assert the read width structurally as well as behaviourally.
if grep -q 'head -2 "\$ROOT/STATUS.md"' "$RUNNER"; then
  echo "FAIL(structure): the main-lock gate reads head -2; the lock lives on line 1 only (F-1402-1)"
  exit 1
fi

# The stale-lock alarm must not carry the retired anchored-prefix regex. That form cannot see
# a lock line whose ACTIVE is not at the start (11 of 324 real locks in STATUS.md), so assert
# its absence structurally as well as behaviourally — a missed lock is silent by nature.
# Strip comments first. The cure's own comment NAMES the retired regex (that is how this
# factory records provenance, and the RETENTION ethos says preserve it) — a bare grep reads
# that disclaimer as a declaration and reds a correct file. Caught by this guard on its first
# run against the fixed script: the F-1655-3 shape, reproduced inside the cure for it.
if grep -v '^[[:space:]]*#' "$HEALTH" | grep -q "'\^Last updated\.\*ACTIVE"; then
  echo "FAIL(structure): health-watch.sh still uses the anchored '^Last updated.*ACTIVE' regex (F-1659-2)"
  exit 1
fi

# s2632 / F-2632-1 — THE THIRD MEMBER OF THIS CLASS. scripts/fire-runner.sh's dry-board guard
# also reads STATUS line-1 to decide whether a lock is live, with its own copy, and it still
# carries the pre-F-1402-1 literal `grep -q "lock ACTIVE"` — measured s2632 to match 18 of 500
# archived lock line-1s, i.e. missing ~96.5%. The comment block above that line (F-1659-2's own
# promise was that "a future cure to one cannot silently leave the other behind"; this one was
# left behind for 1174 fires) is the F-2358-1 lesson landing on this very guard.
# It is DELIBERATELY NOT added to the behavioural fixtures below, and that restraint is measured:
# repairing that predicate would boot a SECOND fire alongside a live one past the 50-min LOCKDIR
# reap (3.8% of 5383 measured runs), so the fix is owner-gated on desk F-2632-2. This guard's job
# is only to stop the divergence from becoming SILENT — either the line carries the house
# predicate (someone acted on the ruling) or the file must carry the F-2632-1 marker that says
# why it does not. Self-retiring in both directions.
# Comments are stripped first for the same reason as the HEALTH check above: the annotation NAMES
# the retired literal, and a bare grep would read that disclaimer as the declaration (F-1655-3).
FIRE="$ROOT/scripts/fire-runner.sh"
[ -r "$FIRE" ] || { echo "MISUSE: cannot read $FIRE"; exit 2; }
fline=$(grep -v '^[[:space:]]*#' "$FIRE" | grep 'head -1 STATUS.md' | grep 'dry=0' | head -1)
[ -n "$fline" ] || { echo "MISUSE: could not find fire-runner.sh's STATUS line-1 read"; exit 2; }
if printf '%s' "$fline" | grep -q '\*ACTIVE\*'; then
  : # cured to the house predicate — the ruling was acted on, nothing owed
elif grep -q 'F-2632-1' "$FIRE"; then
  : # deliberate, documented divergence — the annotation explains why and names the desk item
else
  echo "FAIL(structure): fire-runner.sh reads STATUS line-1 with a predicate that is neither the"
  echo "      house form nor documented as a deliberate divergence (F-2632-1). Do NOT repair it"
  echo "      silently — it is owner-gated on desk F-2632-2, and the naive fix boots a second"
  echo "      fire alongside a live one. See the annotation at that line."
  exit 1
fi

cond=$(grep -o '\[\[ "\$l1" == .*\]\]' "$RUNNER" | head -1)
[ -n "$cond" ] || { echo "MISUSE: could not extract the gate condition from $RUNNER"; exit 2; }
hcond=$(grep -o '\[\[ "\$l1" == .*\]\]' "$HEALTH" | head -1)
[ -n "$hcond" ] || { echo "MISUSE: could not extract the stale-lock condition from $HEALTH"; exit 2; }

fail=0
subject=""
cur_cond=""
check() { # check <expected HOLD|FREE> <description> <line-1 text>
  local want="$1" desc="$2" l1="$3" got
  if eval "if $cur_cond; then true; else false; fi"; then got=HOLD; else got=FREE; fi
  if [ "$got" != "$want" ]; then
    echo "FAIL[$subject]: expected $want, got $got — $desc"
    echo "      line-1: ${l1:0:100}"
    fail=1
  fi
}

fixtures() {
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

# --- F-1659-2: real lock forms lifted VERBATIM from STATUS.md that an anchored-prefix
# predicate cannot see. These are the false-NEGATIVE fixtures — the direction that lets a
# dead lock stall the factory unreported. 11 of 324 archived lock lines look like these. ---
check HOLD "real lock, ACTIVE after the session tag (s908) — anchored-prefix blind spot" \
  's908 fire, lock ACTIVE — re-verify board (expect drain-clean) + stale CODEX-WALL cleanup.'
check HOLD "real lock, doubled stamp (s1274) — anchored-prefix blind spot" \
  '2026-07-30T23:56Z ACTIVE 2026-07-30T23:56Z (s1274 fire) — transcribe drainNotes onto stopped leaves.'
check HOLD "real lock, bare stamp then ACTIVE (s894-era) — anchored-prefix blind spot" \
  '2026-07-22T11:27Z ACTIVE — drain the fresh second-rider done-move (lane/m4 d9a15e73).'

# --- F-1659-2: a handoff whose prose discusses the lock mechanism itself. The modern house
# voice does this constantly (15 of the last 98 handoffs), and each one is a false alarm
# telling a reader a dead lock needs reclaiming when the board is cleanly handed off. ---
check FREE "handoff discussing the ACTIVE predicate in prose — the modern false-alarm case" \
  'Last updated: 2026-08-11T14:20Z s1658 handoff, lock CLEARED — desk-declaration correctly SKIPs under a live ACTIVE lock'
}

# Both scripts ask the same question; evaluate both against the same fixtures (F-1659-2).
subject="lane-runner-v3.sh (main-slot dispatch gate)"; cur_cond="$cond";  fixtures
subject="health-watch.sh (stale-lock alarm)";          cur_cond="$hcond"; fixtures

if [ "$fail" -eq 0 ]; then
  echo "PASS: both lock predicates correct on 11 fixtures each (7 hold incl. 3 anchored-prefix blind spots, 3 release, 1 fails safe)"
  exit 0
fi
echo "a lock predicate is WRONG — see failures above"
exit 1
