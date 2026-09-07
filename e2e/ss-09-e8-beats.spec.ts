import { mkdir } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { FIRST_CLAIM_DONE_KEY, PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';
import { E8_STORY_BEATS, STORY_RUNTIME_BEATS } from '../src/story/beats';
import type { RuntimeStorySignal } from '../src/story/signals';
import { STORY_SPEAKERS } from '../src/story/speakers';
import { expectNoConsoleErrors, watchErrors } from './support/console-watch';

const E1 = 'epoch-1-frontier';
const E3 = 'epoch-3-voltage';
const E8 = 'epoch-8-orbital';
const SHOTS = process.env.GR_REFRESH_EVIDENCE === '1' ? 'reviews/shots-ss-09-e8-beats' : 'test-results/evidence/shots-ss-09-e8-beats';
// The Mare Claim is the only default-unlocked E8 contract
// (assets/contracts/epoch-8-orbital/contracts.json, boardRow.unlock), so opening the board in an
// Orbital town queues exactly the six arrival beats and nothing from the other three maps.
const ARRIVAL_IDS = [
  'e8-mare-claim-arrival',
  'e8-breach-drill',
  'e8-left-last',
  'e8-monument-first-water',
  'e8-pan-in-regolith',
  'e8-gazette-claw-tags',
] as const;
const IDS = [
  ...ARRIVAL_IDS,
  'e8-far-side-probe',
  'e8-low-orbit-yard',
  'e8-eclipse-reserves',
  'e8-baron-at-the-pad',
  'e8-salvage-kings-claw',
  'e8-claw-crew-walks',
  'e8-mass-driver-waybill',
  'e8-tavern-river-question',
  'e8-out-of-reach',
  'e8-gazette-green-through-the-glass',
  'e8-riverward-launch',
  // story-correctives-batch, 2026-09-07. F-SS09-3 said the Claw's acts could not each own a beat;
  // the story-signal-gaps slice gave SalvageClawBossSystem a voice and F-SSG-5 said the acts still
  // reached none. These four consume it, one per act, appended at the table's end so every in-file
  // coordinate above them is unmoved; `e8-he3-assay-opens` gives the fifth E8 portrait its line.
  'e8-claw-paperwork',
  'e8-claw-crown',
  'e8-claw-winch',
  'e8-claw-anchor-feet',
  'e8-he3-assay-opens',
] as const;
// The Claw's acts and the beat each one now reaches (src/systems/SalvageClawBossSystem.ts:236, :277,
// :301, :339). `crown` is emitted in the same call as `boss-arrival`, by that system's own note.
const CLAW_ACTS = [
  ['paperwork', 'e8-claw-paperwork'],
  ['crown', 'e8-claw-crown'],
  ['winch', 'e8-claw-winch'],
  ['anchor-feet', 'e8-claw-anchor-feet'],
] as const;
const MARE_CLAIM: RuntimeStorySignal = {
  type: 'contract-unlocked',
  contractId: 'e8-mare-claim',
  contractName: 'The Mare Claim',
  ledgerBlurb: 'A high crater rim rings dome pads, regolith fields, and an eastbound mass-driver.',
};
const OLD_STORY_HINTS = STORY_RUNTIME_BEATS
  .filter((beat) => beat.oncePerProfile)
  .map((beat) => `story:${beat.id}`);

async function seedTown(page: Page, epochId: string): Promise<void> {
  await page.addInitScript(({ activeEpochKey, epochId, firstClaimKey, flatEpochKey, flatFirstClaimKey, flatTownKey, hints, marker, profileKey, townKey }) => {
    if (localStorage.getItem(marker)) return;
    localStorage.clear();
    sessionStorage.clear();
    const profile: ProfileState = {
      version: 2,
      activeId: 'robin',
      profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: hints }],
    };
    localStorage.setItem(profileKey, JSON.stringify(profile));
    localStorage.setItem(townKey, 'Quartz Hill');
    localStorage.setItem(flatTownKey, 'Quartz Hill');
    localStorage.setItem(firstClaimKey, '1');
    localStorage.setItem(flatFirstClaimKey, '1');
    localStorage.setItem(activeEpochKey, epochId);
    localStorage.setItem(flatEpochKey, epochId);
    localStorage.setItem(marker, '1');
  }, {
    activeEpochKey: profileDataKey('robin', ACTIVE_EPOCH_KEY),
    epochId,
    firstClaimKey: profileDataKey('robin', FIRST_CLAIM_DONE_KEY),
    flatEpochKey: ACTIVE_EPOCH_KEY,
    flatFirstClaimKey: FIRST_CLAIM_DONE_KEY,
    flatTownKey: TOWN_NAME_KEY,
    hints: OLD_STORY_HINTS,
    marker: `ss-09-seeded:${epochId}`,
    profileKey: PROFILE_KEY,
    townKey: profileDataKey('robin', TOWN_NAME_KEY),
  });
}

async function enterTown(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
}

