#!/bin/bash
# Gold Rush — THE ONE WAY TO START THE LANE RUNNER (F-1652-1 owed clause, discharged s1653).
#
# WHY THIS EXISTS, in one paragraph, because a recipe nobody can see the reason for decays:
# on 2026-08-11 the factory sat FULLY STOPPED for ~5h03m because a fire started the runner and
# a FIRE SHELL has no nvm on its PATH (measured s1652 and re-measured s1653:
#   PATH=/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin  ->  codex 0.133.0
# against Robin's Terminal's nvm v23.11.1 -> codex 0.145.0). Every fire-started runner is born
# under-floor unless something fixes the environment. That something is this script.
#
# WHAT IS AND IS NOT LOAD-BEARING (s1653 — stated because the owed clause overstated the first):
#   * codex     : NO LONGER load-bearing. lane-runner-v3.sh resolve_codex_bin() (:60) picks a
#                 client meeting CODEX_FLOOR before consuming a master, so a wrong-shell restart
#                 SELF-HEALS for dispatch. The PATH prepend here is defence-in-depth for that.
#   * node/npm  : STILL load-bearing, and this is the half the finding did not name. The runner
#                 passes "$codex_bin" explicitly but NEVER modifies PATH (:220), so every
#                 `npm run build` / `npx tsc` / `npx playwright` / `node --test` a lane task runs
#                 resolves from the RUNNER'S inherited PATH. Start it from a fire shell and every
#                 gate in every lane runs under node v26.4.0 instead of the v23.11.1 that produced
#                 all 13 healthy runs and every gate baseline on the board.
#                 (Whether v26 actually breaks the build is UNMEASURED — the point is that it is
#                 a silent, uncontrolled change of interpreter under the evidence, not that it is
#                 known-fatal.)
#   * CLAUDE_CONFIG_DIR / CLAUDECODE : load-bearing, opposite direction. playwright.config.ts
#                 keys `workers: isFireShell ? 1 : undefined` on CLAUDE_CONFIG_DIR being PRESENT.
#                 Leave it set and every LANE run is pinned to one worker — fire.md §3.1's
#                 mechanism firing in exactly the direction it forbids (lanes are ~3.5x faster
#                 at 6 workers, F-1267-1). s1648 scrubbed it correctly; the recipe was just
#                 never written down anywhere.
#
# USAGE:  bash scripts/start-lane-runner.sh          # start it
#         bash scripts/start-lane-runner.sh --check  # report only, start nothing
set -u
ROOT="${GOLD_RUSH_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "$ROOT" || exit 2
CHECK_ONLY=0
[ "${1:-}" = "--check" ] && CHECK_ONLY=1
# The guard overrides these three paths so it can execute this real helper without touching
# the live runner; production uses the defaults.
PROCESSES_SCRIPT="${LANE_RUNNER_PROCESSES_SCRIPT:-$ROOT/scripts/runner-processes.sh}"
. "$PROCESSES_SCRIPT"
RUNNER_SCRIPT="${LANE_RUNNER_SCRIPT:-$ROOT/scripts/lane-runner-v3.sh}"
RUNNER_LOG="${LANE_RUNNER_LOG:-$ROOT/logs/runner-headless.log}"

# Kept in step with lane-runner-v3.sh's CODEX_FLOOR by scripts/runner-restart-recipe.test.sh,
# which reds if the two drift. Deliberately NOT sourced from the runner: sourcing would execute
# it, and copying the whole file would be the sibling-script hazard this repo keeps paying for.
CODEX_FLOOR="0.144.1"

