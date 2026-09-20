#!/bin/zsh
# HEAT 14 OPERATOR TICK — wait for up to $2 seconds or until $1 new matrix rows land, then commit
# every landed ride's evidence path-scoped and print a compact board. One tool call per tick.
cd "$(dirname "$0")"
ARENA="$(cd ../.. && pwd)"
WANT=${1:-2}; MAX=${2:-540}
N0=$(grep -c '^| [0-9]' matrix.md)
T0=$(date +%s)
while [ $(( $(date +%s) - T0 )) -lt $MAX ]; do
  N=$(grep -c '^| [0-9]' matrix.md)
  [ $N -ge $(( N0 + WANT )) ] && break
  sleep 15
done
cd "$ARENA"
git add -- artifacts/gauntlet-heat14-e3949bfa/rides artifacts/gauntlet-heat14-e3949bfa/matrix.md artifacts/gauntlet-heat14-e3949bfa/queue2.log 2>/dev/null
if ! git diff --cached --quiet; then
  ROWS=$(grep -c '^| [0-9]' artifacts/gauntlet-heat14-e3949bfa/matrix.md)
  git -c user.name="Claude (heat 14 operator)" -c user.email="<owner-email>" \
    commit -q -m "heat14: evidence through matrix row ${ROWS}

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Rpu6VBzeT24Kk8jHuRHkpQ"
fi
cd artifacts/gauntlet-heat14-e3949bfa
echo "=== $(date -u +%H:%M:%SZ) rows=$(grep -c '^| [0-9]' matrix.md) ==="
node -e "const t=require('fs').readFileSync('matrix.md','utf8');for(const l of t.split('\n')) if(/^\| \d+ \|/.test(l)){const c=l.split('|').map(s=>s.trim());console.log((c[1]+'').padEnd(3),(c[2]+'').padEnd(20),(c[6]+'').replace(/\*/g,'').padEnd(18),'w'+c[7],(c[8]+'g').padEnd(6),c[10]);}"
echo "--- queue tail ---"; tail -3 queue2.log | cut -c1-170
