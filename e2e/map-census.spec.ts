import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { devices, expect, test, type Page } from '@playwright/test';
import { PNG } from 'pngjs';
import { listEpochs, loadEpoch } from '../src/meta/ContractFamilies';

type Result = 'PASS' | 'N/A' | `FAIL: ${string}`;
type Row = {
  id: string;
  era: number;
  boot: Result;
  render: Result;
  mq1: Result;
  mq2: Result;
  mq3: Result;
  brightness: Result;
  budget: Result;
  mobile: Result;
};
type Errors = { console: string[]; page: string[] };

const ARTIFACT = path.resolve('artifacts/map-census/table.md');
const PAINTED_FALLBACKS = new Set(['e10-last-claim', 'e10-river']);
const MOBILE_SPOTS = new Set(['the-claim', 'e2-pressure-garden', 'e5-deepwater-claim', 'e8-low-orbit', 'e10-river']);
const CONTRACTS = listEpochs().flatMap(({ id: epochId }) => {
  const era = Number(epochId.match(/epoch-(\d+)/)?.[1]);
  return loadEpoch(epochId).contracts.map(({ id }) => ({ id, era }));
});
const rows = new Map<string, Row>(CONTRACTS.map(({ id, era }) => [id, {
  id, era, boot: 'FAIL: not run', render: 'FAIL: not run', mq1: 'FAIL: not run', mq2: 'FAIL: not run',
  mq3: 'FAIL: not run', brightness: 'FAIL: not run', budget: 'FAIL: not run', mobile: MOBILE_SPOTS.has(id) ? 'FAIL: not run' : 'N/A',
}]));

for (const contract of CONTRACTS) {
  test(`${contract.id} census`, async ({ page }) => {
    test.setTimeout(15_000);
    const row = await census(page, contract.id, contract.era);
    rows.set(contract.id, row);
  });
}

for (const contract of CONTRACTS.filter(({ id }) => MOBILE_SPOTS.has(id))) {
  test(`${contract.id} mobile spot`, async ({ browser }) => {
    test.setTimeout(15_000);
    const context = await browser.newContext({ ...devices['Pixel 5'], viewport: { width: 390, height: 844 } });
    try {
      const mobile = await census(await context.newPage(), contract.id, contract.era);
      rows.get(contract.id)!.mobile = failedCells(mobile).length === 0 ? 'PASS' : `FAIL: ${failedCells(mobile).join(', ')}`;
    } finally {
      await context.close();
    }
  });
}

test.afterAll(async () => {
  expect(CONTRACTS).toHaveLength(41);
  await mkdir(path.dirname(ARTIFACT), { recursive: true });
  const ordered = CONTRACTS.map(({ id }) => rows.get(id)!);
  const closed = ['MQ-1', 'MQ-2', 'MQ-3', 'Brightness'].filter((_, index) =>
    ordered.every((row) => [row.mq1, row.mq2, row.mq3, row.brightness][index] !== undefined
      && ![row.mq1, row.mq2, row.mq3, row.brightness][index]!.startsWith('FAIL')));
  const lines = [
    '# Map census',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    `Census-closed: ${closed.length ? closed.join(', ') : 'none'}`,
    '',
    '| Map | Era | Boot | Render | MQ-1 preview | MQ-2 band | MQ-3 depenetration | Landmark brightness | <=10s | Mobile spot |',
    '|---|---:|---|---|---|---|---|---|---|---|',
    ...ordered.map((row) => `| ${row.id} | ${row.era} | ${cell(row.boot)} | ${cell(row.render)} | ${cell(row.mq1)} | ${cell(row.mq2)} | ${cell(row.mq3)} | ${cell(row.brightness)} | ${cell(row.budget)} | ${cell(row.mobile)} |`),
    '',
  ];
  await writeFile(ARTIFACT, lines.join('\n'));
});

