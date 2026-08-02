import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import benchSeeds from '../assets/contracts/bench-seeds.json' with { type: 'json' };

const ROOT = fileURLToPath(new URL('..', import.meta.url));

const ORDERS = [
  [{ verb: 'HARVEST', seam: 'gold-seam-1' }],
  [{ verb: 'HARVEST', seam: 'gold-seam-2' }],
  [{ verb: 'BUILD', what: 'palisade', where: { x: 0, z: 10 }, when: { goldGte: 10 } }],
  [],
  [],
].map(JSON.stringify).join('\n') + '\n';

test('gr-sim replays the same contract, seed, and orders byte-for-byte', () => {
  const run = () => spawnSync(
    process.execPath,
    ['scripts/gr-sim.mjs', '--contract', 'e1-dry-gulch', '--seed', 'bench-001'],
    { cwd: ROOT, encoding: 'utf8', input: ORDERS, timeout: 30_000 },
  );
  const first = run();
  const second = run();
  assert.equal(first.status, 0, first.stderr);
  assert.equal(second.status, 0, second.stderr);
  assert.equal(second.stdout, first.stdout);

  const lines = first.stdout.trim().split('\n').map((line) => JSON.parse(line));
  assert.equal(lines[0].schema, 'goldrush.view.v1');
  assert.deepEqual(Object.keys(lines.at(-1)), ['secured', 'waves', 'timeMs', 'gold', 'kills', 'calls', 'eventLogHash']);
  assert.equal(lines.at(-1).calls, 5);
  assert.ok(lines.some((line) => line.schema === 'goldrush.view.v1' && line.now.works.byKind.palisade === 1));
  assert.match(first.stderr, /gr-sim speed: \d+\.\d{2} waves\/s/);

  const unsupported = spawnSync(
    process.execPath,
    ['scripts/gr-sim.mjs', '--contract', 'e5-deepwater-claim', '--policy=idle'],
    { cwd: ROOT, encoding: 'utf8', timeout: 30_000 },
  );
  assert.notEqual(unsupported.status, 0);
  assert.match(unsupported.stderr, /AP-07 supports only e1-dry-gulch, the-claim, e1-night-shift/);
});

test('gr-sim deterministically runs the Claim objective', () => {
  const run = () => spawnSync(
    process.execPath,
    ['scripts/gr-sim.mjs', '--contract', 'the-claim', '--seed', 'e1-the-claim-01', '--policy=idle'],
    { cwd: ROOT, encoding: 'utf8', timeout: 30_000 },
  );
  const first = run();
  const second = run();
  assert.equal(first.status, 0, first.stderr);
  assert.equal(second.status, 0, second.stderr);
  assert.equal(second.stdout, first.stdout);
  const lines = first.stdout.trim().split('\n').map(JSON.parse);
  assert.deepEqual(lines[0].stablePrefix.mechanics.posting.waves, [
    { event: 'secure', wave: 10, source: 'twist.secureWave' },
  ]);
  assert.deepEqual(lines.at(-2).appendLog.at(-1), {
    wave: 2,
    outcome: 'rider-down',
    goldDelta: 0,
    worksHp: { current: 0, max: 0, delta: 0 },
    kills: 13,
    surprises: ['hero_down'],
  });
  assert.equal(lines.at(-1).secured, false);
  assert.deepEqual(
    Object.keys(lines.at(-1)),
    ['secured', 'waves', 'timeMs', 'gold', 'kills', 'calls', 'eventLogHash'],
  );
});

test('gr-sim boots escort mode from data instead of URL state', { timeout: 120_000 }, async () => {
  const previousLocation = globalThis.location;
  const previousWindow = globalThis.window;
  const location = new URL('http://gr-sim.local/?debug&contract=e2-hill-mine&seed=e2-escort-headless');
  globalThis.location = location;
  globalThis.window = { location };
  const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
  try {
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const sim = new HeadlessContractSim({ contractId: 'e2-hill-mine', seed: 'e2-escort-headless', mode: 'escort' });
    assert.equal(location.searchParams.has('mode'), false);
    assert.deepEqual(sim.currentTurn().view.stablePrefix.mechanics.modes, sim.manifest.modes);
    assert.equal(sim.escortDiagnostics.enabled, true);
    assert.equal(sim.escortDiagnostics.enabled && sim.escortDiagnostics.required, 1);
    assert.equal(sim.escortDiagnostics.enabled && sim.escortDiagnostics.payout, 40);
  } finally {
    await vite.close();
    if (previousLocation === undefined) delete globalThis.location;
    else globalThis.location = previousLocation;
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }

  const cli = spawnSync(
    process.execPath,
    ['scripts/gr-sim.mjs', '--contract', 'e2-hill-mine', '--seed', 'e2-escort-headless', '--mode', 'escort', '--policy=idle'],
    { cwd: ROOT, encoding: 'utf8', timeout: 30_000 },
  );
  assert.equal(cli.signal, null, cli.stderr);
  assert.equal(JSON.parse(cli.stdout.split('\n', 1)[0]).stablePrefix.mechanics.modes[0].id, 'escort');
});

