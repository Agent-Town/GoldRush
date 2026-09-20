#!/bin/bash
# Binary search over range.txt (oldest first). lo = last known GREEN index (-1 = the base before
# the range), hi = first known RED index. Runs one probe per invocation and prints the next bounds.
set -e
DIR=/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/wt-relay/artifacts/relay-rush-replays-again
LO="$1"; HI="$2"
while [ $((HI - LO)) -gt 1 ]; do
  MID=$(( (LO + HI) / 2 ))
  SHA=$(sed -n "$((MID+1))p" "$DIR/range.txt")
  LINE=$(bash "$DIR/bisect.sh" "$SHA")
  echo "[$MID] $LINE"
  case "$LINE" in
    *"| SECURES |"*) LO=$MID ;;
    *) HI=$MID ;;
  esac
done
echo "RESULT: last green index $LO = $(sed -n "$((LO+1))p" "$DIR/range.txt" 2>/dev/null || echo '(base 6c7b11184)'), first red index $HI = $(sed -n "$((HI+1))p" "$DIR/range.txt")"