async function census(page: Page, id: string, era: number): Promise<Row> {
  const started = Date.now();
  const row: Row = {
    id, era, boot: 'FAIL: not run', render: 'FAIL: not run', mq1: 'FAIL: not run', mq2: 'FAIL: not run',
    mq3: 'FAIL: not run', brightness: 'FAIL: not run', budget: 'FAIL: not run', mobile: 'N/A',
  };
  const errors = collectErrors(page);
  const boot = await probe(async () => {
    await page.goto(`/?debug&era=${era}&contract=${id}&nowaves&nolevel&nokill&nopause&tier=full&seed=census-${id}`);
    await page.waitForFunction(() => Boolean(window.__GR_TEST__) && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
    const dismiss = page.getByTestId('contract-briefing-dismiss');
    if (await dismiss.isVisible().catch(() => false)) await dismiss.click();
    await page.waitForFunction(() => document.querySelector<HTMLCanvasElement>('#game-canvas')?.dataset.terrain3dPilotState !== 'loading');
    const active = await page.evaluate(() => window.__GR_TEST__!.activeContract().id);
    if (active !== id) throw new Error(`door opened ${active}`);
  });
  if (boot !== 'PASS') return { ...row, boot, budget: budgetResult(started) };

  row.render = await probe(async () => {
    const source = await page.locator('#game-canvas').getAttribute('data-terrain3d-pilot-render-source');
    const expected = PAINTED_FALLBACKS.has(id) ? 'painted' : 'glb';
    if (source !== expected) throw new Error(`expected ${expected}, got ${source}`);
  });
  row.mq1 = await previewProbe(page);
  row.mq3 = await depenetrationProbe(page);
  row.mq2 = await bandProbe(page);
  row.brightness = id === 'e1-night-shift' || PAINTED_FALLBACKS.has(id) ? 'N/A' : await brightnessProbe(page);
  row.boot = errors.console.length || errors.page.length
    ? `FAIL: console=${errors.console.length}, page=${errors.page.length}`
    : 'PASS';
  row.budget = budgetResult(started);
  return row;
}

async function previewProbe(page: Page): Promise<Result> {
  return probe(async () => {
    const target = await page.evaluate(() => {
      const api = window.__GR_TEST__!;
      api.grantGold(500);
      if (!api.selectBuildable('sluice')) throw new Error('sluice unavailable');
      const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas')!;
      for (let z = -50; z <= 50; z += 5) for (let x = -50; x <= 50; x += 5) {
        const point = api.screenPoint(x, z, 0);
        if (point.inView && point.x > 32 && point.x < canvas.clientWidth - 32 && point.y > 32 && point.y < canvas.clientHeight - 32) {
          return { ...point, worldX: x, worldZ: z };
        }
      }
      throw new Error('no planar probe point in camera');
    });
    const box = await page.locator('#game-canvas').boundingBox();
    if (!box) throw new Error('canvas missing');
    await page.mouse.move(box.x + target.x, box.y + target.y);
    await page.waitForFunction(({ x, z }) => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostPos?.x === x
      && window.__THREE_GAME_DIAGNOSTICS__?.build.ghostPos?.z === z,
    { x: target.worldX, z: target.worldZ }, { timeout: 1_500 });
    const result = await page.evaluate(({ x, z }) => ({
      build: window.__THREE_GAME_DIAGNOSTICS__!.build,
      visualY: window.__GR_TEST__!.terrainVisualY(x, z, 0, 1),
    }), { x: target.worldX, z: target.worldZ });
    if (!result.build.ghostVisible) throw new Error('preview hidden');
    if (Math.abs(result.build.ghostY - result.visualY) > 0.05) throw new Error('preview off terrain');
  });
}

async function bandProbe(page: Page): Promise<Result> {
  return probe(async () => {
    const box = await page.locator('#game-canvas').boundingBox();
    if (!box) throw new Error('canvas missing');
    const shot = await page.screenshot({ clip: {
      x: box.x + box.width * 0.2,
      y: box.y + box.height * 0.12,
      width: box.width * 0.6,
      height: 1,
    } });
    const png = PNG.sync.read(shot);
    const values: number[] = [];
    const buckets = new Set<number>();
    for (let x = 0; x < png.width; x += 4) {
      const offset = x * 4;
      const [red, green, blue] = [png.data[offset]!, png.data[offset + 1]!, png.data[offset + 2]!];
      values.push(red * 0.2126 + green * 0.7152 + blue * 0.0722);
      buckets.add((red >> 4) << 8 | (green >> 4) << 4 | (blue >> 4));
    }
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const deviation = Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length);
    if (deviation <= 4 || buckets.size <= 4) throw new Error(`flat row deviation=${deviation.toFixed(1)} buckets=${buckets.size}`);
  });
}

