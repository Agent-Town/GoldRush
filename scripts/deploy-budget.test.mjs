// THE RELEASE VERDICT'S TWO NUMBERS — the payload gate and the probe tripwire.
//
// WHY THIS FILE CHANGED SHAPE (task first-town-payload-gate, 2026-09-07; owner desk answer A7).
// Until today every case here gated on the BROWSER number: the bytes that landed inside the first
// town's cue window. F-BUDGET-4 measured what that number is — 21,589,212 / 10,540,927 / 21,638,025
// bytes across three runs of ONE fixed build, and 6,411,798 on the same build at an emulated
// 8 Mbps — so it is host speed, not payload. The deploy now judges what the BUILD declares
// (scripts/first-town-payload.mjs over assets/first-town-payload.json) and keeps the probe as a
// tripwire under a far looser ceiling. These cases move with it: fail-closed on the PAYLOAD, and a
// probe that measured nothing is reported loudly but no longer blocks, because the budget no longer
// depends on a browser at all.
//
// The fixture builds a whole small repo: the real deploy.sh, the real payload script, the real
// declaration and the three sources it cross-checks. Two independent knobs drive it — ASSET_SIZES
// feeds the probe's numbers through dist/assets, PAYLOAD_BIG feeds the payload through dist/payload
// — so a case can put one over and the other under and prove which one decided.

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { computePayload, crossCheckDeclaration, readDeclaration, requestFamily } from './first-town-payload.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LIMIT = 52_000_000; // owner A11 2026-09-07: "raise the budget, this is a good size"; the cast sheets are gated now
const CEILING = 30_000_000;
const OVER_CEILING = [31_000_000, 4000, 3000, 2000, 1000, 500];
const UNDER_CEILING = [4000, 3000, 2000, 1000, 500];
// The fixture gives the first declared family this many bytes and every other gated family one, so
// `GATED_FILLER` is what a case must leave room for when it aims the total at an exact number.
const GATED_FILLER = () => declaredFamilies().gated - 1;
const CROSS_CHECK_SOURCES = [
  'assets/first-town-payload.json',
  'assets/layer-contracts/characters.v2.json',
  'src/town/town-actor-sheets.json',
  'src/assets/character-runtime-frames.json',
];

/**
 * Every family the real declaration names, GATED ONES FIRST, so the fixture build can give the
 * first file a chosen size and every other file one byte: the gated total is then exactly
 * `big + gated - 1`, whatever the declaration grows into.
 */
