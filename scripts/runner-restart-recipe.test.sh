#!/bin/bash
# Guard for F-1652-1 / F-1653-1 (s1653, 2026-08-11) — THE RUNNER RESTART RECIPE.
#
# WHAT WENT WRONG: a fire started the lane runner, and a fire shell has no nvm on its PATH.
# The runner was born under-floor (codex 0.133.0 vs the 0.144.1 gpt-5.6 floor) and the factory
# sat FULLY STOPPED for ~5h03m. s1651 landed resolve_codex_bin() so DISPATCH self-heals, but
# two things were still unprotected: the environment a restarted runner hands to its LANE TASKS
# (node/npm/npx come from the runner's inherited PATH — the runner never modifies it), and the
# sibling restart site in health-watch.sh, which did the same bare nohup automatically.
#
# WHAT THIS ASSERTS, in order of how much it matters:
#   1. CLASS — health-watch.sh's auto-remediation routes through the helper, not a bare
#      `nohup bash scripts/lane-runner-v3.sh`. This is the sibling-script hazard; a cure that
#      lives only in the helper leaves the automatic path defective.
#   2. The helper scrubs CLAUDE_CONFIG_DIR *and* CLAUDECODE (else playwright pins LANE runs
#      to workers:1 — fire.md §3.1's mechanism firing in the direction it forbids).
#   3. The helper prepends the resolved client's bin dir to PATH (the node/npm half).
#   4. The helper REFUSES to start a second runner, and never clears the lock by hand.
#   5. FLOOR DRIFT — the helper's CODEX_FLOOR still equals lane-runner-v3.sh's. The helper
#      deliberately does not source the runner, so this is the one thing that can silently rot.
#   6. Red paths 1, 2 and 5 are proven by MANUFACTURING each defect on a scratch copy — a
#      passing guard never executes its violation path, so its green is no evidence about its red.
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# $1/$2 exist ONLY so the red paths can be proven against scratch copies (see 6).
# Default to the live files; gates pass no arguments.
HELPER="${1:-$ROOT/scripts/start-lane-runner.sh}"
HEALTH="${2:-$ROOT/scripts/health-watch.sh}"
RUNNER="$ROOT/scripts/lane-runner-v3.sh"
PROCESSES="$ROOT/scripts/runner-processes.sh"
# s2307 / F-2307-1 — an ABSENT subject is "could not answer" (exit 2), not "answered, and the
# answer refuses" (exit 1). All four are read: HELPER/HEALTH/PROCESSES are parse-checked below,
# RUNNER only at the CODEX_FLOOR drift check (:5), which §2.0b calls the one thing that can
# silently rot — that check already reds on an empty read, so this adds diagnosis, not safety.
# See codex-client-floor.test.sh for the reasoning; sibling convention at
# main-lock-gate-guard.test.sh:29 / lane-dispatch-safety-guard.test.sh:12.
for _subject in "$HELPER" "$HEALTH" "$RUNNER" "$PROCESSES"; do
  [ -r "$_subject" ] || { echo "MISUSE: cannot read $_subject"; exit 2; }
done
fails=0
ok()  { echo "  ok   — $1"; }
skip() { echo "  SKIP — $1"; }
bad() { echo "  FAIL — $1"; fails=$((fails+1)); }

scratch="$(mktemp -d "${TMPDIR:-/tmp}/runner-processes.XXXXXX")" || exit 1
scratch="$(cd "$scratch" && pwd -P)"
fixture_pids=''
cleanup() {
  [ -z "$fixture_pids" ] || kill $fixture_pids 2>/dev/null || true
  sleep 0.1
  [ -z "$fixture_pids" ] || kill -KILL $fixture_pids 2>/dev/null || true
  [ -z "$fixture_pids" ] || wait $fixture_pids 2>/dev/null || true
  rm -rf "$scratch"
}
trap cleanup EXIT HUP INT TERM

echo "runner-restart-recipe guard (F-1652-1 / F-1653-1)"

