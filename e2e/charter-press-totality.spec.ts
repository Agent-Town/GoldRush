import { expect, test, type Page } from '@playwright/test';
import { listContracts } from '../src/meta/ContractFamilies';
import { importContract } from '../src/charter/CharterSchema';
import { CHARTER_FUZZ_CLOCK, charterMutationArmsForTest, seedSecuredClaimProfile } from './charter-press.rig';

const templates = listContracts('epoch-1-frontier');
const freshCharter = (template: (typeof templates)[number]) =>
  importContract(template, { author: 'Fuzz Press', clock: CHARTER_FUZZ_CLOCK });
const rngDraws = [0, 0.5, 0.999] as const;
const fixedRng = () => rngDraws[0];

function mutationArmIndices(): Map<string, number[]> {
  // 2026-08-01 (F-1326-1): this search is LOAD-BEARING, not tidiness. Only 1 of the 6 Frontier
  // templates has build zones (e1-twin-banks) and it is NOT templates[0] — on every other one the
  // illegal:zone-outside-claim arm returns 'noop' on a fresh charter, which makes the map below
  // non-injective and reds the assertions. Point this at templates[0] and the guard dies.
  const template = templates.find((candidate) => (candidate.tileParams.buildZones?.length ?? 0) > 0);
  expect(template, 'mutation arm label "illegal:zone-outside-claim" needs a fresh charter with build zones').toBeDefined();
  const armCount = charterMutationArmsForTest(freshCharter(template!), fixedRng).length;
  const indices = new Map<string, number[]>();
  for (let index = 0; index < armCount; index += 1) {
    const label = charterMutationArmsForTest(freshCharter(template!), fixedRng)[index]!();
    indices.set(label, [...(indices.get(label) ?? []), index]);
  }
  for (const [label, matches] of indices) {
    expect(matches, `mutation arm label "${label}" must map to exactly one index`).toHaveLength(1);
  }
  return indices;
}

test('every ordered pair of charter mutation arms is total', () => {
  for (const template of templates) {
    for (const draw of rngDraws) {
      const rng = () => draw;
      const armCount = charterMutationArmsForTest(freshCharter(template), rng).length;
      for (let first = 0; first < armCount; first += 1) {
        for (let second = 0; second < armCount; second += 1) {
          const arms = charterMutationArmsForTest(freshCharter(template), rng);
          expect(() => {
            arms[first]!();
            arms[second]!();
          }, `mutation arms ${first} then ${second}, draw ${draw}, template ${template.id}`).not.toThrow();
        }
      }
    }
  }
});

test('blank briefing goal fires with a briefing and noops after missing briefing', () => {
  const indices = mutationArmIndices();
  const armIndex = (label: string) => {
    const matches = indices.get(label) ?? [];
    expect(matches, `mutation arm label "${label}" must map to exactly one index`).toHaveLength(1);
    return matches[0]!;
  };
  const blankBriefingGoal = armIndex('blank:briefing.goal');
  const missingBriefing = armIndex('illegal:missing-briefing');
  expect(
    indices.get('noop') ?? [],
    'mutation arm label "noop" must not occur on a fresh charter of the build-zone template',
  ).toHaveLength(0);
  let charter = freshCharter(templates[0]!);
  let arms = charterMutationArmsForTest(charter, fixedRng);
  expect(arms[blankBriefingGoal]!()).toBe('blank:briefing.goal');
  expect(charter.contract.briefing.goals[0]).toBe('   ');

  charter = freshCharter(templates[0]!);
  arms = charterMutationArmsForTest(charter, fixedRng);
  expect(arms[missingBriefing]!()).toBe('illegal:missing-briefing');
  expect(arms[blankBriefingGoal]!()).toBe('noop');
});

// charter-press-locked-lands-1 (F-1179-4, owner ruling (a) 2026-09-26, verbatim "a"): the Lever's offer is total
// and exact. It shows only the lands this profile has unlocked, renders no locked land at all, preselects the
// first land it offers, and every land it offers opens when pressed: the URL's `contract=` is the choice, the
// boot keeps the staged launch (`stagedLaunchClear` null) and the briefing names the land. Three saves, each
// asserted as the whole offer: a fresh profile (The Claim alone), a secured Claim (the rig's profile fixture),
// and the preview-only "Open every claim" seam flipped by its own function (all five, then one again).
const LEVER_BOOT = '/?editor&debug&contract=the-claim&nowaves&nolevel&nokill&nopause&seed=cpl1-lever';
const ALL_LEVER_LANDS = ['the-claim', 'e1-dry-gulch', 'e1-night-shift', 'e1-twin-banks', 'e1-baron'];

