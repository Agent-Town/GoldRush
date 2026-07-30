import { expect, test, type Page } from '@playwright/test';
import { PROFILE_KEY, type ProfileState } from '../src/game/ProfileStorage';

type Errors = { console: string[]; page: string[] };
type FeedSample = { text: string; at: number };

function collectErrors(page: Page): Errors {
  const errors: Errors = { console: [], page: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.console.push(message.text());
  });
  page.on('pageerror', (error) => errors.page.push(error.message));
  return errors;
}

async function seedProfile(page: Page): Promise<void> {
  await page.addInitScript(
    (key) => {
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
            trailGuide: true,
          },
        ],
      };
      localStorage.setItem(key, JSON.stringify(state));
    },
    PROFILE_KEY,
  );
}

async function recordFeed(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const samples: FeedSample[] = [];
    (window as unknown as { __GUIDE_FEED_SAMPLES__: FeedSample[] }).__GUIDE_FEED_SAMPLES__ = samples;
    const documentObserver = new MutationObserver(() => {
      const feed = document.querySelector<HTMLElement>('[data-hud-agent-feed]');
      if (!feed || feed.dataset.recording === 'true') return;
      feed.dataset.recording = 'true';
      const sample = () => {
        const text = feed.textContent?.trim() ?? '';
        if (samples.at(-1)?.text !== text) samples.push({ text, at: performance.now() });
      };
      new MutationObserver(sample).observe(feed, { childList: true, characterData: true, subtree: true });
      sample();
    });
    documentObserver.observe(document, { childList: true, subtree: true });
  });
}

test('first-run Guide holds through a bark storm, then the newest bark surfaces', async ({ page }, testInfo) => {
  test.setTimeout(20_000);
  await seedProfile(page);
  await recordFeed(page);
  const errors = collectErrors(page);
  await page.goto('/?debug&contract=the-claim&nowaves&seed=guide-priority');
  await page.waitForFunction(() => window.__GR_AGENT__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);

  const feed = page.getByTestId('hud-agent-feed');
  await expect(feed).toContainText('Move with the trail');
  await page.evaluate(() => document.querySelector<HTMLButtonElement>('[data-testid="contract-briefing-dismiss"]')?.click());
  const newestBark = await page.evaluate(() => {
    for (let i = 0; i < 12; i += 1) window.__GR_AGENT__?.panAt(`storm-${i}`);
    return window.__GR_AGENT__?.state.receiptFeed[0] ?? '';
  });
  expect(newestBark).not.toBe('');
  await expect(feed).toContainText('Move with the trail');

  await page.evaluate(() => window.__GR_TEST__?.grantXp(100));
  await expect
    .poll(() =>
      page.evaluate((key) => {
        const state = JSON.parse(localStorage.getItem(key) ?? '{}') as ProfileState;
        return state.profiles[0]?.hintsSeen.includes('story:trail-guide-first-level') ?? false;
      }, PROFILE_KEY),
    )
    .toBe(true);
  await expect(feed).toContainText('Move with the trail');

  const screenshot = `artifacts/trail-guide-beat-priority/${testInfo.project.name}-storm.png`;
  await page.screenshot({ path: screenshot, fullPage: true });
  await testInfo.attach('guide-holds-during-bark-storm', { path: screenshot, contentType: 'image/png' });

  await expect(feed).toContainText('The trail has taught you something', { timeout: 7_000 });
  const samples = await page.evaluate(
    () => (window as unknown as { __GUIDE_FEED_SAMPLES__: FeedSample[] }).__GUIDE_FEED_SAMPLES__,
  );
  const guide = samples.find((sample) => sample.text.includes('Move with the trail'));
  const bark = samples.find((sample) => sample.text.includes('The trail has taught you something'));
  expect(guide).toBeTruthy();
  expect(bark).toBeTruthy();
  expect(bark!.at - guide!.at).toBeGreaterThanOrEqual(3_900);

  await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown')));
  await expect(feed).toHaveText(newestBark);

  await page.evaluate((key) => {
    const state = JSON.parse(localStorage.getItem(key) ?? '{}') as ProfileState;
    const profile = state.profiles.find((entry) => entry.id === state.activeId);
    if (profile) delete profile.trailGuide;
    localStorage.setItem(key, JSON.stringify(state));
  }, PROFILE_KEY);
  await page.reload();
  await page.waitForFunction(() => window.__GR_AGENT__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const veteranBark = await page.evaluate(() => {
    window.__GR_AGENT__?.collectGold();
    window.__GR_AGENT__?.panAt('veteran-latest');
    return window.__GR_AGENT__?.state.receiptFeed[0] ?? '';
  });
  await expect(feed).toHaveText(veteranBark);
  expect(errors).toEqual({ console: [], page: [] });
});
