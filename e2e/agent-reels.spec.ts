import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import engineEra from '../assets/engine-era.json' with { type: 'json' };
import { GAME_API_ORIGIN } from '../src/app/GameApi';
import { PROFILE_KEY, type ProfileState } from '../src/game/ProfileStorage';

const FIXTURE_PATH = path.resolve('artifacts/eh3-fixture/tape.json');
const HEAT_7_CROWN_PATH = path.resolve('artifacts/gauntlet-heat7-20260830/baron/run-1-tape.json');
const HUD_FIXTURE_PATH = path.resolve('artifacts/gauntlet-heat6-guests-r2-20260825/openclaw/hill-mine/attempt-3.tape.json');
const SHOT_DIR = path.resolve('reviews/shots-true-reel');
const ERA_SHOT_DIR = path.resolve('reviews/shots-reel-era');
const ERA_FIVE_SHOT_DIR = path.resolve('reviews/shots-era-five');

test('an era-current agent reel renders the true sim and verifies its hash in this browser', async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  const tape = await currentEraTape();
  expect(tape.inputLog.entries.some((entry: { a: Array<{ kind?: string }> }) =>
    entry.a.some((action) => action.kind === 'agent_orders'))).toBe(true);
  await page.addInitScript((reel) => sessionStorage.setItem('gr.assay-replay.v1', JSON.stringify(reel)), tape);
  const errors = collectErrors(page);
  await page.goto(replayUrl(tape));
  await page.waitForFunction(() => Boolean(window.__GR_TEST__));

  const show = page.getByTestId('lantern-show');
  await expect(show).toHaveAttribute('data-era-refused', 'false');
  await expect(page.getByTestId('lantern-agent-honesty')).toHaveText(
    'This is the ride. The county is replaying it here in your browser.',
  );
  await expect.poll(async () => (await probe(page))?.tick ?? -1).toBeGreaterThanOrEqual(0);
  await assertRenderedProbe(page);
  await mkdir(SHOT_DIR, { recursive: true });

  await page.getByTestId('lantern-pause').click();
  await expect(show).toHaveAttribute('data-playback', 'paused');
  const pausedTick = (await probe(page))!.tick;
  await page.waitForTimeout(200);
  expect((await probe(page))!.tick).toBe(pausedTick);
  await page.getByTestId('lantern-pause').click();
  await page.getByTestId('lantern-speed-2').click();
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(1));
  await expect.poll(async () => (await probe(page))?.tick ?? 0).toBeGreaterThan(pausedTick);
  await assertRenderedProbe(page);

  const beforeRestart = (await probe(page))!.tick;
  await page.getByTestId('lantern-restart').click();
  await expect(show).toHaveAttribute('data-speed', '1');
  await expect.poll(async () => (await probe(page))?.tick ?? Number.MAX_SAFE_INTEGER).toBeLessThan(beforeRestart);
  await page.getByTestId('lantern-wave-skip').click();
  await expect(show).toHaveAttribute('data-playback', 'skipping');
  await expect.poll(async () => (await probe(page))?.wave ?? 0, { timeout: 15_000 }).toBeGreaterThanOrEqual(1);
  await expect.poll(async () => (await probe(page))?.works.length ?? 0).toBeGreaterThan(0);
  await assertRenderedProbe(page);
  await writeFile(path.join(SHOT_DIR, `${testInfo.project.name}-true-world.png`), await page.screenshot({ fullPage: true }));

  await page.getByTestId('lantern-speed-4').click();
  await page.evaluate((seconds) => window.__GR_TEST__!.advanceSim(seconds), tape.outcome.timeAlive + 1);
  await expect(show).toHaveAttribute('data-playback', 'complete', { timeout: 15_000 });
  const outcome = page.getByTestId('lantern-intertitle');
  await expect(outcome).toContainText('RECORDED OUTCOME');
  await expect(outcome).toContainText(`This ride was replayed and matched in this very browser: ${tape.eventLogHash}.`);
  await expect(page.getByTestId('lantern-playback-status')).toHaveAttribute('data-hash', tape.eventLogHash);
  expect(errors).toEqual([]);

  await writeFile(path.join(SHOT_DIR, `${testInfo.project.name}-outcome.png`), await page.screenshot({ fullPage: true }));
});