async function depenetrationProbe(page: Page): Promise<Result> {
  return probe(async () => {
    const result = await page.evaluate(async () => {
      const terrain = await Function('return import("/src/world/Terrain.ts")')() as typeof import('../src/world/Terrain');
      const blocker = terrain.landmarkBlockers()[0];
      if (!blocker) return null;
      const api = window.__GR_TEST__!;
      api.setManualSim(true);
      api.teleport(blocker.x, blocker.z);
      api.advanceSim(1.5);
      const hero = window.__THREE_GAME_DIAGNOSTICS__!.heroPos;
      return { blocker, hero };
    });
    if (!result) return;
    const { blocker, hero } = result;
    if (Math.abs(hero.x - blocker.x) <= blocker.halfX + 0.42 && Math.abs(hero.z - blocker.z) <= blocker.halfZ + 0.42) {
      throw new Error(`hero trapped in ${blocker.id}`);
    }
  });
}

async function brightnessProbe(page: Page): Promise<Result> {
  return probe(async () => {
    const canvas = page.locator('#game-canvas');
    const materials = JSON.parse((await canvas.getAttribute('data-terrain3d-pilot-landmark-materials')) ?? '[]') as Array<{
      id: string; transparent: number; depthWriteDisabled: number;
    }>;
    if (!materials.length) throw new Error('no mounted landmark');
    if (materials.some(({ transparent, depthWriteDisabled }) => transparent || depthWriteDisabled)) throw new Error('unlit material flags');
    const mounts = JSON.parse((await canvas.getAttribute('data-terrain3d-pilot-landmark-mounts')) ?? '[]') as Array<{
      x: number; y: number; z: number;
    }>;
    const mount = mounts[0];
    if (!mount) throw new Error('no landmark mount');
    await page.evaluate(({ x, z }) => window.__GR_TEST__!.teleport(x, z - 5), mount);
    await page.waitForTimeout(100);
    const point = await page.evaluate(({ x, y, z }) => window.__GR_TEST__!.screenPoint(x, z, y + 1.5), mount);
    const box = await canvas.boundingBox();
    if (!box || !point.inView) throw new Error('landmark outside camera');
    const size = 17;
    const shot = await page.screenshot({ clip: {
      x: Math.min(box.x + box.width - size, Math.max(0, box.x + point.x - size / 2)),
      y: Math.min(box.y + box.height - size, Math.max(0, box.y + point.y - size / 2)),
      width: size,
      height: size,
    } });
    const png = PNG.sync.read(shot);
    const values: number[] = [];
    for (let y = 0; y < png.height; y += 1) {
      for (let x = 0; x < png.width; x += 1) {
        const offset = (y * png.width + x) * 4;
        values.push((png.data[offset]! * 0.2126 + png.data[offset + 1]! * 0.7152 + png.data[offset + 2]! * 0.0722) / 255);
      }
    }
    values.sort((a, b) => a - b);
    const median = values[Math.floor(values.length / 2)] ?? 0;
    if (median <= 0.06) throw new Error(`luminance=${median.toFixed(3)}`);
  });
}

function collectErrors(page: Page): Errors {
  const errors: Errors = { console: [], page: [] };
  page.on('console', (message) => { if (message.type() === 'error') errors.console.push(message.text()); });
  page.on('pageerror', (error) => errors.page.push(error.message));
  return errors;
}

async function probe(run: () => Promise<void>): Promise<Result> {
  try {
    await run();
    return 'PASS';
  } catch (error) {
    return `FAIL: ${error instanceof Error ? error.message.split('\n')[0] : String(error)}`;
  }
}

function failedCells(row: Row): string[] {
  return (['boot', 'render', 'mq1', 'mq2', 'mq3', 'brightness', 'budget'] as const)
    .filter((key) => row[key].startsWith('FAIL'));
}

function budgetResult(started: number): Result {
  const elapsed = Date.now() - started;
  return elapsed <= 10_000 ? 'PASS' : `FAIL: ${(elapsed / 1_000).toFixed(1)}s`;
}

function cell(result: Result): string {
  return result.replaceAll('|', '\\|');
}
