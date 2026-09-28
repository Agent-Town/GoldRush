#!/bin/bash
# map-play-proofs-1 item 3: ONE locked batch. Args: <label> <comma-id-list> [project args...]
# Default project args: both projects. Dev server on 5319 started, waited for and stopped inside here.
set -u
W=/Users/robin/Claude/Projects/wt-mpp1
S=/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad
LABEL="$1"; shift
IDS="$1"; shift
if [ "$#" -gt 0 ]; then PROJ=("$@"); else PROJ=(--project=desktop-chrome --project=mobile-chrome); fi
export PATH=/opt/homebrew/bin:$PATH
cd "$W" || exit 9
echo "BATCH $LABEL start $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
echo "ids=$IDS projects=${PROJ[*]}"
uptime
npx vite --host 127.0.0.1 --port 5319 --strictPort > "$S/vite-5319-$LABEL.log" 2>&1 &
VP=$!
ready=0; ct=""
for i in $(seq 1 60); do
  ct=$(curl -s -o /dev/null -D - "http://127.0.0.1:5319/@vite/client" 2>/dev/null | tr -d '\r' | grep -i '^content-type:' | head -1)
  case "$ct" in *javascript*) ready=1; break;; esac
  sleep 2
done
if [ "$ready" != 1 ]; then echo "VITE NOT READY as dev (last: '$ct')"; kill "$VP" 2>/dev/null; echo "BATCH $LABEL RC=3 ended $(date -u '+%H:%M:%SZ')"; exit 3; fi
echo "vite dev up $(date -u '+%H:%M:%SZ') ($ct)"
GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5319 GR_PLAYABILITY_SECURE=1 GR_SECURE_CONTRACTS="$IDS" \
  npx playwright test e2e/playability-secure.spec.ts "${PROJ[@]}" --workers=1 --reporter=line
rc=$?
for kid in $(pgrep -P "$VP" 2>/dev/null); do kill "$kid" 2>/dev/null; done
kill "$VP" 2>/dev/null
sleep 3
if curl -s -o /dev/null --max-time 3 "http://127.0.0.1:5319/"; then echo "WARNING: 5319 still answering"; else echo "port 5319 released"; fi
echo "BATCH $LABEL RC=$rc ended $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
exit $rc
