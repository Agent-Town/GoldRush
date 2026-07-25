#!/usr/bin/env bash
# Gold Rush factory watchdog — deterministic, no AI, watches the watchers.
# Modes: (no arg) = one health pass (launchd runs this every 10 min)
#        status   = print a human dashboard and exit (safe anytime)
# Auto-remediation is limited to ONE safe action: restarting a dead runner
# (single-instance lock in lane-runner-v3.sh makes this race-free).
# Everything else = observe + notify (macOS notification + logs/health.log).
# OpenClaw or any other notifier may READ logs/health.log; nothing but this
# script writes it, and this script never writes the repo ledger (STATUS.md).
set -u
ROOT="/Users/robin/Claude/Projects/Gold Rush"
LOG="$ROOT/logs/health.log"
STATE="$ROOT/logs/.health-state"
mkdir -p "$ROOT/logs"
cd "$ROOT" || exit 1

ts() { date +%H:%M:%S; }
note() { echo "[health] $(date +%F) $(ts) $*" >> "$LOG"; }
alert() {
  note "ALERT: $*"
  osascript -e "display notification \"$*\" with title \"Gold Rush factory\"" >/dev/null 2>&1 || true
}

runner_alive() { pgrep -f "[l]ane-runner-v3.sh" >/dev/null 2>&1; }
fire_proc()    { pgrep -f "claude -p # Gold Rush FIRE" >/dev/null 2>&1; }

queued_count()  { ls tasks/queue/main tasks/queue/lane-* tasks/queue/art 2>/dev/null | grep -c '\.md$'; }
running_count() { ls tasks/running/ 2>/dev/null | grep -c -- '--'; }
pending_count() { ls assets/crafting-queue/pending/ 2>/dev/null | grep -c '\.json$'; }
failed_sig()    { ls tasks/failed/ 2>/dev/null | tail -5 | shasum | cut -c1-12; }
# Art-slot retention exposure (F-1045-1, s1045). worktrees/art/ is a PLAIN
# DIRECTORY, not a git worktree — so no `git status` anywhere in this repo can
# ever mention what is staged there. Files staged and never drained exist in no
# object database at all, on one disk. The s1045 sweep found 10, oldest 14 days.
# Counts bytes that are in NO object database — NOT "absent from main". Art
# parked on a save/* branch pending an owner verdict is preserved, and must not
# keep ringing: this condition persists until a human acts, so a false positive
# here trains everyone to ignore the one alarm that means permanent loss.
# Cheap by construction: the name set-diff vs main is one git call, and only
# that handful gets hashed (not all ~190 staged files, ~600 MB, every 10 min).
art_untracked() {
  [ -d worktrees/art/assets/raw ] || { echo 0; return; }
  local n=0 f sha
  while IFS= read -r f; do
    [ -n "$f" ] || continue
    sha=$(git hash-object -- "worktrees/art/assets/raw/$f" 2>/dev/null)
    if [ -n "$sha" ] && git cat-file -e "$sha" 2>/dev/null; then continue; fi
    n=$((n + 1))
  done < <(comm -23 \
    <(ls worktrees/art/assets/raw 2>/dev/null | sort) \
    <(git ls-tree -r --name-only main -- assets/raw/ 2>/dev/null | sed 's|^assets/raw/||' | sort))
  echo "$n"
}

