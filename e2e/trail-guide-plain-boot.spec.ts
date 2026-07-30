import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect as baseExpect, test, type Page, type TestInfo } from '@playwright/test';
import { PROFILE_KEY, type ProfileState } from '../src/game/ProfileStorage';
import { moveHeroTo } from './helpers/hero-approach';

const SHOT_DIR = path.resolve('artifacts/trail-guide-plain-boot');
const SIM_PROGRESS_TIMEOUT = 20_000;
const expect = baseExpect.configure({ timeout: SIM_PROGRESS_TIMEOUT });
const GUIDE_BEATS = [
  ['trail-guide-first-run', 'Move with the trail'],
  ['trail-guide-first-nugget', 'Raise a sluice beside water'],
  ['trail-guide-first-gold', 'Open Build'],
  ['trail-guide-first-build-menu', 'Every line here names its price'],
] as const;
const GUIDE_HINTS = GUIDE_BEATS.map(([id]) => `story:${id}`);

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

function collectErrors(page: Page): ErrorBucket {
  const errors: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  return errors;
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(SHOT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(SHOT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: true });
}

async function guideHints(page: Page): Promise<string[]> {
  return page.evaluate(({ key, tracked }) => {
    const state = JSON.parse(localStorage.getItem(key) ?? '{}') as ProfileState;
    return state.profiles[0]?.hintsSeen.filter((hint) => tracked.includes(hint)) ?? [];
  }, { key: PROFILE_KEY, tracked: GUIDE_HINTS });
}

async function installFeedRecorder(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const view = window as typeof window & { __trailGuideFeedHistory: string[] };
    view.__trailGuideFeedHistory = [];
    const observed = new WeakSet<Element>();
    const observeFeed = () => {
      const feed = document.querySelector('[data-testid="hud-agent-feed"]');
      if (!feed || observed.has(feed)) return;
      observed.add(feed);
      const record = () => {
        const copy = feed.textContent?.trim() ?? '';
        if (view.__trailGuideFeedHistory.at(-1) !== copy) view.__trailGuideFeedHistory.push(copy);
      };
      record();
      new MutationObserver(record).observe(feed, { childList: true, characterData: true, subtree: true });
    };
    observeFeed();
    new MutationObserver(observeFeed).observe(document, { childList: true, subtree: true });
  });
}

async function expectGuideBeat(page: Page, testInfo: TestInfo, index: number): Promise<void> {
  const [id, copy] = GUIDE_BEATS[index]!;
  await expect.poll(() => page.evaluate(
    () => (window as typeof window & { __trailGuideFeedHistory?: string[] }).__trailGuideFeedHistory ?? [],
  )).toEqual(expect.arrayContaining([expect.stringContaining(copy)]));
  expect(await guideHints(page)).toEqual(GUIDE_BEATS.slice(0, index + 1).map(([beatId]) => `story:${beatId}`));
  await shot(page, testInfo, `beat-${index + 1}-${id}`);
}

async function dismissStoryBeat(page: Page): Promise<void> {
  if (await page.getByTestId('story-beat-card').isVisible().catch(() => false)) {
    await page.mouse.click(6, 6);
    await expect(page.getByTestId('story-beat-card')).toBeHidden();
  }
}

async function hold(page: Page, key: string, ms: number): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

async function openBoard(page: Page): Promise<void> {
  await page.waitForFunction(
    () => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10,
    undefined,
    { timeout: SIM_PROGRESS_TIMEOUT },
  );
  await hold(page, 'KeyA', 850);
  await hold(page, 'KeyW', 850);
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt)).toBe('tavern');
  await page.getByTestId('town-open-board').click();
  await expect(page.getByTestId('contract-board')).toBeVisible();
  await dismissStoryBeat(page);
}

async function nearestSeam(page: Page): Promise<{ x: number; z: number }> {
  return page.evaluate(() => {
    const diagnostics = window.__THREE_GAME_DIAGNOSTICS__!;
    const hero = diagnostics.heroPos;
    return diagnostics.harvest.activeNodes
      .filter((node) => node.active)
      .sort((a, b) => {
        const aDistance = (a.position.x - hero.x) ** 2 + (a.position.z - hero.z) ** 2;
        const bDistance = (b.position.x - hero.x) ** 2 + (b.position.z - hero.z) ** 2;
        return aDistance - bDistance;
      })[0]!.position;
  });
}

