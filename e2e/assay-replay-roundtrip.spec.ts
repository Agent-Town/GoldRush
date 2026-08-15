import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { expect, test, type Page } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { profileDataKey } from '../src/game/ProfileStorage';
import type { RunTape } from '../src/game/RunTape';

type AssayResult = {
  eventLogHash: string;
  outcome: { secured: boolean; waves: number; gold: number; timeAlive: number };
  ticks: number;
  wallMs: number;
};

test('fresh browser tapes reproduce with and without a death-screen restart', async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  const scratch = await mkdtemp(path.join(tmpdir(), 'gold-rush-assay-roundtrip-'));

  try {
    await open(page, 'assay-roundtrip-live');
    await moveAndEnd(page);
    const noRestart = await latestTape(page);

    await page.keyboard.down('KeyR');
    await page.evaluate(() => window.__GR_TEST__!.advanceSim(1 / 30));
    await page.keyboard.up('KeyR');
    await page.evaluate(() => window.__GR_TEST__!.setManualSim(true));
    await moveAndEnd(page);
    const afterRestart = await latestTape(page);

    await open(page, 'assay-roundtrip-curated');
    expect(await page.evaluate(() => window.__GR_TEST__!.playbook.startRecording({ script: [
      { t: 0, mx: 1, my: 0, a: [] },
      { t: 60, mx: 0, my: 1, a: [] },
      { t: 120, mx: 0, my: 0, a: [] },
    ] }))).toMatchObject({ ok: true });
    await page.evaluate(() => window.__GR_TEST__!.advanceSim(6));
    await page.evaluate(() => window.__GR_TEST__!.endRunForTest());
    const curated = await latestTape(page);

    await page.evaluate((key) => localStorage.setItem(key, JSON.stringify({
      version: 1,
      tracks: { territory: 1, science: 0, hero: 0, agent: 0 },
    })), profileDataKey('robin', META_PROGRESS_KEY));
    await open(page, 'assay-roundtrip-profile-state');
    const hero = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.heroPos);
    expect(await page.evaluate(({ x, z }) => window.__GR_TEST__!.playbook.startRecording({ script: [
      { t: 0, mx: 0, my: 0, a: [{ type: 'place_build', id: 'palisade', position: { x, z }, rotationSteps: 0 }] },
    ] }), { x: round(hero.x + 3), z: round(hero.z) })).toMatchObject({ ok: true });
    await page.evaluate(() => window.__GR_TEST__!.advanceSim(3));
    await page.evaluate(() => window.__GR_TEST__!.endRunForTest());
    const profileState = await latestTape(page);

    expect(afterRestart.id).not.toBe(noRestart.id);
    expect(afterRestart.inputLog.durationTicks).toBeLessThanOrEqual(181);
    expect(profileState).toMatchObject({
      version: 2,
      runStart: { meta: { version: 1, tracks: { territory: 1, science: 0, hero: 0, agent: 0 } } },
    });

    const results = {
      noRestart: await assay(scratch, 'no-restart', noRestart, testInfo.workerIndex),
      afterRestart: await assay(scratch, 'after-restart', afterRestart, testInfo.workerIndex),
      curated: await assay(scratch, 'curated', curated, testInfo.workerIndex),
      profileState: await assay(scratch, 'profile-state-1', profileState, testInfo.workerIndex),
    };
    for (const [name, { tape, replay }] of Object.entries(results)) {
      expect(replay.eventLogHash, name).toBe(tape.eventLogHash);
      expect(replay.outcome, name).toEqual({
        secured: tape.outcome.secured,
        waves: tape.outcome.waves,
        gold: tape.outcome.gold,
        timeAlive: round(tape.outcome.timeAlive),
      });
      expect(replay.ticks, name).toBe(tape.inputLog.durationTicks);
    }
    const profileStateRepeat = await assay(scratch, 'profile-state-2', profileState, testInfo.workerIndex);
    expect(profileStateRepeat.replay).toMatchObject({
      eventLogHash: results.profileState.replay.eventLogHash,
      outcome: results.profileState.replay.outcome,
      ticks: results.profileState.replay.ticks,
    });
    console.log(`ASSAY_MATRIX ${JSON.stringify({ ...results, profileStateRepeat })}`);
    expect(errors).toEqual([]);
  } finally {
    await rm(scratch, { recursive: true, force: true });
  }
});

async function open(page: Page, seed: string): Promise<void> {
  await page.goto(`/?debug&seed=${seed}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.evaluate(() => window.__GR_TEST__!.setManualSim(true));
}

async function moveAndEnd(page: Page): Promise<void> {
  await page.keyboard.down('KeyD');
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(2));
  await page.keyboard.up('KeyD');
  await page.keyboard.down('KeyW');
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(2));
  await page.keyboard.up('KeyW');
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(2));
  await page.evaluate(() => window.__GR_TEST__!.endRunForTest());
}

async function latestTape(page: Page): Promise<RunTape> {
  return page.evaluate(() => window.__GR_TEST__!.runTape.list()[0]!);
}

async function assay(scratch: string, name: string, tape: RunTape, workerIndex: number): Promise<{ tape: RunTape; replay: AssayResult }> {
  const file = path.join(scratch, `${name}.json`);
  await writeFile(file, JSON.stringify(tape));
  const run = spawnSync(process.execPath, ['scripts/assay-replay.mjs', file], {
    cwd: process.cwd(),
    encoding: 'utf8',
    timeout: 120_000,
    env: { ...process.env, GR_ASSAY_REPLAY_PORT: String(5234 + workerIndex) },
  });
  expect(run.status, run.stderr).toBe(0);
  return { tape, replay: JSON.parse(run.stdout.trim()) as AssayResult };
}

function round(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}
