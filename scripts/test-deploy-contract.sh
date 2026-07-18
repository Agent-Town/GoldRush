#!/usr/bin/env bash
set -eu

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP="$(mktemp -d "${TMPDIR:-/tmp}/gold-rush-deploy-test.XXXXXX")"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$TMP/repo/scripts" "$TMP/repo/logs" "$TMP/repo/dist" "$TMP/bin"
cp "$ROOT/scripts/deploy.sh" "$TMP/repo/scripts/deploy.sh"

cat > "$TMP/bin/npm" <<'STUB'
#!/usr/bin/env bash
echo npm >> "$STUB_CALLS"
exit "${STUB_NPM_RC:-0}"
STUB
cat > "$TMP/bin/wrangler" <<'STUB'
#!/usr/bin/env bash
echo wrangler >> "$STUB_CALLS"
if [ "${STUB_WRANGLER_RC:-0}" -eq 0 ]; then echo 'Deployment complete: https://stub-gold-rush.pages.dev'; fi
exit "${STUB_WRANGLER_RC:-0}"
STUB
chmod +x "$TMP/bin/npm" "$TMP/bin/wrangler" "$TMP/repo/scripts/deploy.sh"

run_case() {
  local name="$1" mode="$2" token="$3" npm_rc="$4" wrangler_rc="$5" expected_rc="$6" outcome="$7" url="$8"
  rm -f "$TMP/repo/logs/deploy.log" "$TMP/repo/logs/deploy-result.json" "$TMP/calls"
  set +e
  PATH="$TMP/bin:$PATH" STUB_CALLS="$TMP/calls" STUB_NPM_RC="$npm_rc" STUB_WRANGLER_RC="$wrangler_rc" \
    CLOUDFLARE_API_TOKEN="$token" bash "$TMP/repo/scripts/deploy.sh" $mode >/dev/null 2>&1
  local actual_rc=$?
  set -e
  [ "$actual_rc" -eq "$expected_rc" ] || { echo "$name: expected rc $expected_rc, got $actual_rc" >&2; exit 1; }
  node - "$TMP/repo/logs/deploy-result.json" "$outcome" "$url" <<'NODE'
const [file, outcome, url] = process.argv.slice(2);
const result = JSON.parse(require('node:fs').readFileSync(file, 'utf8'));
if (Object.keys(result).sort().join(',') !== 'commit,outcome,ts,url') throw new Error('unexpected result fields');
if (result.outcome !== outcome || result.url !== url) throw new Error(`unexpected result ${JSON.stringify(result)}`);
if (typeof result.commit !== 'string' || !result.commit) throw new Error('missing commit');
if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(result.ts)) throw new Error('invalid ts');
NODE
}

run_case strict-skip --strict '' 0 0 2 skipped ''
run_case strict-build-red --strict fake-test-token 3 0 3 build_failed ''
[ "$(cat "$TMP/calls")" = npm ] || { echo 'build-red called wrangler' >&2; exit 1; }
run_case strict-deploy-red --strict fake-test-token 0 4 4 deploy_failed ''
run_case strict-success --strict fake-test-token 0 0 0 deployed https://stub-gold-rush.pages.dev
run_case default-skip '' '' 0 0 0 skipped ''
run_case default-build-red '' fake-test-token 3 0 0 build_failed ''
run_case default-deploy-red '' fake-test-token 0 4 0 deploy_failed ''

echo 'deploy contract PASS (strict 0/2/3/4; default failures return 0)'
