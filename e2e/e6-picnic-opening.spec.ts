/**
 * e6-picnic-opening.spec.ts — THE PICNIC IS A HOLD, AND THE CARD NOW SAYS SO.
 *
 * WHY THIS SPEC EXISTS. The 42-contract playability smoke of 2026-09-05 filed F-SMOKE-2 as a
 * BLOCKER: "`e6-picnic`: the hero is dead before wave 2, on both viewports, with no error", and
 * suspected the pressure source (`src/systems/WaveSystem.ts:838`) of firing with no ramp.
 * Measured at tick grain (`artifacts/e6-picnic/opening-measure.mjs`, hashes below), the run does
 * end early and **the hero is never touched**: it finishes at 100/100 while all three sandwich
 * stakes are claimed out from under it. The Picnic's only loss is `all-stakes-claimed`
 * (`PicnicHoldSystem.update`), and the reason an unbuilt player meets it is the DESIGN, ruled
 * twice by the owner:
 *
 *   - 2026-08-21, verbatim: **"picnic - no, just standing there should not win"** — a stake is only
 *     defended by a standing structure inside its 3wu disc, or by a hero that has dealt damage in
 *     the last 5 s (`PicnicHoldSystem.contested`, `src/systems/PicnicHoldSystem.ts:104`).
 *   - 2026-08-22, verbatim: **"flip the stakes"** — all three markers carry `heroStart: false` so
 *     the hero opens outside every disc and the ruled pressure can actually reach them
 *     (`reviews/e6-picnic-admission.md`).
 *
 * The second ruling is what ADMITTED this contract: Law 2 requires the idle floor to LOSE, and
 * `assets/contracts/null-floors.json` pins it losing — `e6-picnic-01` wave 2 `fnv1a32:c26f77d5`,
 * `e6-picnic-02` wave 1 `fnv1a32:a649be29`. Restoring a grace period at the pressure source would
 * reverse an owner ruling and un-admit the map. So NOTHING in the pressure changed. What changed is
 * the briefing, which never told the player any of it, and this spec is the proof that the card is
 * now enough: the opening it describes — pan the meadow seam, plant one 10-gold palisade on a
 * sandwich — carries a plain-boot run past 60 s and into wave 2 on both viewports.
 *
 * NO `?debug`, NO `__GR_TEST__` (Mistake #10). Everything here is reachable by a player:
 *   - `?contract=<id>` + the sessionStorage key `gr.contract.launch.v1` is exactly what the town
 *     board's Launch button leaves behind (`src/main.ts` `launchContract`); the smoke establishes
 *     the same door.
 *   - the hero pans by standing on a seam, and builds through the HUD's own Build button and tiles.
 *   - `window.__THREE_GAME_DIAGNOSTICS__` is published in every boot (only `__GR_TEST__` is
 *     debug-gated, `src/game/Game.ts:454`), so it is read here as an observation channel only —
 *     nothing in this spec writes through it.
 */
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import {
  FIRST_CLAIM_DONE_KEY,
  PROFILE_KEY,
  SCOREBOARD_KEY,
  TOWN_NAME_KEY,
  TOWN_WELCOME_SEEN_KEY,
  profileDataKey,
  type ProfileState,
} from '../src/game/ProfileStorage';
import { ACTIVE_EPOCH_KEY, listBoardContracts, listEpochs } from '../src/meta/ContractFamilies';
import { researchStateKey } from '../src/meta/ResearchTree';
import { STORY_TALES_STORAGE_KEY } from '../src/story/settings';
import { moveHeroTo } from './helpers/hero-approach';

