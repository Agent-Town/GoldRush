import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

const ARTIFACT_DIR = path.resolve('artifacts/ceremony-framework');
const T3_AFTER_SHOT = path.resolve('reviews/shots-ceremony-stage/one-hand-after.png');
const T3_CONTRACT_SHOT = path.resolve('reviews/shots-ceremony-stage/one-hand-contract-card.png');
const META_PROGRESS_KEY = 'gr.meta.v1';
const PROFILE_KEY = 'gr.profile.v2';
const TOWN_NAME_KEY = 'gr.town.name.v1';
const FIRST_CLAIM_DONE_KEY = 'gr.firstClaim.done.v1';
const MEGAPROJECT_STATE_KEY = 'gr.megaprojects.v1';
const ACTIVE_EPOCH_KEY = 'gr.activeEpoch.v1';
const EPOCH_CEREMONY_KEY = 'gr.epochCeremony.v1';
const E3 = 'epoch-3-voltage';
const E4 = 'epoch-4-motor';
const E5 = 'epoch-5-deepwater';
const E6 = 'epoch-6-atomic';
const E7 = 'epoch-7-signal';
const E8 = 'epoch-8-orbital';
const E9 = 'epoch-9-redfields';
const E10 = 'epoch-10-deepsky';
const E7_SIGNAL_STATE_KEY = 'gr.e7Signal.v1';
const E7_EXIT_MILESTONES = [
  'first-relay-linked',
  'first-playbook-recorded',
  'contract:e7-relay-valley',
  'contract:e7-echo-canyon',
  'contract:e7-dead-band',
  'contract:e7-relay-rush',
] as const;

type Errors = { console: string[]; page: string[] };
type ProfileState = {
  version: 2;
  activeId: string;
  profiles: Array<{ id: string; name: string; createdAt: number; updatedAt: number; difficultyPreset: 'trail'; hintsSeen: string[] }>;
};

function profileDataKey(profileId: string, logicalKey: string): string {
  return `${PROFILE_KEY}.${profileId}.${logicalKey}`;
}

function researchStateKey(epochId: string): string {
  return `gr.research.${epochId}.v1`;
}

function ceremonyKeptImageKey(ceremonyId: string): string {
  return `gr.ceremony.keptImage.v1.${ceremonyId}`;
}

function watchErrors(page: Page): Errors {
  const found: Errors = { console: [], page: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') found.console.push(message.text());
  });
  page.on('pageerror', (error) => found.page.push(error.message));
  return found;
}

/**
 * Debug-triggered ceiling: the era's science threshold met and its megaproject
 * complete, seeded straight into the stores the trigger binding reads.
 */
async function seed(
  page: Page,
  options: { epochId?: string; scienceSteps?: number; completeMegaproject?: string; e7ExitReady?: boolean } = {},
): Promise<void> {
  await page.goto('/');
  await page.evaluate(
    ({ keys, epochId, scienceSteps, completeMegaproject, e7ExitReady, e7ExitMilestones }) => {
      localStorage.clear();
      sessionStorage.clear();
      const profile: ProfileState = {
        version: 2,
        activeId: 'robin',
        profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
      };
      localStorage.setItem(keys.profile, JSON.stringify(profile));
      localStorage.setItem(keys.town, 'Quartz Hill');
      localStorage.setItem(keys.firstClaim, '1');
      localStorage.setItem(keys.meta, JSON.stringify({ version: 1, tracks: { territory: 3, science: 40, hero: 0, agent: 0 } }));
      if (epochId) localStorage.setItem(keys.activeEpoch, epochId);
      if (epochId && scienceSteps !== undefined) {
        localStorage.setItem(
          keys.research,
          JSON.stringify({ version: 1, steps: scienceSteps, metaScienceCursor: 40, taken: [], proposalSalt: 0, pinnedTarget: null }),
        );
      }
      if (completeMegaproject) {
        localStorage.setItem(keys.megaproject, JSON.stringify({ version: 1, projects: { [completeMegaproject]: { complete: true } } }));
      }
      if (e7ExitReady) localStorage.setItem(keys.e7Signal, JSON.stringify({ version: 1, milestones: e7ExitMilestones }));
    },
    {
      epochId: options.epochId,
      scienceSteps: options.scienceSteps,
      completeMegaproject: options.completeMegaproject,
      e7ExitReady: options.e7ExitReady,
      e7ExitMilestones: E7_EXIT_MILESTONES,
      keys: {
        profile: PROFILE_KEY,
        town: profileDataKey('robin', TOWN_NAME_KEY),
        firstClaim: profileDataKey('robin', FIRST_CLAIM_DONE_KEY),
        meta: profileDataKey('robin', META_PROGRESS_KEY),
        activeEpoch: ACTIVE_EPOCH_KEY,
        research: options.epochId ? profileDataKey('robin', researchStateKey(options.epochId)) : 'unused',
        megaproject: profileDataKey('robin', MEGAPROJECT_STATE_KEY),
        e7Signal: profileDataKey('robin', E7_SIGNAL_STATE_KEY),
      },
    },
  );
  await page.reload();
}

