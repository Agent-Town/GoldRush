#!/bin/bash
# localhost-cors-2: the second control. In serial mode the base never EXECUTED mp-02-lockstep's town-card test (:687):
# its :466 failed first and the rest of the file was skipped. So :687 runs in isolation, twice, on the base
# (a detached linked worktree of 39f88d36f) and on the tip, with second-rider (the same connect step) once on each.
# Run as: bash "/Users/robin/Claude/Projects/Gold Rush/scripts/attended/dlock.sh" bash -c 'bash artifacts/localhost-cors-2/control-run-2.sh'
set -u
export PATH=/opt/homebrew/bin:$PATH
TIP=/Users/robin/Claude/Projects/wt-lc2
S=/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush-history-local/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad
BASE=39f88d36f; CTLROOT="$S/ctl"; CTL="$CTLROOT/wt"; OUT="$TIP/artifacts/localhost-cors-2/gates"; SUMMARY="$OUT/control-2-summary.txt"
stamp() { date -u '+%Y-%m-%dT%H:%M:%SZ'; }
say() { echo "$(stamp) $*" | tee -a "$SUMMARY"; }
load() { sysctl -n vm.loadavg | tr -d '{}' | xargs; }
say "LOCK HELD (control 2). base $BASE, tip $(git -C "$TIP" rev-parse --short HEAD), load $(load)"
mkdir -p "$CTLROOT"; [ -e "$CTLROOT/GoldRush-assets" ] || ln -s /Users/robin/Claude/Projects/GoldRush-assets "$CTLROOT/GoldRush-assets"
[ -e "$CTL/.git" ] || git -C "$TIP" worktree add --detach "$CTL" "$BASE" > /dev/null 2>&1 || { say "could not add the control worktree"; exit 1; }
[ -e "$CTL/node_modules" ] || ln -s "/Users/robin/Claude/Projects/Gold Rush/node_modules" "$CTL/node_modules"
for side in base tip; do
  if [ "$side" = base ]; then DIR="$CTL"; PORT=5352; else DIR="$TIP"; PORT=5351; fi
  cd "$DIR" || exit 1
  lsof -nP -iTCP:$PORT -sTCP:LISTEN >/dev/null 2>&1 && { say "port $PORT busy, skipping $side"; continue; }
  npx vite --port "$PORT" --strictPort --host 127.0.0.1 > "$OUT/control-2-vite-$side.log" 2>&1 & VPID=$!
  for i in $(seq 1 60); do curl -s -o /dev/null --max-time 2 "http://127.0.0.1:$PORT/" && break; sleep 1; done
  for u in / "/?contract=the-claim"; do curl -s -o /dev/null --max-time 30 "http://127.0.0.1:$PORT$u"; done; sleep 15
  GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL="http://127.0.0.1:$PORT" npx playwright test e2e/m2-01-build-menu.spec.ts --project=desktop-chrome -g "six ready icons" --workers=1 --reporter=line > "$OUT/control-2-warmup-$side.log" 2>&1
  for i in $(seq 1 12); do sleep 5; [ "$(tail -3 "$OUT/control-2-vite-$side.log" | grep -c 'optimized dependencies changed')" = 0 ] && break; done
  T=$(date +%s)
  GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL="http://127.0.0.1:$PORT" npx playwright test e2e/mp-02-lockstep.spec.ts -g "town Ride Together card creates a claim word" --project=desktop-chrome --workers=1 --repeat-each=2 --reporter=line > "$OUT/control-2-mp02-687-$side.log" 2>&1; RC=$?
  say "$side ($(git -C "$DIR" rev-parse --short HEAD)) mp-02-lockstep :687 x2 rc=$RC $(( $(date +%s) - T ))s :: $(grep -E '^ *[0-9]+ (passed|failed|flaky|skipped|did not run)' "$OUT/control-2-mp02-687-$side.log" | tr '\n' ' ') :: $(grep -m1 -E 'Error:|TimeoutError' "$OUT/control-2-mp02-687-$side.log" | cut -c1-120)"
  T=$(date +%s)
  GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL="http://127.0.0.1:$PORT" npx playwright test e2e/second-rider.spec.ts --project=desktop-chrome --workers=1 --reporter=line > "$OUT/control-2-second-rider-$side.log" 2>&1; RC=$?
  say "$side second-rider rc=$RC $(( $(date +%s) - T ))s :: $(grep -E '^ *[0-9]+ (passed|failed|flaky|skipped|did not run)' "$OUT/control-2-second-rider-$side.log" | tr '\n' ' ') :: $(grep -m1 -E 'Error:|TimeoutError' "$OUT/control-2-second-rider-$side.log" | cut -c1-120)"
  kill "$VPID" 2>/dev/null; wait "$VPID" 2>/dev/null; say "$side vite pid $VPID stopped"
done
cd "$TIP" || exit 1
git -C "$TIP" worktree remove --force "$CTL" > /dev/null 2>&1 && say "control worktree removed" || say "control worktree NOT removed: $CTL"
say "CONTROL 2 DONE. load $(load)"
