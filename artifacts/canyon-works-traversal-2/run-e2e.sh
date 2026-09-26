#!/bin/bash
# canyon-works-traversal-2: one e2e batch against this worktree's own vite dev server on port 5325.
# Run it INSIDE the drain lock:
#   bash "/Users/robin/Claude/Projects/Gold Rush/scripts/attended/dlock.sh" bash artifacts/canyon-works-traversal-2/run-e2e.sh <label> [env K=V ...] -- <playwright args...>
# The server is started and stopped here, by PID. The suites' own evidence writers touch tracked files outside this task's
# firewall (artifacts/gt-03, artifacts/canyon-works, artifacts/056, ...): every such file is copied to a scratch churn folder
# (CW2_CHURN_ROOT/<label>) and restored to its committed blob, and every new untracked file outside this task's directory is
# moved there too, so the tree ends clean and nothing is deleted.
set -u
WT=/Users/robin/Claude/Projects/wt-cw2
PORT=5325
LABEL=$1; shift
ENVS=()
while [ "$#" -gt 0 ] && [ "$1" != "--" ]; do ENVS+=("$1"); shift; done
[ "${1:-}" = "--" ] && shift
OUT=$WT/artifacts/canyon-works-traversal-2/e2e/$LABEL
PWOUT=${CW2_PW_OUTPUT_ROOT:-/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush-history-local/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/cw2/pw}/$LABEL
mkdir -p "$OUT"
cd "$WT" || exit 90
export PATH=/opt/homebrew/bin:$PATH
{ echo "label $LABEL"; echo "head $(git rev-parse HEAD)"; echo "dirty-tracked:"; git status --porcelain --untracked-files=no; echo "start $(date -u '+%FT%TZ') load $(uptime | sed 's/.*load averages*: //')"; } > "$OUT/run.txt"
BEFORE_UNTRACKED=$(git ls-files --others --exclude-standard | grep -v '^node_modules' | sort)
node node_modules/vite/bin/vite.js --host 127.0.0.1 --port $PORT --strictPort > "$OUT/vite.log" 2>&1 &
VPID=$!
echo "vite pid $VPID" >> "$OUT/run.txt"
READY=0
for i in $(seq 1 180); do
  if curl -sf -o /dev/null "http://127.0.0.1:$PORT/@vite/client"; then READY=1; break; fi
  if ! kill -0 $VPID 2>/dev/null; then break; fi
  sleep 1
done
echo "vite ready=$READY after ${i}s" >> "$OUT/run.txt"
# Warm the page and its entry so the dependency optimizer settles before the first test.
curl -sf -o /dev/null "http://127.0.0.1:$PORT/" ; curl -sf -o /dev/null "http://127.0.0.1:$PORT/src/main.ts"
RC=99
if [ "$READY" = 1 ]; then
  env ${ENVS[@]+"${ENVS[@]}"} GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:$PORT \
    npx playwright test "$@" --workers=1 --reporter=list --output="$PWOUT" > "$OUT/playwright.log" 2>&1
  RC=$?
fi
echo "playwright rc=$RC" >> "$OUT/run.txt"
kill $VPID 2>/dev/null
for i in $(seq 1 30); do kill -0 $VPID 2>/dev/null || break; sleep 1; done
kill -0 $VPID 2>/dev/null && echo "WARNING: vite pid $VPID still alive after 30 s" >> "$OUT/run.txt"
echo "end $(date -u '+%FT%TZ') load $(uptime | sed 's/.*load averages*: //')" >> "$OUT/run.txt"
# Evidence churn outside the firewall: keep a copy, restore the committed blob; move new files aside.
CHURN=${CW2_CHURN_ROOT:-/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush-history-local/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/cw2/churn}/$LABEL
mkdir -p "$CHURN"
git diff --name-only | while read -r f; do
  case "$f" in artifacts/canyon-works-traversal-2/*) continue ;; esac
  case "$f" in assets/contracts/epoch-3-voltage/contracts.json|assets/contracts/epoch-3-voltage/mask-tables/e3-canyon-works.json|e2e/e3-canyon-works-traversal.spec.ts|e2e/gt-03-enemy-elevation.spec.ts) continue ;; esac
  mkdir -p "$CHURN/$(dirname "$f")"; cp "$f" "$CHURN/$f"; git show "HEAD:$f" > "$f"; echo "restored $f" >> "$OUT/run.txt"
done
AFTER_UNTRACKED=$(git ls-files --others --exclude-standard | grep -v '^node_modules' | sort)
comm -13 <(echo "$BEFORE_UNTRACKED") <(echo "$AFTER_UNTRACKED") | while read -r f; do
  [ -z "$f" ] && continue
  case "$f" in artifacts/canyon-works-traversal-2/*) continue ;; esac
  mkdir -p "$CHURN/$(dirname "$f")"; mv "$f" "$CHURN/$f"; echo "moved aside $f" >> "$OUT/run.txt"
done
exit $RC
