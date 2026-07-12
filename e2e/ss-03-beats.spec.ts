import { expect, test, type Page } from '@playwright/test';
import { PROFILE_KEY, type ProfileState } from '../src/game/ProfileStorage';
import { E2_STORY_BEATS } from '../src/story/beats';
import type { RuntimeStorySignal } from '../src/story/signals';
import { STORY_SPEAKERS } from '../src/story/speakers';

const AUTHORED_IDS = [
  'e2-rail-arrives',
  'e2-gazette-press',
  'e2-hill-mine-first-visit',
  'e2-elder-tree',
  'e2-depot-wedding',
  'e2-iron-correction-rumor-one',
  'e2-iron-correction-rumor-three',
  'e2-iron-correction-rumor-two',
  'e2-prides-tuition-crate',
] as const;

async function seed(page: Page): Promise<void> {
  await page.goto('/?debug&nowaves&nolevel&seed=ss-03');
  await page.evaluate((profileKey) => {
    localStorage.clear();
    sessionStorage.clear();
    const profile: ProfileState = {
      version: 2,
      activeId: 'robin',
      profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
    };
    localStorage.setItem(profileKey, JSON.stringify(profile));
  }, PROFILE_KEY);
  await page.reload();
  await page.waitForFunction(() => window.__GR_STORY__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
}

async function emit(page: Page, signal: RuntimeStorySignal): Promise<void> {
  await page.evaluate((value) => window.__GR_STORY__?.emit(value), signal);
}

async function expectBeat(page: Page, id: string, text: string): Promise<void> {
  const card = page.getByTestId('story-beat-card');
  await expect(card).toHaveAttribute('data-beat-id', id, { timeout: 8_000 });
  await expect(card).toContainText(text);
  await page.mouse.click(6, 6);
  await expect(card).toHaveCount(0);
}

async function continueCeremony(page: Page, id: string): Promise<void> {
  await expect(page.getByTestId('story-beat-card')).toHaveAttribute('data-beat-id', id, { timeout: 8_000 });
  await page.locator('[data-story-ceremony-continue]').click();
}

test('SS-03 table uses registered speakers and once-per-profile authored beats', () => {
  expect(E2_STORY_BEATS.slice(3).map((beat) => beat.id)).toEqual([...AUTHORED_IDS]);
  for (const beat of E2_STORY_BEATS.slice(3)) {
    expect(beat.oncePerProfile).toBe(true);
    expect(STORY_SPEAKERS[beat.speaker]).toBeTruthy();
    expect(['epoch-activated', 'contract-unlocked', 'run-return-town', 'boss-defeat']).toContain(beat.trigger);
  }
});

test('Steamworks beats tell the full thread once without spoiling the Iron Correction', async ({ page }) => {
  test.setTimeout(90_000);
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  await seed(page);

  await emit(page, { type: 'epoch-activated', epochId: 'epoch-2-steamworks', displayName: 'The Steamworks' });
  await continueCeremony(page, 'e2-ceremony-mill');
  await continueCeremony(page, 'e2-ceremony-valley');
  await continueCeremony(page, 'e2-ceremony-title');
  await expectBeat(page, 'e2-rail-arrives', 'first graduate has the Depot flag');
  await expectBeat(page, 'e2-gazette-press', 'the whistle means vent');
  await expectBeat(page, 'ledger-page:era_steamworks', 'The Age of Steamworks');

  const hillMine = {
    type: 'contract-unlocked',
    contractId: 'e2-hill-mine',
    contractName: 'The Hill Mine',
    ledgerBlurb: 'Terraces above the rail cut.',
  } as const;
  await emit(page, hillMine);
  await expectBeat(page, 'e2-hill-mine-first-visit', 'Keep the track clear');
  await expectBeat(page, 'e2-elder-tree', 'Her chair is empty');
  await expectBeat(page, 'e2-depot-wedding', "Prospector's place set");
  await expectBeat(page, 'e2-iron-correction-rumor-one', 'bought a timetable in cash');

  await emit(page, { type: 'run-return-town', result: 'secured' });
  await expectBeat(page, 'return-secured', 'Drinks tonight');
  await expectBeat(page, 'e2-iron-correction-rumor-two', 'too heavy for the trestle');
  await emit(page, { type: 'run-return-town', result: 'secured' });
  await expectBeat(page, 'return-secured', 'Drinks tonight');
  await expectBeat(page, 'e2-iron-correction-rumor-three', 'asked what year it is');

  await emit(page, { type: 'boss-defeat', contractId: 'e2-hill-mine', contractName: 'The Iron Correction' });
  await expectBeat(page, 'e2-prides-tuition-crate', "Schoolhouse in the Baron's crate");

  await emit(page, hillMine);
  await emit(page, { type: 'boss-defeat', contractId: 'e2-hill-mine', contractName: 'The Iron Correction' });
  await expect(page.getByTestId('story-beat-card')).toHaveCount(0);
  expect(errors).toEqual([]);
});