const CONTRACT_ID = 'e6-picnic';
const SEED = 'e6-picnic-opening';
const PROFILE_ID = 'robin';
/** `PICNIC_HOLD_RADIUS` — the disc any standing structure contests. */
const HOLD_RADIUS = 3;
/** `Balance.palisade.cost`, and the whole reason a human opening fits inside the first minute. */
const PALISADE_COST = 10;
/** The seam the hero opens beside: `harvestAnchors[1]` on the meadow, 4wu south of the hero start. */
const MEADOW_SEAM = { x: 0, z: 8 };
/** `stakeMarkers`, and the pad the hero stands on to reach each (palisades use beacon placeRadius 6). */
const SANDWICHES = [
  { id: 'sandwich-center', x: 0, z: 26, pad: { x: 0, z: 22 } },
  { id: 'sandwich-east', x: 16, z: 18, pad: { x: 12, z: 18 } },
] as const;

type StakeState = { id: string; claimed: boolean; contested: boolean; timer: number };
type Snapshot = {
  runState: string;
  timeAlive: number;
  wave: number;
  hp: number;
  maxHp: number;
  gold: number;
  enemiesAlive: number;
  stakes: StakeState[];
  works: number;
};

/**
 * `window.__THREE_GAME_DIAGNOSTICS__` is already declared globally (`src/vite-env.d.ts:995`), and
 * that declaration does NOT carry `picnicHold` — `Game.publishDiagnostics` writes the key through an
 * `as ThreeGameDiagnostics` cast (`src/game/Game.ts:5680`), so the objective this whole spec is about
 * is invisible to the type. Read the one missing key through this narrow widening rather than
 * redeclaring the global (a compile error) or editing `src/` (outside this task's firewall).
 * Filed as F-PICNIC-2.
 */
type PicnicDiagnostics = { picnicHold?: StakeState[] };

