#!/bin/bash
# fire-hold.sh — keep the fires off main while an attended operation rewrites the ledgers (ledger-shape-1 phase 2 was the first).
# The runner's liveness key is the DIRECTORY tasks/.fire.lock (fire-runner.sh: mkdir at start, rmdir at exit, reaped when >50 min old).
# LAW (memory law-file-argmax-and-fire-liveness, addendum 2026-09-25): mkdir the directory FIRST; `touch` on a missing path makes a FILE,
# which the runner's mkdir refuses forever and its reaper (rmdir) cannot remove: every fire would silently skip.
# Usage: fire-hold.sh start|stop|status   (start refuses if a fire is alive; stop releases; the touch loop runs in the background)
R="${GR_REPO:-/Users/robin/Claude/Projects/Gold Rush}"; L="$R/tasks/.fire.lock"; FLAG=${GR_FIRE_HOLD_RELEASE:-$HOME/.goldrush/fire-hold-release}; LOG=${GR_FIRE_HOLD_LOG:-$HOME/.goldrush/fire-hold.log}
case "${1:-status}" in
  start)
    [ -d "$L" ] && { echo "REFUSED: tasks/.fire.lock exists ($(cat "$L/holder" 2>/dev/null || echo 'a fire, no holder note')); wait for it or run stop"; exit 1; }
    rm -f "$FLAG"; mkdir "$L" || exit 1; echo "attended hold $$ $(date -u '+%Y-%m-%dT%H:%MZ') ${2:-unnamed}" > "$L/holder"
    ( while [ ! -f "$FLAG" ]; do touch "$L" 2>/dev/null; sleep 1200; done; rm -f "$L/holder"; rmdir "$L" 2>/dev/null; echo "released $(date -u '+%Y-%m-%dT%H:%MZ')" >> "$LOG" ) > /dev/null 2>&1 &
    echo "held $(date -u '+%Y-%m-%dT%H:%MZ') (${2:-unnamed}); touch loop pid $!" | tee -a "$LOG";;
  stop) touch "$FLAG"; sleep 2; rm -f "$L/holder" 2>/dev/null; rmdir "$L" 2>/dev/null; echo "release requested; tasks/.fire.lock $([ -e "$L" ] && echo 'still present' || echo 'gone')";;
  status) if [ -d "$L" ]; then echo "tasks/.fire.lock: DIR, $(cat "$L/holder" 2>/dev/null || echo 'a fire (no attended holder note)'), mtime $(stat -f '%Sm' "$L")"; elif [ -e "$L" ]; then echo "tasks/.fire.lock is a FILE — a bug; move it out of the repo at once (never rm -rf the path)"; else echo "no fire lock"; fi;;
  *) echo "usage: fire-hold.sh start [name] | stop | status"; exit 2;;
esac
