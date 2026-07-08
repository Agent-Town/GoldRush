import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { MEDALS_KEY, PROFILE_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { STORY_BEATS } from '../src/story/beats';
import { STORY_SIGNAL_REGISTRY, type StorySignal } from '../src/story/signals';
import { STORY_TALES_STORAGE_KEY } from '../src/story/settings';
import { STORY_SPEAKERS } from '../src/story/speakers';

const ARTIFACT_DIR = path.resolve('artifacts/ss-02');

const EXPECTED_BEATS = [
  'founding-welcome',
  'first-contract',
  'town-growth-general-store',
  'town-growth-chapel',
  'first-wave-five',
  'first-loss',
  'first-victory',
  'deputy-hello',
  'rung-lock-explain',
  'deputy-first-promotion',
  'deputy-trusted-routine',
  'science-first-pick',
  'science-mastery',
  'baron-shadow',
  'ceiling-reached',
  'sky-rocket-captured',
  'stamp-site-found',
  'board-unlock-dry-gulch',
  'board-unlock-twin-banks',
  'board-unlock-night-shift',
  'board-unlock-baron',
] as const;

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type ExpectedCard = {
  id: (typeof EXPECTED_BEATS)[number];
  speaker: keyof typeof STORY_SPEAKERS;
  portrait: string;
  text: string;
  shot?: string;
};

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function seedProfile(page: Page, talesEnabled = true): Promise<void> {
  await page.goto('/?debug&nowaves&nolevel&seed=ss-02-seed');
  await page.evaluate(
    ({ profileKey, metaKey, talesKey, enabled }) => {
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
      localStorage.setItem(metaKey, JSON.stringify({ version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: 0 } }));
      localStorage.setItem(talesKey, enabled ? '1' : '0');
    },
    {
      profileKey: PROFILE_KEY,
      metaKey: profileDataKey('robin', META_PROGRESS_KEY),
      talesKey: profileDataKey('robin', STORY_TALES_STORAGE_KEY),
      enabled: talesEnabled,
    },
  );
  await page.reload();
  await page.waitForFunction(() => window.__GR_STORY__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
}

async function installFastStoryClock(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const realNow = Date.now.bind(Date);
    (window as unknown as { __SS02_NOW__?: number }).__SS02_NOW__ = 1_000_000;
    Date.now = () => (window as unknown as { __SS02_NOW__?: number }).__SS02_NOW__ ?? realNow();
  });
}

async function emit(page: Page, signal: StorySignal): Promise<void> {
  await page.evaluate((nextSignal) => {
    const clock = window as unknown as { __SS02_NOW__?: number };
    clock.__SS02_NOW__ = (clock.__SS02_NOW__ ?? Date.now()) + 4_000;
    window.__GR_STORY__?.emit(nextSignal);
  }, signal);
}

async function expectBeat(page: Page, expected: ExpectedCard, testInfo: TestInfo): Promise<void> {
  const card = page.getByTestId('story-beat-card');
  await expect(card).toBeVisible({ timeout: 8_000 });
  await expect(card).toHaveAttribute('data-beat-id', expected.id);
  await expect(card).toHaveAttribute('data-speaker', expected.speaker);
  await expect(card).toContainText(expected.text);
  await expect(page.getByTestId('story-beat-portrait')).toHaveAttribute('src', new RegExp(expected.portrait));
  if (expected.shot) await shot(page, testInfo, expected.shot);
  await page.mouse.click(6, 6);
  await expect(card).toHaveCount(0);
}

async function emitAndExpect(page: Page, signal: StorySignal, expected: ExpectedCard, testInfo: TestInfo): Promise<void> {
  await emit(page, signal);
  await expectBeat(page, expected, testInfo);
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: false });
}

