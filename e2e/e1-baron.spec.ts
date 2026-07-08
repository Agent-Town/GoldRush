import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { Balance } from '../src/game/Balance';
import { BARON_MEDAL_BLURB } from '../src/game/Medals';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { MEDALS_KEY, PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { RESEARCH_STATE_KEY } from '../src/meta/ResearchTree';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type SeedState = {
  science?: number;
  medal?: boolean;
  activeId?: 'robin' | 'casey';
  medalProfileId?: 'robin' | 'casey';
};
type BaronSnapshot = {
  hp: number;
  maxHp: number;
  speed: number;
  scale: number;
  hasBanner: boolean;
  edge: string | null | undefined;
};

const ARTIFACT_DIR = path.resolve('artifacts/e1-baron');
const BARON_QUERY = '?debug&contract=e1-baron&timescale=6&nolevel&nosteal&nowreck&seed=e1-baron';
const BARON_TAUNT = "The Baron sends his regards. The claim won't hold.";
const BARON_DEFEAT = 'Dragged off by his own men, swearing revenge.';

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error' && !isDevServerTransportError(message.text())) bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

function isDevServerTransportError(text: string): boolean {
  return text.includes("WebSocket connection to 'ws://127.0.0.1:5188/") || text === 'Failed to load resource: net::ERR_CONNECTION_REFUSED';
}

async function seedStorage(page: Page, seed: SeedState = {}): Promise<void> {
  await page.goto('/');
  await page.evaluate(
    ({ profileKey, keys, seedState }) => {
      localStorage.clear();
      sessionStorage.clear();
      const profiles: ProfileState['profiles'] = [
        {
          id: 'robin',
          name: 'Robin',
          createdAt: 1,
          updatedAt: 1,
          difficultyPreset: 'trail',
          hintsSeen: [],
        },
      ];
      if (seedState.activeId === 'casey' || seedState.medalProfileId === 'casey') {
        profiles.push({
          id: 'casey',
          name: 'Casey',
          createdAt: 2,
          updatedAt: 2,
          difficultyPreset: 'trail',
          hintsSeen: [],
        });
      }
      const state: ProfileState = { version: 2, activeId: seedState.activeId ?? 'robin', profiles };
      localStorage.setItem(profileKey, JSON.stringify(state));
      for (const profile of profiles) {
        const profileKeys = keys[profile.id as 'robin' | 'casey'];
        localStorage.setItem(profileKeys.town, 'Quartz Hill');
        localStorage.setItem(
          profileKeys.meta,
          JSON.stringify({ version: 1, tracks: { territory: 0, science: seedState.science ?? 0, hero: 0, agent: 0 } }),
        );
        localStorage.setItem(profileKeys.research, JSON.stringify({ version: 1, taken: [], proposalSalt: 0, pinnedTarget: null }));
      }
      if (seedState.medal) {
        localStorage.setItem(keys[seedState.medalProfileId ?? seedState.activeId ?? 'robin'].medal, JSON.stringify({ version: 1, baronBeaten: true }));
      }
    },
    {
      profileKey: PROFILE_KEY,
      keys: {
        robin: {
          town: profileDataKey('robin', TOWN_NAME_KEY),
          meta: profileDataKey('robin', META_PROGRESS_KEY),
          research: profileDataKey('robin', RESEARCH_STATE_KEY),
          medal: profileDataKey('robin', MEDALS_KEY),
        },
        casey: {
          town: profileDataKey('casey', TOWN_NAME_KEY),
          meta: profileDataKey('casey', META_PROGRESS_KEY),
          research: profileDataKey('casey', RESEARCH_STATE_KEY),
          medal: profileDataKey('casey', MEDALS_KEY),
        },
      },
      seedState: seed,
    },
  );
  await page.reload();
}

async function openBoard(page: Page): Promise<void> {
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  if (await page.getByTestId('town-name-card').isVisible().catch(() => false)) {
    await page.getByTestId('town-name-input').fill('Quartz Hill');
    await page.getByTestId('town-name-submit').click();
    await expect(page.getByTestId('town-name-card')).toBeHidden();
  }
  await hold(page, 'KeyA', 850);
  await hold(page, 'KeyW', 850);
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt), { timeout: 8_000 }).toBe('tavern');
  await page.getByTestId('town-open-board').click();
  await expect(page.getByTestId('contract-board')).toBeVisible();
}

