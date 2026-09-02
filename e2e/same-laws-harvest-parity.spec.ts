import { spawnSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import type { RunTape } from '../src/game/RunTape';

// THE SAME LAWS (owner playtest 16, 2026-09-02): "The laws for human and AI players have to be
// the same." A rider's HARVEST order walks the Prospector to the seam and then pan_at grants one
// pan tick (StandingOrders.ts:342-355 -> Game.panAgentAt). This spec proves the player's dispatch
// (click while selected on desktop, tap-hold on touch) rides the same path with the same
// gold-by-time curve, is recorded in the human tape as `prospector_dispatch`, and that such a tape
// replays to its own event-log hash through scripts/assay-replay.mjs (the county's iron).
const SHOTS = path.resolve('reviews/shots-same-laws-harvest-parity');
const ARTIFACTS = path.resolve('artifacts/same-laws-harvest-parity');
const QUERY = 'contract=the-claim&seed=same-laws-harvest-parity';
const META = { version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: 3 } };

type PanTick = { at: number; rel: number; amount: number; cumulative: number };

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  return errors;
}

async function installMeta(page: Page): Promise<void> {
  await page.addInitScript(({ key, meta }) => localStorage.setItem(key, JSON.stringify(meta)), { key: META_PROGRESS_KEY, meta: META });
}

async function dismissBriefing(page: Page): Promise<void> {
  const briefing = page.getByTestId('contract-briefing-dismiss');
  if (await briefing.isVisible().catch(() => false)) await briefing.click();
}

