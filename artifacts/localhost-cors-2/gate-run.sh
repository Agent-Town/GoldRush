#!/bin/bash
# localhost-cors-2: the locked gate batch. Run from the worktree root as
#   bash "/Users/robin/Claude/Projects/Gold Rush/scripts/attended/dlock.sh" bash -c 'bash artifacts/localhost-cors-2/gate-run.sh'
# Every server it starts it stops by pid. Evidence lands in artifacts/localhost-cors-2/gates/.
set -u
export PATH=/opt/homebrew/bin:$PATH
cd /Users/robin/Claude/Projects/wt-lc2 || exit 2
OUT=artifacts/localhost-cors-2/gates
mkdir -p "$OUT"
PORT=5351
SUMMARY="$OUT/summary.txt"
stamp() { date -u '+%Y-%m-%dT%H:%M:%SZ'; }
say() { echo "$(stamp) $*" | tee -a "$SUMMARY"; }
load() { sysctl -n vm.loadavg | tr -d '{}' | xargs; }
workerds() { ps -ax -o comm= | grep -c workerd; }

say "LOCK HELD. tip $(git rev-parse --short HEAD), node $(node --version), wrangler $(wrangler --version 2>/dev/null | head -1), load $(load), workerd processes $(workerds)"
for f in .dev.vars .env .env.local; do
  if [ -e "$f" ]; then say "REFUSED: $f exists in the root; the gates must run as a fresh clone would"; exit 3; fi
done

# 1. the three functions gates, each on its own
for g in test:accounts test:mp test:stats; do
  T=$(date +%s); LOG="$OUT/${g//:/-}.log"
  GR_GUARD_NO_ARTIFACT=1 npm run "$g" > "$LOG" 2>&1; RC=$?
  say "$g rc=$RC $(( $(date +%s) - T ))s load $(load) :: $(grep -E 'checks passed|passed \(|^ok |PASS' "$LOG" | tr '\n' ';' | cut -c1-500)"
done

# 2. the full node-guards battery, every && leg on its own
T=$(date +%s)
GR_GUARD_NO_ARTIFACT=1 node artifacts/localhost-cors-2/battery-legs.mjs "$OUT" > "$OUT/battery-summary.txt" 2>&1; RC=$?
say "test:node-guards (every leg run) combined rc=$RC $(( $(date +%s) - T ))s load $(load)"
cat "$OUT/battery-summary.txt" >> "$SUMMARY"

# 3. e2e on both projects against a vite dev server on $PORT, warmed first (land.sh's pattern, F-ENV-1)
SPECS="e2e/tl-02-public-stats.spec.ts e2e/assay-season-roll.spec.ts e2e/mp-06-party-overview.spec.ts e2e/mp-arsenal.spec.ts e2e/agent-seat.spec.ts e2e/second-rider.spec.ts e2e/mp-reconnect.spec.ts e2e/mp-02-lockstep.spec.ts e2e/field-book.spec.ts e2e/mp-07c-4-reckoning.spec.ts e2e/milk-county-board.spec.ts e2e/lb-01-county-standings.spec.ts e2e/terrain3d-default.spec.ts e2e/tl-01-run-telemetry.spec.ts e2e/live-seed-rotation.spec.ts e2e/cosmetic-grants.spec.ts e2e/bug-office-api.spec.ts e2e/ratelimit-429-net.spec.ts"
BUSY=""
for p in $PORT 8812 8813 8816 8817 8818 8819 9232 9233 9236 9237 9238 9239; do lsof -nP -iTCP:$p -sTCP:LISTEN >/dev/null 2>&1 && BUSY="$BUSY $p"; done
say "ports busy before e2e:${BUSY:- none}"
npx vite --port "$PORT" --strictPort --host 127.0.0.1 > "$OUT/vite.log" 2>&1 & VPID=$!
for i in $(seq 1 60); do curl -s -o /dev/null --max-time 2 "http://127.0.0.1:$PORT/" && break; sleep 1; done
for u in / "/?contract=the-claim"; do curl -s -o /dev/null --max-time 30 "http://127.0.0.1:$PORT$u"; done; sleep 15
GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL="http://127.0.0.1:$PORT" npx playwright test e2e/m2-01-build-menu.spec.ts --project=desktop-chrome -g "six ready icons" --workers=1 --reporter=line > "$OUT/e2e-warmup.log" 2>&1
say "vite pid $VPID up; warm boot (uncounted) rc=$? :: $(grep -E '^ *[0-9]+ (passed|failed)' "$OUT/e2e-warmup.log" | tr '\n' ' ')"
for i in $(seq 1 12); do sleep 5; [ "$(tail -3 "$OUT/vite.log" | grep -c 'optimized dependencies changed')" = 0 ] && break; done
T=$(date +%s)
GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL="http://127.0.0.1:$PORT" npx playwright test $SPECS --project=desktop-chrome --project=mobile-chrome --workers=1 --reporter=line > "$OUT/e2e.log" 2>&1; RC=$?
say "e2e 18 specs, both projects, --workers=1 rc=$RC $(( $(date +%s) - T ))s load $(load) :: $(grep -E '^ *[0-9]+ (passed|failed|skipped|flaky|did not run)' "$OUT/e2e.log" | tr '\n' ' ')"
kill "$VPID" 2>/dev/null; wait "$VPID" 2>/dev/null
say "vite pid $VPID stopped; workerd processes $(workerds)"

# 4. which local runner reads the switch, at runtime (this creates the gitignored .dev.vars and leaves it)
T=$(date +%s)
node artifacts/localhost-cors-2/dev-vars-probe.mjs > "$OUT/dev-vars-probe.txt" 2>&1; RC=$?
say "dev-vars probe rc=$RC $(( $(date +%s) - T ))s :: $(tail -1 "$OUT/dev-vars-probe.txt")"
say "tracked files the batch changed: $(git status --short --untracked-files=no | wc -l | xargs) :: $(git status --short --untracked-files=no | tr '\n' ' ' | cut -c1-300)"
say "BATCH DONE. load $(load), workerd processes $(workerds)"
