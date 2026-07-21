import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { MEDALS_KEY, PROFILE_KEY, SCOREBOARD_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import {
  frontierNodes,
  loadResearchState,
  RESEARCH_STATE_KEY,
  SKY_ROCKET_BATTERY_NODE_ID,
} from '../src/meta/ResearchTree';
import { renderResearchChart } from '../src/ui/ResearchChart';
import { loadMedals } from '../src/game/Medals';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type MemoryStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const ARTIFACT_DIR = path.resolve('artifacts/057');
const BASE_QUERY = '?debug&contract=e1-baron&timescale=1&nolevel&nowaves&nosteal&nowreck';
const ROCKET_MEDAL_LINE = 'The Rocket Cart — captured';
const ROCKET_PREREQS = ['chain_spark_primer', 'beacon_cadence', 'brass_coil_standards', 'powder_math'];

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

async function seedProfile(page: Page, science = 6, taken: readonly string[] = [], securedContracts: readonly string[] = []): Promise<void> {
  await page.goto('/');
  await page.evaluate(
    ({ profileKey, keys, scienceSteps, takenNodes, secured }) => {
      localStorage.clear();
      sessionStorage.clear();
      const profiles: ProfileState['profiles'] = [
        { id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] },
      ];
      const state: ProfileState = { version: 2, activeId: 'robin', profiles };
      localStorage.setItem(profileKey, JSON.stringify(state));
      localStorage.setItem(keys.town, 'Quartz Hill');
      localStorage.setItem(keys.meta, JSON.stringify({ version: 1, tracks: { territory: 0, science: scienceSteps, hero: 0, agent: 0 } }));
      localStorage.setItem(keys.research, JSON.stringify({ version: 1, taken: takenNodes, proposalSalt: 0, pinnedTarget: null }));
      if (secured.length) {
        localStorage.setItem(
          keys.scores,
          JSON.stringify(secured.map((contractId, index) => ({
            waves: 20, kills: 0, gold: 0, timeAlive: 60, at: index + 1, secured: true, contractId, profileName: 'Robin',
          }))),
        );
      }
    },
    {
      profileKey: PROFILE_KEY,
      keys: {
        town: profileDataKey('robin', TOWN_NAME_KEY),
        meta: profileDataKey('robin', META_PROGRESS_KEY),
        research: profileDataKey('robin', RESEARCH_STATE_KEY),
        scores: profileDataKey('robin', SCOREBOARD_KEY),
      },
      scienceSteps: science,
      takenNodes: taken,
      secured: securedContracts,
    },
  );
}

async function openGame(page: Page, seed: string, extra = ''): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/${BASE_QUERY}${extra}&seed=${seed}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

async function openBoard(page: Page): Promise<void> {
  await page.goto('/');
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

async function openBaronBoardPage(page: Page): Promise<void> {
  // 330ba7bb: The Book exposes contracts through era chapters, not per-contract page dots.
  await page.getByTestId('contract-chapter-tab-epoch-1-frontier').click();
  await expect(page.getByTestId('contract-card-e1-baron')).toBeVisible();
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

async function showStoryBeat(page: Page, beatId: string): Promise<void> {
  const card = page.getByTestId('story-beat-card');
  for (let guard = 0; guard < 6; guard += 1) {
    await expect(card).toBeVisible({ timeout: 8_000 });
    if ((await card.getAttribute('data-beat-id')) === beatId) return;
    await page.mouse.click(6, 6);
    await page.waitForTimeout(3_200);
  }
}

async function unlockAudio(page: Page): Promise<void> {
  await page.mouse.click(24, 24);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.unlocked ?? false), { timeout: 8_000 }).toBe(true);
}

async function setBalance(page: Page, key: string, value: number | boolean): Promise<void> {
  await expect(page.evaluate(([pathKey, next]) => window.__GR_TEST__?.setBalance(pathKey, next), [key, value] as const)).resolves.toBe(true);
}

