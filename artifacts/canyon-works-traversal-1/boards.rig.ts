/** canyon-works-traversal-1, item 3: plain boards of the hero on the widened works bank.
 *
 * A PLAIN boot (no ?debug, no harness): the contract is staged the way the Book stages it (the
 * native-proof driver's seed recipe, e2e/native-proofs/driver.ts), the hero walks there on the
 * keyboard, and the boards are whole-viewport screenshots at 1280 (desktop-chrome) and 390
 * (mobile-chrome). While walking, every sample reads the published diagnostics: the hero's render
 * height (terrain.height.heroVisualY) against the visible ground under it (terrain.height.heroGround,
 * the mounted GLB's baked height grid once terrain3dPilotHeightSource is 'baked-grid').
 *
 * Run (inside the drain lock, dev server on 5321):
 *   GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5321 \
 *     npx playwright test --config artifacts/canyon-works-traversal-1/playwright.boards.config.ts --workers=1
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { META_PROGRESS_KEY } from '../../src/game/MetaProgress';
import {
  FIRST_CLAIM_DONE_KEY,
  PROFILE_KEY,
  SCOREBOARD_KEY,
  TOWN_NAME_KEY,
  TOWN_WELCOME_SEEN_KEY,
  profileDataKey,
  type ProfileState,
} from '../../src/game/ProfileStorage';
import { ACTIVE_EPOCH_KEY, listBoardContracts, listEpochs } from '../../src/meta/ContractFamilies';
import { researchStateKey } from '../../src/meta/ResearchTree';
import { STORY_TALES_STORAGE_KEY } from '../../src/story/settings';
import { watchErrors } from '../../e2e/support/console-watch';

const CONTRACT = 'e3-canyon-works';
const OUT = path.join(import.meta.dirname, 'boards');
const PROFILE_ID = 'robin';

type Sample = { t: number; leg: string; x: number; z: number; heroVisualY: number; heroGround: number; lift: number };

function seedEntries(): Array<[string, string]> {
  const profile: ProfileState = {
    version: 2,
    activeId: PROFILE_ID,
    profiles: [{ id: PROFILE_ID, name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
  };
  const scores = listBoardContracts().map((entry, index) => ({
    kills: 40, gold: 400, timeAlive: 600, at: index + 1, waves: 30, secured: true, contractId: entry.id, profileName: 'Robin',
  }));
  const meta = JSON.stringify({ version: 1, tracks: { territory: 40, science: 999, hero: 40, agent: 40 } });
  const research = JSON.stringify({ version: 1, steps: 999, taken: [], proposalSalt: 0, pinnedTarget: null, metaScienceCursor: 999 });
  const logical: Array<[string, string]> = [
    [SCOREBOARD_KEY, JSON.stringify(scores)],
    [META_PROGRESS_KEY, meta],
    [TOWN_NAME_KEY, 'Quartz Hill'],
    [ACTIVE_EPOCH_KEY, 'epoch-10-deepsky'],
    [FIRST_CLAIM_DONE_KEY, '1'],
    [TOWN_WELCOME_SEEN_KEY, '1'],
    [STORY_TALES_STORAGE_KEY, '0'],
    ...listEpochs().map((epoch): [string, string] => [researchStateKey(epoch.id), research]),
  ];
  return [
    [PROFILE_KEY, JSON.stringify(profile)],
    ...logical.flatMap(([key, value]): Array<[string, string]> => [[key, value], [profileDataKey(PROFILE_ID, key), value]]),
  ];
}

async function sample(page: Page, leg: string, t0: number): Promise<Sample> {
  const read = await page.evaluate(() => {
    const d = window.__THREE_GAME_DIAGNOSTICS__!;
    return { x: d.heroPos.x, z: d.heroPos.z, heroVisualY: d.terrain.height.heroVisualY, heroGround: d.terrain.height.heroGround };
  });
  return { t: Date.now() - t0, leg, ...read, lift: read.heroVisualY - read.heroGround };
}

/** Hold one key until `done`, sampling as the hero walks; release, then let the hero come to rest. */
async function walk(page: Page, key: string, leg: string, done: (s: Sample) => boolean, samples: Sample[], t0: number): Promise<Sample> {
  await page.keyboard.down(key);
  try {
    for (const started = Date.now(); Date.now() - started < 30_000;) {
      const now = await sample(page, leg, t0);
      samples.push(now);
      if (done(now)) break;
      await page.waitForTimeout(40);
    }
  } finally {
    await page.keyboard.up(key);
  }
  await page.waitForTimeout(600);
  const rest = await sample(page, `${leg}:rest`, t0);
  samples.push(rest);
  return rest;
}

