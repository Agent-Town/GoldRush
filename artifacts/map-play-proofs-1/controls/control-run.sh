#!/bin/bash
# map-play-proofs-1, the banks attribution: ONE locked command, run through dlock.sh by the second implementer.
# A: today's tree (wt-mpp1, branch test/map-play-proofs-1) on 5319 — the secure spec on e1-dry-gulch (one of the
#    spec's original six) desktop, then e2e/locked-win.spec.ts "leaving at secure" desktop (the game's own assertion
#    that the secured row exists BEFORE the Return-to-Town click).
# B: the tree before ux-entry-robustness-1 (detached d30d50451, wt-mpp1-control) on 5320 — the same two, the secure
#    spec narrowed by GR_SECURE_ONLY because that tree has no GR_SECURE_CONTRACTS.
# Each server is started, waited for and stopped (by the PIDs started here) inside this command. Sequential, never two
# servers at once. Playwright output goes to scratch dirs so the worktree's test-results are not wiped.
set -u
MYSP=/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush-history-local/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad
TODAY=/Users/robin/Claude/Projects/wt-mpp1
CTRL=/Users/robin/Claude/Projects/wt-mpp1-control
export PATH=/opt/homebrew/bin:$PATH
echo "CONTROL START $(date -u '+%Y-%m-%dT%H:%M:%SZ')"

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

# ---- A: today's tree -------------------------------------------------------------------------------
echo "== A today $(git -C "$TODAY" rev-parse --short HEAD) $(date -u '+%H:%M:%SZ')"; uptime
if serve "$TODAY" 5319 ctl-today; then
  GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5319 GR_PLAYABILITY_SECURE=1 GR_SECURE_CONTRACTS=e1-dry-gulch \
    npx playwright test e2e/playability-secure.spec.ts --project=desktop-chrome --workers=1 --reporter=line --output="$MYSP/pw-ctl-today-secure"
  echo "A.secure RC=$? at $(date -u '+%H:%M:%SZ')"
  GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5319 \
    npx playwright test e2e/locked-win.spec.ts --project=desktop-chrome --workers=1 --reporter=line -g "leaving at secure" --output="$MYSP/pw-ctl-today-lockedwin"
  echo "A.lockedwin RC=$? at $(date -u '+%H:%M:%SZ')"
  unserve 5319
fi

# ---- B: the tree before ux-entry-robustness-1 ------------------------------------------------------------
echo "== B control $(git -C "$CTRL" rev-parse --short HEAD) $(date -u '+%H:%M:%SZ')"; uptime
if serve "$CTRL" 5320 ctl-d30d50451; then
  GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5320 GR_PLAYABILITY_SECURE=1 GR_SECURE_ONLY=e1-dry-gulch \
    npx playwright test e2e/playability-secure.spec.ts --project=desktop-chrome --workers=1 --reporter=line --output="$MYSP/pw-ctl-old-secure"
  echo "B.secure RC=$? at $(date -u '+%H:%M:%SZ')"
  GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5320 \
    npx playwright test e2e/locked-win.spec.ts --project=desktop-chrome --workers=1 --reporter=line -g "leaving at secure" --output="$MYSP/pw-ctl-old-lockedwin"
  echo "B.lockedwin RC=$? at $(date -u '+%H:%M:%SZ')"
  unserve 5320
fi
cp "$CTRL/artifacts/open-maps-acceptance-e1-e4/secure-rows.jsonl" "$MYSP/control-rows-d30d50451.jsonl" 2>/dev/null && echo "control rows copied"
echo "CONTROL END $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
