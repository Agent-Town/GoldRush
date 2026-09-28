#!/bin/bash
export PATH=/opt/homebrew/bin:$PATH; R="/Users/robin/Claude/Projects/Gold Rush"; S=/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush-history-local/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/attr
CAND=~/.goldrush/control/wt-holds1-candidate; BASE=~/.goldrush/control/wt-1ff7054fe; PORT=5309
prep() { local W=$1 C=$2; [ -d "$W" ] || git -C "$R" worktree add --detach "$W" "$C" >/dev/null 2>&1; [ -e "$W/node_modules" ] || ln -s "$R/node_modules" "$W/node_modules"; if [ -L "$W/assets/pilots" ] && [ ! -e "$W/assets/pilots/map-rebuild-spike" ]; then rm "$W/assets/pilots" && ln -s /Users/robin/Claude/Projects/GoldRush-assets/pilots "$W/assets/pilots"; fi; ls "$W/assets/pilots/map-rebuild-spike/glow-mesa-terrain-contract.json" >/dev/null || { echo "arena $W: asset unreachable"; exit 1; }; echo "arena $W at $(git -C "$W" rev-parse --short HEAD) ready"; }
prep "$CAND" cf9cd95c4; prep "$BASE" 1ff7054fe
CMD="npx vite --port $PORT --strictPort --host 127.0.0.1"; echo "server command: $CMD"
lsof -iTCP:$PORT -sTCP:LISTEN -t >/dev/null 2>&1 && { echo "port $PORT busy"; exit 1; }
trial() { local name=$1 W=$2; echo "=== trial $name in $W $(date -u '+%H:%M:%SZ') load $(sysctl -n vm.loadavg)"; mkdir -p "$S/$name"
  (cd "$W" && bash -c "$CMD" > "$S/$name/vite.log" 2>&1 & echo $! > "$S/$name/vite.pid"); local n=0; until curl -sf "http://127.0.0.1:$PORT/" >/dev/null 2>&1; do sleep 2; n=$((n+2)); [ $n -ge 180 ] && { echo "server never answered: $(tail -n 3 "$S/$name/vite.log")"; kill $(cat "$S/$name/vite.pid") 2>/dev/null; exit 1; }; done
  local t0=$(date +%s); (cd "$W" && GR_NATIVE_PROOF=1 GR_NATIVE_RUN="99/attr-$name" GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL="http://127.0.0.1:$PORT" npx playwright test e2e/native-proofs/e6-glow-mesa.spec.ts --project=mobile-chrome --workers=1 --reporter=line --output="$S/$name/results" > "$S/$name/playwright.log" 2>&1); local rc=$?; echo "playwright rc=$rc in $(( $(date +%s) - t0 )) s: $(grep -E '^\s*[0-9]+ (passed|failed)' "$S/$name/playwright.log" | tr '\n' ' ')"
  local row="$W/artifacts/sol/play-proofs/run-99/attr-$name/e6-glow-mesa/row-mobile-chrome.json"; if [ -f "$row" ]; then cp "$row" "$S/$name/row-mobile-chrome.json"; python3 - "$row" <<'PY'
import json,sys; r=json.load(open(sys.argv[1])); fs=r.get('finalSnapshot') or {}
def st(k): v=r.get(k) or {}; return f"{k}={'ok' if v.get('ok') else 'FAIL'}: {str(v.get('detail',''))[:110]}"
print('  ', st('secures')); print('  ', st('banks')); print('  ', st('reloads') if 'reloads' in r else '   (no reloads key)'); print('   terminal wave', fs.get('wave'), 'hp', fs.get('hp') or fs.get('heroHp'), 'sim', fs.get('simSeconds') or fs.get('sim'), 'errors', r.get('errors'))
PY
  else echo "   no row file at $row"; fi
  local pid=$(cat "$S/$name/vite.pid"); kill "$pid" 2>/dev/null; pkill -P "$pid" 2>/dev/null; sleep 3; lsof -iTCP:$PORT -sTCP:LISTEN -t 2>/dev/null | xargs -r kill 2>/dev/null; sleep 2; return 0; }
trial cand-1 "$CAND"; trial base-1 "$BASE"; trial base-2 "$BASE"; trial cand-2 "$CAND"
echo "=== all four trials done $(date -u '+%H:%M:%SZ')"
