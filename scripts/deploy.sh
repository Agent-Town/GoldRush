#!/usr/bin/env bash
# Gold Rush — deploy the current gated build to Cloudflare Pages.
# Called by fires after handoff (DEPLOY LAW) or manually. Budget failures block unless
# explicitly waived; --strict also returns nonzero for other failure classes.
# --dry-run builds and measures normally, then stops before credentials or publishing.
set -u
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT" || exit 1
STRICT=0
ALLOW_OVER_BUDGET=0
DRY_RUN=0
for arg in "$@"; do
  case "$arg" in
    --strict) STRICT=1 ;;
    --allow-over-budget) ALLOW_OVER_BUDGET=1 ;;
    --dry-run) DRY_RUN=1 ;;
    *) echo "Usage: $0 [--strict] [--allow-over-budget] [--dry-run]" >&2; exit 2 ;;
  esac
done
LOG="logs/deploy.log"
RESULT="logs/deploy-result.json"
PAGES_PRODUCTION_URL="${GR_PAGES_PRODUCTION_URL:-https://gold-rush-3in.pages.dev}"
mkdir -p logs
note() { echo "[deploy] $(date '+%F %T') $*" >> "$LOG"; echo "[deploy] $*"; }
DEPLOY_COMMIT="${CF_PAGES_COMMIT_SHA:-$(git rev-parse HEAD 2>/dev/null || printf 'unknown')}"
BUILD_ID="${CF_PAGES_COMMIT_SHA:-$(git rev-parse --short=8 HEAD 2>/dev/null || printf 'unknown')}"
PUBLISHED_BUILD=""
# THE BUDGET (owner desk answer A11, 2026-09-07, verbatim: "raise the budget, this is a good size in my
# opinion, we don't have to go too crazy"): the ten town-actor sheets are GATED now (the cast group's
# upper bound, 16.1 MB, joins the 15.6 MB the first town already declared), and the budget rises from
# 25,000,000 to 35,000,000 B so the whole declared payload (about 31.7 MB) sits inside it with room
# for a plate or two, not for a new map. Nothing is dieted on this ruling.
BUDGET_LIMIT=35000000
# THE TRIPWIRE CEILING (owner desk answer A7, 2026-09-07). The browser cue-window number is host
# speed, not payload — F-BUDGET-4 measured 21,589,212 / 10,540,927 / 21,638,025 bytes on ONE fixed
# build, a 2.05x swing, and 6,411,798 on the same build at an emulated 8 Mbps. It no longer decides
# anything near the budget; it only catches a build so much heavier that even a fast host cannot
# hide it. Generous on purpose: a tripwire that fires on noise is a tripwire nobody believes.
TRIPWIRE_CEILING=30000000
BUDGET_STATUS="FAIL (not measured)"
BUDGET_SUMMARY=""
BUDGET_ALLOWANCE=""
PAYLOAD_STATUS="FAIL (not measured)"
PAYLOAD_SUMMARY=""
TRIPWIRE_STATUS="FAIL (not measured)"
write_result() {
  local outcome="$1" url="$2" ts tmp
  ts="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
  tmp="$(mktemp "${RESULT}.tmp.XXXXXX")" || return 1
  printf '{"outcome":"%s","url":"%s","publishedBuild":"%s","commit":"%s","ts":"%s"}\n' "$outcome" "$url" "$PUBLISHED_BUILD" "$DEPLOY_COMMIT" "$ts" > "$tmp"
  mv "$tmp" "$RESULT"
}
finish() {
  local outcome="$1" code="$2" url="${3:-}"
  write_result "$outcome" "$url" || note "FAILED: could not write $RESULT"
  note "RELEASE VERDICT"
  note "Build: $BUILD_ID"
  # TWO NUMBERS, AND THE BLOCK SAYS WHICH IS WHICH. The PAYLOAD is what the build declares the first
  # town needs, summed from dist/ with no browser in the loop; it is the one the budget judges. The
  # PROBE is the browser cue-window transfer; it is a tripwire under a far looser ceiling because it
  # measures how much traffic happened to land before a racing signal (F-BUDGET-4).
  note "Budget: $BUDGET_STATUS$BUDGET_ALLOWANCE (limit: $BUDGET_LIMIT bytes)"
  note "  payload GATE (declared, computed from the build): $PAYLOAD_STATUS"
  if [ -n "$PAYLOAD_SUMMARY" ]; then
    while IFS= read -r row; do note "  $row"; done <<< "$PAYLOAD_SUMMARY"
  fi
  note "  probe TRIPWIRE (browser cue window, ceiling $TRIPWIRE_CEILING bytes, host speed not payload): $TRIPWIRE_STATUS"
  if [ -n "$BUDGET_SUMMARY" ]; then
    while IFS= read -r row; do note "  $row"; done <<< "$BUDGET_SUMMARY"
  fi
  if [ -f "docs/release/verdict-$BUILD_ID.md" ]; then
    note "Device verdict: PRESENT docs/release/verdict-$BUILD_ID.md (owner verdict not evaluated)"
  else
    note "Device verdict: WARN missing docs/release/verdict-$BUILD_ID.md"
  fi
  note "Outcome: $outcome"
  if [ "$STRICT" -eq 1 ] || [ "$outcome" = budget_failed ]; then exit "$code"; fi
  exit 0
}