test('an era refusal dismisses by button, Escape, and click-outside without leaving the game stuck', async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  const tape = await currentEraTape();
  tape.meta = { ...tape.meta, engineHash: '0'.repeat(64), era: tape.meta.era - 1 };
  await page.addInitScript((reel) => sessionStorage.setItem('gr.assay-replay.v1', JSON.stringify(reel)), tape);
  const errors = collectErrors(page);
  for (const dismissal of ['button', 'Escape', 'outside'] as const) {
    await page.goto(replayUrl(tape));
    const show = page.getByTestId('lantern-show');
    await expect(show).toHaveAttribute('data-era-refused', 'true');
    await expect(show).toHaveAttribute('data-playback', 'complete');
    await expect(page.getByTestId('lantern-intertitle')).toContainText(
      `This reel rode era ${tape.meta.era} (${'0'.repeat(64)}). This engine is era ${engineEra.era}`,
    );
    await expect(page.getByTestId('lantern-intertitle')).toContainText('The county will not counterfeit one era with another.');
    await expect(page.getByTestId('lantern-refusal-close')).toHaveText('Back to shelf');
    expect(await probe(page)).toBeNull();
    if (dismissal === 'button') {
      await mkdir(ERA_FIVE_SHOT_DIR, { recursive: true });
      await writeFile(path.join(ERA_FIVE_SHOT_DIR, `${testInfo.project.name}-refusal.png`), await page.screenshot({ fullPage: true }));
      await page.getByTestId('lantern-refusal-close').click();
    } else if (dismissal === 'Escape') {
      await page.keyboard.press('Escape');
    } else {
      await page.getByTestId('lantern-true-stage').click({ position: { x: 8, y: 8 } });
    }
    await expect(show).toHaveCount(0);
    const [before, after] = await page.evaluate(() => {
      const before = window.__THREE_GAME_DIAGNOSTICS__!.timeAlive;
      window.__GR_TEST__!.advanceSim(1);
      return [before, window.__THREE_GAME_DIAGNOSTICS__!.timeAlive];
    });
    expect(after).toBeGreaterThan(before);
  }
  expect(errors).toEqual([]);
});

test('the heat-7 era-4 crown is now a stale deep link and refuses under era 5', async ({ page }) => {
  const tape = JSON.parse(await readFile(HEAT_7_CROWN_PATH, 'utf8'));
  expect(tape.meta).toMatchObject({ era: 4, engineHash: 'd5b04061596bdf43b313a0e430229a46d10e67e52877c6394b61aea05efd389a' });
  await page.addInitScript((reel) => sessionStorage.setItem('gr.assay-replay.v1', JSON.stringify(reel)), tape);
  const errors = collectErrors(page);
  await page.goto(replayUrl(tape));
  const show = page.getByTestId('lantern-show');
  await expect(show).toHaveAttribute('data-era-refused', 'true');
  await expect(show).toHaveAttribute('data-playback', 'complete');
  await expect(page.getByTestId('lantern-intertitle')).toContainText(`This reel rode era 4`);
  expect(await probe(page)).toBeNull();
  expect(errors).toEqual([]);
});

test('the replay HUD shows live gold and Keeper health and changes with the displayed tick', async ({ page }, testInfo) => {
  const tape = await currentEraTape(HUD_FIXTURE_PATH);
  await page.addInitScript((reel) => sessionStorage.setItem('gr.assay-replay.v1', JSON.stringify(reel)), tape);
  const errors = collectErrors(page);
  await page.goto(replayUrl(tape));
  await expect.poll(async () => (await probe(page))?.tick ?? -1).toBeGreaterThanOrEqual(0);
  const before = await probe(page);
  const status = page.getByTestId('lantern-playback-status');
  await expect(status).toContainText(`Gold ${before.gold}`);
  await expect(status).toContainText(`Keeper ${before.hero.hp}/${before.hero.maxHp} HP`);

  await page.getByTestId('lantern-wave-skip').click();
  await expect.poll(async () => (await probe(page))?.wave ?? 0, { timeout: 15_000 }).toBeGreaterThanOrEqual(1);
  await page.getByTestId('lantern-pause').click();
  await expect(page.getByTestId('lantern-show')).toHaveAttribute('data-playback', 'paused');
  const after = await probe(page);
  expect(after.gold).not.toBe(before.gold);
  expect(after.hero.hp).not.toBe(before.hero.hp);
  await expect(status).toContainText(`Gold ${after.gold}`);
  await expect(status).toContainText(`Keeper ${after.hero.hp}/${after.hero.maxHp} HP`);
  await mkdir(ERA_FIVE_SHOT_DIR, { recursive: true });
  await writeFile(path.join(ERA_FIVE_SHOT_DIR, `${testInfo.project.name}-hud.png`), await page.screenshot({ fullPage: true }));
  expect(errors).toEqual([]);
});