test('boards: the hero on the widened works bank at the bridge and the west flank', async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  const watch = watchErrors(page);
  await mkdir(OUT, { recursive: true });
  await page.addInitScript(({ entries, launchKey, launchValue, guardKey }) => {
    try { if (sessionStorage.getItem(guardKey)) return; } catch { /* seed below */ }
    try { localStorage.clear(); for (const [key, value] of entries) localStorage.setItem(key, value); } catch { /* storage unavailable */ }
    try { sessionStorage.clear(); sessionStorage.setItem(launchKey, launchValue); sessionStorage.setItem(guardKey, '1'); } catch { /* storage unavailable */ }
  }, { entries: seedEntries(), launchKey: 'gr.contract.launch.v1', launchValue: CONTRACT, guardKey: 'gr.cw1.boards.seeded.v1' });

  await page.goto(`/?contract=${CONTRACT}&nowaves&nospawn&nopause`);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 12, undefined, { timeout: 60_000 });
  const contract = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.contract);
  expect({ activeId: contract.activeId, fallbackReason: contract.fallbackReason }).toEqual({ activeId: CONTRACT, fallbackReason: null });
  expect(await page.evaluate(() => typeof window.__GR_TEST__)).toBe('undefined');
  await page.getByTestId('contract-briefing-dismiss').click({ timeout: 10_000 }).catch(() => undefined);
  await expect(page.getByTestId('contract-briefing')).toBeHidden({ timeout: 10_000 });
  await page.waitForFunction(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
    return canvas?.dataset.terrain3dPilotState === 'ready' && canvas.dataset.terrain3dPilotHeightSource === 'baked-grid';
  }, undefined, { timeout: 90_000 });
  const pilot = await page.evaluate(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas')!;
    return { state: canvas.dataset.terrain3dPilotState, renderSource: canvas.dataset.terrain3dPilotRenderSource, heightSource: canvas.dataset.terrain3dPilotHeightSource };
  });

  const t0 = Date.now();
  const samples: Sample[] = [await sample(page, 'stake', t0)];
  const boards: Array<{ id: string; file: string; hero: Sample }> = [];
  const board = async (id: string) => {
    const hero = await sample(page, `board:${id}`, t0);
    samples.push(hero);
    const file = path.join(OUT, `${id}-${testInfo.project.name}.png`);
    await page.screenshot({ path: file });
    boards.push({ id, file: path.relative(path.join(import.meta.dirname, '..', '..'), file), hero });
  };

  // The bridge x: the whole new bank (z -14..-6) and the visible face (z -8..-6), then back up to boards.
  await walk(page, 'KeyS', 'bridge-down', (s) => s.z >= -6.8, samples, t0);
  await walk(page, 'KeyW', 'bridge-up-to-face', (s) => s.z <= -6.7, samples, t0);
  await board('bridge-visible-face');
  await walk(page, 'KeyW', 'bridge-up-to-mid-bank', (s) => s.z <= -9.3, samples, t0);
  await board('bridge-mid-bank');
  // The west flank at x -24: across on the mid bank, then down the visible face.
  await walk(page, 'KeyA', 'flank-west', (s) => s.x <= -23.2, samples, t0);
  await board('west-flank-mid-bank');
  await walk(page, 'KeyS', 'flank-down', (s) => s.z >= -7.6, samples, t0);
  await board('west-flank-visible-face');

  const base = samples[0]!.lift;
  const onBank = samples.filter((s) => s.z >= -14 && s.z <= -6);
  const worst = onBank.reduce((max, s) => Math.max(max, Math.abs(s.lift - base)), 0);
  const report = {
    schema: 'goldrush.cw1.boards.v1',
    project: testInfo.project.name,
    viewport: page.viewportSize(),
    pilot,
    heroStartLift: base,
    bankSamples: onBank.length,
    worstFloatOrSinkOnBank: worst,
    boards,
    samples,
    consoleErrors: watch.errors,
    suppressed: watch.suppressed,
  };
  await writeFile(path.join(OUT, `boards-${testInfo.project.name}.json`), `${JSON.stringify(report, null, 2)}\n`);
  console.log(`[cw1-boards] ${testInfo.project.name} pilot=${JSON.stringify(pilot)} lift=${base.toFixed(4)} bankSamples=${onBank.length} worstFloatOrSink=${worst.toFixed(4)} errors=${watch.errors.length}`);
  expect(watch.errors).toEqual([]);
});
