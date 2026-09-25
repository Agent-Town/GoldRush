#!/bin/bash
# land.sh <landing.json> — THE ATTENDED LANDING, parameterized (the 2026-09-24/25 sessions derived six 24 KB bash scripts from one
# another by string substitution; two of the six shipped with a quoting slip). Run under scripts/attended/dlock.sh.
#   merge the branch into a DETACHED CHAIN worktree beside a scratch store worktree (main's tree is never touched until the ff)
#   -> optional cure script (commits itself) -> fire.md pointer re-base -> engine hash (pin or must-be-unchanged)
#   -> tsc/build/e1 [+ strict release build] [+ payload] [+ halo] [+ null floors] -> law-pointer -> named guards
#   [+ functions gates] [+ ledger battery] [+ the release suite under its own config] -> e2e on both projects, --workers=1, warmed
#   -> node-guards battery -> verdict (config'd allowed reds only) -> pin measured LAST -> review (body file + generated evidence table)
#   -> bookkeeping (leaf, ledger row, STATUS phrase; JSON-driven, never spliced) -> merge main into the chain -> ff-only when no fire owns
#   main (STATUS line 1 shapes AND the fresh tasks/.fire.lock DIRECTORY, F-E1T-2) and no dashboard-gen.sh is mid-run -> push
#   -> post-ff guards [-> deploy] [-> preview] -> battery on main -> LAND-<TAG>-DONE.
# Every stop writes "… — needs hands" into the gates log and leaves the chain worktree for inspection. Config shape: see README.md.
export PATH=/opt/homebrew/bin:$PATH
[ -f "$1" ] || { echo "usage: land.sh <landing.json>"; exit 2; }
CFG="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"; D="$(cd "$(dirname "$0")" && pwd)"; LIB="$D/land-lib.cjs"
R="${GR_REPO:-/Users/robin/Claude/Projects/Gold Rush}"; A="${GR_STORE:-/Users/robin/Claude/Projects/GoldRush-assets}"; HOMEDIR="${GR_LAND_HOME:-$HOME/.goldrush/land}"; mkdir -p "$HOMEDIR"
node "$LIB" env "$CFG" "$HOMEDIR/env.$$.sh" > /dev/null || exit 2; . "$HOMEDIR/env.$$.sh"; rm -f "$HOMEDIR/env.$$.sh"
G="$HOMEDIR/$TAG-gates.txt"; W="$HOMEDIR/wt-$TAG"; SW="$HOMEDIR/GoldRush-assets"; RESUME=${GR_LAND_RESUME:-0}; [ "$RESUME" = 1 ] || : > "$G"
# paths in the config are relative to the PRIMARY repo (the chain worktree has no uncommitted files); resolve them before the cd
[ -n "$CURE" ] && [ "${CURE#/}" = "$CURE" ] && CURE="$R/$CURE"; export GR_REPO_ROOT="$R"
say() { echo "$*" >> "$G"; }; fail() { say "$* — needs hands"; exit 1; }
islock() { case "$1" in ACTIVE*|*"lock ACTIVE"*|*" ACTIVE ("*"fire)"*|*"fire) ACTIVE"*) return 0;; esac; [ -d "$R/tasks/.fire.lock" ] && [ -n "$(find "$R/tasks/.fire.lock" -maxdepth 0 -mmin -50 2>/dev/null)" ] && return 0; return 1; }
ehash() { node -e 'import("./scripts/assay-replay-agent.mjs").then(async m=>console.log(await m.computeEngineHash(process.cwd())))' 2>/dev/null | tail -1; }
pinned() { node -e 'console.log(JSON.parse(require("fs").readFileSync("assets/engine-era.json","utf8")).engineHash)'; }
counts() { grep -E '^ℹ (tests|pass|fail|skipped)' "$1" | tr '\n' ' '; }
pwcounts() { grep -E '^[[:space:]]+[0-9]+ (passed|failed|skipped|flaky)' "$1" | tr '\n' ' '; }
pwreds() { grep -E '^[[:space:]]+[0-9]+\) \[' "$1" | sed -E 's/^[[:space:]]+//' | cut -c1-160; }
if [ "$RESUME" != 1 ]; then
MSG="$(node -p "JSON.parse(require('fs').readFileSync(process.argv[1],'utf8')).mergeMessage" "$CFG")"
cd "$R" || exit 1; LANE_SHA=$(git rev-parse "$BR") || fail "branch $BR not found"; say "branch $BR tip $(git rev-parse --short "$LANE_SHA") $(date -u '+%Y-%m-%d %H:%MZ') config $CFG"
# the scratch store worktree beside the chain (assets/pilots -> ../../GoldRush-assets/pilots is a relative symlink)
if [ ! -e "$SW/.git" ]; then git -C "$A" worktree add --detach "$SW" main > /dev/null 2>&1 || fail "scratch store worktree"; fi
[ -z "$(git -C "$SW" status --short)" ] || fail "scratch store worktree dirty at $SW"; git -C "$SW" checkout -q --detach main; STORE=$(git -C "$A" rev-parse --short main); say "scratch store at the store's main $STORE"
# the chain worktree
if [ ! -e "$W/.git" ]; then git worktree add --detach "$W" main > /dev/null 2>&1 || fail "chain worktree"; fi
[ -e "$W/node_modules" ] || ln -sfn "$R/node_modules" "$W/node_modules"; [ -e "$W/.env.local" ] || { cp "$R/.env.local" "$W/.env.local" && chmod 600 "$W/.env.local"; }
cd "$W" || exit 1; git checkout -q --detach main; [ -z "$(git status --short | grep -v '^??')" ] || fail "chain dirty"; say "chain base $(git rev-parse --short HEAD)"
# the lane merge
git merge --no-ff --no-commit "$LANE_SHA" > "$HOMEDIR/$TAG-merge.log" 2>&1
for f in $(git diff --name-only --diff-filter=U); do node "$LIB" resolve "$CFG" "$f" lane >> "$G" 2>&1 || fail "conflict $f"; git add -- "$f"; done
git commit -q -m "$MSG

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>" || fail "merge commit failed"; MH=$(git rev-parse HEAD); say "merged $(git rev-parse --short HEAD)"
# optional cure (runs in the chain, commits itself, writes its own line into the gates log)
if [ -n "$CURE" ]; then bash "$CURE" "$G" || fail "cure $CURE failed"; fi
"$D/lawfix.sh" "$TAG" "$G" || exit 1
H0=$(ehash); PINNED=$(pinned); say "engine hash merged: $H0 (pinned $PINNED)"; [ "$HASH_MODE" = "unchanged" ] && [ "$H0" != "$PINNED" ] && fail "HASH MOVED on a branch declared hash=unchanged"
npx tsc --noEmit > "$HOMEDIR/$TAG-tsc.log" 2>&1; T1=$?; npm run build > "$HOMEDIR/$TAG-build.log" 2>&1; T2=$?; GR_RELEASE=e1 npm run build > "$HOMEDIR/$TAG-build-e1.log" 2>&1; T3=$?; say "tsc/build/e1: $T1 / $T2 / $T3"; [ "$T1$T2$T3" = 000 ] || fail "tsc/build/e1 red"
if [ "$G_RELEASE_BUILD" = 1 ]; then GR_RELEASE=e1 npm run build:release > "$HOMEDIR/$TAG-build-release.log" 2>&1; say "build:release (strict, the assertion): rc=$? $(grep -E '\[release-build\]' "$HOMEDIR/$TAG-build-release.log" | tail -1 | cut -c1-140)"; fi
if [ "$G_PAYLOAD" = 1 ]; then node scripts/first-town-payload.mjs > "$HOMEDIR/$TAG-payload.log" 2>&1; say "$(grep -E '^first-town payload: ' "$HOMEDIR/$TAG-payload.log" | tail -1)"; fi
if [ "$G_HALO" = 1 ]; then node scripts/halo-reextraction-check.mjs > "$HOMEDIR/$TAG-halo.log" 2>&1; say "halo: rc=$? $(grep -E 'PASS|FAIL' "$HOMEDIR/$TAG-halo.log" | tail -1 | cut -c1-100)"; fi
if [ "$G_NULL_FLOORS" = 1 ]; then node scripts/null-floor-anchors.mjs --check > "$HOMEDIR/$TAG-nullfloor.log" 2>&1; say "null floors: rc=$? $(grep -E 'null floors match' "$HOMEDIR/$TAG-nullfloor.log" | tail -1 | cut -c1-80)"; fi
node scripts/law-pointer-guard.mjs > "$HOMEDIR/$TAG-law.log" 2>&1; say "law-pointer: rc=$? $(head -1 "$HOMEDIR/$TAG-law.log" | cut -c1-80)"
GUARDS_PRESENT=""; for g in $GUARDS; do [ -f "$g" ] && GUARDS_PRESENT="$GUARDS_PRESENT $g"; done
GR_GUARD_NO_ARTIFACT=1 node --test $GUARDS_PRESENT > "$HOMEDIR/$TAG-guards.log" 2>&1; say "guards: $(grep -E '^ℹ (pass|fail)' "$HOMEDIR/$TAG-guards.log" | tr '\n' ' ')"; grep -E '^✖' "$HOMEDIR/$TAG-guards.log" | grep -v 'failing tests' | head -5 | cut -c1-140 >> "$G"
if [ "$G_FUNCTIONS" = 1 ]; then GR_GUARD_NO_ARTIFACT=1 npm run test:accounts > "$HOMEDIR/$TAG-accounts.log" 2>&1; RA=$?; GR_GUARD_NO_ARTIFACT=1 npm run test:mp > "$HOMEDIR/$TAG-mp.log" 2>&1; RM=$?; GR_GUARD_NO_ARTIFACT=1 npm run test:stats > "$HOMEDIR/$TAG-stats.log" 2>&1; RS=$?; say "functions gates: accounts rc=$RA | mp rc=$RM | stats rc=$RS"; git checkout -q -- artifacts 2>/dev/null; fi
if [ "$G_LEDGER" = 1 ]; then say "ledger battery start $(date -u '+%H:%MZ')"; GR_GUARD_NO_ARTIFACT=1 npm run test:ledger-guards > "$HOMEDIR/$TAG-ledger.log" 2>&1; say "ledger battery: rc=$? $(counts "$HOMEDIR/$TAG-ledger.log")"; grep -E '^✖' "$HOMEDIR/$TAG-ledger.log" | grep -v 'failing tests' | sort -u | head -4 | cut -c1-140 >> "$G"; fi
if [ "$G_RELEASE_SUITE" = 1 ]; then GR_GUARD_NO_ARTIFACT=1 npx playwright test -c playwright.release.config.ts --workers=1 --reporter=line > "$HOMEDIR/$TAG-release-suite.log" 2>&1; say "release suite (own config): rc=$? $(pwcounts "$HOMEDIR/$TAG-release-suite.log")"; pwreds "$HOMEDIR/$TAG-release-suite.log" >> "$G"; fi
if [ -n "$SPECS" ]; then
  SPECS_PRESENT=""; for f in $SPECS; do [ -f "$f" ] && SPECS_PRESENT="$SPECS_PRESENT $f"; done
  npx vite --port "$PORT" --strictPort --host 127.0.0.1 > "$HOMEDIR/$TAG-vite.log" 2>&1 & VPID=$!; for i in $(seq 1 60); do curl -s -o /dev/null --max-time 2 "http://127.0.0.1:$PORT/" && break; sleep 1; done
  for u in $WARMUP; do curl -s -o /dev/null --max-time 30 "http://127.0.0.1:$PORT$u"; done; sleep 15
  # a REAL warm boot before anything is counted: a cold vite re-optimises dependencies mid-boot and fails one dynamic import (F-ENV-1 class)
  GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL="http://127.0.0.1:$PORT" npx playwright test e2e/m2-01-build-menu.spec.ts --project=desktop-chrome -g "six ready icons" --workers=1 --reporter=line > "$HOMEDIR/$TAG-warmup.log" 2>&1
  if [ -n "$WARMUP_SPEC" ]; then GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL="http://127.0.0.1:$PORT" npx playwright test $WARMUP_SPEC --workers=1 --reporter=line > "$HOMEDIR/$TAG-warmup2.log" 2>&1; fi
  for i in $(seq 1 12); do sleep 5; [ "$(tail -3 "$HOMEDIR/$TAG-vite.log" | grep -c 'optimized dependencies changed')" = 0 ] && break; done; git checkout -q -- . 2>/dev/null
  say "e2e start $(date -u '+%H:%MZ'):$SPECS_PRESENT"; GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL="http://127.0.0.1:$PORT" npx playwright test $SPECS_PRESENT --workers=1 --reporter=line > "$HOMEDIR/$TAG-e2e.log" 2>&1; RC=$?; kill $VPID 2>/dev/null
  say "e2e: rc=$RC $(pwcounts "$HOMEDIR/$TAG-e2e.log") $(date -u '+%H:%MZ')"; pwreds "$HOMEDIR/$TAG-e2e.log" >> "$G"
  git diff --name-only -- artifacts reviews | xargs git checkout -- 2>/dev/null
