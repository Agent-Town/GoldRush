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
fails=0
ok()  { echo "  ok   — $1"; }
bad() { echo "  FAIL — $1"; fails=$((fails+1)); }

scratch="$(mktemp -d "${TMPDIR:-/tmp}/runner-processes.XXXXXX")" || exit 1
fixture_pids=''
cleanup() {
  [ -z "$fixture_pids" ] || kill $fixture_pids 2>/dev/null || true
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

echo "RESULT: $fails failure(s)"
[ "$fails" -eq 0 ] || exit 1
