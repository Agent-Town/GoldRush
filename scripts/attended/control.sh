#!/bin/bash
# control.sh <port> <repeat> <spec...> — the CONTROL ARM: run specs on a detached clean-main worktree N times and print the failing
# test ids, so a red on a merged tree is attributed against main by measurement and never by memory (F-1444-2: inventory membership
# is never exoneration). Run under dlock.sh. Prints one line per failing test with its count over the repeats.
export PATH=/opt/homebrew/bin:$PATH; PORT=${1:?port}; N=${2:?repeat}; shift 2; SPECS="$*"
R="${GR_REPO:-/Users/robin/Claude/Projects/Gold Rush}"; A="${GR_STORE:-/Users/robin/Claude/Projects/GoldRush-assets}"; HOMEDIR="${GR_LAND_HOME:-$HOME/.goldrush/land}"; C="$HOMEDIR/wt-control"; SW="$HOMEDIR/GoldRush-assets"; mkdir -p "$HOMEDIR"
cd "$R" || exit 1; [ -e "$SW/.git" ] || git -C "$A" worktree add --detach "$SW" main > /dev/null 2>&1; git -C "$SW" checkout -q --detach main
[ -e "$C/.git" ] || git worktree add --detach "$C" main > /dev/null 2>&1 || exit 1; [ -e "$C/node_modules" ] || ln -sfn "$R/node_modules" "$C/node_modules"; [ -e "$C/.env.local" ] || { cp "$R/.env.local" "$C/.env.local"; chmod 600 "$C/.env.local"; }
cd "$C" || exit 1; git checkout -q -- . 2>/dev/null; git checkout -q --detach main; echo "control on clean main $(git rev-parse --short HEAD), store $(git -C "$A" rev-parse --short main), specs: $SPECS, x$N"
npx vite --port "$PORT" --strictPort --host 127.0.0.1 > "$HOMEDIR/control-vite.log" 2>&1 & VPID=$!; for i in $(seq 1 60); do curl -s -o /dev/null --max-time 2 "http://127.0.0.1:$PORT/" && break; sleep 1; done; curl -s -o /dev/null --max-time 30 "http://127.0.0.1:$PORT/"; sleep 10
GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL="http://127.0.0.1:$PORT" npx playwright test e2e/m2-01-build-menu.spec.ts --project=desktop-chrome -g "six ready icons" --workers=1 --reporter=line > /dev/null 2>&1; sleep 10
GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL="http://127.0.0.1:$PORT" npx playwright test $SPECS --repeat-each="$N" --workers=1 --reporter=line > "$HOMEDIR/control-e2e.log" 2>&1; RC=$?; kill $VPID 2>/dev/null; git checkout -q -- . 2>/dev/null
echo "rc=$RC $(grep -E '^[[:space:]]+[0-9]+ (passed|failed|flaky)' "$HOMEDIR/control-e2e.log" | tr '\n' ' ')"; grep -E '^[[:space:]]+[0-9]+\) \[' "$HOMEDIR/control-e2e.log" | sed -E 's/^[[:space:]]+[0-9]+\) //; s/ ─+$//' | sort | uniq -c | sort -rn | cut -c1-170
cd "$R"; git worktree remove --force "$C" > /dev/null 2>&1
