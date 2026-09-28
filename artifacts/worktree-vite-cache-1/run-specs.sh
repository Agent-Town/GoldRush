#!/bin/bash
# run-specs.sh <outdir> <label> <spec...> (worktree-vite-cache-1): specs through the DEFAULT playwright config
# (`playwright.config.ts`, GR_CAPTURE_EXTERNAL_SERVER=1, desktop-chrome + mobile-chrome, --workers=1) against a
# dev server started exactly as that config's webServer starts one (`npm run dev`), on port 5326 instead of the
# lanes' 5188. The server starts on a FRESH per-checkout cache (the checkout's `.vite-cache` is moved aside into
# the session scratchpad first, never deleted) and with NO warm-up boot, so the first spec meets a cold server.
# Every process it starts is stopped by PID at the end (npm, its shell, vite).
set -u
export PATH=/opt/homebrew/bin:$PATH
OUT=${1:?outdir}; LABEL=${2:?label}; shift 2; SPECS="$*"
ASIDE=${WVC1_ASIDE:?WVC1_ASIDE must name a scratch directory for caches moved aside}
WT=/Users/robin/Claude/Projects/wt-wvc1
cd "$WT" || exit 1
if [ -e .vite-cache ]; then mkdir -p "$ASIDE"; mv .vite-cache "$ASIDE/vite-cache-before-$LABEL"; fi
LOG="$OUT/$LABEL.log"; SLOG="$OUT/$LABEL-server-5326.log"
echo "# $LABEL: $SPECS; start $(date -u +%FT%TZ) load $(sysctl -n vm.loadavg) head $(git rev-parse --short HEAD) fresh cache: $([ -e .vite-cache ] && echo no || echo yes)" > "$LOG"
npm run dev -- --port 5326 --strictPort > "$SLOG" 2>&1 &
NPM=$!
for i in $(seq 1 120); do curl -s -o /dev/null --max-time 2 http://127.0.0.1:5326/ && break; sleep 0.5; done
echo "# server answered after ~$((i / 2)) s (npm pid $NPM)" >> "$LOG"
GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5326 npx playwright test $SPECS --project=desktop-chrome --project=mobile-chrome --workers=1 --reporter=line >> "$LOG" 2>&1
RC=$?
KIDS=$(pgrep -P "$NPM"); GRANDKIDS=$(for k in $KIDS; do pgrep -P "$k"; done)
kill $GRANDKIDS $KIDS "$NPM" 2>/dev/null
echo "# rc=$RC end $(date -u +%FT%TZ) load $(sysctl -n vm.loadavg); stopped pids $NPM $KIDS $GRANDKIDS" >> "$LOG"
grep -E "^[[:space:]]+[0-9]+ (passed|failed|flaky|skipped)" "$LOG"
echo "rc=$RC"
