// Scratch probe (milk/twin-sockets): can the E5 + E6 era consumers be CONSTRUCTED and
// TICKED under the headless SSR environment at all? Answered before any scope is authored,
// per the s1475 lesson (124,606 tokens spent proving a harness that could not collect).
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const contractId = process.argv[2] ?? 'e5-deepwater-claim';
const location = new URL('http://gr-sim.local/');
location.searchParams.set('debug', '');
location.searchParams.set('contract', contractId);
globalThis.location = location;
globalThis.window = { location };

const root = fileURLToPath(new URL('../..', import.meta.url));
const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });

const report = [];
const probe = async (label, body) => {
  try {
    report.push([label, 'OK', await body()]);
  } catch (error) {
    report.push([label, 'THROW', String(error?.stack ?? error).split('\n').slice(0, 3).join(' | ')]);
  }
};

try {
  const THREE = await vite.ssrLoadModule('three');
  const { loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
  const { createDeepwaterClaimTile } = await vite.ssrLoadModule('/src/world/DeepwaterClaimTile.ts');
  const { DredgeQueenBossSystem } = await vite.ssrLoadModule('/src/systems/DredgeQueenBossSystem.ts');
  const { DeepwaterArsenal } = await vite.ssrLoadModule('/src/entities/DeepwaterArsenal.ts');
  const { WrangleSystem } = await vite.ssrLoadModule('/src/systems/WrangleSystem.ts');
  const { DecayScheduler } = await vite.ssrLoadModule('/src/systems/DecaySystem.ts');
  const { TileStateStore } = await vite.ssrLoadModule('/src/game/TileStateStore.ts');
  const { EventBus } = await vite.ssrLoadModule('/src/core/EventBus.ts');
  const { Economy } = await vite.ssrLoadModule('/src/game/Economy.ts');
  const { EnemyPool } = await vite.ssrLoadModule('/src/entities/pools.ts');
  const { CombatSystem } = await vite.ssrLoadModule('/src/systems/CombatSystem.ts');

  // --- E5: the tile consumer (water regions + claim boat + storm/corsair scheduler)
  let tile;
  await probe('E5 DeepwaterClaimTile construct', () => {
    tile = createDeepwaterClaimTile(loadContract('e5-deepwater-claim'));
    return tile === null ? 'null' : `boat pads=${tile.snapshot().boat.pads?.length ?? '?'}`;
  });
  await probe('E5 tile advance 600s', () => {
    let snapshot;
    for (let step = 0; step < 600 * 30; step += 1) snapshot = tile.advance((step + 1) / 30);
    return `corsairWaves=${snapshot.corsairWaves.length} storm=${JSON.stringify(snapshot.storm).slice(0, 120)}`;
  });
  await probe('E5 tile determinism (fresh instance, same ticks)', () => {
    const other = createDeepwaterClaimTile(loadContract('e5-deepwater-claim'));
    for (let step = 0; step < 600 * 30; step += 1) other.advance((step + 1) / 30);
    const a = JSON.stringify(tile.snapshot());
    const b = JSON.stringify(other.snapshot());
    return a === b ? 'IDENTICAL' : `DIVERGED (${a.length} vs ${b.length})`;
  });
  await probe('E5 boat levers (placeBoatBuilding + reanchor)', () => {
    const boat = tile.snapshot().boat;
    const padId = boat.pads?.[0]?.id ?? boat.pads?.[0];
    const anchors = boat.anchors ?? [];
    return `pads=${JSON.stringify(boat.pads).slice(0, 200)} anchors=${JSON.stringify(anchors).slice(0, 200)}`;
  });

  // --- E5: the boss consumer
  await probe('E5 DredgeQueenBossSystem construct+update', () => {
    const enemies = new EnemyPool();
    const boss = new DredgeQueenBossSystem(
      () => enemies.all,
      (position, params) => enemies.spawn(position, params),
      (enemy) => enemies.recycle(enemy),
      () => tile.snapshot().wrecks,
      () => new THREE.Vector3(),
      () => false,
      () => true,
      true,
      { readAtBirth: () => null, writeAtCeremony: () => undefined },
    );
    for (let step = 0; step < 300; step += 1) boss.update(step / 30);
    return `diagnostics=${JSON.stringify(boss.diagnostics()).slice(0, 200)}`;
  });

  // --- E5: the arsenal consumer
  await probe('E5 DeepwaterArsenal construct+update', () => {
    const events = new EventBus();
    const enemies = new EnemyPool();
    const combat = new CombatSystem(
      events, [], enemies, { all: [], spawn: () => null }, { all: [] }, { all: [] },
      { spawn: () => undefined }, {}, () => undefined,
    );
    const arsenal = new DeepwaterArsenal(
      combat,
      () => new THREE.Vector3(),
      () => tile.snapshot().boat.buildings ?? [],
      () => true,
      () => true,
      () => false,
      () => false,
    );
    for (let step = 0; step < 300; step += 1) arsenal.update(step / 30);
    return `diagnostics=${JSON.stringify(arsenal.diagnostics).slice(0, 200)}`;
  });

  // --- E6: the epoch-wide wrangle consumer
  await probe('E6 WrangleSystem construct+update', () => {
    const events = new EventBus();
    const decay = new DecayScheduler(events);
    const enemies = new EnemyPool();
    const economy = new Economy();
    const store = new TileStateStore({ getItem: () => null, setItem: () => undefined });
    const wrangle = new WrangleSystem(
      true, 'e6-showroom', decay, enemies, economy, store,
      () => undefined, () => undefined,
    );
    for (let step = 0; step < 300; step += 1) {
      decay.tick();
      wrangle.update(1 / 30, step / 30);
    }
    return `diagnostics=${JSON.stringify(wrangle.diagnostics()).slice(0, 260)}`;
  });
} finally {
  await vite.close();
}

for (const [label, status, detail] of report) {
  process.stdout.write(`${status === 'OK' ? '  OK  ' : ' THROW'} | ${label}\n         ${detail}\n`);
}