if GIT_COMMON_DIR="$(git rev-parse --git-common-dir 2>/dev/null)"; then
  LOCK="$GIT_COMMON_DIR/gold-rush-deploy.lock"
else
  LOCK="logs/deploy.lock"
fi
command -v lockf >/dev/null 2>&1 || { note "FAILED: lockf not installed"; finish lock_failed 6; }
exec 9>"$LOCK" || { note "FAILED: could not open deploy lock"; finish lock_failed 6; }
# macOS lockf accepts an open fd; descriptor 9 holds the lock until this shell exits.
if ! lockf -s -t 0 9; then
  note "SKIP: deploy already running (exclusive lock held)"
  finish skipped 6
fi
trap 'finish interrupted 129' HUP
trap 'finish interrupted 130' INT
trap 'finish interrupted 143' TERM

note "building…"
# PRODUCTION IS E1-ONLY (owner ruling 2026-08-20, verbatim: "that is the production page - I
# don't think we should deploy E9 there"): GR_RELEASE=e1 strips every post-E1 bundle at build
# time and disables the ?debug contract door entirely (ContractFamilies.ts RELEASE_E1). Full
# builds go to PREVIEW branch deployments only (wrangler pages deploy --branch=...), never here.
# Override GR_RELEASE explicitly only on the owner's word.
if ! GR_RELEASE="${GR_RELEASE:-e1}" CF_PAGES_COMMIT_SHA="$BUILD_ID" npm run build >> "$LOG" 2>&1; then note "ABORT: build failed — never deploy a red build"; finish build_failed 3; fi
printf '{"build":"%s","builtAt":"%s"}\n' "$BUILD_ID" "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" > dist/version.json

