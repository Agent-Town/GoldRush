import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { FIRST_CLAIM_DONE_KEY, PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { MEGAPROJECT_STATE_KEY } from '../src/meta/Megaproject';

const ARTIFACT_DIR = path.resolve('artifacts/wire-era-anchor-emitters');
const E3 = 'epoch-3-voltage';
const E4 = 'epoch-4-motor';

type Errors = { console: string[]; page: string[] };

async function seed(page: Page, epoch: string): Promise<void> {
  await page.addInitScript(({ profileKey, townKey, metaKey, guideKey, epochKey, megaprojectKey, activeEpoch }) => {
    if (sessionStorage.getItem('wire-era-anchor-seeded') === '1') return;
    const state: ProfileState = {
      version: 2,
      activeId: 'robin',
      profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
    };
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem('wire-era-anchor-seeded', '1');
    localStorage.setItem(profileKey, JSON.stringify(state));
    localStorage.setItem(townKey, 'Quartz Hill');
    localStorage.setItem(metaKey, JSON.stringify({ version: 1, tracks: { territory: 3, science: 14, hero: 0, agent: 0 } }));
    localStorage.setItem(guideKey, '1');
    localStorage.setItem(epochKey, activeEpoch);
    localStorage.setItem(megaprojectKey, JSON.stringify({ version: 1, projects: {
      'stamp-mill': { stage: 3, funded: false, ticksRemaining: 0, hp: 150, delayTicks: 0, defenseWave: 0 },
      'dynamo-hall': { stage: 3, funded: false, ticksRemaining: 0, hp: 210, delayTicks: 0, defenseWave: 0 },
    } }));
  }, {
    profileKey: PROFILE_KEY,
    townKey: profileDataKey('robin', TOWN_NAME_KEY),
    metaKey: profileDataKey('robin', META_PROGRESS_KEY),
    guideKey: profileDataKey('robin', FIRST_CLAIM_DONE_KEY),
    epochKey: profileDataKey('robin', ACTIVE_EPOCH_KEY),
    megaprojectKey: profileDataKey('robin', MEGAPROJECT_STATE_KEY),
    activeEpoch: epoch,
  });
}

function errors(page: Page): Errors {
  const found: Errors = { console: [], page: [] };
  page.on('console', (message) => { if (message.type() === 'error') found.console.push(message.text()); });
  page.on('pageerror', (error) => found.page.push(error.message));
  return found;
}

async function openTown(page: Page, search: string): Promise<void> {
  await page.goto(`/${search}`);
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => document.querySelector('canvas')?.dataset.town3dPilotState === 'loaded');
}

async function p95(page: Page): Promise<number> {
  return page.evaluate(async () => {
    const deltas: number[] = [];
    await new Promise<void>((resolve) => {
      let previous = performance.now();
      const tick = (now: number) => {
        deltas.push(now - previous);
        previous = now;
        if (deltas.length < 120) requestAnimationFrame(tick); else resolve();
      };
      requestAnimationFrame(tick);
    });
    return deltas.sort((left, right) => left - right)[Math.floor(deltas.length * 0.95)]!;
  });
}

async function shot(page: Page, info: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.locator('canvas').screenshot({ path: path.join(ARTIFACT_DIR, `${info.project.name}-${name}.png`) });
}

test('Voltage arcs and Motor dust mount at their era anchors within the shared budget', async ({ page }, info) => {
  test.setTimeout(60_000);
  await seed(page, E3);
  const found = errors(page);
  const canvas = page.locator('canvas');

  await openTown(page, '?town3dPilot=all&tier=full');
  await expect(canvas).toHaveAttribute('data-town3d-arc-anchors', '40');
  await expect(canvas).toHaveAttribute('data-town3d-arc-flickers', '80');
  await expect(canvas).not.toHaveAttribute('data-town3d-dust-puffs', /[1-9]/);
  const e3P95 = await p95(page);
  await shot(page, info, 'e3-arc-flicker');

  await page.evaluate(({ key, epoch }) => localStorage.setItem(key, epoch), { key: profileDataKey('robin', ACTIVE_EPOCH_KEY), epoch: E4 });
  await openTown(page, '?town3dPilot=all&tier=full');
  await expect(canvas).toHaveAttribute('data-town3d-exhaust-anchors', '5');
  await expect(canvas).toHaveAttribute('data-town3d-dust-puffs', '10');
  await expect(canvas).toHaveAttribute('data-town3d-arc-anchors', '34');
  await expect(canvas).toHaveAttribute('data-town3d-arc-flickers', '68');
  const e4P95 = await p95(page);
  expect(e4P95).toBeLessThanOrEqual(e3P95 * 1.15);

  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(path.join(ARTIFACT_DIR, `p95-${info.project.name}.json`), `${JSON.stringify({ e3P95, e4P95, ratio: e4P95 / e3P95 }, null, 2)}\n`);
  await shot(page, info, 'e4-light-dust');
  expect(found).toEqual({ console: [], page: [] });
});

test('LITE mounts no era anchor emitters', async ({ page }) => {
  await seed(page, E4);
  const found = errors(page);
  const requests: string[] = [];
  page.on('request', (request) => { if (request.url().includes('.glb')) requests.push(request.url()); });
  await page.goto('/?town3dPilot=tavern&tier=lite');
  await page.getByTestId('start-menu-enter-town').click();
  const canvas = page.locator('canvas');
  await expect(canvas).toHaveAttribute('data-town3d-pilot-state', 'lite');
  await expect(canvas).not.toHaveAttribute('data-town3d-arc-flickers', /[1-9]/);
  await expect(canvas).not.toHaveAttribute('data-town3d-dust-puffs', /[1-9]/);
  expect(requests).toEqual([]);
  expect(found).toEqual({ console: [], page: [] });
});