async function advance(page: Page, seconds: number): Promise<void> {
  await page.evaluate((duration) => window.__GR_TEST__?.advanceSim(duration), seconds);
}

async function advanceUntil<T>(page: Page, read: () => Promise<T>, pass: (value: T) => boolean, seconds = 4): Promise<T> {
  const stepSeconds = 1 / 15;
  const steps = Math.ceil(seconds / stepSeconds);
  for (let index = 0; index < steps; index += 1) {
    await advance(page, stepSeconds);
    const value = await read();
    if (pass(value)) return value;
  }
  throw new Error('condition did not become true during manual sim advance');
}

async function prepareKitedBaron(page: Page, seed: string, unlock = false): Promise<ErrorBucket> {
  await seedProfile(page);
  const errors = await openGame(page, seed);
  if (unlock) await unlockAudio(page);
  await expect(page.evaluate(() => window.__GR_TEST__?.setManualSim(true))).resolves.toBe(true);
  await page.evaluate(() => window.__GR_TEST__?.resetRun());
  await setBalance(page, 'sparkRig.damage', 0);
  await setBalance(page, 'sparkRig.range', 0);
  await setBalance(page, 'enemy.contactDamage', 0);
  await page.evaluate(() => {
    const rocket = window.__GR_TEST__?.activeContract().twist.baron?.rocketVolley;
    if (!rocket) throw new Error('missing Baron rocket volley manifest');
    Object.assign(rocket, {
      damage: 11,
      radius: 3,
      cadenceSeconds: 2,
      telegraphSeconds: 0.25,
      airTime: 0.35,
      spreadRadius: 0.08,
    });
    window.__GR_TEST__?.teleport(0, 12);
    if (!window.__GR_TEST__?.placeFree('palisade', 0.8, 12, 0)) throw new Error('failed to place rocket damage target');
    window.__GR_TEST__?.spawnPack(1, 12, {
      eliteKind: 'baron',
      hpScale: 4,
      speedScale: 0.001,
      visualScale: 4,
      banner: true,
      heroPursuitRange: 45,
      buildingDamageScale: 12,
      supportBuildingDamageScale: 8,
    });
  });
  await advance(page, 0.05);
  return errors;
}

async function rocketSnapshot(page: Page): Promise<{
  hp: number;
  blastsAlive: number;
  shots: number;
  palisadeHp: number;
  rocket: ThreeGameDiagnostics['baronRocket'];
  audio: ThreeGameDiagnostics['audio'];
}> {
  return page.evaluate(() => {
    const diagnostics = window.__THREE_GAME_DIAGNOSTICS__!;
    const palisade = diagnostics.build.hp.find((entry) => entry.id === 'palisade');
    return {
      hp: diagnostics.hp,
      blastsAlive: diagnostics.arsenal.blastsAlive,
      shots: diagnostics.arsenal.blastTime + (diagnostics.build.damageByOwner[diagnostics.baronRocket.lastOwnerId] ?? 0),
      palisadeHp: palisade?.hp ?? 0,
      rocket: diagnostics.baronRocket,
      audio: diagnostics.audio,
    };
  });
}

async function volleyFingerprint(page: Page, seed: string): Promise<{ hash: string; payload: unknown; errors: ErrorBucket }> {
  const errors = await prepareKitedBaron(page, seed);
  const before = await rocketSnapshot(page);
  await advanceUntil(page, () => rocketSnapshot(page), (snapshot) => snapshot.rocket.telegraphActive);
  await advanceUntil(page, () => rocketSnapshot(page), (snapshot) => snapshot.blastsAlive >= 3);
  await advance(page, 0.42);
  const after = await rocketSnapshot(page);
  const round = (value: number) => Math.round(value * 1000) / 1000;
  const payload = {
    before: { hp: round(before.hp), palisadeHp: round(before.palisadeHp) },
    after: {
      hp: round(after.hp),
      palisadeHp: round(after.palisadeHp),
      volleys: after.rocket.volleys,
      targetKind: after.rocket.targetKind,
      lastOwnerId: after.rocket.lastOwnerId,
      target: { x: round(after.rocket.lastTarget.x), z: round(after.rocket.lastTarget.z) },
    },
  };
  return { hash: createHash('sha256').update(JSON.stringify(payload)).digest('hex'), payload, errors };
}

