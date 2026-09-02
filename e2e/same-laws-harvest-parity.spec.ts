import { spawnSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import type { RunTape } from '../src/game/RunTape';

const SHOTS = path.resolve('reviews/shots-same-laws-harvest-parity');

async function boot(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(({ key }) => localStorage.setItem(
    key,
    JSON.stringify({ version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: 3 } }),
  ), { key: META_PROGRESS_KEY });
  await page.goto('/?debug&contract=the-claim&seed=same-laws-harvest-parity');
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const briefing = page.getByTestId('contract-briefing-dismiss');
  if (await briefing.isVisible().catch(() => false)) await briefing.click();
  await page.evaluate(() => {
    window.__GR_TEST__!.resetRun();
    window.__GR_TEST__!.setManualSim(true);
  });
  if (await briefing.isVisible().catch(() => false)) await briefing.click();
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(1 / 30));
  return errors;
}

async function seamScreenPoint(page: Page) {
  const target = await page.evaluate(() => {
    const candidates = window.__THREE_GAME_DIAGNOSTICS__!.harvest.activeNodes
      .filter((entry) => entry.active)
      .map((seam) => ({ seam, point: window.__GR_TEST__!.screenPoint(seam.position.x, seam.position.z, 0.05) }));
    return candidates
      .filter(({ point }) => point.x >= 24 && point.x <= innerWidth - 24 && point.y >= 24 && point.y <= innerHeight - 24)
      .sort((left, right) => Math.hypot(left.point.x - innerWidth / 2, left.point.y - innerHeight / 2)
        - Math.hypot(right.point.x - innerWidth / 2, right.point.y - innerHeight / 2))[0] ?? candidates[0]!;
  });
  await page.waitForTimeout(100);
  return target;
}

test('mouse and touch dispatch travel, then grant one rider-rate tick per command', async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  const errors = await boot(page);
  const { seam, point } = await seamScreenPoint(page);
  await page.waitForTimeout(100);
  const canvas = page.locator('#game-canvas');
  const before = seam.remaining;
  const issuedAt = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.timeAlive);

  const mobile = testInfo.project.name.includes('mobile');
  let promptShot = false;
  const dispatchByTouch = async () => {
    await canvas.dispatchEvent('pointerdown', { pointerType: 'touch', pointerId: 7, clientX: point.x, clientY: point.y });
    await page.waitForTimeout(550);
    await canvas.dispatchEvent('pointerup', { pointerType: 'touch', pointerId: 7, clientX: point.x, clientY: point.y });
    await expect(page.getByTestId('prospector-dispatch-confirm')).toBeVisible();
    if (!promptShot) {
      await mkdir(SHOTS, { recursive: true });
      await page.screenshot({ path: path.join(SHOTS, `${testInfo.project.name}.png`) });
      promptShot = true;
    }
    await page.getByTestId('prospector-dispatch-confirm').click();
  };
  if (mobile) {
    await dispatchByTouch();
    await dispatchByTouch();
  } else {
    await page.getByTestId('hud-agent').click();
    await page.getByRole('button', { name: 'Close Prospector ledger' }).click();
    await canvas.click({ position: { x: point.x, y: point.y } });
    await canvas.click({ position: { x: point.x, y: point.y } });
    await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.5));
    await mkdir(SHOTS, { recursive: true });
    await page.screenshot({ path: path.join(SHOTS, `${testInfo.project.name}.png`) });
  }
  await page.evaluate((seconds) => window.__GR_TEST__!.advanceSim(seconds), mobile ? 20 : 19.5);
  const player = await page.evaluate((id) => ({
    remaining: window.__THREE_GAME_DIAGNOSTICS__!.harvest.activeNodes.find((entry) => entry.id === id)!.remaining,
    ticks: window.__GR_TEST__!.economyLog()
      .filter((event: any) => event.type === 'gold_panned' && event.nodeId === id)
      .map((event: any) => ({ at: Number(event.at) })),
  }), seam.id);
  expect(player.remaining).toBe(before - 10);
  expect(player.ticks).toHaveLength(2);
  await page.evaluate(() => window.__GR_TEST__!.endRunForTest());
  const tape = await page.evaluate(() => window.__GR_TEST__!.runTape.list()[0]!);
  expect(tape.inputLog.entries.flatMap((entry) => entry.a)
    .filter((action) => 'type' in action && action.type === 'prospector_dispatch')).toHaveLength(2);

  await page.evaluate(() => {
    window.__GR_TEST__!.resetRun();
    window.__GR_TEST__!.setManualSim(true);
  });
  const riderIssuedAt = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.timeAlive);
  const accepted = await page.evaluate((id) => window.__GR_AGENT__!.submitOrders([
    { verb: 'HARVEST', seam: id },
    { verb: 'HARVEST', seam: id },
  ]).outcome.ok, seam.id);
  expect(accepted).toBe(true);
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(20));
  const rider = await page.evaluate((id) => window.__GR_TEST__!.economyLog()
    .filter((event: any) => event.type === 'gold_panned' && event.nodeId === id)
    .map((event: any) => ({ at: Number(event.at) }))
    .slice(-2), seam.id);
  expect(rider).toHaveLength(2);
  const playerCurve = player.ticks.map(({ at }) => Number((at - issuedAt).toFixed(3)));
  const riderCurve = rider.map(({ at }) => Number((at - riderIssuedAt).toFixed(3)));
  expect(playerCurve).toEqual(riderCurve);
  console.log('same-laws parity', { player: playerCurve, rider: riderCurve });
  const slip = await assay(testInfo.outputPath('same-laws-tape.json'), tape, 5260 + testInfo.workerIndex);
  expect(slip.eventLogHash).toBe(tape.eventLogHash);
  expect(slip.ticks).toBe(tape.inputLog.durationTicks);
  console.log('SAME_LAWS_ASSAY_SLIP', JSON.stringify(slip));
  expect(errors).toEqual([]);
});

async function assay(file: string, tape: RunTape, port: number): Promise<{ eventLogHash: string; ticks: number; wallMs: number }> {
  await writeFile(file, JSON.stringify(tape));
  const run = spawnSync(process.execPath, ['scripts/assay-replay.mjs', file], {
    cwd: process.cwd(),
    encoding: 'utf8',
    timeout: 120_000,
    env: { ...process.env, GR_ASSAY_REPLAY_PORT: String(port) },
  });
  expect(run.status, run.stderr).toBe(0);
  return JSON.parse(run.stdout.trim()) as { eventLogHash: string; ticks: number; wallMs: number };
}