async function boot(page: Page): Promise<string[]> {
  const errors = collectErrors(page);
  await installMeta(page);
  await page.goto(`/?debug&${QUERY}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await dismissBriefing(page);
  await freshManualRun(page);
  return errors;
}

/**
 * Reset, freeze the clock, and step ONE tick. The one tick matters: `__THREE_GAME_DIAGNOSTICS__`
 * (seam remaining, timeAlive) is republished on presentation, and a manual `advanceSim` call
 * presents at its end, so without it the reads below would describe the run that just ended.
 * Both the player's and the rider's branch start from exactly this state.
 */
async function freshManualRun(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.__GR_TEST__!.resetRun();
    window.__GR_TEST__!.setManualSim(true);
  });
  await dismissBriefing(page);
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(1 / 30));
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

async function economyLogLength(page: Page): Promise<number> {
  return page.evaluate(() => window.__GR_TEST__!.economyLog().length);
}

async function panTicks(page: Page, seamId: string, sinceIndex: number, issuedAt: number): Promise<PanTick[]> {
  const raw = await page.evaluate(({ id, since }) => window.__GR_TEST__!.economyLog()
    .slice(since)
    .filter((event: any) => event.type === 'gold_panned' && event.nodeId === id)
    .map((event: any) => ({ at: Number(event.at), amount: Number(event.amount) })), { id: seamId, since: sinceIndex });
  let cumulative = 0;
  return raw.map(({ at, amount }) => {
    cumulative += amount;
    return { at, rel: Number((at - issuedAt).toFixed(3)), amount, cumulative };
  });
}

async function seamRemaining(page: Page, seamId: string): Promise<number> {
  return page.evaluate((id) => window.__THREE_GAME_DIAGNOSTICS__!.harvest.activeNodes.find((entry) => entry.id === id)!.remaining, seamId);
}

function curve(ticks: readonly PanTick[]): Array<[number, number]> {
  return ticks.map((tick) => [tick.rel, tick.amount]);
}

function parityTable(player: readonly PanTick[], rider: readonly PanTick[]): string {
  const rows = ['| tick | player dispatch (s after command) | rider HARVEST (s after order) | gold | cumulative |', '|---|---|---|---|---|'];
  for (let index = 0; index < Math.max(player.length, rider.length); index += 1) {
    const p = player[index];
    const r = rider[index];
    rows.push(`| ${index + 1} | ${p ? p.rel.toFixed(3) : '-'} | ${r ? r.rel.toFixed(3) : '-'} | ${p?.amount ?? r?.amount ?? '-'} | ${p?.cumulative ?? '-'} / ${r?.cumulative ?? '-'} |`);
  }
  return rows.join('\n');
}

test('mouse and touch dispatch travel, then grant one rider-rate tick per command', async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  const errors = await boot(page);
  const { seam, point } = await seamScreenPoint(page);
  await page.waitForTimeout(100);
  const canvas = page.locator('#game-canvas');
  const before = seam.remaining;
  const playerLogStart = await economyLogLength(page);
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
    await expect(page.getByTestId('prospector-dispatch-confirm')).toBeHidden();
  };
  if (mobile) {
    await dispatchByTouch();
    await dispatchByTouch();
  } else {
    // Selecting = opening the charter once (chip or G); the selection outlives the panel.
    await page.getByTestId('hud-agent').click();
    await expect(page.getByTestId('hud-agent')).toHaveAttribute('data-selected', 'true');
    await page.getByRole('button', { name: 'Close Prospector ledger' }).click();
    await canvas.click({ position: { x: point.x, y: point.y } });
    await canvas.click({ position: { x: point.x, y: point.y } });
    await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.5));
    await mkdir(SHOTS, { recursive: true });
    await page.screenshot({ path: path.join(SHOTS, `${testInfo.project.name}.png`) });
  }
  await page.evaluate((seconds) => window.__GR_TEST__!.advanceSim(seconds), mobile ? 20 : 19.5);
  const player = await panTicks(page, seam.id, playerLogStart, issuedAt);
  const afterPlayer = await seamRemaining(page, seam.id);
  expect(afterPlayer).toBe(before - 10);
  expect(player).toHaveLength(2);
  await page.evaluate(() => window.__GR_TEST__!.endRunForTest());
  const tape = await page.evaluate(() => window.__GR_TEST__!.runTape.list()[0]!);
  const dispatches = tape.inputLog.entries.flatMap((entry) => entry.a)
    .filter((action) => 'type' in action && action.type === 'prospector_dispatch');
  expect(dispatches).toHaveLength(2);

  // The rider's side of the same law: two HARVEST orders on the same seam from the same fresh run.
  await freshManualRun(page);
  const riderLogStart = await economyLogLength(page);
  const riderIssuedAt = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.timeAlive);
  const riderBefore = await seamRemaining(page, seam.id);
  const accepted = await page.evaluate((id) => window.__GR_AGENT__!.submitOrders([
    { verb: 'HARVEST', seam: id },
    { verb: 'HARVEST', seam: id },
  ]).outcome.ok, seam.id);
  expect(accepted).toBe(true);
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(20));
  const rider = await panTicks(page, seam.id, riderLogStart, riderIssuedAt);
  const afterRider = await seamRemaining(page, seam.id);
  expect(rider).toHaveLength(2);
  expect(afterRider).toBe(riderBefore - 10);
  expect(curve(player)).toEqual(curve(rider));
  const table = parityTable(player, rider);
  console.log(`same-laws parity [${testInfo.project.name}] seam=${seam.id}\n${table}`);

  const slip = await assay(testInfo.outputPath('same-laws-tape.json'), tape, 5260 + testInfo.workerIndex);
  expect(slip.eventLogHash).toBe(tape.eventLogHash);
  expect(slip.ticks).toBe(tape.inputLog.durationTicks);
  console.log('SAME_LAWS_ASSAY_SLIP', JSON.stringify(slip));

  await mkdir(ARTIFACTS, { recursive: true });
  await writeFile(path.join(ARTIFACTS, `parity-${testInfo.project.name}.json`), JSON.stringify({
    project: testInfo.project.name,
    query: QUERY,
    seam: { id: seam.id, position: seam.position, before, afterPlayer, riderBefore, afterRider },
    player: { issuedAt, input: mobile ? 'touch tap-hold + confirm' : 'click while selected', ticks: player },
    rider: { issuedAt: riderIssuedAt, input: 'HARVEST x2 via __GR_AGENT__.submitOrders', ticks: rider },
    table,
    tape: {
      inputKind: 'prospector_dispatch',
      dispatches,
      eventLogHash: tape.eventLogHash,
      durationTicks: tape.inputLog.durationTicks,
    },
    assay: slip,
  }, null, 2));
  expect(errors).toEqual([]);
});

test('plain boot: the command is reachable without ?debug and the boot is clean', async ({ page }) => {
  test.setTimeout(90_000);
  const errors = collectErrors(page);
  await installMeta(page);
  await page.goto(`/?${QUERY}`);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 24, undefined, { timeout: 60_000 });
  await dismissBriefing(page);
  const chip = page.getByTestId('hud-agent');
  await expect(chip).toBeVisible();
  await expect(chip).not.toHaveAttribute('data-selected', 'true');
  // Where the PLAYER sees it: the Prospector chip is the selection gate; opening the charter selects.
  await chip.click();
  await expect(chip).toHaveAttribute('data-selected', 'true');
  await page.getByRole('button', { name: 'Close Prospector ledger' }).click();
  await expect(chip).toHaveAttribute('data-selected', 'true');
  // The touch prompt is mounted on every boot and stays hidden until a hold on a seam.
  await expect(page.getByTestId('prospector-dispatch-confirm')).toBeAttached();
  await expect(page.getByTestId('prospector-dispatch-confirm')).toBeHidden();
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
