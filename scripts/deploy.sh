#!/usr/bin/env bash
# Gold Rush — deploy the current gated build to Cloudflare Pages.
# Called by fires after handoff (DEPLOY LAW) or manually. Never blocks anything:
# missing wrangler/auth/project = clean skip with a note, exit 0.
set -u
ROOT="/Users/robin/Claude/Projects/Gold Rush"
cd "$ROOT" || exit 1
LOG="logs/deploy.log"
mkdir -p logs
note() { echo "[deploy] $(date '+%F %T') $*" >> "$LOG"; echo "[deploy] $*"; }

command -v wrangler >/dev/null 2>&1 || { note "SKIP: wrangler not installed"; exit 0; }
# Headless auth: scoped API token from .env.local (interactive OAuth is unusable by fires).
if [ -f .env.local ]; then set -a; . ./.env.local; set +a; fi
[ -n "${CLOUDFLARE_API_TOKEN:-}" ] || { note "SKIP: CLOUDFLARE_API_TOKEN missing from .env.local (owner one-time: create a token with 'Cloudflare Pages: Edit' permission)"; exit 0; }

note "building…"
if ! npm run build >> "$LOG" 2>&1; then note "ABORT: build failed — never deploy a red build"; exit 0; fi

note "deploying dist/ to Pages project 'gold-rush'…"
if wrangler pages deploy --commit-dirty=true >> "$LOG" 2>&1; then
  URL=$(grep -oE 'https://[a-z0-9.-]*pages\.dev[^ ]*' "$LOG" | tail -1)
  note "DEPLOYED ok ${URL:-'(url in log)'}"
else
  note "FAILED: pages deploy — see $LOG (auth expired? project missing? owner: wrangler login / pages project create gold-rush)"
fi
exit 0