test('the Claim driver consumes declared water and posts RunManager secure at wave 10', async () => {
  const previousLocation = globalThis.location;
  const previousWindow = globalThis.window;
  const location = new URL('http://gr-sim.local/?debug&contract=the-claim&seed=e1-the-claim-01');
  globalThis.location = location;
  globalThis.window = { location };
  const vite = await createServer({
    root: ROOT,
    appType: 'custom',
    logLevel: 'silent',
    server: { middlewareMode: true },
  });
  try {
    const Terrain = await vite.ssrLoadModule('/src/world/Terrain.ts');
    assert.deepEqual(Terrain.fordRanges(), [
      { id: 'center-ford', minX: -3, maxX: 3, centerX: 0, halfWidth: 3 },
    ]);
    assert.deepEqual(Terrain.sample(-12, 0), {
      walkable: false,
      speedMul: 0,
      zone: 'river',
      waterSource: 'river',
      waterDepth: 1.25,
      waterClass: 'deep',
    });
    assert.deepEqual(Terrain.sample(0, 0), {
      walkable: true,
      speedMul: 0.85,
      zone: 'ford',
      waterSource: 'river',
      waterDepth: 0.35,
      waterClass: 'wade',
    });

    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const run = () => {
      const sim = new HeadlessContractSim({ contractId: 'the-claim', seed: 'e1-the-claim-01' });
      sim.hero.applyStats(10_000, 1);
      sim.hero.heal(10_000);
      let turn = sim.currentTurn();
      while (!turn.terminal) turn = sim.advanceToTurn();
      return { outcome: sim.outcome(), terminalLog: turn.view.appendLog.at(-1) };
    };
    const first = run();
    const second = run();
    assert.deepEqual(second, first);
    assert.deepEqual(first.outcome, {
      secured: true,
      waves: 10,
      timeMs: 300000,
      gold: 0,
      kills: 137,
      calls: 0,
      eventLogHash: 'fnv1a32:b1eeb320',
    });
    assert.equal(first.terminalLog.outcome, 'secured');
  } finally {
    await vite.close();
    if (previousLocation === undefined) delete globalThis.location;
    else globalThis.location = previousLocation;
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});

test('the frozen Claim environment rows equal the five pinned bench seeds', () => {
  const rows = readFileSync(new URL('../env/goldrush-verifiers/goldrush/data/eval_dataset.jsonl', import.meta.url), 'utf8')
    .trim()
    .split('\n')
    .map(JSON.parse)
    .map((row) => JSON.parse(row.info))
    .filter((info) => info.contractId === 'the-claim');
  assert.deepEqual(rows.map((row) => row.seed), benchSeeds['the-claim']);
});

test('gr-sim places Night Shift fixtures from the contract', () => {
  const contracts = JSON.parse(readFileSync(new URL('../assets/contracts/epoch-1-frontier/contracts.json', import.meta.url), 'utf8'));
  const contract = contracts.contracts.find(({ id }) => id === 'e1-night-shift');
  const run = spawnSync(
    process.execPath,
    ['scripts/gr-sim.mjs', '--contract', contract.id, '--seed', 'e1-night-shift-01', '--policy=idle'],
    { cwd: ROOT, encoding: 'utf8', timeout: 30_000 },
  );
  assert.equal(run.status, 0, run.stderr);
  const firstView = JSON.parse(run.stdout.split('\n', 1)[0]);
  assert.equal(firstView.now.works.byKind.lantern_post, contract.tileParams.prePlacedBuildables.length);
});
