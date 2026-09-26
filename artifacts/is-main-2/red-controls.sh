#!/bin/bash
# is-main-2: every non-hash red of the locked batch, run on CLEAN-MAIN bytes (f99bb77f3) and on the
# branch (HEAD), side by side, in this same worktree. The swap is the set of files the branch changed
# outside artifacts/ (git diff --name-only f99bb77f3 HEAD), restored to HEAD bytes afterwards and
# checked. Node-only tests and read-only guards: no lock needed.
set -u
export PATH=/opt/homebrew/bin:$PATH
cd /Users/robin/Claude/Projects/wt-im2 || exit 2
SP=${IM2_SCRATCH:?}
BASE=f99bb77f3
git diff --name-only "$BASE" HEAD -- . ':!artifacts' > "$SP/swap-files.txt"
TESTS="scripts/ledger-backup-pull.test.mjs scripts/ledger-backup-fill-gaps-guard.test.mjs scripts/ledger-pull-supply-window-guard.test.mjs scripts/ledger-mirror-freshness-guard.test.mjs scripts/desk-declaration-guard.test.mjs scripts/node-guards-contention.test.mjs"
GUARDS="scripts/desk-declaration-guard.mjs scripts/desk-birth-guard.mjs scripts/desk-carryforward-guard.mjs"
measure() { # label
  echo "== $1: $(git diff --name-only | wc -l | tr -d ' ') tracked file(s) differ from HEAD; load $(sysctl -n vm.loadavg | tr -d '{}')"
  for t in $TESTS; do
    node --test "$t" > "$SP/ctl.log" 2>&1; rc=$?
    counts=$(grep -E '^ℹ (pass|fail) ' "$SP/ctl.log" | tr '\n' ' ')
    first=$(grep -m1 -oE 'GR_DROPLET_HOST missing[^"]{0,40}|did not stay quiet[^"]{0,20}|CONTENDED[^"]{0,40}|REFUSING[^"]{0,60}' "$SP/ctl.log")
    echo "   $t rc $rc | $counts| ${first:-}"
  done
  for g in $GUARDS; do
    node "$g" > "$SP/ctl.log" 2>&1; rc=$?
    echo "   node $g rc $rc | $(grep -m1 -oE 'REFUSING[^.]*' "$SP/ctl.log")"
  done
}
measure "HEAD $(git rev-parse --short HEAD) (the branch)"
while IFS= read -r f; do git show "$BASE:$f" > "$f"; done < "$SP/swap-files.txt"
measure "CLEAN MAIN $BASE bytes ($(wc -l < "$SP/swap-files.txt" | tr -d ' ') files swapped)"
while IFS= read -r f; do git show "HEAD:$f" > "$f"; done < "$SP/swap-files.txt"
echo "restored: $(git diff --name-only | wc -l | tr -d ' ') tracked file(s) differ from HEAD"
echo "main's STATUS.md line 1 equals this branch's: $( [ "$(git show main:STATUS.md | head -1)" = "$(head -1 STATUS.md)" ] && echo yes || echo NO ); commits on main since the base: $(git rev-list --count $BASE..main)"
