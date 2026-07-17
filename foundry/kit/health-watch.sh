#!/usr/bin/env bash
# Foundry Kit factory watchdog — deterministic, no AI, watches the watchers.
# Generalized from the Gold Rush health-watch (root/name/lanes/pending -> discovered or
# read from foundry.config.json). Modes:
#   (no arg) = one health pass (run on a timer, e.g. every 10 min)
#   status   = print a human dashboard and exit (safe anytime)
# Auto-remediation is limited to ONE safe action: restarting a dead runner
# (single-instance lock in lane-runner.sh makes this race-free).
# Everything else = observe + notify (macOS notification + the health log).
# Nothing but this script writes the health log, and this script never writes STATUS.md.
set -u
ROOT="${FOUNDRY_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "$ROOT" || exit 1
CFG="$ROOT/foundry.config.json"

cfg() {
  local v=""
  if command -v node >/dev/null 2>&1 && [ -f "$CFG" ]; then
    v=$(node -e '
      const c = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
      const v = process.argv[2].split(".").reduce((o, k) => (o == null ? o : o[k]), c);
      if (v == null) process.exit(1);
      process.stdout.write(String(v));
    ' "$CFG" "$1" 2>/dev/null) || v=""
  fi
  if [ -n "$v" ]; then printf '%s\n' "$v"; else printf '%s\n' "$2"; fi
}

NAME="$(cfg name 'Foundry')"
LOG="$ROOT/$(cfg health.logFile logs/health.log)"
FIRELOG_DIR="$(cfg fire.logDir logs)"
PENDING_DIR="$(cfg dashboard.pendingDir '')"
STATE="$ROOT/logs/.health-state"
mkdir -p "$ROOT/logs" "$(dirname "$LOG")"

ts() { date +%H:%M:%S; }
note() { echo "[health] $(date +%F) $(ts) $*" >> "$LOG"; }
alert() {
  note "ALERT: $*"
  osascript -e "display notification \"$*\" with title \"$NAME factory\"" >/dev/null 2>&1 || true
}

runner_alive() { pgrep -f "[l]ane-runner.sh" >/dev/null 2>&1; }
fire_proc()    { pgrep -f "claude -p # $NAME FIRE" >/dev/null 2>&1; }

queued_count()  { ls tasks/queue/*/ 2>/dev/null | grep -c '\.md$'; }
running_count() { ls tasks/running/ 2>/dev/null | grep -c -- '--'; }
pending_count() { [ -n "$PENDING_DIR" ] && ls "$PENDING_DIR" 2>/dev/null | grep -c '\.json$' || echo 0; }
failed_sig()    { ls tasks/failed/ 2>/dev/null | tail -5 | shasum | cut -c1-12; }

dashboard() {
  echo "=== $NAME factory — $(date '+%F %H:%M:%S') ==="
  echo "runner : $(runner_alive && echo ALIVE || echo DEAD)"
  echo "fire   : $(fire_proc && echo RUNNING || echo between-fires)"
  echo "lock   : $(head -c 120 STATUS.md 2>/dev/null || echo '(no STATUS.md)')"
  echo "queued : $(queued_count) task(s)   in-flight: $(running_count)   pending-orders: $(pending_count)"
  echo "lanes ahead of main:"
  for b in $(git for-each-ref --format='%(refname:short)' 'refs/heads/lane/*' 2>/dev/null); do
    n=$(git log --oneline "main..$b" 2>/dev/null | wc -l | tr -d ' ')
    [ "${n:-0}" != "0" ] && echo "  $b: $n undrained commit(s)"
  done
  echo "failed tail: $(ls tasks/failed/ 2>/dev/null | tail -1)"
  echo "last fire log line: $(tail -1 "$FIRELOG_DIR/fire-$(date +%Y%m%d).log" 2>/dev/null | head -c 120)"
}

if [ "${1:-}" = "status" ]; then dashboard; exit 0; fi

# ---- health pass ----
# 1. Runner dead -> restart headless (the one auto-remediation).
if ! runner_alive; then
  alert "Runner was DEAD — restarting it headless"
  nohup bash scripts/lane-runner.sh >> logs/runner-headless.log 2>&1 &
  sleep 2
  runner_alive && note "runner restarted ok (headless, log: logs/runner-headless.log)" \
               || alert "runner restart FAILED — needs a human"
fi

# 2. Starvation: work queued, nothing running, runner alive (two passes in a row).
QC=$(queued_count); RC=$(running_count)
STARVED_BEFORE=$(grep -c '^starved' "$STATE" 2>/dev/null || echo 0)
if [ "$QC" -gt 0 ] && [ "$RC" -eq 0 ] && runner_alive; then
  if [ "$STARVED_BEFORE" -gt 0 ]; then
    alert "Starvation: $QC task(s) queued, runner alive but idle for 2+ checks"
  fi
  echo "starved" >> "$STATE"
else
  grep -v '^starved' "$STATE" > "$STATE.tmp" 2>/dev/null; mv "$STATE.tmp" "$STATE" 2>/dev/null || : > "$STATE"
fi

# 3. Stale fire lock: STATUS line-1 ACTIVE + no fire process + file untouched too long.
STALE_MIN="$(cfg fire.lockStaleMinutes 50)"
if head -1 STATUS.md 2>/dev/null | grep -q '^Last updated.*ACTIVE\|^ACTIVE' && ! fire_proc; then
  if [ -n "$(find STATUS.md -mmin +"$STALE_MIN" 2>/dev/null)" ]; then
    alert "Fire lock looks DEAD (ACTIVE >${STALE_MIN}min, no fire process) — next fire should reclaim; watch it"
  fi
fi

# 4. Runaway pending orders (only when a pending dir is configured).
PC=$(pending_count)
[ "$PC" -gt 5 ] && alert "$PENDING_DIR has $PC orders — runaway-generator class"

# 5. New failures since last pass.
SIG=$(failed_sig)
OLDSIG=$(grep '^failedsig=' "$STATE" 2>/dev/null | tail -1 | cut -d= -f2)
if [ -n "${OLDSIG:-}" ] && [ "$SIG" != "$OLDSIG" ]; then
  alert "New entries in tasks/failed/ — check $(ls tasks/failed/ | tail -1)"
fi
grep -v '^failedsig=' "$STATE" > "$STATE.tmp" 2>/dev/null; mv "$STATE.tmp" "$STATE" 2>/dev/null || : > "$STATE"
echo "failedsig=$SIG" >> "$STATE"

# 6. Implementer auth wall showing in recent fire log.
if tail -40 "$FIRELOG_DIR/fire-$(date +%Y%m%d).log" 2>/dev/null | grep -q '401 Unauthorized'; then
  alert "401 in recent fire log — implementer account/login needs attention"
fi

note "ok runner=$(runner_alive && echo 1 || echo 0) queued=$QC inflight=$RC pending=$PC"
