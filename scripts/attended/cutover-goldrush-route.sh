#!/bin/bash
# cutover-goldrush-route.sh — the attended hand for Option B (F-2987-1, owner 2026-10-09: "lets fix this once and for all
# in a proper way"). One phase per invocation, in the runbook's order (docs/ops/agenttown-server.md, "Static game route
# cutover"). Never prints the droplet host or any token; every remote line is IP-scrubbed.
#   deploy          build + deploy the game to the Pages alias (scripts/deploy.sh): the headers fix and the pins go live
#   droplet         WRITE on the droplet (requires GR_OWNER_APPLY=1, the owner's explicit word): stage conf + verifier,
#                   back up the live conf, nginx -t, reload; restores the backup if either fails
#   verify-droplet  run ops/droplet/verify-goldrush-route.sh on the droplet (read-only), print its table
#   route-off       record the Worker route to ~/.goldrush/cutover/, then DELETE it via the Cloudflare API (this Mac's
#                   wrangler OAuth session, workers_routes write); re-list to confirm
#   verify-public   the runbook's step 4: canonical URLs 200, version body, asset twice (cf-cache-status HIT), health
#   rollback        re-create the route from the saved record, verify the canonical URLs again
set -u; export PATH=/opt/homebrew/bin:$PATH; R="/Users/robin/Claude/Projects/Gold Rush"; cd "$R" || exit 1
PH=${1:?phase: deploy|droplet|verify-droplet|route-off|verify-public|rollback}; OUT=~/.goldrush/cutover; mkdir -p "$OUT"; LOG="$OUT/cutover.log"
scrub() { sed -E 's/[0-9]{1,3}(\.[0-9]{1,3}){3}/<ip>/g'; }
log() { echo "$(date -u '+%Y-%m-%dT%H:%M:%SZ') [$PH] $*" | tee -a "$LOG"; }
host() { grep -E '^GR_DROPLET_HOST=' .env.local | cut -d= -f2- | tr -d '"'; }
token() { grep -oE '^oauth_token *= *"[^"]+"' ~/Library/Preferences/.wrangler/config/default.toml | sed -E 's/^oauth_token *= *"//; s/"$//'; }
zone() { curl -s --max-time 20 -H "Authorization: Bearer $1" "https://api.cloudflare.com/client/v4/zones?name=agenttown.app" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['result'][0]['id'] if d.get('success') and d['result'] else '')"; }
case "$PH" in
  deploy)
    git diff --quiet -- public/_headers && grep -q '! Cache-Control' public/_headers || { log "public/_headers on main does not carry the detach rules yet (hac1 not landed); refusing"; exit 1; }
    log "deploying the game to the Pages alias from main $(git rev-parse --short main)"; bash scripts/deploy.sh 2>&1 | tee -a "$LOG" | grep -E "RELEASE VERDICT|published|Build|budget|PASS|FAIL|error" | head -12
    log "live version: $(curl -s --max-time 15 https://gold-rush-3in.pages.dev/version.json | head -c 120)";;
  droplet)
    [ "${GR_OWNER_APPLY:-0}" = 1 ] || { log "GR_OWNER_APPLY=1 is required: the droplet write runs only on the owner's explicit word"; exit 1; }
    H=$(host); [ -n "$H" ] || { log "no droplet host"; exit 1; }
    git diff --quiet -- ops/droplet/agenttown.app.nginx.conf && grep -q 'location /goldrush/ {' ops/droplet/agenttown.app.nginx.conf || { log "the proxy block is not on main (gsr1 not landed); refusing"; exit 1; }
    log "staging conf + verifier on the droplet"; scp -q ops/droplet/agenttown.app.nginx.conf ops/droplet/verify-goldrush-route.sh "$H:/opt/goldrush/ops/droplet/" 2>&1 | scrub | tee -a "$LOG"
    ssh -o BatchMode=yes "$H" 'set -e; cd /opt/goldrush; CONF=$(readlink -f /etc/nginx/sites-enabled/agenttown.app.conf); B="$CONF.before-static-$(date -u +%Y%m%dT%H%M%SZ)"; sudo cp -p "$CONF" "$B"; echo "backup: $B"; sudo cp ops/droplet/agenttown.app.nginx.conf "$CONF"; if sudo nginx -t 2>&1 && sudo systemctl reload nginx; then echo "nginx reloaded with the proxy block"; else echo "nginx -t or reload FAILED; restoring $B"; sudo cp -p "$B" "$CONF"; sudo nginx -t && sudo systemctl reload nginx; exit 1; fi' 2>&1 | scrub | tee -a "$LOG";;
  verify-droplet)
    H=$(host); ssh -o BatchMode=yes "$H" 'cd /opt/goldrush && sudo env PATH=/root/.nvm/versions/node/v26.4.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin bash ops/droplet/verify-goldrush-route.sh' 2>&1 | scrub | tee -a "$LOG" | tail -16;;
  route-off)
    T=$(token); [ -n "$T" ] || { log "no wrangler OAuth token on this Mac; delete the route in the dashboard instead"; exit 1; }
    Z=$(zone "$T"); [ -n "$Z" ] || { log "zone lookup failed (token expired? run wrangler whoami from /tmp to refresh)"; exit 1; }
    curl -s --max-time 20 -H "Authorization: Bearer $T" "https://api.cloudflare.com/client/v4/zones/$Z/workers/routes" > "$OUT/routes-before.json"
    RID=$(python3 -c "import json; d=json.load(open('$OUT/routes-before.json')); print(next((r['id'] for r in d.get('result') or [] if r.get('pattern')=='agenttown.app/goldrush*'), ''))")
    [ -n "$RID" ] || { log "route agenttown.app/goldrush* not found (already removed?)"; exit 0; }
    log "deleting route agenttown.app/goldrush* (record kept in $OUT/routes-before.json)"; curl -s --max-time 20 -X DELETE -H "Authorization: Bearer $T" "https://api.cloudflare.com/client/v4/zones/$Z/workers/routes/$RID" | python3 -c "import sys,json; d=json.load(sys.stdin); print('delete success:', d.get('success'), 'errors:', d.get('errors'))" | tee -a "$LOG"
    curl -s --max-time 20 -H "Authorization: Bearer $T" "https://api.cloudflare.com/client/v4/zones/$Z/workers/routes" | python3 -c "import sys,json; d=json.load(sys.stdin); print('routes now:', [r.get('pattern') for r in d.get('result') or []])" | tee -a "$LOG";;
  verify-public)
    for U in https://agenttown.app/goldrush/ https://agenttown.app/goldrush/version.json https://agenttown.app/goldrush/skill.md https://agenttown.app/api/stats; do log "$U → $(curl -s -o /dev/null --connect-timeout 10 --max-time 30 -w '%{http_code}' "$U")"; done
    log "version body: $(curl -s --max-time 30 https://agenttown.app/goldrush/version.json | head -c 120)"
    A=$(curl -s --max-time 30 https://agenttown.app/goldrush/ | grep -oE 'assets/[A-Za-z0-9._-]+\.js' | head -1); for i in 1 2; do log "asset GET $i: $(curl -sI --max-time 30 "https://agenttown.app/goldrush/$A" | grep -iE '^(HTTP/|cache-control|cf-cache-status)' | tr -d '\r' | tr '\n' ' ')"; done
    log "health: $(bash scripts/health-watch.sh status 2>/dev/null | grep -oE 'edge=[^ ]+' | head -1)";;
  rollback)
    T=$(token); Z=$(zone "$T"); S=$(python3 -c "import json; d=json.load(open('$OUT/routes-before.json')); r=next((r for r in d.get('result') or [] if r.get('pattern')=='agenttown.app/goldrush*'), {}); print(r.get('script',''))"); [ -n "$S" ] || { log "no saved route record"; exit 1; }
    log "re-creating route agenttown.app/goldrush* -> $S"; curl -s --max-time 20 -X POST -H "Authorization: Bearer $T" -H 'Content-Type: application/json' --data "{\"pattern\":\"agenttown.app/goldrush*\",\"script\":\"$S\"}" "https://api.cloudflare.com/client/v4/zones/$Z/workers/routes" | python3 -c "import sys,json; d=json.load(sys.stdin); print('create success:', d.get('success'), 'errors:', d.get('errors'))" | tee -a "$LOG"
    for U in https://agenttown.app/goldrush/ https://agenttown.app/goldrush/version.json https://agenttown.app/api/stats; do log "$U → $(curl -s -o /dev/null --max-time 30 -w '%{http_code}' "$U")"; done;;
  *) log "unknown phase $PH"; exit 1;;
esac