async function openSchoolhouse(page: Page): Promise<void> {
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.keyboard.down('KeyA');
  await page.waitForTimeout(900);
  await page.keyboard.up('KeyA');
  await page.keyboard.down('KeyS');
  await page.waitForTimeout(500);
  await page.keyboard.up('KeyS');
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt), { timeout: 8_000 }).toBe('schoolhouse');
  const opener = page.getByTestId('town-open-schoolhouse');
  await expect(opener).toBeVisible();
  await expect(opener).toBeEnabled();
  const box = await opener.boundingBox();
  if (!box) throw new Error('schoolhouse opener has no clickable bounds');
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page.getByTestId('schoolhouse-view')).toBeVisible();
}

function ceremonyDiagnostics(page: Page) {
  return page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.ceremony ?? null);
}

async function shot(page: Page, info: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${info.project.name}-${name}.png`) });
}

/** Tap the rhythm hand inside open pull windows until `target` good pulls land. */
async function pullUntil(page: Page, target: number, counter: 'goodPulls' | 'passPulls'): Promise<void> {
  const hand = page.getByTestId('ceremony-hand-input');
  for (let safety = 0; safety < 200; safety += 1) {
    const state = await page.evaluate(() => {
      const ceremony = window.__GR_TOWN_DIAGNOSTICS__?.ceremony;
      return ceremony?.hand ? { open: ceremony.hand.windowOpen, good: ceremony.hand.goodPulls, pass: ceremony.hand.passPulls } : null;
    });
    if (!state) throw new Error('ceremony hand diagnostics missing');
    const count = counter === 'goodPulls' ? state.good : state.pass;
    if (count >= target) return;
    if (state.open) {
      await hand.dispatchEvent('pointerdown');
      await hand.dispatchEvent('pointerup');
      await page.waitForTimeout(120);
    } else {
      await page.waitForTimeout(60);
    }
  }
  throw new Error(`rhythm never reached ${target} ${counter}`);
}

test('plain boot: the framework sits inert — legacy doors, no overlay, no writes', async ({ page }) => {
  const errors = watchErrors(page);
  await seed(page); // E1 fresh profile: no ceiling, no megaproject, no epoch override.
  await openSchoolhouse(page);
  await expect(page.getByTestId('ceremony-epoch-door')).toHaveCount(0);
  await expect(page.getByTestId('ceremony-layer')).toBeHidden();
  const diagnostics = await ceremonyDiagnostics(page);
  expect(diagnostics).toMatchObject({ doorState: 'legacy', open: false, armCount: 0, armableId: null });
  expect(diagnostics?.registered).toEqual(['t3-the-refinery', 't4-the-boat', 't5-the-deep-reactor', 't6-the-calculating-house', 't7-the-starship', 't8-the-colony-seed', 't9-the-generation-ark']);
  const ceremonyKeys = await page.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith('gr.ceremony.')));
  expect(ceremonyKeys).toEqual([]);
  expect(errors).toEqual({ console: [], page: [] });
});

test('stage plates bind by tier filename and an absent plate keeps the primitive fallback', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('/');
  const probe = await page.evaluate(async () => {
    const stages = (await Function('return import("/src/ceremony/stages.ts")')()) as typeof import('../src/ceremony/stages');
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 18;
    const ctx = canvas.getContext('2d')!;
    stages.drawCeremonyStage(ctx, canvas.width, canvas.height, {
      script: { id: 't99-unpainted', title: 'Fallback', phases: [{ id: 'wait', direction: 'Wait here.' }] },
      phaseId: 'wait',
      phaseElapsedMs: 0,
      phaseDurationMs: 0,
      elapsedMs: 0,
      hand: {
        held: false,
        holdFraction: 0,
        convoyPositions: [],
        routeFraction: 0,
        goodPulls: 0,
        pullsRequired: 0,
        windowOpen: false,
        windowFraction: 0,
        passPulls: 0,
        lastPullAgoMs: 0,
      },
    } as never);
    return {
      t3: stages.ceremonyStageBackdropUrl('t3-the-refinery'),
      missing: stages.ceremonyStageBackdropUrl('t99-unpainted'),
      fallbackAlpha: ctx.getImageData(0, 0, 1, 1).data[3],
    };
  });
  expect(probe.t3).toMatch(/ceremony-stage-t3.*\.png/);
  expect(probe.missing).toBeNull();
  expect(probe.fallbackAlpha).toBe(255);
  expect(errors).toEqual({ console: [], page: [] });
});

test('T3 THE REFINERY: the manifest purchase debits its exact cost and the valve hand alone arms E4', async ({ page }, info) => {
  test.setTimeout(120_000);
  const errors = watchErrors(page);
  await seed(page, { epochId: E3, scienceSteps: 10 });
  await openSchoolhouse(page);

  const buildDoor = page.getByTestId('epoch-megaproject-door');
  await expect(buildDoor).toHaveAttribute('data-megaproject-id', 'refinery');
  await expect(buildDoor).toHaveAttribute('data-door-state', 'ready');
  if (info.project.name === 'desktop-chrome') {
    await mkdir(path.dirname(T3_CONTRACT_SHOT), { recursive: true });
    await page.screenshot({ path: T3_CONTRACT_SHOT });
  }
  await page.getByTestId('raise-epoch-megaproject').click();

  const receipt = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? 'null')?.projects?.refinery, MEGAPROJECT_STATE_KEY);
  expect(receipt).toEqual({ complete: true, debited: { gold: 0, bankedScience: 10 } });
  const research = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? 'null'), researchStateKey(E3));
  expect(research.steps).toBe(10);

  const door = page.getByTestId('ceremony-epoch-door');
  await expect(door).toHaveAttribute('data-door-state', 'ceremony-ready');
  await expect(door).toHaveAttribute('data-ceremony-id', 't3-the-refinery');
  await page.getByTestId('begin-ceremony').click();
  const frame = page.locator('.ceremony-frame');
  await expect(frame).toHaveClass(/town-ui__board-shell/);
  await expect(page.getByTestId('ceremony-hand-input')).toHaveClass(/death-overlay__button/);
  await expect(page.getByTestId('ceremony-leave')).toHaveClass(/death-overlay__button--secondary/);
  const stage = page.getByTestId('ceremony-stage');
  await expect(stage).toHaveAttribute('data-stage-src', /ceremony-stage-t3.*\.png/);
  await expect(stage).toHaveAttribute('data-asset-state', 'ready');
  await expect.poll(async () => (await ceremonyDiagnostics(page))?.phase, { timeout: 5_000 }).toBe('open-valve');
  if (info.project.name === 'desktop-chrome') {
    await mkdir(path.dirname(T3_AFTER_SHOT), { recursive: true });
    await page.screenshot({ path: T3_AFTER_SHOT });
  }

  await page.waitForTimeout(2_000);
  expect((await ceremonyDiagnostics(page))?.phase).toBe('open-valve');
  expect((await ceremonyDiagnostics(page))?.hand?.holdMs).toBe(0);
  expect((await ceremonyDiagnostics(page))?.armCount).toBe(0);
  expect(await page.evaluate((key) => localStorage.getItem(key), ACTIVE_EPOCH_KEY)).toBe(E3);

  const hand = page.getByTestId('ceremony-hand-input');
  await hand.dispatchEvent('pointerdown');
  await expect.poll(async () => (await ceremonyDiagnostics(page))?.phase, { timeout: 8_000 }).not.toBe('open-valve');
  expect((await ceremonyDiagnostics(page))?.hand?.holdMs).toBeGreaterThanOrEqual(1_400);
  await hand.dispatchEvent('pointerup');
  await expect.poll(async () => (await ceremonyDiagnostics(page))?.phase, { timeout: 15_000 }).toBe('rim');
  await expect.poll(async () => (await ceremonyDiagnostics(page))?.phase, { timeout: 10_000 }).toBe('done');
  const done = await ceremonyDiagnostics(page);
  expect(done?.beats).toEqual(expect.arrayContaining(['t3-valve-squeal', 't3-liquid-rhythm', 't3-first-cough', 't3-the-refinery:kept-image']));
  expect(done?.keptImage).toMatchObject({ captured: true, stored: true });
  expect(done?.armCount).toBe(1);
  expect(done?.armedEpochId).toBe(E4);
  expect(await page.evaluate((key) => localStorage.getItem(key), ACTIVE_EPOCH_KEY)).toBe(E4);
  expect(errors).toEqual({ console: [], page: [] });
});

test('generated ceremony and boss audio resolves through the manifest', async ({ page }) => {
  await page.goto('/');
  const names = [
    't4-first-wave',
    't4-engines-loop',
    't4-wind',
    't5-winch-rhythm',
    't5-deep-hum-loop',
    't5-surfacing',
    'dredge-queen-arrival-horn',
    'homemaker-done-chime',
    'old-digger-tape-swap',
    'e5-deepwater-ambience-loop',
  ] as const;

  const resolved = await page.evaluate(async (soundNames) => {
    const audio = (await Function('return import("/src/audio/manifest.ts")')()) as typeof import('../src/audio/manifest');
    return Promise.all(soundNames.map(async (name) => {
      const load = audio.soundUrlLoader(name);
      const url = await load?.();
      return { name, file: audio.soundManifest[name].file, ok: url ? (await fetch(url)).ok : false };
    }));
  }, names);

  expect(resolved).toEqual(names.map((name) => ({ name, file: `${name}.mp3`, ok: true })));
});

test('T4 THE BOAT: the ceiling arms the door, the HAND gates the crest, the era arms exactly once through the seam', async ({ page }, info) => {
  test.setTimeout(120_000);
  const errors = watchErrors(page);
  await seed(page, { epochId: E4, scienceSteps: 12, completeMegaproject: 'the-boat' });
  await openSchoolhouse(page);

  const door = page.getByTestId('ceremony-epoch-door');
  await expect(door).toHaveAttribute('data-door-state', 'ceremony-ready');
  await expect(door).toHaveAttribute('data-ceremony-id', 't4-the-boat');
  await shot(page, info, 't4-door-ready');

  await page.getByTestId('begin-ceremony').click();
  const layer = page.getByTestId('ceremony-layer');
  await expect(layer).toBeVisible();
  await expect(layer).toHaveAttribute('data-ceremony-id', 't4-the-boat');
  await expect.poll(async () => (await ceremonyDiagnostics(page))?.phase, { timeout: 5_000 }).toBe('haul');

  // PLAYED, NOT WATCHED: with no hand on the wheel, nothing moves and nothing arms.
  await page.waitForTimeout(2_500);
  const idle = await ceremonyDiagnostics(page);
  expect(idle?.phase).toBe('haul');
  expect(idle?.convoy?.fraction ?? 1).toBeLessThan(0.01);
  expect(idle?.armCount).toBe(0);
  expect(await page.evaluate((key) => localStorage.getItem(key), ACTIVE_EPOCH_KEY)).toBe(E4);
  await shot(page, info, 't4-hand-waits');

  // The drive: hold the hand input; the convoy follows the lead Flivver.
  const hand = page.getByTestId('ceremony-hand-input');
  await hand.dispatchEvent('pointerdown');
  await expect
    .poll(async () => (await ceremonyDiagnostics(page))?.phase, { timeout: 20_000, message: 'the haul never crested' })
    .not.toBe('haul');
  await hand.dispatchEvent('pointerup');
  await shot(page, info, 't4-crest');

  await expect.poll(async () => (await ceremonyDiagnostics(page))?.phase, { timeout: 20_000 }).toBe('done');
  await shot(page, info, 't4-done');

  const done = await ceremonyDiagnostics(page);
  expect(done?.beats).toEqual(expect.arrayContaining(['t4-engines', 't4-wind', 't4-nothing', 't4-first-wave', 't4-the-boat:kept-image']));
  expect(done?.keptImage).toMatchObject({ captured: true, stored: true });
  expect(done?.armCount).toBe(1);
  expect(done?.armedEpochId).toBe(E5);
  expect(done?.armFailure).toBeNull();

  // The kept image is stored and tagged for the era's ledger page.
  const keptImage = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key) ?? 'null'),
    ceremonyKeptImageKey('t4-the-boat'),
  );
  expect(keptImage).toMatchObject({ version: 1, ceremonyId: 't4-the-boat', epochId: E4, successorId: E5, stored: true });
  expect(keptImage.dataUrl).toMatch(/^data:image\/png/);

  // The era armed through the EXISTING seam, exactly once: the pointer moved,
  // the ceremony key moved, and a second activateEpoch is refused.
  expect(await page.evaluate((key) => localStorage.getItem(key), ACTIVE_EPOCH_KEY)).toBe(E5);
  expect(await page.evaluate((key) => localStorage.getItem(key), EPOCH_CEREMONY_KEY)).toBe(E5);
  expect(
    await page.evaluate(async (epoch) => {
      const registry = (await Function('return import("/src/meta/ContractFamilies.ts")')()) as typeof import('../src/meta/ContractFamilies');
      return registry.activateEpoch(epoch);
    }, E5),
  ).toBe(false);

  await page.getByTestId('ceremony-return').click();
  await expect(layer).toBeHidden();
  expect(errors).toEqual({ console: [], page: [] });
});

test('T5 THE DEEP REACTOR: the rhythm gates the raise, the pass keeps the hand involved, the era arms exactly once', async ({ page }, info) => {
  test.setTimeout(120_000);
  const errors = watchErrors(page);
  await seed(page, { epochId: E5, scienceSteps: 14, completeMegaproject: 'deep-reactor' });
  await openSchoolhouse(page);

  const door = page.getByTestId('ceremony-epoch-door');
  await expect(door).toHaveAttribute('data-door-state', 'ceremony-ready');
  await expect(door).toHaveAttribute('data-ceremony-id', 't5-the-deep-reactor');

  await page.getByTestId('begin-ceremony').click();
  const layer = page.getByTestId('ceremony-layer');
  await expect(layer).toBeVisible();
  await expect.poll(async () => (await ceremonyDiagnostics(page))?.phase, { timeout: 5_000 }).toBe('the-raise');

  // PLAYED, NOT WATCHED: no pulls, no raise, no era.
  await page.waitForTimeout(2_500);
  const idle = await ceremonyDiagnostics(page);
  expect(idle?.phase).toBe('the-raise');
  expect(idle?.hand?.goodPulls).toBe(0);
  expect(idle?.armCount).toBe(0);
  expect(await page.evaluate((key) => localStorage.getItem(key), ACTIVE_EPOCH_KEY)).toBe(E5);
  await shot(page, info, 't5-rhythm-waits');

  // The raise: six timed pulls, all hulls one line.
  await pullUntil(page, 6, 'goodPulls');
  await expect.poll(async () => (await ceremonyDiagnostics(page))?.phase, { timeout: 10_000 }).toBe('homecoming-pass');
  await shot(page, info, 't5-surfacing');

  // The homecoming pass stages ON while the rhythm continues under it: the
  // pass duration alone cannot finish it — the hand must stay in.
  await page.waitForTimeout(5_000);
  const passHeld = await ceremonyDiagnostics(page);
  expect(passHeld?.phase).toBe('homecoming-pass');
  expect(passHeld?.armCount).toBe(0);

  await pullUntil(page, 3, 'passPulls');
  await expect.poll(async () => (await ceremonyDiagnostics(page))?.phase, { timeout: 20_000 }).toBe('done');
  await shot(page, info, 't5-done');

  const done = await ceremonyDiagnostics(page);
  expect(done?.beats).toEqual(
    expect.arrayContaining(['t5-rope-and-water', 't5-the-hum', 't5-era-layer-flats', 't5-era-layer-river-bend', 't5-the-deep-reactor:kept-image']),
  );
  expect(done?.keptImage).toMatchObject({ captured: true, stored: true });
  expect(done?.armCount).toBe(1);
  expect(done?.armedEpochId).toBe(E6);

  expect(await page.evaluate((key) => localStorage.getItem(key), ACTIVE_EPOCH_KEY)).toBe(E6);
  expect(
    await page.evaluate(async (epoch) => {
      const registry = (await Function('return import("/src/meta/ContractFamilies.ts")')()) as typeof import('../src/meta/ContractFamilies');
      return registry.activateEpoch(epoch);
    }, E6),
  ).toBe(false);

  await page.getByTestId('ceremony-return').click();
  await expect(layer).toBeHidden();
  expect(errors).toEqual({ console: [], page: [] });
});

test('T6 THE CALCULATING HOUSE: mounting the plate arms E7 exactly once and the era survives reload', async ({ page }, info) => {
  test.setTimeout(120_000);
  const errors = watchErrors(page);
  await seed(page, { epochId: E6, scienceSteps: 16, completeMegaproject: 'calculating-house' });
  await openSchoolhouse(page);

  const door = page.getByTestId('ceremony-epoch-door');
  await expect(door).toHaveAttribute('data-door-state', 'ceremony-ready');
  await expect(door).toHaveAttribute('data-ceremony-id', 't6-the-calculating-house');
  await shot(page, info, 't6-door-ready');

  await page.getByTestId('begin-ceremony').click();
  const layer = page.getByTestId('ceremony-layer');
  await expect(layer).toBeVisible();
  await expect(layer).toHaveAttribute('data-ceremony-id', 't6-the-calculating-house');
  await expect.poll(async () => (await ceremonyDiagnostics(page))?.phase, { timeout: 5_000 }).toBe('mount-plate');

  // PLAYED, NOT WATCHED: the House waits for the player's deliberate hand.
  await page.waitForTimeout(2_500);
  const idle = await ceremonyDiagnostics(page);
  expect(idle?.phase).toBe('mount-plate');
  expect(idle?.hand?.holdMs).toBe(0);
  expect(idle?.armCount).toBe(0);
  expect(await page.evaluate((key) => localStorage.getItem(key), ACTIVE_EPOCH_KEY)).toBe(E6);
  await shot(page, info, 't6-hand-waits');

  const hand = page.getByTestId('ceremony-hand-input');
  await hand.dispatchEvent('pointerdown');
  await expect.poll(async () => (await ceremonyDiagnostics(page))?.phase, { timeout: 8_000 }).not.toBe('mount-plate');
  await hand.dispatchEvent('pointerup');
  await expect.poll(async () => (await ceremonyDiagnostics(page))?.phase, { timeout: 15_000 }).toBe('done');
  await shot(page, info, 't6-done');

  const done = await ceremonyDiagnostics(page);
  expect(done?.beats).toEqual(
    expect.arrayContaining(['t6-boot-rhythm', 't6-telegraph-click', 't6-click-chord', 't6-more-voices', 't6-the-calculating-house:kept-image']),
  );
  expect(done?.keptImage).toMatchObject({ captured: true, stored: true });
  expect(done?.armCount).toBe(1);
  expect(done?.armedEpochId).toBe(E7);
  expect(done?.armFailure).toBeNull();

  const keptImage = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key) ?? 'null'),
    ceremonyKeptImageKey('t6-the-calculating-house'),
  );
  expect(keptImage).toMatchObject({
    version: 1,
    ceremonyId: 't6-the-calculating-house',
    epochId: E6,
    successorId: E7,
    caption: "The plate above the door, the dial's light on the crowd — the Prospector front row.",
    stored: true,
  });
  expect(keptImage.dataUrl).toMatch(/^data:image\/png/);

  expect(await page.evaluate((key) => localStorage.getItem(key), ACTIVE_EPOCH_KEY)).toBe(E7);
  expect(await page.evaluate((key) => localStorage.getItem(key), EPOCH_CEREMONY_KEY)).toBe(E7);
  expect(
    await page.evaluate(async (epoch) => {
      const registry = (await Function('return import("/src/meta/ContractFamilies.ts")')()) as typeof import('../src/meta/ContractFamilies');
      return registry.activateEpoch(epoch);
    }, E7),
  ).toBe(false);

  await page.getByTestId('ceremony-return').click();
  await expect(layer).toBeHidden();
  await page.reload();
  expect(
    await page.evaluate(async () => {
      const registry = (await Function('return import("/src/meta/ContractFamilies.ts")')()) as typeof import('../src/meta/ContractFamilies');
      return registry.activeEpochId();
    }),
  ).toBe(E7);
  expect(await page.evaluate((key) => localStorage.getItem(key), ACTIVE_EPOCH_KEY)).toBe(E7);
  expect(await page.evaluate((key) => localStorage.getItem(key), EPOCH_CEREMONY_KEY)).toBe(E7);
  expect(errors).toEqual({ console: [], page: [] });
});

test('T7 THE STARSHIP: the door waits for the Signal exit beat', async ({ page }) => {
  const errors = watchErrors(page);
  await seed(page, { epochId: E7, scienceSteps: 18, completeMegaproject: 'the-starship' });
  await openSchoolhouse(page);

  const door = page.getByTestId('ceremony-epoch-door');
  await expect(door).toHaveAttribute('data-ceremony-id', 't7-the-starship');
  await expect(door).toHaveAttribute('data-door-state', 'needs-exit-beat');
  await expect(door).toContainText('last frequency goes dark');
  await expect(page.getByTestId('begin-ceremony')).toHaveCount(0);
  expect(await ceremonyDiagnostics(page)).toMatchObject({ doorState: 'needs-exit-beat', armableId: null, armCount: 0 });
  expect(errors).toEqual({ console: [], page: [] });
});

test('T7 THE STARSHIP: the umbilical hand alone arms E8 exactly once and the kept era survives reload', async ({ page }, info) => {
  test.setTimeout(120_000);
  const errors = watchErrors(page);
  await seed(page, { epochId: E7, scienceSteps: 18, completeMegaproject: 'the-starship', e7ExitReady: true });
  await openSchoolhouse(page);

  const door = page.getByTestId('ceremony-epoch-door');
  await expect(door).toHaveAttribute('data-door-state', 'ceremony-ready');
  await expect(door).toHaveAttribute('data-ceremony-id', 't7-the-starship');
  await shot(page, info, 't7-door-ready');

  await page.getByTestId('begin-ceremony').click();
  const layer = page.getByTestId('ceremony-layer');
  await expect(layer).toBeVisible();
  await expect(layer).toHaveAttribute('data-ceremony-id', 't7-the-starship');
  await expect.poll(async () => (await ceremonyDiagnostics(page))?.phase, { timeout: 8_000 }).toBe('release-umbilical');

  // PLAYED, NOT WATCHED: the ship cannot count down until the player releases it.
  await page.waitForTimeout(2_000);
  const idle = await ceremonyDiagnostics(page);
  expect(idle?.phase).toBe('release-umbilical');
  expect(idle?.hand?.holdMs).toBe(0);
  expect(idle?.armCount).toBe(0);
  expect(await page.evaluate((key) => localStorage.getItem(key), ACTIVE_EPOCH_KEY)).toBe(E7);

  const hand = page.getByTestId('ceremony-hand-input');
  await hand.dispatchEvent('pointerdown');
  await page.waitForTimeout(1_700);
  await hand.dispatchEvent('pointerup');
  await expect.poll(async () => (await ceremonyDiagnostics(page))?.hand?.holdMs).toBe(0);
  expect((await ceremonyDiagnostics(page))?.phase).toBe('release-umbilical');

  await hand.dispatchEvent('pointerdown');
  await page.waitForTimeout(1_100);
  expect((await ceremonyDiagnostics(page))?.phase).toBe('release-umbilical');
  expect((await ceremonyDiagnostics(page))?.hand?.holdMs).toBeGreaterThanOrEqual(900);
  await hand.dispatchEvent('pointerup');
  await expect.poll(async () => (await ceremonyDiagnostics(page))?.phase, { timeout: 8_000 }).toBe('countdown');
  await shot(page, info, 't7-countdown');

  await expect.poll(async () => (await ceremonyDiagnostics(page))?.phase, { timeout: 15_000 }).toBe('done');
  const done = await ceremonyDiagnostics(page);
  expect(done?.beats).toEqual(
    expect.arrayContaining([
      't7-pad-silence',
      't7-umbilical-release',
      't7-chief-five',
      't7-chief-two',
      't7-engines-on-one',
      't7-the-starship:kept-image',
    ]),
  );
  expect(done?.keptImage).toMatchObject({ captured: true, stored: true });
  expect(done?.armCount).toBe(1);
  expect(done?.armedEpochId).toBe(E8);
  expect(done?.armFailure).toBeNull();

  const keptImage = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key) ?? 'null'),
    ceremonyKeptImageKey('t7-the-starship'),
  );
  expect(keptImage).toMatchObject({ version: 1, ceremonyId: 't7-the-starship', epochId: E7, successorId: E8, stored: true });
  expect(keptImage.dataUrl).toMatch(/^data:image\/png/);
  expect(await page.evaluate((key) => localStorage.getItem(key), ACTIVE_EPOCH_KEY)).toBe(E8);
  expect(await page.evaluate((key) => localStorage.getItem(key), EPOCH_CEREMONY_KEY)).toBe(E8);
  expect(
    await page.evaluate(async (epoch) => {
      const registry = (await Function('return import("/src/meta/ContractFamilies.ts")')()) as typeof import('../src/meta/ContractFamilies');
      return registry.activateEpoch(epoch);
    }, E8),
  ).toBe(false);

  await page.getByTestId('ceremony-return').click();
  await expect(layer).toBeHidden();
  await page.reload();
  await expect.poll(async () => page.evaluate(async () => {
    const registry = (await Function('return import("/src/meta/ContractFamilies.ts")')()) as typeof import('../src/meta/ContractFamilies');
    return registry.activeEpochId();
  })).toBe(E8);
  expect(await page.evaluate((key) => localStorage.getItem(key), EPOCH_CEREMONY_KEY)).toBe(E8);
  expect(errors).toEqual({ console: [], page: [] });
});

test('T8 THE COLONY SEED: the Riverward naming hand alone arms E9 and survives reload', async ({ page }, info) => {
  test.setTimeout(120_000);
  const errors = watchErrors(page);
  await seed(page, { epochId: E8, scienceSteps: 20, completeMegaproject: 'colony-seed' });
  await openSchoolhouse(page);

  const door = page.getByTestId('ceremony-epoch-door');
  await expect(door).toHaveAttribute('data-door-state', 'ceremony-ready');
  await expect(door).toHaveAttribute('data-ceremony-id', 't8-the-colony-seed');
  await shot(page, info, 't8-door-ready');

  await page.getByTestId('begin-ceremony').click();
  const layer = page.getByTestId('ceremony-layer');
  await expect(layer).toBeVisible();
  await expect(layer).toHaveAttribute('data-ceremony-id', 't8-the-colony-seed');
  await expect.poll(async () => (await ceremonyDiagnostics(page))?.phase, { timeout: 5_000 }).toBe('name-the-seed');

  // PLAYED, NOT WATCHED: time and a wrong name cannot move the Seed or arm E9.
  const name = page.getByTestId('ceremony-name-input');
  await expect(name).toHaveValue('THE RIVERWARD');
  await page.waitForTimeout(2_500);
  expect((await ceremonyDiagnostics(page))?.phase).toBe('name-the-seed');
  expect((await ceremonyDiagnostics(page))?.armCount).toBe(0);
  expect(await page.evaluate((key) => localStorage.getItem(key), ACTIVE_EPOCH_KEY)).toBe(E8);
  await name.fill('THE DUSTWARD');
  await page.getByTestId('ceremony-hand-input').click();
  await page.waitForTimeout(500);
  expect((await ceremonyDiagnostics(page))?.phase).toBe('name-the-seed');
  expect((await ceremonyDiagnostics(page))?.armCount).toBe(0);
  await shot(page, info, 't8-hand-waits');

  await name.fill('THE RIVERWARD');
  await name.press('Tab');
  await expect(page.getByTestId('ceremony-hand-input')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect.poll(async () => (await ceremonyDiagnostics(page))?.phase, { timeout: 20_000 }).toBe('done');
  await expect(name).toBeHidden();
  await shot(page, info, 't8-done');

  const done = await ceremonyDiagnostics(page);
  expect(done?.beats).toEqual(
    expect.arrayContaining([
      't8-suit-breath',
      't8-radio-silence',
      't8-flare-code-whistle',
      't8-long-burn',
      't8-the-colony-seed:kept-image',
    ]),
  );
  expect(done?.keptImage).toMatchObject({ captured: true, stored: true });
  expect(done?.armCount).toBe(1);
  expect(done?.armedEpochId).toBe(E9);
  expect(done?.armFailure).toBeNull();

  const keptImage = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key) ?? 'null'),
    ceremonyKeptImageKey('t8-the-colony-seed'),
  );
  expect(keptImage).toMatchObject({
    version: 1,
    ceremonyId: 't8-the-colony-seed',
    epochId: E8,
    successorId: E9,
    caption: 'The red dot above the dome cluster; below it, everyone already working.',
    stored: true,
  });
  expect(keptImage.dataUrl).toMatch(/^data:image\/png/);

  expect(await page.evaluate((key) => localStorage.getItem(key), ACTIVE_EPOCH_KEY)).toBe(E9);
  expect(await page.evaluate((key) => localStorage.getItem(key), EPOCH_CEREMONY_KEY)).toBe(E9);
  expect(
    await page.evaluate(async (epoch) => {
      const registry = (await Function('return import("/src/meta/ContractFamilies.ts")')()) as typeof import('../src/meta/ContractFamilies');
      return registry.activateEpoch(epoch);
    }, E9),
  ).toBe(false);

  await page.reload();
  await expect(page.getByTestId('start-menu-enter-town')).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), ACTIVE_EPOCH_KEY)).toBe(E9);
  expect(await page.evaluate((key) => localStorage.getItem(key), EPOCH_CEREMONY_KEY)).toBe(E9);
  expect(
    await page.evaluate(async (epoch) => {
      const registry = (await Function('return import("/src/meta/ContractFamilies.ts")')()) as typeof import('../src/meta/ContractFamilies');
      return { active: registry.activeEpochId(), unlocked: registry.epochIsActive(epoch) };
    }, E9),
  ).toEqual({ active: E9, unlocked: true });
  expect(errors).toEqual({ console: [], page: [] });
});

test('T9 THE GENERATION ARK: carrying the tree seed alone arms E10 and survives reload', async ({ page }, info) => {
  test.setTimeout(120_000);
  const errors = watchErrors(page);
  await seed(page, { epochId: E9, scienceSteps: 22, completeMegaproject: 'generation-ark' });
  await openSchoolhouse(page);

  const door = page.getByTestId('ceremony-epoch-door');
  await expect(door).toHaveAttribute('data-door-state', 'ceremony-ready');
  await expect(door).toHaveAttribute('data-ceremony-id', 't9-the-generation-ark');
  await shot(page, info, 't9-door-ready');

  await page.getByTestId('begin-ceremony').click();
  const layer = page.getByTestId('ceremony-layer');
  await expect(layer).toBeVisible();
  await expect(layer).toHaveAttribute('data-ceremony-id', 't9-the-generation-ark');
  await expect.poll(async () => (await ceremonyDiagnostics(page))?.phase, { timeout: 5_000 }).toBe('carry-tree-seed');

  // PLAYED, NOT WATCHED: the seed-tin and era stay put until the player walks.
  await page.waitForTimeout(2_500);
  const idle = await ceremonyDiagnostics(page);
  expect(idle?.phase).toBe('carry-tree-seed');
  expect(idle?.convoy?.fraction ?? 1).toBeLessThan(0.01);
  expect(idle?.armCount).toBe(0);
  expect(await page.evaluate((key) => localStorage.getItem(key), ACTIVE_EPOCH_KEY)).toBe(E9);
  await shot(page, info, 't9-hand-waits');

  const hand = page.getByTestId('ceremony-hand-input');
  await hand.dispatchEvent('pointerdown');
  await expect
    .poll(async () => (await ceremonyDiagnostics(page))?.phase, { timeout: 20_000, message: 'the tree seed never reached the Ark' })
    .not.toBe('carry-tree-seed');
  await hand.dispatchEvent('pointerup');
  await expect.poll(async () => (await ceremonyDiagnostics(page))?.phase, { timeout: 20_000 }).toBe('done');
  await shot(page, info, 't9-done');

  const done = await ceremonyDiagnostics(page);
  expect(done?.beats).toEqual(
    expect.arrayContaining(['t9-canals-running', 't9-departure-horn', 't9-ramps-close', 't9-the-generation-ark:kept-image']),
  );
  expect(done?.keptImage).toMatchObject({ captured: true, stored: true });
  expect(done?.armCount).toBe(1);
  expect(done?.armedEpochId).toBe(E10);
  expect(done?.armFailure).toBeNull();

  const keptImage = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key) ?? 'null'),
    ceremonyKeptImageKey('t9-the-generation-ark'),
  );
  expect(keptImage).toMatchObject({
    version: 1,
    ceremonyId: 't9-the-generation-ark',
    epochId: E9,
    successorId: E10,
    caption: 'From the ramp: the basin green, the Digger working, one old man waving with a stopped watch in his other hand.',
    stored: true,
  });
  expect(keptImage.dataUrl).toMatch(/^data:image\/png/);

  expect(await page.evaluate((key) => localStorage.getItem(key), ACTIVE_EPOCH_KEY)).toBe(E10);
  expect(await page.evaluate((key) => localStorage.getItem(key), EPOCH_CEREMONY_KEY)).toBe(E10);
  expect(
    await page.evaluate(async (epoch) => {
      const registry = (await Function('return import("/src/meta/ContractFamilies.ts")')()) as typeof import('../src/meta/ContractFamilies');
      return registry.activateEpoch(epoch);
    }, E10),
  ).toBe(false);

  await page.reload();
  await expect(page.getByTestId('start-menu-enter-town')).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), ACTIVE_EPOCH_KEY)).toBe(E10);
  expect(await page.evaluate((key) => localStorage.getItem(key), EPOCH_CEREMONY_KEY)).toBe(E10);
  expect(
    await page.evaluate(async (epoch) => {
      const registry = (await Function('return import("/src/meta/ContractFamilies.ts")')()) as typeof import('../src/meta/ContractFamilies');
      return { active: registry.activeEpochId(), unlocked: registry.epochIsActive(epoch) };
    }, E10),
  ).toEqual({ active: E10, unlocked: true });
  expect(errors).toEqual({ console: [], page: [] });
});

test('the ceremony can be stepped out of before arming and replayed — the door is derived, never consumed', async ({ page }) => {
  test.setTimeout(90_000);
  const errors = watchErrors(page);
  await seed(page, { epochId: E4, scienceSteps: 12, completeMegaproject: 'the-boat' });
  await openSchoolhouse(page);
  await page.getByTestId('begin-ceremony').click();
  await expect(page.getByTestId('ceremony-layer')).toBeVisible();
  await page.getByTestId('ceremony-leave').click();
  await expect(page.getByTestId('ceremony-layer')).toBeHidden();
  expect(await page.evaluate((key) => localStorage.getItem(key), ACTIVE_EPOCH_KEY)).toBe(E4);
  expect((await ceremonyDiagnostics(page))?.armCount).toBe(0);

  // The door still stands; the ceremony replays from the top. The player is
  // still in the town beside the schoolhouse — reopen it where they stand.
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt), { timeout: 8_000 }).toBe('schoolhouse');
  await page.getByTestId('town-open-schoolhouse').click();
  await expect(page.getByTestId('ceremony-epoch-door')).toHaveAttribute('data-door-state', 'ceremony-ready');
  await page.getByTestId('begin-ceremony').click();
  await expect(page.getByTestId('ceremony-layer')).toBeVisible();
  await expect.poll(async () => (await ceremonyDiagnostics(page))?.phase, { timeout: 5_000 }).toBe('haul');
  expect(errors).toEqual({ console: [], page: [] });
});

test('the T4 door reports missing science below the ceiling', async ({ page }) => {
  const errors = watchErrors(page);
  await seed(page, { epochId: E4, scienceSteps: 11, completeMegaproject: 'the-boat' });
  await openSchoolhouse(page);
  const door = page.getByTestId('ceremony-epoch-door');
  await expect(door).toHaveAttribute('data-door-state', 'needs-science');
  await expect(door).toContainText('1 more science');
  await expect(page.getByTestId('begin-ceremony')).toHaveCount(0);
  expect(errors).toEqual({ console: [], page: [] });
});