async function walkToTavern(page: Page): Promise<void> {
  for (let step = 0; step < 56; step += 1) {
    if ((await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt)) === 'tavern') return;
    const { player, target } = await page.evaluate(() => ({
      player: window.__GR_TOWN_DIAGNOSTICS__?.player ?? { x: 0, z: 0 },
      target: window.__GR_TOWN_DIAGNOSTICS__?.buildings.find((building) => building.id === 'tavern')?.approach ?? { x: 0, z: 0 },
    }));
    const keys = [
      ...(Math.abs(target.x - player.x) > 0.55 ? [target.x > player.x ? 'KeyD' : 'KeyA'] : []),
      ...(Math.abs(target.z - player.z) > 0.55 ? [target.z > player.z ? 'KeyS' : 'KeyW'] : []),
    ];
    for (const key of keys) await page.keyboard.down(key);
    await page.waitForTimeout(150);
    for (const key of keys.reverse()) await page.keyboard.up(key);
  }
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt), { timeout: 2_000 }).toBe('tavern');
}

async function expectBeat(page: Page, id: string): Promise<void> {
  await expect(page.getByTestId('story-beat-card')).toHaveAttribute('data-beat-id', id, { timeout: 8_000 });
}

async function seekBeat(page: Page, id: string): Promise<void> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    await expect.poll(() => page.evaluate(() => window.__GR_STORY__?.active()), { timeout: 8_000 }).not.toBeNull();
    if ((await page.evaluate(() => window.__GR_STORY__?.active())) === id) return;
    await dismissBeat(page);
  }
  throw new Error(`Story beat ${id} did not reach the front of the queue.`);
}

async function dismissBeat(page: Page): Promise<void> {
  await page.mouse.click(6, 6);
  await expect(page.getByTestId('story-beat-card')).toHaveCount(0);
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(SHOTS, { recursive: true });
  await page.screenshot({ path: `${SHOTS}/${testInfo.project.name}-${name}.png`, fullPage: true });
}

test('SS-09 table is attributed, presentational, and uses the E2/E3 trigger vocabulary', () => {
  expect(E8_STORY_BEATS.map((beat) => beat.id)).toEqual([...IDS]);
  for (const beat of E8_STORY_BEATS) {
    expect(beat.oncePerProfile).toBe(true);
    expect(beat.presentation).toBe('card');
    expect(STORY_SPEAKERS[beat.speaker]).toBeTruthy();
    expect(['contract-unlocked', 'wave-complete', 'boss-arrival', 'boss-act', 'boss-defeat', 'run-return-town', 'science-complete']).toContain(beat.trigger);
    const lines = typeof beat.lines === 'function' ? [] : beat.lines;
    expect(lines.length).toBeGreaterThan(0);
    for (const line of lines) expect(line).not.toContain('—');
  }
});

test('a player-selected Orbital town presents the mare arrival and the breach drill before the ride', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const errors = watchErrors(page);
  await seedTown(page, E8);
  await enterTown(page);
  await walkToTavern(page);
  await page.getByTestId('town-open-board').click();

  await seekBeat(page, 'e8-mare-claim-arrival');
  await page.evaluate(() => document.querySelector<HTMLButtonElement>('[data-testid="contract-chapter-tab-epoch-8-orbital"]')?.click());
  await expect(page.getByTestId('contract-chapter-epoch-8-orbital')).toBeVisible();
  await expect(page.getByTestId('story-beat-card')).toContainText('Earth hangs in the sky');
  await shot(page, testInfo, 'arrival');
  await dismissBeat(page);
  await expectBeat(page, 'e8-breach-drill');
  await expect(page.getByTestId('story-beat-card')).toContainText('drilled the breach');
  await shot(page, testInfo, 'breach-drill');
  await dismissBeat(page);
  await expectBeat(page, 'e8-left-last');
  await expect(page.getByTestId('story-beat-card')).toContainText('holds the door');
  await shot(page, testInfo, 'left-last');
  await dismissBeat(page);

  await page.getByTestId('contract-launch-e8-mare-claim').click();
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e8-mare-claim');
  await shot(page, testInfo, 'mare-claim-ride');
  expectNoConsoleErrors(errors);
});

test('The Claim cannot load Orbital beats in Frontier', async ({ page }) => {
  test.setTimeout(90_000);
  const errors = watchErrors(page);
  await seedTown(page, E1);
  await enterTown(page);
  await walkToTavern(page);
  await page.getByTestId('town-open-board').click();
  await page.getByTestId('contract-launch-the-claim').click();
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'the-claim');
  expect(await page.evaluate(() => window.__GR_STORY__?.pending().filter((id) => id.startsWith('e8-')))).toEqual([]);
  await expect(page.locator('[data-beat-id^="e8-"]')).toHaveCount(0);
  expectNoConsoleErrors(errors);
});

test(`${E3} cannot load Orbital beats`, async ({ page }) => {
  const errors = watchErrors(page);
  await seedTown(page, E3);
  await page.goto('/');
  await page.waitForFunction(() => Boolean(window.__GR_STORY__));
  await page.evaluate((value) => window.__GR_STORY__?.emit(value), MARE_CLAIM);
  expect(await page.evaluate(() => window.__GR_STORY__?.pending().filter((id) => id.startsWith('e8-')))).toEqual([]);
  await expect(page.locator('[data-beat-id^="e8-"]')).toHaveCount(0);
  expectNoConsoleErrors(errors);
});