function memoryStorage(taken: string[], science = taken.length): MemoryStorage {
  const values = new Map<string, string>([
    [RESEARCH_STATE_KEY, JSON.stringify({ version: 1, taken, proposalSalt: 0, pinnedTarget: null })],
    [META_PROGRESS_KEY, JSON.stringify({ version: 1, tracks: { territory: 0, science, hero: 0, agent: 0 } })],
  ]);
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
    removeItem: (key) => {
      values.delete(key);
    },
  };
}

function assertNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

test('kited Baron telegraphs and launches rockets that damage hero and buildings through CombatSystem', async ({ page }, testInfo) => {
  const errors = await prepareKitedBaron(page, '057-volley', true);
  const before = await rocketSnapshot(page);

  const telegraph = await advanceUntil(page, () => rocketSnapshot(page), (snapshot) => snapshot.rocket.telegraphActive);
  expect(telegraph.rocket.cartVisible).toBe(true);
  expect(telegraph.audio.startedBySound['blast-charge-arm'] ?? 0).toBeGreaterThan(0);

  const midFlight = await advanceUntil(page, () => rocketSnapshot(page), (snapshot) => snapshot.blastsAlive >= 3);
  expect(midFlight.rocket.lastOwnerId).toMatch(/^baron_rocket:/);
  await shot(page, testInfo, 'volley-arcs');

  await advance(page, 0.42);
  const after = await rocketSnapshot(page);
  expect(after.rocket.volleys).toBe(1);
  expect(after.hp).toBeLessThan(before.hp);
  expect(after.palisadeHp).toBeLessThan(before.palisadeHp);
  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.startedBySound['blast-charge-boom'] ?? 0), { timeout: 8_000 })
    .toBeGreaterThan(0);
  await shot(page, testInfo, 'rocket-burst');
  assertNoErrors(errors);
});

test('lethal Baron rocket stops the death tick before XP and gold collection', async ({ page }) => {
  const errors = await prepareKitedBaron(page, '057-lethal-boundary');
  await advanceUntil(page, () => rocketSnapshot(page), (snapshot) => snapshot.rocket.telegraphActive);
  await advanceUntil(page, () => rocketSnapshot(page), (snapshot) => snapshot.blastsAlive >= 3);

  const before = await page.evaluate(() => {
    const harness = window.__GR_TEST__;
    if (!harness) throw new Error('missing test harness');
    const snapshot = structuredClone(harness.captureSuspend());
    const rockets = snapshot.combat.blastCharges.filter((charge) => charge.ownerId.startsWith('baron_rocket'));
    if (rockets.length < 3) throw new Error('missing in-flight Baron rocket volley');
    snapshot.hero.iframeRemaining = 0;
    for (const rocket of rockets) {
      rocket.target.x = snapshot.hero.position.x;
      rocket.target.z = snapshot.hero.position.z;
      rocket.age = Math.max(0, rocket.duration - 1 / 60);
      rocket.damage = 999;
      rocket.radius = 3;
    }
    if (!harness.restoreSuspend(snapshot)) throw new Error('failed to arm lethal rocket boundary fixture');
    if (!harness.spawnXpMote(snapshot.hero.position.x, snapshot.hero.position.z, 7)) throw new Error('failed to spawn XP fixture');
    if (!harness.spawnGoldPickup(snapshot.hero.position.x, snapshot.hero.position.z, 17)) throw new Error('failed to spawn gold fixture');
    return {
      xp: harness.state().xp,
      gold: harness.state().economy.banked,
      blasts: rockets.length,
      detonations: snapshot.combat.audit.blastDetonationCount,
    };
  });

  await advance(page, 1 / 30);
  const after = await page.evaluate(() => {
    const diagnostics = window.__THREE_GAME_DIAGNOSTICS__!;
    const harness = window.__GR_TEST__!;
    return {
      state: diagnostics.runState,
      hp: diagnostics.hp,
      xp: harness.state().xp,
      xpMotes: diagnostics.xpMotesAlive,
      gold: harness.state().economy.banked,
      goldPickups: harness.goldPickups().filter((pickup) => pickup.active),
      blasts: diagnostics.arsenal.blastsAlive,
      detonations: diagnostics.arsenal.detonations,
    };
  });

  expect(after.state).toBe('dead');
  expect(after.hp).toBe(0);
  expect(after.xp).toBe(before.xp);
  expect(after.xpMotes).toBe(1);
  expect(after.gold).toBe(before.gold);
  expect(after.goldPickups).toEqual([
    expect.objectContaining({ active: true, amount: 17 }),
  ]);
  expect(after.detonations).toBe(before.detonations + 1);
  expect(after.blasts).toBe(before.blasts - 1);
  assertNoErrors(errors);
});

