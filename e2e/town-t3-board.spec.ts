import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { PROFILE_KEY, SCOREBOARD_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';

const ARTIFACT_DIR = path.resolve('artifacts/town-t3');

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type SeedScore = {
  waves: number;
  kills?: number;
  gold?: number;
  timeAlive?: number;
  at?: number;
  secured?: boolean;
  contractId?: string;
};
type SeedState = {
  scores?: readonly SeedScore[];
  science?: number;
};

const BOARD_CONTRACTS = [
  { id: 'the-claim', flavor: 'The classic river claim.', artKey: 'contract-the-claim' },
  { id: 'e1-dry-gulch', flavor: 'Mesa country; dry washes fall toward one sunken spring.', artKey: 'contract-dry-gulch' },
  { id: 'e1-night-shift', flavor: 'The claim, gone dark, dotted with cold lanterns.', artKey: 'contract-night-shift' },
  { id: 'e1-twin-banks', flavor: 'A braided river claim with twin fords, gravel bars, and damp reeds.', artKey: 'contract-twin-banks' },
  { id: 'e1-baron', flavor: 'An oxblood banner marks the outfit that keeps buying trouble.', artKey: 'contract-baron' },
  {
    id: 'e2-hill-mine',
    flavor: 'Terraced steamworks ground: hold the mine mouth, the rail cut, and the flooded gallery.',
    artKey: 'contract-hill-mine',
  },
] as const;

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function seedStorage(page: Page, seed: SeedState = {}): Promise<void> {
  await page.goto('/');
  await page.evaluate(
    ({ profileKey, scoreKey, townKey, metaKey, seedState }) => {
      localStorage.clear();
      sessionStorage.clear();
      const state: ProfileState = {
        version: 2,
        activeId: 'robin',
        profiles: [
          {
            id: 'robin',
            name: 'Robin',
            createdAt: 1,
            updatedAt: 1,
            difficultyPreset: 'trail',
            hintsSeen: [],
          },
        ],
      };
      localStorage.setItem(profileKey, JSON.stringify(state));
      localStorage.setItem(townKey, 'Quartz Hill');
      localStorage.setItem(
        metaKey,
        JSON.stringify({ version: 1, tracks: { territory: 0, science: seedState.science ?? 0, hero: 0, agent: 0 } }),
      );
      if (seedState.scores) {
        localStorage.setItem(
          scoreKey,
          JSON.stringify(
            seedState.scores.map((score, index) => ({
              kills: 0,
              gold: 0,
              timeAlive: 60,
              at: index + 1,
              ...score,
              profileName: 'Robin',
            })),
          ),
        );
      }
    },
    {
      profileKey: PROFILE_KEY,
      scoreKey: profileDataKey('robin', SCOREBOARD_KEY),
      townKey: profileDataKey('robin', TOWN_NAME_KEY),
      metaKey: profileDataKey('robin', META_PROGRESS_KEY),
      seedState: seed,
    },
  );
  await page.reload();
}

async function openBoard(page: Page): Promise<void> {
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  await hold(page, 'KeyA', 850);
  await hold(page, 'KeyW', 850);
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt), { timeout: 8_000 }).toBe('tavern');
  await page.getByTestId('town-open-board').click();
  await expect(page.getByTestId('contract-board')).toBeVisible();
}

async function hold(page: Page, key: string, ms: number): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: true });
}

async function goToContractPage(page: Page, id: string): Promise<void> {
  await page.getByTestId(`contract-page-dot-${id}`).click();
  await expect(page.getByTestId(`contract-card-${id}`)).toBeVisible();
}

async function assertFlavorOnce(page: Page, id: string, flavor: string): Promise<void> {
  await expect(page.getByTestId(`contract-flavor-${id}`)).toHaveText(flavor);
  const text = (await page.getByTestId(`contract-card-${id}`).textContent()) ?? '';
  expect(countOccurrences(text, flavor)).toBe(1);
}

function countOccurrences(text: string, needle: string): number {
  let count = 0;
  let index = text.indexOf(needle);
  while (index !== -1) {
    count += 1;
    index = text.indexOf(needle, index + needle.length);
  }
  return count;
}