function sampleSignal(trigger: StorySignal['type']): StorySignal {
  switch (trigger) {
    case 'town-named':
      return { type: 'town-named', townName: 'Aurora Bend' };
    case 'town-growth-seen':
      return { type: 'town-growth-seen', buildingId: 'general_store', buildingName: 'General Store' };
    case 'board-first-open':
      return { type: 'board-first-open' };
    case 'wave-complete':
      return { type: 'wave-complete', wave: 5 };
    case 'first-victory':
      return { type: 'first-victory' };
    case 'science-threshold':
      return { type: 'science-threshold', threshold: 4 };
    case 'science-complete':
      return { type: 'science-complete' };
    case 'stamp-site-found':
      return { type: 'stamp-site-found' };
    case 'contract-unlocked':
      return { type: 'contract-unlocked', contractId: 'e1-dry-gulch', contractName: 'The Dry Gulch', ledgerBlurb: 'Mesa country.' };
    case 'rung-promotion':
      return { type: 'rung-promotion', level: 2 };
    case 'rung-denied-toggle':
      return { type: 'rung-denied-toggle' };
    case 'building-lost':
      return { type: 'building-lost' };
    case 'xp-collected':
      return { type: 'xp-collected' };
    case 'first-boot':
      return { type: 'first-boot' };
  }
}

function linesFor(beat: (typeof STORY_BEATS)[number]): readonly string[] {
  const signal = sampleSignal(beat.trigger);
  return typeof beat.lines === 'function' ? beat.lines(signal) : beat.lines;
}

test('SS-02 table is 21 registered, attributed, two-line E1 beats', () => {
  const ids = STORY_BEATS.map((beat) => beat.id);
  expect(ids).toEqual([...EXPECTED_BEATS]);
  expect(new Set(ids).size).toBe(STORY_BEATS.length);

  for (const beat of STORY_BEATS) {
    expect(STORY_SIGNAL_REGISTRY).toContain(beat.trigger);
    expect(STORY_SPEAKERS[beat.speaker]).toBeTruthy();
    const lines = linesFor(beat);
    expect(lines.length).toBeGreaterThan(0);
    expect(lines.length).toBeLessThanOrEqual(2);
    for (const line of lines) expect(line.trim()).toBe(line);
  }
});