async function openGame(page: Page, query = BARON_QUERY): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/${query}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

async function hold(page: Page, key: string, ms: number): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: false });
}

async function setBalance(page: Page, key: string, value: number | boolean | string): Promise<void> {
  await expect(page.evaluate(([pathKey, next]) => window.__GR_TEST__?.setBalance(pathKey, next), [key, value] as const)).resolves.toBe(true);
}

async function setBalances(page: Page, values: Record<string, number | boolean | string>): Promise<void> {
  for (const [key, value] of Object.entries(values)) await setBalance(page, key, value);
}

async function setWave(page: Page, wave: number): Promise<void> {
  await page.evaluate((next) => window.__GR_TEST__?.setWave(next), wave);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wave ?? 0)).toBeGreaterThanOrEqual(wave);
}

async function tuneFastBaronWave(page: Page, extra: Record<string, number | boolean | string> = {}): Promise<void> {
  await setBalances(page, {
    'enemy.contactDamage': 0,
    'waves.waveInterval': 0.45,
    'waves.trickleInterval': 999,
    'waves.pulseBase': 0,
    'waves.pulsePerWave': 0,
    'waves.pulsesPerWave': 1,
    'waves.edgesPerPulse': 1,
    'waves.aliveCap': 80,
    ...extra,
  });
}

async function waitForBaron(page: Page): Promise<BaronSnapshot> {
  await expect
    .poll(() => page.evaluate(() => window.__GR_TEST__?.enemyPositions().find((enemy) => enemy.eliteKind === 'baron') ?? null), {
      timeout: 10_000,
    })
    .not.toBeNull();
  return page.evaluate(() => {
    const baron = window.__GR_TEST__?.enemyPositions().find((enemy) => enemy.eliteKind === 'baron');
    if (!baron) throw new Error('missing Baron');
    return {
      hp: baron.hp,
      maxHp: baron.maxHp,
      speed: baron.speed,
      scale: baron.scale,
      hasBanner: baron.hasBanner,
      edge: baron.edge,
    };
  });
}

function expectClean(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

test('contract board locks Baron until science-complete and shows the profile medal', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  const errors = collectErrors(page);

  await seedStorage(page);
  await openBoard(page);
  await expect(page.getByTestId('contract-card-list').locator('[data-contract-id]')).toHaveCount(5);
  await expect(page.getByTestId('contract-card-e1-baron')).toHaveAttribute('data-contract-locked', 'true');
  await expect(page.getByTestId('contract-launch-e1-baron')).toHaveText('Complete Frontier science first');

  await seedStorage(page, { science: 6 });
  await openBoard(page);
  await expect(page.getByTestId('contract-card-e1-baron')).toHaveAttribute('data-contract-locked', 'false');
  await expect(page.getByTestId('contract-medal-e1-baron')).toHaveCount(0);

  await seedStorage(page, { science: 6, medal: true });
  await openBoard(page);
  await expect(page.getByTestId('contract-medal-e1-baron')).toHaveText(`Baron beaten. ${BARON_MEDAL_BLURB}`);
  await shot(page, testInfo, 'medal-card');

  await seedStorage(page, { science: 6, medal: true, activeId: 'casey', medalProfileId: 'robin' });
  await openBoard(page);
  await expect(page.getByTestId('contract-card-e1-baron')).toHaveAttribute('data-contract-locked', 'false');
  await expect(page.getByTestId('contract-medal-e1-baron')).toHaveCount(0);
  expectClean(errors);
});

test('board launch uses the live Baron contract for cadence and wave 20 spawn', async ({ page }) => {
  test.setTimeout(60_000);
  const errors = collectErrors(page);

  await seedStorage(page, { science: 6 });
  await page.evaluate(() => history.replaceState(null, '', '/?debug'));
  await openBoard(page);
  await page.getByTestId('contract-launch-e1-baron').click();
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId)).toBe('e1-baron');
  await expect(page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.waveCadenceMult)).resolves.toBe(1.15);

  await tuneFastBaronWave(page);
  await setWave(page, 19);
  const baron = await waitForBaron(page);
  expect(baron.scale).toBe(1.4);
  expect(baron.hasBanner).toBe(true);
  await expect(page.getByTestId('claim-secured')).toHaveCount(0);
  expectClean(errors);
});

