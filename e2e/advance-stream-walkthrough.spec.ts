import { mkdir, writeFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import {
  FIRST_CLAIM_DONE_KEY,
  PROFILE_KEY,
  SCOREBOARD_KEY,
  TOWN_NAME_KEY,
  profileDataKey,
  type ProfileState,
} from '../src/game/ProfileStorage';

const THROTTLE_MS = 150;
const CONTROL = process.env.GR_ADVANCE_STREAM_CONTROL === 'lite';
const BOOT_FLAGS = `debug&timescale=24&nolevel&seed=advance-stream-walkthrough${CONTROL ? '&tier=lite' : ''}`;

type Door = { name: string; openedAt: number; demands: Set<string> };

test('measures warm assets across menu, town, and two contracts', async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  await seedProfile(page);
  const errors = collectErrors(page);
  const completedPrefetch = new Map<string, number>();
  const doors: Door[] = [];
  let currentDoor: Door;

  page.on('request', (request) => {
    if (currentDoor && isGlbRequest(request.url()) && request.headers()['x-gold-rush-prefetch'] !== '1') {
      currentDoor.demands.add(request.url());
    }
  });
  page.on('requestfinished', (request) => {
    if (!completedPrefetch.has(request.url()) && isGlbRequest(request.url()) && request.headers()['x-gold-rush-prefetch'] === '1') {
      completedPrefetch.set(request.url(), Date.now());
    }
  });
  await page.route('**/*.glb', async (route) => {
    if (isGlbRequest(route.request().url())) await new Promise((resolve) => setTimeout(resolve, THROTTLE_MS));
    await route.continue().catch(() => undefined);
  });

  const openDoor = (name: string) => {
    currentDoor = { name, openedAt: Date.now(), demands: new Set() };
    doors.push(currentDoor);
  };

  openDoor('menu');
  await page.goto(CONTROL ? '/?tier=lite' : '/');
  if (!CONTROL) await expect.poll(() => completedPrefetch.size, { timeout: 20_000 }).toBeGreaterThan(0);
  await page.evaluate((flags) => history.replaceState(null, '', `/?${flags}`), BOOT_FLAGS);

  openDoor('town');
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  await openBoard(page);

  openDoor('contract1');
  await page.getByTestId('contract-launch-the-claim').click();
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await forceSecure(page);
  await expect(page.getByTestId('claim-secured')).toBeVisible({ timeout: 15_000 });
  await page.getByTestId('bank-secured-claim').click();
  await expect(page.getByTestId('stake-again')).toHaveText('Return to Town', { timeout: 8_000 });

  openDoor('town-return');
  await page.getByTestId('stake-again').click();
  await expect(page.getByTestId('contract-board')).toBeVisible({ timeout: 8_000 });
  await dismissStoryBeat(page);

  openDoor('contract2');
  await page.getByTestId('contract-launch-e1-dry-gulch').click();
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);

  const rows = doors.map((door) => {
    const urls = [...door.demands];
    const warm = urls.filter((url) => (completedPrefetch.get(url) ?? Infinity) < door.openedAt);
    const cold = urls.filter((url) => !warm.includes(url));
    return { name: door.name, warm: warm.length, cold: cold.length, coldUrls: cold.slice(0, 4).map(shortUrl) };
  });
  if (!CONTROL) expect(rows.find(({ name }) => name === 'town')?.warm).toBeGreaterThan(0);
  expect(errors).toEqual([]);

  const report = [
    '# Advance-stream walkthrough',
    '',
    `Boot flags: \`${BOOT_FLAGS}\` · GLB throttle: ${THROTTLE_MS} ms/request · project: ${testInfo.project.name}`,
    '',
    '| Door | WARM | COLD | First cold URLs |',
    '|---|---:|---:|---|',
    ...rows.map(({ name, warm, cold, coldUrls }) => `| ${name} | ${warm} | ${cold} | ${coldUrls.join('<br>') || '—'} |`),
    '',
  ].join('\n');
  console.log(`\n${report}`);
  if (!CONTROL) {
    await mkdir('artifacts', { recursive: true });
    await writeFile('artifacts/advance-stream-walkthrough.md', report);
    await writeFile('reviews/advance-stream-walkthrough.md', report);
  }
});

async function seedProfile(page: Page): Promise<void> {
  await page.addInitScript(({ profileKey, townKey, metaKey, scoreKey, guideKey }) => {
    localStorage.clear();
    sessionStorage.clear();
    const state: ProfileState = {
      version: 2,
      activeId: 'robin',
      profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: ['story:first-contract'] }],
    };
    localStorage.setItem(profileKey, JSON.stringify(state));
    localStorage.setItem(townKey, 'Quartz Hill');
    localStorage.setItem(metaKey, JSON.stringify({ version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: 0 } }));
    localStorage.setItem(scoreKey, '[]');
    localStorage.setItem(guideKey, '1');
  }, {
    profileKey: PROFILE_KEY,
    townKey: profileDataKey('robin', TOWN_NAME_KEY),
    metaKey: profileDataKey('robin', META_PROGRESS_KEY),
    scoreKey: profileDataKey('robin', SCOREBOARD_KEY),
    guideKey: profileDataKey('robin', FIRST_CLAIM_DONE_KEY),
  });
}

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

async function openBoard(page: Page): Promise<void> {
  await hold(page, 'KeyA', 850);
  await hold(page, 'KeyW', 850);
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt), { timeout: 8_000 }).toBe('tavern');
  await page.getByTestId('town-open-board').click();
  await expect(page.getByTestId('contract-board')).toBeVisible();
}

async function forceSecure(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('run.secureWave', 1);
    window.__GR_TEST__?.setBalance('enemy.contactDamage', 0);
    window.__GR_TEST__?.setBalance('waves.waveInterval', 0.25);
    window.__GR_TEST__?.setBalance('waves.trickleInterval', 9999);
    window.__GR_TEST__?.setBalance('waves.pulseBase', 0);
    window.__GR_TEST__?.setBalance('waves.pulsePerWave', 0);
    window.__GR_TEST__?.setBalance('waves.pulsesPerWave', 1);
    window.__GR_TEST__?.resetRun();
  });
}

async function dismissStoryBeat(page: Page): Promise<void> {
  if (await page.getByTestId('story-beat-card').isVisible().catch(() => false)) {
    await page.mouse.click(6, 6);
    await page.waitForTimeout(150);
  }
}

async function hold(page: Page, key: string, ms: number): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

function shortUrl(url: string): string {
  return new URL(url).pathname;
}

function isGlbRequest(url: string): boolean {
  const parsed = new URL(url);
  return parsed.pathname.endsWith('.glb') && parsed.search === '';
}
