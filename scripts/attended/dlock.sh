#!/bin/bash
# dlock.sh <command...> — one attended drain or implementer batch at a time on this machine.
# The lock is a DIRECTORY (mkdir is atomic) at $GR_DRAIN_LOCK, default ~/.goldrush/drain.lock, so it outlives any one session's
# scratchpad (the 2026-09-24 sessions kept it in /private/tmp and lost their whole toolkit with the session). The holder file names
# the pid, the time and the command. A stale lock (holder pid dead) is reclaimed after 10 minutes of silence.
LOCK=${GR_DRAIN_LOCK:-$HOME/.goldrush/drain.lock}; mkdir -p "$(dirname "$LOCK")"
while ! mkdir "$LOCK" 2>/dev/null; do
  if [ -f "$LOCK/holder" ]; then P=$(cut -d' ' -f1 "$LOCK/holder" 2>/dev/null); if [ -n "$P" ] && ! kill -0 "$P" 2>/dev/null && [ -n "$(find "$LOCK" -maxdepth 0 -mmin +10 2>/dev/null)" ]; then rm -rf "$LOCK"; continue; fi; fi
  sleep 20
done
echo "$$ $(date -u '+%Y-%m-%dT%H:%MZ') $*" > "$LOCK/holder"; trap 'rm -rf "$LOCK"' EXIT
"$@"