fi
say "battery start $(date -u '+%H:%MZ')"; GR_GUARD_NO_ARTIFACT=1 nice -n 5 npm run test:node-guards > "$HOMEDIR/$TAG-battery.log" 2>&1; say "battery: rc=$? $(counts "$HOMEDIR/$TAG-battery.log") $(date -u '+%H:%MZ')"; grep -E '^✖' "$HOMEDIR/$TAG-battery.log" | grep -v 'failing tests' | sort -u | head -6 | cut -c1-140 >> "$G"; git diff --name-only -- artifacts reviews | xargs git checkout -- 2>/dev/null
say "dirt after battery: $(git status --short | grep -v '^??' | wc -l | tr -d ' ')"; say "$TAG-PREP-DONE"
node "$LIB" verdict "$CFG" "$G" >> "$G" 2>&1 || fail "verdict"
else
  # RESUME after a fixed stop: the chain already holds the merge, the cure, the verdict; pick up at the pin
  cd "$R" || exit 1; LANE_SHA=$(git rev-parse "$BR"); STORE=$(git -C "$A" rev-parse --short main); cd "$W" || fail "no chain worktree to resume"; grep -q "^verdict: clean" "$G" || fail "resume refused: the gates log carries no clean verdict"
  MH=$(git log --format=%H -1 --grep="^[a-z]*: merge $BR"); [ -n "$MH" ] || fail "resume: merge commit not found in the chain"  # any <type>: merge <branch> (rt40 used rotation:, F-RT40-2); PINNED=$(pinned); say "RESUME $(date -u '+%Y-%m-%d %H:%MZ'): chain $(git rev-parse --short HEAD), merge ${MH:0:9}, continuing at the pin"
