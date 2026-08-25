#!/bin/bash
# Guard for F-1657-1 / F-1700-1 — completed adds commit, baseline dirt does not.
#
# WHAT WENT WRONG (F-1656-1, s1656): the `f1655-1` run ended READY-FOR-GATES with correct output,
# and `lane/a` read `ahead=0` while holding 110 lines of finished work as STAGED-BUT-UNCOMMITTED
# dirt — one refill away from `reset --hard` and Mistake #2. The ART run of the same hour died the
# same way under a different ignored path. Every instrument the LANE-SAFETY LAW points at
# (ahead/behind, main..branch, lane-freeze-classify) is derived from COMMITS, so a staged-only lane
# answers USABLE to "is this safe to refill?" — the exact wrong answer, and the loss would leave no
# trace anyone thinks to check.
#
# WHAT THE CAUSE ACTUALLY WAS — measured s1657, and NOT what F-1656-1 recorded. That finding says
# the add was "rejected" and "aborted" and proposed re-scoping the pathspec to the master's
# TOUCH-ONLY list. Reproduced on a scratch repo, the add does NOT abort: it stages every legitimate
# path, correctly withholds the ignored one, and THEN exits 1 purely to ADVISE that an ignored path
# matched its pathspec. The pathspec was right all along. The `&&` was the defect — it read an
# advisory exit code as a failure and skipped the commit that had already been earned.
#   ARM 1  add -A -- . ':(exclude).wrangler'   -> rc=1, the real file STAGED
#   ARM 5  add && commit  (the old line)       -> work stranded in the index, HEAD unmoved
#   ARM 6  add ;  commit  (the cure)           -> commit rc=0, index clean, ignored path NOT leaked
#
# WHAT THIS ASSERTS, in order of how much it matters:
#   1. BEHAVIOUR — on a scratch repo carrying a gitignored path, the compound form strands the work
#      and the decoupled form commits it without leaking the ignored path. This is F-1656-1's own
#      GATE ("proven by manufacturing the condition on a scratch copy — a green run in a clean tree
#      is not evidence"), and it is checked FIRST because it is the only claim that is about git
#      rather than about our source text.
#   2. CLASS — BOTH commit sites are decoupled, the lane branch and the art branch. A cure that
#      reaches one leaves the sibling defective (the cured-defect-survives-in-the-sibling-script
#      shape that cost F-1154-1 an extra incident).
#   3. The pathspec excludes are still present — decoupling must not become a licence to sweep.
#   4. RED PATH proven by MANUFACTURING the defect on a scratch copy of the runner: a passing guard
#      never executes its violation path, so its green says nothing about its red (s1299/s1300).
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# $1 exists ONLY so the red path can be proven against a scratch copy (see 4).
# Default to the live file; gates pass no arguments.
RUNNER="${1:-$ROOT/scripts/lane-runner-v3.sh}"
SELF_CHECK="${1:-}"
# s2307 / F-2307-1 — an ABSENT subject is "could not answer" (exit 2), not "answered, and the
# answer refuses" (exit 1). See codex-client-floor.test.sh for the reasoning; the sibling
# convention is main-lock-gate-guard.test.sh:29 / lane-dispatch-safety-guard.test.sh:12.
[ -r "$RUNNER" ] || { echo "MISUSE: cannot read $RUNNER"; exit 2; }
fails=0
ok()  { echo "  ok   — $1"; }
bad() { echo "  FAIL — $1"; fails=$((fails+1)); }

echo "runner-commit-decoupling guard (F-1657-1, from F-1656-1)"

# --- 0. the runner still parses -----------------------------------------------------
if bash -n "$RUNNER" 2>/dev/null; then
  ok "lane-runner-v3.sh parses"
else
  bad "lane-runner-v3.sh does not parse"; echo "RESULT: $fails failure(s)"; exit 1
fi