async function launchFirstClaim(page: Page): Promise<void> {
  const launch = page.getByTestId('contract-launch-the-claim');
  await expect(launch).toBeVisible();
  await expect(launch).toBeEnabled();
  await expect(launch).toHaveText('Launch');
  await launch.click();
  await page.waitForFunction(
    () => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'the-claim' && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10,
    undefined,
    { timeout: SIM_PROGRESS_TIMEOUT },
  );
  const search = new URL(page.url()).searchParams;
  expect(search.has('debug')).toBe(false);
}

test('plain fresh boot teaches the first claim once', async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  await page.addInitScript(() => {
    if (sessionStorage.getItem('gr.e2e.trail-guide-fresh-boot') === '1') return;
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem('gr.e2e.trail-guide-fresh-boot', '1');
  });
  const errors = collectErrors(page);

  await installFeedRecorder(page);
  await page.goto('/');
  expect(new URL(page.url()).search).toBe('');
  await expect(page.getByTestId('start-menu')).toBeVisible();
  await expect(page.getByTestId('profile-title')).toContainText("Who's prospecting?");
  await expect(page.getByTestId('greenhorn-question')).toHaveCount(0);
  await shot(page, testInfo, 'fresh-start-greenhorn-offer');

  await page.getByTestId('profile-name-input').fill('Mina');
  await page.getByTestId('profile-create').click();
  const profile = await page.evaluate((key) => {
    const state = JSON.parse(localStorage.getItem(key) ?? '{}') as ProfileState;
    return state.profiles.find((entry) => entry.id === state.activeId);
  }, PROFILE_KEY);
  expect(profile).toMatchObject({ name: 'Mina', difficultyPreset: 'trail', trailGuide: true });

  await expect(page.getByTestId('town-name-card')).toBeVisible();
  await page.getByTestId('town-name-input').fill('Aurora Bend');
  await page.getByTestId('town-name-submit').click();
  await expect(page.getByTestId('town-name-card')).toBeHidden();
  await dismissStoryBeat(page);
  await openBoard(page);
  await expect(page.getByTestId('first-claim-launch-tooltip')).toHaveText('Stake your first claim');
  await shot(page, testInfo, 'first-claim-launchable');
  await launchFirstClaim(page);

  await page.getByTestId('contract-briefing-dismiss').evaluate((button) => (button as HTMLButtonElement).click());
  await expect(page.getByTestId('contract-briefing')).toBeHidden();
  await expectGuideBeat(page, testInfo, 0);
  await page.mouse.click(6, 6);
  await expect(page.getByTestId('hud-agent-feed')).not.toContainText(GUIDE_BEATS[0][1]);

  const firstSeam = await nearestSeam(page);
  await moveHeroTo(page, firstSeam.x, firstSeam.z);
  await expectGuideBeat(page, testInfo, 1);
  await page.mouse.click(6, 6);
  await expect(page.getByTestId('hud-agent-feed')).not.toContainText(GUIDE_BEATS[1][1]);

  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? 0)).toBeGreaterThan(0);
  await expectGuideBeat(page, testInfo, 2);
  await page.getByTestId('hud-build').click();
  await page.getByTestId('hud-build').evaluate((button) => (button as HTMLButtonElement).click());
  await expect(page.getByTestId('hud-build-menu')).toBeHidden();
  await expectGuideBeat(page, testInfo, 3);
  await page.mouse.click(6, 6);
  await expect(page.getByTestId('hud-agent-feed')).not.toContainText(GUIDE_BEATS[3][1]);
  expect(await guideHints(page)).toEqual(GUIDE_HINTS);

  await page.goto('/');
  expect(new URL(page.url()).search).toBe('');
  await page.getByTestId('start-menu-enter-town').click();
  await openBoard(page);
  await launchFirstClaim(page);
  await page.getByTestId('contract-briefing-dismiss').click();
  const taughtCopy = /Move with the trail|Raise a sluice beside water|Open Build|Every line here names its price/;
  await expect(page.getByTestId('hud-agent-feed')).not.toContainText(taughtCopy);
  const repeatSeam = await nearestSeam(page);
  await moveHeroTo(page, repeatSeam.x, repeatSeam.z);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.harvest.channeling ?? false)).toBe(true);
  await expect(page.getByTestId('hud-agent-feed')).not.toContainText(taughtCopy);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? 0)).toBeGreaterThan(0);
  await expect(page.getByTestId('hud-agent-feed')).not.toContainText(taughtCopy);
  await page.getByTestId('hud-build').click();
  await expect(page.getByTestId('hud-build-menu')).toBeVisible();
  await expect(page.getByTestId('hud-agent-feed')).not.toContainText(taughtCopy);
  expect(await guideHints(page)).toEqual(GUIDE_HINTS);
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});
