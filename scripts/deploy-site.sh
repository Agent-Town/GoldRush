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
deploy() { wrangler pages deploy site --project-name agenttown --commit-dirty=true >> "$LOG" 2>&1; }

log_note "deploying site/ to Pages project 'agenttown'..."
if deploy; then
  URL=$(grep -oE 'https://[a-z0-9.-]*pages\.dev[^ ]*' "$LOG" | tail -1)
  log_note "DEPLOYED ok ${URL:-'(url in log)'}"
  exit 0
fi

log_note "initial deploy failed; trying Pages project create for 'agenttown'"
if wrangler pages project create agenttown --production-branch main >> "$LOG" 2>&1 && deploy; then
  URL=$(grep -oE 'https://[a-z0-9.-]*pages\.dev[^ ]*' "$LOG" | tail -1)
  log_note "DEPLOYED ok ${URL:-'(url in log)'}"
else
  log_note "FAILED: pages deploy — see $LOG"
fi

exit 0
