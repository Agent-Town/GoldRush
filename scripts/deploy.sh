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
if ! CF_PAGES_COMMIT_SHA="$BUILD_ID" npm run build >> "$LOG" 2>&1; then note "ABORT: build failed — never deploy a red build"; finish build_failed 3; fi
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
for ATTEMPT in 1 2 3; do
  if LIVE_BUILD="$(node -e '
    fetch(process.argv[1], { signal: AbortSignal.timeout(20000) })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then(version => process.stdout.write(String(version.build ?? "missing")))
      .catch(() => process.exit(1));
  ' "$PAGES_PRODUCTION_URL/version.json" 2>/dev/null)"; then :; else LIVE_BUILD="unreachable"; fi
  note "VERIFY attempt $ATTEMPT/3: $PAGES_PRODUCTION_URL/version.json says $LIVE_BUILD"
  if [ "$LIVE_BUILD" = "$PUBLISHED_BUILD" ]; then
    note "VERIFIED published $PUBLISHED_BUILD at $PAGES_PRODUCTION_URL"
    finish deployed 0 "$URL"
  fi
  [ "$ATTEMPT" -eq 3 ] || sleep 15
done
note "UNVERIFIED: uploaded $PUBLISHED_BUILD but $PAGES_PRODUCTION_URL/version.json says $LIVE_BUILD"
finish deploy_unverified 7 "$URL"