test('melee range suppresses the Baron rocket volley', async ({ page }) => {
  await seedProfile(page);
  const errors = await openGame(page, '057-melee-suppressed');
  await expect(page.evaluate(() => window.__GR_TEST__?.setManualSim(true))).resolves.toBe(true);
  await page.evaluate(() => {
    const rocket = window.__GR_TEST__?.activeContract().twist.baron?.rocketVolley;
    if (!rocket) throw new Error('missing Baron rocket volley manifest');
    Object.assign(rocket, { cadenceSeconds: 0.4, telegraphSeconds: 0.1, airTime: 0.2 });
    window.__GR_TEST__?.spawnPack(1, 0.1, {
      eliteKind: 'baron',
      hpScale: 4,
      speedScale: 0,
      visualScale: 4,
      banner: true,
      heroPursuitRange: 45,
    });
  });
  await advance(page, 1.4);
  const rocket = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.baronRocket);
  expect(rocket?.suppressed).toBe(true);
  expect(rocket?.telegraphActive).toBe(false);
  expect(rocket?.volleys).toBe(0);
  assertNoErrors(errors);
});

test('defeating the Baron captures the cart, shows the medal line, and unlocks captured research', async ({ page }, testInfo) => {
  await seedProfile(page, ROCKET_PREREQS.length, ROCKET_PREREQS, ['the-claim', 'e1-dry-gulch']);
  const errors = await openGame(page, '057-capture', '&nopause');
  await expect(page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.research.taken ?? [])).resolves.not.toContain(
    SKY_ROCKET_BATTERY_NODE_ID,
  );
  await expect(page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.research.available ?? [])).resolves.not.toContain(
    SKY_ROCKET_BATTERY_NODE_ID,
  );
  await setBalance(page, 'enemy.hp', 1);
  await setBalance(page, 'sparkRig.damage', 9999);
  await setBalance(page, 'sparkRig.fireRate', 60);
  await setBalance(page, 'sparkRig.range', 300);
  await setBalance(page, 'sparkRig.boltRadius', 5);
  await page.evaluate(() =>
    window.__GR_TEST__?.spawnPack(1, 4, {
      eliteKind: 'baron',
      hpScale: 1,
      speedScale: 0.001,
      visualScale: 4,
      banner: true,
    }),
  );

  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.run.secured ?? false), { timeout: 10_000 }).toBe(true);
  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.medals.rocketCartCaptured ?? false), { timeout: 5_000 })
    .toBe(true);
  await expect(page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '{}').rocketCartCaptured, profileDataKey('robin', MEDALS_KEY))).resolves.toBe(
    true,
  );
  await expect(page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.research.taken ?? [])).resolves.not.toContain(
    SKY_ROCKET_BATTERY_NODE_ID,
  );
  await expect(page.evaluate((id) => window.__GR_TEST__?.takeResearchNode(id), SKY_ROCKET_BATTERY_NODE_ID)).resolves.toBe(true);
  await expect(page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.research.taken ?? [])).resolves.toContain(SKY_ROCKET_BATTERY_NODE_ID);
  const beat = page.getByTestId('story-beat-card');
  await showStoryBeat(page, 'sky-rocket-captured');
  await expect(beat).toHaveAttribute('data-beat-id', 'sky-rocket-captured', { timeout: 8_000 });
  await expect(beat).toContainText('sky-rocket science is captured');
  await shot(page, testInfo, 'capture-beat');
  await page.mouse.click(6, 6);
  await expect(beat).toHaveCount(0);
  await page.evaluate(() =>
    window.__GR_STORY__?.emit({ type: 'boss-defeat', contractId: 'e1-baron', contractName: 'The Claim-Jumper Baron' }),
  );
  await expect(page.getByTestId('story-beat-card')).toHaveCount(0);

  await openBoard(page);
  await openBaronBoardPage(page);
  await expect(page.getByTestId('contract-medal-e1-baron')).toContainText(ROCKET_MEDAL_LINE);
  await page.getByTestId('contract-card-e1-baron').evaluate((node) => node.scrollIntoView({ block: 'start', inline: 'nearest' }));
  await shot(page, testInfo, 'medal-rocket-cart');
  assertNoErrors(errors);
});