# F-2344-1 (s2344): RECORD THE ENVIRONMENT THIS START IMPOSES, INTO THE DURABLE LOG.
# A runner's inherited PATH decides which node/npm/npx runs every lane gate for its whole
# lifetime (see the load-bearing note at the top of this file), and macOS makes that
# UNRECOVERABLE afterwards: `ps -E` shows no environment even for a process you spawned
# yourself (measured s2344 with a marked control child — the marker was invisible).
# The banners below go to STDOUT, which is durable only when the caller redirects it:
# health-watch.sh:151 does (`>> logs/runner-headless.log`), but §2.0b/§2.0c tell a FIRE to
# run this helper bare, and that stream dies with the fire. Measured s2344 over all 23,062
# lines of the live runner log: the ONLY two [start-lane-runner] lines ever recorded are a
# single REFUSING pair — the success banners have never once landed, and the currently-live
# runner's provenance is therefore genuinely unknown.
# So this writes ONE consolidated, greppable line straight to RUNNER_LOG, on EVERY outcome
# including the happy path (F-2208-1: a record that appears only on failure re-creates the
# ambiguity it removes). It resolves node at CALL time, so it reports the environment as it
# actually stands at that moment rather than what was intended.
# It must never block a restart: an unwritable log degrades to a stdout note, never an exit.
record_env() {
  local verdict="$1" pid="${2:--}" n v stamp
  n="$(command -v node 2>/dev/null || echo none)"
  v="$([ "$n" = none ] || "$n" --version 2>/dev/null || echo '?')"
  stamp="$(date '+%Y-%m-%dT%H:%M:%S%z')"
  local line="[start-lane-runner] ENV $stamp verdict=$verdict pid=$pid floor=$CODEX_FLOOR"
  line="$line codex=${codex_ver:-none}@${codex_bin:-none} node=${v:-?}@$n"
  line="$line CLAUDE_CONFIG_DIR=${CLAUDE_CONFIG_DIR-<unset>} CLAUDECODE=${CLAUDECODE-<unset>}"
  mkdir -p "$(dirname "$RUNNER_LOG")" 2>/dev/null || true
  # The braces are load-bearing: `>>` failing is reported by the SHELL, not by printf, so
  # `printf ... 2>/dev/null` leaves a raw "Permission denied" on stderr beside the clean WARN.
  # Grouping puts the redirection itself inside the silenced compound.
  if ! { printf '%s\n' "$line" >> "$RUNNER_LOG"; } 2>/dev/null; then
    echo "[start-lane-runner] WARN — could not record the environment to $RUNNER_LOG"
    echo "[start-lane-runner]   $line"
  fi
}

# F-2137-1: a LIVE runner executes the parse of RUNNER_SCRIPT it loaded at exec time, so every
# commit to that file since is INERT until someone restarts it. bash parses a `while` body whole
# before running it, which is why editing the live runner is famously "safe but inert" — the half
# nobody had an instrument for is that READING the file is not a measurement of what is RUNNING.
# s2136 simulated the F-2089-1 BUILD-ON-PREDECESSOR predicate read-only against the file on disk
# and against the live lane, got the right answer to the wrong question, and dispatched; the
# process had loaded a 2026-08-12 parse on Aug 18 and the opt-in landed Aug 20, so it REFUSED
# f2136-1 64 times in 12 minutes and had never once executed the cure. The refusal path below
# already PRINTED "Tue Aug 18 20:05:25" on screen — the fact was visible and nothing drew the
# conclusion. This turns that fact into a verdict. WARN-ONLY, never blocking: a stale runner is
# still a working runner, and refusing to report the environment is how a check stops being run.
report_runner_staleness() {
  local pid="$1" lstart n start_epoch
  n=$(runner_inert_commits "$pid" "$ROOT" "$RUNNER_SCRIPT")
  lstart=$(runner_started_at "$pid")
  if [ "${n:-0}" -eq 0 ]; then
    echo "[start-lane-runner] runner pid $pid loaded the CURRENT $(basename "$RUNNER_SCRIPT") — no inert commits."
    return 0
  fi
  start_epoch=$(date -j -f "%a %b %e %H:%M:%S %Y" "$lstart" +%s 2>/dev/null)
  echo "[start-lane-runner] ⚠️  STALE RUNNER — pid $pid started $lstart and is executing that"
  echo "[start-lane-runner]     parse of $(basename "$RUNNER_SCRIPT"). ${n:-?} commit(s) to that file since are INERT:"
  # Bounded on purpose: an unbounded listing is how a report becomes something nobody reads
  # (the status-archive-audit lesson). The real case is 1-3 commits; a huge count is itself news.
  git -C "$ROOT" log --format='  %h %cI %s' --since="@$start_epoch" -n 10 -- "$RUNNER_SCRIPT" 2>/dev/null |
    cut -c1-118 | sed 's/^/[start-lane-runner]   /'
  [ "${n:-0}" -gt 10 ] && echo "[start-lane-runner]     … and $((n - 10)) more (showing the 10 newest)."
  echo "[start-lane-runner]     A cure you can READ in that file is NOT thereby a cure that RUNS."
  echo "[start-lane-runner]     Restart to load them: kill -TERM $pid, wait for the lock, re-run me."
}