test('the Orbital boss, return and ceiling beats fire only on their own triggers', async ({ page }) => {
  test.setTimeout(120_000);
  const errors = watchErrors(page);
  await seedTown(page, E8);
  await page.goto('/');
  await page.waitForFunction(() => Boolean(window.__GR_STORY__));

  const emit = async (signal: RuntimeStorySignal): Promise<void> => {
    await page.evaluate((value) => window.__GR_STORY__?.emit(value), signal);
  };
  // StoryRuntime.dismiss() opens a GAP_MS window before the next card (StoryRuntime.ts:124),
  // so an empty active() is only proof of an empty queue once that window has elapsed.
  const drain = async (): Promise<string[]> => {
    const seen: string[] = [];
    for (let attempt = 0; attempt < 24; attempt += 1) {
      try {
        await expect
          .poll(() => page.evaluate(() => window.__GR_STORY__?.active() ?? null), { timeout: 5_000 })
          .not.toBeNull();
      } catch {
        break;
      }
      const active = await page.evaluate(() => window.__GR_STORY__?.active() ?? null);
      if (!active) break;
      seen.push(active);
      await dismissBeat(page);
    }
    return seen;
  };

  await emit(MARE_CLAIM);
  expect(await drain()).toEqual([...ARRIVAL_IDS]);

  await emit({ type: 'boss-arrival', contractId: 'e8-mare-claim', contractName: 'The Mare Claim' });
  const afterArrival = await drain();
  expect(afterArrival).toContain('e8-baron-at-the-pad');
  expect(afterArrival).toContain('e8-salvage-kings-claw');
  expect(afterArrival.indexOf('e8-baron-at-the-pad')).toBeLessThan(afterArrival.indexOf('e8-salvage-kings-claw'));

  // Each act reaches exactly one beat, and only its own: the descent is four cards now, not two.
  for (const [act, id] of CLAW_ACTS) {
    await emit({ type: 'boss-act', contractId: 'e8-mare-claim', boss: 'salvage-claw', act });
    expect(await drain(), `boss-act ${act}`).toEqual([id]);
  }

  await emit({ type: 'boss-defeat', contractId: 'e8-mare-claim', contractName: 'The Mare Claim' });
  expect(await drain()).toContain('e8-claw-crew-walks');

  await emit({ type: 'run-return-town', result: 'secured' });
  const afterReturn = await drain();
  expect(afterReturn).toContain('e8-mass-driver-waybill');
  expect(afterReturn).toContain('e8-tavern-river-question');
  expect(afterReturn).toContain('e8-out-of-reach');
  expect(afterReturn).not.toContain('e8-gazette-green-through-the-glass');

  await emit({ type: 'run-return-town', result: 'secured' });
  expect(await drain()).toContain('e8-gazette-green-through-the-glass');

  await emit({ type: 'science-complete' });
  expect(await drain()).toContain('e8-riverward-launch');

  expectNoConsoleErrors(errors);
});

test('the other three Orbital maps speak only when their own card unlocks', async ({ page }) => {
  test.setTimeout(120_000);
  const errors = watchErrors(page);
  await seedTown(page, E8);
  await page.goto('/');
  await page.waitForFunction(() => Boolean(window.__GR_STORY__));

  // __GR_STORY__.pending() reports the QUEUE only and excludes the card already on screen
  // (StoryRuntime.ts:302), so a map beat is proved by draining it, not by reading pending().
  const drainAfter = async (signal: RuntimeStorySignal): Promise<string[]> => {
    await page.evaluate((value) => window.__GR_STORY__?.emit(value), signal);
    const seen: string[] = [];
    for (let attempt = 0; attempt < 12; attempt += 1) {
      try {
        await expect
          .poll(() => page.evaluate(() => window.__GR_STORY__?.active() ?? null), { timeout: 5_000 })
          .not.toBeNull();
      } catch {
        break;
      }
      const active = await page.evaluate(() => window.__GR_STORY__?.active() ?? null);
      if (!active) break;
      seen.push(active);
      await dismissBeat(page);
    }
    return seen;
  };

  expect(await drainAfter({ ...MARE_CLAIM, contractId: 'e8-far-side', contractName: 'The Far Side', ledgerBlurb: 'A landing yard faces a listening-probe crater across the Far Side.' }))
    .toEqual(['e8-far-side-probe']);
  expect(await drainAfter({ ...MARE_CLAIM, contractId: 'e8-low-orbit', contractName: 'Low Orbit', ledgerBlurb: "The Salvage King's rebuilt Claw spans three scaffold decks." }))
    .toEqual(['e8-low-orbit-yard']);
  expect(await drainAfter({ ...MARE_CLAIM, contractId: 'e8-eclipse', contractName: 'The Eclipse', ledgerBlurb: "The Mare Claim's dome pads return beneath a darkened sun." }))
    .toEqual(['e8-eclipse-reserves']);
  expectNoConsoleErrors(errors);
});