fi
# the pin, measured LAST
H1=$(ehash); say "hash at pin time: $H1"
if [ "$HASH_MODE" = "unchanged" ]; then [ "$H1" = "$PINNED" ] || fail "HASH MOVED after the battery"; PIN="unchanged (\`${PINNED:0:8}\`, no pin)"
else PIN=$(node "$LIB" pin "$CFG" "$STORE" "$H1" | sed -n 's/^PIN=//p'); PIN=${PIN% (already pinned)}; say "pin $PIN"; ERA=$(GR_GUARD_NO_ARTIFACT=1 node --test scripts/engine-era-guard.test.mjs scripts/bench-seeds.test.mjs 2>&1 | grep -E '^ℹ (pass|fail)' | tr '\n' ' '); say "era (chain, scratch store): $ERA"; echo "$ERA" | grep -q 'fail 0' || fail "era guards red"
  git add -- assets/engine-era.json; git diff --cached --quiet || git commit -q -m "era 6, same-era pin: $TAG, measured on the merged tree with the store at $STORE ($H1)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"; fi
# review, evidence, bookkeeping
node "$LIB" review "$CFG" "$G" "$MH" "$LANE_SHA" "$PIN" "$STORE" >> "$G" || fail "review"
mkdir -p "$EVIDENCE_DIR"; cp "$G" "$EVIDENCE_DIR/drain-gates-summary.txt"; for l in e2e battery release-suite ledger; do [ -f "$HOMEDIR/$TAG-$l.log" ] && cp "$HOMEDIR/$TAG-$l.log" "$EVIDENCE_DIR/drain-$l-merged-tree.log"; done
node "$LIB" bookkeep "$CFG" "$MH" "$PIN" >> "$G" || fail "bookkeeping"
git add -- "$REVIEW_PATH" "$EVIDENCE_DIR" tasks/goals.json tasks/BACKLOG.md STATUS.md && git commit -q -m "drain: $TAG LANDED — review, leaf merged, ledger row, STATUS phrase

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>" || fail "bookkeeping commit"
# main merge + ff, waiting out fires (line 1 AND the lock directory) and a running dashboard-gen.sh
for attempt in 1 2 3; do
  for i in $(seq 1 240); do cd "$R"; L=$(head -1 STATUS.md); if islock "$L"; then sleep 15; continue; fi; Dn=$(git status --short | grep -v '^??' | grep -vE '^ M logs/' | wc -l | tr -d ' '); [ "$Dn" = 0 ] && break; sleep 15; done
  cd "$W"; if ! git merge-base --is-ancestor main HEAD; then
    git merge --no-ff --no-commit main > "$HOMEDIR/$TAG-mainmerge-$attempt.log" 2>&1
    for f in $(git diff --name-only --diff-filter=U); do node "$LIB" resolve "$CFG" "$f" main >> "$G" 2>&1 || fail "main-merge conflict $f"; git add -- "$f"; done
    git commit -q -m "drain: merge main into the $TAG chain (pass $attempt)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>" || fail "main-merge commit"
    H2=$(ehash); if [ "$HASH_MODE" = "unchanged" ]; then [ "$H2" = "$(pinned)" ] || fail "HASH MOVED after the main merge"; else [ "$H2" = "$H1" ] || fail "HASH MOVED after the main merge ($H2): needs a re-pin"; fi
    node "$LIB" bookkeep "$CFG" "$MH" "$PIN" > /dev/null 2>&1; git add -- tasks/goals.json tasks/BACKLOG.md STATUS.md; git diff --cached --quiet || git commit -q -m "drain: $TAG bookkeeping re-applied after the main merge

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
  fi
  cd "$R"; L=$(head -1 STATUS.md); islock "$L" && continue
  for d in $(seq 1 30); do ps -o command -ax | grep -qE '^(/bin/)?bash (scripts/|/Users/[^ ]*/scripts/)dashboard-gen\.sh' || break; sleep 2; done
  if git merge --ff-only "$(git -C "$W" rev-parse HEAD)" > "$HOMEDIR/$TAG-ff.log" 2>&1; then break; else say "ff refused (attempt $attempt)"; [ "$attempt" = 3 ] && fail "ff refused three times"; fi