BUDGET_OVER=0
TRIPWIRE_OVER=0
PAYLOAD_MEASURED=0
CAPTURE="$(mktemp "${TMPDIR:-/tmp}/gold-rush-deploy.XXXXXX")" || { note "FAILED: could not create deploy capture"; finish budget_failed 5; }
BUDGET_CWD="$(mktemp -d "${TMPDIR:-/tmp}/gold-rush-budget.XXXXXX")" || { note "FAILED: could not create budget workdir"; finish budget_failed 5; }
SNAPSHOT=""
trap 'rm -f "$CAPTURE"; rm -rf "$BUDGET_CWD"; [ -z "$SNAPSHOT" ] || rm -rf "$SNAPSHOT"' EXIT
note "checking first-town asset budget…"
if (
  cd "$BUDGET_CWD" || exit 1
  # NO GR_CAPTURE_EXTERNAL_SERVER here (F-1489-3, s1490). The preview config starts its OWN
  # server on :5189; the flag never suppressed it (preview overrides webServer) and there was
  # never anything listening on :5188 for it to mean. It was inert for 132 measurements, then
  # 2474c51ac wired external-server-guard into the BASE config — which the preview config
  # inherits via `...baseConfig` — and the flag started arming a :5188 probe that refuses.
  # This now matches `npm run test:asset-diet`, which has always run without the flag.
  # F-DEPLOY-1: the probe runs on its own scratch port (5297) so a lane playwright on 5189 cannot
  # turn a production deploy into a fail-closed ABORT on the wrong cause (2026-09-05).
  GR_PREVIEW_PORT="${GR_PREVIEW_PORT:-5297}" GR_ASSET_DIET_BUNDLE=1 GR_ASSET_DIET_REUSE_BUILD=1 npm --prefix "$ROOT" exec -- playwright test \
    --config "$ROOT/playwright.preview.config.ts" "$ROOT/e2e/asset-diet.spec.ts" --workers=1 \
    --project=desktop-chrome --project=mobile-chrome --grep "town cue-window budget through player entry$"
) > "$CAPTURE" 2>&1; then BUDGET_RC=0; else BUDGET_RC=$?; fi
cat "$CAPTURE" >> "$LOG"
BUDGET_MEASURED=0
BUDGET_REPORT_FAILED=0
BUDGET_PROJECTS=" "
while read -r project bytes; do
  case "$project" in
    desktop-chrome|mobile-chrome) ;;
    *) BUDGET_REPORT_FAILED=1; note "MEASUREMENT FAILED: unexpected project $project"; continue ;;
  esac
  case "$BUDGET_PROJECTS" in
    *" $project "*) BUDGET_REPORT_FAILED=1; note "MEASUREMENT FAILED: duplicate project $project"; continue ;;
  esac
  BUDGET_PROJECTS="$BUDGET_PROJECTS$project "
  BUDGET_MEASURED=$((BUDGET_MEASURED + 1))
  if [ "$bytes" -lt "$TRIPWIRE_CEILING" ]; then
    note "probe tripwire $project: $bytes / $TRIPWIRE_CEILING bytes ($((TRIPWIRE_CEILING - bytes)) bytes under the ceiling)"
  else
    TRIPWIRE_OVER=1
    note "probe tripwire $project: $bytes / $TRIPWIRE_CEILING bytes ($((bytes - TRIPWIRE_CEILING)) bytes OVER the ceiling)"
  fi
  BUDGET_SUMMARY="${BUDGET_SUMMARY:+$BUDGET_SUMMARY
}probe $project: $bytes / $TRIPWIRE_CEILING bytes"
  if TOP_FILES="$(node - "$BUDGET_CWD/artifacts/asset-diet/town-transfer-$project.json" "$bytes" <<'NODE'
const fs = require('node:fs');
try {
  const { cueWindowResponses } = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  if (!Array.isArray(cueWindowResponses) || !cueWindowResponses.length) throw new Error('no responses');
  const totals = new Map();
  for (const { url, bytes } of cueWindowResponses) {
    if (typeof url !== 'string' || !Number.isSafeInteger(bytes) || bytes < 0) throw new Error('invalid response');
    totals.set(url, (totals.get(url) ?? 0) + bytes);
  }
  const sum = [...totals.values()].reduce((a, b) => a + b, 0);
  if (!Number.isSafeInteger(sum) || sum <= 0 || sum !== Number(process.argv[3])) throw new Error('response total mismatch');
  for (const [url, bytes] of [...totals].sort((a, b) => b[1] - a[1]).slice(0, 5)) console.log(`  ${bytes} bytes ${url}`);
} catch (error) {
  console.error(`Budget file report failed: ${error.message}`);
  process.exit(1);
}
NODE
)"; then
    note "top five contributing files ($project, cue-window transfer including repeat requests):"
    while IFS= read -r row; do note "$row"; done <<< "$TOP_FILES"
  else
    BUDGET_REPORT_FAILED=1
    note "MEASUREMENT FAILED: missing or invalid per-file budget report for $project"
  fi
done < <(sed -nE 's/.*\[asset-diet\] ([^ ]+) townResponses: ([0-9]+) bytes.*/\1 \2/p' "$CAPTURE")
# F-1489-3: a gate that measured NOTHING used to emit the same WARN as a gate that measured an
# OVERAGE, so six deploys shipped past an unmeasured budget and looked exactly like a pass.
# Zero parsed projects is a failure of the instrument and is now said in its own words. It no longer
# blocks, because the budget no longer depends on it — the payload gate below needs no browser at
# all — but an instrument that says nothing must never read as an instrument that said "fine".
if [ "$BUDGET_MEASURED" -eq 0 ]; then
  note "MEASURED NOTHING: probe tripwire parsed 0 projects (playwright rc=$BUDGET_RC) — this is NOT a pass"