# --- 0. both scripts still parse ----------------------------------------------------
bash -n "$HELPER" 2>/dev/null && ok "start-lane-runner.sh parses" \
  || { bad "start-lane-runner.sh does not parse"; echo "RESULT: $fails failure(s)"; exit 1; }
bash -n "$HEALTH" 2>/dev/null && ok "health-watch.sh parses" \
  || { bad "health-watch.sh does not parse"; echo "RESULT: $fails failure(s)"; exit 1; }
bash -n "$PROCESSES" 2>/dev/null && ok "runner-processes.sh parses" \
  || { bad "runner-processes.sh does not parse"; echo "RESULT: $fails failure(s)"; exit 1; }

# --- 0a. PROCESS IDENTITY: protocol prose is not a runner ---------------------------
. "$PROCESSES"
printf '%s\n' '#!/bin/bash' 'while :; do sleep 1; done' > "$scratch/not-the-runner.sh"
bash "$scratch/not-the-runner.sh" 'FIRE protocol text mentions scripts/lane-runner-v3.sh' &
prompt_pid=$!; fixture_pids="$fixture_pids $prompt_pid"
sleep 1
if pgrep -f 'lane-runner-v3\.sh' | grep -qx "$prompt_pid"; then
  ok "old broad pgrep goes red on the prompt carrier"
else
  bad "prompt carrier did not exercise the old broad pgrep false positive"
fi
if runner_pids | grep -qx "$prompt_pid"; then
  bad "shared discriminator mistakes protocol prose for a runner"
else
  ok "shared discriminator rejects protocol prose"
fi
# --- 0b. PROCESS IDENTITY: real absolute and relative launches are runners ----------
printf '%s\n' '#!/bin/bash' 'while :; do sleep 1; done' > "$scratch/lane-runner-v3.sh"
bash "$scratch/lane-runner-v3.sh" &
runner_pid=$!; fixture_pids="$fixture_pids $runner_pid"
sleep 1
fixture_matches="$(runner_pids | grep -x "$runner_pid")"
[ "$(printf '%s\n' "$fixture_matches" | grep -cx "$runner_pid")" = "1" ] \
  && ok "shared discriminator finds one absolute-path runner" \
  || bad "shared discriminator did not find the absolute-path runner exactly once"
[ "$(printf '%s\n' "$fixture_matches" | grep -v "^$runner_pid\$" | grep -cx .)" = "0" ] \
  && ok "runner self-exclusion leaves zero fixture runners" \
  || bad "runner self-exclusion left a fixture runner"
kill "$runner_pid" 2>/dev/null; wait "$runner_pid" 2>/dev/null || true
fixture_pids=" $prompt_pid"
(
  cd "$scratch" || exit 1
  exec bash ./lane-runner-v3.sh
) &
runner_pid=$!; fixture_pids="$fixture_pids $runner_pid"
sleep 1
[ "$(runner_pids | grep -cx "$runner_pid")" = "1" ] \
  && ok "shared discriminator accepts a relative runner path" \
  || bad "shared discriminator rejected the relative runner path"

# --- 0c. CUSTODY: execute the real helper from a PTY against an isolated runner -------
isolated="$scratch/isolated"
mkdir -p "$isolated"
printf '%s\n' \
  '#!/bin/bash' \
  'if [ "${FAKE_REPLACE:-0}" = 1 ]; then' \
  '  FAKE_REPLACE=0 bash "$0" &' \
  '  echo $! > "$REPLACEMENT_PID_FILE"' \
  '  exit 0' \
  'fi' \
  'if [ "${IGNORE_TERM:-0}" = 1 ]; then trap : TERM; else trap '\''exit 0'\'' TERM; fi' \
  'while :; do sleep 1; done' > "$isolated/lane-runner-v3.sh"
