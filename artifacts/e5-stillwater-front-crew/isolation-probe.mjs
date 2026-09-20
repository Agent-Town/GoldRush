import { createServer } from 'vite';

globalThis.location = new URL('http://stillwater.local/?debug&contract=e5-stillwater');
globalThis.window = { location: globalThis.location };

const vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
try {
  const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
  const { loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
  const contract = loadContract('e5-stillwater');
  contract.tileParams.deepwater.corsairWaveSize = 1;
  contract.twist.enemyRoster.push(loadContract('e5-deepwater-claim').twist.enemyRoster[0]);
  const rows = [];
  for (const cycleSeconds of [24, 32, 40, 48]) {
    for (const firstFrontSeconds of [8, 12, 16]) {
      Object.assign(contract.twist.weather, {
        cycleSeconds,
        clearSeconds: firstFrontSeconds - 3,
        telegraphSeconds: 3,
        stormSeconds: Math.min(10, cycleSeconds - firstFrontSeconds - 1),
      });
      const sim = new HeadlessContractSim({ contractId: 'e5-stillwater', seed: 'e5-stillwater-01' });
      sim.hero.applyStats(100_000, 1);
      sim.hero.heal(100_000);
      let minCorsairBoatDistance = Number.POSITIVE_INFINITY;
      let firstCorsairAt = null;
      let turn = sim.currentTurn();
      for (let tick = 0; tick < 30 * 140 && !turn.terminal; tick += 1) {
        sim.step();
        const boat = sim.deepwater?.diagnostics.anchor;
        for (const enemy of sim.enemies.all) {
          if (!enemy.isAlive || enemy.variantId !== 'corsair_skiff' || !boat) continue;
          firstCorsairAt ??= Math.round(sim.timeAlive * 1_000);
          minCorsairBoatDistance = Math.min(minCorsairBoatDistance, Math.hypot(enemy.position.x - boat.x, enemy.position.z - boat.z));
        }
        if (tick % 30 === 29) turn = sim.currentTurn();
        if (turn.view.now.wave >= 3) break;
      }
      rows.push({
        cycleSeconds,
        firstFrontSeconds,
        terminalAtWave3: turn.terminal,
        wave: turn.view.now.wave,
        heroHp: turn.view.now.hero.hp,
        firstCorsairAt,
        minCorsairBoatDistance,
        fronts: turn.view.now.deepwater?.storm.waves.length,
        corsairsSpawned: turn.view.now.deepwater?.corsairsSpawned,
        eventLogHash: null,
      });
    }
  }
  process.stdout.write(`${JSON.stringify(rows, null, 2)}\n`);
} finally {
  await vite.close();
}
