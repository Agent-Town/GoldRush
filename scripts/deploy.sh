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
mkdir -p logs
note() { echo "[deploy] $(date '+%F %T') $*" >> "$LOG"; echo "[deploy] $*"; }
DEPLOY_COMMIT="${CF_PAGES_COMMIT_SHA:-$(git rev-parse HEAD 2>/dev/null || printf 'unknown')}"
write_result() {
  local outcome="$1" url="$2" ts tmp
  ts="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
  tmp="$(mktemp "${RESULT}.tmp.XXXXXX")" || return 1
  printf '{"outcome":"%s","url":"%s","commit":"%s","ts":"%s"}\n' "$outcome" "$url" "$DEPLOY_COMMIT" "$ts" > "$tmp"
  mv "$tmp" "$RESULT"
}
finish() {
  local outcome="$1" code="$2" url="${3:-}"
  write_result "$outcome" "$url" || note "FAILED: could not write $RESULT"
  if [ "$STRICT" -eq 1 ]; then exit "$code"; fi
  exit 0
}

note "building…"
BUILD_ID="${CF_PAGES_COMMIT_SHA:-$(git rev-parse --short=8 HEAD 2>/dev/null || printf 'unknown')}"
if ! CF_PAGES_COMMIT_SHA="$BUILD_ID" npm run build >> "$LOG" 2>&1; then note "ABORT: build failed — never deploy a red build"; finish build_failed 3; fi
printf '{"build":"%s","builtAt":"%s"}\n' "$BUILD_ID" "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" > dist/version.json

BUDGET_LIMIT=25000000
BUDGET_OVER=0
CAPTURE="$(mktemp "${TMPDIR:-/tmp}/gold-rush-deploy.XXXXXX")" || { note "FAILED: could not create deploy capture"; finish budget_failed 5; }
BUDGET_CWD="$(mktemp -d "${TMPDIR:-/tmp}/gold-rush-budget.XXXXXX")" || { note "FAILED: could not create budget workdir"; finish budget_failed 5; }
trap 'rm -f "$CAPTURE"; rm -rf "$BUDGET_CWD"' EXIT
note "checking first-town asset budget…"
if (
  cd "$BUDGET_CWD" || exit 1
  GR_CAPTURE_EXTERNAL_SERVER=1 GR_ASSET_DIET_REUSE_BUILD=1 npm --prefix "$ROOT" exec -- playwright test \
    --config "$ROOT/playwright.preview.config.ts" "$ROOT/e2e/asset-diet.spec.ts" --workers=1 \
    --grep "honest town and claim cues"
) > "$CAPTURE" 2>&1; then BUDGET_RC=0; else BUDGET_RC=$?; fi
cat "$CAPTURE" >> "$LOG"
while read -r project bytes; do
  if [ "$bytes" -lt "$BUDGET_LIMIT" ]; then
    note "asset budget $project: $bytes bytes ($((BUDGET_LIMIT - bytes)) bytes headroom)"
  else
    BUDGET_OVER=1
    note "asset budget $project: $bytes bytes ($((bytes - BUDGET_LIMIT)) bytes OVER)"
  fi
done < <(sed -nE 's/.*\[asset-diet\] ([^ ]+) townResponses: ([0-9]+) bytes.*/\1 \2/p' "$CAPTURE")
if [ "$BUDGET_RC" -ne 0 ] || [ "$BUDGET_OVER" -ne 0 ]; then
  if [ "$STRICT" -eq 1 ]; then note "ABORT: asset budget check failed in strict mode"; finish budget_failed 5; fi
  note "WARN: asset budget check failed — default mode continues"
fi

command -v wrangler >/dev/null 2>&1 || { note "SKIP: wrangler not installed"; finish skipped 2; }
# Headless auth: scoped API token from .env.local (interactive OAuth is unusable by fires).
if [ -f .env.local ]; then set -a; . ./.env.local; set +a; fi
[ -n "${CLOUDFLARE_API_TOKEN:-}" ] || { note "SKIP: CLOUDFLARE_API_TOKEN missing from .env.local (owner one-time: create a token with 'Cloudflare Pages: Edit' permission)"; finish skipped 2; }

note "deploying dist/ to Pages project 'gold-rush'…"
: > "$CAPTURE"
if wrangler pages deploy --commit-dirty=true > "$CAPTURE" 2>&1; then
  cat "$CAPTURE" >> "$LOG"
  URL=$(grep -oE 'https://[a-z0-9.-]+\.pages\.dev' "$CAPTURE" | tail -1)
  note "DEPLOYED ok ${URL:-'(url in log)'}"
  finish deployed 0 "${URL:-}"
else
  cat "$CAPTURE" >> "$LOG"
  note "FAILED: pages deploy — see $LOG (auth expired? project missing? owner: wrangler login / pages project create gold-rush)"
  finish deploy_failed 4
fi
