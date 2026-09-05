import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

const LIMIT = 25_000_000;
const OVER = [26_000_000, 4000, 3000, 2000, 1000, 500];

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'gold-rush-deploy-budget-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const dir of ['scripts', 'bin', 'docs/release']) mkdirSync(join(root, dir), { recursive: true });
  copyFileSync(new URL('./deploy.sh', import.meta.url), join(root, 'scripts/deploy.sh'));
  writeFileSync(join(root, '.env.local'), ': > credentials-loaded\n');
  writeFileSync(join(root, 'bin/lockf'), '#!/bin/sh\nexit "${LOCK_RC:-0}"\n', { mode: 0o755 });
  // The build stub creates real files; the probe stub measures those files and emits the
  // existing asset-diet console + JSON contract. No browser, credentials or network needed.
  writeFileSync(join(root, 'bin/npm'), `#!${process.execPath}
const fs = require('node:fs');
const path = require('node:path');
const root = process.env.FIXTURE_ROOT;
const assets = path.join(root, 'dist/assets');
if (process.argv[2] === 'run') {
  if (process.env.BUILD_RC) process.exit(Number(process.env.BUILD_RC));
  fs.mkdirSync(assets, { recursive: true });
  JSON.parse(process.env.ASSET_SIZES).forEach((size, i) => {
    const file = path.join(assets, 'asset-' + i + '.glb');
    fs.writeFileSync(file, '');
    fs.truncateSync(file, size);
  });
} else {
  const args = process.argv.slice(2);
  if (args[args.indexOf('--grep') + 1] !== 'town cue-window budget through player entry$'
      || !args.includes('--project=desktop-chrome') || !args.includes('--project=mobile-chrome')) process.exit(2);
  if (process.env.PROBE_MODE !== 'empty') {
    const responses = fs.readdirSync(assets).map(file => ({ url: '/assets/' + file, bytes: fs.statSync(path.join(assets, file)).size }));
    const bytes = responses.reduce((sum, response) => sum + response.bytes, 0);
    fs.mkdirSync('artifacts/asset-diet', { recursive: true });
    for (const project of JSON.parse(process.env.PROBE_PROJECTS || '["desktop-chrome","mobile-chrome"]')) {
      fs.writeFileSync('artifacts/asset-diet/town-transfer-' + project + '.json', process.env.PROBE_MODE === 'corrupt' ? '{' : JSON.stringify({ cueWindowResponses: responses }));
      console.log('[asset-diet] ' + project + ' townResponses: ' + bytes + ' bytes');
    }
  }
  process.exit(Number(process.env.PROBE_RC || 0));
}
`, { mode: 0o755 });
  for (const command of ['wrangler', 'ssh', 'rsync', 'curl']) {
    writeFileSync(join(root, 'bin', command), `#!/bin/sh\necho ${command} >> "$FIXTURE_ROOT/network-calls"\nexit 4\n`, { mode: 0o755 });
  }
  return {
    root,
    run(args = [], env = {}) {
      const run = spawnSync('bash', [join(root, 'scripts/deploy.sh'), ...args], {
        cwd: root, encoding: 'utf8', timeout: 15_000,
        env: { ...process.env, PATH: `${join(root, 'bin')}:${process.env.PATH}`,
          FIXTURE_ROOT: root, CF_PAGES_COMMIT_SHA: 'budget-test-build',
          CLOUDFLARE_API_TOKEN: 'fixture-only', ASSET_SIZES: JSON.stringify(OVER), ...env },
      });
      assert.ifError(run.error);
      assert.match(run.stdout, /RELEASE VERDICT\n\[deploy\] Build: budget-test-build/);
      return { ...run, result: JSON.parse(readFileSync(join(root, 'logs/deploy-result.json'), 'utf8')) };
    },
  };
}

for (const [name, env] of [
  ['overage even when probe exits zero', {}],
  ['overage with the real probe assertion exit', { PROBE_RC: '1' }],
  ['exact ceiling (existing less-than budget)', { ASSET_SIZES: JSON.stringify([LIMIT]) }],
  ['failed probe with under-budget numbers', { PROBE_RC: '1', ASSET_SIZES: '[1000]' }],
  ['no measurement', { PROBE_MODE: 'empty' }],
  ['unreadable per-file report', { PROBE_MODE: 'corrupt' }],
  ['missing mobile measurement', { PROBE_PROJECTS: '["desktop-chrome"]', ASSET_SIZES: '[1000]' }],
  ['repeated desktop is not two projects', { PROBE_PROJECTS: '["desktop-chrome","desktop-chrome"]', ASSET_SIZES: '[1000]' }],
]) {
  test(`deploy fails closed: ${name}`, (t) => {
    const f = fixture(t);
    const run = f.run([], env);
    assert.equal(run.status, 5, run.stdout + run.stderr);
    assert.equal(run.result.outcome, 'budget_failed');
    assert.equal(run.result.publishedBuild, '');
    assert.match(run.stdout, /Budget: FAIL/);
    assert.doesNotMatch(run.stdout, /ALLOWED by/);
    assert.equal(existsSync(join(f.root, 'network-calls')), false);
    assert.equal(existsSync(join(f.root, 'credentials-loaded')), false);
  });
}

