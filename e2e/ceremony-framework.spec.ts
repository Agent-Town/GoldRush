import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

const ARTIFACT_DIR = path.resolve('artifacts/ceremony-framework');
const T3_SHOT = path.resolve('reviews/shots-t3/valve-and-rim.png');
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
  options: { epochId?: string; scienceSteps?: number; completeMegaproject?: string } = {},
): Promise<void> {
  await page.goto('/');
  await page.evaluate(
    ({ keys, epochId, scienceSteps, completeMegaproject }) => {
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
    },
    {
      epochId: options.epochId,
      scienceSteps: options.scienceSteps,
      completeMegaproject: options.completeMegaproject,
      keys: {
        profile: PROFILE_KEY,
        town: profileDataKey('robin', TOWN_NAME_KEY),
        firstClaim: profileDataKey('robin', FIRST_CLAIM_DONE_KEY),
        meta: profileDataKey('robin', META_PROGRESS_KEY),
        activeEpoch: ACTIVE_EPOCH_KEY,
        research: options.epochId ? profileDataKey('robin', researchStateKey(options.epochId)) : 'unused',
        megaproject: profileDataKey('robin', MEGAPROJECT_STATE_KEY),
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
  await page.getByTestId('town-open-schoolhouse').click();
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
  expect(diagnostics?.registered).toEqual(['t3-the-refinery', 't4-the-boat', 't5-the-deep-reactor']);
  const ceremonyKeys = await page.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith('gr.ceremony.')));
  expect(ceremonyKeys).toEqual([]);
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
  await page.getByTestId('raise-epoch-megaproject').click();

  const receipt = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? 'null')?.projects?.refinery, MEGAPROJECT_STATE_KEY);
  expect(receipt).toEqual({ complete: true, debited: { gold: 0, bankedScience: 10 } });
  const research = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? 'null'), researchStateKey(E3));
  expect(research.steps).toBe(10);

  const door = page.getByTestId('ceremony-epoch-door');
  await expect(door).toHaveAttribute('data-door-state', 'ceremony-ready');
  await expect(door).toHaveAttribute('data-ceremony-id', 't3-the-refinery');
  await page.getByTestId('begin-ceremony').click();
  await expect.poll(async () => (await ceremonyDiagnostics(page))?.phase, { timeout: 5_000 }).toBe('open-valve');

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
  if (info.project.name === 'desktop-chrome') {
    await mkdir(path.dirname(T3_SHOT), { recursive: true });
    await page.screenshot({ path: T3_SHOT });
  }
  await expect.poll(async () => (await ceremonyDiagnostics(page))?.phase, { timeout: 10_000 }).toBe('done');
  const done = await ceremonyDiagnostics(page);
  expect(done?.beats).toEqual(expect.arrayContaining(['t3-valve-squeal', 't3-liquid-rhythm', 't3-first-cough', 't3-the-refinery:kept-image']));
  expect(done?.keptImage).toMatchObject({ captured: true, stored: true });
  expect(done?.armCount).toBe(1);
  expect(done?.armedEpochId).toBe(E4);
  expect(await page.evaluate((key) => localStorage.getItem(key), ACTIVE_EPOCH_KEY)).toBe(E4);
  expect(errors).toEqual({ console: [], page: [] });
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