fi
TRIPWIRE_STATUS="PASS"
if [ "$TRIPWIRE_OVER" -ne 0 ]; then
  TRIPWIRE_STATUS="FAIL (a project exceeded the ceiling)"
elif [ "$BUDGET_RC" -ne 0 ] || [ "$BUDGET_MEASURED" -ne 2 ] || [ "$BUDGET_REPORT_FAILED" -ne 0 ]; then
  TRIPWIRE_STATUS="NOT MEASURED (probe rc=$BUDGET_RC; measured projects=$BUDGET_MEASURED; report failures=$BUDGET_REPORT_FAILED) — reported, does not gate"
fi

# ─── THE PAYLOAD GATE — WHAT THE BUILD DECLARES, NOT WHAT A BROWSER RACED ──────────────────────
# Owner desk answer A7, 2026-09-07, on the recommendation from reviews/first-town-transfer-bisect.md
# (F-BUDGET-4). The quantity above swings with the HOST: 21,589,212 / 10,540,927 / 21,638,025 bytes
# across three runs of ONE fixed build, and 6,411,798 on that same build at an emulated 8 Mbps,
# because the cue window ends at `data-asset-loading-state=ready`, a signal that tracks the scene's
# GLTF LoadingManager while ~200 sheet responses race it. Worse, it cannot count what it cannot see:
# vite preview serves the JS and CSS without a content-length, so 25 responses inside that window —
# the 1.1 MB entry chunk among them — are recorded at ZERO bytes (measured 2026-09-07,
# artifacts/first-town-payload-gate/). So the budget now judges scripts/first-town-payload.mjs,
# which sums the families assets/first-town-payload.json declares out of dist/ with no browser, no
# network and no clock in the loop.
#
# THE ABSENT-SCRIPT DOOR IS FOR ONE CALLER AND ONE ONLY. scripts/test-deploy-contract.sh:7 copies
# THIS FILE ALONE into a throwaway tree and runs its fifteen alias/verification cases there, so the
# payload script genuinely is not on disk for those runs. Falling back to the probe keeps that
# contract meaningful instead of turning every case into an instrument failure. It is not a way out
# in the real repo: scripts/deploy-budget.test.mjs asserts the script and its declaration exist
# here, so deleting either reds the guard battery rather than quietly restoring the old gate.
PAYLOAD_SCRIPT="$ROOT/scripts/first-town-payload.mjs"
if [ -f "$PAYLOAD_SCRIPT" ]; then
  if PAYLOAD_REPORT="$(node "$PAYLOAD_SCRIPT" 2>&1)"; then PAYLOAD_RC=0; else PAYLOAD_RC=$?; fi
  printf '%s\n' "$PAYLOAD_REPORT" >> "$LOG"
  PAYLOAD_BYTES="$(printf '%s\n' "$PAYLOAD_REPORT" | sed -nE 's/^first-town payload: ([0-9]+) bytes$/\1/p' | tail -1)"
  if [ "$PAYLOAD_RC" -eq 0 ] && [ -n "$PAYLOAD_BYTES" ]; then
    PAYLOAD_MEASURED=1
    if [ "$PAYLOAD_BYTES" -lt "$BUDGET_LIMIT" ]; then
      PAYLOAD_STATUS="PASS ($PAYLOAD_BYTES / $BUDGET_LIMIT bytes, $((BUDGET_LIMIT - PAYLOAD_BYTES)) bytes headroom)"
      note "first-town payload: $PAYLOAD_BYTES / $BUDGET_LIMIT bytes ($((BUDGET_LIMIT - PAYLOAD_BYTES)) bytes headroom)"
    else
      BUDGET_OVER=1
      PAYLOAD_STATUS="FAIL ($PAYLOAD_BYTES / $BUDGET_LIMIT bytes, $((PAYLOAD_BYTES - BUDGET_LIMIT)) bytes OVER)"
      note "first-town payload: $PAYLOAD_BYTES / $BUDGET_LIMIT bytes ($((PAYLOAD_BYTES - BUDGET_LIMIT)) bytes OVER)"
    fi
    # The group table and the two ungated totals ride into the verdict so an ABORT is actionable:
    # whoever reads it can see which group grew without opening the log.
    PAYLOAD_SUMMARY="$(printf '%s\n' "$PAYLOAD_REPORT" | sed -nE '/^\| /p; /^first-town payload (declared|demand-paged): /p')"
  else
    PAYLOAD_STATUS="FAIL (payload script rc=$PAYLOAD_RC; printed no total)"
    note "MEASUREMENT FAILED: scripts/first-town-payload.mjs rc=$PAYLOAD_RC — see $LOG"
    PAYLOAD_SUMMARY="$(printf '%s\n' "$PAYLOAD_REPORT" | head -8)"
  fi
