import { expect, test, type Page } from '@playwright/test';
import { PROFILE_KEY, SCOREBOARD_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../../src/game/ProfileStorage';
import { ACTIVE_EPOCH_KEY, listEpochs, loadEpoch } from '../../src/meta/ContractFamilies';

/**
 * PLAIN-BOOT PROBE for the owner's 2026-08-21 pressure-line ruling. Drain evidence, not part of the
 * standing suite — it lives beside the battery it belongs to.
 *
 * MISTAKE #10 IS THE WHOLE POINT: "where does the PLAYER see this, in a plain boot?" And the honest
 * answer for these two contracts is NOT `?contract=e2-trestle`. `ContractFamilies.ts:1329` refuses a
 * requested contract with `fallbackReason: 'debug-disabled'` unless it was LAUNCHED from the board,
 * so a no-debug URL boot quietly runs the default claim — the predecessor slice's own boot probe
 * asserted a clean console against the wrong tile without knowing it. This probe therefore walks the
 * real path: seed the predecessor win, enter the town, cross to the tavern, open the board, launch
 * the card. No `?debug` anywhere.
 *
 * It then asserts the three things the ruling actually changed, on the resolved contract:
 *   1. the contract that booted is the one whose card was clicked (`contract.activeId`);
 *   2. `pressure.enabled` is TRUE — `Game.ts:1525` gates the whole system on
 *      `twist.pressureEnabled`, so this is the ruling reaching the running browser;
 *   3. the boiler house is offered as a buildable, which is what "give both the pressure line"
 *      means to somebody holding the build menu.
 * Both projects run it, so desktop and 390px mobile each get their own boot.
 */

const UNLOCKS = {
  'e2-trestle': 'e2-hill-mine',
  'e2-incline': 'e2-pressure-garden',
} as const;

async function seedWin(page: Page, contractId: string): Promise<void> {
  await page.goto('/');
  await page.evaluate(
    ({ keys, won }) => {
      localStorage.clear();
      sessionStorage.clear();
      const profile: ProfileState = {
        version: 2,
        activeId: 'robin',
        profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
      };
      localStorage.setItem(keys.profile, JSON.stringify(profile));
      localStorage.setItem(keys.town, 'Quartz Hill');
      localStorage.setItem(keys.epoch, 'epoch-2-steamworks');
      localStorage.setItem(
        keys.scores,
        JSON.stringify([{ waves: 12, kills: 0, gold: 0, timeAlive: 60, at: 1, secured: true, contractId: won, profileName: 'Robin' }]),
      );
    },
    {
      won: contractId,
      keys: {
        profile: PROFILE_KEY,
        town: profileDataKey('robin', TOWN_NAME_KEY),
        epoch: profileDataKey('robin', ACTIVE_EPOCH_KEY),
        scores: profileDataKey('robin', SCOREBOARD_KEY),
      },
    },
  );
  await page.reload();
}

async function hold(page: Page, key: string, ms: number): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

for (const [contractId, unlockedBy] of Object.entries(UNLOCKS)) {
  test(`${contractId} plain boot runs a pressure line`, async ({ page }, testInfo) => {
    test.setTimeout(120_000);
    const problems: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error' || message.type() === 'warning') problems.push(`${message.type()}: ${message.text()}`);
    });
    page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));

    await seedWin(page, unlockedBy);
    await page.getByTestId('start-menu-enter-town').click();
    await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
    await hold(page, 'KeyA', 850);
    await hold(page, 'KeyW', 850);
    await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt), { timeout: 12_000 }).toBe('tavern');
    await page.getByTestId('town-open-board').click();

    const chapter = listEpochs().find((epoch) => loadEpoch(epoch.id).contracts.some((contract) => contract.id === contractId));
    await page.getByTestId(`contract-chapter-tab-${chapter!.id}`).click();
    await expect(page.getByTestId(`contract-card-${contractId}`)).toHaveAttribute('data-contract-locked', 'false');
    await page.getByTestId(`contract-launch-${contractId}`).click();
    await page.waitForFunction(
      (id) => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === id,
      contractId,
      { timeout: 30_000 },
    );
    const begin = page.getByRole('button', { name: 'Begin' });
    if (await begin.isVisible()) await begin.click();
    await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 20);

    const seen = await page.evaluate(() => ({
      activeId: window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId,
      fallbackReason: window.__THREE_GAME_DIAGNOSTICS__?.contract.fallbackReason ?? null,
      pressureEnabled: window.__THREE_GAME_DIAGNOSTICS__?.pressure?.enabled,
      seams: window.__THREE_GAME_DIAGNOSTICS__?.pressure?.seams?.length,
      boilerHouses: window.__THREE_GAME_DIAGNOSTICS__?.build?.boilerHouses,
    }));
    expect(seen.activeId).toBe(contractId);
    expect(seen.fallbackReason).toBeNull();
    expect(seen.pressureEnabled).toBe(true);
    // Three seams present and NONE built: the line is offered, not granted (Mistake #7's shape).
    expect(seen.seams).toBe(3);
    expect(seen.boilerHouses).toBe(0);
    await page.screenshot({ path: `artifacts/e2-pressure-line/shots/${testInfo.project.name}-${contractId}.png` });
    expect(problems).toEqual([]);
  });
}
