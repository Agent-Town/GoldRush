/**
 * PREVIEW-ONLY "OPEN EVERY CLAIM" (task `preview-unlock-all`, owner 2026-09-05 night:
 * "how do we get them all playable for me to test? ... push hard while I sleep").
 *
 * 26 of the 42 board contracts sit behind `secured:` chains, science thresholds or the era gate.
 * The owner tests every era by hand on the full-board preview; grinding those chains is not a test.
 * One control on the board itself opens them, tags them "testing", and locks them again.
 *
 * PLAIN BOOT, NO `?debug` (CLAUDE.md §5 Mistake #10). The board is reached the way a player reaches
 * it: walk to the tavern, click the ledger. The only seeding is the same profile/era seeding
 * `e2e/board-gating-and-profiles.spec.ts` already uses to put a save in a known state.
 *
 * THE COUNTS. The master asked for "16 -> 42 -> 16". 16 is the number of board rows whose `unlock`
 * field is the literal `default` (asserted below, on the data), but it is NOT the number of cards a
 * profile sees open, because `e2-hill-mine`'s gate is the era predicate `epoch-2-steamworks`: a
 * profile that has reached the last era satisfies it without securing anything. The honest,
 * measured counts are therefore
 *   - all eras reached, zero runs banked: 17 open -> 42 open -> 17 open (25 tagged "testing")
 *   - a fresh Frontier profile:            2 open ->  42 open ->  2 open (40 tagged "testing")
 * Both are asserted here so neither number can drift unnoticed.
 *
 * THE RELEASE PROOF is the last test. It needs a server this config never starts, so it self-skips
 * unless GR_RELEASE_PREVIEW_URL names one (the same shape `e2e/playability-smoke.spec.ts` uses for
 * its own out-of-battery arm). Run it with:
 *   GR_RELEASE=e1 npm run build
 *   npx vite preview --host 127.0.0.1 --port 5318
 *   GR_RELEASE_PREVIEW_URL=http://127.0.0.1:5318 npx playwright test e2e/preview-unlock-all.spec.ts
 */
