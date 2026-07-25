#!/usr/bin/env bash
# Agent Town — deploy the static marketing page to Cloudflare Pages.
# Missing wrangler/auth/site is a clean skip or abort; never touch gold-rush Pages.
set -u

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT" || exit 1

note() { echo "[deploy-site] $*"; }

command -v wrangler >/dev/null 2>&1 || { note "SKIP: wrangler not installed"; exit 0; }

if [ -f .env.local ]; then
  set -a
  . ./.env.local
  set +a
fi

[ -n "${CLOUDFLARE_API_TOKEN:-}" ] || {
  note "SKIP: CLOUDFLARE_API_TOKEN missing from .env.local"
  exit 0
}

[ -d site ] || { note "ABORT: site/ missing"; exit 0; }

LOG="logs/deploy-site.log"
mkdir -p logs
log_note() { echo "[deploy-site] $(date '+%F %T') $*" >> "$LOG"; note "$*"; }
STAGE="$(mktemp -d "${TMPDIR:-/tmp}/agenttown-site.XXXXXX")"
CAPTURE="$(mktemp "${TMPDIR:-/tmp}/agenttown-deploy.XXXXXX")" || { note "ABORT: could not create deploy capture"; exit 0; }
trap 'rm -rf "$STAGE"; rm -f "$CAPTURE"' EXIT
cp -R site/. "$STAGE"/
if [ -d news ]; then
  mkdir -p "$STAGE/news"
  cp -R news/. "$STAGE/news"/
fi
# F-1057-1: success requires a published URL from THIS run's output, never wrangler's exit code —
# wrangler 4.107.0 exits 0 after publishing nothing (F-1049-1, which cost 174 undeployed commits).
# The capture is truncated per attempt so a run that publishes nothing can never inherit an earlier
# run's URL out of the cumulative log. Mirrors scripts/deploy.sh:90-113.
deploy() {
  : > "$CAPTURE"
  local rc=0
  wrangler pages deploy "$STAGE" --project-name agenttown --commit-dirty=true > "$CAPTURE" 2>&1 || rc=$?
  cat "$CAPTURE" >> "$LOG"
  return "$rc"
}
published_url() { grep -oE 'https://[a-z0-9.-]*pages\.dev[^ ]*' "$CAPTURE" | tail -1; }

log_note "deploying site/ to Pages project 'agenttown'..."
URL=""
if deploy; then URL="$(published_url)"; fi
if [ -n "$URL" ]; then
  log_note "DEPLOYED ok $URL"
  exit 0
fi

log_note "initial deploy published no URL; trying Pages project create for 'agenttown'"
if wrangler pages project create agenttown --production-branch main >> "$LOG" 2>&1 && deploy; then
  URL="$(published_url)"
fi
if [ -n "$URL" ]; then
  log_note "DEPLOYED ok $URL"
else
  log_note "FAILED: pages deploy — wrangler published no URL (an exit code alone is not proof — F-1049-1) — see $LOG"
fi

exit 0
