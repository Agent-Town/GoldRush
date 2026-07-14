import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

const QUERY = '?debug&damsurge&nowaves&nospawn&nolevel&nopause&nosteal&nowreck&seed=e3-07';
const ARTIFACT_DIR = path.resolve('artifacts/e3-07');

type Errors = { console: string[]; page: string[] };

async function open(page: Page): Promise<Errors> {
  const errors: Errors = { console: [], page: [] };
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('WebSocket connection')) errors.console.push(message.text());
  });
  page.on('pageerror', (error) => errors.page.push(error.message));
  await page.goto(`/${QUERY}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.evaluate(() => {
    window.__GR_TEST__?.setManualSim(true);
    window.__GR_TEST__?.resetRun();
  });
  const begin = page.getByRole('button', { name: 'Begin' });
  if (await begin.isVisible().catch(() => false)) await begin.click();
  return errors;
}

async function advance(page: Page, seconds: number): Promise<void> {
  await page.evaluate((duration) => window.__GR_TEST__?.advanceSim(duration), seconds);
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`) });
}

test('telegraphs, sweeps the river channel, damages and pushes once, and can be dodged', async ({ page }, testInfo) => {
  const errors = await open(page);
  await page.evaluate(() => window.__GR_TEST__?.teleport(0, 0));
  const hp = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.hp ?? 0);

  expect(await page.evaluate(() => window.__GR_TEST__?.damSurge()?.phase)).toBe('telegraph');
  await shot(page, testInfo, 'telegraph');
  await advance(page, 1.9);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.hp)).toBe(hp);

  await advance(page, 0.2);
  expect(await page.evaluate(() => window.__GR_TEST__?.damSurge()?.phase)).toBe('sweep');
  await advance(page, 0.9);
  await shot(page, testInfo, 'sweep');
  await advance(page, 0.3);

  const hit = await page.evaluate(() => ({
    surge: window.__GR_TEST__?.damSurge(),
    hp: window.__THREE_GAME_DIAGNOSTICS__?.hp,
    x: window.__THREE_GAME_DIAGNOSTICS__?.heroPos.x,
  }));
  expect(hit.surge?.hits).toBe(1);
  expect(hit.hp).toBe(hp - 12);
  expect(hit.x).toBeGreaterThan(4);

  await page.evaluate(() => {
    window.__GR_TEST__?.resetRun();
    window.__GR_TEST__?.teleport(0, 8);
  });
  await advance(page, 4.5);
  const dodged = await page.evaluate(() => ({
    hp: window.__THREE_GAME_DIAGNOSTICS__?.hp,
    surge: window.__GR_TEST__?.damSurge(),
  }));
  expect(dodged.hp).toBe(hp);
  expect(dodged.surge?.hits).toBe(0);
  expect(dodged.surge?.log.map(({ type, at }) => ({ type, at }))).toEqual([
    { type: 'telegraph', at: 0 },
    { type: 'sweep', at: 2 },
    { type: 'clear', at: 4.4 },
  ]);
  expect(errors).toEqual({ console: [], page: [] });

  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(
    path.join(ARTIFACT_DIR, `${testInfo.project.name}-timing-damage.json`),
    `${JSON.stringify({ telegraphSeconds: 2, sweepSeconds: 2.4, damage: 12, push: 5, dodgeHp: dodged.hp }, null, 2)}\n`,
  );
});

test('event log is deterministic across render schedules', async ({ page }) => {
  const errors = await open(page);

  const run = async (fps: number) => page.evaluate((renderFps) => {
    window.__GR_TEST__?.resetRun();
    window.__GR_TEST__?.teleport(0, 0);
    window.__GR_TEST__?.driveRenderSchedule(4.5, renderFps);
    return window.__GR_TEST__?.damSurge()?.log;
  }, fps);

  const at30 = await run(30);
  const at60 = await run(60);
  expect(at30).toEqual(at60);
  expect(at30?.map((entry) => entry.type)).toEqual(['telegraph', 'sweep', 'hit', 'clear']);
  expect(errors).toEqual({ console: [], page: [] });
});