printf '%s\n' \
  '#!/bin/bash' \
  'runner_pids() {' \
  '  local pid' \
  '  ps -axo pid=,comm= | awk '\''$2 ~ /(^|\/)bash$/ { print $1 }'\'' | while read -r pid; do' \
  "    lsof -a -p \"\$pid\" -d 255 -Fn 2>/dev/null | grep -Fqx 'n$isolated/lane-runner-v3.sh' && echo \"\$pid\"" \
  '  done' \
  '}' > "$scratch/runner-processes.sh"

script_probe_out="$scratch/script-probe.out"
/usr/bin/script -q /dev/null /usr/bin/true > "$script_probe_out" 2>&1
script_probe_rc=$?
script_probe_text=$(cat "$script_probe_out")
if [ "$script_probe_rc" -ne 0 ]; then
  script_probe_reason="/usr/bin/script is unusable in this shell (rc=$script_probe_rc)"
  [ -z "$script_probe_text" ] || script_probe_reason="$script_probe_reason: $script_probe_text"
  skip "real helper custody not run: $script_probe_reason"
  skip "substitute-runner custody not run: $script_probe_reason"
else
/usr/bin/script -q /dev/null /usr/bin/env \
  GOLD_RUSH_ROOT="$ROOT" LANE_RUNNER_PROCESSES_SCRIPT="$scratch/runner-processes.sh" \
  LANE_RUNNER_SCRIPT="$isolated/lane-runner-v3.sh" LANE_RUNNER_LOG="$scratch/control.log" \
  /bin/bash "$HELPER" > "$scratch/control.out" 2>&1
control_pid=$(sed -n 's/.*runner UP at pid \([0-9][0-9]*\).*/\1/p' "$scratch/control.out" | tail -1)
fixture_pids="$fixture_pids $control_pid"
control_ppid=$(ps -o ppid= -p "$control_pid" | tr -d ' ')
control_tty=$(ps -o tty= -p "$control_pid" | tr -d ' ')
if grep -q 'OK —' "$scratch/control.out" && runner_pids | grep -qx "$control_pid" && \
   [ "$control_ppid" = "1" ] && [ "$control_tty" = "??" ]; then
  ok "real helper launched its recorded PID at PPID 1 with no controlling terminal"
else
  bad "real helper custody failed: pid=${control_pid:-none} PPID=${control_ppid:-gone} TTY=${control_tty:-gone}"
fi
kill -TERM "$control_pid" 2>/dev/null || true
for _ in {1..20}; do runner_pids | grep -qx "$control_pid" || break; sleep 0.1; done

FAKE_REPLACE=1 REPLACEMENT_PID_FILE="$scratch/replacement.pid" \
  /usr/bin/script -q /dev/null /usr/bin/env \
  GOLD_RUSH_ROOT="$ROOT" LANE_RUNNER_PROCESSES_SCRIPT="$scratch/runner-processes.sh" \
  LANE_RUNNER_SCRIPT="$isolated/lane-runner-v3.sh" LANE_RUNNER_LOG="$scratch/replacement.log" \
  /bin/bash "$HELPER" > "$scratch/replacement.out" 2>&1
replacement_pid=$(cat "$scratch/replacement.pid")
fixture_pids="$fixture_pids $replacement_pid"
if grep -q 'FAILED — no runner process' "$scratch/replacement.out" && ! grep -q 'OK —' "$scratch/replacement.out"; then
  ok "helper rejects a substitute runner instead of verifying the wrong PID"
else
  bad "helper accepted a substitute runner after its recorded PID exited"
fi
kill -TERM "$replacement_pid" 2>/dev/null || true
for _ in {1..20}; do runner_pids | grep -qx "$replacement_pid" || break; sleep 0.1; done
fi

stop_block=$(sed -n '/^stop_rejected_runner() {/,/^}/p' "$HELPER" | sed -e 's/#.*//' -e '/echo /d')
if printf '%s\n' "$stop_block" | grep -q 'kill -TERM "$1"' && \
   printf '%s\n' "$stop_block" | grep -q 'kill -0 "$1"' && \
   printf '%s\n' "$stop_block" | grep -q 'kill -KILL "$1"'; then
  ok "rejected-runner cleanup waits for exit and has bounded KILL escalation"