function contractHash(diagnostics: NonNullable<Window['__THREE_GAME_DIAGNOSTICS__']>): string {
  return JSON.stringify({
    activeId: diagnostics.contract.activeId,
    tileParams: diagnostics.contract.tileParams,
    boardRow: diagnostics.contract.boardRow,
    seamYieldMult: diagnostics.contract.seamYieldMult,
    secureWave: diagnostics.contract.secureWave,
    lightRamp: diagnostics.contract.lightRamp,
  });
}

function assertNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

test('contract board renders manifest rows, locks, conditions, and per-contract bests', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  const errors = collectErrors(page);
  const cases = [
    {
      name: 'fresh',
      seed: {},
      locked: { 'e1-dry-gulch': true, 'e1-twin-banks': true, 'e1-night-shift': true, 'e2-hill-mine': true },
    },
    {
      name: 'wave-10',
      seed: {
        scores: [
          { waves: 10, contractId: 'the-claim' },
          { waves: 12, gold: 88, contractId: 'e1-dry-gulch' },
        ],
      },
      locked: { 'e1-dry-gulch': false, 'e1-twin-banks': true, 'e1-night-shift': true, 'e2-hill-mine': true },
    },
    {
      name: 'secured',
      seed: { scores: [{ waves: 18, secured: true, contractId: 'the-claim' }] },
      locked: { 'e1-dry-gulch': false, 'e1-twin-banks': false, 'e1-night-shift': true, 'e2-hill-mine': true },
    },
    {
      name: 'science-complete',
      seed: { science: 6, scores: [{ waves: 18, secured: true, contractId: 'the-claim' }] },
      locked: { 'e1-dry-gulch': false, 'e1-twin-banks': false, 'e1-night-shift': false, 'e2-hill-mine': true },
    },
  ] as const;

  for (const entry of cases) {
    await seedStorage(page, entry.seed);
    await openBoard(page);
    await expect(page.getByTestId('contract-card-list').locator('[data-contract-id]')).toHaveCount(1);
    await expect(page.getByTestId('contract-page-count')).toHaveText('1 / 6');
    await expect(page.getByTestId('contract-card-the-claim')).toHaveAttribute('data-contract-locked', 'false');
    await assertFlavorOnce(page, 'the-claim', BOARD_CONTRACTS[0].flavor);
    for (const [id, locked] of Object.entries(entry.locked)) {
      await goToContractPage(page, id);
      const contract = BOARD_CONTRACTS.find((item) => item.id === id)!;
      await assertFlavorOnce(page, id, contract.flavor);
      await expect(page.getByTestId(`contract-art-${id}`)).toHaveAttribute('data-contract-art-key', contract.artKey);
      await expect(page.getByTestId(`contract-card-${id}`)).toHaveAttribute('data-contract-locked', locked ? 'true' : 'false');
    }
    if (entry.name === 'fresh') {
      await goToContractPage(page, 'e1-twin-banks');
      await expect(page.getByTestId('contract-launch-e1-twin-banks')).toHaveText('Secure a claim first');
      await expect(page.getByTestId('contract-board-briefing-e1-twin-banks')).toHaveCount(0);
      await expect(page.getByTestId('contract-teaser-e1-twin-banks')).toHaveText("The clerk draws up the terms when you're ready.");
      await goToContractPage(page, 'e2-hill-mine');
      await expect(page.getByTestId('contract-launch-e2-hill-mine')).toHaveText('Awaits the Steamworks era');
      await shot(page, testInfo, 'locked-teaser');
      await goToContractPage(page, 'the-claim');
      await expect(page.getByTestId('contract-best-the-claim')).toHaveText('No result yet');
    }
    if (entry.name === 'wave-10') {
      await goToContractPage(page, 'e1-dry-gulch');
      await expect(page.getByTestId('contract-best-e1-dry-gulch')).toHaveText('Overrun - wave 12 - 88 gold');
      await shot(page, testInfo, 'mixed-locks');
    }
  }
  assertNoErrors(errors);
});

test('board launch loads Dry Gulch and New Claim hashes to the default contract config', async ({ page }) => {
  const errors = collectErrors(page);
  await seedStorage(page, { scores: [{ waves: 10, contractId: 'the-claim' }] });
  await openBoard(page);
  await goToContractPage(page, 'e1-dry-gulch');
  await page.getByTestId('contract-launch-e1-dry-gulch').dispatchEvent('click');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId)).toBe('e1-dry-gulch');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.fallbackReason)).toBeNull();

  await seedStorage(page);
  await page.evaluate(() => history.replaceState(null, '', '/?debug&timescale=3&nowaves&seed=town-t3-hash'));
  await openBoard(page);
  await page.getByTestId('contract-launch-the-claim').click();
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const menuHash = contractHash(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!));

  await page.goto('/?debug&contract=the-claim&timescale=3&nowaves&seed=town-t3-hash');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const directHash = contractHash(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!));
  expect(menuHash).toBe(directHash);
  assertNoErrors(errors);
});

