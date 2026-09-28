#!/bin/bash
# map-play-proofs-1, banks attribution part C + the master's self-check: ONE locked command (second implementer).
# The briefed e1-dry-gulch controls cannot reach the banks cell unless the generic kit survives to wave 20 (it died at
# wave 17 on today's tree). C runs a map that DOES secure under the generic kit (e10-last-claim, secure wave 8, secured
# on both projects in batch b3) on both trees with the SAME instrument: today's spec file, whose only change since
# d30d50451 is the GR_SECURE_CONTRACTS override, copied into the control tree as a NEW file (no tracked file there is
# edited). Then tsc, the two node guards and the --list shape on today's tree (no server). Servers are started, waited
# for and stopped by the PIDs started here, one at a time.
set -u
MYSP=/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush-history-local/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad
TODAY=/Users/robin/Claude/Projects/wt-mpp1
CTRL=/Users/robin/Claude/Projects/wt-mpp1-control
export PATH=/opt/homebrew/bin:$PATH
echo "CONTROL-C START $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
serve() { # <dir> <port> <label>
  cd "$1" || return 9
  npx vite --host 127.0.0.1 --port "$2" --strictPort > "$MYSP/vite-$2-$3.log" 2>&1 &
  VP=$!
  local ready=0 ct=""
  for i in $(seq 1 60); do
    ct=$(curl -s -o /dev/null -D - "http://127.0.0.1:$2/@vite/client" 2>/dev/null | tr -d '\r' | grep -i '^content-type:' | head -1)
    case "$ct" in *javascript*) ready=1; break;; esac
    sleep 2
  done
  if [ "$ready" != 1 ]; then echo "VITE $2 NOT READY (last: '$ct')"; unserve "$2"; return 3; fi
  echo "vite $3 up on $2 at $(date -u '+%H:%M:%SZ') ($ct), pid $VP"
}
unserve() { # <port>
  for kid in $(pgrep -P "$VP" 2>/dev/null); do kill "$kid" 2>/dev/null; done
  kill "$VP" 2>/dev/null; sleep 3
  if curl -s -o /dev/null --max-time 3 "http://127.0.0.1:$1/"; then echo "WARNING: $1 still answering"; else echo "port $1 released"; fi
}

echo "== C1 today $(git -C "$TODAY" rev-parse --short HEAD) $(date -u '+%H:%M:%SZ')"; uptime
if serve "$TODAY" 5319 ctlc-today; then
  GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5319 GR_PLAYABILITY_SECURE=1 GR_SECURE_CONTRACTS=e10-last-claim \
    npx playwright test e2e/playability-secure.spec.ts --project=desktop-chrome --workers=1 --reporter=line --output="$MYSP/pw-ctlc-today"
  echo "C1.secure RC=$? at $(date -u '+%H:%M:%SZ')"
  unserve 5319
fi

echo "== C2 control $(git -C "$CTRL" rev-parse --short HEAD) $(date -u '+%H:%M:%SZ')"; uptime
cp "$TODAY/e2e/playability-secure.spec.ts" "$CTRL/e2e/mpp1-control-playability-secure.spec.ts" && echo "instrument copied: $(shasum -a 256 "$CTRL/e2e/mpp1-control-playability-secure.spec.ts" | cut -c1-16)"
if serve "$CTRL" 5320 ctlc-d30d50451; then
  GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5320 GR_PLAYABILITY_SECURE=1 GR_SECURE_CONTRACTS=e10-last-claim \
    npx playwright test e2e/mpp1-control-playability-secure.spec.ts --project=desktop-chrome --workers=1 --reporter=line --output="$MYSP/pw-ctlc-old"
  echo "C2.secure RC=$? at $(date -u '+%H:%M:%SZ')"
  unserve 5320
fi
mv "$CTRL/e2e/mpp1-control-playability-secure.spec.ts" "$MYSP/mpp1-control-playability-secure.spec.ts" && echo "instrument copy moved out of the control tree"
cp "$CTRL/artifacts/open-maps-acceptance-e1-e4/secure-rows.jsonl" "$MYSP/control-rows-d30d50451.jsonl" 2>/dev/null && echo "control rows copied ($(wc -l < "$MYSP/control-rows-d30d50451.jsonl") rows)"

echo "== self-check today $(date -u '+%H:%M:%SZ')"
cd "$TODAY" || exit 9
npx tsc; echo "tsc RC=$?"
GR_GUARD_NO_ARTIFACT=1 node --test scripts/citation-title-guard.test.mjs scripts/no-emdash-guard.test.mjs 2>&1 | grep -E "^# (tests|pass|fail)"; echo "guards RC=${PIPESTATUS[0]}"
echo "list unset: $(npx playwright test e2e/playability-secure.spec.ts --list 2>/dev/null | grep -c 'playability-secure.spec.ts:')"
echo "list unset ids: $(npx playwright test e2e/playability-secure.spec.ts --list 2>/dev/null | grep -o 'e[0-9]*-[a-z-]* plays' | sort -u | tr '\n' ' ')"
echo "list eighteen: $(GR_SECURE_CONTRACTS=e1-baron,e2-pressure-garden,e2-incline,e3-blackout-ridge,e3-canyon-works,e3-fairground,e4-dust-flats,e4-gusher-county,e4-boneyard,e8-far-side,e8-low-orbit,e8-eclipse,e9-dome-basin,e9-seed-run,e9-devils-alley,e9-old-canal,e10-last-claim,e10-river npx playwright test e2e/playability-secure.spec.ts --list 2>/dev/null | grep -c 'playability-secure.spec.ts:')"
echo "CONTROL-C END $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