test('allowance dry run reports the overage, top five files and missing device verdict', (t) => {
  const f = fixture(t);
  const run = f.run(['--dry-run', '--allow-over-budget', '--strict'], { PROBE_RC: '1' });
  assert.equal(run.status, 0, run.stdout + run.stderr);
  assert.equal(run.result.outcome, 'dry_run');
  assert.equal(run.result.publishedBuild, '');
  assert.match(run.stdout, /26010500 \/ 25000000 bytes \(1010500 bytes OVER\)/);
  assert.match(run.stdout, /Budget: FAIL.*ALLOWED by --allow-over-budget/);
  assert.match(run.stdout, /Device verdict: WARN missing docs\/release\/verdict-budget-test-build.md/);
  assert.deepEqual([...run.stdout.matchAll(/\[deploy\]   (\d+) bytes (\/assets\/asset-\d\.glb)/g)].map(m => [Number(m[1]), m[2]]),
    [0, 1].flatMap(() => OVER.slice(0, 5).map((bytes, i) => [bytes, `/assets/asset-${i}.glb`])));
  assert.equal(existsSync(join(f.root, 'network-calls')), false);
  assert.equal(existsSync(join(f.root, 'credentials-loaded')), false);
});

test('explicit waiver keeps a failed measurement visibly failed', (t) => {
  const f = fixture(t);
  const run = f.run(['--allow-over-budget', '--dry-run'], { PROBE_MODE: 'empty', PROBE_RC: '1' });
  assert.equal(run.status, 0);
  assert.match(run.stdout, /MEASURED NOTHING/);
  assert.match(run.stdout, /Budget: FAIL.*measured projects=0.*ALLOWED/);
  assert.equal(existsSync(join(f.root, 'network-calls')), false);
});

test('under-budget dry run passes; an existing owner verdict is reported without interpreting it', (t) => {
  const f = fixture(t);
  writeFileSync(join(f.root, 'docs/release/verdict-budget-test-build.md'), 'HOLD: owner device checks pending\n');
  const run = f.run(['--strict', '--dry-run'], { ASSET_SIZES: '[1000]' });
  assert.equal(run.status, 0, run.stdout + run.stderr);
  assert.match(run.stdout, /Budget: PASS \(limit: 25000000 bytes\)/);
  assert.match(run.stdout, /1000 \/ 25000000 bytes/);
  assert.match(run.stdout, /Device verdict: PRESENT.*owner verdict not evaluated/);
  assert.doesNotMatch(run.stdout, /ALLOWED|WARN missing/);
  assert.equal(existsSync(join(f.root, 'network-calls')), false);
});

test('allowance reaches the publisher; strict still governs deploy errors', (t) => {
  const f = fixture(t);
  const run = f.run(['--allow-over-budget', '--strict']);
  assert.equal(run.status, 4, run.stdout + run.stderr);
  assert.equal(run.result.outcome, 'deploy_failed');
  assert.equal(readFileSync(join(f.root, 'network-calls'), 'utf8'), 'wrangler\n');
});

for (const strict of [false, true]) {
  test(`build failure prints a verdict and preserves strict=${strict}`, (t) => {
    const f = fixture(t);
    const run = f.run(strict ? ['--dry-run', '--strict'] : ['--dry-run'], { BUILD_RC: '3' });
    assert.equal(run.status, strict ? 3 : 0);
    assert.equal(run.result.outcome, 'build_failed');
    assert.match(run.stdout, /Budget: FAIL \(not measured\)/);
    assert.equal(existsSync(join(f.root, 'network-calls')), false);
  });
}

test('lock refusal prints the release verdict before any build', (t) => {
  const f = fixture(t);
  const run = f.run(['--strict', '--dry-run'], { LOCK_RC: '1' });
  assert.equal(run.status, 6);
  assert.equal(run.result.outcome, 'skipped');
  assert.match(run.stdout, /Budget: FAIL \(not measured\)/);
  assert.equal(existsSync(join(f.root, 'dist')), false);
});
