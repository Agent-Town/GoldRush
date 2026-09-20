// TIMINGS FOR hero-slot-clip-split — town-ready, and when the claim's animations actually land.
//
// Run against a `vite preview` of a GR_RELEASE=e1 build (the shape scripts/deploy.sh measures):
//   npx vite preview --host 127.0.0.1 --port 5294
//   node artifacts/hero-slot-clip-split/timings.mjs <label> [> out.json]
//
// EVERY NUMBER IS ON ONE CLOCK. The page records `performance.now()` marks from a rAF loop and
// publishes `performance.timeOrigin`, so an in-page mark converts to the same epoch milliseconds
// Playwright stamps network responses with. That matters here more than usual: the whole reason
// the warm moved off `assetLoadingState=ready` is that OBSERVING that signal by polling adds a
// skirt of hundreds of ms, and a measurement that polls would hide the very effect it is for.
// Cell arrival is counted from Playwright's own response events rather than the page's resource
// timeline, because that timeline's default buffer is 250 entries and the first town exceeds it.
//
// SCENARIOS (each a fresh, cold-cache context)
//  town        menu -> town. `townReadyMs` is the town's own loader, its first `loading` mark to
//              its `ready` mark. `claimCellsInsideTownWindow` is the cured invariant: whether any
//              hero claim cell (work8/attack8) finished before the town published `ready`.
//  claim-cold  straight into a run, no town visit — the worst case for a first swing, because
//              nothing has warmed the claim group. `heroReadyMs` is the hero sprite becoming
//              playable at all; `attackCellsMs`/`panCellsMs` are when a correct swing/pan frame
//              first COULD be drawn. A swing requested before `attackCellsMs` plays the walk
//              fallback instead — graceful, but visibly not a swing, so it is measured, not assumed.
//              `swingStallMs` is the gap between those two: how long a player who swings the instant
//              the hero appears would see walk. On the uncured build it is 0 by construction (the
//              slot was atomic), and the honest cost of the cure is exactly this number.
//  claim-warm  menu -> town -> run in one page, the normal route, so the advance stream has already
//              warmed the group and the claim cells are served from cache.

import { chromium } from 'playwright';

const BASE = process.env.GR_TIMINGS_BASE ?? 'http://127.0.0.1:5294';
const LABEL = process.argv[2] ?? 'unlabelled';
const RUNS = Number(process.env.GR_TIMINGS_RUNS ?? 3);
const SCENARIOS = (process.env.GR_TIMINGS_SCENARIOS ?? 'town,claim-cold,claim-warm').split(',');
const CLAIM_CELL = /char-hero-sheet-(work8|attack8)-/;
const ATTACK_CELL = /char-hero-sheet-attack8-/;
const PAN_CELL = /char-hero-sheet-work8-/;
const CLAIM_CELL_TOTAL = 35;

const ARMS = (process.env.GR_TIMINGS_ARMS ?? 'loopback,8mbps-100ms').split(',').map((name) => ({
  name,
  // 8 Mbps down / 100 ms RTT, the emulation the bisect and the audio slice both used.
  conditions: name === 'loopback' ? null
    : { offline: false, latency: 100, downloadThroughput: 1_000_000, uploadThroughput: 500_000 },
}));

// The same seeded profile e2e/asset-diet.spec.ts installs in its beforeEach, so the page opens on
// the start menu (an unseeded page opens the profile picker and has no enter-town button) and the
// first-claim guide is out of the way. Keys mirror src/game/ProfileStorage.ts + MetaProgress.ts.
const seedProfile = () => {
  localStorage.clear();
  sessionStorage.clear();
  const PROFILE_KEY = 'gr.profile.v2';
  const key = (logical) => `${PROFILE_KEY}.robin.${logical}`;
  localStorage.setItem(PROFILE_KEY, JSON.stringify({
    version: 2,
    activeId: 'robin',
    profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
  }));
  localStorage.setItem(key('gr.town.name.v1'), 'Quartz Hill');
  localStorage.setItem(key('gr.meta.v1'), JSON.stringify({ version: 1, tracks: { territory: 3, science: 0, hero: 0, agent: 0 } }));
  localStorage.setItem(key('gr.firstClaim.done.v1'), '1');
};

const observer = () => {
  const state = { origin: performance.timeOrigin, marks: {}, transitions: [], lastAsset: '' };
  window.__timings = state;
  const mark = (name) => { if (state.marks[name] === undefined) state.marks[name] = performance.now(); };
  const tick = () => {
    const canvas = document.querySelector('#game-canvas');
    if (canvas) {
      const label = canvas.dataset.assetLoadingLabel;
      const loading = canvas.dataset.assetLoadingState;
      const key = `${label}:${loading}`;
      if (loading && key !== state.lastAsset) { state.transitions.push({ key, at: performance.now() }); state.lastAsset = key; }
      if (canvas.dataset.spriteClipGroups) mark(`groups:${canvas.dataset.spriteClipGroups}`);
      if (canvas.dataset.assetPrefetchState) mark(`prefetch:${canvas.dataset.assetPrefetchState}`);
    }
    const hero = window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations?.['char.hero'];
    if (hero?.loaded) mark('hero:loaded');
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

const settle = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

async function until(predicate, timeoutMs, label) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await predicate()) return true;
    await settle(100);
  }
  process.stderr.write(`  timed out waiting for ${label}\n`);
  return false;
}