ver_ge() {  # $1 >= $2, dotted numeric (BSD awk; no sort -V)
  awk -v a="$1" -v b="$2" 'BEGIN{
    n=split(a,x,"."); m=split(b,y,".");
    for(i=1;i<=3;i++){ xi=(i<=n)?x[i]+0:0; yi=(i<=m)?y[i]+0:0;
      if(xi>yi) exit 0; if(xi<yi) exit 1 }
    exit 0 }'
}

# ---- 1. REFUSE if a runner is already alive. NEVER clear the lock by hand. ----
# lane-runner-v3.sh:120-129 SELF-HEALS a genuine corpse (no other runner process -> rmdir + retake).
# So "another instance running. Remove if stale." at :20 means an instance GENUINELY IS running,
# and `rmdir tasks/.runner.lock` + relaunch yields TWO runners on the same queues. That error
# text invited the one action that compounds the damage (F-1652-1 §3); this is the cure.
others=$(runner_pids | wc -l | tr -d ' ')
if [ "${others:-0}" != "0" ]; then
  echo "[start-lane-runner] REFUSING — a lane runner is already alive:"
  runner_pids | while read -r pid; do ps -o pid=,command= -p "$pid"; done | sed 's/^/[start-lane-runner]   /'
  # F-2137-1: the live runner may be executing a parse older than the file. Say so HERE, where a
  # fire is already looking at it and deciding whether to leave it alone.
  runner_pids | while read -r pid; do report_runner_staleness "$pid"; done
  echo "[start-lane-runner] Do NOT rmdir tasks/.runner.lock — the runner self-heals a real corpse"
  echo "[start-lane-runner] (lane-runner-v3.sh:120-129); a held lock means a LIVE instance."
  echo "[start-lane-runner] To replace it: kill -TERM <pid>  (its trap at :135 releases the lock),"
  echo "[start-lane-runner] wait for the lock to clear, then re-run me."
  # --check is a REPORT, not an action: it must stay runnable while the factory is healthy,
  # otherwise the only time you can exercise this script is the one time it matters.
  [ "$CHECK_ONLY" = "1" ] || exit 1
  echo "[start-lane-runner] --check: continuing to report the environment anyway."
fi

# ---- 2. Resolve a codex client meeting the floor, and take its bin DIR for PATH. ----
# Resolve, never paste: v24.14.0's codex is present but its vendored binary is ENOENT (a corpse
# whose failure is indistinguishable from a wall), so "newest node" selects a broken client.
# Probing --version is what discriminates; a throw disqualifies.
codex_bin=""; codex_ver=""
for c in $(command -v codex 2>/dev/null) "$HOME"/.nvm/versions/node/*/bin/codex; do
  [ -x "$c" ] || continue
  v=$("$c" --version 2>/dev/null | sed -n 's/.*[^0-9.]\([0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*\).*/\1/p' | head -1)
  [ -n "${v:-}" ] || continue
  if ver_ge "$v" "$CODEX_FLOOR"; then codex_bin="$c"; codex_ver="$v"; break; fi
