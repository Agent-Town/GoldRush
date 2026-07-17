import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';
import { PROFILE_KEY, TOWN_NAME_KEY, profileDataKey } from '../src/game/ProfileStorage';

const ARTIFACT_DIR = path.resolve('artifacts/board-gating');

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

async function seedProfile(page: Page, epochId = 'epoch-1-frontier'): Promise<void> {
  await page.goto('/');
  await page.evaluate(
    ({ activeEpochKey, epoch, profileKey, townNameKey }) => {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem(
        profileKey,
        JSON.stringify({
          version: 2,
          activeId: 'robin',
          profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
        }),
      );
      localStorage.setItem(townNameKey, 'Quartz Hill');
      localStorage.setItem(activeEpochKey, epoch);
    },
    {
      activeEpochKey: profileDataKey('robin', ACTIVE_EPOCH_KEY),
      epoch: epochId,
      profileKey: PROFILE_KEY,
      townNameKey: profileDataKey('robin', TOWN_NAME_KEY),
    },
  );
  await page.reload();
}

async function openBoard(page: Page): Promise<void> {
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  for (const [key, ms] of [['KeyA', 850], ['KeyW', 850]] as const) {
    await page.keyboard.down(key);
    await page.waitForTimeout(ms);
    await page.keyboard.up(key);
  }
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt)).toBe('tavern');
  await page.getByTestId('town-open-board').click();
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: true });
}

