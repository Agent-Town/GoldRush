// F-1206-1 DISCRIMINATOR — s1207 fire. NOT A CURE. A MEASUREMENT.
//
// THE QUESTION (escalated by s1206 after three failed cures on three premises):
// at the moment attempt 3's proof fails, is the FEED EMPTY or is the RECORDER DEAF?
// Those are different defects with opposite cures, and no one has separated them.
//
// WHY THIS RIG AND NOT ANOTHER BESPOKE PROBE: s1206 tried twice with hand-written
// navigation and got two nulls — run 1 waited in town, where `hud-agent-feed` does
// not exist ("a probe that executes nothing reports zero"); run 2 never reached the
// tavern. So this file reuses attempt 3's navigation VERBATIM (the archive branch
// `archive/lane-m4-trail-guide-observed-beats`, tip 45f78f6e), because that harness
// is PROVEN to reach the subject — it got as far as recording beat 0 before going
// quiet. The instrument is aimed by a path already known to arrive.
//
// THREE INSTRUMENTS ON ONE PAGE IN ONE RUN (no run-to-run confound, the flaw every
// prior comparison carried by holding a green run against a red one):
//   1. `__grRecorder`  — attempt 3's MutationObserver recorder, copied byte-for-byte.
//   2. `__grPoll`      — a dumb 100 ms sampler that re-queries the DOM every tick.
//   3. `__grNodes`     — node identity/census: how many feed nodes exist, how many
//                        distinct ones the recorder ever bound, and whether the node
//                        on screen right now is still the one it bound first.
//
// READING THE RESULT:
//   poll sees barks the recorder missed  -> RECORDER DEAF (instrument bug, F-1206-2)
//   both empty, with arrival proven      -> FEED GENUINELY EMPTY (a src/ finding;
//                                           the test was right all along)

import { expect as baseExpect, test, type Page } from '@playwright/test';
import { PROFILE_KEY, type ProfileState } from '../src/game/ProfileStorage';

const SIM_PROGRESS_TIMEOUT = 20_000;
const expect = baseExpect.configure({ timeout: SIM_PROGRESS_TIMEOUT });
const GUIDE_BEATS = [
  ['trail-guide-first-run', 'Move with the trail'],
  ['trail-guide-first-nugget', 'Raise a sluice beside water'],
  ['trail-guide-first-gold', 'Open Build'],
  ['trail-guide-first-build-menu', 'Every line here names its price'],
] as const;

type Sample = { t: number; text: string };
type Diagnostic = {
  recorder: string[];
  poll: Sample[];
  pollTicks: number;
  nodeCount: number;
  boundNodes: number;
  boundNodeStillPresent: boolean;
  boundNodeIsCurrent: boolean;
  liveText: string | null;
  liveTextAll: string[];
  arrived: boolean;
  activeId: string | null;
  // ---- second-order discriminator (s1207, added after the first load run) ----
  // The first load run showed the feed genuinely silent at beat 1 AND gold stuck at
  // 0 — one event, not two. That splits "feed empty" further: did the beat fail to
  // DISPLAY, or did its PRECONDITION (the first nugget) never happen? These fields
  // answer it. Starved frames => load ceiling. Healthy frames + channeling false =>
  // the hero is not harvesting and this is a real src/ finding.
  gold: number;
  channeling: boolean;
  frame: number;
  heroPos: { x: number; z: number } | null;
  activeNodeCount: number;
  nearestNodeDistance: number | null;
};

declare global {
  interface Window {
    __grRecorder: string[];
    __grPoll: Sample[];
    __grPollTicks: number;
    __grNodes: { bound: number; first: Element | null };
  }
}

async function installInstruments(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const view = window;
    const t0 = Date.now();

    // ---- instrument 1: attempt 3's recorder, VERBATIM (45f78f6e) ----
    view.__grRecorder = [];
    view.__grNodes = { bound: 0, first: null };
    const observed = new WeakSet<Element>();
    const observeFeed = () => {
      const feed = document.querySelector('[data-testid="hud-agent-feed"]');
      if (!feed || observed.has(feed)) return;
      observed.add(feed);
      view.__grNodes.bound += 1;
      if (!view.__grNodes.first) view.__grNodes.first = feed;
      const record = () => {
        const copy = feed.textContent?.trim() ?? '';
        if (view.__grRecorder.at(-1) !== copy) view.__grRecorder.push(copy);
      };
      record();
      new MutationObserver(record).observe(feed, { childList: true, characterData: true, subtree: true });
    };
    observeFeed();
    new MutationObserver(observeFeed).observe(document, { childList: true, subtree: true });

    // ---- instrument 2: independent 100 ms poller, re-queries every tick ----
    view.__grPoll = [];
    view.__grPollTicks = 0;
    setInterval(() => {
      view.__grPollTicks += 1;
      const node = document.querySelector('[data-testid="hud-agent-feed"]');
      const text = node?.textContent?.trim() ?? '';
      if (view.__grPoll.at(-1)?.text !== text) view.__grPoll.push({ t: Date.now() - t0, text });
    }, 100);
  });
}