import { readFile, readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { ACTIVE_EPOCH_KEY, listBoardContracts } from '../src/meta/ContractFamilies';
import { PROFILE_KEY, TOWN_NAME_KEY, profileDataKey } from '../src/game/ProfileStorage';
import { expectNoConsoleErrors, watchErrors } from './support/console-watch';

const ARTIFACT_DIR = path.resolve('artifacts/preview-unlock-all');
const DIST_DIR = path.resolve('dist');
const LAST_EPOCH = 'epoch-10-deepsky';
const OPEN_LABEL = 'Open every claim';
const LOCK_LABEL = 'Lock the board again';
/** Every string the release bundle must not carry. */
const PREVIEW_ONLY_STRINGS = [OPEN_LABEL, LOCK_LABEL, 'preview-unlock-all', 'gr.previewUnlockAll.v1', 'Opened for testing'];

const BOARD = listBoardContracts();
const DEFAULT_UNLOCKS = BOARD.filter((contract) => contract.boardRow.unlock === 'default');
/** `epochIsActive` alone opens this one once the era is reached: not a `default`, but not a chain either. */
const ERA_ONLY_UNLOCKS = BOARD.filter((contract) => /^epoch-\d+-/.test(contract.boardRow.unlock));
const OPEN_AT_LAST_ERA = DEFAULT_UNLOCKS.length + ERA_ONLY_UNLOCKS.length;

type Census = { chapters: number; cards: number; open: number; testing: number };

async function seedProfile(page: Page, epochId: string | null): Promise<void> {
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
      if (epoch) localStorage.setItem(activeEpochKey, epoch);
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

/** The player's own route: enter the town, walk to the tavern, open the ledger. No debug seam. */
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
  await expect(page.getByTestId('contract-board-title')).toBeVisible();
}

/** Walk every chapter of the book and count what is actually on it. */
async function census(page: Page): Promise<Census> {
  const chapters = await page.getByTestId('contract-chapter-nav').locator('[data-contract-page]').count();
  const result: Census = { chapters, cards: 0, open: 0, testing: 0 };
  for (let index = 0; index < chapters; index += 1) {
    await page.locator(`[data-contract-page="${index}"]`).click();
    await expect(page.getByTestId('contract-card-list')).toHaveAttribute('data-contract-page-index', String(index));
    const sections = page.locator('.town-ui__board-sections');
    result.cards += await sections.locator('[data-testid^="contract-card-"]').count();
    result.open += await sections.locator('[data-contract-locked="false"]').count();
    result.testing += await sections.locator('[data-testid^="contract-testing-tag-"]').count();
  }
  return result;
}

/**
 * The book, not the whole town. A full-page shot here is ~1 MB of photographic 3D backdrop per
 * frame (10 frames = 12 MB), and the evidence is the board's own state, so the shot is clipped to
 * the board shell: same proof, ~40x smaller, and it stays inside the repo's size manners.
 */
async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  const target = page.locator('.town-ui__board-shell').first();
  await target.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`) });
}

test('the board data still says 16 of 42 contracts unlock by default', () => {
  expect(BOARD).toHaveLength(42);
  expect(DEFAULT_UNLOCKS).toHaveLength(16);
  // The remaining 26 are the chains, the thresholds and the era gate the owner would have to grind.
  expect(BOARD.length - DEFAULT_UNLOCKS.length).toBe(26);
  // ... of which exactly one opens on the era alone, which is why the seen count is 17 and not 16.
  expect(ERA_ONLY_UNLOCKS.map((contract) => contract.id)).toEqual(['e2-hill-mine']);
  expect(OPEN_AT_LAST_ERA).toBe(17);
});

test('one control on the board opens every claim and locks them all again', async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  const watch = watchErrors(page);

  await seedProfile(page, LAST_EPOCH);
  await openBoard(page);

  const control = page.getByTestId('preview-unlock-all');
  await expect(control).toBeVisible();
  await expect(control).toHaveText(OPEN_LABEL);
  await expect(control).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByTestId('preview-unlock-all-note')).toHaveCount(0);

  const before = await census(page);
  expect(before).toEqual({ chapters: 10, cards: 42, open: OPEN_AT_LAST_ERA, testing: 0 });
  await expect(page.getByTestId('contract-card-e10-river')).toHaveAttribute('data-contract-locked', 'true');
  await shot(page, testInfo, 'before');

  await control.click();
  await expect(control).toHaveText(LOCK_LABEL);
  await expect(control).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('preview-unlock-all-note')).toBeVisible();

  const opened = await census(page);
  expect(opened).toEqual({ chapters: 10, cards: 42, open: 42, testing: 42 - OPEN_AT_LAST_ERA });
  await shot(page, testInfo, 'opened');

  // Honesty: only the cards the preview opened wear the tag, and each keeps its real gate in the tooltip.
  await page.getByTestId(`contract-chapter-tab-${LAST_EPOCH}`).click();
  await expect(page.getByTestId('contract-card-e10-river')).toHaveAttribute('data-contract-locked', 'false');
  await expect(page.getByTestId('contract-testing-tag-e10-river')).toHaveText('testing');
  await expect(page.getByTestId('contract-testing-tag-e10-river')).toHaveAttribute(
    'title',
    'Opened for testing. Really: Secure The Last Claim first',
  );
  await expect(page.getByTestId('contract-launch-e10-river')).toBeEnabled();
  await page.getByTestId('contract-chapter-tab-epoch-1-frontier').click();
  await expect(page.getByTestId('contract-testing-tag-the-claim')).toHaveCount(0);
  await expect(page.getByTestId('contract-testing-tag-e1-baron')).toHaveCount(1);

  await control.click();
  await expect(control).toHaveText(OPEN_LABEL);
  await expect(control).toHaveAttribute('aria-pressed', 'false');
  const after = await census(page);
  expect(after).toEqual(before);
  await expect(page.getByTestId('contract-card-e10-river')).toHaveAttribute('data-contract-locked', 'true');
  await shot(page, testInfo, 'relocked');

  expectNoConsoleErrors(watch, 'preview-unlock-all');
});

test('a fresh Frontier profile reaches all ten chapters through the control', async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  const watch = watchErrors(page);

  await seedProfile(page, null);
  await openBoard(page);
  expect(await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activeEpochId)).toBe('epoch-1-frontier');
  await expect(page.getByTestId('contract-chapter-count')).toHaveText('1 / 1');
  await expect(page.getByTestId(`contract-chapter-tab-${LAST_EPOCH}`)).toHaveCount(0);
  const before = await census(page);
  expect(before).toEqual({ chapters: 1, cards: 6, open: 2, testing: 0 });
  await shot(page, testInfo, 'fresh-before');

  await page.getByTestId('preview-unlock-all').click();
  await expect(page.getByTestId('contract-chapter-count')).toHaveText('1 / 10');
  await expect(page.getByTestId(`contract-chapter-tab-${LAST_EPOCH}`)).toHaveCount(1);
  const opened = await census(page);
  expect(opened).toEqual({ chapters: 10, cards: 42, open: 42, testing: 40 });
  await shot(page, testInfo, 'fresh-opened');

  await page.getByTestId('preview-unlock-all').click();
  await expect(page.getByTestId('contract-chapter-count')).toHaveText('1 / 1');
  expect(await census(page)).toEqual(before);

  expectNoConsoleErrors(watch, 'preview-unlock-all-fresh');
});

test('the E1 release build carries no such control', async ({ page }) => {
  const releaseUrl = process.env.GR_RELEASE_PREVIEW_URL;
  test.skip(!releaseUrl, 'set GR_RELEASE_PREVIEW_URL to a `GR_RELEASE=e1` vite preview to run the release proof');
  test.setTimeout(180_000);
  const watch = watchErrors(page);

  // (a) the DOM: the board opens and the control is not on it.
  await page.goto(`${releaseUrl}/`);
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.goto(`${releaseUrl}/`);
  await page.getByTestId('profile-name-input').fill('Robin');
  await page.getByTestId('profile-create').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  const townName = page.getByTestId('town-name-input');
  if (await townName.isVisible().catch(() => false)) {
    await townName.fill('Quartz Hill');
    await page.getByTestId('town-name-submit').click();
  }
  await page.mouse.click(6, 6);
  await page.evaluate(() => {
    const town = window.__GR_TOWN_DIAGNOSTICS__!;
    const tavern = town.buildings.find((entry) => entry.id === 'tavern')!;
    town.teleport(tavern.approach.x, tavern.approach.z);
  });
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt)).toBe('tavern');
  await page.getByTestId('town-open-board').click();
  await expect(page.getByTestId('contract-board-title')).toBeVisible();
  await expect(page.getByTestId('preview-unlock-all')).toHaveCount(0);
  await expect(page.getByTestId('preview-unlock-all-note')).toHaveCount(0);
  await expect(page.locator('[data-testid^="contract-testing-tag-"]')).toHaveCount(0);
  expect(await page.content()).not.toContain(OPEN_LABEL);

  // (b) the bundle: not one preview-only string survives into dist/.
  const files = await readdir(DIST_DIR, { recursive: true, withFileTypes: true });
  const texts = files.filter((entry) => entry.isFile() && /\.(js|html|css)$/.test(entry.name));
  expect(texts.length).toBeGreaterThan(0);
  const hits: string[] = [];
  for (const entry of texts) {
    const file = path.join(entry.parentPath ?? DIST_DIR, entry.name);
    const source = await readFile(file, 'utf8');
    for (const needle of PREVIEW_ONLY_STRINGS) if (source.includes(needle)) hits.push(`${path.relative(DIST_DIR, file)}: ${needle}`);
  }
  expect(hits).toEqual([]);

  expectNoConsoleErrors(watch, 'preview-unlock-all-release');
});
