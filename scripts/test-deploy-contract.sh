#!/usr/bin/env bash
set -eu

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP="$(mktemp -d "${TMPDIR:-/tmp}/gold-rush-deploy-test.XXXXXX")"
mkdir -p "$TMP/repo/scripts" "$TMP/repo/logs" "$TMP/repo/dist" "$TMP/bin"
cp "$ROOT/scripts/deploy.sh" "$TMP/repo/scripts/deploy.sh"

cat > "$TMP/server.mjs" <<'SERVER'
import fs from 'node:fs';
import http from 'node:http';

const [stateFile, countFile, portFile] = process.argv.slice(2);
const server = http.createServer((_request, response) => {
  const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  const count = Number(fs.readFileSync(countFile, 'utf8') || 0);
  fs.writeFileSync(countFile, String(count + 1));
  if (state.status) {
    response.writeHead(state.status);
    response.end();
    return;
  }
  const builds = state.builds;
  response.setHeader('content-type', 'application/json');
  response.end(JSON.stringify({ build: builds[Math.min(count, builds.length - 1)] }));
});
server.listen(0, '127.0.0.1', () => {
  fs.writeFileSync(portFile, String(server.address().port));
});
SERVER
printf '0' > "$TMP/count"
printf '{"builds":["test-build"]}' > "$TMP/state.json"
node "$TMP/server.mjs" "$TMP/state.json" "$TMP/count" "$TMP/port" &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true; wait "$SERVER_PID" 2>/dev/null || true; rm -rf "$TMP"' EXIT
for _ in 1 2 3 4 5; do [ -s "$TMP/port" ] && break; sleep 1; done
[ -s "$TMP/port" ] || { echo 'local alias server failed to start' >&2; exit 1; }
ALIAS_URL="http://127.0.0.1:$(cat "$TMP/port")"

cat > "$TMP/bin/npm" <<'STUB'
#!/usr/bin/env bash
echo npm >> "$STUB_CALLS"
exit "${STUB_NPM_RC:-0}"
STUB
cat > "$TMP/bin/wrangler" <<'STUB'
#!/usr/bin/env bash
echo wrangler >> "$STUB_CALLS"
if [ "${STUB_WRANGLER_RC:-0}" -eq 0 ]; then
  echo 'Uploading... (1335/3053)'
  [ "${STUB_WRANGLER_URL:-yes}" = yes ] && echo 'Deployment complete: https://stub-gold-rush.pages.dev'
fi
exit "${STUB_WRANGLER_RC:-0}"
STUB
chmod +x "$TMP/bin/npm" "$TMP/bin/wrangler" "$TMP/repo/scripts/deploy.sh"

run_case() {
  local name="$1" mode="$2" token="$3" npm_rc="$4" wrangler_rc="$5" expected_rc="$6" outcome="$7" url="$8"
  local alias_mode="${9:-current}" wrangler_url="${10:-yes}" started elapsed
  rm -f "$TMP/repo/logs/deploy.log" "$TMP/repo/logs/deploy-result.json" "$TMP/calls"
  printf '0' > "$TMP/count"
  case "$alias_mode" in
    current) printf '{"builds":["test-build"]}' > "$TMP/state.json" ;;
    stale) printf '{"builds":["old-build"]}' > "$TMP/state.json" ;;
    retry) printf '{"builds":["old-build","test-build"]}' > "$TMP/state.json" ;;
    http500) printf '{"status":500}' > "$TMP/state.json" ;;
  esac
  started="$(date +%s)"
  set +e
  PATH="$TMP/bin:$PATH" STUB_CALLS="$TMP/calls" STUB_NPM_RC="$npm_rc" STUB_WRANGLER_RC="$wrangler_rc" \
    STUB_WRANGLER_URL="$wrangler_url" CLOUDFLARE_API_TOKEN="$token" CF_PAGES_COMMIT_SHA=test-build \
    GR_PAGES_PRODUCTION_URL="$ALIAS_URL" bash "$TMP/repo/scripts/deploy.sh" $mode >/dev/null 2>&1
  local actual_rc=$?
  set -e
  elapsed=$(($(date +%s) - started))
  [ "$actual_rc" -eq "$expected_rc" ] || { echo "$name: expected rc $expected_rc, got $actual_rc" >&2; exit 1; }
  local uploaded=0
  grep -qx wrangler "$TMP/calls" 2>/dev/null && uploaded=1
  node - "$TMP/repo/logs/deploy-result.json" "$outcome" "$url" "$uploaded" <<'NODE'
