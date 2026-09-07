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
  // story-correctives-batch, 2026-09-07: the four E2 portraits that portraits-era-aging-batch
  // registered without a line now each carry one (src/story/beats.ts, appended at the table's end so
  // no in-file citation above them moved). They ride the same e2-hill-mine unlock as e2-elder-tree
  // and e2-depot-wedding, so they land at the back of that unlock's queue, which is where the
  // sequence below now reads them.
  'e2-tavern-welcome',
  'e2-boiler-fed-line',
  'e2-press-first-run',
  'e2-held-galley',
] as const;

async function seed(page: Page): Promise<void> {
  await page.goto('/?debug&nowaves&nolevel&seed=ss-03');
  await page.evaluate((profileKey) => {
    localStorage.clear();
    sessionStorage.clear();
    const profile: ProfileState = {
      version: 2,
      activeId: 'robin',
      // F-AGE-6 (2026-09-06, portraits-era-aging-batch; PRE-EXISTING red, proved by revert-run):
      // `hintsSeen: []` used to be harmless, and stopped being harmless when the story-signal-gaps
      // merge added the `first-boot` beat to the head of the E1 table. It fires on the reload below
      // and sits in the queue, so this spec's very first expectation met `first-boot` instead of the
      // card it asked for and all four runs went red. The E1 greeting is not what this spec is
      // about, so it is seeded as already seen - exactly what ss-04 and ss-05 do with the whole
      // oncePerProfile roster (`OLD_STORY_HINTS`, ss-04-e3-beats.spec.ts:26-28). Every assertion
      // below is unchanged.
      profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: ['story:first-boot'] }],
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

// F-AGE-6, the second half (same PRE-EXISTING red, same proof): this asserted the authored beats
// were `E2_STORY_BEATS.slice(3)`, i.e. everything after a THREE-beat head. The head has since grown
// to nine - the five E2/E3 ceremony beats and `e2-railcar-arrival` landed above the authored block -
// so the literal 3 was reading ceremony beats into the authored list and failing on the first id and
// again on `oncePerProfile`. Taking the table's TAIL says the same thing the 3 meant ("the authored
// beats are the end of this table, in this order, and nothing has been appended after them") without
// a magic number that rots every time the head grows. Assertions themselves untouched.
const AUTHORED_BEATS = E2_STORY_BEATS.slice(-AUTHORED_IDS.length);

test('SS-03 table uses registered speakers and once-per-profile authored beats', () => {
  expect(AUTHORED_BEATS.map((beat) => beat.id)).toEqual([...AUTHORED_IDS]);
  for (const beat of AUTHORED_BEATS) {
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
  await expectBeat(page, 'e2-tavern-welcome', 'One plate long');
  await expectBeat(page, 'e2-boiler-fed-line', 'Your beacons drink now');
  await expectBeat(page, 'e2-press-first-run', 'brought us our voice');
  await expectBeat(page, 'e2-held-galley', 'Truth keeps better than fear');

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