# --- 1. BEHAVIOUR: manufacture the condition and prove both arms --------------------
# Only on the real run — the red-path recursion re-checks source text, not git.
if [ -z "$SELF_CHECK" ]; then
  probe="$(mktemp -d "${TMPDIR:-/tmp}/s1657-guard-XXXXXX")"
  (
    cd "$probe" || exit 1
    git init -q .
    git config user.email guard@local
    git config user.name guard
    printf '.wrangler\n' > .gitignore
    printf 'hello\n' > work.txt
    git add .gitignore work.txt
    git commit -q -m init
    # the condition: an ignored path with content, alongside a finished run's real work
    mkdir -p .wrangler/tmp
    printf 'bundle\n' > .wrangler/tmp/bundle.js
    printf 'FINISHED WORK\n' >> work.txt

    # ARM A — the OLD compound form. Must strand the work.
    # stderr is silenced ONLY so git's "paths are ignored" hint does not print into a gate
    # battery and read as a failure — the condition it advises about is the point of this probe.
    git add -A -- . ':(exclude).wrangler' 2>/dev/null && git commit -q -m "runner(probe): compound" -- . ':(exclude).wrangler'
    head_a="$(git log -1 --format='%s')"
    staged_a="$(git diff --cached --name-only)"

    # ARM B — the CURED decoupled form. Must commit it.
    git add -A -- . ':(exclude).wrangler' 2>/dev/null ; git commit -q -m "runner(probe): decoupled" -- . ':(exclude).wrangler'
    head_b="$(git log -1 --format='%s')"
    staged_b="$(git diff --cached --name-only)"
    files_b="$(git show --stat --format='' HEAD | grep -c 'work.txt')"
    leaked_b="$(git show --stat --format='' HEAD | grep -c 'wrangler')"

    printf '%s\n' "$head_a|$staged_a|$head_b|$staged_b|$files_b|$leaked_b" > "$probe/result"
  )
  if [ -f "$probe/result" ]; then
    IFS='|' read -r head_a staged_a head_b staged_b files_b leaked_b < "$probe/result"
    [ "$head_a" = "init" ] && [ "$staged_a" = "work.txt" ] \
      && ok "DEFECT REPRODUCES: the compound form leaves HEAD at 'init' with work.txt stranded staged" \
      || bad "the compound form did NOT reproduce the defect (head='$head_a' staged='$staged_a') — this guard's premise is stale, re-measure before trusting it"
    [ "$head_b" = "runner(probe): decoupled" ] && [ -z "$staged_b" ] && [ "$files_b" = "1" ] \
      && ok "CURE WORKS: the decoupled form commits the work and leaves the index clean" \
      || bad "the decoupled form did not commit the work (head='$head_b' staged='$staged_b' files='$files_b')"
    [ "$leaked_b" = "0" ] \
      && ok "the ignored path did NOT leak into the decoupled commit" \
      || bad "the decoupled commit leaked an ignored path — the excludes are not holding"
  else
    bad "behavioural probe did not run (git unavailable?)"
  fi
  rm -rf "$probe"
fi

# --- 1b. F-1700-1: a lane commit owns only paths dirtied after dispatch ----------------
if :; then
  delta_probe="$(mktemp -d "${TMPDIR:-/tmp}/s1700-guard-XXXXXX")"
  (
    cd "$delta_probe" || exit 1
    git init -q .
    git config user.email guard@local
    git config user.name guard
    mkdir -p logs
    printf 'clean\n' > '*.txt'
    printf 'tracked\n' > tracked-dirty.txt
    git add '*.txt' tracked-dirty.txt
    git commit -q -m init
    printf 'pre-existing tracked dirt\n' >> tracked-dirty.txt
    printf 'pre-existing raw evidence\n' > logs/raw.json
    baseline="$(mktemp "${TMPDIR:-/tmp}/s1700-baseline-XXXXXX")"
    LANE_RUNNER_COMMIT_PROBE=capture bash "$RUNNER" "$delta_probe" "$baseline"
    cp tracked-dirty.txt 'tracked dirt moved.txt'
    unlink tracked-dirty.txt
    printf 'task output\n' >> '*.txt'
    LANE_RUNNER_COMMIT_PROBE=commit bash "$RUNNER" "$delta_probe" "$baseline" \
      'runner(probe): delta' "$delta_probe/runner.log"
    rm -f "$baseline" "$baseline.ids" "$baseline.hashes"
    git show --name-only --format='' HEAD | sed '/^$/d' > committed
    printf '%s|%s|%s|%s\n' \
      "$(git log -1 --format='%s')" \
      "$(tr '\n' ',' < committed)" \
      "$(git status --porcelain=v1 -z --untracked-files=all | tr '\0' '\n' | sed -n 's/^ D tracked-dirty.txt$/tracked-old/p; s/^?? tracked dirt moved.txt$/tracked-moved/p; s/^?? logs\/raw.json$/raw/p' | sort | tr '\n' ',')" \
      "$(git diff --cached --name-only)" > result
  )
  if IFS='|' read -r delta_head delta_files delta_dirty delta_staged < "$delta_probe/result"; then
    [ "$delta_head" = 'runner(probe): delta' ] && [ "$delta_files" = '*.txt,' ] \
      && [ "$delta_dirty" = 'raw,tracked-moved,tracked-old,' ] && [ -z "$delta_staged" ] \
      && ok "delta commit includes literal *.txt only; moved tracked/raw baseline dirt remains unstaged" \
      || bad "delta ownership failed (head='$delta_head' files='$delta_files' dirty='$delta_dirty' staged='$delta_staged')"
  else
    bad "delta ownership probe did not run"
  fi
  rm -rf "$delta_probe"
