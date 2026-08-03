import { expect, test } from '@playwright/test';

const scenarios = [
  { kind: 'north-west', target: { x: -24, z: -12 }, starts: [-4, -2.5, -1, 0, 1, 2.5, 4].map((x) => ({ x, z: 14 })), crossing: -1 },
  { kind: 'north-east', target: { x: 24, z: -12 }, starts: [-4, -2.5, -1, 0, 1, 2.5, 4].map((x) => ({ x, z: 14 })), crossing: 1 },
  { kind: 'south-west', target: { x: -24, z: 12 }, starts: [-4, -2.5, -1, 0, 1, 2.5, 4].map((x) => ({ x, z: -30 })), crossing: -1 },
  { kind: 'south-east', target: { x: 24, z: 12 }, starts: [-4, -2.5, -1, 0, 1, 2.5, 4].map((x) => ({ x, z: -30 })), crossing: 1 },
  { kind: 'right-spawn', target: { x: 0, z: -12 }, starts: [-18, -16.5, -15, -13.5, -12, -10.5, -9, -7.5, -6].map((z) => ({ x: 26, z })), crossing: 0 },
];

test('Twin Banks enemy packs reach the claim from both banks, crossings, and the right spawn pocket', async ({ page }) => {
  test.setTimeout(90_000);
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`page: ${error.message}`));
  await page.goto('/?debug&terrain2d&contract=e1-twin-banks&nowaves&nolevel&nokill&nopause&nosteal&nowreck&seed=tb-never-wedged');
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 16);

  const rows = await page.evaluate(({ scenarios }) => {
    const api = window.__GR_TEST__!;
    api.setManualSim(true);
    api.setBalance('enemy.contactDamage', 0);
    const rows = [];
    for (const scenario of scenarios) {
      api.clearEnemies();
      api.teleport(scenario.target.x, scenario.target.z);
      const ids = scenario.starts.map((start) => {
        if (!api.spawnEnemyAt(start.x, start.z)) throw new Error(`Could not spawn ${scenario.kind}.`);
        const id = api.enemyPositions().find((enemy) => enemy.x === start.x && enemy.z === start.z)?.id;
        if (id === undefined) throw new Error(`Could not identify ${scenario.kind} enemy.`);
        return id;
      });
      const reached = new Set<number>();
      const crossed = new Set<number>();
      const wrongCrossing = new Set<number>();
      for (let elapsed = 0; elapsed < 36 && reached.size < ids.length; elapsed += 0.5) {
        api.advanceSim(0.5);
        for (const enemy of api.enemyPositions()) {
          if (!ids.includes(enemy.id)) continue;
          if (Math.hypot(scenario.target.x - enemy.x, scenario.target.z - enemy.z) <= 1.25) reached.add(enemy.id);
          if (scenario.crossing !== 0 && Math.abs(enemy.z) <= 4.5) {
            crossed.add(enemy.id);
            if (Math.sign(enemy.x) !== scenario.crossing) wrongCrossing.add(enemy.id);
          }
        }
      }
      rows.push({ kind: scenario.kind, count: ids.length, reached: reached.size, crossed: crossed.size, wrongCrossing: wrongCrossing.size });
    }
    return rows;
  }, { scenarios });

  expect(rows.reduce((sum, row) => sum + row.count, 0)).toBe(37);
  for (const row of rows) {
    expect(row.reached, row.kind).toBe(row.count);
    if (row.kind !== 'right-spawn') {
      expect(row.crossed, `${row.kind} crossing samples`).toBe(row.count);
      expect(row.wrongCrossing, `${row.kind} goal-side crossing`).toBe(0);
    }
  }
  expect(errors).toEqual([]);
});
