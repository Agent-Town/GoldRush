// Scratch probe 3 (milk/twin-sockets): the remaining admission questions.
// Which E6 consumers are headless-constructible, and what do the contested contracts actually claim?
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const location = new URL('http://gr-sim.local/');
location.searchParams.set('debug', '');
location.searchParams.set('contract', 'the-claim');
globalThis.location = location;
globalThis.window = { location };

const originalConsole = { log: console.log, info: console.info, debug: console.debug };
console.log = console.info = console.debug = () => undefined;

const root = fileURLToPath(new URL('../..', import.meta.url));
const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });

const report = [];
const probe = async (label, body) => {
  try {
    report.push([label, 'OK', await body()]);
  } catch (error) {
    report.push([label, 'THROW', String(error?.stack ?? error).split('\n').slice(0, 2).join(' | ')]);
  }
};

try {
  const { loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
  const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');
  const { createHomemakerBossSystem } = await vite.ssrLoadModule('/src/systems/HomemakerBossSystem.ts');
  const { E6TileConsumerSystem } = await vite.ssrLoadModule('/src/systems/E6TileConsumerSystem.ts');
  const { DecayScheduler } = await vite.ssrLoadModule('/src/systems/DecaySystem.ts');
  const { TileStateStore } = await vite.ssrLoadModule('/src/game/TileStateStore.ts');
  const { EventBus } = await vite.ssrLoadModule('/src/core/EventBus.ts');
  const { Economy } = await vite.ssrLoadModule('/src/game/Economy.ts');
  const { EnemyPool } = await vite.ssrLoadModule('/src/entities/pools.ts');

  await probe('Balance.run.secureWave (default securing wave)', () => `${Balance.run.secureWave}`);

  await probe('E6 HomemakerBossSystem headless-constructible?', () => {
    const enemies = new EnemyPool();
    const store = new TileStateStore({ getItem: () => null, setItem: () => undefined });
    const boss = createHomemakerBossSystem({
      enemies,
      buildSystem: () => ({ diagnostics: { hp: [] } }),
      targeting: { buildingsInRadius: () => [] },
      combat: {},
      goldPickups: { spawn: () => 0, snapshot: () => [], take: () => 0 },
      announce: () => undefined,
      syncStockpileHoldings: () => undefined,
      tileStateStore: store,
      contractId: 'e6-glow-mesa',
      enabled: true,
      now: () => 0,
      suppressBossSpawn: () => false,
    });
    boss.update(0);
    return `constructed; diagnostics=${JSON.stringify(boss.diagnostics?.() ?? boss.diagnostics ?? null).slice(0, 160)}`;
  });

  await probe('E6 E6TileConsumerSystem headless-constructible?', () => {
    const events = new EventBus();
    const decay = new DecayScheduler(events);
    const economy = new Economy();
    const store = new TileStateStore({ getItem: () => null, setItem: () => undefined });
    const contract = loadContract('e6-glow-mesa');
    const system = new E6TileConsumerSystem(
      true, 'e6-glow-mesa', decay, economy, store, contract.tileParams, () => undefined,
    );
    system.update(1 / 30, 0, []);
    return `constructed; diagnostics=${JSON.stringify(system.diagnostics).slice(0, 200)}`;
  });

  await probe('E6 half-life-hollow: briefing crossing claim vs authored data', () => {
    const c = loadContract('e6-half-life-hollow');
    const briefing = JSON.stringify(c.briefing ?? '');
    const tp = c.tileParams;
    const crossingKeys = Object.keys(tp).filter((k) => /bridge|causeway|cross|shelf|span|ford/i.test(k));
    return `briefing=${briefing.slice(0, 320)}\n         crossingTileKeys=${JSON.stringify(crossingKeys)} ford=${tp.ford} fords=${JSON.stringify(tp.fords ?? null)} heightfield=${tp.heightfield ? Object.keys(tp.heightfield).join('/') : 'none'}`;
  });

  await probe('E6 picnic: stake markers (the three-stake claim)', () => {
    const c = loadContract('e6-picnic');
    return `stakeMarkers=${JSON.stringify(c.tileParams.stakeMarkers)}`;
  });

  await probe('E6 showroom: everything the contract declares', () => {
    const c = loadContract('e6-showroom');
    return `briefing=${JSON.stringify(c.briefing ?? '').slice(0, 260)}\n         stakes=${JSON.stringify(c.tileParams.stakeMarkers)} buildZones=${(c.tileParams.buildZones ?? []).length} harvestAnchors=${(c.tileParams.harvestAnchors ?? []).length} roster=${JSON.stringify(c.twist.enemyRoster.map((e) => e.id))}`;
  });

  await probe('E6 glow-mesa: what the tile consumer needs', () => {
    const c = loadContract('e6-glow-mesa');
    const tp = c.tileParams;
    const keys = Object.keys(tp).filter((k) => /decay|vein|night|glow|starstone/i.test(k));
    return `e6TileKeys=${JSON.stringify(keys)} heightfield=${tp.heightfield ? Object.keys(tp.heightfield).join('/') : 'none'}`;
  });
} finally {
  await vite.close();
  Object.assign(console, originalConsole);
}

for (const [label, status, detail] of report) {
  process.stdout.write(`${status === 'OK' ? '  OK  ' : ' THROW'} | ${label}\n         ${detail}\n`);
}