async function measure(browser, arm, scenario) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  await page.addInitScript(seedProfile);
  await page.addInitScript(observer);
  const responses = [];
  const errors = [];
  page.on('response', (response) => responses.push({ url: response.url(), at: Date.now() }));
  page.on('pageerror', (error) => errors.push(String(error)));
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  if (arm.conditions) await cdp.send('Network.emulateNetworkConditions', arm.conditions);

  const seen = (pattern) => responses.filter(({ url }) => pattern.test(url));
  const heroLoaded = () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations?.['char.hero']?.loaded === true).catch(() => false);
  const enterRun = async () => {
    runNavigatedAt = Date.now();
    await page.goto(`${BASE}/?debug&nowaves&nolevel&seed=hero-clip-split`, { waitUntil: 'commit' });
    await until(async () => await heroLoaded(), 120_000, 'hero sprite loaded');
    await until(() => seen(CLAIM_CELL).length >= CLAIM_CELL_TOTAL, 120_000, `${CLAIM_CELL_TOTAL} claim cells`);
  };

  let runNavigatedAt = 0;
  const result = { arm: arm.name, scenario, errors };
  if (scenario === 'town' || scenario === 'claim-warm') {
    await page.goto(`${BASE}/?town3dPilot=all&tier=full`, { waitUntil: 'commit' });
    await page.getByTestId('start-menu-enter-town').click({ timeout: 120_000 });
    await page.waitForFunction(
      () => document.querySelector('#game-canvas')?.dataset.assetLoadingState === 'ready'
        && Number(document.querySelector('#game-canvas')?.dataset.assetLoadingTotal ?? 0) > 0,
      null,
      { timeout: 180_000 },
    );
    result.claimCellsInTownWindow = seen(CLAIM_CELL).length;
    if (scenario === 'claim-warm') {
      // The deferred groups warm when the advance stream's plan drains; give that its chance.
      await until(
        async () => await page.evaluate(() => document.querySelector('#game-canvas')?.dataset.spriteClipGroups === 'claim town').catch(() => false),
        120_000,
        'the advance stream to warm the claim group',
      );
      result.warmedInTown = seen(CLAIM_CELL).length;
      await enterRun();
    }
  } else {
    await enterRun();
  }

  const { origin, marks, transitions } = await page.evaluate(() => window.__timings);
  const at = (name) => (marks[name] === undefined ? null : Math.round(origin + marks[name]));
  const lastAt = (pattern, after = 0) => {
    const hits = seen(pattern).filter(({ at: t }) => t >= after);
    return hits.length ? Math.max(...hits.map(({ at: t }) => t)) : null;
  };
  const rel = (value, base) => (value === null || base === null ? null : value - base);
  // The town's OWN window: its first `loading`, then the first `ready` after it. The menu
  // publishes a 0/0 `ready` before the town's loader is installed, so ordering matters.
  const townStartIndex = transitions.findIndex(({ key }) => key === 'the town:loading');
  const townEndIndex = townStartIndex < 0 ? -1 : transitions.findIndex(({ key }, index) => index > townStartIndex && key === 'the town:ready');
  const stamp = (index) => (index < 0 ? null : Math.round(origin + transitions[index].at));
  const townLoading = stamp(townStartIndex);
  const townReady = stamp(townEndIndex);
  // The run scene's own zero: the claim declares its clip groups in src/game/Game.ts module scope,
  // which is the first thing the run does, so the first `groups:` mark of the run page is its start.
  const runStart = runNavigatedAt || at('groups:claim town') || at('groups:town') || null;

  result.townReadyMs = rel(townReady, townLoading);
  result.claimCellsInsideTownWindow = townReady !== null && lastAt(CLAIM_CELL) !== null && lastAt(CLAIM_CELL) <= townReady;
  result.claimCellCount = seen(CLAIM_CELL).length;
  result.heroReadyMs = rel(at('hero:loaded'), runStart);
  result.attackCellsFetchedInRun = runStart === null ? null : seen(ATTACK_CELL).filter(({ at: t }) => t >= runStart).length;
  result.attackCellsMs = runStart === null ? null : (result.attackCellsFetchedInRun === 0 ? 0 : rel(lastAt(ATTACK_CELL, runStart), runStart));
  result.panCellsMs = runStart === null ? null
    : (seen(PAN_CELL).filter(({ at: t }) => t >= runStart).length === 0 ? 0 : rel(lastAt(PAN_CELL, runStart), runStart));
  result.swingStallMs = result.attackCellsMs === null || result.heroReadyMs === null
    ? null
    : Math.max(0, result.attackCellsMs - result.heroReadyMs);
  result.groups = Object.keys(marks).filter((name) => name.startsWith('groups:')).map((name) => name.slice(7));
  await context.close();
  return result;
}

const browser = await chromium.launch();
const out = { label: LABEL, base: BASE, at: new Date().toISOString(), runs: RUNS, arms: {} };
for (const arm of ARMS) {
  out.arms[arm.name] = {};
  for (const scenario of SCENARIOS) {
    const rows = [];
    for (let run = 0; run < RUNS; run += 1) rows.push(await measure(browser, arm, scenario));
    out.arms[arm.name][scenario] = rows;
    const pick = (key) => rows.map((row) => row[key]).join('/');
    process.stderr.write(
      `${LABEL} ${arm.name.padEnd(12)} ${scenario.padEnd(11)}`
      + ` townReady=${pick('townReadyMs')} heroReady=${pick('heroReadyMs')} attackCells=${pick('attackCellsMs')}`
      + ` panCells=${pick('panCellsMs')} swingStall=${pick('swingStallMs')} claimCells=${pick('claimCellCount')}`
      + ` inWindow=${pick('claimCellsInsideTownWindow')} errors=${rows.reduce((sum, row) => sum + row.errors.length, 0)}\n`,
    );
  }
}
await browser.close();
process.stdout.write(`${JSON.stringify(out, null, 1)}\n`);