test('the board gates future-era contracts and counts only playable profiles', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const errors = watchErrors(page);

  await seedProfile(page);
  await openBoard(page);
  expect(await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activeEpochId)).toBe('epoch-1-frontier');
  for (const id of ['e5-regatta', 'e5-stillwater', 'e5-flotilla']) {
    await page.getByTestId(`contract-page-dot-${id}`).click();
    await expect(page.getByTestId(`contract-card-${id}`)).toHaveAttribute('data-contract-locked', 'true');
    await expect(page.getByTestId(`contract-lock-${id}`)).toBeVisible();
    await expect(page.getByTestId(`contract-launch-${id}`)).toBeDisabled();
  }
  await expect(page.getByTestId('contract-card-e6-glow-mesa')).toHaveCount(0);
  for (const id of ['e6-showroom', 'e6-half-life-hollow', 'e6-picnic']) {
    await page.getByTestId(`contract-page-dot-${id}`).click();
    await expect(page.getByTestId(`contract-card-${id}`)).toHaveAttribute('data-contract-locked', 'true');
    await expect(page.getByTestId(`contract-launch-${id}`)).toBeDisabled();
  }
  await expect(page.getByTestId('contract-card-e7-relay-valley')).toHaveCount(0);
  await expect(page.getByTestId('contract-card-e7-echo-canyon')).toHaveCount(0);
  await expect(page.getByTestId('contract-card-e7-dead-band')).toHaveCount(0);
  await expect(page.getByTestId('contract-card-e7-relay-rush')).toHaveCount(0);
  await expect(page.getByTestId('contract-card-e8-mare-claim')).toHaveCount(0);
  await expect(page.getByTestId('contract-card-e8-far-side')).toHaveCount(0);
  await expect(page.getByTestId('contract-card-e8-low-orbit')).toHaveCount(0);
  await expect(page.getByTestId('contract-card-e8-eclipse')).toHaveCount(0);
  await expect(page.getByTestId('contract-card-e9-dome-basin')).toHaveCount(0);
  for (const id of ['e9-seed-run', 'e9-devils-alley', 'e9-old-canal']) {
    await page.getByTestId(`contract-page-dot-${id}`).click();
    await expect(page.getByTestId(`contract-card-${id}`)).toHaveAttribute('data-contract-locked', 'true');
    await expect(page.getByTestId(`contract-launch-${id}`)).toBeDisabled();
  }
  await expect(page.getByTestId('contract-card-e10-ember-shore')).toHaveCount(0);
  for (const id of ['e10-archive-world', 'e10-last-claim', 'e10-river']) {
    await page.getByTestId(`contract-page-dot-${id}`).click();
    await expect(page.getByTestId(`contract-card-${id}`)).toHaveAttribute('data-contract-locked', 'true');
    await expect(page.getByTestId(`contract-launch-${id}`)).toBeDisabled();
  }
  // campaign/e2-e4-extras: the E4 extras carry boardRows but their era is locked,
  // so on a fresh frontier profile they must sit inert like the E5 extras above.
  for (const id of ['e4-long-road', 'e4-gusher-county', 'e4-boneyard']) {
    await page.getByTestId(`contract-page-dot-${id}`).click();
    await expect(page.getByTestId(`contract-card-${id}`)).toHaveAttribute('data-contract-locked', 'true');
    await expect(page.getByTestId(`contract-launch-${id}`)).toBeDisabled();
  }
  await page.getByTestId('contract-page-dot-e2-hill-mine').click();
  await expect(page.getByTestId('contract-card-e2-hill-mine')).toHaveAttribute('data-contract-locked', 'true');
  await expect(page.getByTestId('contract-lock-e2-hill-mine')).toHaveText('The Steamworks awaits — raise the Stamp Mill.');
  await expect(page.getByTestId('contract-launch-e2-hill-mine')).toBeDisabled();
  await shot(page, testInfo, 'fresh-locked-hill-mine');

  await seedProfile(page, 'epoch-2-steamworks');
  await openBoard(page);
  await page.getByTestId('contract-page-dot-e2-hill-mine').click();
  await expect(page.getByTestId('contract-card-e2-hill-mine')).toHaveAttribute('data-contract-locked', 'false');
  await expect(page.getByTestId('contract-launch-e2-hill-mine')).toBeEnabled();

  const playableDots = page.locator('[data-contract-playable="true"]');
  const mutedDots = page.locator('[data-contract-playable="false"]');
  const playableCount = await playableDots.count();
  // drip-02/03 (s586): e2-pressure-garden AND e2-incline both graduated from muted
  // teasers to real board dots (each carries a boardRow), so the muted set drops 3→1.
  await expect(mutedDots).toHaveCount(1);
  await expect(mutedDots.first()).toHaveClass(/town-ui__catalog-dot--muted/);
  await page.getByTestId('contract-page-dot-e2-pressure-garden').click();
  // The graduated dot must still be LOCKED: this epoch-2 seed has no e2-trestle win,
  // so pressure-garden's unlock:"secured:e2-trestle" gate stays unmet (the real guard —
  // graduation to a board dot is independent of the scoreboard unlock).
  await expect(page.getByTestId('contract-card-e2-pressure-garden')).toHaveAttribute('data-contract-locked', 'true');
  await expect(page.getByTestId('contract-launch-e2-pressure-garden')).toBeDisabled();
  // campaign/e2-e4-extras: every live-era extra stays lock-gated behind its
  // secured:<predecessor> chain (trestle←hill-mine, incline←pressure-garden), and the
  // E3 extras stay era-locked — none may offer a launch path on this epoch-2 seed.
  for (const id of ['e2-trestle', 'e2-incline', 'e3-blackout-ridge', 'e3-moth-season', 'e3-fairground']) {
    await page.getByTestId(`contract-page-dot-${id}`).click();
    await expect(page.getByTestId(`contract-card-${id}`)).toHaveAttribute('data-contract-locked', 'true');
    await expect(page.getByTestId(`contract-launch-${id}`)).toBeDisabled();
  }
  await page.getByTestId('contract-page-dot-e2-pressure-garden').click();
  // pressure-garden is now a real (locked) board page, so clicking its dot navigates to it;
  // the gating invariant is the DENOMINATOR — total pages == playable-profile count (future-era gated out).
  await expect(page.getByTestId('contract-page-count')).toHaveText(new RegExp(`^\\d+ / ${playableCount}$`));
  await shot(page, testInfo, 'steamworks-profiles');

  expect(errors).toEqual([]);
});