function declaredFamilies() {
  const { declaration } = readDeclaration();
  const gated = declaration.groups.filter(({ demandPaged }) => demandPaged !== true).flatMap(({ families }) => families);
  const demandPaged = declaration.groups.filter(({ demandPaged: paged }) => paged === true).flatMap(({ families }) => families);
  assert.ok(gated.length > 0, 'the declaration gates nothing, so this fixture could not measure a payload');
  return { all: [...gated, ...demandPaged], gated: gated.length };
}

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'gold-rush-deploy-budget-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const dir of ['scripts', 'bin', 'docs/release']) mkdirSync(join(root, dir), { recursive: true });
  copyFileSync(new URL('./deploy.sh', import.meta.url), join(root, 'scripts/deploy.sh'));
  copyFileSync(new URL('./first-town-payload.mjs', import.meta.url), join(root, 'scripts/first-town-payload.mjs'));
  for (const source of CROSS_CHECK_SOURCES) {
    mkdirSync(join(root, dirname(source)), { recursive: true });
    copyFileSync(join(ROOT, source), join(root, source));
  }
  writeFileSync(join(root, '.env.local'), ': > credentials-loaded\n');
  writeFileSync(join(root, 'bin/lockf'), '#!/bin/sh\nexit "${LOCK_RC:-0}"\n', { mode: 0o755 });
  // The build stub creates real files on BOTH knobs: dist/assets carries the sizes the probe stub
  // then measures and reports, dist/payload carries one file per declared family so the payload
  // script has a real build to sum. No browser, credentials or network are needed by either.
  writeFileSync(join(root, 'bin/npm'), `#!${process.execPath}
const fs = require('node:fs');
const path = require('node:path');
const root = process.env.FIXTURE_ROOT;
const assets = path.join(root, 'dist/assets');
const payload = path.join(root, 'dist/payload');
if (process.argv[2] === 'run') {
  if (process.env.BUILD_RC) process.exit(Number(process.env.BUILD_RC));
  fs.mkdirSync(assets, { recursive: true });
  JSON.parse(process.env.ASSET_SIZES).forEach((size, i) => {
    const file = path.join(assets, 'asset-' + i + '.glb');
    fs.writeFileSync(file, '');
    fs.truncateSync(file, size);
  });
  fs.mkdirSync(payload, { recursive: true });
  const families = JSON.parse(process.env.PAYLOAD_FAMILIES);
  const skip = process.env.PAYLOAD_SKIP_FAMILY || '';
  families.forEach((family, index) => {
    if (family === skip) return;
    const dot = family.lastIndexOf('.');
    const file = path.join(payload, family.slice(0, dot) + '-AAAAAAA1-diet-00000000' + family.slice(dot));
    fs.writeFileSync(file, '');
    fs.truncateSync(file, index === 0 ? Number(process.env.PAYLOAD_BIG || 1000) : 1);
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
  const families = declaredFamilies();
  return {
    root,
    families,
    /** The gated total the fixture build produces: one big first family, one byte for each other. */
    payloadBytes(big = 1000) {
      return Number(big) + families.gated - 1;
    },
    run(args = [], env = {}) {
      const run = spawnSync('bash', [join(root, 'scripts/deploy.sh'), ...args], {
        cwd: root, encoding: 'utf8', timeout: 30_000,
        env: { ...process.env, PATH: `${join(root, 'bin')}:${process.env.PATH}`,
          FIXTURE_ROOT: root, CF_PAGES_COMMIT_SHA: 'budget-test-build',
          CLOUDFLARE_API_TOKEN: 'fixture-only', ASSET_SIZES: JSON.stringify(UNDER_CEILING),
          PAYLOAD_FAMILIES: JSON.stringify(families.all), ...env },
      });
      assert.ifError(run.error);
      assert.match(run.stdout, /RELEASE VERDICT\n\[deploy\] Build: budget-test-build/);
      return { ...run, result: JSON.parse(readFileSync(join(root, 'logs/deploy-result.json'), 'utf8')) };
    },
  };
}

// ─── THE GATE FAILS CLOSED ON THE PAYLOAD ──────────────────────────────────────────────────────

for (const [name, env, expect] of [
  ['payload over the budget', { PAYLOAD_BIG: String(LIMIT) }, /first-town payload: \d+ \/ 52000000 bytes \(\d+ bytes OVER\)/],
  ['payload exactly ON the budget (the comparison is less-than)', { PAYLOAD_BIG: () => String(LIMIT - GATED_FILLER()) }, /first-town payload: 52000000 \/ 52000000 bytes \(0 bytes OVER\)/],
  ['a declared family the build does not emit', { PAYLOAD_SKIP_FAMILY: 'char-hero-sheet-walk8.png' }, /MEASUREMENT FAILED: scripts\/first-town-payload\.mjs rc=1/],
  ['the probe tripwire over its ceiling', { ASSET_SIZES: JSON.stringify(OVER_CEILING) }, /probe tripwire desktop-chrome: 31010500 \/ 30000000 bytes \(1010500 bytes OVER the ceiling\)/],
]) {
  test(`deploy fails closed: ${name}`, (t) => {
    const f = fixture(t);
    const resolved = Object.fromEntries(Object.entries(env).map(([key, value]) => [key, typeof value === 'function' ? value() : value]));
    const run = f.run([], resolved);
    assert.equal(run.status, 5, run.stdout + run.stderr);
    assert.equal(run.result.outcome, 'budget_failed');
    assert.equal(run.result.publishedBuild, '');
    assert.match(run.stdout, /Budget: FAIL/);
    assert.match(run.stdout, expect);
    assert.doesNotMatch(run.stdout, /ALLOWED by/);
    assert.equal(existsSync(join(f.root, 'network-calls')), false);
    assert.equal(existsSync(join(f.root, 'credentials-loaded')), false);
  });
}

// ─── THE PROBE IS A TRIPWIRE, NOT THE BUDGET ───────────────────────────────────────────────────
// Every one of these used to abort the deploy. None of them may now, because the payload gate needs
// no browser: a probe that could not measure is a probe that says nothing, and the number it would
// have said is not the one the budget reads. What it must still do is SAY SO — F-1489-3's lesson
// survives the demotion, in the tripwire's own words.

for (const [name, env, expect] of [
  ['the probe exits nonzero', { PROBE_RC: '1' }, /probe rc=1.*does not gate/],
  ['the probe measures nothing', { PROBE_MODE: 'empty', PROBE_RC: '1' }, /MEASURED NOTHING: probe tripwire parsed 0 projects/],
  ['the per-file report is unreadable', { PROBE_MODE: 'corrupt' }, /report failures=1.*does not gate/],
  ['mobile never reported', { PROBE_PROJECTS: '["desktop-chrome"]' }, /measured projects=1.*does not gate/],
  ['the same project reported twice', { PROBE_PROJECTS: '["desktop-chrome","desktop-chrome"]' }, /duplicate project desktop-chrome/],
]) {
  test(`the deploy survives a broken tripwire and says so: ${name}`, (t) => {
    const f = fixture(t);
    const run = f.run(['--dry-run', '--strict'], env);
    assert.equal(run.status, 0, run.stdout + run.stderr);
    assert.equal(run.result.outcome, 'dry_run');
    assert.match(run.stdout, /Budget: PASS/);
    assert.match(run.stdout, expect);
    assert.match(run.stdout, /payload GATE \(declared, computed from the build\): PASS/);
    assert.equal(existsSync(join(f.root, 'network-calls')), false);
  });
}

test('the verdict block names which number gates and which only trips', (t) => {
  const f = fixture(t);
  const run = f.run(['--dry-run', '--strict']);
  assert.equal(run.status, 0, run.stdout + run.stderr);
  const expected = f.payloadBytes();
  assert.match(run.stdout, new RegExp(`first-town payload: ${expected} / ${LIMIT} bytes \\(${LIMIT - expected} bytes headroom\\)`));
  assert.match(run.stdout, /payload GATE \(declared, computed from the build\): PASS/);
  assert.match(run.stdout, new RegExp(`probe TRIPWIRE \\(browser cue window, ceiling ${CEILING} bytes, host speed not payload\\): PASS`));
  assert.match(run.stdout, new RegExp(`probe desktop-chrome: 10500 / ${CEILING} bytes`));
  assert.match(run.stdout, /\| GATED TOTAL \| yes \|/);
  assert.match(run.stdout, /first-town payload declared: \d+ bytes/);
  assert.match(run.stdout, /first-town payload demand-paged: \d+ bytes/);
});

test('the budget and the ceiling in the block are the constants deploy.sh holds', () => {
  const source = readFileSync(join(ROOT, 'scripts/deploy.sh'), 'utf8');
  assert.match(source, /^BUDGET_LIMIT=52000000$/m, 'the 35,000,000 B first-town budget is the owner\'s number (A11, 2026-09-07: "raise the budget, this is a good size"); this guard pins it');
  assert.match(source, /^TRIPWIRE_CEILING=30000000$/m, 'the probe tripwire ceiling moved without a ruling');
  // ONE CEILING, TWO CALLERS. e2e/asset-diet.spec.ts asserts the same tripwire at its own site, and
  // scripts/deploy.sh runs THAT test: two different numbers would make the probe fail the spec while
  // the deploy called it a pass, which is the drift this whole task exists to end.
  const spec = readFileSync(join(ROOT, 'e2e/asset-diet.spec.ts'), 'utf8');
  const declared = /export const TOWN_TRANSFER_CEILING_BYTES = ([0-9_]+);/.exec(spec);
  assert.ok(declared, 'e2e/asset-diet.spec.ts no longer exports TOWN_TRANSFER_CEILING_BYTES');
  assert.equal(Number(declared[1].replaceAll('_', '')), CEILING,
    'the asset-diet spec and scripts/deploy.sh disagree about the probe tripwire ceiling');
  assert.match(source, /ceiling \$TRIPWIRE_CEILING bytes/, 'the verdict block must print the ceiling it judged against');
  assert.match(source, /limit: \$BUDGET_LIMIT bytes/, 'the verdict block must print the budget it judged against');
});

test('--allow-over-budget waives both numbers at once, and says which failed', (t) => {
  const f = fixture(t);
  const run = f.run(['--dry-run', '--allow-over-budget', '--strict'], { PAYLOAD_BIG: String(LIMIT), ASSET_SIZES: JSON.stringify(OVER_CEILING) });
  assert.equal(run.status, 0, run.stdout + run.stderr);
  assert.equal(run.result.outcome, 'dry_run');
  assert.equal(run.result.publishedBuild, '');
  assert.match(run.stdout, /Budget: FAIL.*ALLOWED by --allow-over-budget/);
  assert.match(run.stdout, /payload GATE .*: FAIL \(\d+ \/ 52000000 bytes, \d+ bytes OVER\)/);
  assert.match(run.stdout, /probe TRIPWIRE .*: FAIL \(a project exceeded the ceiling\)/);
  assert.match(run.stdout, /Device verdict: WARN missing docs\/release\/verdict-budget-test-build.md/);
  assert.deepEqual([...run.stdout.matchAll(/\[deploy\]   (\d+) bytes (\/assets\/asset-\d\.glb)/g)].map(m => [Number(m[1]), m[2]]),
    [0, 1].flatMap(() => OVER_CEILING.slice(0, 5).map((bytes, i) => [bytes, `/assets/asset-${i}.glb`])));
  assert.equal(existsSync(join(f.root, 'network-calls')), false);
  assert.equal(existsSync(join(f.root, 'credentials-loaded')), false);
});

test('under-budget dry run passes; an existing owner verdict is reported without interpreting it', (t) => {
  const f = fixture(t);
  writeFileSync(join(f.root, 'docs/release/verdict-budget-test-build.md'), 'HOLD: owner device checks pending\n');
  const run = f.run(['--strict', '--dry-run']);
  assert.equal(run.status, 0, run.stdout + run.stderr);
  assert.match(run.stdout, /Budget: PASS \(limit: 52000000 bytes\)/);
  assert.match(run.stdout, /Device verdict: PRESENT.*owner verdict not evaluated/);
  assert.doesNotMatch(run.stdout, /ALLOWED|WARN missing/);
  assert.equal(existsSync(join(f.root, 'network-calls')), false);
});

test('allowance reaches the publisher; strict still governs deploy errors', (t) => {
  const f = fixture(t);
  const run = f.run(['--allow-over-budget', '--strict'], { PAYLOAD_BIG: String(LIMIT) });
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
    assert.match(run.stdout, /payload GATE .*: FAIL \(not measured\)/);
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

// ─── THE FALLBACK DOOR IS FOR ONE CALLER, AND IT IS SHUT HERE ──────────────────────────────────

test('deploy.sh falls back to the probe only when the payload script is genuinely absent', (t) => {
  const f = fixture(t);
  rmSync(join(f.root, 'scripts/first-town-payload.mjs'));
  const under = f.run(['--dry-run', '--strict']);
  assert.equal(under.status, 0, under.stdout + under.stderr);
  assert.match(under.stdout, /PAYLOAD NOT MEASURED: .*first-town-payload\.mjs is absent/);
  assert.match(under.stdout, /Budget: PASS/);

  // …and the fallback is the OLD gate, not an open door: the probe's own number still blocks there.
  const over = fixture(t);
  rmSync(join(over.root, 'scripts/first-town-payload.mjs'));
  const run = over.run([], { ASSET_SIZES: JSON.stringify(OVER_CEILING) });
  assert.equal(run.status, 5, run.stdout + run.stderr);
  assert.equal(run.result.outcome, 'budget_failed');
});

test('the fallback is unreachable in this repo: the payload script and its declaration are here', () => {
  // scripts/test-deploy-contract.sh:7 copies deploy.sh ALONE into a throwaway tree, which is the
  // only legitimate way the absent-script branch above can be reached. If either file leaves this
  // repo the deploy would silently revert to gating on host speed, so it reds here first.
  for (const file of ['scripts/first-town-payload.mjs', ...CROSS_CHECK_SOURCES]) {
    assert.ok(existsSync(join(ROOT, file)), `${file} is missing; scripts/deploy.sh would fall back to the browser probe`);
  }
});

// ─── THE PAYLOAD SCRIPT ITSELF ─────────────────────────────────────────────────────────────────

test('the payload table is deterministic: three runs, byte-identical', (t) => {
  const f = fixture(t);
  f.run(['--dry-run', '--strict']);
  const dist = join(f.root, 'dist');
  const outputs = [1, 2, 3].map(() => spawnSync(process.execPath, [
    join(f.root, 'scripts/first-town-payload.mjs'), '--dist', dist, '--no-corpus',
  ], { cwd: f.root, encoding: 'utf8', timeout: 30_000 }));
  for (const run of outputs) assert.equal(run.status, 0, run.stdout + run.stderr);
  assert.equal(outputs[0].stdout, outputs[1].stdout);
  assert.equal(outputs[1].stdout, outputs[2].stdout);
  assert.match(outputs[0].stdout, new RegExp(`first-town payload: ${f.payloadBytes()} bytes`));
});

test('the declared set is non-empty, sorted, disjoint, and every row carries its reason', () => {
  const { declaration, declaredKindByFamily, excluded, trim } = readDeclaration();
  assert.ok(declaration.groups.length >= 2, 'the declaration collapsed to one group');
  assert.ok(declaredKindByFamily.size >= 50, `only ${declaredKindByFamily.size} families are declared; the first town is bigger than that`);
  assert.ok(excluded.length > 0, 'nothing is excluded, so the deferred music and the advance-stream residue have no recorded reason');
  assert.deepEqual(trim, [...trim].sort(), 'saveDataTrim must stay sorted');
  assert.ok(declaration.groups.some(({ demandPaged }) => demandPaged !== true), 'no group is gated');
});

test('the declaration cannot drift from the town\'s own sources', () => {
  assert.deepEqual(crossCheckDeclaration(readDeclaration().declaredKindByFamily, readDeclaration().excluded), []);
});

test('the cross-check bites: a cast member dropped from the declaration is named', () => {
  const { declaredKindByFamily, excluded } = readDeclaration();
  const actors = JSON.parse(readFileSync(join(ROOT, 'src/town/town-actor-sheets.json'), 'utf8'));
  const dropped = new Map(declaredKindByFamily);
  dropped.delete(`${actors.tavernkeeper}.png`);
  const problems = crossCheckDeclaration(dropped, excluded);
  assert.equal(problems.length, 1, problems.join('\n'));
  assert.match(problems[0], /town-actor-sheets\.json names tavernkeeper/);
});

test('the cross-check bites: re-declaring a deferred hero clip group is refused', () => {
  const { declaredKindByFamily, excluded } = readDeclaration();
  const frames = JSON.parse(readFileSync(join(ROOT, 'src/assets/character-runtime-frames.json'), 'utf8'));
  const panFamily = requestFamily(frames.heroPoseFrameFiles.pan.e[0]);
  assert.ok(panFamily);
  const reEagerised = new Map(declaredKindByFamily).set(panFamily, 'hero');
  const problems = crossCheckDeclaration(reEagerised, excluded);
  assert.ok(problems.some((problem) => /char\.hero\.pan is in a deferred clip group/.test(problem)), problems.join('\n'));
});

test('a corpus family the declaration does not name is reported, never counted', (t) => {
  const f = fixture(t);
  f.run(['--dry-run', '--strict']);
  const corpus = join(f.root, 'corpus');
  mkdirSync(corpus, { recursive: true });
  writeFileSync(join(corpus, 'town-transfer-desktop-chrome.json'), JSON.stringify({
    cueWindowResponses: [
      { url: '/assets/char-hero-sheet-walk8-r0c0-AAAAAAA1-diet-00000000.png', bytes: 1 },
      { url: '/assets/brand-new-hall-AAAAAAA1-diet-00000000.glb', bytes: 4_000_000 },
    ],
  }));
  const run = spawnSync(process.execPath, [
    join(f.root, 'scripts/first-town-payload.mjs'), '--dist', join(f.root, 'dist'), '--corpus', corpus,
  ], { cwd: f.root, encoding: 'utf8', timeout: 30_000 });
  assert.equal(run.status, 0, run.stdout + run.stderr);
  assert.match(run.stdout, /UNDECLARED \(reported, not counted\): brand-new-hall\.glb/);
  assert.match(run.stdout, /1 files, 2 families observed, 1 undeclared/);
  // Reported means reported: the 4 MB it carries stays out of the gated total.
  assert.match(run.stdout, new RegExp(`first-town payload: ${f.payloadBytes()} bytes`));
});

test('the family derivation is a verbatim copy of the request-family guard\'s', () => {
  // It cannot be imported — scripts/first-town-request-families.test.mjs is a node:test module and
  // importing it would run its four tests inside scripts/deploy.sh's own process. So it is copied,
  // and the copy is checked here rather than trusted.
  const block = /const VITE_HASH = [\s\S]*?\nexport function requestFamily\(url\) \{[\s\S]*?\n\}\n/;
  const guard = block.exec(readFileSync(join(ROOT, 'scripts/first-town-request-families.test.mjs'), 'utf8'));
  const copy = block.exec(readFileSync(join(ROOT, 'scripts/first-town-payload.mjs'), 'utf8'));
  assert.ok(guard, 'the request-family guard no longer exports requestFamily in the shape this comparison reads');
  assert.ok(copy, 'scripts/first-town-payload.mjs no longer carries the copied derivation');
  assert.equal(copy[0], guard[0],
    'the two family derivations have drifted. The payload gate and the request-set guard must file a URL under the same family or they are measuring different first towns');
  assert.equal(requestFamily('/assets/char-hero-sheet-work8-r0c1-Bo9aq2HL-diet-1408f6b4.png'), 'char-hero-sheet-work8.png');
});

test('the payload computed here is the payload the block prints', (t) => {
  const f = fixture(t);
  const run = f.run(['--dry-run', '--strict']);
  const payload = computePayload({ dist: join(f.root, 'dist'), corpus: null });
  assert.equal(payload.bytes, f.payloadBytes());
  assert.equal(payload.declaredBytes, payload.bytes + payload.demandPagedBytes);
  assert.match(run.stdout, new RegExp(`first-town payload: ${payload.bytes} / ${LIMIT} bytes`));
});

// F-RGD-2 (release-gate-on-deploy-1 drain, 2026-09-24): deploy.sh runs scripts/assert-release-build.mjs after the
// build and, when the file is ABSENT, prints "RELEASE NOT ASSERTED" and continues, so deleting the script would
// silently un-assert every production deploy. This row pins the script's presence and the call, the way the rows
// above pin first-town-payload.mjs and its declaration.
test('the release assertion the deploy runs is present and deploy.sh calls it (F-RGD-2)', () => {
  assert.equal(
    existsSync(new URL('./assert-release-build.mjs', import.meta.url)),
    true,
    'scripts/assert-release-build.mjs is absent: deploy.sh would print RELEASE NOT ASSERTED and ship an unproven bundle',
  );
  const deploy = readFileSync(new URL('./deploy.sh', import.meta.url), 'utf8');
  assert.match(deploy, /RELEASE_ASSERT="\$ROOT\/scripts\/assert-release-build\.mjs"/, 'deploy.sh no longer names the assertion script');
  assert.match(deploy, /GR_RELEASE=e1 node "\$RELEASE_ASSERT"/, 'deploy.sh no longer runs the assertion');
});
