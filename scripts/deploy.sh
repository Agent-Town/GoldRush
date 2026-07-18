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

command -v wrangler >/dev/null 2>&1 || { note "SKIP: wrangler not installed"; finish skipped 2; }
# Headless auth: scoped API token from .env.local (interactive OAuth is unusable by fires).
if [ -f .env.local ]; then set -a; . ./.env.local; set +a; fi
[ -n "${CLOUDFLARE_API_TOKEN:-}" ] || { note "SKIP: CLOUDFLARE_API_TOKEN missing from .env.local (owner one-time: create a token with 'Cloudflare Pages: Edit' permission)"; finish skipped 2; }

note "building…"
BUILD_ID="${CF_PAGES_COMMIT_SHA:-$(git rev-parse --short=8 HEAD 2>/dev/null || printf 'unknown')}"
if ! CF_PAGES_COMMIT_SHA="$BUILD_ID" npm run build >> "$LOG" 2>&1; then note "ABORT: build failed — never deploy a red build"; finish build_failed 3; fi
printf '{"build":"%s","builtAt":"%s"}\n' "$BUILD_ID" "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" > dist/version.json

note "deploying dist/ to Pages project 'gold-rush'…"
CAPTURE="$(mktemp "${TMPDIR:-/tmp}/gold-rush-deploy.XXXXXX")" || { note "FAILED: could not create deploy capture"; finish deploy_failed 4; }
trap 'rm -f "$CAPTURE"' EXIT
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