else
  PAYLOAD_STATUS="NOT MEASURED (scripts/first-town-payload.mjs absent) — falling back to the probe"
  note "PAYLOAD NOT MEASURED: $PAYLOAD_SCRIPT is absent; this run falls back to gating on the browser probe"
  if [ "$BUDGET_RC" -ne 0 ] || [ "$BUDGET_MEASURED" -ne 2 ] || [ "$BUDGET_REPORT_FAILED" -ne 0 ]; then BUDGET_OVER=1; fi
  while read -r fallback_project fallback_bytes; do
    case "$fallback_project" in desktop-chrome|mobile-chrome) ;; *) continue ;; esac
    [ "$fallback_bytes" -lt "$BUDGET_LIMIT" ] || BUDGET_OVER=1
  done < <(sed -nE 's/.*\[asset-diet\] ([^ ]+) townResponses: ([0-9]+) bytes.*/\1 \2/p' "$CAPTURE")
fi

BUDGET_STATUS="PASS"
if [ "$BUDGET_OVER" -ne 0 ] || [ "$TRIPWIRE_OVER" -ne 0 ] || { [ "$PAYLOAD_MEASURED" -eq 0 ] && [ -f "$PAYLOAD_SCRIPT" ]; }; then
  BUDGET_STATUS="FAIL (payload $PAYLOAD_STATUS; tripwire $TRIPWIRE_STATUS)"
  if [ "$ALLOW_OVER_BUDGET" -ne 1 ]; then note "ABORT: first-town budget check failed; use --allow-over-budget to waive explicitly"; finish budget_failed 5; fi
  BUDGET_ALLOWANCE="; ALLOWED by --allow-over-budget"
  note "WARN: first-town budget failure explicitly allowed by --allow-over-budget; measurements above (unavailable if none)"
fi

if [ "$DRY_RUN" -eq 1 ]; then note "DRY RUN: skipping publication and assayer sync"; finish dry_run 0; fi

SNAPSHOT="$(mktemp -d "${TMPDIR:-/tmp}/gold-rush-dist.XXXXXX")" || { note "FAILED: could not create deploy snapshot"; finish deploy_failed 4; }
cp -R dist/. "$SNAPSHOT"/ || { note "FAILED: could not copy deploy snapshot"; finish deploy_failed 4; }
PUBLISHED_BUILD="$(node -e 'process.stdout.write(JSON.parse(require("fs").readFileSync(process.argv[1], "utf8")).build)' "$SNAPSHOT/version.json" 2>/dev/null)" ||
  { note "FAILED: deploy snapshot has no readable build id"; finish deploy_failed 4; }

command -v wrangler >/dev/null 2>&1 || { note "SKIP: wrangler not installed"; finish skipped 2; }
# Headless auth: scoped API token from .env.local (interactive OAuth is unusable by fires).
if [ -f .env.local ]; then set -a; . ./.env.local; set +a; fi
[ -n "${CLOUDFLARE_API_TOKEN:-}" ] || { note "SKIP: CLOUDFLARE_API_TOKEN missing from .env.local (owner one-time: create a token with 'Cloudflare Pages: Edit' permission)"; finish skipped 2; }