type LeverErrors = { console: string[]; page: string[] };

function collectLeverErrors(page: Page): LeverErrors {
  const errors: LeverErrors = { console: [], page: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.console.push(message.text());
  });
  page.on('pageerror', (error) => errors.page.push(error.message));
  return errors;
}

async function bootPress(page: Page): Promise<void> {
  await page.goto(LEVER_BOOT);
  await page.waitForFunction(() => Boolean(window.__GR_TEST__) && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await expect(page.getByTestId('press-full-mode')).toBeVisible();
}

/** Opens the Lever face (the player's click) and returns the land cards it rendered, in order. */
async function openLever(page: Page): Promise<string[]> {
  await page.getByTestId('press-mode-lever').click();
  await expect(page.getByTestId('press-lever-mode')).toBeVisible();
  return page.locator('[data-lever-land]').evaluateAll((cards) => cards.map((card) => (card as HTMLElement).dataset.leverLand ?? ''));
}

async function pressThrough(page: Page, landId: string, briefing: string): Promise<void> {
  await page.getByTestId('lever-press').click();
  await page.waitForURL((url) => url.searchParams.get('contract') === landId && !url.searchParams.has('editor'));
  await page.waitForFunction(
    (id) => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === id && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10,
    landId,
    { timeout: 30_000 },
  );
  await expect(page.getByTestId('contract-briefing-name')).toHaveText(briefing, { timeout: 30_000 });
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.contract.stagedLaunchClear)).toBeNull();
}

/** The seam's own function, the one the board's "Open every claim" control calls; no key is written by hand. */
async function setPreviewUnlockAll(page: Page, open: boolean): Promise<boolean> {
  return page.evaluate(async (value) => {
    const seam = (await Function('return import("/src/meta/ContractUnlock.ts")')()) as typeof import('../src/meta/ContractUnlock');
    return seam.setPreviewUnlockAll(value);
  }, open);
}

test.describe('the Lever offers only unlocked lands', () => {
  test('a fresh profile is offered The Claim alone, preselected, and pressing it opens The Claim', async ({ page }) => {
    test.setTimeout(120_000);
    const errors = collectLeverErrors(page);
    await bootPress(page);
    expect(await openLever(page)).toEqual(['the-claim']);
    await expect(page.getByTestId('lever-land-the-claim')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('lever-land-e1-twin-banks')).toHaveCount(0);
    await pressThrough(page, 'the-claim', 'The Claim: Defend the Camp');
    expect(errors).toEqual({ console: [], page: [] });
  });

  test('a secured Claim adds The Dry Gulch and Twin Banks, and pressing Twin Banks opens Twin Banks', async ({ page }) => {
    test.setTimeout(120_000);
    const errors = collectLeverErrors(page);
    await seedSecuredClaimProfile(page);
    await bootPress(page);
    expect(await openLever(page)).toEqual(['the-claim', 'e1-dry-gulch', 'e1-twin-banks']);
    await expect(page.getByTestId('lever-land-the-claim')).toHaveAttribute('aria-pressed', 'true');
    await page.getByTestId('lever-land-e1-twin-banks').click();
    await expect(page.getByTestId('lever-land-e1-twin-banks')).toHaveAttribute('aria-pressed', 'true');
    await pressThrough(page, 'e1-twin-banks', 'Twin Banks: Defend the Camp');
    expect(errors).toEqual({ console: [], page: [] });
  });

  test('the preview seam offers all five lands while it is open, and a land it opened presses through', async ({ page }) => {
    test.setTimeout(120_000);
    const errors = collectLeverErrors(page);
    await bootPress(page);
    expect(await openLever(page)).toEqual(['the-claim']);
    expect(await setPreviewUnlockAll(page, true)).toBe(true);
    await page.getByTestId('press-mode-full').click();
    expect(await openLever(page)).toEqual(ALL_LEVER_LANDS);
    expect(await setPreviewUnlockAll(page, false)).toBe(false);
    await page.getByTestId('press-mode-full').click();
    expect(await openLever(page)).toEqual(['the-claim']);
    expect(await setPreviewUnlockAll(page, true)).toBe(true);
    await page.getByTestId('press-mode-full').click();
    expect(await openLever(page)).toEqual(ALL_LEVER_LANDS);
    await page.getByTestId('lever-land-e1-baron').click();
    await pressThrough(page, 'e1-baron', "The Baron's Claim: Defend the Camp");
    expect(errors).toEqual({ console: [], page: [] });
  });
});