test('an unknown pin claiming the current era is refused with a lineage message', async ({ page }) => {
  const tape = await currentEraTape();
  tape.meta = { ...tape.meta, engineHash: '0'.repeat(64) };
  await page.addInitScript((reel) => sessionStorage.setItem('gr.assay-replay.v1', JSON.stringify(reel)), tape);
  const errors = collectErrors(page);
  await page.goto(replayUrl(tape));
  const show = page.getByTestId('lantern-show');
  await expect(show).toHaveAttribute('data-era-refused', 'true');
  await expect(page.getByTestId('lantern-intertitle')).toContainText(
    `This reel's engine pin is not recorded in era ${engineEra.era}'s lineage.`,
  );
  await expect(page.getByTestId('lantern-intertitle')).not.toContainText('one era with another');
  expect(await probe(page)).toBeNull();
  expect(errors).toEqual([]);
});

test('plain town board WATCH plays an era-current reel without debug', async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  const tape = await currentEraTape();
  const errors = await openBoardReel(page, tape);
  const show = page.getByTestId('lantern-show');
  await expect(show).toHaveAttribute('data-era-refused', 'false', { timeout: 20_000 });
  await expect(show).toHaveAttribute('data-playback', 'playing');
  await expect(page.getByTestId('lantern-agent-honesty')).toHaveText('This is the ride. The county is replaying it here in your browser.');
  await expect.poll(async () => (await probe(page))?.tick ?? -1).toBeGreaterThanOrEqual(0);
  await mkdir(ERA_SHOT_DIR, { recursive: true });
  await writeFile(path.join(ERA_SHOT_DIR, `${testInfo.project.name}-plain-boot-playing.png`), await page.screenshot({ fullPage: true }));
  expect(new URL(page.url()).searchParams.has('debug')).toBe(false);
  expect(errors).toEqual([]);
});

test('plain town board WATCH gives a half-stamped reel its honest unstamped-era refusal', async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  const tape = await currentEraTape();
  tape.meta = { buildId: tape.meta.buildId, engineHash: tape.meta.engineHash };
  const errors = await openBoardReel(page, tape);
  const show = page.getByTestId('lantern-show');
  await expect(show).toHaveAttribute('data-era-refused', 'true', { timeout: 20_000 });
  await expect(show).toHaveAttribute('data-playback', 'complete');
  await expect(page.getByTestId('lantern-intertitle')).toContainText(`This reel rode era unknown (unstamped build ${tape.meta.buildId}).`);
  await expect(page.getByTestId('lantern-intertitle')).toContainText(
    `This reel does not announce an engine era. The county cannot prove it belongs to era ${engineEra.era}.`,
  );
  await mkdir(ERA_SHOT_DIR, { recursive: true });
  await writeFile(path.join(ERA_SHOT_DIR, `${testInfo.project.name}-half-stamped-refusal.png`), await page.screenshot({ fullPage: true }));
  await page.getByTestId('lantern-refusal-close').click();
  await expect(show).toHaveCount(0);
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.evaluate(() => {
    const town = window.__GR_TOWN_DIAGNOSTICS__!;
    const approach = town.buildings.find((building) => building.id === 'schoolhouse')!.approach;
    town.teleport(approach.x, approach.z);
  });
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt)).toBe('schoolhouse');
  expect(errors).toEqual([]);
});

