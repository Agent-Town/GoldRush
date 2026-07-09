import { expect, test, type Page, type TestInfo } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type RiverSnapshot = {
  vista: ThreeGameDiagnostics['terrain']['vista'];
  water: ThreeGameDiagnostics['terrain']['water'];
  rendererCalls: number;
  frameMsP95: number;
};

const artifactDir = path.resolve('artifacts/064');
const panAnchors = new Set(['-22.0,-6.8', '-9.0,6.7', '-1.5,-6.4', '7.5,6.5', '18.0,-7.0', '25.0,6.9']);

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openGame(page: Page, seed: string, extra = ''): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/?debug&nowaves&nokill&nolevel&nopause&nosteal&seed=${seed}${extra}`);
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 35);
  await page.addStyleTag({ content: '.lil-gui, .dg.ac { display: none !important; }' });
  const begin = page.getByRole('button', { name: 'Begin' }).first();
  if ((await begin.count()) > 0) await begin.click();
  return errors;
}

async function snapshot(page: Page, seed: string, extra: string): Promise<{ errors: ErrorBucket; snapshot: RiverSnapshot }> {
  const errors = await openGame(page, seed, extra);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frameMs.sampleCount ?? 0) > 20);
  const snap = await page.evaluate(() => ({
    vista: window.__THREE_GAME_DIAGNOSTICS__!.terrain.vista,
    water: window.__THREE_GAME_DIAGNOSTICS__!.terrain.water,
    rendererCalls: window.__THREE_GAME_DIAGNOSTICS__!.renderer.calls,
    frameMsP95: window.__THREE_GAME_DIAGNOSTICS__!.frameMs.p95,
  }));
  return { errors, snapshot: snap };
}

async function capturePose(page: Page, testInfo: TestInfo, label: string, x: number, z: number): Promise<string> {
  fs.mkdirSync(artifactDir, { recursive: true });
  await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z), { x, z });
  await page.waitForTimeout(550);
  const form = testInfo.project.name.includes('mobile') ? '390' : 'desktop';
  const file = path.join(artifactDir, `${form}-${label}.png`);
  const body = await page.screenshot({ path: file, fullPage: false });
  await testInfo.attach(`${form}-${label}`, { body, contentType: 'image/png' });
  return file;
}

test('river continues through the vista in both terrain render paths', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  const off = await snapshot(page, `064-off-${testInfo.project.name}`, '&terrainMesh=0&terrainSplat=0');
  const on = await snapshot(page, `064-on-${testInfo.project.name}`, '&terrainMesh=1&terrainSplat=1');

  for (const entry of [off.snapshot, on.snapshot]) {
    expect(entry.water?.riverPresent).toBe(true);
    expect(entry.vista.river).toMatchObject({
      present: true,
      drawCalls: 1,
      radius: 90,
      fadeStart: 78,
      westEdgeCenterZ: 0,
      eastEdgeCenterZ: 0,
    });
    expect(entry.vista.river.vertices).toBeGreaterThan(20);
    expect(entry.vista.river.meanderAmplitude).toBeGreaterThan(1.2);
    expect(entry.vista.river.westFarCenterZ).not.toBe(0);
    expect(entry.vista.river.eastFarCenterZ).not.toBe(0);
    expect(entry.rendererCalls).toBeLessThanOrEqual(200);
    expect(entry.frameMsP95).toBeGreaterThan(0);
  }

  const shots = [
    await capturePose(page, testInfo, 'west-river-end', -29, 0),
    await capturePose(page, testInfo, 'east-river-end', 29, 0),
    await capturePose(page, testInfo, 'wide-river-vista', 0, 12),
  ];
  const report = {
    project: testInfo.project.name,
    terrainMeshOff: off.snapshot,
    terrainMeshOn: on.snapshot,
    rendererCallDeltaFlagOnMinusOff: on.snapshot.rendererCalls - off.snapshot.rendererCalls,
    shots,
  };
  const body = `${JSON.stringify(report, null, 2)}\n`;
  fs.writeFileSync(path.join(artifactDir, `${testInfo.project.name}-render-report.json`), body);
  await testInfo.attach('064-river-report', { body, contentType: 'application/json' });

  expect(off.errors.consoleErrors).toEqual([]);
  expect(off.errors.pageErrors).toEqual([]);
  expect(on.errors.consoleErrors).toEqual([]);
  expect(on.errors.pageErrors).toEqual([]);
});

test('river-zone, panning, and sluice sim contracts stay unchanged', async ({ page }) => {
  const errors = await openGame(page, '064-zone-contracts');
  const zones = await page.evaluate(() => ({
    bank: window.__GR_TEST__?.terrainSample(-12, -12),
    shallows: window.__GR_TEST__?.terrainSample(-12, -5.5),
    river: window.__GR_TEST__?.terrainSample(-12, 0),
    ford: window.__GR_TEST__?.terrainSample(0, 0),
    out: window.__GR_TEST__?.terrainSample(34, 0),
    activePanAnchors:
      window.__THREE_GAME_DIAGNOSTICS__?.harvest.activeNodes
        .filter((node) => node.active)
        .map((node) => `${node.position.x.toFixed(1)},${node.position.z.toFixed(1)}`)
        .sort() ?? [],
  }));

  expect(zones.bank).toEqual({ walkable: true, speedMul: 1, zone: 'bank' });
  expect(zones.shallows).toEqual({ walkable: true, speedMul: 0.8, zone: 'shallows', waterSource: 'river', waterDepth: 0.2, waterClass: 'wade' });
  expect(zones.river).toEqual({ walkable: true, speedMul: 0.55, zone: 'river', waterSource: 'river', waterDepth: 1.25, waterClass: 'deep' });
  expect(zones.ford).toEqual({ walkable: true, speedMul: 0.85, zone: 'ford', waterSource: 'river', waterDepth: 0.35, waterClass: 'wade' });
  expect(zones.out).toEqual({ walkable: false, speedMul: 0, zone: 'out' });
  expect(zones.activePanAnchors.length).toBeGreaterThanOrEqual(2);
  expect(zones.activePanAnchors.every((anchor) => panAnchors.has(anchor))).toBe(true);

  await expect(page.evaluate(() => window.__GR_TEST__?.placeFree('sluice', 10, 12))).resolves.toBe(false);
  await expect(page.evaluate(() => window.__GR_TEST__?.placeFree('sluice', 0, 7))).resolves.toBe(true);

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