test('Baron manifest loads and taunts fire at waves 5, 12, and 18', async ({ page }) => {
  const errors = await openGame(page, '?debug&contract=e1-baron&timescale=1&nolevel&nowaves&nokill&nosteal&nowreck&seed=e1-baron-taunts');
  const contract = await page.evaluate(() => ({
    diagnostics: window.__THREE_GAME_DIAGNOSTICS__?.contract,
    registry: window.__GR_CONTRACT_REGISTRY__?.listContracts().find((entry) => entry.id === 'e1-baron'),
    active: window.__GR_TEST__?.activeContract(),
  }));
  expect(contract.diagnostics?.activeId).toBe('e1-baron');
  expect(contract.diagnostics?.waveCadenceMult).toBe(1.15);
  expect(contract.registry).toMatchObject({
    tileParams: { tileId: 'frontier-river-claim', river: true, ford: true },
    boardRow: { unlock: 'science-complete' },
    twist: {
      secureWave: 20,
      waveCadenceMult: 1.15,
      baron: {
        wave: 20,
        hpScale: 40,
        speedScale: 0.8,
        scale: 1.4,
        taunt: BARON_TAUNT,
        defeatBeat: BARON_DEFEAT,
      },
    },
  });
  expect(contract.active?.id).toBe('e1-baron');

  for (const wave of [5, 12, 18]) {
    await page.evaluate((nextWave) => window.__GR_TEST__?.startWaveForTest(nextWave), wave);
    await expect
      .poll(() => page.evaluate(() => ({ wave: window.__THREE_GAME_DIAGNOSTICS__?.wave, announcement: window.__THREE_GAME_DIAGNOSTICS__?.ui?.announcement })))
      .toEqual({ wave, announcement: BARON_TAUNT });
  }
  expectClean(errors);
});

test('wave 20 spawns the Baron with elite stats, banner, escorts, and stable seed data', async ({ page }, testInfo) => {
  const errors = await openGame(page, '?debug&contract=e1-baron&timescale=6&nolevel&nokill&nosteal&nowreck&seed=e1-baron-spawn');
  await tuneFastBaronWave(page);
  await setWave(page, 19);
  const baron = await waitForBaron(page);
  const expectedHp = Balance.enemy.hp * Math.pow(Balance.waves.hpScalePerWave, 20) * 40;
  const expectedSpeed = Balance.enemy.speed * Balance.waves.speedScaleCap * 0.8;
  expect(baron.maxHp).toBeCloseTo(expectedHp, 4);
  expect(baron.hp).toBeCloseTo(expectedHp, 4);
  expect(baron.speed).toBeCloseTo(expectedSpeed, 3);
  expect(baron.scale).toBe(1.4);
  expect(baron.hasBanner).toBe(true);
  await expect
    .poll(() => page.evaluate(() => window.__GR_TEST__?.enemyPositions().filter((enemy) => enemy.eliteKind !== 'baron').length ?? 0))
    .toBeGreaterThanOrEqual(8);
  await expect(page.getByTestId('claim-secured')).toHaveCount(0);
  await shot(page, testInfo, 'baron-mid-march');

  const first = await baronDeterminismSnapshot(page);
  await openGame(page, '?debug&contract=e1-baron&timescale=6&nolevel&nokill&nosteal&nowreck&seed=e1-baron-spawn');
  await tuneFastBaronWave(page);
  await setWave(page, 19);
  await waitForBaron(page);
  const second = await baronDeterminismSnapshot(page);
  expect(second).toEqual(first);
  expectClean(errors);
});