async function snapshot(page: Page): Promise<Diagnostic> {
  return page.evaluate(() => {
    const view = window;
    const nodes = Array.from(document.querySelectorAll('[data-testid="hud-agent-feed"]'));
    const current = nodes[0] ?? null;
    const first = view.__grNodes.first;
    const d = window.__THREE_GAME_DIAGNOSTICS__;
    const active = d?.harvest.activeNodes.filter((n) => n.active) ?? [];
    const nearest = d && active.length
      ? Math.min(...active.map((n) => Math.hypot(n.position.x - d.heroPos.x, n.position.z - d.heroPos.z)))
      : null;
    return {
      recorder: view.__grRecorder,
      poll: view.__grPoll,
      pollTicks: view.__grPollTicks,
      nodeCount: nodes.length,
      boundNodes: view.__grNodes.bound,
      boundNodeStillPresent: Boolean(first && first.isConnected),
      boundNodeIsCurrent: Boolean(first && first === current),
      liveText: current?.textContent?.trim() ?? null,
      liveTextAll: nodes.map((n) => n.textContent?.trim() ?? ''),
      arrived: window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'the-claim',
      activeId: window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId ?? null,
      gold: d?.economy.gold ?? -1,
      channeling: d?.harvest.channeling ?? false,
      frame: d?.frame ?? -1,
      heroPos: d ? { x: d.heroPos.x, z: d.heroPos.z } : null,
      activeNodeCount: active.length,
      nearestNodeDistance: nearest,
    };
  });
}

function report(label: string, d: Diagnostic): void {
  console.log(`\n===== F-1206-1 ${label} =====`);
  console.log(`arrived-in-claim: ${d.arrived}  (activeId=${d.activeId})   <-- if false, ANY zero below is about the probe, not the feed`);
  console.log(`SIM: gold=${d.gold}  channeling=${d.channeling}  frame=${d.frame}  heroPos=${JSON.stringify(d.heroPos)}`);
  console.log(`SIM: activeNodes=${d.activeNodeCount}  nearestNodeDistance=${d.nearestNodeDistance === null ? 'n/a' : d.nearestNodeDistance.toFixed(3)}`);
  console.log(`feed nodes in DOM now: ${d.nodeCount}   recorder bound to ${d.boundNodes} distinct node(s)`);
  console.log(`bound node still connected: ${d.boundNodeStillPresent}   bound node === current node: ${d.boundNodeIsCurrent}`);
  console.log(`live text right now: ${JSON.stringify(d.liveText)}`);
  if (d.nodeCount > 1) console.log(`ALL node texts: ${JSON.stringify(d.liveTextAll)}`);
  console.log(`RECORDER (${d.recorder.length} entries): ${JSON.stringify(d.recorder, null, 2)}`);
  console.log(`POLL (${d.poll.length} changes over ${d.pollTicks} ticks):`);
  for (const s of d.poll) console.log(`   +${s.t}ms  ${JSON.stringify(s.text)}`);
  console.log(`===== end ${label} =====\n`);
}

async function guideHints(page: Page): Promise<string[]> {
  return page.evaluate(({ key }) => {
    const state = JSON.parse(localStorage.getItem(key) ?? '{}') as ProfileState;
    return state.profiles[0]?.hintsSeen ?? [];
  }, { key: PROFILE_KEY });
}

async function hold(page: Page, key: string, ms: number): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

async function dismissStoryBeat(page: Page): Promise<void> {
  if (await page.getByTestId('story-beat-card').isVisible().catch(() => false)) {
    await page.mouse.click(6, 6);
    await expect(page.getByTestId('story-beat-card')).toBeHidden();
  }
}

async function openBoard(page: Page): Promise<void> {
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: SIM_PROGRESS_TIMEOUT });
  await hold(page, 'KeyA', 850);
  await hold(page, 'KeyW', 850);
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt)).toBe('tavern');
  await page.getByTestId('town-open-board').click();
  await expect(page.getByTestId('contract-board')).toBeVisible();
  await dismissStoryBeat(page);
}

