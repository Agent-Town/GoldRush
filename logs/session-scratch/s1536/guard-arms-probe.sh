#!/usr/bin/env bash
# s1536 / F-1536-1 — exercise the NEW dry-board guard's lane loop on all four arms.
# Replicates scripts/fire-runner.sh:63.. verbatim; does NOT invoke fire-runner.sh
# (that would take the fire lock and spawn a model call).
# Preserved per the Retention Law.
set -u
cd "/Users/robin/Claude/Projects/Gold Rush" || exit 1

lane_loop() { # $1 = helper path to use ("" = simulate missing); $2 = override list ("SKIP"=use real)
  dry=1
  helper="$1"
  if [ -n "$helper" ] && [ -r "$helper" ]; then
    . "$helper"
    if [ "$2" != "SKIP" ]; then LANE_BRANCHES="$2"; else LANE_BRANCHES="$(lane_branches)"; fi
    if [ -z "$LANE_BRANCHES" ]; then
      dry=0
    else
      for b in $LANE_BRANCHES; do
        [ "$(git rev-list --count "origin/main..$b" 2>/dev/null || echo 1)" != "0" ] && dry=0
      done
    fi
  else
    dry=0
  fi
  echo "$dry"
}

echo "ARM 1  real lanes, helper present      -> dry=$(lane_loop scripts/lane-branches.sh SKIP)   (expect 1: no lane is ahead)"
echo "ARM 2  helper MISSING                  -> dry=$(lane_loop /nonexistent/lane-branches.sh SKIP)   (expect 0: fail open)"
echo "ARM 3  helper present, resolves EMPTY  -> dry=$(lane_loop scripts/lane-branches.sh '')   (expect 0: fail open)"
echo "ARM 4  OLD hardcoded list (the defect) -> dry=$(lane_loop scripts/lane-branches.sh 'lane/m3 lane/m4 lane/e2-arsenal lane/perf')   (expect 0: THE BUG)"
echo "ARM 5  a genuinely ahead lane          -> dry=$(lane_loop scripts/lane-branches.sh 'lane/m3')   (expect 0: real work must run the fire)"