test('standard rig damage defeats the Baron, doubles science, and persists the medal', async ({ page }, testInfo) => {
  await seedStorage(page, { science: 6 });
  const errors = await openGame(page, '?debug&contract=e1-baron&timescale=8&nolevel&nowaves&nosteal&nowreck&seed=e1-baron-victory');
  await tuneFastBaronWave(page, {
    'enemy.hp': 1,
    'sparkRig.damage': 9999,
    'sparkRig.fireRate': 60,
    'sparkRig.range': 300,
    'sparkRig.boltRadius': 5,
    'sparkRig.boltSpeed': 12,
    'sparkRig.boltLife': 3,
  });
  await page.evaluate(() => window.__GR_TEST__?.setUpgradeStacks({}));
  await setWave(page, 20);
  await page.evaluate(() =>
    window.__GR_TEST__?.spawnPack(1, 4, {
      eliteKind: 'baron',
      hpScale: 40,
      speedScale: 0,
      visualScale: 1.4,
      banner: true,
    }),
  );
  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.run.secured ?? false), { timeout: 12_000 })
    .toBe(true);

  await expect(page.getByTestId('claim-secured')).toBeVisible({ timeout: 12_000 });
  await expect(page.getByTestId('claim-office')).toContainText(BARON_DEFEAT);
  await expect(page.getByTestId('claim-payout-science')).toContainText('+2');
  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.medals.baronBeaten ?? false), { timeout: 5_000 })
    .toBe(true);
  await expect(
    page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '{"baronBeaten":false}').baronBeaten, profileDataKey('robin', MEDALS_KEY)),
  ).resolves.toBe(true);

  await page.goto('/');
  await openBoard(page);
  await expect(page.getByTestId('contract-medal-e1-baron')).toContainText(BARON_MEDAL_BLURB);
  await shot(page, testInfo, 'medal-card-after-victory');
  expectClean(errors);
});

test('same-frame overrun and Baron kill does not award the medal', async ({ page }) => {
  await seedStorage(page, { science: 6 });
  const errors = await openGame(page, '?debug&contract=e1-baron&timescale=1&nolevel&nowaves&nosteal&nowreck&seed=e1-baron-trade');
  await setBalances(page, {
    'enemy.contactDamage': 999,
    'enemy.hp': 1,
    'sparkRig.damage': 9999,
    'sparkRig.fireRate': 60,
    'sparkRig.range': 300,
    'sparkRig.boltRadius': 5,
    'sparkRig.boltSpeed': 12,
    'sparkRig.boltLife': 3,
  });
  await page.evaluate(() =>
    window.__GR_TEST__?.spawnPack(1, 0.1, {
      eliteKind: 'baron',
      hpScale: 1,
      speedScale: 0,
      visualScale: 1.4,
      banner: true,
    }),
  );
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.runState), { timeout: 10_000 }).toBe('dead');
  await page.waitForTimeout(250);
  await expect(page.evaluate((key) => localStorage.getItem(key), profileDataKey('robin', MEDALS_KEY))).resolves.toBeNull();
  await expect(page.getByTestId('death-overlay')).not.toContainText(BARON_DEFEAT);
  expectClean(errors);
});

test('loss to the Baron contract remains the normal overrun ledger with no medal', async ({ page }) => {
  await seedStorage(page, { science: 6 });
  const errors = await openGame(page, '?debug&contract=e1-baron&timescale=3&nolevel&nowaves&seed=e1-baron-loss');
  await setBalance(page, 'enemy.contactDamage', 999);
  await page.evaluate(() => window.__GR_TEST__?.spawnPack(4, 0.1, { speedScale: 0 }));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.runState), { timeout: 10_000 }).toBe('dead');
  await expect(page.getByTestId('death-overlay')).toContainText('The claim was overrun. The gold remembers.');
  await expect(page.getByTestId('death-overlay')).not.toContainText(BARON_DEFEAT);
  await expect(page.evaluate((key) => localStorage.getItem(key), profileDataKey('robin', MEDALS_KEY))).resolves.toBeNull();
  expectClean(errors);
});

async function baronDeterminismSnapshot(page: Page): Promise<unknown> {
  return page.evaluate(() => {
    const diagnostics = window.__THREE_GAME_DIAGNOSTICS__!;
    const enemies = window.__GR_TEST__?.enemyPositions() ?? [];
    const baron = enemies.find((enemy) => enemy.eliteKind === 'baron');
    return {
      contract: diagnostics.contract.activeId,
      cadence: diagnostics.contract.waveCadenceMult,
      secureWave: diagnostics.contract.secureWave,
      baron: baron
        ? {
            maxHp: Math.round(baron.maxHp * 1000) / 1000,
            speed: Math.round(baron.speed * 1000) / 1000,
            scale: baron.scale,
            hasBanner: baron.hasBanner,
          }
        : null,
    };
  });
}