test('post-run overrun returns straight to the town board and records a contract result', async ({ page }) => {
  const errors = collectErrors(page);
  await seedStorage(page, { scores: [{ waves: 10, contractId: 'the-claim' }] });
  await page.evaluate(() => history.replaceState(null, '', '/?debug&timescale=8&nowaves&nolevel&seed=town-t3-return'));
  await openBoard(page);
  await goToContractPage(page, 'e1-dry-gulch');
  await page.getByTestId('contract-launch-e1-dry-gulch').click();
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('enemy.contactDamage', 999);
    for (let pack = 0; pack < 6; pack += 1) window.__GR_TEST__?.spawnPack(5, 0.4);
  });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.runState), { timeout: 15_000 }).toBe('dead');
  await expect(page.getByTestId('stake-again')).toHaveText('Return to Town');
  await expect(page.getByTestId('run-secondary-action')).toHaveText('Try Again');
  await page.getByTestId('stake-again').click();
  await expect(page.getByTestId('contract-board')).toBeVisible({ timeout: 8_000 });
  await expect(page.getByTestId('contract-card-e1-dry-gulch')).toBeVisible();
  await expect(page.getByTestId('contract-best-e1-dry-gulch')).not.toHaveText('No result yet');
  assertNoErrors(errors);
});

test('contract catalog navigation remembers the last page', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  await seedStorage(page, { science: 6, scores: [{ waves: 18, secured: true, contractId: 'the-claim' }] });
  await openBoard(page);
  await page.getByTestId('contract-page-next').click();
  await expect(page.getByTestId('contract-card-e1-dry-gulch')).toBeVisible();
  await expect(page.getByTestId('contract-page-count')).toHaveText('2 / 6');
  await page.keyboard.press('ArrowRight');
  await expect(page.getByTestId('contract-card-e1-night-shift')).toBeVisible();
  await goToContractPage(page, 'e1-baron');
  await expect(page.getByTestId('contract-page-count')).toHaveText('5 / 6');
  await page.getByTestId('contract-board-close').click();
  await expect(page.getByTestId('contract-board')).toBeHidden();
  await page.getByTestId('town-open-board').click();
  await expect(page.getByTestId('contract-card-e1-baron')).toBeVisible();
  await shot(page, testInfo, 'baron-page');
  assertNoErrors(errors);
});

test('contract board swipes and keeps tap targets usable at 390px', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await seedStorage(page, { science: 6, scores: [{ waves: 18, secured: true, contractId: 'the-claim' }] });
  await openBoard(page);
  await expect(page.getByTestId('contract-card-list').locator('[data-contract-id]')).toHaveCount(1);
  const box = await page.getByTestId('contract-card-list').boundingBox();
  expect(box).not.toBeNull();
  if (box) {
    const list = page.getByTestId('contract-card-list');
    const y = box.y + box.height / 2;
    await list.dispatchEvent('pointerdown', { pointerType: 'touch', button: 0, clientX: box.x + box.width - 28, clientY: y });
    await list.dispatchEvent('pointerup', { pointerType: 'touch', button: 0, clientX: box.x + 28, clientY: y });
  }
  await expect(page.getByTestId('contract-card-e1-dry-gulch')).toBeVisible();
  await goToContractPage(page, 'e1-night-shift');
  const buttonBox = await page.getByTestId('contract-launch-e1-night-shift').boundingBox();
  expect(buttonBox?.height ?? 0).toBeGreaterThanOrEqual(44);
  const dotBox = await page.getByTestId('contract-page-dot-e1-night-shift').boundingBox();
  expect(dotBox?.width ?? 0).toBeGreaterThanOrEqual(44);
  expect(dotBox?.height ?? 0).toBeGreaterThanOrEqual(44);
  await shot(page, testInfo, 'mobile-390-board');
  assertNoErrors(errors);
});
