#!/bin/bash
# ledger-gap.sh — block until main may be written by the attended session (F-LVC3-9, 2026-09-29).
# A "gap" is: no LIVE fire owns main (tasks/.fire.lock absent, or present only as a landing's hold marker),
# STATUS.md line 1 is not ^ACTIVE, and no attended landing sits between its verdict and LAND-<tag>-DONE
# (that window runs the Node battery ON THE PRIMARY CHECKOUT: a commit there moved HEAD under the
# agent-reels test and reddened the lvc3 battery-on-main with buildId 48cd809ae vs 3bc733cd5).
# Usage: bash scripts/attended/ledger-gap.sh [max-seconds]   (exit 0 = gap now; exit 1 = timed out)
MAX=${1:-5400}; T=0; LAND="$HOME/.goldrush/land"
hold_marker() { [ -f "$HOME/.goldrush/fire-hold-release" ] || [ -f "$HOME/.goldrush/fire-hold" ] || ls "$HOME"/.goldrush/fire-hold-* >/dev/null 2>&1; }
landing_finishing() { for g in "$LAND"/*-gates.txt; do [ -f "$g" ] || continue; t=$(basename "$g" -gates.txt); grep -qE '^verdict: clean' "$g" && ! grep -qE "LAND-$t-DONE" "$g" "$LAND/$t-run.out" 2>/dev/null && return 0; done; return 1; }
while :; do
  live_fire=0; [ -d tasks/.fire.lock ] && ! hold_marker && live_fire=1
  head -1 STATUS.md | grep -qE '^ACTIVE' && live_fire=1
  if [ $live_fire = 0 ] && ! landing_finishing; then exit 0; fi
  [ $T -ge $MAX ] && { echo "ledger-gap: no gap in ${MAX}s (fire=$live_fire finishing=$(landing_finishing && echo yes || echo no))" >&2; exit 1; }
  sleep 20; T=$((T+20))
done