fi

# --- 2. CLASS: neither commit site is gated on the add's exit code -------------------
if grep -qE 'git add -A --.*&&[[:space:]]*git commit' "$RUNNER"; then
  bad "a commit site is still gated on the add's rc (\`&& git commit\`) — an ignored path will strand finished work"
else
  ok "no commit site is gated on the add's rc"
fi
sites="$(grep -cE 'git add -A --.*;[[:space:]]*git commit' "$RUNNER")"
if [ "$sites" -eq 2 ] && grep -q 'commit_lane_delta "\$wd" "\$baseline"' "$RUNNER"; then
  ok "both art routes keep the decoupled form and ordinary lanes use the delta boundary"
else
  bad "expected two art decoupled sites plus the ordinary-lane delta boundary (art sites='$sites')"
fi

# --- 3. decoupling did not become a licence to sweep --------------------------------
if grep -q "exclude).wrangler" "$RUNNER" && grep -q "exclude)logs/factory-usage.json" "$RUNNER"; then
  ok "the debris excludes are still in place on the lane commit site"
else
  bad "the .wrangler / factory-usage excludes are gone — F-1108-2 debris would return"
fi

# --- 4. RED PATH: manufacture the defect on a scratch copy of the runner -------------
if [ -z "$SELF_CHECK" ]; then
  scratch="$(mktemp -d "${TMPDIR:-/tmp}/s1657-red-XXXXXX")"
  sed 's/; git commit/\&\& git commit/' "$RUNNER" > "$scratch/lane-runner-v3.sh"
  if bash "$0" "$scratch/lane-runner-v3.sh" >/dev/null 2>&1; then
    bad "RED PATH DID NOT FIRE: a runner with \`&& git commit\` restored still passed this guard"
  else
    ok "red path fires — a runner with the \`&&\` restored is rejected"
  fi
  rm -rf "$scratch"
fi


# --- 5. F-1700-1 RED PATH: restore the old broad lane commit on a runner copy --------
if [ -z "$SELF_CHECK" ]; then
  scratch="$(mktemp -d "${TMPDIR:-/tmp}/s1700-red-XXXXXX")"
  sed 's@commit_lane_delta "$1" "$2" "$3" "$4"@git -C "$1" add -A -- .; git -C "$1" commit -q -m "$3" -- .@' \
    "$RUNNER" > "$scratch/lane-runner-v3.sh"
  if bash "$0" "$scratch/lane-runner-v3.sh" >/dev/null 2>&1; then
    bad "RED PATH DID NOT FIRE: a scratch runner with the old broad commit still passed"
  else
    ok "red path fires — restoring the old broad commit sweeps baseline dirt and is rejected"
  fi
  rm -rf "$scratch"
fi

echo "RESULT: $fails failure(s)"
[ "$fails" -eq 0 ] || exit 1
