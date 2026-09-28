#!/bin/bash
# legacy-url-check.sh <outdir> <label> (worktree-vite-cache-1): does the optimizer's OLD address still answer?
# `e2e/e5-sea-contact.spec.ts:46` imports three.js in the page from the literal `/node_modules/.vite/deps/three.js`
# (so do five `scripts/review-*.mjs`). This starts THIS worktree's dev server on 5326 (one node process, stopped by
# its PID), lets it pre-bundle, then records (1) what that literal URL returns and whether its bytes are the
# checkout's own pre-bundled three.js, and (2) the spec's one test that uses it, through the default config
# (external server, desktop-chrome, one worker).
set -u
export PATH=/opt/homebrew/bin:$PATH
OUT=${1:?outdir}; LABEL=${2:?label}
ASIDE=${WVC1_ASIDE:?WVC1_ASIDE must name a scratch directory}; mkdir -p "$ASIDE"; BODY="$ASIDE/$LABEL-legacy-three.js"
WT=/Users/robin/Claude/Projects/wt-wvc1
cd "$WT" || exit 1
LOG="$OUT/$LABEL.log"
echo "# $LABEL start $(date -u +%FT%TZ) load $(sysctl -n vm.loadavg) head $(git rev-parse --short HEAD) dirty-tracked $(git status --short --untracked-files=no | wc -l | tr -d ' ')" > "$LOG"
NO_COLOR=1 node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5326 --strictPort > "$OUT/$LABEL-server-5326.log" 2>&1 &
VPID=$!
for i in $(seq 1 120); do curl -s -o /dev/null --max-time 2 http://127.0.0.1:5326/ && break; sleep 0.5; done
curl -s -o /dev/null --max-time 60 "http://127.0.0.1:5326/src/main.ts"; sleep 8
CACHE=$(node -e 'import("vite").then(async ({ resolveConfig }) => { const c = await resolveConfig({}, "serve"); console.log(c.cacheDir); })' 2>/dev/null | tail -1)
echo "# resolved cacheDir: $CACHE" >> "$LOG"
CODE=$(curl -s -o "$BODY" -w "%{http_code}" --max-time 30 "http://127.0.0.1:5326/node_modules/.vite/deps/three.js")
echo "# GET /node_modules/.vite/deps/three.js -> HTTP $CODE, $(wc -c < "$BODY" | tr -d ' ') bytes" >> "$LOG"
OWN="$CACHE/deps/three.js"; SHARED="/Users/robin/Claude/Projects/Gold Rush/node_modules/.vite/deps/three.js"
for f in "$OWN" "$SHARED"; do if [ -f "$f" ]; then echo "# on disk: $f sha256 $(shasum -a 256 < "$f" | cut -c1-16) bytes $(wc -c < "$f" | tr -d ' ')" >> "$LOG"; else echo "# on disk: $f ABSENT" >> "$LOG"; fi; done
echo "# served body sha256 $(shasum -a 256 < "$BODY" | cut -c1-16) (body kept in the session scratchpad)" >> "$LOG"
GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5326 npx playwright test e2e/e5-sea-contact.spec.ts -g "sea panorama" --project=desktop-chrome --workers=1 --reporter=line >> "$LOG" 2>&1
RC=$?
kill "$VPID"
echo "# rc=$RC end $(date -u +%FT%TZ) load $(sysctl -n vm.loadavg); stopped pid $VPID" >> "$LOG"
grep -E "^# (GET|on disk|served|resolved)|^[[:space:]]+[0-9]+ (passed|failed)|rc=" "$LOG"
