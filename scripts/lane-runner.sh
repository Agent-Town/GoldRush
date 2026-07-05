#!/bin/bash
# Gold Rush lane runner — Robin starts this ONCE (one terminal tab, or via launchd).
# Any .md task file placed in tasks/queue/<slot>/ is auto-executed in the right
# working dir via codex exec, logged to tasks/runs/, archived to tasks/done/.
# Slots: main -> repo root · lane-a..d -> worktrees/lane-{a..d}. Ctrl+C stops it.
# (bash 3.2 compatible — no associative arrays.)
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
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
echo "[lane-runner] watching $ROOT/tasks/queue — Ctrl+C to stop"
while true; do
  for slot in main lane-a lane-b lane-c lane-d; do
    q="$ROOT/tasks/queue/$slot"
    f=$(ls "$q"/*.md 2>/dev/null | head -1)
    [ -z "${f:-}" ] && continue
    name=$(basename "$f")
    wd="$(dir_for_slot "$slot")"
    if [ -z "$wd" ] || [ ! -d "$wd" ]; then echo "[lane-runner] $slot dir missing, skipping $name"; continue; fi
    stamp=$(date +%Y%m%d-%H%M%S)
    log="$ROOT/tasks/runs/$stamp-$slot-$name.log"
    echo "[lane-runner] $stamp START $slot :: $name (log: $log)"
    ( cd "$wd" && codex exec "Do the task in the file at: $f" ) >"$log" 2>&1
    rc=$?
    mv "$f" "$ROOT/tasks/done/$stamp-$name"
    echo "[lane-runner] $(date +%H:%M:%S) DONE rc=$rc $slot :: $name"
  done
  sleep 20
done
