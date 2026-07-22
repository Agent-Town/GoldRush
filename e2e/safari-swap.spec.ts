import { expect, test, type Page } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { FIRST_CLAIM_DONE_KEY, PROFILE_KEY, TOWN_NAME_KEY, profileDataKey } from '../src/game/ProfileStorage';

type Blocker = { x: number; z: number; halfX: number; halfZ: number };

test('Safari swap removes the run HUD and keeps town buildings solid', async ({ page }) => {
  test.setTimeout(60_000);
  const errors = collectErrors(page);
  await seedProfile(page);
  await page.goto('/');
  await page.evaluate(() => history.replaceState(null, '', '/?debug&nowaves&nolevel&nopause&seed=safari-swap'));
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  const tavernApproach = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__!.buildings.find((building) => building.id === 'tavern')!.approach);
  await page.evaluate(({ x, z }) => window.__GR_TOWN_DIAGNOSTICS__!.teleport(x, z), tavernApproach);
  await page.getByTestId('town-open-board').click();
  await page.getByTestId('contract-launch-the-claim').click();
  await waitForRun(page);

  await page.evaluate(() => window.__GR_TEST__!.endRunForTest());
  await expect(page.getByTestId('stake-again')).toHaveText('Return to Town');
  await page.getByTestId('stake-again').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  await expect(page.getByTestId('contract-board')).toBeVisible();

  const hudCounts = Object.fromEntries(await Promise.all(
    ['hud-vitals', 'hud-wave', 'hud-weapon', 'hud-build-panel', 'hud-xp'].map(async (testId) => [testId, await page.getByTestId(testId).count()]),
  ));
  const hudState = await page.locator('#hud').evaluate((root) => ({
    className: root.className,
    paused: root.hasAttribute('data-paused'),
    runState: root.hasAttribute('data-run-state'),
  }));

  await page.getByTestId('contract-board-close').click();
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await page.waitForFunction(() => window.__GR_TOWN_DIAGNOSTICS__?.boardOpen === false);
  const blockers = await page.evaluate(async () => {
    const layout = await Function('return import("/src/town/townLayout.ts")')() as typeof import('../src/town/townLayout');
    return ['tavern', 'chapel'].map((id) => {
      const building = layout.townBuildings.find((entry) => entry.id === id)!;
      return {
        x: building.position.x,
        z: building.position.z,
        halfX: (building.collisionFootprint ?? building.footprint).w / 2,
        halfZ: (building.collisionFootprint ?? building.footprint).d / 2,
      };
    });
  });
  const blocked = [];
  for (const blocker of blockers) blocked.push(await probeBlocker(page, blocker));
  expect({ hudCounts, hudState, blocked, errors }).toEqual({
    hudCounts: { 'hud-vitals': 0, 'hud-wave': 0, 'hud-weapon': 0, 'hud-build-panel': 0, 'hud-xp': 0 },
    hudState: { className: '', paused: false, runState: false },
    blocked: [true, true],
    errors: { consoleErrors: [], pageErrors: [] },
  });
});

test('plain boot is error-free', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/');
  await expect(page.getByTestId('start-menu')).toBeVisible();
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

function collectErrors(page: Page): { consoleErrors: string[]; pageErrors: string[] } {
  const errors = { consoleErrors: [] as string[], pageErrors: [] as string[] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => errors.pageErrors.push(error.stack ?? error.message));
  return errors;
}

async function seedProfile(page: Page): Promise<void> {
  await page.addInitScript(({ profile, town, meta, guide }) => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(profile, JSON.stringify({
      version: 2,
      activeId: 'robin',
      profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
    }));
    localStorage.setItem(town, 'Quartz Hill');
    localStorage.setItem(meta, JSON.stringify({ version: 1, tracks: { territory: 3, science: 0, hero: 0, agent: 0 } }));
    localStorage.setItem(guide, '1');
  }, {
    profile: PROFILE_KEY,
    town: profileDataKey('robin', TOWN_NAME_KEY),
    meta: profileDataKey('robin', META_PROGRESS_KEY),
    guide: profileDataKey('robin', FIRST_CLAIM_DONE_KEY),
  });
}

async function waitForRun(page: Page): Promise<void> {
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const briefing = page.getByTestId('contract-briefing');
  if (await briefing.isVisible().catch(() => false)) await page.getByTestId('contract-briefing-dismiss').click();
}

async function probeBlocker(page: Page, blocker: Blocker): Promise<boolean> {
  const boundary = blocker.x - blocker.halfX - 0.42;
  const startX = boundary - 1.5;
  await page.evaluate(({ x, z }) => window.__GR_TOWN_DIAGNOSTICS__!.teleport(x, z), { x: startX, z: blocker.z });
  await page.keyboard.down('KeyD');
  await page.waitForTimeout(900);
  await page.keyboard.up('KeyD');
  const player = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__!.player);
  return player.x > startX + 0.5 && player.x >= boundary - 0.5 && player.x <= boundary;
}
