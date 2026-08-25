import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const FIXTURE_PATH = path.resolve('artifacts/gauntlet-heat-20260824/e1-dry-gulch/tape.json');
const SHOT_DIR = path.resolve('reviews/shots-lantern-honesty');

test('the verified Dry Gulch agent reel is labeled as an approximation and ends honestly', async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  const tape = JSON.parse(await readFile(FIXTURE_PATH, 'utf8'));
  expect(tape.inputLog.entries.some((entry: { a: Array<{ kind?: string }> }) =>
    entry.a.some((action) => action.kind === 'agent_orders'))).toBe(true);

  await page.addInitScript((reel) => sessionStorage.setItem('gr.assay-replay.v1', JSON.stringify(reel)), tape);

  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  const query = new URLSearchParams({
    debug: '',
    assayReplay: '',
    replay: tape.id,
    contract: tape.contract,
    seed: tape.seed,
    difficulty: tape.difficulty,
  });
  await page.goto(`/?${query}`);
  await page.waitForFunction(() => Boolean(window.__GR_TEST__));
  const show = page.getByTestId('lantern-show');
  await expect(show).toHaveAttribute('data-recorded-secured', 'true');
  await expect(show).toHaveAttribute('data-recorded-wave', '20');
  await expect(show).toHaveAttribute('data-recorded-hash', tape.eventLogHash);
  await expect(page.getByTestId('lantern-agent-honesty')).toContainText(
    `This is a browser APPROXIMATION of a machine ride. VERIFIED outcome: SECURED · wave 20 · ${tape.eventLogHash} — replayed exactly on the county's engine.`,
  );
  const bannerShot = await page.screenshot({ fullPage: true });

  await page.evaluate(({ durationTicks, stepSeconds }) => {
    window.__GR_TEST__!.setManualSim(true);
    window.__GR_TEST__!.advanceSim((durationTicks + 1) * stepSeconds);
  }, tape.inputLog);
  await expect(show).toHaveAttribute('data-playback', 'complete');
  const outcome = page.getByTestId('lantern-intertitle');
  await expect(outcome).toContainText('RECORDED OUTCOME');
  await expect(outcome).toContainText('SECURED');
  await expect(outcome).toContainText(`Wave 20 · ${tape.eventLogHash}`);
  await expect(outcome).toContainText(/The approximation diverged from the verified ride at wave \d+ — exact replay runs on the county's engine\./);
  const outcomeShot = await page.screenshot({ fullPage: true });

  await page.evaluate(() => window.__GR_TEST__!.setManualSim(false));
  const stopped = await page.evaluate(() => ({
    tick: window.__THREE_GAME_DIAGNOSTICS__!.simulation.tick,
    timeAlive: window.__THREE_GAME_DIAGNOSTICS__!.timeAlive,
  }));
  await page.waitForTimeout(2_000);
  expect(await page.evaluate(() => ({
    tick: window.__THREE_GAME_DIAGNOSTICS__!.simulation.tick,
    timeAlive: window.__THREE_GAME_DIAGNOSTICS__!.timeAlive,
  }))).toEqual(stopped);
  expect(errors).toEqual([]);
  await mkdir(SHOT_DIR, { recursive: true });
  await Promise.all([
    writeFile(path.join(SHOT_DIR, `${testInfo.project.name}-banner.png`), bannerShot),
    writeFile(path.join(SHOT_DIR, `${testInfo.project.name}-outcome.png`), outcomeShot),
  ]);
});
