/** canyon-works-traversal-2, finding F-CW2-1: which of the Canyon Works' authored fixtures stand in the browser.
 *
 * tileParams.prePlacedBuildables authors two lantern posts (-32/32, 32) and two arc turrets (-18/18, 22). The game places
 * them through BuildSystem.placeFree (src/game/Game.ts placeContractFixtures), which refuses ground that is not walkable.
 * This probe boots the map the way e2e/e3-canyon-works.spec.ts does and records what stands, with the sim sample under
 * each fixture. CW2_FIXTURE_LABEL names the contract state being served (the batch swaps the two ramp numbers).
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from '@playwright/test';
import { ACTIVE_EPOCH_KEY } from '../../../src/meta/ContractFamilies';

const OUT = path.join(import.meta.dirname, '..', 'fixtures');
const LABEL = process.env.CW2_FIXTURE_LABEL ?? 'unlabelled';
const QUERY = '?debug&epoch=epoch-3-voltage&contract=e3-canyon-works&nowaves&nospawn&nolevel&nopause&seed=canyon-1';

test.beforeEach(async ({ page }) => page.addInitScript(({ key }) => {
  localStorage.clear();
  localStorage.setItem(key, 'epoch-3-voltage');
}, { key: ACTIVE_EPOCH_KEY }));

test(`canyon fixtures standing (${LABEL})`, async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`/${QUERY}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const body = await page.evaluate(() => {
    const d = window.__THREE_GAME_DIAGNOSTICS__!;
    const authored = d.contract.tileParams.prePlacedBuildables ?? [];
    return {
      elevation: d.contract.tileParams.elevation?.analytic
        ? { t2RampStart: d.contract.tileParams.elevation.analytic.t2RampStart, t2RampEnd: d.contract.tileParams.elevation.analytic.t2RampEnd }
        : null,
      authored: authored.map((f: { id: string; x: number; z: number }) => ({ ...f, sim: window.__GR_TEST__!.terrainSim(f.x, f.z), ground: window.__GR_TEST__!.terrainSample(f.x, f.z) })),
      standing: (d.build?.hp ?? []).map((b) => ({ id: String(b.id), index: b.index, x: b.position.x, z: b.position.z, hp: b.hp, wrecked: b.wrecked })),
    };
  });
  await mkdir(OUT, { recursive: true });
  const record = { label: LABEL, project: testInfo.project.name, at: new Date().toISOString(), ...body, errors };
  await writeFile(path.join(OUT, `${LABEL}-${testInfo.project.name}.json`), `${JSON.stringify(record, null, 2)}\n`);
  console.log(`[fixtures] ${LABEL} ${testInfo.project.name} ${JSON.stringify({ elevation: body.elevation, standing: body.standing.map((b) => `${b.id}@${b.x},${b.z}`), errors: errors.length })}`);
});