test('Sky-Rocket Battery requires Baron capture and preserves veteran profiles', () => {
  const capturedStorage = memoryStorage(ROCKET_PREREQS);
  const captured = loadResearchState(capturedStorage, capturedStorage, { rocketCartCaptured: true });
  expect(captured.taken).not.toContain(SKY_ROCKET_BATTERY_NODE_ID);
  expect(captured.progress.tracks.science).toBe(ROCKET_PREREQS.length);
  expect(frontierNodes(captured).map((node) => node.id)).toContain(SKY_ROCKET_BATTERY_NODE_ID);

  const uncapturedStorage = memoryStorage(ROCKET_PREREQS);
  const uncaptured = loadResearchState(uncapturedStorage, uncapturedStorage, { rocketCartCaptured: false });
  expect(uncaptured.taken).not.toContain(SKY_ROCKET_BATTERY_NODE_ID);
  expect(frontierNodes(uncaptured).map((node) => node.id)).not.toContain(SKY_ROCKET_BATTERY_NODE_ID);
  expect(renderResearchChart(uncaptured)).toContain('The Baron still holds this science.');

  const veteran = loadResearchState(memoryStorage([...ROCKET_PREREQS, SKY_ROCKET_BATTERY_NODE_ID]), undefined, { rocketCartCaptured: false });
  expect(veteran.taken).toContain(SKY_ROCKET_BATTERY_NODE_ID);

  const medalStorage = memoryStorage([]);
  medalStorage.setItem(
    PROFILE_KEY,
    JSON.stringify({
      version: 2,
      activeId: 'robin',
      profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
    }),
  );
  medalStorage.setItem(profileDataKey('robin', MEDALS_KEY), JSON.stringify({ version: 1, baronBeaten: true }));
  expect(loadMedals(medalStorage).rocketCartCaptured).toBe(true);
});

test('Baron rocket volley targeting is deterministic for the same seed', async ({ page, browser }, testInfo) => {
  const first = await volleyFingerprint(page, '057-determinism');
  const context = await browser.newContext({ viewport: page.viewportSize() ?? undefined });
  const secondPage = await context.newPage();
  const second = await volleyFingerprint(secondPage, '057-determinism');
  await context.close();

  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(
    path.join(ARTIFACT_DIR, `${testInfo.project.name}-determinism-report.json`),
    `${JSON.stringify({ first, second }, null, 2)}\n`,
  );
  expect(second.payload).toEqual(first.payload);
  expect(second.hash).toBe(first.hash);
  assertNoErrors(first.errors);
  assertNoErrors(second.errors);
});