test('full E1 thread fires each authored arc once with portraits', async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  await installFastStoryClock(page);
  await seedProfile(page);
  const errors = collectErrors(page);

  await emitAndExpect(page, { type: 'town-named', townName: 'Aurora Bend' }, {
    id: 'founding-welcome',
    speaker: 'elder',
    portrait: 'townsfolk-elder',
    text: 'Aurora Bend has a name now.',
    shot: 'founding',
  }, testInfo);
  await emitAndExpect(page, { type: 'board-first-open' }, {
    id: 'first-contract',
    speaker: 'tavernkeeper',
    portrait: 'townsfolk-tavernkeeper',
    text: 'Claim this card first.',
  }, testInfo);
  await emitAndExpect(page, { type: 'town-growth-seen', buildingId: 'general_store', buildingName: 'General Store' }, {
    id: 'town-growth-general-store',
    speaker: 'tavernkeeper',
    portrait: 'townsfolk-tavernkeeper',
    text: 'The store came in',
  }, testInfo);
  await emitAndExpect(page, { type: 'town-growth-seen', buildingId: 'chapel', buildingName: 'Chapel' }, {
    id: 'town-growth-chapel',
    speaker: 'tavernkeeper',
    portrait: 'townsfolk-tavernkeeper',
    text: 'Chapel bell',
  }, testInfo);
  await emitAndExpect(page, { type: 'wave-complete', wave: 5 }, {
    id: 'first-wave-five',
    speaker: 'clerk',
    portrait: 'townsfolk-assay-clerk',
    text: 'Fifth horn recorded.',
  }, testInfo);
  await emitAndExpect(page, { type: 'building-lost' }, {
    id: 'first-loss',
    speaker: 'clerk',
    portrait: 'townsfolk-assay-clerk',
    text: 'Broken timber is a debit',
  }, testInfo);
  await emitAndExpect(page, { type: 'first-victory' }, {
    id: 'first-victory',
    speaker: 'elder',
    portrait: 'townsfolk-elder',
    text: 'Take one science step',
  }, testInfo);
  await emitAndExpect(page, { type: 'xp-collected' }, {
    id: 'deputy-hello',
    speaker: 'prospector',
    portrait: 'char-prospector-portrait',
    text: 'I can sweep loose XP now.',
    shot: 'deputy',
  }, testInfo);
  await emitAndExpect(page, { type: 'rung-denied-toggle' }, {
    id: 'rung-lock-explain',
    speaker: 'prospector',
    portrait: 'char-prospector-portrait',
    text: 'That chore needs trust first.',
  }, testInfo);
  await emitAndExpect(page, { type: 'rung-promotion', level: 1 }, {
    id: 'deputy-first-promotion',
    speaker: 'prospector',
    portrait: 'char-prospector-portrait',
    text: 'First rung logged.',
  }, testInfo);
  await emitAndExpect(page, { type: 'rung-promotion', level: 2 }, {
    id: 'deputy-trusted-routine',
    speaker: 'prospector',
    portrait: 'char-prospector-portrait',
    text: 'Trusted routine unlocked.',
  }, testInfo);
  await emitAndExpect(page, { type: 'science-threshold', threshold: 1 }, {
    id: 'science-first-pick',
    speaker: 'elder',
    portrait: 'townsfolk-elder',
    text: 'The first mark matters.',
  }, testInfo);
  await emitAndExpect(page, { type: 'science-threshold', threshold: 3 }, {
    id: 'science-mastery',
    speaker: 'elder',
    portrait: 'townsfolk-elder',
    text: 'The chart has a spine now.',
  }, testInfo);
  await emitAndExpect(page, { type: 'science-threshold', threshold: 4 }, {
    id: 'baron-shadow',
    speaker: 'tavernkeeper',
    portrait: 'townsfolk-tavernkeeper',
    text: 'An oxblood coat',
    shot: 'baron-shadow',
  }, testInfo);

  const contracts = [
    ['e1-dry-gulch', 'The Dry Gulch', 'Mesa country; dry washes fall toward one sunken spring.', 'board-unlock-dry-gulch'],
    ['e1-twin-banks', 'Twin Banks', 'A braided river claim with twin fords, gravel bars, and damp reeds.', 'board-unlock-twin-banks'],
    ['e1-night-shift', 'Night Shift', 'The claim, gone dark, dotted with cold lanterns.', 'board-unlock-night-shift'],
    ['e1-baron', 'The Claim-Jumper Baron', 'An oxblood banner marks the outfit that keeps buying trouble.', 'board-unlock-baron'],
  ] as const;
  for (const [contractId, contractName, ledgerBlurb, id] of contracts) {
    await emitAndExpect(page, { type: 'contract-unlocked', contractId, contractName, ledgerBlurb }, {
      id,
      speaker: 'tavernkeeper',
      portrait: 'townsfolk-tavernkeeper',
      text: ledgerBlurb,
      shot: contractId === 'e1-baron' ? 'board-baron' : undefined,
    }, testInfo);
  }

  await emitAndExpect(page, { type: 'science-complete' }, {
    id: 'ceiling-reached',
    speaker: 'elder',
    portrait: 'townsfolk-elder',
    text: 'The Steamworks waits',
    shot: 'science-ceiling',
  }, testInfo);
  await page.evaluate((key) => {
    localStorage.setItem(key, JSON.stringify({ version: 1, baronBeaten: true, rocketCartCaptured: true }));
  }, profileDataKey('robin', MEDALS_KEY));
  await emitAndExpect(page, { type: 'science-complete' }, {
    id: 'sky-rocket-captured',
    speaker: 'elder',
    portrait: 'townsfolk-elder',
    text: 'Your arsenal now.',
  }, testInfo);
  await emitAndExpect(page, { type: 'stamp-site-found' }, {
    id: 'stamp-site-found',
    speaker: 'elder',
    portrait: 'townsfolk-elder',
    text: 'Fund the first stage here.',
    shot: 'steamworks-door',
  }, testInfo);

  await emit(page, { type: 'town-named', townName: 'Aurora Bend' });
  await emit(page, { type: 'science-complete' });
  await expect(page.getByTestId('story-beat-card')).toHaveCount(0);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('Tales off silences SS-02 beats', async ({ page }) => {
  await installFastStoryClock(page);
  await seedProfile(page, false);
  const errors = collectErrors(page);

  await emit(page, { type: 'town-named', townName: 'Silent Bend' });
  await emit(page, { type: 'science-threshold', threshold: 4 });
  await emit(page, { type: 'contract-unlocked', contractId: 'e1-baron', contractName: 'The Claim-Jumper Baron', ledgerBlurb: 'Oxblood trouble.' });
  await expect(page.getByTestId('story-beat-card')).toHaveCount(0);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
