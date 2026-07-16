import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { FIRST_CLAIM_DONE_KEY, PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';
import { MEGAPROJECT_STATE_KEY } from '../src/meta/Megaproject';

const ARTIFACT_DIR = path.resolve('artifacts/cold-anchor-rule');
const EPOCHS = [
  ['e2-steam-only', 'epoch-2-steamworks', 'steam'],
  ['e3-arc-only', 'epoch-3-voltage', 'arc'],
  ['e4-dust-only', 'epoch-4-motor', 'dust'],
] as const;
const DATASETS = {
  steam: ['data-town3d-steam-anchors', 'data-town3d-steam-plumes'],
  arc: ['data-town3d-arc-anchors', 'data-town3d-arc-flickers'],
  dust: ['data-town3d-exhaust-anchors', 'data-town3d-dust-puffs'],
} as const;

async function seed(page: Page, epoch: string): Promise<void> {
  await page.addInitScript(({ profileKey, townKey, metaKey, guideKey, epochKey, megaprojectKey, activeEpoch }) => {
    if (sessionStorage.getItem('cold-anchor-seeded') === '1') return;
    const state: ProfileState = {
      version: 2,
      activeId: 'robin',
      profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
    };
    localStorage.clear();
    sessionStorage.setItem('cold-anchor-seeded', '1');
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

test('only the active era breathes while inherited anchors stay cold', async ({ page }, info: TestInfo) => {
  test.setTimeout(60_000);
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await seed(page, EPOCHS[0][1]);

  for (const [index, [label, epoch, activeKind]] of EPOCHS.entries()) {
    if (index) {
      await page.evaluate(({ key, value }) => localStorage.setItem(key, value), {
        key: profileDataKey('robin', ACTIVE_EPOCH_KEY),
        value: epoch,
      });
    }
    await page.goto('/?town3dPilot=all&tier=full');
    await page.getByTestId('start-menu-enter-town').click();
    const canvas = page.locator('canvas');
    await expect(canvas).toHaveAttribute('data-town3d-pilot-state', 'loaded');
    await expect(canvas).toHaveAttribute(DATASETS[activeKind][0], /[1-9]/);
    await expect(canvas).toHaveAttribute(DATASETS[activeKind][1], /[1-9]/);
    for (const [kind, datasets] of Object.entries(DATASETS)) {
      if (kind === activeKind) continue;
      await expect(canvas).toHaveAttribute(datasets[0], '0');
      await expect(canvas).toHaveAttribute(datasets[1], '0');
    }
    await mkdir(ARTIFACT_DIR, { recursive: true });
    await canvas.screenshot({ path: path.join(ARTIFACT_DIR, `${info.project.name}-${label}.png`) });
  }

  expect(errors).toEqual([]);
});
