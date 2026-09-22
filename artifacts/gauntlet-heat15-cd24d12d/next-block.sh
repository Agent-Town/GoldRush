#!/bin/zsh
# HEAT 14 BLOCK GATE — the master's headroom rule made a step: wait for the running queue file to
# drain, re-probe the subscription with a one-turn `claude -p` (the only headroom surface this CLI
# has, F-HEAT14-1), record the probe, and launch the next block of six. Stops instead of launching
# if the probe does not answer — that is the weekly limit, and the heat ends cleanly there.
cd "$(dirname "$0")"
PREV=$1; NEXT=$2; MAX=${3:-540}
T0=$(date +%s)
while [ $(( $(date +%s) - T0 )) -lt $MAX ]; do
  grep -q "QUEUE ${PREV} DRAINED\|QUEUE HALTED" queue2.log && break
  sleep 15
done
if ! grep -q "QUEUE ${PREV} DRAINED\|QUEUE HALTED" queue2.log; then
  echo "BLOCK ${PREV} still running at $(date -u +%H:%M:%SZ) — not launching ${NEXT}"; tail -2 queue2.log | cut -c1-160; exit 0
fi
N=$(ls headroom/probe-*.json 2>/dev/null | wc -l | tr -d ' ')
N=$(( N + 1 ))
S=$(date +%s)
env -u CLAUDECODE -u CLAUDE_CODE_ENTRYPOINT -u CLAUDE_CONFIG_DIR claude -p "Reply with exactly: OK" \
  --model claude-opus-5 --output-format json > headroom/probe-${N}.json 2> headroom/probe-${N}.err
RC=$?
E=$(( $(date +%s) - S ))
echo "=== HEADROOM PROBE ${N} at $(date -u +%H:%M:%SZ): rc=${RC}, ${E}s ==="
node -e "
try{const j=require('./headroom/probe-${N}.json');console.log('result:',JSON.stringify(j.result),'| is_error:',j.is_error,'| api_error_status:',j.api_error_status,'| turns:',j.num_turns);}
catch(e){console.log('UNPARSABLE — raw head:'); console.log(require('fs').readFileSync('headroom/probe-${N}.json','utf8').slice(0,400));}
" 2>/dev/null || head -c 400 headroom/probe-${N}.json
head -c 300 headroom/probe-${N}.err
if [ $RC -ne 0 ]; then echo "PROBE DID NOT ANSWER — the limit has fired. NOT launching ${NEXT}."; exit 3; fi
node launch-queue.mjs ${NEXT}
echo "launched ${NEXT}: $(cat ${NEXT} | cut -d'|' -f2 | tr '\n' ' ')"