else
  bad "rejected-runner cleanup can return while the rejected runner is still alive"
fi
printf '%s\n' "$stop_block" > "$scratch/stop-rejected-runner.sh"
. "$scratch/stop-rejected-runner.sh"
IGNORE_TERM=1 bash "$isolated/lane-runner-v3.sh" &
runner_pid=$!; fixture_pids="$fixture_pids $runner_pid"
sleep 1
if stop_rejected_runner "$runner_pid" && ! runner_pids | grep -qx "$runner_pid"; then
  ok "rejected-runner cleanup returns only after the runner is gone"
else
  bad "rejected-runner cleanup returned with its runner still alive"
fi

# --- 1. CLASS: the automatic restart path goes through the helper --------------------
if grep -qE '^[[:space:]]*nohup[[:space:]]+bash[[:space:]]+scripts/lane-runner-v3\.sh' "$HEALTH"; then
  bad "health-watch.sh still restarts the runner with a bare nohup (inherits launchd's PATH)"
else
  ok "health-watch.sh has no bare nohup restart of lane-runner-v3.sh"
fi
if grep -q 'start-lane-runner\.sh' "$HEALTH"; then
  ok "health-watch.sh routes its restart through start-lane-runner.sh"
else
  bad "health-watch.sh does not call start-lane-runner.sh — the auto path is unprotected"
fi

# --- 2. the fire-shell markers are scrubbed -----------------------------------------
if grep -qE 'unset[[:space:]]+.*CLAUDE_CONFIG_DIR' "$HELPER" && \
   grep -qE 'unset[[:space:]]+.*CLAUDECODE' "$HELPER"; then
  ok "helper unsets CLAUDE_CONFIG_DIR and CLAUDECODE"
else
  bad "helper does not unset both CLAUDE_CONFIG_DIR and CLAUDECODE (lanes would pin to workers:1)"
fi

# --- 3. the resolved client's bin dir is prepended to PATH ---------------------------
if grep -qE 'export[[:space:]]+PATH="\$CODEX_DIR:\$PATH"' "$HELPER"; then
  ok "helper prepends the resolved client's bin dir to PATH (carries node/npm/npx)"
else
  bad "helper does not prepend the resolved bin dir to PATH — lane gates keep the caller's node"
fi

# --- 4. it refuses a second runner, and never clears the lock ------------------------
if grep -q 'REFUSING — a lane runner is already alive' "$HELPER"; then
  ok "helper refuses when a runner is already alive"
else
  bad "helper has no live-runner refusal — two runners on one queue set"
fi
# Strip comments and echo/printf lines FIRST: the helper WARNS about this exact command in
# prose ("Do NOT rmdir tasks/.runner.lock"), and a naive grep matches the warning and reds on
# correct code. Caught by this guard on its own first run — the probe must see what the shell
# would EXECUTE, not what the file says about it.
if sed -e 's/#.*//' -e '/echo/d' -e '/printf/d' "$HELPER" | grep -qE 'rmdir[[:space:]]+.*\.runner\.lock'; then
  bad "helper clears the runner lock by hand — the F-1652-1 trap (the runner self-heals corpses)"
else
  ok "helper never rmdir's the runner lock"
fi

# --- 5. FLOOR DRIFT between the helper and the runner --------------------------------
helper_floor=$(grep -m1 '^CODEX_FLOOR=' "$HELPER" | cut -d'"' -f2)
runner_floor=$(grep -m1 '^CODEX_FLOOR=' "$RUNNER" | cut -d'"' -f2)
if [ -z "${helper_floor:-}" ] || [ -z "${runner_floor:-}" ]; then
  bad "could not read CODEX_FLOOR from helper ('${helper_floor:-}') and/or runner ('${runner_floor:-}')"
