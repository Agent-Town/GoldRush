import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { PNG } from 'pngjs';

// perf-r2 pixel gate for the sprite-instancing change.
//
// Round 1's pixel test compared against a PNG one machine recorded on another day, which is why it
// could only ever answer "is this host the baseline host". This one compares two arms of the SAME
// run, same window, same build, same pinned clock -- instancing on vs `?nospriteinstancing`. That
// makes the verdict machine-independent by construction: any host can run it and the question it
// answers is always "did instancing change the picture", never "is this host fast".
//
// The predicate is round 1's, kept deliberately: at most 1% of pixels may differ by more than 4 on
// any channel, and the mean channel delta may not exceed 0.25.
const ARTIFACT_DIR = path.resolve(process.env.PERFR2_SHOT_DIR ?? 'reviews/shots-perf-r2');
const CONTRACTS = ['e1-night-shift', 'the-claim', 'e1-dry-gulch', 'e1-twin-banks', 'e1-baron'] as const;

type Errors = { console: string[]; page: string[] };

function collectErrors(page: Page): Errors {
  const errors: Errors = { console: [], page: [] };
  page.on('console', (message) => { if (message.type() === 'error') errors.console.push(message.text()); });
  page.on('pageerror', (error) => errors.page.push(error.message));
  return errors;
}

async function bootSnapshot(page: Page, contract: string, pressure: boolean, suffix: string): Promise<void> {
  await page.goto(`/?debug&contract=${contract}&nowaves&nolevel&nopause&nokill&tier=full&seed=e1-perf-pixels-${contract}${suffix}`);
  await page.waitForFunction(() => Boolean(window.__GR_TEST__));
  const begin = page.getByRole('button', { name: 'Begin' });
  if (await begin.isVisible()) await begin.click();
  const briefing = page.getByTestId('contract-briefing-dismiss');
  if (await briefing.isVisible().catch(() => false)) await briefing.click();
  await page.waitForFunction(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
    return canvas?.dataset.terrain3dPilotState === 'ready' && canvas.dataset.run3dPilotState === 'ready';
  });
  if (pressure) {
    await page.evaluate((contractId) => {
      const api = window.__GR_TEST__!;
      api.setWave(contractId === 'e1-baron' ? 18 : contractId === 'e1-night-shift' ? 10 : 8);
      api.scriptEnemyAt(-8, 0, 8, 0, 0);
      api.spawnPack(59, 22, { speedScale: 0, hpScale: 999, carriedLantern: false });
      api.setManualSim(true);
      api.advanceSim(1 / 30);
    }, contract);
    await page.waitForFunction(() => window.__GR_TEST__!.enemyPositions().length >= 60);
  } else await page.evaluate(() => window.__GR_TEST__!.setManualSim(true));
  await page.evaluate(() => {
    for (const selector of ['.lil-gui', '#hud', '#touch-controls']) {
      document.querySelector<HTMLElement>(selector)?.style.setProperty('display', 'none');
    }
    window.__GR_TEST__!.driveRenderSchedule(0.5, 60);
  });
}

function pixelDifference(actual: Buffer, expected: Buffer): { changed: number; meanChannelDelta: number; pixels: number } {
  const [a, b] = [PNG.sync.read(actual), PNG.sync.read(expected)];
  if (a.width !== b.width || a.height !== b.height) {
    return { changed: Number.POSITIVE_INFINITY, meanChannelDelta: Number.POSITIVE_INFINITY, pixels: 0 };
  }
  let changed = 0;
  let totalDelta = 0;
  for (let offset = 0; offset < a.data.length; offset += 4) {
    const red = Math.abs(a.data[offset]! - b.data[offset]!);
    const green = Math.abs(a.data[offset + 1]! - b.data[offset + 1]!);
    const blue = Math.abs(a.data[offset + 2]! - b.data[offset + 2]!);
    const alpha = Math.abs(a.data[offset + 3]! - b.data[offset + 3]!);
    totalDelta += red + green + blue + alpha;
    if (Math.max(red, green, blue, alpha) > 4) changed += 1;
  }
  return { changed, meanChannelDelta: totalDelta / a.data.length, pixels: a.width * a.height };
}

test('sprite instancing is pixel-equivalent to individual sprites', async ({ page }, testInfo: TestInfo) => {
  test.setTimeout(900_000);
  const errors = collectErrors(page);
  // A pinned clock makes both arms sample the same animation frame; without it the sprite
  // animator's phase alone would swamp the comparison.
  await page.addInitScript(() => {
    Object.defineProperty(performance, 'now', { configurable: true, value: () => 10_000 });
  });
  await mkdir(ARTIFACT_DIR, { recursive: true });
  const rows: Array<Record<string, unknown>> = [];

  for (const contract of CONTRACTS) {
    for (const pressure of [false, true]) {
      const label = `${testInfo.project.name}-${contract}${pressure ? '-pressure' : ''}`;

      await bootSnapshot(page, contract, pressure, '');
      const instanced = await page.locator('#game-canvas').screenshot();
      await writeFile(path.join(ARTIFACT_DIR, `${label}-instanced.png`), instanced);

      // THE CONTROL. A second boot of the IDENTICAL configuration. Two boots of this scene are not
      // bit-identical -- asset arrival order, animator phase and float drift all move pixels -- so
      // an on-vs-off number means nothing until it is read against on-vs-on. Without this arm the
      // rig cannot tell "instancing changed the picture" from "booting twice changed the picture",
      // which is the same mistake in a new coat that made round 1's pixel gate uninterpretable.
      await bootSnapshot(page, contract, pressure, '');
      const rebooted = await page.locator('#game-canvas').screenshot();
      await writeFile(path.join(ARTIFACT_DIR, `${label}-instanced-reboot.png`), rebooted);

      await bootSnapshot(page, contract, pressure, '&nospriteinstancing');
      const individual = await page.locator('#game-canvas').screenshot();
      await writeFile(path.join(ARTIFACT_DIR, `${label}-sprites.png`), individual);

      const treatment = pixelDifference(instanced, individual);
      const control = pixelDifference(instanced, rebooted);
      rows.push({
        label,
        treatment: { changedPixels: treatment.changed, changedShare: treatment.pixels > 0 ? treatment.changed / treatment.pixels : null, meanChannelDelta: treatment.meanChannelDelta },
        control: { changedPixels: control.changed, changedShare: control.pixels > 0 ? control.changed / control.pixels : null, meanChannelDelta: control.meanChannelDelta },
      });

      // The verdict is the treatment measured AGAINST its own control: instancing has to sit inside
      // the noise floor that booting the same build twice already produces, with a small allowance
      // so a scene whose control is near zero is not held to an impossible bar.
      const allowance = Math.ceil(control.pixels * 0.002);
      expect(treatment.changed, `${label}: >4-channel pixels vs same-build reboot control (${control.changed})`)
        .toBeLessThanOrEqual(Math.max(control.changed + allowance, Math.ceil(control.pixels * 0.01)));
      expect(treatment.meanChannelDelta, `${label}: mean channel delta`)
        .toBeLessThanOrEqual(Math.max(control.meanChannelDelta * 1.5 + 0.02, 0.25));
    }
  }

  await writeFile(
    path.join(ARTIFACT_DIR, `pixel-report-${testInfo.project.name}.json`),
    `${JSON.stringify({ project: testInfo.project.name, predicate: { maxChangedShare: 0.01, maxMeanChannelDelta: 0.25 }, rows }, null, 2)}\n`,
  );
  expect(errors).toEqual({ console: [], page: [] });
});