done
cd "$R"; say "main now $(git rev-parse --short HEAD)"; git push origin main 2>&1 | tail -1 >> "$G"
say "post-ff: law $(node scripts/law-pointer-guard.mjs > /dev/null 2>&1; echo rc=$?) | desk $(GR_GUARD_NO_ARTIFACT=1 node --test scripts/desk-declaration-guard.test.mjs scripts/desk-carryforward-guard.test.mjs 2>&1 | grep -E '^ℹ (pass|fail)' | tr '\n' ' ')"
if [ "$DEPLOY" = 1 ]; then bash scripts/deploy.sh > "$HOMEDIR/$TAG-deploy.log" 2>&1; say "deploy: rc=$? $(grep -E 'release-build\]|DEPLOYED|VERIFIED|SYNCED|ABORT|Outcome' "$HOMEDIR/$TAG-deploy.log" | tail -4 | tr '\n' ' ' | cut -c1-300)"; else say "no deploy (config)"; fi
if [ "$PREVIEW" = 1 ]; then [ -x "$D/preview-redeploy.sh" ] && "$D/preview-redeploy.sh" --yes 2>&1 | tail -1 >> "$G" || say "preview: helper absent or not executable, all-epochs preview NOT redeployed"; fi
GR_GUARD_NO_ARTIFACT=1 nice -n 5 npm run test:node-guards > "$HOMEDIR/$TAG-battery-main.log" 2>&1; say "battery on main: rc=$? $(counts "$HOMEDIR/$TAG-battery-main.log")"; grep -E '^✖' "$HOMEDIR/$TAG-battery-main.log" | grep -v 'failing tests' | sort -u | head -5 >> "$G"
git worktree remove --force "$W" > /dev/null 2>&1 && say "chain worktree removed" || say "chain worktree left at $W"
say "LAND-$TAG-DONE"
