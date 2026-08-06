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

// F-1406-2: these terminal outcome pins are change detectors. A red means the
// sim's behaviour moved; establish why before re-deriving, never paste over it.

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
  // F-1493-1: headless progression parity, s1493.
  assert.deepEqual(lines.at(-1), {
    secured: false,
    waves: 4,
    timeMs: 135667,
    gold: 4,
    kills: 37,
    calls: 5,
    eventLogHash: 'fnv1a32:f63d981b',
  });
  assert.equal(lines.at(-1).calls, 5);
  assert.ok(lines.some((line) => line.schema === 'goldrush.view.v1' && line.now.works.byKind.palisade === 1));
  assert.match(first.stderr, /gr-sim speed: \d+\.\d{2} waves\/s/);

  const unsupported = spawnSync(
    process.execPath,
    ['scripts/gr-sim.mjs', '--contract', 'e5-deepwater-claim', '--policy=idle'],
    { cwd: ROOT, encoding: 'utf8', timeout: 30_000 },
  );
  assert.notEqual(unsupported.status, 0);
  assert.match(unsupported.stderr, /AP-07 supports only e1-dry-gulch, the-claim, e1-night-shift, e1-twin-banks, e1-baron/);
});

test('gr-sim hashes a fractional-yield run identically twice', async () => {
  const previousLocation = globalThis.location;
  const previousWindow = globalThis.window;
  const location = new URL('http://gr-sim.local/?debug&contract=e1-dry-gulch&seed=gold-quantization');
  globalThis.location = location;
  globalThis.window = { location };
  const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
  let Balance;
  let originalTickGold;
  try {
    ({ Balance } = await vite.ssrLoadModule('/src/game/Balance.ts'));
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    originalTickGold = Balance.goldSeam.tickGold;
    Balance.goldSeam.tickGold = 1;
    const run = () => {
      const sim = new HeadlessContractSim({ contractId: 'e1-dry-gulch', seed: 'gold-quantization' });
      assert.equal(sim.submitOrders([{ verb: 'HARVEST', seam: 'gold-seam-1' }]).outcome.ok, true);
      let turn = sim.currentTurn();
      while (!turn.terminal) turn = sim.advanceToTurn();
      return {
        outcome: sim.outcome(),
        fractionalYield: sim.economy.log.some((event) => event.type === 'gold_panned' && !Number.isInteger(event.amount)),
      };
    };
    const first = run();
    const second = run();
    assert.deepEqual(second, first);
    assert.equal(first.fractionalYield, true);
    assert.equal(Number.isInteger(first.outcome.gold), true);
  } finally {
    if (Balance && originalTickGold !== undefined) Balance.goldSeam.tickGold = originalTickGold;
    await vite.close();
    if (previousLocation === undefined) delete globalThis.location;
    else globalThis.location = previousLocation;
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
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
  // F-1493-1: headless progression parity, s1493.
  assert.deepEqual(lines.at(-2).appendLog.at(-1), {
    wave: 3,
    outcome: 'rider-down',
    goldDelta: 0,
    worksHp: { current: 0, max: 0, delta: 0 },
    kills: 7,
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
    // F-1493-1: headless progression parity, s1493.
    assert.deepEqual(first.outcome, {
      secured: true,
      waves: 10,
      timeMs: 300000,
      gold: 0,
      kills: 297,
      calls: 0,
      eventLogHash: 'fnv1a32:fa8a49e7',
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

test('Twin Banks consumes its declared crossings and build zones before securing at wave 20', { timeout: 45_000 }, async () => {
  const runCli = () => spawnSync(
    process.execPath,
    ['scripts/gr-sim.mjs', '--contract', 'e1-twin-banks', '--seed', 'e1-twin-banks-01', '--policy=idle'],
    { cwd: ROOT, encoding: 'utf8', timeout: 30_000 },
  );
  const firstCli = runCli();
  const secondCli = runCli();
  assert.equal(firstCli.status, 0, firstCli.stderr);
  assert.equal(secondCli.status, 0, secondCli.stderr);
  assert.equal(secondCli.stdout, firstCli.stdout);
  const transcript = firstCli.stdout.trim().split('\n').map(JSON.parse);
  assert.deepEqual(transcript[0].stablePrefix.mechanics.rules, [
    { id: 'build_zones', source: 'tileParams.buildZones', data: { count: 2, banks: ['north', 'south'] } },
    { id: 'river', source: 'tileParams.river', data: {} },
    { id: 'water_crossings', source: 'tileParams.ford', data: { count: 2, ids: ['east-ford', 'west-ford'] } },
  ]);
  assert.deepEqual(transcript[0].stablePrefix.mechanics.posting.waves, [
    { event: 'secure', wave: 20, source: 'twist.secureWave' },
  ]);
  // F-1493-1: headless progression parity, s1493.
  assert.equal(transcript.at(-1).eventLogHash, 'fnv1a32:bd7fa297');

  const previousLocation = globalThis.location;
  const previousWindow = globalThis.window;
  const location = new URL('http://gr-sim.local/?debug&contract=e1-twin-banks&seed=e1-twin-banks-01');
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
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const probe = new HeadlessContractSim({ contractId: 'e1-twin-banks', seed: 'e1-twin-banks-01' });
    const { buildZones, fords, water } = probe.manifest.tileParams;

    assert.deepEqual(
      Terrain.fordRanges(),
      fords.map(({ id, x, halfWidth }) => ({
        id,
        minX: x - halfWidth,
        maxX: x + halfWidth,
        centerX: x,
        halfWidth,
      })),
    );
    assert.equal(Terrain.sample(0, 0).zone, 'river');
    for (const ford of fords) assert.equal(Terrain.sample(ford.x, 0).zone, 'ford');
    for (const bar of water.gravelBars) assert.equal(Terrain.isCrossingStructure(bar.x, bar.z), true);

    for (const zone of buildZones) {
      const position = { x: (zone.minX + zone.maxX) / 2, z: (zone.minZ + zone.maxZ) / 2 };
      assert.equal(Terrain.isBuildable(position.x, position.z), true);
      assert.equal(probe.build.placeFree('palisade', position), true);
    }
    assert.equal(probe.build.diagnostics.palisades, buildZones.length);
    assert.equal(Terrain.isBuildable(buildZones[0].maxX + 1, -12), false);
    assert.equal(probe.build.placeFree('palisade', { x: buildZones[0].maxX + 1, z: -12 }), false);

    const run = () => {
      const sim = new HeadlessContractSim({ contractId: 'e1-twin-banks', seed: 'e1-twin-banks-01' });
      sim.hero.applyStats(10_000, 1);
      sim.hero.heal(10_000);
      let turn = sim.currentTurn();
      while (!turn.terminal) turn = sim.advanceToTurn();
      return { outcome: sim.outcome(), terminalLog: turn.view.appendLog.at(-1) };
    };
    const first = run();
    const second = run();
    assert.deepEqual(second, first);
    // F-1493-1: headless progression parity, s1493.
    assert.deepEqual(first.outcome, {
      secured: true,
      waves: 20,
      timeMs: 600000,
      gold: 0,
      kills: 805,
      calls: 0,
      eventLogHash: 'fnv1a32:9548ee84',
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
  const run = () => spawnSync(
    process.execPath,
    ['scripts/gr-sim.mjs', '--contract', contract.id, '--seed', 'e1-night-shift-01', '--policy=idle'],
    { cwd: ROOT, encoding: 'utf8', timeout: 30_000 },
  );
  const first = run();
  const second = run();
  assert.equal(first.status, 0, first.stderr);
  assert.equal(second.status, 0, second.stderr);
  const firstLines = first.stdout.trim().split('\n').map(JSON.parse);
  const secondOutcome = JSON.parse(second.stdout.trim().split('\n').at(-1));
  assert.deepEqual(secondOutcome, firstLines.at(-1));
  // F-1493-1: headless progression parity, s1493.
  assert.deepEqual(firstLines.at(-1), {
    secured: false,
    waves: 5,
    timeMs: 155300,
    gold: 0,
    kills: 95,
    calls: 0,
    eventLogHash: 'fnv1a32:7a7c1e7b',
  });
  const firstView = firstLines[0];
  assert.equal(firstView.now.works.byKind.lantern_post, contract.tileParams.prePlacedBuildables.length);
});

test('the Baron driver runs the declared fight and keeps medal writes off headless', async () => {
  const previousLocation = globalThis.location;
  const previousWindow = globalThis.window;
  const previousStorage = globalThis.localStorage;
  const location = new URL('http://gr-sim.local/?debug&contract=e1-baron&seed=e1-baron-01');
  const storageWrites = [];
  globalThis.location = location;
  globalThis.window = { location };
  globalThis.localStorage = {
    getItem: () => null,
    setItem: (key, value) => storageWrites.push([key, value]),
  };
  const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
  try {
    const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const manifest = JSON.parse(readFileSync(new URL('../assets/contracts/epoch-1-frontier/contracts.json', import.meta.url), 'utf8'))
      .contracts.find(({ id }) => id === 'e1-baron');
    const baron = manifest.twist.baron;
    const rig = { ...Balance.sparkRig };
    Object.assign(Balance.sparkRig, { damage: 1_000, fireRate: 60, range: 300, boltSpeed: 30, boltLife: 5 });
    try {
      const run = () => {
        const sim = new HeadlessContractSim({ contractId: 'e1-baron', seed: 'e1-baron-01' });
        sim.hero.applyStats(100_000, 1);
        sim.hero.heal(100_000);
        let turn = sim.currentTurn();
        while (!turn.terminal) turn = sim.advanceToTurn();
        return {
          outcome: sim.outcome(),
          payout: sim.runManager.diagnostics.victoryPayout,
          transcript: sim.replayEvents.filter(({ type }) =>
            ['baron_announcement', 'baron_spawned', 'baron_rocket_telegraph', 'baron_rocket_volley', 'run_secured', 'baron_defeated'].includes(type)),
        };
      };
      const first = run();
      const second = run();
      assert.deepEqual(second, first);
      // NAMED-CAUSE RE-PIN (F-1460-1, re-measured and landed s1462). kills/eventLogHash moved
      // 869/b9566c6d -> 861/36004eab at 4ab48743 (runner output of f1452-1 fort-solidity), which
      // gates the stuck-watchdog on route.blocker in src/entities/Enemy.ts and rewrites +139/-31 of
      // src/systems/BuildSystem.ts. Different routing -> different engagement -> 8 fewer kills over
      // 20 waves. Deliberate and spec-green, merely unpinned; f1452-1 reached main via drain
      // 07213c73, whose evidence was its own specs only, so nothing re-took this cross-cutting pin.
      // This is NOT the F-1403-1/F-1404-2 cross-engine class: that class means two engines
      // DISAGREEING, and they do not. Measured s1462 on the pinned 26.4.0 AND the runner's 23.11.1
      // -- both return 861/36004eab byte-identical, and the determinism assert above (second ===
      // first) passes on both. Re-pin only ever with a named cause; a blind re-pin is forbidden
      // (F-1441-3).
      // F-1493-1: headless progression parity, s1493.
      assert.deepEqual(first.outcome, {
        secured: true,
        waves: baron.wave,
        timeMs: 528_400,
        gold: 0,
        kills: 862,
        calls: 0,
        eventLogHash: 'fnv1a32:61d8cfd9',
      });
      assert.equal(first.payout.science, Balance.meta.victoryPayout.science * baron.sciencePayoutMult);
      assert.deepEqual(first.transcript.filter(({ type }) => type === 'baron_announcement').map(({ wave }) => wave), [5, 12, 18, 20]);
      const { at: spawnAt, ...spawn } = first.transcript.find(({ type }) => type === 'baron_spawned');
      assert.ok(Math.abs(spawnAt - baron.wave * Balance.waves.waveInterval / manifest.twist.waveCadenceMult) <= 1 / 30);
      assert.deepEqual(spawn, {
        type: 'baron_spawned',
        position: { x: 5.911, z: -14 },
        wave: baron.wave,
        hpScale: baron.hpScale,
        speedScale: baron.speedScale,
        scale: baron.scale,
        pursuitRange: baron.pursuitRange,
        escorts: baron.escortCount,
      });
      const { at: volleyAt, ...volley } = first.transcript.find(({ type }) => type === 'baron_rocket_volley');
      assert.ok(volleyAt - spawnAt >= baron.rocketVolley.telegraphSeconds);
      assert.deepEqual(volley, {
        type: 'baron_rocket_volley',
        volley: 0,
        count: baron.rocketVolley.count,
        damage: baron.rocketVolley.damage,
        radius: baron.rocketVolley.radius,
        target: { x: 0, z: 12 },
      });
      const { at: defeatAt, ...defeat } = first.transcript.at(-1);
      assert.equal(defeatAt, first.transcript.at(-2).at);
      assert.deepEqual(defeat, {
        type: 'baron_defeated',
        wave: baron.wave,
        defeatBeat: baron.defeatBeat,
        sciencePayoutMult: baron.sciencePayoutMult,
        medal: { eligible: true, blurb: baron.medalBlurb, awarded: false, sideEffects: false },
      });
      assert.deepEqual(storageWrites, []);
      assert.deepEqual(benchSeeds['e1-baron'], ['e1-baron-01', 'e1-baron-02', 'e1-baron-03', 'e1-baron-04', 'e1-baron-05']);

      Balance.sparkRig.damage = 0;
      const capped = new HeadlessContractSim({ contractId: 'e1-baron', seed: 'e1-baron-01' });
      capped.hero.applyStats(1_000_000_000, 1);
      capped.hero.heal(1_000_000_000);
      let cappedTurn = capped.currentTurn();
      while (cappedTurn.view.now.wave < baron.wave) cappedTurn = capped.advanceToTurn();
      assert.equal(capped.replayEvents.find(({ type }) => type === 'baron_spawned').escorts, 0);
    } finally {
      Object.assign(Balance.sparkRig, rig);
    }
  } finally {
    await vite.close();
    if (previousLocation === undefined) delete globalThis.location;
    else globalThis.location = previousLocation;
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
    if (previousStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = previousStorage;
  }
});

test('the E2 Baron fights keep their pinned outcomes', { timeout: 45_000 }, async () => {
  const previousLocation = globalThis.location;
  const previousWindow = globalThis.window;
  const contractIds = ['e2-hill-mine', 'e2-trestle', 'e2-incline'];
  const contracts = JSON.parse(readFileSync(new URL('../assets/contracts/epoch-2-steamworks/contracts.json', import.meta.url), 'utf8'))
    .contracts.filter(({ id }) => contractIds.includes(id));
  const outcomes = {};
  try {
    for (const contract of contracts) {
      const seed = benchSeeds[contract.id][0];
      const location = new URL(`http://gr-sim.local/?debug&contract=${contract.id}&seed=${seed}`);
      globalThis.location = location;
      globalThis.window = { location };
      const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
      try {
        const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');
        const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
        const rig = { ...Balance.sparkRig };
        Object.assign(Balance.sparkRig, { damage: 1_000, fireRate: 60, range: 300, boltSpeed: 30, boltLife: 5 });
        try {
          const run = () => {
            const sim = new HeadlessContractSim({ contractId: contract.id, seed });
            sim.hero.applyStats(100_000, 1);
            sim.hero.heal(100_000);
            let turn = sim.currentTurn();
            while (!turn.terminal) turn = sim.advanceToTurn();
            return sim.outcome();
          };
          const first = run();
          const second = run();
          assert.deepEqual(second, first);
          // autoSecureWaveForRun() returns Number.MAX_SAFE_INTEGER while twist.baron && !baronBeaten.
          assert.ok(first.waves >= contract.twist.secureWave);
          outcomes[contract.id] = first;
        } finally {
          Object.assign(Balance.sparkRig, rig);
        }
      } finally {
        await vite.close();
      }
    }
    // NAMED-CAUSE PIN (F-1493-2, lane-f1493-2-baron-drift-pin, 2026-08-06): the census
    // equality that used to catch baron-map drift was unsound and was correctly relaxed at
    // ff628a132; this is its replacement. A red requires a named cause; blind re-pinning is
    // forbidden (F-1441-3).
    assert.deepEqual(outcomes, {
      'e2-hill-mine': {
        secured: true,
        waves: 12,
        timeMs: 366_933,
        gold: 0,
        kills: 445,
        calls: 0,
        eventLogHash: 'fnv1a32:a3b2c95e',
      },
      'e2-trestle': {
        secured: true,
        waves: 12,
        timeMs: 365_067,
        gold: 0,
        kills: 448,
        calls: 0,
        eventLogHash: 'fnv1a32:94275d9a',
      },
      'e2-incline': {
        secured: true,
        waves: 12,
        timeMs: 360_767,
        gold: 0,
        kills: 424,
        calls: 0,
        eventLogHash: 'fnv1a32:3362e2f0',
      },
    });
  } finally {
    if (previousLocation === undefined) delete globalThis.location;
    else globalThis.location = previousLocation;
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});
