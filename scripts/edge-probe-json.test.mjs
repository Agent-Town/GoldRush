import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

// Execute the real probe and classification blocks, without watchdog side effects.
const cases = [
  ['SPA fallback', 'text/html; charset=utf-8', '<!doctype html><html>SPA</html>', '200-html'],
  ['healthy empty stats', 'application/json; charset=utf-8', '{"ok":true,"empty":true,"stats":{}}', '200'],
  ['healthy populated stats', 'Application/JSON', '{"ok":true,"stats":{"runs":{"allTime":1}}}', '200'],
  ['HTML labelled JSON', 'application/json', '<html>SPA</html>', '200-notjson'],
  ['malformed JSON', 'application/json', '{"ok":true,"stats":', '200-notjson'],
  ['missing stats', 'application/json', '{"ok":true}', '200-notjson'],
  ['error payload', 'application/json', '{"ok":false,"stats":{}}', '200-notjson'],
  ['null payload', 'application/json', 'null', '200-notjson'],
  ['array stats', 'application/json', '{"ok":true,"stats":[]}', '200-notjson'],
  ['no content type', '', '{"ok":true,"stats":{}}', '200-notjson'],
  ['wrong content type', 'text/plain', '{"ok":true,"stats":{}}', '200-notjson'],
  ['near-match content type', 'application/jsonp', '{"ok":true,"stats":{}}', '200-notjson'],
  ['empty body', 'application/json', '', '200-notjson'],
  ['HTTP error', 'application/json', '{"ok":true,"stats":{}}', '503', '503'],
  ['no response', '', '', '000', '000', '28'],
  ['unfinished transfer', 'application/json', '{"ok":true,"stats":{}}', '200-incomplete', '200', '28'],
];

for (const file of ['scripts/health-watch.sh', 'ops/droplet/edge-watch.sh']) {
  const source = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
  const mac = file.startsWith('scripts/');
  const start = source.indexOf(mac ? 'edge_one() {' : 'code() {');
  const end = source.indexOf(mac ? 'dashboard() {' : 'SVC_BAD=""', start);
  assert.ok(start >= 0 && end > start, `${file}: probe block missing`);
  const classification = mac
    ? `EDGE="$(edge_probe)"\n${source.match(/^EDGE_DARK=.*$/m)[0]}\nDARK="$EDGE_DARK"`
    : 'EDGE="landing=$L game=$G api=$A"';
  for (const [name, type, body, expected, code = '200', rc = '0'] of cases) {
    test(`${file}: ${name}`, () => {
      const result = spawnSync('bash', ['-c', `
set -u
curl() {
  local url="" format=""
  while [ "$#" -gt 0 ]; do
    case "$1" in
      -w) format="$2"; shift ;;
      https://*) url="$1" ;;
    esac
    shift
  done
  case "$url" in
    */api/stats)
      if [[ "$format" == *content_type* ]]; then
        printf '%s\\n%s %s' "$FIXTURE_BODY" "$FIXTURE_CODE" "$FIXTURE_TYPE"
      else
        printf '%s' "$FIXTURE_CODE"
      fi
      return "$FIXTURE_RC" ;;
    *) printf 200 ;;
  esac
}
${source.slice(start, end)}
${classification}
printf '%s\\ndark=%s\\n' "$EDGE" "\${DARK:+yes}"
`], {
        encoding: 'utf8', timeout: 10_000,
        env: { ...process.env, ...(mac ? { PATH: '/usr/bin:/bin:/usr/sbin:/sbin' } : {}), FIXTURE_BODY: body, FIXTURE_TYPE: type, FIXTURE_CODE: code, FIXTURE_RC: rc },
      });
      assert.equal(result.status, 0, result.stderr || String(result.error));
      assert.equal(result.stdout, `landing=200 game=200 api=${expected}\ndark=${expected === '200' ? '' : 'yes'}\n`);
    });
  }
}