elif [ "$helper_floor" = "$runner_floor" ]; then
  ok "CODEX_FLOOR agrees: helper $helper_floor == runner $runner_floor"
else
  bad "CODEX_FLOOR DRIFT: helper $helper_floor != runner $runner_floor"
fi

# --- 6. F-2137-1: STALE-RUNNER reporting, exercised in BOTH directions ---------------
# A live runner executes the parse it loaded at exec time, so commits to the runner script
# since are INERT. s2136 read the file, believed the cure was live, and dispatched into a
# process that had never contained it (64 refusals in 12 min). The reporter turns process
# age vs. commit time into a verdict. Tested BEHAVIOURALLY, not by grepping for its name:
# the function is extracted from the shipped helper so the probe cannot drift from it, and
# both arms are built from real processes and real commits in a throwaway repo.
stale_fn=$(sed -n '/^report_runner_staleness() {/,/^}/p' "$HELPER")
note_fn=$(sed -n '/^runner_staleness_note() {/,/^}/p' "$ROOT/scripts/health-watch.sh")
if ! grep -q '^runner_inert_commits() {' "$ROOT/scripts/runner-processes.sh"; then
  bad "runner_inert_commits is not in the SHARED runner-processes.sh — two implementations drift"
else
  ok "staleness computation lives in the shared runner-processes.sh (one implementation)"
fi
# Assert the CALL SITE, not the mere presence of the name: the function's own definition
# contains its name, so a grep for the name stays green after the call is deleted. Proven by
# manufacturing exactly that — removing the call left this case green until it keyed on the
# `runner :` line itself. "Defined" and "wired" are different facts (the gate-caller lesson).
if [ -z "$note_fn" ]; then
  bad "health-watch has no runner_staleness_note — the verdict reaches no reader (F-2137-1)"
elif ! grep -E '^[[:space:]]*echo "runner : ' "$ROOT/scripts/health-watch.sh" | grep -q 'runner_staleness_note'; then
  bad "health-watch's runner line does not CALL runner_staleness_note — defined but not wired"
else
  ok "health-watch's runner line calls runner_staleness_note (wired, not merely defined)"
fi
if [ -z "$stale_fn" ]; then
  bad "helper has no report_runner_staleness — a stale runner reports as healthy (F-2137-1)"