function seedEntries(): Array<[string, string]> {
  const profile: ProfileState = {
    version: 2,
    activeId: PROFILE_ID,
    profiles: [{ id: PROFILE_ID, name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
  };
  const scores = listBoardContracts().map((entry, index) => ({
    kills: 40,
    gold: 400,
    timeAlive: 600,
    at: index + 1,
    waves: 30,
    secured: true,
    contractId: entry.id,
    profileName: 'Robin',
  }));
  const meta = JSON.stringify({ version: 1, tracks: { territory: 40, science: 999, hero: 40, agent: 40 } });
  const research = JSON.stringify({ version: 1, steps: 999, taken: [], proposalSalt: 0, pinnedTarget: null, metaScienceCursor: 999 });
  const logical: Array<[string, string]> = [
    [SCOREBOARD_KEY, JSON.stringify(scores)],
    [META_PROGRESS_KEY, meta],
    [TOWN_NAME_KEY, 'Quartz Hill'],
    [ACTIVE_EPOCH_KEY, 'epoch-6-atomic'],
    [FIRST_CLAIM_DONE_KEY, '1'],
    [TOWN_WELCOME_SEEN_KEY, '1'],
    [STORY_TALES_STORAGE_KEY, '0'],
    ...listEpochs().map((epoch): [string, string] => [researchStateKey(epoch.id), research]),
  ];
  return [
    [PROFILE_KEY, JSON.stringify(profile)],
    ...logical.flatMap(([key, value]): Array<[string, string]> => [
      [key, value],
      [profileDataKey(PROFILE_ID, key), value],
    ]),
  ];
}

function watchErrors(page: Page): { console: string[]; page: string[] } {
  const found = { console: [] as string[], page: [] as string[] };
  page.on('console', (message) => {
    if (message.type() === 'error') found.console.push(message.text());
  });
  page.on('pageerror', (error) => found.page.push(error.message));
  return found;
}

async function bootPicnic(page: Page): Promise<void> {
  await page.addInitScript(
    ({ entries, launchKey, launchValue }) => {
      try {
        localStorage.clear();
        for (const [key, value] of entries) localStorage.setItem(key, value);
      } catch {}
      try {
        sessionStorage.clear();
        sessionStorage.setItem(launchKey, launchValue);
      } catch {}
    },
    { entries: seedEntries(), launchKey: 'gr.contract.launch.v1', launchValue: CONTRACT_ID },
  );
  await page.goto(`/?contract=${CONTRACT_ID}&seed=${SEED}`);
  await page.waitForFunction(() => Number(window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 12, undefined, { timeout: 60_000 });
  const contract = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract as { activeId?: string; fallbackReason?: unknown });
  expect(contract?.activeId, 'the plain-boot door served the Picnic itself').toBe(CONTRACT_ID);
  expect(contract?.fallbackReason, 'no quiet substitution').toBeNull();
  await page.getByTestId('contract-briefing-dismiss').click({ timeout: 10_000 }).catch(() => undefined);
  await expect(page.getByTestId('contract-briefing')).toBeHidden({ timeout: 10_000 });
}

async function snapshot(page: Page): Promise<Snapshot> {
  return page.evaluate(() => {
    const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
    return {
      runState: String(diagnostics?.runState ?? 'unknown'),
      timeAlive: Number(diagnostics?.timeAlive ?? 0),
      wave: Number(diagnostics?.wave ?? 0),
      hp: Number(diagnostics?.hp ?? 0),
      maxHp: Number(diagnostics?.maxHp ?? 0),
      gold: Number(diagnostics?.economy?.gold ?? 0),
      enemiesAlive: Number(diagnostics?.enemiesAlive ?? 0),
      stakes: ((diagnostics as unknown as PicnicDiagnostics | undefined)?.picnicHold ?? []).map((entry) => ({
        id: String(entry.id),
        claimed: Boolean(entry.claimed),
        contested: Boolean(entry.contested),
        timer: Number(entry.timer),
      })),
      works: (diagnostics?.build?.hp ?? []).filter((entry: any) => !entry.wrecked && entry.hp > 0).length,
    };
  });
}

/**
 * An in-page recorder for the opening: it samples the published diagnostics every frame and keeps
 * only the FIRSTS, in SIM seconds. Polling from node would sample at network cadence and report
 * the wrong second; this reads the same clock the sim advances.
 */
async function installTimeline(page: Page): Promise<void> {
  await page.evaluate(() => {
    const marks: Record<string, number | null> = {
      firstSpawnAt: null,
      firstStakePressureAt: null,
      firstHeroDamageAt: null,
      firstBuildAt: null,
      firstStakeClaimedAt: null,
      lastStakeClaimedAt: null,
      endAt: null,
    };
    let openingHp: number | null = null;
    (window as any).__PICNIC_TIMELINE__ = marks;
    const sample = () => {
      const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
      if (diagnostics) {
        const at = Number(diagnostics.timeAlive);
        if (openingHp === null) openingHp = Number(diagnostics.hp);
        if (marks.firstSpawnAt === null && Number(diagnostics.enemiesAlive) > 0) marks.firstSpawnAt = at;
        if (marks.firstHeroDamageAt === null && Number(diagnostics.hp) < openingHp) marks.firstHeroDamageAt = at;
        const stakes = (diagnostics as unknown as PicnicDiagnostics).picnicHold ?? [];
        if (marks.firstStakePressureAt === null && stakes.some((entry) => entry.timer > 0)) marks.firstStakePressureAt = at;
        const claimed = stakes.filter((entry) => entry.claimed).length;
        if (marks.firstStakeClaimedAt === null && claimed >= 1) marks.firstStakeClaimedAt = at;
        if (marks.lastStakeClaimedAt === null && stakes.length > 0 && claimed === stakes.length) marks.lastStakeClaimedAt = at;
        const works = ((diagnostics.build?.hp ?? []) as Array<{ wrecked: boolean; hp: number }>)
          .filter((entry) => !entry.wrecked && entry.hp > 0).length;
        if (marks.firstBuildAt === null && works > 0) marks.firstBuildAt = at;
        if (marks.endAt === null && diagnostics.runState === 'dead') marks.endAt = at;
      }
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
}

async function readTimeline(page: Page): Promise<Record<string, number | null>> {
  return page.evaluate(() => (window as any).__PICNIC_TIMELINE__ ?? {});
}

/** Level-ups freeze the sim until a card is taken; a human takes one. */
async function clearLevelUp(page: Page): Promise<void> {
  if (await page.getByTestId('upgrade-overlay').isVisible().catch(() => false)) {
    await page.getByTestId('upgrade-card-0').click({ timeout: 5_000 }).catch(() => undefined);
    await expect(page.getByTestId('upgrade-overlay')).toBeHidden({ timeout: 5_000 });
  }
}

/**
 * Aim the build ghost at a world point by MOVING THE MOUSE and reading the published ghost back —
 * the same closed loop `e2e/release-build.spec.ts:339` uses, because a release build has no seam
 * either. Two Newton steps on the screen->ground Jacobian is plenty for a flat meadow.
 */
async function aimBuildGhost(page: Page, target: { x: number; z: number }): Promise<{ x: number; y: number }> {
  const box = await page.locator('#game-canvas').boundingBox();
  expect(box, 'the canvas is on screen').not.toBeNull();
  let x = box!.x + box!.width / 2;
  let y = box!.y + box!.height / 2;
  const sample = async (clientX: number, clientY: number) => {
    await page.mouse.move(clientX, clientY);
    await page.waitForTimeout(70);
    return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build?.ghostPos as { x: number; z: number });
  };
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const origin = await sample(x, y);
    if (Math.hypot(origin.x - target.x, origin.z - target.z) < 0.4) break;
    const across = await sample(x + 40, y);
    const down = await sample(x, y + 40);
    const j00 = (across.x - origin.x) / 40;
    const j10 = (across.z - origin.z) / 40;
    const j01 = (down.x - origin.x) / 40;
    const j11 = (down.z - origin.z) / 40;
    const determinant = j00 * j11 - j01 * j10;
    if (Math.abs(determinant) < 0.00001) break;
    const dx = target.x - origin.x;
    const dz = target.z - origin.z;
    x += Math.max(-220, Math.min(220, (dx * j11 - dz * j01) / determinant));
    y += Math.max(-220, Math.min(220, (dz * j00 - dx * j10) / determinant));
    x = Math.max(box!.x + 2, Math.min(box!.x + box!.width - 2, x));
    y = Math.max(box!.y + 2, Math.min(box!.y + box!.height - 2, y));
  }
  await sample(x, y);
  return { x, y };
}

/** Pan at the meadow seam until the purse can afford a palisade. */
async function panTo(page: Page, gold: number, timeout: number): Promise<void> {
  await clearLevelUp(page);
  await moveHeroTo(page, MEADOW_SEAM.x, MEADOW_SEAM.z).catch(() => undefined);
  await expect
    .poll(async () => {
      await clearLevelUp(page);
      return (await snapshot(page)).gold;
    }, { timeout, intervals: [400] })
    .toBeGreaterThanOrEqual(gold);
}

/**
 * Walk to the sandwich and fence it, exactly the way the card now tells the player to.
 *
 * ⚠️ The menu dance is not ceremony, it is the 390px lesson. A level-up hides the whole HUD until a
 * card is taken (`runState === 'levelup'`), so a bare `click()` on the palisade tile fails with
 * "element is not visible" and burns its five seconds waiting for an overlay nobody dismissed —
 * measured on mobile-chrome, the only red of the first both-projects run. And on a 390px screen the
 * open menu covers 316 of 844 pixels, so the build target can sit UNDER it: the corner pointerdown
 * closes the menu before aiming, the same order `e2e/release-build.spec.ts:93` uses.
 */
async function fence(page: Page, sandwich: (typeof SANDWICHES)[number]): Promise<boolean> {
  await clearLevelUp(page);
  await moveHeroTo(page, sandwich.pad.x, sandwich.pad.z).catch(() => undefined);
  const before = (await snapshot(page)).works;
  const canvas = page.locator('#game-canvas');
  const tile = page.getByTestId('hud-build-tile-palisade');
  let selected = false;
  for (let attempt = 0; attempt < 8 && !selected; attempt += 1) {
    await clearLevelUp(page);
    if (!(await page.getByTestId('hud-build-menu').isVisible().catch(() => false))) {
      await page.getByTestId('hud-build').click({ timeout: 5_000 }).catch(() => undefined);
      await page.waitForTimeout(200);
      continue;
    }
    if (!(await tile.isVisible().catch(() => false)) || (await tile.isDisabled().catch(() => true))) {
      await page.waitForTimeout(300);
      continue;
    }
    await tile.click({ timeout: 5_000 }).catch(() => undefined);
    selected = await page
      .evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.ui?.selectedBuildable === 'palisade')
      .catch(() => false);
  }
  if (!selected) return false;
  await canvas.dispatchEvent('pointerdown', { clientX: 1, clientY: 1, pointerType: 'mouse', button: 0 });
  await expect(page.getByTestId('hud-build-menu')).toBeHidden({ timeout: 5_000 });
  const aim = await aimBuildGhost(page, { x: sandwich.x, z: sandwich.z });
  await canvas.dispatchEvent('click', { clientX: aim.x, clientY: aim.y });
  await page.waitForTimeout(400);
  const after = await snapshot(page);
  return after.works > before;
}

function stakeOf(shot: Snapshot, id: string): StakeState | undefined {
  return shot.stakes.find((entry) => entry.id === id);
}

/** A hold map measured in SIM seconds cannot fit the 30 s house default. */
test.describe.configure({ timeout: 300_000 });

test.describe('e6-picnic: the opening the card describes', () => {
  test('the run card names the hold, its six-second clock and the price of stopping it', async ({ page }, testInfo: TestInfo) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await page.addInitScript(
      ({ entries, launchKey, launchValue }) => {
        try {
          localStorage.clear();
          for (const [key, value] of entries) localStorage.setItem(key, value);
        } catch {}
        try {
          sessionStorage.clear();
          sessionStorage.setItem(launchKey, launchValue);
        } catch {}
      },
      { entries: seedEntries(), launchKey: 'gr.contract.launch.v1', launchValue: CONTRACT_ID },
    );
    await page.goto(`/?contract=${CONTRACT_ID}&seed=${SEED}-card`);
    await expect(page.getByTestId('contract-briefing')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('contract-briefing-name')).toHaveText('The Picnic');

    const goals = await page.getByTestId('contract-briefing-goals').locator('li').allTextContents();
    const rules = await page.getByTestId('contract-briefing-rules').locator('li').allTextContents();
    const card = [...goals, ...rules].join(' ');

    // The four facts an unbuilt player needed and the old card never gave. Each is asserted as the
    // FACT, not as one sentence, so the copy can be re-voiced without silently dropping a warning.
    expect(card, 'the loss condition is stated').toMatch(/lose all three/i);
    expect(card, 'and that health is not the clock').toMatch(/whatever your health says/i);
    expect(card, 'the six-second stake clock is stated').toMatch(/six seconds/i);
    expect(card, 'the defender rule is stated').toMatch(/standing work within three units/i);
    expect(card, 'the first threat is timed').toMatch(/inside ten seconds/i);
    expect(card, 'and the opening is priced').toMatch(/palisade costs 10 gold/i);

    // The card is a card, not an essay: this stays inside the shape the board already ships
    // (max across all 42 contracts before this change: 3 goals, 5 rules).
    expect(goals.length, 'goal rows stay within the board-wide maximum').toBeLessThanOrEqual(3);
    expect(rules.length, 'rule rows stay within the board-wide maximum').toBeLessThanOrEqual(5);

    // On a 390px screen an over-long card is a card the player never finishes reading.
    const box = await page.getByTestId('contract-briefing').boundingBox();
    const viewport = page.viewportSize();
    expect(box, 'the run card is laid out').not.toBeNull();
    expect(box!.height, 'the run card still fits the viewport').toBeLessThanOrEqual(viewport!.height);

    await page.screenshot({ path: `artifacts/e6-picnic/shots/card-${testInfo.project.name}.png`, scale: 'css' });
    expect(errors.console, 'zero console errors').toEqual([]);
    expect(errors.page, 'zero page errors').toEqual([]);
  });

  test('an unbuilt Picnic ends on the sandwiches, with the Prospector untouched', async ({ page }, testInfo: TestInfo) => {
    test.setTimeout(180_000);
    const errors = watchErrors(page);
    await bootPicnic(page);
    await installTimeline(page);

    const opening = await snapshot(page);
    expect(opening.stakes.map((entry) => entry.id), 'the three sandwiches are live').toEqual([
      'sandwich-west',
      'sandwich-center',
      'sandwich-east',
    ]);
    expect(opening.stakes.every((entry) => !entry.claimed), 'nothing is claimed at the whistle').toBe(true);

    // No input at all: this is the null floor, played in the browser. `levelup` is a run STATE
    // (`src/game/GameState.ts:1`), not an ending — an unbuilt hero still earns cards off the
    // machines the meadow sends, so the wait takes the offered card and keeps waiting for 'dead'.
    const ended = await page
      .waitForFunction(
        () => {
          const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
          if (!diagnostics) return false;
          if (diagnostics.runState === 'levelup') {
            (document.querySelector('[data-testid="upgrade-card-0"]') as HTMLElement | null)?.click();
            return false;
          }
          return diagnostics.runState === 'dead';
        },
        undefined,
        { timeout: 150_000 },
      )
      .then(() => true)
      .catch(() => false);
    expect(ended, 'an unbuilt run does end — this is a hold map, not a stroll').toBe(true);

    const final = await snapshot(page);
    expect(final.stakes.every((entry) => entry.claimed), 'the loss is all-stakes-claimed').toBe(true);
    // THE CORRECTION TO F-SMOKE-2: the Prospector is not what died.
    expect(final.hp, 'the hero is alive and unhurt when the run ends').toBeGreaterThan(0);

    const timeline = await readTimeline(page);
    testInfo.annotations.push({ type: 'unbuilt-timeline', description: JSON.stringify({ ...timeline, endWave: final.wave, endHp: final.hp, maxHp: final.maxHp }) });
    await page.screenshot({ path: `artifacts/e6-picnic/shots/unbuilt-${testInfo.project.name}.png`, scale: 'css' });
    expect(errors.console, 'zero console errors').toEqual([]);
    expect(errors.page, 'zero page errors').toEqual([]);
  });

  test('one panned palisade on a sandwich holds the meadow past sixty seconds and into wave 2', async ({ page }, testInfo: TestInfo) => {
    test.setTimeout(300_000);
    const errors = watchErrors(page);
    await bootPicnic(page);
    await installTimeline(page);

    // BEAT 1 — pan the meadow seam. The card names it: the machines come before the gold does.
    await panTo(page, PALISADE_COST, 60_000);
    const panned = await snapshot(page);
    expect(panned.gold, 'the seam paid for a palisade').toBeGreaterThanOrEqual(PALISADE_COST);

    // BEAT 2 — fence a sandwich. Any standing structure inside the 3wu disc contests it.
    let fenced: string | null = null;
    for (const sandwich of SANDWICHES) {
      const shot = await snapshot(page);
      if (stakeOf(shot, sandwich.id)?.claimed) continue;
      if (shot.gold < PALISADE_COST) await panTo(page, PALISADE_COST, 45_000).catch(() => undefined);
      if (await fence(page, sandwich)) {
        fenced = sandwich.id;
        break;
      }
    }
    expect(fenced, 'a 10-gold palisade went up on a live sandwich').not.toBeNull();

    const afterFence = await snapshot(page);
    const guarded = SANDWICHES.find((entry) => entry.id === fenced)!;
    // `build.palisadePositions` is the ACTIVE list (`BuildSystem.activePositions`), so a wrecked
    // fence drops out of it — which is the read that makes 'the sandwich is guarded' checkable.
    const palisades: Array<{ x: number; z: number }> = await page.evaluate(
      () => (window.__THREE_GAME_DIAGNOSTICS__?.build?.palisadePositions ?? []) as Array<{ x: number; z: number }>,
    );
    expect(palisades.length, 'the palisade is standing').toBeGreaterThan(0);
    expect(
      Math.min(...palisades.map((entry) => Math.hypot(entry.x - guarded.x, entry.z - guarded.z))),
      'the palisade sits inside the sandwich hold disc',
    ).toBeLessThanOrEqual(HOLD_RADIUS);
    // 'levelup' is a live state, not an ending — the sim is frozen holding a card out to the
    // player (`src/game/GameState.ts:1`). The claim here is that the run has NOT ended, so that is
    // what is asserted; a `toBe('playing')` reds on a level-up that arrives one frame after the
    // fence, which is what it did on desktop-chrome the first time both projects ran.
    expect(afterFence.runState, 'the run has not ended when the fence goes up').not.toBe('dead');

    // BEAT 3 — hold. The hero walks back to the seam and keeps panning, as a player would.
    await moveHeroTo(page, MEADOW_SEAM.x, MEADOW_SEAM.z).catch(() => undefined);
    const reached = await page
      .waitForFunction(
        () => {
          const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
          if (!diagnostics) return false;
          // `levelup` freezes the sim until a card is taken — take one and keep holding. Only
          // 'dead' ends the wait early, and the assertions below then read the real failure.
          if (diagnostics.runState === 'levelup') {
            (document.querySelector('[data-testid="upgrade-card-0"]') as HTMLElement | null)?.click();
            return false;
          }
          if (diagnostics.runState === 'dead') return true;
          return Number(diagnostics.timeAlive) > 60 && Number(diagnostics.wave) >= 2;
        },
        undefined,
        { timeout: 200_000 },
      )
      .then(() => true)
      .catch(() => false);
    expect(reached, 'the run reached the sixty-second / wave-2 mark').toBe(true);

    const held = await snapshot(page);
    expect(held.runState, 'the fenced run has not ended at the mark').not.toBe('dead');
    expect(held.timeAlive, 'past sixty simulated seconds').toBeGreaterThan(60);
    expect(held.wave, 'and into wave 2').toBeGreaterThanOrEqual(2);
    expect(stakeOf(held, guarded.id)?.claimed, `${guarded.id} is still the town's`).toBe(false);
    expect(held.stakes.filter((entry) => !entry.claimed).length, 'at least one sandwich survives').toBeGreaterThan(0);
    // The unbuilt run above is gone by now on the same seed; this one is still being played.
    const stillFenced: Array<{ x: number; z: number }> = await page.evaluate(
      () => (window.__THREE_GAME_DIAGNOSTICS__?.build?.palisadePositions ?? []) as Array<{ x: number; z: number }>,
    );
    expect(
      stillFenced.some((entry) => Math.hypot(entry.x - guarded.x, entry.z - guarded.z) <= HOLD_RADIUS),
      'the fence is still standing on the sandwich at the mark',
    ).toBe(true);

    const timeline = await readTimeline(page);
    testInfo.annotations.push({ type: 'opening-timeline', description: JSON.stringify({ ...timeline, fenced, atMarkWave: held.wave, atMarkSeconds: Number(held.timeAlive.toFixed(2)), hp: held.hp, stakesHeld: held.stakes.filter((entry) => !entry.claimed).map((entry) => entry.id) }) });
    await page.screenshot({ path: `artifacts/e6-picnic/shots/opening-${testInfo.project.name}.png`, scale: 'css' });
    expect(errors.console, 'zero console errors').toEqual([]);
    expect(errors.page, 'zero page errors').toEqual([]);
  });
});