done
if [ -z "$codex_bin" ]; then
  echo "[start-lane-runner] REFUSING — no codex client >= $CODEX_FLOOR on PATH or in ~/.nvm."
  echo "[start-lane-runner] Starting anyway would produce a runner that refuses every dispatch."
  # A refusal is exactly the moment a hand-start follows, so record it durably (F-2344-1):
  # the live log shows a REFUSING followed immediately by two `watching` starts with no
  # successful-helper banner between them — i.e. the forbidden path, taken, unrecorded.
  record_env refused
  exit 1
fi
CODEX_DIR="$(dirname "$codex_bin")"
echo "[start-lane-runner] codex $codex_ver at $codex_bin"

# ---- 3. Build the child environment: prepend the client's bin dir, scrub the fire markers. ----
# Prepending CODEX_DIR carries node/npm/npx along with codex when the client came from nvm,
# which is the whole point (see the node/npm note above).
export PATH="$CODEX_DIR:$PATH"
unset CLAUDE_CONFIG_DIR CLAUDECODE
child_node="$(command -v node 2>/dev/null || echo '(none)')"
echo "[start-lane-runner] child node: $child_node ($("$child_node" --version 2>/dev/null || echo '?'))"
echo "[start-lane-runner] CLAUDE_CONFIG_DIR/CLAUDECODE scrubbed (playwright lane parallelism preserved)"

if [ "$CHECK_ONLY" = "1" ]; then
  echo "[start-lane-runner] --check: environment is READY; started nothing."
  exit 0
fi

# ---- 4. Start DETACHED, so it survives the fire that started it. ----
mkdir -p "$(dirname "$RUNNER_LOG")"
started=$( (
  nohup /usr/bin/perl -MPOSIX -e 'POSIX::setsid() >= 0 or die "setsid: $!\n"; exec @ARGV or die "exec: $!\n"' \
    bash "$RUNNER_SCRIPT" >> "$RUNNER_LOG" 2>&1 </dev/null &
  echo $!
) )
sleep 3

# ---- 5. VERIFY, and say plainly what was verified. ----
# PPID 1 + TTY ?? is what a correctly-detached runner looks like: reparented to launchd, no
# controlling terminal, survives this shell's exit. It is the CORRECT state, not a symptom
# (s1651 mistook it for one and declined a safe restart for ~2h26m).
live="$started"

stop_rejected_runner() {
  kill -TERM "$1" 2>/dev/null || return 0
  for _ in {1..40}; do
    kill -0 "$1" 2>/dev/null || return 0
    sleep 0.25
  done
  kill -KILL "$1" 2>/dev/null || true
  sleep 1
  ! kill -0 "$1" 2>/dev/null
}

if ! runner_pids | grep -qx "$live"; then
  echo "[start-lane-runner] FAILED — no runner process after 3s. See $RUNNER_LOG:"
  stop_rejected_runner "$live" || echo "[start-lane-runner] FAILED — unverified pid $live survived TERM/KILL"
  tail -5 "$RUNNER_LOG" | sed 's/^/[start-lane-runner]   /'
  exit 1
fi

echo "[start-lane-runner] runner UP at pid $live"
ps -o pid,ppid,tty,stat,lstart -p "$live" | sed 's/^/[start-lane-runner]   /'
ppid=$(ps -o ppid= -p "$live" | tr -d ' ')
if [ "${ppid:-}" != "1" ]; then
  echo "[start-lane-runner] FAILED — PPID is $ppid, not 1: runner custody was not transferred"
  stop_rejected_runner "$live" || echo "[start-lane-runner] FAILED — rejected runner pid $live survived TERM/KILL"
  exit 1
fi
tty=$(ps -o tty= -p "$live" | tr -d ' ')
if [ "${tty:-}" != "??" ]; then
  echo "[start-lane-runner] FAILED — TTY is ${tty:-unknown}, not ??: runner is not headless"
  stop_rejected_runner "$live" || echo "[start-lane-runner] FAILED — rejected runner pid $live survived TERM/KILL"
  exit 1
fi
record_env started "$live"
echo "[start-lane-runner] OK — record the pid + start time in your handoff."
echo "[start-lane-runner] provenance recorded: grep '\[start-lane-runner\] ENV' $RUNNER_LOG"
