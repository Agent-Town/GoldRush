#!/bin/bash
# s1037 wall probe watcher: report the verdict of the lane-c probe-by-queue.
# Exits on first verdict (failed marker / done-move) or after ~10 minutes.
ROOT="/Users/robin/Claude/Projects/Gold Rush"
SINCE="2026-07-25 16:46"
cd "$ROOT" || exit 1
for i in $(seq 1 60); do
  newfail=$(find tasks/failed -name "*geometry-settle*" -newermt "$SINCE" 2>/dev/null | head -1)
  newdone=$(find tasks/done -name "*geometry-settle*" -newermt "$SINCE" 2>/dev/null | head -1)
  if [ -n "$newfail" ]; then
    echo "PROBE VERDICT: FAILED MARKER -> $newfail"
    exit 0
  fi
  if [ -n "$newdone" ]; then
    echo "PROBE VERDICT: DONE-MOVE -> $newdone"
    exit 0
  fi
  sleep 10
done
echo "PROBE: no verdict after 600s (queue=$(ls tasks/queue/lane-c/ 2>/dev/null | wc -l | tr -d ' '), newest log=$(ls -t logs/runs-archive 2>/dev/null | head -1))"