async function openBoardReel(page: Page, tape: any): Promise<string[]> {
  const profile: ProfileState = {
    version: 2,
    activeId: 'reel-viewer',
    profiles: [{ id: 'reel-viewer', name: 'Reel Viewer', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: ['story:first-contract'] }],
  };
  await page.addInitScript(({ key, state }) => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(key, JSON.stringify(state));
  }, { key: PROFILE_KEY, state: profile });
  const errors = collectErrors(page);
  await page.route(`${GAME_API_ORIGIN}/api/standings**`, async (route) => {
    const url = new URL(route.request().url());
    const body = url.searchParams.has('reel')
      ? { ok: true, reel: tape }
      : {
          ok: true,
          board: [{
            rank: 1, profileName: 'The Rig', secured: true, waves: tape.outcome.waves,
            timeAlive: tape.outcome.timeAlive, gold: tape.outcome.gold, baseValue: 0, difficulty: tape.difficulty,
            declared: true, model: 'fixture-rig', harness: 'gr-sim', reel: { id: tape.id, simVersion: tape.simVersion },
          }],
        };
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });

  await page.goto('/');
  await page.getByTestId('start-menu-claim-ledger').click();
  await page.getByTestId('claim-ledger-county-standings').click();
  await page.getByTestId('county-standings-watch-1').click();
  return errors;
}

// Approximation-era assertions were retired because EH-3 removes that path rather than relabeling it.

async function currentEraTape(fixturePath = FIXTURE_PATH): Promise<any> {
  const tape = JSON.parse(await readFile(fixturePath, 'utf8'));
  // F-2374-2: mint the fixture's identity from the live registry so src merges cannot stale it.
  return { ...tape, meta: { ...tape.meta, engineHash: engineEra.engineHash, era: engineEra.era } };
}

function replayUrl(tape: { id: string; contract: string; seed: string; difficulty: string }): string {
  const query = new URLSearchParams({ debug: '', assayReplay: '', replay: tape.id, contract: tape.contract, seed: tape.seed, difficulty: tape.difficulty });
  return `/?${query}`;
}

function probe(page: Page): Promise<any> {
  return page.evaluate(() => {
    const raw = document.querySelector<HTMLElement>('[data-testid="lantern-show"]')?.dataset.trueReelProbe;
    return raw ? JSON.parse(raw) : null;
  });
}

async function assertRenderedProbe(page: Page): Promise<void> {
  const rendered = await page.evaluate(() => {
    const show = document.querySelector<HTMLElement>('[data-testid="lantern-show"]')!;
    const state = JSON.parse(show.dataset.trueReelProbe!);
    const hero = show.querySelector('[data-replay-entity="hero"] circle')!;
    return {
      state,
      heroX: Number(hero.getAttribute('cx')),
      heroY: Number(hero.getAttribute('cy')),
      riderPath: show.querySelector('[data-replay-entity="rider"] path')?.getAttribute('d') ?? null,
      entities: [...show.querySelectorAll<HTMLElement>('[data-replay-entity="enemy"]')]
        .map((enemy) => {
          const circle = enemy.querySelector('circle')!;
          return {
            id: Number(enemy.dataset.id), kind: enemy.dataset.kind, alive: enemy.dataset.alive,
            x: Number(circle.getAttribute('cx')), y: Number(circle.getAttribute('cy')),
          };
        }),
      works: [...show.querySelectorAll<HTMLElement>('[data-replay-entity="work"]')]
        .map((work) => {
          const rect = work.querySelector('rect')!;
          return {
            index: Number(work.dataset.index), kind: work.dataset.kind, wrecked: work.dataset.wrecked,
            x: Number(rect.getAttribute('x')) + 0.7, y: Number(rect.getAttribute('y')) + 0.7,
          };
        }),
    };
  });
  const { state } = rendered;
  expect(rendered.heroX).toBeCloseTo(state.hero.x + 40, 8);
  expect(rendered.heroY).toBeCloseTo(state.hero.z + 28, 8);
  if (state.rider) {
    expect(rendered.riderPath).toContain(`M ${state.rider.x + 40} ${state.rider.z + 28 - 1.15}`);
  }
  for (const enemy of state.enemies) {
    expect(rendered.entities).toContainEqual({
      id: enemy.id, kind: enemy.kind, alive: String(enemy.alive), x: enemy.x + 40, y: enemy.z + 28,
    });
  }
  for (const work of state.works) {
    expect(rendered.works).toContainEqual({
      index: work.index, kind: work.id, wrecked: String(work.wrecked), x: work.x + 40, y: work.z + 28,
    });
  }
}

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}