// TRACE (s1207): attempt 3's helper, VERBATIM, plus a position trace. The 35 fps
// measurement killed the "sim starved" reading, so the question became: how does a
// helper that walks to within 0.12 per axis leave the hero 2+ units away? The trace
// records the target, every sampled position, and the sampling interval — enough to
// tell an OVERSHOOT (sampled too slowly to stop in time) from a BLOCK (hero pinned).
export const walkTrace: { target: { x: number; z: number } | null; samples: { key: string; x: number; z: number; dt: number }[] } = { target: null, samples: [] };

async function moveHeroTo(page: Page, target: { x: number; z: number }): Promise<void> {
  walkTrace.target = target;
  walkTrace.samples = [];
  const position = () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.heroPos);
  const pressUntil = async (key: string, done: (p: { x: number; z: number }) => boolean): Promise<void> => {
    await page.keyboard.down(key);
    const started = Date.now();
    try {
      let last = Date.now();
      for (;;) {
        const p = await position();
        const now = Date.now();
        walkTrace.samples.push({ key, x: p.x, z: p.z, dt: now - last });
        last = now;
        if (done(p)) break;
        if (now - started > SIM_PROGRESS_TIMEOUT) throw new Error(`Hero blocked while moving ${key}`);
        await page.waitForTimeout(25);
      }
    } finally {
      await page.keyboard.up(key);
    }
  };
  let current = await position();
  if (current.x > target.x + 0.12) await pressUntil('KeyA', (v) => v.x <= target.x + 0.12);
  current = await position();
  if (current.x < target.x - 0.12) await pressUntil('KeyD', (v) => v.x >= target.x - 0.12);
  current = await position();
  if (current.z > target.z + 0.12) await pressUntil('KeyW', (v) => v.z <= target.z + 0.12);
  current = await position();
  if (current.z < target.z - 0.12) await pressUntil('KeyS', (v) => v.z >= target.z - 0.12);
}

async function nearestSeam(page: Page): Promise<{ x: number; z: number }> {
  return page.evaluate(() => {
    const diagnostics = window.__THREE_GAME_DIAGNOSTICS__!;
    const hero = diagnostics.heroPos;
    return diagnostics.harvest.activeNodes
      .filter((node) => node.active)
      .sort((a, b) => {
        const ad = (a.position.x - hero.x) ** 2 + (a.position.z - hero.z) ** 2;
        const bd = (b.position.x - hero.x) ** 2 + (b.position.z - hero.z) ** 2;
        return ad - bd;
      })[0]!.position;
  });
}

async function launchFirstClaim(page: Page): Promise<void> {
  const launch = page.getByTestId('contract-launch-the-claim');
  await expect(launch).toBeVisible();
  await expect(launch).toBeEnabled();
  await launch.click();
  await page.waitForFunction(
    () => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'the-claim' && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10,
    undefined,
    { timeout: SIM_PROGRESS_TIMEOUT },
  );
}

// Wait for a beat the way attempt 3 does (poll the RECORDER), but on timeout dump
// every instrument instead of just failing. The dump is the deliverable.
async function observeBeat(page: Page, index: number): Promise<boolean> {
  const [id, copy] = GUIDE_BEATS[index]!;
  const deadline = Date.now() + SIM_PROGRESS_TIMEOUT;
  while (Date.now() < deadline) {
    const seen = await page.evaluate((needle) => window.__grRecorder.some((e) => e.includes(needle)), copy);
    if (seen) return true;
    await page.waitForTimeout(200);
  }
  const d = await snapshot(page);
  const pollSaw = d.poll.some((s) => s.text.includes(copy));
  report(`BEAT ${index} (${id}) — RECORDER TIMED OUT after ${SIM_PROGRESS_TIMEOUT}ms waiting for "${copy}"`, d);
  console.log(`>>> VERDICT INPUT for beat ${index}: recorder saw it = false, POLL saw it = ${pollSaw}`);
  console.log(pollSaw
    ? `>>> ==> RECORDER DEAF. The poller caught "${copy}" on the same page in the same run; the MutationObserver recorder did not.`
    : `>>> ==> FEED GENUINELY SILENT for this beat (arrived=${d.arrived}). Two independent instruments, one page, one run, both empty.`);
  return false;
}