note "deploying snapshot $SNAPSHOT to Pages project 'gold-rush'…"
: > "$CAPTURE"
if wrangler pages deploy "$SNAPSHOT" --commit-dirty=true > "$CAPTURE" 2>&1; then DEPLOY_RC=0; else DEPLOY_RC=$?; fi
cat "$CAPTURE" >> "$LOG"
URL="$(grep -oE 'https://[a-z0-9.-]+\.pages\.dev' "$CAPTURE" | tail -1)"
if [ "$DEPLOY_RC" -ne 0 ] || [ -z "$URL" ]; then
  if [ "$DEPLOY_RC" -eq 0 ]; then
    ERROR_LINE="wrangler exited 0 but published no URL"
  else
    ERROR_LINE="$(sed $'s/\033\\[[0-9;]*m//g' "$CAPTURE" | tr -d '\r' | awk '
      /ERROR|Error:/ { found=1 }
      found && NF {
        line=$0
        sub(/^[[:space:]]+/, "", line)
        sub(/[[:space:]]+$/, "", line)
        out=out (out ? " | " : "") line
      }
      END { print out }
    ' | cut -c1-240)"
    [ -n "$ERROR_LINE" ] || ERROR_LINE="$(sed $'s/\033\\[[0-9;]*m//g' "$CAPTURE" | tr -d '\r' | awk 'NF { line=$0 } END { print line }' | cut -c1-240)"
    [ -n "$ERROR_LINE" ] || ERROR_LINE="wrangler returned no published URL"
  fi
  note "FAILED: pages deploy — $ERROR_LINE — see $LOG"
  finish deploy_failed 4
fi

note "DEPLOYED ok $URL"
VERIFY_SLEEPS="${GR_DEPLOY_VERIFY_SLEEPS:-10 15 20 30 45 60}"
read -r -a VERIFY_SLEEP_SCHEDULE <<< "$VERIFY_SLEEPS"
# F-1308-1: ${VAR:-default} substitutes on unset OR empty, but NOT on whitespace-only,
# which leaves an EMPTY array. This is /usr/bin/env bash 3.2 on the deploy host, where
# expanding an empty array under `set -u` (line 5) is an unbound-variable ERROR, not an
# empty expansion — so the "for SLEEP_SECONDS in" below aborted the script (rc=1) AFTER a
# successful upload: measured s1308, no logs/deploy-result.json was written at all and the
# log's last line read "DEPLOYED ok", i.e. it looked like a success with no verdict.
# `${#arr[@]}` is safe on an empty array; only "${arr[@]}" is not. Measured s1308.
if [ "${#VERIFY_SLEEP_SCHEDULE[@]}" -eq 0 ]; then
  read -r -a VERIFY_SLEEP_SCHEDULE <<< "10 15 20 30 45 60"
