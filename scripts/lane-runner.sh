#!/bin/bash
# Gold Rush lane runner — Robin starts this ONCE (one terminal tab, or via launchd).
# From then on: any .md task file MOVED into tasks/queue/<slot>/ is auto-executed
# in the right working dir via codex exec, logged, and archived. Ctrl+C stops it.
# Slots: main -> repo root · lane-a..d -> worktrees/lane-{a..d}
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
declare -A DIRS=( [main]="$ROOT" [lane-a]="$ROOT/worktrees/lane-a" [lane-b]="$ROOT/worktrees/lane-b" [lane-c]="$ROOT/worktrees/lane-c" [lane-d]="$ROOT/worktrees/lane-d" )
echo "[lane-runner] watching $ROOT/tasks/queue — Ctrl+C to stop"
while true; do
  for slot in main lane-a lane-b lane-c lane-d; do
    q="$ROOT/tasks/queue/$slot"
    f=$(ls "$q"/*.md 2>/dev/null | head -1)
    [ -z "${f:-}" ] && continue
    name=$(basename "$f")
    wd="${DIRS[$slot]}"
    if [ ! -d "$wd" ]; then echo "[lane-runner] $slot dir missing, skipping $name"; continue; fi
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