const [file, outcome, url, uploaded] = process.argv.slice(2);
const result = JSON.parse(require('node:fs').readFileSync(file, 'utf8'));
if (Object.keys(result).sort().join(',') !== 'commit,outcome,publishedBuild,ts,url') throw new Error('unexpected result fields');
if (result.outcome !== outcome || result.url !== url) throw new Error(`unexpected result ${JSON.stringify(result)}`);
if (typeof result.commit !== 'string' || !result.commit) throw new Error('missing commit');
if (typeof result.publishedBuild !== 'string') throw new Error('invalid publishedBuild');
if (uploaded === '1' && !result.publishedBuild) throw new Error('missing publishedBuild after upload');
if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(result.ts)) throw new Error('invalid ts');
NODE
  echo "PASS $name (rc=$actual_rc, ${elapsed}s)"
  case "$name" in
    alias-current)
      grep -F "VERIFIED published test-build at $ALIAS_URL" "$TMP/repo/logs/deploy.log"
      ;;
    alias-stale)
      grep -F "UNVERIFIED: uploaded test-build but $ALIAS_URL/version.json says old-build" "$TMP/repo/logs/deploy.log"
      grep -E 'VERIFY attempt' "$TMP/repo/logs/deploy.log"
      ;;
    alias-http-500)
      grep -F "UNVERIFIED: uploaded test-build but $ALIAS_URL/version.json says unreachable" "$TMP/repo/logs/deploy.log"
      grep -E 'VERIFY attempt' "$TMP/repo/logs/deploy.log"
      ;;
    alias-retry)
      [ "$(grep -c 'VERIFY attempt' "$TMP/repo/logs/deploy.log")" -eq 2 ] || { echo 'alias-retry did not stop at the first match' >&2; exit 1; }
      grep -E 'VERIFY attempt|VERIFIED published' "$TMP/repo/logs/deploy.log"
      ;;
    wrangler-no-url)
      grep -F 'FAILED: pages deploy — wrangler exited 0 but published no URL — see logs/deploy.log' "$TMP/repo/logs/deploy.log"
      ! grep -E 'FAILED: pages deploy.*Uploading' "$TMP/repo/logs/deploy.log"
      ;;
  esac
}

run_case strict-skip --strict '' 0 0 2 skipped ''
run_case strict-build-red --strict fake-test-token 3 0 3 build_failed ''
[ "$(cat "$TMP/calls")" = npm ] || { echo 'build-red called wrangler' >&2; exit 1; }
run_case strict-deploy-red --strict fake-test-token 0 4 4 deploy_failed ''
run_case strict-success --strict fake-test-token 0 0 0 deployed https://stub-gold-rush.pages.dev
run_case default-skip '' '' 0 0 0 skipped ''
run_case default-build-red '' fake-test-token 3 0 0 build_failed ''
run_case default-deploy-red '' fake-test-token 0 4 0 deploy_failed ''
run_case alias-current --strict fake-test-token 0 0 0 deployed https://stub-gold-rush.pages.dev current
run_case alias-stale --strict fake-test-token 0 0 7 deploy_unverified https://stub-gold-rush.pages.dev stale
run_case alias-http-500 --strict fake-test-token 0 0 7 deploy_unverified https://stub-gold-rush.pages.dev http500
run_case alias-retry --strict fake-test-token 0 0 0 deployed https://stub-gold-rush.pages.dev retry
run_case wrangler-no-url --strict fake-test-token 0 0 4 deploy_failed '' current no

echo 'deploy contract PASS (production alias current/stale/500/retry/no-url; strict 0/2/3/4/7; default failures return 0)'
