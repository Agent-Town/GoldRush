/** canyon-works-traversal-2, finding F-CW2-1: why e2e/e3-canyon-works.spec.ts's moth step reds with the slope-legal ramp.
 *
 * The spec (lines 34..74) strings the six pylon sites, turns the night to wave 8, spawns one moth at (30, 32) beside the
 * east gallery lamp (lantern:1 at 32, 32) and expects it alive and attached after 2 s of sim. With t2 14..32 it reads
 * alive 0, attached 0, sourceId null on both projects. The sim's own terrainLineOfSight says the pre-placed east arc turret
 * at (18, 22) could not see (32, 32) over the old 18..28 ramp and sees it over the new one. This probe replays the spec's
 * steps in three arms, one variable each: as the spec; the east turret wrecked first; the west turret wrecked first.
 * It measures, it does not assert. Run inside the drain lock, dev server on 5325 (see playwright.probe.config.ts).
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { ACTIVE_EPOCH_KEY } from '../../../src/meta/ContractFamilies';

const OUT = path.join(import.meta.dirname, '..', 'moth-lamp');
const QUERY = '?debug&epoch=epoch-3-voltage&contract=e3-canyon-works&nowaves&nospawn&nolevel&nopause&seed=canyon-1';
const PYLONS = [[-12, -36], [-24, -20], [-28, 8], [12, -36], [24, -20], [28, 8]] as const;
const ARMS = [
  { id: 'as-the-spec', wreckTurretsAt: [] as Array<[number, number]> },
  { id: 'east-turret-wrecked', wreckTurretsAt: [[18, 22]] as Array<[number, number]> },
  { id: 'west-turret-wrecked', wreckTurretsAt: [[-18, 22]] as Array<[number, number]> },
];

test.setTimeout(120_000);
test.beforeEach(async ({ page }) => page.addInitScript(({ key }) => {
  localStorage.clear();
  localStorage.setItem(key, 'epoch-3-voltage');
}, { key: ACTIVE_EPOCH_KEY }));

async function open(page: Page, errors: string[]): Promise<void> {
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`/${QUERY}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const briefing = page.getByTestId('contract-briefing');
  if (await briefing.isVisible()) await page.getByTestId('contract-briefing-dismiss').click();
  await page.evaluate(() => window.__GR_TEST__!.setManualSim(true));
}

for (const arm of ARMS) {
  test(`moth at the east gallery lamp: ${arm.id}`, async ({ page }, testInfo) => {
    const errors: string[] = [];
    await open(page, errors);
    const placed = await page.evaluate((sites) => {
      window.__GR_TEST__!.grantGold(1_000);
      return sites.map(([x, z]) => window.__GR_TEST__!.placeFree('sentry_beacon', x, z));
    }, PYLONS);
    await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.2));
    await page.evaluate(() => window.__GR_TEST__!.setWave(6));
    await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.lighting?.nightShift?.phase)).toBe('dusk');
    await page.evaluate(() => window.__GR_TEST__!.setWave(8));
    await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.lighting?.nightShift?.phase)).toBe('dark');
    const before = await page.evaluate(() => ({
      defences: (window.__THREE_GAME_DIAGNOSTICS__!.build?.hp ?? []).map((b) => ({ id: String(b.id), index: b.index, x: b.position.x, z: b.position.z, hp: b.hp, wrecked: b.wrecked })),
      power: window.__THREE_GAME_DIAGNOSTICS__!.power.nodes.filter((n) => n.id.startsWith('turret-') || n.id.startsWith('lamp-')).map((n) => ({ id: n.id, state: n.state })),
      coverage: window.__GR_TEST__!.lightCoverage(37.5, 32),
      killsByOwner: window.__THREE_GAME_DIAGNOSTICS__!.build?.killsByOwner ?? null,
      damageByOwner: window.__THREE_GAME_DIAGNOSTICS__!.build?.damageByOwner ?? null,
    }));
    const wrecked: Array<{ index: number; ok: boolean }> = [];
    for (const [x, z] of arm.wreckTurretsAt) {
      const target = before.defences.find((b) => b.id === 'turret' && Math.hypot(b.x - x, b.z - z) < 0.5);
      if (!target) { wrecked.push({ index: -1, ok: false }); continue; }
      const ok = await page.evaluate((index) => window.__GR_TEST__!.wreck('turret', index), target.index);
      wrecked.push({ index: target.index, ok });
    }
    await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.2));
    const spawned = await page.evaluate(() => window.__GR_TEST__!.spawnMoths(1, 30, 32));
    await page.evaluate(() => window.__GR_TEST__!.advanceSim(2));
    const after = await page.evaluate(() => ({
      mothSwarm: window.__THREE_GAME_DIAGNOSTICS__!.mothSwarm,
      coverage: window.__GR_TEST__!.lightCoverage(37.5, 32),
      defences: (window.__THREE_GAME_DIAGNOSTICS__!.build?.hp ?? []).map((b) => ({ id: String(b.id), index: b.index, x: b.position.x, z: b.position.z, hp: b.hp, wrecked: b.wrecked })),
      killsByOwner: window.__THREE_GAME_DIAGNOSTICS__!.build?.killsByOwner ?? null,
      damageByOwner: window.__THREE_GAME_DIAGNOSTICS__!.build?.damageByOwner ?? null,
    }));
    const body = { project: testInfo.project.name, arm: arm.id, placed, wrecked, spawned, before, after, errors, at: new Date().toISOString() };
    await mkdir(OUT, { recursive: true });
    await writeFile(path.join(OUT, `${arm.id}-${testInfo.project.name}.json`), `${JSON.stringify(body, null, 2)}\n`);
    console.log(`[moth-lamp] ${testInfo.project.name} ${arm.id} ${JSON.stringify({ placed, wrecked, spawned, mothSwarm: after.mothSwarm, coverageBefore: before.coverage, coverageAfter: after.coverage, killsByOwner: after.killsByOwner, errors: errors.length })}`);
  });
}
