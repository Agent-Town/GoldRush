#!/bin/bash
# localhost-cors-2: the CONTROL ARM for every red of the gate batch, run as
#   bash "/Users/robin/Claude/Projects/Gold Rush/scripts/attended/dlock.sh" bash -c 'bash artifacts/localhost-cors-2/control-run.sh'
# The base tree is a detached linked worktree of 39f88d36f (the cut, before any door changed) in the implementer's
# scratchpad, wired like the implementer worktree (node_modules linked, the art store reachable by the same relative
# symlinks, no .env, .env.local or .dev.vars). It runs (1) the six battery-red test files on base and tip, each in an
# isolated TMPDIR, and (2) the nine e2e spec files that failed on the tip, on both projects, --workers=1, against a
# warmed vite of its own. The worktree is removed at the end.
set -u
export PATH=/opt/homebrew/bin:$PATH
TIP=/Users/robin/Claude/Projects/wt-lc2
S=/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush-history-local/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad
BASE=39f88d36f
CTLROOT="$S/ctl"; CTL="$CTLROOT/wt"
OUT="$TIP/artifacts/localhost-cors-2/gates"
PORT=5352
SUMMARY="$OUT/control-summary.txt"
stamp() { date -u '+%Y-%m-%dT%H:%M:%SZ'; }
say() { echo "$(stamp) $*" | tee -a "$SUMMARY"; }
load() { sysctl -n vm.loadavg | tr -d '{}' | xargs; }
say "LOCK HELD (control). base $BASE, tip $(git -C "$TIP" rev-parse --short HEAD), load $(load)"
mkdir -p "$CTLROOT"
[ -e "$CTLROOT/GoldRush-assets" ] || ln -s /Users/robin/Claude/Projects/GoldRush-assets "$CTLROOT/GoldRush-assets"
[ -e "$CTL/.git" ] || git -C "$TIP" worktree add --detach "$CTL" "$BASE" > /dev/null 2>&1 || { say "could not add the control worktree"; exit 1; }
[ -e "$CTL/node_modules" ] || ln -s "/Users/robin/Claude/Projects/Gold Rush/node_modules" "$CTL/node_modules"
say "control worktree $(git -C "$CTL" rev-parse --short HEAD); art links: $(for p in assets/motion-pilot assets/pilots assets/processed-full assets/raw; do [ -e "$CTL/$p" ] && printf 'ok ' || printf 'BROKEN(%s) ' "$p"; done); env files present: $(ls -a "$CTL" | grep -c -E '^\.(env|env\.local|dev\.vars)$')"

# 1. the battery reds, base and tip, isolated TMPDIRs
FILES="scripts/desk-declaration-guard.test.mjs scripts/ledger-backup-pull.test.mjs scripts/ledger-backup-fill-gaps-guard.test.mjs scripts/ledger-mirror-freshness-guard.test.mjs scripts/ledger-pull-supply-window-guard.test.mjs scripts/node-guards-contention.test.mjs"
for side in base tip; do
  if [ "$side" = base ]; then DIR="$CTL"; else DIR="$TIP"; fi
  T=$(mktemp -d "$S/ctl-tmpdir-$side-XXXX"); START=$(date +%s)
  (cd "$DIR" && TMPDIR="$T" GR_GUARD_NO_ARTIFACT=1 node --test $FILES > "$OUT/control-battery-$side.log" 2>&1); RC=$?
  say "battery reds on $side ($(git -C "$DIR" rev-parse --short HEAD)) rc=$RC $(( $(date +%s) - START ))s :: $(grep -E '^ℹ (tests|pass|fail) ' "$OUT/control-battery-$side.log" | tr '\n' ' ') :: survivors $(ls "$T" | wc -l | xargs) $(ls "$T" | tr '\n' ' ')"
  grep -E '^✖ ' "$OUT/control-battery-$side.log" | sort -u | sed "s/^/    $side: /" | cut -c1-170 | tee -a "$SUMMARY"
done
say "desk-declaration leg on base: $(cd "$CTL" && npm run test:desk-declaration > "$OUT/control-desk-declaration-base.log" 2>&1; echo rc=$?) :: $(grep -E 'REFUSING|PASS' "$OUT/control-desk-declaration-base.log" | head -1 | cut -c1-120)"

# 2. the nine e2e spec files that failed on the tip, on the base, both projects
SPECS="e2e/assay-season-roll.spec.ts e2e/cosmetic-grants.spec.ts e2e/field-book.spec.ts e2e/lb-01-county-standings.spec.ts e2e/milk-county-board.spec.ts e2e/mp-02-lockstep.spec.ts e2e/mp-07c-4-reckoning.spec.ts e2e/second-rider.spec.ts e2e/tl-01-run-telemetry.spec.ts"
BUSY=""; for p in $PORT 8812 8813 8816 8817 8818 8819 9232 9233 9236 9237 9238 9239; do lsof -nP -iTCP:$p -sTCP:LISTEN >/dev/null 2>&1 && BUSY="$BUSY $p"; done
say "ports busy before control e2e:${BUSY:- none}"
cd "$CTL" || exit 1
npx vite --port "$PORT" --strictPort --host 127.0.0.1 > "$OUT/control-vite.log" 2>&1 & VPID=$!
for i in $(seq 1 60); do curl -s -o /dev/null --max-time 2 "http://127.0.0.1:$PORT/" && break; sleep 1; done
for u in / "/?contract=the-claim"; do curl -s -o /dev/null --max-time 30 "http://127.0.0.1:$PORT$u"; done; sleep 15
GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL="http://127.0.0.1:$PORT" npx playwright test e2e/m2-01-build-menu.spec.ts --project=desktop-chrome -g "six ready icons" --workers=1 --reporter=line > "$OUT/control-e2e-warmup.log" 2>&1
say "control vite pid $VPID up; warm boot rc=$? :: $(grep -E '^ *[0-9]+ (passed|failed)' "$OUT/control-e2e-warmup.log" | tr '\n' ' ')"
for i in $(seq 1 12); do sleep 5; [ "$(tail -3 "$OUT/control-vite.log" | grep -c 'optimized dependencies changed')" = 0 ] && break; done
START=$(date +%s)
GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL="http://127.0.0.1:$PORT" npx playwright test $SPECS --project=desktop-chrome --project=mobile-chrome --workers=1 --reporter=line > "$OUT/control-e2e.log" 2>&1; RC=$?
say "control e2e (base, 9 specs, both projects) rc=$RC $(( $(date +%s) - START ))s load $(load) :: $(grep -E '^ *[0-9]+ (passed|failed|skipped|flaky|did not run)' "$OUT/control-e2e.log" | tr '\n' ' ')"
kill "$VPID" 2>/dev/null; wait "$VPID" 2>/dev/null
say "control vite pid $VPID stopped"
cd "$TIP" || exit 1
git -C "$TIP" worktree remove --force "$CTL" > /dev/null 2>&1 && say "control worktree removed" || say "control worktree NOT removed: $CTL"
say "CONTROL DONE. load $(load)"