test('F-1206-1: separate "recorder deaf" from "feed empty"', async ({ page }) => {
  test.setTimeout(180_000);
  await page.addInitScript(() => {
    if (sessionStorage.getItem('gr.e2e.trail-guide-fresh-boot') === '1') return;
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem('gr.e2e.trail-guide-fresh-boot', '1');
  });
  await installInstruments(page);

  await page.goto('/');
  await expect(page.getByTestId('start-menu')).toBeVisible();
  await page.getByTestId('profile-name-input').fill('Mina');
  await page.getByTestId('profile-create').click();
  await expect(page.getByTestId('town-name-card')).toBeVisible();
  await page.getByTestId('town-name-input').fill('Aurora Bend');
  await page.getByTestId('town-name-submit').click();
  await expect(page.getByTestId('town-name-card')).toBeHidden();
  await dismissStoryBeat(page);
  await openBoard(page);
  await launchFirstClaim(page);

  // PROOF THE INSTRUMENT IS POINTED AT THE SUBJECT. s1206's nulls both came from
  // reporting a zero measured somewhere the subject did not exist. If this fails,
  // the run is void and says so, rather than reporting an honest-looking 0.
  const arrival = await snapshot(page);
  report('ARRIVAL (inside the claim, before any beat)', arrival);
  expect(arrival.arrived, 'probe never reached the claim — any zero below would be about the probe').toBe(true);

  await page.getByTestId('contract-briefing-dismiss').evaluate((b) => (b as HTMLButtonElement).click());
  await expect(page.getByTestId('contract-briefing')).toBeHidden();

  const results: boolean[] = [];
  results.push(await observeBeat(page, 0));
  await page.mouse.click(6, 6);

  await moveHeroTo(page, await nearestSeam(page));
  results.push(await observeBeat(page, 1));
  await page.mouse.click(6, 6);

  // The first load run died HERE in all 3 failures (gold never > 0). Instrument it
  // instead of throwing, so the run reaches the end and reports the whole timeline.
  const goldDeadline = Date.now() + SIM_PROGRESS_TIMEOUT;
  let goldSeen = false;
  const frameA = (await snapshot(page)).frame;
  const tA = Date.now();
  while (Date.now() < goldDeadline) {
    if (await page.evaluate(() => (window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? 0) > 0)) { goldSeen = true; break; }
    await page.waitForTimeout(200);
  }
  if (!goldSeen) {
    const d = await snapshot(page);
    const fps = ((d.frame - frameA) / ((Date.now() - tA) / 1000));
    report(`GOLD NEVER EARNED after ${SIM_PROGRESS_TIMEOUT}ms — the precondition for beats 1-3`, d);
    const t = walkTrace.target;
    console.log(`>>> WALK TARGET: ${JSON.stringify(t)}   FINAL heroPos: ${JSON.stringify(d.heroPos)}`);
    if (t && d.heroPos) console.log(`>>> WALK MISS: dx=${(d.heroPos.x - t.x).toFixed(3)}  dz=${(d.heroPos.z - t.z).toFixed(3)}  (helper tolerance is 0.12 per axis)`);
    const dts = walkTrace.samples.map((s) => s.dt).filter((n) => n > 0);
    if (dts.length) console.log(`>>> SAMPLING: ${walkTrace.samples.length} samples, dt mean ${(dts.reduce((a, b) => a + b, 0) / dts.length).toFixed(0)}ms, max ${Math.max(...dts)}ms`);
    console.log('>>> WALK TRACE (last 12 samples):');
    for (const s of walkTrace.samples.slice(-12)) console.log(`     ${s.key} x=${s.x.toFixed(3)} z=${s.z.toFixed(3)} (+${s.dt}ms)`);
    console.log(`>>> SIM THROUGHPUT during the wait: ${fps.toFixed(1)} frames/sec (${d.frame - frameA} frames in ${((Date.now() - tA) / 1000).toFixed(1)}s)`);
    console.log(d.channeling
      ? `>>> ==> CHANNELING BUT NOT YIELDING at ${fps.toFixed(1)} fps -> LOAD CEILING: the sim is starved, not broken. The feed is silent because the nugget has not happened yet.`
      : `>>> ==> NOT CHANNELING (nearest node ${d.nearestNodeDistance?.toFixed(3)} away) -> the hero is not harvesting at all. That is a src/ or positioning finding, not a timing one.`);
  }
  results.push(await observeBeat(page, 2));
  await page.getByTestId('hud-build').click();
  await page.getByTestId('hud-build').evaluate((b) => (b as HTMLButtonElement).click());
  results.push(await observeBeat(page, 3));

  const final = await snapshot(page);
  report('FINAL (all four beats attempted)', final);
  console.log(`>>> BEATS SEEN BY RECORDER: ${JSON.stringify(results)}`);
  console.log(`>>> hintsSeen in profile: ${JSON.stringify(await guideHints(page))}`);
  console.log('>>> NOTE: this spec never fails on a beat. It reports. The dump above is the deliverable.');
});
