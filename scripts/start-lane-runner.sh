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
cd "$(dirname "$0")/.." || exit 2
ROOT="$(pwd)"
CHECK_ONLY=0
[ "${1:-}" = "--check" ] && CHECK_ONLY=1
. "$ROOT/scripts/runner-processes.sh"

# Kept in step with lane-runner-v3.sh's CODEX_FLOOR by scripts/runner-restart-recipe.test.sh,
# which reds if the two drift. Deliberately NOT sourced from the runner: sourcing would execute
# it, and copying the whole file would be the sibling-script hazard this repo keeps paying for.
CODEX_FLOOR="0.144.1"

ver_ge() {  # $1 >= $2, dotted numeric (BSD awk; no sort -V)
  awk -v a="$1" -v b="$2" 'BEGIN{
    n=split(a,x,"."); m=split(b,y,".");
    for(i=1;i<=3;i++){ xi=(i<=n)?x[i]+0:0; yi=(i<=m)?y[i]+0:0;
      if(xi>yi) exit 0; if(xi<yi) exit 1 }
    exit 0 }'
}

# ---- 1. REFUSE if a runner is already alive. NEVER clear the lock by hand. ----
# lane-runner-v3.sh:13-18 SELF-HEALS a genuine corpse (no other runner process -> rmdir + retake).
# So "another instance running. Remove if stale." at :20 means an instance GENUINELY IS running,
# and `rmdir tasks/.runner.lock` + relaunch yields TWO runners on the same queues. That error
# text invited the one action that compounds the damage (F-1652-1 §3); this is the cure.
others=$(runner_pids | wc -l | tr -d ' ')
if [ "${others:-0}" != "0" ]; then
  echo "[start-lane-runner] REFUSING — a lane runner is already alive:"
  runner_pids | while read -r pid; do ps -o pid=,command= -p "$pid"; done | sed 's/^/[start-lane-runner]   /'
  echo "[start-lane-runner] Do NOT rmdir tasks/.runner.lock — the runner self-heals a real corpse"
  echo "[start-lane-runner] (lane-runner-v3.sh:13-18); a held lock means a LIVE instance."
  echo "[start-lane-runner] To replace it: kill -TERM <pid>  (its trap at :24 releases the lock),"
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
mkdir -p "$ROOT/logs"
nohup bash "$ROOT/scripts/lane-runner-v3.sh" >> "$ROOT/logs/runner-headless.log" 2>&1 &
started=$!
disown "$started" 2>/dev/null || true
sleep 3

# ---- 5. VERIFY, and say plainly what was verified. ----
# PPID 1 + TTY ?? is what a correctly-detached runner looks like: reparented to launchd, no
# controlling terminal, survives this shell's exit. It is the CORRECT state, not a symptom
# (s1651 mistook it for one and declined a safe restart for ~2h26m).
live=$(runner_pids | head -1)
if [ -z "${live:-}" ]; then
  echo "[start-lane-runner] FAILED — no runner process after 3s. See logs/runner-headless.log:"
  tail -5 "$ROOT/logs/runner-headless.log" | sed 's/^/[start-lane-runner]   /'
  exit 1
fi
echo "[start-lane-runner] runner UP at pid $live"
ps -o pid,ppid,tty,stat,lstart -p "$live" | sed 's/^/[start-lane-runner]   /'
ppid=$(ps -o ppid= -p "$live" | tr -d ' ')
if [ "${ppid:-}" != "1" ]; then
  echo "[start-lane-runner] WARNING — PPID is $ppid, not 1: this runner is NOT reparented to launchd"
  echo "[start-lane-runner] and may die when this shell exits. Re-check after the fire ends."
fi
echo "[start-lane-runner] OK — record the pid + start time in your handoff."
