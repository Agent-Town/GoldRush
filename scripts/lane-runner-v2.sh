#!/bin/bash
# Gold Rush lane runner v2 — replaces lane-runner.sh (s34 review fixes).
# Robin: stop the old runner (Ctrl+C), then start this one. One instance only.
#
# v2 changes vs v1 (reviews/lane-runner.md):
#   1. LOCK-AWARE main slot: if STATUS.md line 1 has an ACTIVE lock younger
#      than 3h, the main slot is skipped (lane-a..d still run — isolated worktrees).
#   2. Failed tasks (rc!=0) go to tasks/failed/, not tasks/done/, and are
#      NOT silently forgotten.
#   3. Single-instance guard via mkdir lock (bash 3.2 safe, no flock on macOS).
#   4. mv failures can't loop a task forever: task is moved BEFORE exec.
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOCKDIR="$ROOT/tasks/.runner.lock"
if ! mkdir "$LOCKDIR" 2>/dev/null; then
  echo "[lane-runner-v2] another instance appears to be running ($LOCKDIR exists). Remove it if stale."
  exit 1
fi
trap 'rmdir "$LOCKDIR" 2>/dev/null' EXIT INT TERM
mkdir -p "$ROOT/tasks/runs" "$ROOT/tasks/done" "$ROOT/tasks/failed" "$ROOT/tasks/running"

dir_for_slot() {
  case "$1" in
    main)   echo "$ROOT" ;;
    lane-a) echo "$ROOT/worktrees/lane-a" ;;
    lane-b) echo "$ROOT/worktrees/lane-b" ;;
    lane-c) echo "$ROOT/worktrees/lane-c" ;;
    lane-d) echo "$ROOT/worktrees/lane-d" ;;
    *)      echo "" ;;
  esac
}

main_locked() {
  # Returns 0 (locked) if STATUS.md line 1 contains "ACTIVE <ISO>" younger than 3h.
  local line ts now age
  line=$(head -1 "$ROOT/STATUS.md" 2>/dev/null) || return 1
  ts=$(echo "$line" | sed -n 's/.*ACTIVE \([0-9T:-]*Z\).*/\1/p')
  [ -z "$ts" ] && return 1
  # macOS date -j fallback vs GNU date
  now=$(date -u +%s)
  age=$(( now - $(date -u -j -f "%Y-%m-%dT%H:%MZ" "$ts" +%s 2>/dev/null || date -u -d "$ts" +%s 2>/dev/null || echo 0) ))
  [ "$age" -ge 0 ] && [ "$age" -lt 10800 ]
}

echo "[lane-runner-v2] watching $ROOT/tasks/queue — Ctrl+C to stop"
while true; do
  for slot in main lane-a lane-b lane-c lane-d; do
    q="$ROOT/tasks/queue/$slot"
    f=$(ls "$q"/*.md 2>/dev/null | head -1)
    [ -z "${f:-}" ] && continue
    if [ "$slot" = "main" ] && main_locked; then
      echo "[lane-runner-v2] main slot LOCKED (orchestrator ACTIVE in STATUS.md) — holding $(basename "$f")"
      continue
    fi
    name=$(basename "$f")
    wd="$(dir_for_slot "$slot")"
    if [ -z "$wd" ] || [ ! -d "$wd" ]; then echo "[lane-runner-v2] $slot dir missing, skipping $name"; continue; fi
    stamp=$(date +%Y%m%d-%H%M%S)
    log="$ROOT/tasks/runs/$stamp-$slot-$name.log"
    running="$ROOT/tasks/running/$stamp-$name"
    mv "$f" "$running" || { echo "[lane-runner-v2] mv failed for $name"; continue; }
    echo "[lane-runner-v2] $stamp START $slot :: $name (log: $log)"
    ( cd "$wd" && codex exec "Do the task in the file at: $running" ) >"$log" 2>&1
    rc=$?
    if [ "$rc" -eq 0 ]; then
      mv "$running" "$ROOT/tasks/done/$stamp-$name"
    else
      mv "$running" "$ROOT/tasks/failed/$stamp-$name"
    fi
    echo "[lane-runner-v2] $(date +%H:%M:%S) DONE rc=$rc $slot :: $name"
  done
  sleep 20
done
