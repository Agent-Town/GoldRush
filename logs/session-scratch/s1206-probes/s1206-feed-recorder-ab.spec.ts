// s1206 SCRATCH PROBE — NOT A GATE, NOT FOR MERGE. Deleted from e2e/ after the run;
// the file is preserved under logs/session-scratch/ per the RETENTION LAW.
//
// QUESTION: attempt 3 of the trail-guide plain-boot proof (lane/m4 45f78f6e) replaced a
// current-text assertion with a MutationObserver "feed recorder", and still went 3/4 red.
// Its own report offered two readings: either the OVERTAKING premise is refuted, or
// "reading current text from a batched MutationObserver callback can itself miss an
// intermediate mutation". The failure printed a recorded history of only TWO entries
// (the first-run line and ""), while s1205 measured the same feed cycling 43 samples of
// barks. Those cannot both be true of a working instrument.
//
// DESIGN: install BOTH instruments on the SAME page before the same boot, so neither can
// be blamed on run-to-run variance or arm order (the recorded confound in this lineage —
// every prior attempt compared a green run to a red one):
//   A = RECORDER   — installFeedRecorder, copied VERBATIM from 45f78f6e.
//   B = CONTROL    — a 100 ms setInterval sampling the same node's textContent.
// Same page, same sim, same barks. If B sees messages A never records, the instrument is
// blind and attempt 3's red says nothing about the overtaking premise.
import { expect, test, type Page } from '@playwright/test';

type Probe = Window & {
  __trailGuideFeedHistory?: string[];
  __s1206PollHistory?: string[];
  __s1206PollTicks?: number;
  __s1206FeedSwaps?: number;
};

// ---- A: VERBATIM from 45f78f6e:e2e/trail-guide-plain-boot.spec.ts. Do not "improve" it;
// the point is to measure the shipped instrument, not a repaired one.
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

// ---- B: the control. Deliberately dumb — no observers, no batching, just look.
// Also counts how often the feed ELEMENT IDENTITY changes, which is the leading
// hypothesis for how A goes deaf (it binds to the first node it sees).
async function installPollControl(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const view = window as Probe;
    view.__s1206PollHistory = [];
    view.__s1206PollTicks = 0;
    view.__s1206FeedSwaps = 0;
    let lastNode: Element | null = null;
    setInterval(() => {
      view.__s1206PollTicks = (view.__s1206PollTicks ?? 0) + 1;
      const feed = document.querySelector('[data-testid="hud-agent-feed"]');
      if (feed && feed !== lastNode) {
        if (lastNode !== null) view.__s1206FeedSwaps = (view.__s1206FeedSwaps ?? 0) + 1;
        lastNode = feed;
      }
      const copy = feed?.textContent?.trim() ?? '';
      if (!copy) return;
      const history = view.__s1206PollHistory!;
      if (history.at(-1) !== copy) history.push(copy);
    }, 100);
  });
}

async function hold(page: Page, key: string, ms: number): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

test('s1206 A/B: does the shipped feed recorder see what the feed shows?', async ({ page }) => {
  test.setTimeout(180_000);
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await installFeedRecorder(page);
  await installPollControl(page);

  await page.goto('/');
  await expect(page.getByTestId('start-menu')).toBeVisible();
  await page.getByTestId('profile-name-input').fill('Mina');
  await page.getByTestId('profile-create').click();

  // REACH THE STATE WHERE THE SUBJECT EXISTS. Run 1 of this probe waited in TOWN and
  // reported recorder 0 / poll 0 / feedPresentAtEnd FALSE over 473 ticks — both
  // instruments honestly reporting that `hud-agent-feed` was never on the page. A probe
  // that executes nothing reports zero, and that zero says nothing about the recorder.
  // The feed exists only inside a launched claim, so drive the same path the real spec
  // does: town → contract board → Launch.
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 30_000 });
  await hold(page, 'KeyA', 850);
  await hold(page, 'KeyW', 850);
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt), { timeout: 30_000 }).toBe('tavern');
  await page.getByTestId('town-open-board').click();
  await expect(page.getByTestId('contract-board')).toBeVisible({ timeout: 30_000 });
  if (await page.getByTestId('story-beat-card').isVisible().catch(() => false)) {
    await page.mouse.click(6, 6);
  }
  const launch = page.getByTestId('contract-launch-the-claim');
  await expect(launch).toBeEnabled({ timeout: 30_000 });
  await launch.click();
  await page.waitForFunction(
    () => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'the-claim' && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10,
    undefined,
    { timeout: 30_000 },
  );
  await expect(page.getByTestId('hud-agent-feed')).toBeAttached({ timeout: 30_000 });

  // Now let the barks the premise blames actually fire, while both instruments watch.
  await page.waitForTimeout(45_000);

  const result = await page.evaluate(() => {
    const view = window as Probe;
    return {
      recorder: view.__trailGuideFeedHistory ?? [],
      poll: view.__s1206PollHistory ?? [],
      ticks: view.__s1206PollTicks ?? 0,
      swaps: view.__s1206FeedSwaps ?? 0,
      feedPresent: Boolean(document.querySelector('[data-testid="hud-agent-feed"]')),
    };
  });

  const seenByPollOnly = result.poll.filter((entry) => !result.recorder.includes(entry));
  console.log(JSON.stringify({
    recorderCount: result.recorder.length,
    pollCount: result.poll.length,
    pollTicks: result.ticks,
    feedElementSwaps: result.swaps,
    feedPresentAtEnd: result.feedPresent,
    missedByRecorder: seenByPollOnly.length,
    recorder: result.recorder,
    missedSamples: seenByPollOnly.slice(0, 12),
  }, null, 2));
});
