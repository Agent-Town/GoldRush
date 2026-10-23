#!/bin/bash
# droplet-maintenance.sh — the attended hand for the county server's updates (F-SRV-1, 2026-10-22). One phase per call.
#   status     read-only: kernel running vs installed, pending updates, services needing restart, node versions
#   upgrade    GR_OWNER_APPLY=1: apt-get update && apt-get -y upgrade (the pending noble-updates), then needrestart -r a
#   tls-tidy   GR_OWNER_APPLY=1: the global nginx.conf ssl_protocols line becomes "TLSv1.2 TLSv1.3" (the HTTPS server already is), nginx -t, reload
#   reboot     GR_OWNER_APPLY=1: reboot the droplet (about two minutes of downtime), then wait and print health
#   node       GR_OWNER_APPLY=1: nvm install <ver>, sync the engine copy (deploy.sh's mirror, rollback dir), repoint the three units, align
#              ASSAY_BUILD_ID, ledger then worker restart, gates (runtime, no refusal, engine hash = main's), automatic rollback
# Never prints the host; remote output is IP-scrubbed; the log is ~/.goldrush/maintenance/maintenance.log.
set -u; export PATH=/opt/homebrew/bin:$PATH; R="/Users/robin/Claude/Projects/Gold Rush"; cd "$R" || exit 1
PH=${1:?phase: status|upgrade|tls-tidy|reboot|node}; VER=${2:-26.12.1}; OUT=~/.goldrush/maintenance; mkdir -p "$OUT"; LOG="$OUT/maintenance.log"
scrub() { sed -E 's/[0-9]{1,3}(\.[0-9]{1,3}){3}/<ip>/g'; }
log() { echo "$(date -u '+%Y-%m-%dT%H:%M:%SZ') [$PH] $*" | tee -a "$LOG"; }
H=$(grep -E '^GR_DROPLET_HOST=' .env.local | cut -d= -f2- | tr -d '"'); [ -n "$H" ] || { log "no droplet host"; exit 1; }
gate() { [ "${GR_OWNER_APPLY:-0}" = 1 ] || { log "GR_OWNER_APPLY=1 is required: this phase writes on the owner's server and runs only on his word"; exit 1; }; }
rssh() { ssh -o BatchMode=yes -o ConnectTimeout=10 "$H" "$@" 2>&1 | scrub | tee -a "$LOG"; }
case "$PH" in
  status) rssh 'echo "kernel running $(uname -r), installed newest $(ls /boot/vmlinuz-* | sed "s#/boot/vmlinuz-##" | sort -V | tail -1); up $(uptime -p)"; echo "pending: security $(apt list --upgradable 2>/dev/null | grep -c noble-security), updates $(apt list --upgradable 2>/dev/null | grep -c noble-updates)"; echo "reboot required: $([ -f /var/run/reboot-required ] && echo yes || echo no); services needing restart: $(needrestart -b 2>/dev/null | grep -c NEEDRESTART-SVC)"; echo "node: ledger $(systemctl show goldrush-ledger -p ExecStart --no-pager | grep -oE "v[0-9.]+/bin/node" | head -1), assay $(systemctl show goldrush-assay -p ExecStart --no-pager | grep -oE "v[0-9.]+/bin/node" | head -1)"; echo "nginx $(nginx -v 2>&1 | sed "s/nginx version: //"), $(dpkg -s nginx | grep ^Version)"';;
  upgrade) gate; log "apt upgrade on the droplet"; rssh 'export DEBIAN_FRONTEND=noninteractive; apt-get -qq update && apt-get -y -q -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" upgrade 2>&1 | tail -4; echo "upgradable now: $(apt list --upgradable 2>/dev/null | grep -c /)"; needrestart -r a -b 2>/dev/null | grep -E "NEEDRESTART-(KSTA|SVC)" | head -6; echo "reboot required: $([ -f /var/run/reboot-required ] && echo yes || echo no)"';;
  tls-tidy) gate; log "global ssl_protocols → TLSv1.2 TLSv1.3"; rssh 'F=/etc/nginx/nginx.conf; B="$F.before-tls-$(date -u +%Y%m%dT%H%M%SZ)"; cp -p "$F" "$B"; sed -i -E "s/^(\s*)ssl_protocols TLSv1 TLSv1\.1 TLSv1\.2 TLSv1\.3;/\1ssl_protocols TLSv1.2 TLSv1.3;/" "$F"; if nginx -t 2>&1 | tail -1 && systemctl reload nginx; then echo "reloaded; backup $B"; grep -nE "^\s*ssl_protocols" "$F"; else cp -p "$B" "$F"; nginx -t && systemctl reload nginx; echo "RESTORED $B"; fi';;
  reboot) gate; log "rebooting the droplet (about two minutes)"; ssh -o BatchMode=yes -o ConnectTimeout=10 "$H" 'systemctl reboot' >/dev/null 2>&1; sleep 45; for i in $(seq 1 30); do ssh -o BatchMode=yes -o ConnectTimeout=5 "$H" 'uname -r' >/dev/null 2>&1 && break; sleep 10; done; rssh 'echo "back: kernel $(uname -r), up $(uptime -p)"; for s in nginx goldrush-ledger goldrush-assay; do echo "$s: $(systemctl is-active $s)"; done; echo "reboot required now: $([ -f /var/run/reboot-required ] && echo yes || echo no)"'; log "public health: $(bash scripts/health-watch.sh status 2>/dev/null | grep -oE 'landing=[0-9]+ game=[0-9]+ api=[0-9a-z-]+' | head -1)";;
  node) gate
    # The sequence verified by hand on 2026-10-23 (F-SRV-1): the assay worker refuses any Node but the one pinned in
    # ITS OWN engine copy, so the copy is synced first (the deploy script's mirror allowlist, with a rollback dir), then
    # the units and the build id move, the ledger restarts and must answer before the worker restarts (else the
    # worker's first poll logs a harmless "fetch failed" backoff; a gate must not read that as a refusal).
    grep -q "CANONICAL_ASSAY_NODE_VERSION = '$VER'" scripts/assay-replay-agent.mjs || { log "the repo's pin is not $VER (the pin task has not landed); refusing"; exit 1; }
    sed -n '/^ *MIRROR_FILTERS=(/,/# MIRROR_FILTERS_END/p' scripts/deploy.sh > "$OUT/mirror-filters.sh"; . "$OUT/mirror-filters.sh"; [ "${#MIRROR_FILTERS[@]}" -gt 10 ] || { log "could not read the deploy mirror allowlist"; exit 1; }
    BUILD=$(curl -s --max-time 20 https://agenttown.app/goldrush/version.json | python3 -c 'import sys,json; print(json.load(sys.stdin)["build"])' 2>/dev/null); [ -n "$BUILD" ] || { log "no live build id"; exit 1; }
    LH=$(node --input-type=module -e "import { computeEngineHash } from './scripts/assay-replay-agent.mjs'; console.log(await computeEngineHash())" 2>/dev/null | tail -1); grep -q "$LH" assets/engine-era.json || { log "main's engine hash $LH is not registered; refusing"; exit 1; }
    ST=$(date -u +%Y%m%dT%H%M%SZ); log "node $VER: build $BUILD, engine $LH, stamp $ST"
    rssh "export NVM_DIR=/root/.nvm; . \$NVM_DIR/nvm.sh >/dev/null 2>&1; nvm install $VER >/dev/null 2>&1; echo installed \$(/root/.nvm/versions/node/v$VER/bin/node --version); for f in /etc/systemd/system/goldrush-assay.service /etc/systemd/system/goldrush-ledger.service /etc/systemd/system/goldrush-ledger-backup.service /etc/goldrush-assay.env; do cp -p \$f \$f.before-node-$ST; done"
    rsync -az --itemize-changes --copy-unsafe-links --delete --timeout=60 --backup --backup-dir="/opt/goldrush-prev-$ST" "${MIRROR_FILTERS[@]}" ./ "$H:/opt/goldrush/" > "$OUT/mirror-$ST.txt" 2> "$OUT/mirror-$ST.err" || { log "mirror sync failed (see $OUT/mirror-$ST.err); nothing restarted"; exit 1; }
    log "mirror synced: $(grep -cE '^[<>]f' "$OUT/mirror-$ST.txt") files"
    rssh "ST=$ST; for u in goldrush-assay goldrush-ledger goldrush-ledger-backup; do sed -i -E 's#/root/.nvm/versions/node/v[0-9.]+/bin/node#/root/.nvm/versions/node/v$VER/bin/node#g' /etc/systemd/system/\$u.service; done; sed -i 's/^ASSAY_BUILD_ID=.*/ASSAY_BUILD_ID=$BUILD/' /etc/goldrush-assay.env; systemctl daemon-reload
      systemctl restart goldrush-ledger; for i in \$(seq 1 30); do [ \"\$(curl -s -o /dev/null -w '%{http_code}' 'http://127.0.0.1:8791/api/standings?epoch=epoch-1-frontier&contract=e1-baron')\" = 200 ] && break; sleep 1; done
      T0=\$(date -u '+%Y-%m-%d %H:%M:%S'); systemctl restart goldrush-assay; sleep 65; OK=1
      for s in goldrush-ledger goldrush-assay; do A=\$(systemctl is-active \$s); N=\$(systemctl show \$s -p NRestarts --value); E=\$(readlink /proc/\$(systemctl show \$s -p MainPID --value)/exe); echo \"\$s: \$A, restarts \$N, \$E\"; [ \"\$A\" = active ] && [ \"\$N\" = 0 ] && echo \"\$E\" | grep -q v$VER || OK=0; done
      R=\$(journalctl -u goldrush-assay --since \"\$T0\" --no-pager | grep -c 'requires Node'); B=\$(journalctl -u goldrush-assay --since \"\$T0\" --no-pager | grep -c api_backoff); echo \"refusals \$R, backoffs \$B\"; [ \"\$R\" = 0 ] && [ \"\$B\" -le 1 ] || OK=0
      BH=\$(cd /opt/goldrush && /root/.nvm/versions/node/v$VER/bin/node --input-type=module -e \"import { computeEngineHash } from './scripts/assay-replay-agent.mjs'; console.log(await computeEngineHash('/opt/goldrush'))\" 2>/dev/null | tail -1); echo \"box engine \$BH\"; [ \"\$BH\" = '$LH' ] || OK=0
      if [ \$OK = 1 ]; then echo VERIFIED; else echo 'FAILED: rolling back'; for u in goldrush-assay goldrush-ledger goldrush-ledger-backup; do cp -p /etc/systemd/system/\$u.service.before-node-\$ST /etc/systemd/system/\$u.service; done; cp -p /etc/goldrush-assay.env.before-node-\$ST /etc/goldrush-assay.env; rsync -a /opt/goldrush-prev-\$ST/ /opt/goldrush/; systemctl daemon-reload; systemctl restart goldrush-ledger; sleep 5; systemctl restart goldrush-assay; sleep 10; echo \"after rollback: ledger \$(systemctl is-active goldrush-ledger), assay \$(systemctl is-active goldrush-assay)\"; fi"
    log "public health: $(bash scripts/health-watch.sh status 2>/dev/null | grep -oE 'landing=[0-9]+ game=[0-9]+ api=[0-9a-z-]+' | head -1)";;
  *) log "unknown phase"; exit 1;;
esac