dashboard() {
  echo "=== Gold Rush factory — $(date '+%F %H:%M:%S') ==="
  echo "runner : $(runner_alive && echo ALIVE || echo DEAD)"
  echo "fire   : $(fire_proc && echo RUNNING || echo between-fires)"
  echo "lock   : $(head -c 120 STATUS.md)"
  echo "queued : $(queued_count) task(s)   in-flight: $(running_count)   pending-orders: $(pending_count)"
  # "ahead" counts COMMITS, which is not the same as undrained WORK: a
  # path-scoped squash merge lands the content on main and leaves the lane
  # commit behind forever, so a merged lane reads as "ahead" for good.
  # Verify by content before believing this line (Mistake #16):
  #   git show --stat <sha>   then   git diff --stat <branch> main -- <its files>
  # Empty diff on the touched files = SAFE DUPE, not a drain.
  echo "lanes ahead of main (commit count — may be squash-merged dupes, verify by content):"
  for b in lane/m3 lane/m4 lane/polish lane/perf lane/m6-r3a-apply; do
    n=$(git log --oneline "main..$b" 2>/dev/null | wc -l | tr -d ' ')
    [ "${n:-0}" != "0" ] && echo "  $b: $n commit(s) ahead"
  done
  echo "art staged, in NO commit: $(art_untracked) file(s)  (detail: node scripts/art-staging-audit.mjs)"
  echo "failed tail: $(ls tasks/failed/ 2>/dev/null | tail -1)"
  echo "last fire log line: $(tail -1 "logs/fire-$(date +%Y%m%d).log" 2>/dev/null | head -c 120)"
}

if [ "${1:-}" = "status" ]; then dashboard; exit 0; fi

# ---- health pass ----
# 1. Runner dead -> restart headless (the one auto-remediation).
if ! runner_alive; then
  alert "Runner was DEAD — restarting it headless"
  nohup bash scripts/lane-runner-v3.sh >> logs/runner-headless.log 2>&1 &
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

# 3. Stale fire lock: STATUS line-1 ACTIVE + no fire process + file untouched >50 min.
if head -1 STATUS.md | grep -q '^Last updated.*ACTIVE\|^ACTIVE' && ! fire_proc; then
  if [ -n "$(find STATUS.md -mmin +50 2>/dev/null)" ]; then
    alert "Fire lock looks DEAD (ACTIVE >50min, no fire process) — next fire should reclaim; watch it"
  fi
fi

# 4. Runaway pending orders.
PC=$(pending_count)
[ "$PC" -gt 5 ] && alert "Crafting pending/ has $PC orders — runaway-generator class"

# 5. New failures since last pass.
SIG=$(failed_sig)
OLDSIG=$(grep '^failedsig=' "$STATE" 2>/dev/null | tail -1 | cut -d= -f2)
if [ -n "${OLDSIG:-}" ] && [ "$SIG" != "$OLDSIG" ]; then
  alert "New entries in tasks/failed/ — check $(ls tasks/failed/ | tail -1)"
fi
grep -v '^failedsig=' "$STATE" > "$STATE.tmp" 2>/dev/null; mv "$STATE.tmp" "$STATE" 2>/dev/null || : > "$STATE"
echo "failedsig=$SIG" >> "$STATE"

# 6b. Art-slot retention exposure (F-1045-1). Edge-triggered on the COUNT, not
# level-triggered: the condition persists until a human/fire salvages, and an
# alert every 10 min would train everyone to ignore it.
AU=$(art_untracked)
OLDAU=$(grep '^artuntracked=' "$STATE" 2>/dev/null | tail -1 | cut -d= -f2)
if [ "${AU:-0}" -gt 0 ] && [ "${AU:-0}" != "${OLDAU:-}" ]; then
  alert "ART slot: $AU staged file(s) in NO commit (was ${OLDAU:-unrecorded}) — preserve with: node scripts/salvage-art-staging.mjs save/<name>"
fi
grep -v '^artuntracked=' "$STATE" > "$STATE.tmp" 2>/dev/null; mv "$STATE.tmp" "$STATE" 2>/dev/null || : > "$STATE"
echo "artuntracked=$AU" >> "$STATE"

# 6. Codex auth wall showing in recent fire log.
if tail -40 "logs/fire-$(date +%Y%m%d).log" 2>/dev/null | grep -q '401 Unauthorized'; then
  alert "Codex 401 in recent fire log — account/login needs attention (codex login)"
fi

note "ok runner=$(runner_alive && echo 1 || echo 0) queued=$QC inflight=$RC pending=$PC"