else
  stale_tmp=$(mktemp -d "${TMPDIR:-/tmp}/stale-runner.XXXXXX")
  (
    cd "$stale_tmp" || exit 1
    git init -q . 2>/dev/null
    git config user.email t@t; git config user.name t
    printf 'v1\n' > runner.sh
    mkdir -p scripts
    # RED arm: process starts FIRST, every commit lands AFTER -> those commits are inert.
    sleep 60 & red_pid=$!
    sleep 1
    cp runner.sh scripts/lane-runner-v3.sh
    git add runner.sh scripts/lane-runner-v3.sh && git commit -qm "cure the runner"
    # 24 more commits so the BOUNDEDNESS case is not vacuous: with a single commit the -n 10 cap
    # never engages and removing it still passes. Caught by manufacturing that exact defect.
    i=2
    while [ "$i" -le 25 ]; do
      printf 'v%s\n' "$i" > runner.sh
      cp runner.sh scripts/lane-runner-v3.sh
      git add runner.sh scripts/lane-runner-v3.sh && git commit -qm "cure the runner $i"
      i=$((i + 1))
    done
    # GREEN arm: process starts AFTER the newest commit -> it loaded the current file.
    # Started here, once every commit is in, so BOTH probed paths are current for it.
    sleep 1
    sleep 60 & green_pid=$!
    # Every generated path is QUOTED: this repo's root is "/…/Gold Rush" and an unquoted
    # `. /…/Gold Rush/scripts/…` sources "/…/Gold" with an argument. Caught by this case
    # going red on its first run — the probe must survive the path the repo actually has.
    printf '. "%s"\nROOT="%s"\nRUNNER_SCRIPT="%s/runner.sh"\n%s\nreport_runner_staleness "$1"\n' \
      "$ROOT/scripts/runner-processes.sh" "$stale_tmp" "$stale_tmp" "$stale_fn" > probe.sh
    red_out=$(bash probe.sh "$red_pid" 2>&1);   red_rc=$?
    green_out=$(bash probe.sh "$green_pid" 2>&1); green_rc=$?
    # The health-watch annotation is a thin formatter over the same primitive — which is
    # exactly where a bug hides, so exercise it rather than trusting the shared green.
    # runner_pids is stubbed to each arm's pid; the script path is the fixture's.
    # The stub must echo the SCRIPT's $1, not the function's — inside runner_staleness_note
    # the call `runner_pids` passes no arguments, so a naive `echo "$1"` stub yields an empty
    # pid and the note goes silent in BOTH arms, i.e. it passes the green case for the wrong
    # reason. Caught by the red arm refusing to fire.
    printf '. "%s"\nROOT="%s"\nPID_UT="$1"\nrunner_pids() { echo "$PID_UT"; }\n%s\nrunner_staleness_note; echo\n' \
      "$ROOT/scripts/runner-processes.sh" "$stale_tmp" "$note_fn" > note.sh
    note_red=$(bash note.sh "$red_pid" 2>&1)
    note_green=$(bash note.sh "$green_pid" 2>&1)
    kill "$red_pid" "$green_pid" 2>/dev/null || true
    printf '%s\n---SPLIT---\n%s\n---SPLIT---\n%s %s\n---SPLIT---\n%s\n---SPLIT---\n%s\n' \
      "$red_out" "$green_out" "$red_rc" "$green_rc" "$note_red" "$note_green"
  ) > "$stale_tmp/result.txt" 2>/dev/null
  # section N of the ---SPLIT----delimited result (1-based); robust for any number of sections
  section() { awk -v want="$1" 'BEGIN{n=1} /^---SPLIT---$/{n++; next} n==want{print}' "$stale_tmp/result.txt"; }
  red_out=$(section 1)
  green_out=$(section 2)
  rcs=$(section 3 | tr -d '\n')
  note_red=$(section 4)
  note_green=$(section 5)
  if printf '%s' "$note_red" | grep -q 'STALE'; then
    ok "health-watch runner line goes STALE when the process predates the script"
  else
    bad "health-watch runner line stayed silent on a stale runner — ALIVE read as CURRENT"
  fi
  if [ -z "$(printf '%s' "$note_green" | tr -d '[:space:]')" ]; then
    ok "health-watch runner line is silent when the runner is current (no noise)"
  else
    bad "health-watch annotates a CURRENT runner — a line that always warns stops being read: $note_green"
  fi
  if printf '%s' "$red_out" | grep -q 'STALE RUNNER'; then
    ok "stale runner (process older than the newest runner-script commit) is REPORTED"
  else
    bad "stale runner NOT reported — an inert cure reads as live (F-2137-1): $(printf '%s' "$red_out" | head -1)"
  fi
  if printf '%s' "$green_out" | grep -q 'no inert commits'; then
    ok "fresh runner is reported as current (no false STALE alarm)"
  else
    bad "fresh runner mis-reported — a WARN that cries wolf gets excused away: $(printf '%s' "$green_out" | head -1)"
  fi
  if [ "$rcs" = "0 0" ]; then
    ok "staleness report is WARN-only (rc 0 both arms) — never blocks a restart"
  else
    bad "staleness report changed exit codes ($rcs) — it must report, never block"
  fi
  if [ "$(printf '%s\n' "$red_out" | wc -l | tr -d ' ')" -le 20 ]; then
    ok "staleness report is bounded (<=20 lines)"
  else
    bad "staleness report is unbounded — an unread report is not a report"
  fi
  rm -rf "$stale_tmp"
fi

echo "RESULT: $fails failure(s)"
[ "$fails" -eq 0 ] || exit 1