fi
VERIFY_ATTEMPTS=$(( ${#VERIFY_SLEEP_SCHEDULE[@]} + 1 ))
VERIFY_WAIT_SECONDS=0
for SLEEP_SECONDS in "${VERIFY_SLEEP_SCHEDULE[@]}"; do
  VERIFY_WAIT_SECONDS=$((VERIFY_WAIT_SECONDS + SLEEP_SECONDS))
done
for ((ATTEMPT = 1; ATTEMPT <= VERIFY_ATTEMPTS; ATTEMPT++)); do
  if LIVE_BUILD="$(node -e '
    fetch(process.argv[1], { signal: AbortSignal.timeout(20000) })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then(version => process.stdout.write(String(version.build ?? "missing")))
      .catch(() => process.exit(1));
  ' "$PAGES_PRODUCTION_URL/version.json" 2>/dev/null)"; then :; else LIVE_BUILD="unreachable"; fi
  note "VERIFY attempt $ATTEMPT/$VERIFY_ATTEMPTS: $PAGES_PRODUCTION_URL/version.json says $LIVE_BUILD"
  if [ "$LIVE_BUILD" = "$PUBLISHED_BUILD" ]; then
    note "VERIFIED published $PUBLISHED_BUILD at $PAGES_PRODUCTION_URL"
    # F-HEAT6-SKEW (2026-08-25): a deploy that moves the game engine but not the assayer's
    # tree makes every fresh tape honestly unassayable (engine-hash mismatch). The verifier
    # box rides along with every deploy, or says loudly why it could not. Fail-open by
    # design: an unreachable box must never turn a good deploy into a red.
    # F-2299-1 (s2299): `rsync -a` sends dotfiles, and .env.local was NOT excluded — so this
    # leg shipped FIVE live credentials (Cloudflare, ElevenLabs, OpenRouter, Claude OAuth) to
    # /opt/goldrush/.env.local on a public-IP box. Nothing box-side reads it: both services
    # take EnvironmentFile=/etc/goldrush-{assay,ledger}.env, outside the synced tree (runbook
    # :32,:60). Strictly subtractive, and it leaves the payload/allowlist fork (b)/(c) open.
    if ssh -o ConnectTimeout=8 -o BatchMode=yes root@<droplet> true 2>/dev/null; then
      # The mirror is a positive runtime allowlist. A sender-only final exclusion lets --delete
      # remove receiver spillover while the protect rule keeps box-installed node_modules.
      # MIRROR_FILTERS_BEGIN (parsed by deploy-mirror-allowlist.test.mjs)
      MIRROR_FILTERS=(
        "--filter=P /node_modules/***"
        "--include=/scripts/"
        "--include=/news/"
        "--include=/lore/"
        "--include=/assets/"
        "--include=/assets/audio/"
        "--include=/assets/audio/raw/"
        "--include=/assets/raw/"
        "--include=/assets/pilots/"
        "--include=/assets/pilots/map-rebuild-spike/"
        "--include=/assets/pilots/map-rebuild-spike/reconcile-late/"
        "--include=/assets/pilots/*-3d/"
        "--include=/assets/pilots/run3d/"
        "--include=/src/***"
        "--include=/scripts/assay-worker.mjs"
        "--include=/scripts/assay-replay.mjs"
        "--include=/scripts/assay-replay-agent.mjs"
        "--include=/scripts/asset-diet.mjs"
        "--include=/scripts/asset-diet.manifest.json"
        "--include=/news/herald.json"
        "--include=/lore/world-dispatches.md"
        # maps-campaign-land-era6 (2026-09-14): the encyclopedia's Archive World pages are imported ?raw by
        # src/encyclopedia (Astra's campaign), so the file joined the runtime closure the mirror is measured
        # against; deploy-mirror-allowlist.test.mjs:97 measured it missing.
        "--include=/lore/archive-world-pages.md"
        "--include=/functions/***"
        "--include=/server/***"
        "--include=/ops/***"
        "--include=/site/***"
        "--include=/public/***"
        "--include=/assets/contracts/***"
        "--include=/assets/first-town-payload.json"
        "--include=/assets/rotations/***"
        "--include=/assets/layer-contracts/***"
        "--include=/assets/crafting-queue/***"
        "--include=/assets/charters/***"
        "--include=/assets/audio/raw/*.mp3"
        "--include=/assets/processed/***"
        "--include=/assets/raw/boss-land-yacht.png"
        "--include=/assets/raw/boss-land-yacht-damage.png"
        "--include=/assets/raw/ceremony-stage-t*.png"
        "--include=/assets/raw/plate-contract-*.png"
        "--include=/assets/pilots/map-rebuild-spike/*.json"
        "--include=/assets/pilots/map-rebuild-spike/*.mjs"
        "--include=/assets/pilots/map-rebuild-spike/*.glb"
        "--include=/assets/pilots/map-rebuild-spike/reconcile-late/*.json"
        "--include=/assets/pilots/map-rebuild-spike/reconcile-late/*.mjs"
        "--include=/assets/pilots/map-rebuild-spike/landmarks/***"
        "--include=/assets/pilots/*-3d/*.e*.glb"
        "--include=/assets/pilots/railcar-3d/railcar.glb"
        "--include=/assets/pilots/claim-boat-3d/claim-boat.glb"
        "--include=/assets/pilots/claim-boat-3d/claim-boat-contract.json"
        "--include=/assets/pilots/flotilla-3d/still-room-barge.glb"
        "--include=/assets/pilots/flotilla-3d/turret-raft.glb"
        "--include=/assets/pilots/flotilla-3d/kitchen-scow.glb"
        "--include=/assets/pilots/flotilla-3d/flotilla-contract.json"
        "--include=/assets/pilots/dredge-queen-3d/dredge-queen-detail-opus5.glb"
        "--include=/assets/pilots/ark-plaza-e10-3d/ark-plaza-e10.glb"
        "--include=/assets/pilots/ark-deck-era-dressing-e10-3d/ark-deck-era-dressing-e10.glb"
        "--include=/assets/pilots/old-digger-3d/old-digger.glb"
        "--include=/assets/pilots/homemaker-9000-3d/homemaker-9000.glb"
        "--include=/assets/pilots/crawler-3d/crawler.glb"
        # F-DRB-3 (drain 2026-09-12): the boss-fidelity branch WIRED this GLB for the first time
        # (`LandYachtBossSystem.ts:15`); until then nothing imported it, so it was never on the
        # mirror. `deploy-mirror-allowlist.test.mjs:97` measured it missing from the runtime closure.
        "--include=/assets/pilots/land-yacht-3d/land-yacht.glb"
        "--include=/assets/pilots/salvage-claw-3d/salvage-claw-detail-opus5.glb"
        "--include=/assets/pilots/tavern-3d/town-v3-tavern.glb"
        "--include=/assets/pilots/general-store-3d/general-store.glb"
        "--include=/assets/pilots/claim-office-3d/claim-office.glb"
        "--include=/assets/pilots/assay-office-3d/assay-office.glb"
        "--include=/assets/pilots/chapel-3d/chapel.glb"
        "--include=/assets/pilots/schoolhouse-3d/schoolhouse.glb"
        "--include=/assets/pilots/stamp-mill-3d/stamp-mill.glb"
        "--include=/assets/pilots/dynamo-hall-3d/dynamo-hall.glb"
        "--include=/assets/pilots/town-plate-3d/town-plate.glb"
        "--include=/assets/pilots/plaza-props-3d/*.e*.glb"
        "--include=/assets/pilots/plaza-props-3d/era-props.e*.json"
        "--include=/assets/pilots/plaza-props-3d/covered_wagon.glb"
        "--include=/assets/pilots/plaza-props-3d/water_trough.glb"
        "--include=/assets/pilots/plaza-props-3d/pan_monument.glb"
        "--include=/assets/pilots/baron-props-3d/baron-props.glb"
        "--include=/assets/pilots/run3d/*.glb"
        "--include=/package.json"
        "--include=/package-lock.json"
        "--include=/tsconfig.json"
        "--include=/vite.config.ts"
        "--include=/index.html"
        "--include=/assets/engine-era.json"
        "--filter=-s *"
      )
      # MIRROR_FILTERS_END
      if rsync -az --delete --timeout=60 "${MIRROR_FILTERS[@]}" ./ root@<droplet>:/opt/goldrush/ 2>/dev/null \
        && ssh -o BatchMode=yes root@<droplet> "sed -i 's/^ASSAY_BUILD_ID=.*/ASSAY_BUILD_ID=$PUBLISHED_BUILD/' /etc/goldrush-assay.env && systemctl restart goldrush-ledger goldrush-assay" 2>/dev/null; then
        note "ASSAYER SYNCED: droplet tree + pin $PUBLISHED_BUILD, services restarted"
        # F-DISK-0902: the first allowlisted sync measured 1,456 MB including protected node_modules;
        # 2,184 MB is that measured runtime weight plus 50% headroom.
        MIRROR_MB="$(ssh -o BatchMode=yes root@<droplet> "du -sm /opt/goldrush 2>/dev/null | cut -f1" 2>/dev/null)"
        if [ -n "${MIRROR_MB:-}" ]; then
          if [ "$MIRROR_MB" -gt 2184 ]; then note "MIRROR-BLOAT: /opt/goldrush is ${MIRROR_MB} MB after sync (ceiling 2184) — the runtime mirror exceeded its measured weight plus 50%; check the allowlist before the next deploy"; else note "mirror weight after sync: ${MIRROR_MB} MB"; fi
        fi
      else
        note "ASSAYER SYNC FAILED mid-step: droplet may be mixed-state — run the runbook sync by hand before trusting fresh verdicts"
      fi
    else
      note "ASSAYER NOT SYNCED (box unreachable): fresh tapes will be unassayable until the runbook sync runs"
    fi
    finish deployed 0 "$URL"
  fi
  [ "$ATTEMPT" -gt "${#VERIFY_SLEEP_SCHEDULE[@]}" ] || sleep "${VERIFY_SLEEP_SCHEDULE[$((ATTEMPT - 1))]}"
done
note "UNVERIFIED after $VERIFY_ATTEMPTS attempts over ~${VERIFY_WAIT_SECONDS}s: uploaded $PUBLISHED_BUILD, alias still reports $LIVE_BUILD. This is either a slow alias promotion or a genuinely stale alias — re-probe the alias and run 'wrangler pages deployment list' before treating it as a failure."
finish deploy_unverified 7 "$URL"
