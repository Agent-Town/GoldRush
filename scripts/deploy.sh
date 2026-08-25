#!/usr/bin/env bash
# Gold Rush — deploy the current gated build to Cloudflare Pages.
# Called by fires after handoff (DEPLOY LAW) or manually. Never blocks anything:
# missing wrangler/auth skips; build/deploy failures are logged; default mode exits 0.
set -u
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT" || exit 1
STRICT=0
[ "${1:-}" = "--strict" ] && STRICT=1
LOG="logs/deploy.log"
RESULT="logs/deploy-result.json"
PAGES_PRODUCTION_URL="${GR_PAGES_PRODUCTION_URL:-https://gold-rush-3in.pages.dev}"
mkdir -p logs
note() { echo "[deploy] $(date '+%F %T') $*" >> "$LOG"; echo "[deploy] $*"; }
DEPLOY_COMMIT="${CF_PAGES_COMMIT_SHA:-$(git rev-parse HEAD 2>/dev/null || printf 'unknown')}"
PUBLISHED_BUILD=""
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
  if [ "$STRICT" -eq 1 ]; then exit "$code"; fi
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
BUILD_ID="${CF_PAGES_COMMIT_SHA:-$(git rev-parse --short=8 HEAD 2>/dev/null || printf 'unknown')}"
# PRODUCTION IS E1-ONLY (owner ruling 2026-08-20, verbatim: "that is the production page - I
# don't think we should deploy E9 there"): GR_RELEASE=e1 strips every post-E1 bundle at build
# time and disables the ?debug contract door entirely (ContractFamilies.ts RELEASE_E1). Full
# builds go to PREVIEW branch deployments only (wrangler pages deploy --branch=...), never here.
# Override GR_RELEASE explicitly only on the owner's word.
if ! GR_RELEASE="${GR_RELEASE:-e1}" CF_PAGES_COMMIT_SHA="$BUILD_ID" npm run build >> "$LOG" 2>&1; then note "ABORT: build failed — never deploy a red build"; finish build_failed 3; fi
printf '{"build":"%s","builtAt":"%s"}\n' "$BUILD_ID" "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" > dist/version.json

BUDGET_LIMIT=25000000
BUDGET_OVER=0
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
  GR_ASSET_DIET_BUNDLE=1 GR_ASSET_DIET_REUSE_BUILD=1 npm --prefix "$ROOT" exec -- playwright test \
    --config "$ROOT/playwright.preview.config.ts" "$ROOT/e2e/asset-diet.spec.ts" --workers=1 \
    --grep "honest town and claim cues"
) > "$CAPTURE" 2>&1; then BUDGET_RC=0; else BUDGET_RC=$?; fi
cat "$CAPTURE" >> "$LOG"
BUDGET_MEASURED=0
while read -r project bytes; do
  BUDGET_MEASURED=$((BUDGET_MEASURED + 1))
  if [ "$bytes" -lt "$BUDGET_LIMIT" ]; then
    note "asset budget $project: $bytes bytes ($((BUDGET_LIMIT - bytes)) bytes headroom)"
  else
    BUDGET_OVER=1
    note "asset budget $project: $bytes bytes ($((bytes - BUDGET_LIMIT)) bytes OVER)"
  fi
done < <(sed -nE 's/.*\[asset-diet\] ([^ ]+) townResponses: ([0-9]+) bytes.*/\1 \2/p' "$CAPTURE")
# F-1489-3: a gate that measured NOTHING used to emit the same WARN as a gate that measured an
# OVERAGE, so six deploys shipped past an unmeasured budget and looked exactly like a pass.
# Zero parsed projects is a failure of the instrument and is now said in its own words.
if [ "$BUDGET_MEASURED" -eq 0 ]; then
  note "MEASURED NOTHING: asset budget parsed 0 projects (playwright rc=$BUDGET_RC) — this is NOT a pass"
fi
if [ "$BUDGET_RC" -ne 0 ] || [ "$BUDGET_OVER" -ne 0 ] || [ "$BUDGET_MEASURED" -eq 0 ]; then
  if [ "$STRICT" -eq 1 ]; then note "ABORT: asset budget check failed in strict mode"; finish budget_failed 5; fi
  note "WARN: asset budget check failed — default mode continues"
fi

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
      if rsync -az --delete --timeout=60 --exclude .env.local --exclude .git --exclude node_modules --exclude worktrees --exclude artifacts --exclude logs --exclude tasks --exclude .claude --exclude .wrangler --exclude dist ./ root@<droplet>:/opt/goldrush/ 2>/dev/null \
        && ssh -o BatchMode=yes root@<droplet> "sed -i 's/^ASSAY_BUILD_ID=.*/ASSAY_BUILD_ID=$PUBLISHED_BUILD/' /etc/goldrush-assay.env && systemctl restart goldrush-ledger goldrush-assay" 2>/dev/null; then
        note "ASSAYER SYNCED: droplet tree + pin $PUBLISHED_BUILD, services restarted"
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
