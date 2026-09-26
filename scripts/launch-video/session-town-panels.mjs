// scripts/launch-video/session-town-panels.mjs: the town's paper and ledgers (task launch-video-capture-2).
//
// Capture-list items 6 (the Herald, issue No. 5, for B8's printed ending), 7 (the Field Book, for B10) and 8 (the
// Ride Together invitation, for B10). Each part is labelled in its own sidecar:
//   --herald        STAGED. No profile has turned the Baron back on this engine and the owner will not ride him for
//                   the camera (2026-09-26), so the paper that prints the ending is opened on the gazette e2e's own
//                   seeded profile (e2e/gazette-living.spec.ts seedProfile: Wren of Quartz Hill, four secured
//                   contracts including the Baron). Opened the player's way: the town badge, the index, issue No. 5,
//                   the wheel down the page.
//   --field-book    Two takes. REAL: the Claim Ledger's Field Book on Wren's ledger with the county unreachable (every
//                   request to the live county aborted), framed on THE FRONT DESK, which names no rider. STAGED: the
//                   same page with the e2e's fixture standings served locally (e2e/field-book.spec.ts) and the name
//                   column hidden by a capture-side style rule, because the Field Book has no unnamed presentation
//                   (src/encyclopedia/reader.ts renderFieldBookRow prints each rider's self-declared model or harness)
//                   and the owner ruled every board unnamed on camera (2026-09-26, "8 - unnamed").
//   --ride-together Two takes. REAL: the tavern board's Ride Together card, opened, before any claim is opened. STAGED:
//                   "Open the Claim" answered by the e2e's fixture code (e2e/mp-07c-3-invitation.spec.ts) served
//                   locally, since the relay is a live service and no request may leave the machine; framed above
//                   the monospace command (F-VIBE-13).
//
// Usage, inside the drain lock (see batch.sh):
//   node scripts/launch-video/session-town-panels.mjs --viewport desktop --take t1 --herald --field-book --ride-together

import { parseArgs } from 'node:util';
import {
  CAPTURE_NAME, CAPTURE_TOWN, TakeRecorder, VIEWPORTS, collectErrors, installStopHandler, launchCaptureBrowser,
  loadLineage, log, networkVerdict, newCaptureContext, setHudVisible, sleep, takeName, writeSidecar,
} from './lib/capture.mjs';
import { openBoard, waitForTown } from './lib/town.mjs';

const { values: args } = parseArgs({
  options: {
    viewport: { type: 'string', default: 'desktop' },
    take: { type: 'string', default: 't1' },
    lineage: { type: 'string', default: 'wren' },
    herald: { type: 'boolean', default: false },
    'field-book': { type: 'boolean', default: false },
    'ride-together': { type: 'boolean', default: false },
  },
});
const viewport = args.viewport;
const shape = VIEWPORTS[viewport];
const recorders = [];
installStopHandler(() => recorders);
const summary = { script: 'session-town-panels', viewport, take: args.take, startedAt: new Date().toISOString(), takes: [] };

// ---- the STAGED Herald store: e2e/gazette-living.spec.ts seedProfile, with the capture name -------------------
function heraldSeedState() {
  const origin = new URL(process.env.GR_CAPTURE_BASE_URL ?? 'http://127.0.0.1:5322').origin;
  const id = 'wren';
  const scoped = (key) => `gr.profile.v2.${id}.${key}`;
  const secured = (contractId, at) => ({ waves: 20, kills: 40, gold: 900, timeAlive: 600, at, secured: true, secureWave: 20, contractId, profileName: CAPTURE_NAME });
  const scores = JSON.stringify([secured('the-claim', 1000), secured('e1-dry-gulch', 2000), secured('e1-twin-banks', 3000), secured('e1-baron', 4000)]);
  const meta = JSON.stringify({ version: 1, tracks: { territory: 3, science: 0, hero: 0, agent: 0 } });
  const profile = JSON.stringify({ version: 2, activeId: id, profiles: [{ id, name: CAPTURE_NAME, createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [], trailGuide: true }] });
  const items = [
    ['gr.profile.v2', profile],
    [scoped('gr.town.name.v1'), CAPTURE_TOWN], ['gr.town.name.v1', CAPTURE_TOWN],
    [scoped('gr.meta.v1'), meta], ['gr.meta.v1', meta],
    [scoped('gr.firstClaim.done.v1'), '1'], ['gr.firstClaim.done.v1', '1'],
    [scoped('gr.scores.v2'), scores], ['gr.scores.v2', scores],
  ];
  return { cookies: [], origins: [{ origin, localStorage: items.map(([name, value]) => ({ name, value })) }] };
}

// ---- the e2e's fixture board (e2e/field-book.spec.ts, "plain boot renders and expands the Minds and Rigs tables")
function fieldBookFixture(url) {
  const now = Date.now();
  const view = url.searchParams.get('view');
  const claim = (extra) => ({ contractId: 'the-claim', score: { secured: true, waves: 20, timeAlive: 620, gold: 200, baseValue: 400 }, difficulty: 'trail', submittedAt: now - 60_000, ...extra });
  const groups = view === 'byHarness'
    ? { byHarness: [
      { harness: 'codex-cli', aggregate: { standings: 1, contracts: 1, crowns: 1, bestWaves: 20, totalTokensIn: 90_000, totalTokensOut: 8_000, totalCalls: 18, declaredCells: 1, undeclaredCells: 0, latestSubmittedAt: now - 60_000 }, contracts: [claim({ tokensIn: 90_000, tokensOut: 8_000, calls: 18, harness: 'codex-cli', harnessVersion: '2026.08', config: 'medium' })] },
      { harness: 'unknown-rig', aggregate: { standings: 1, contracts: 1, crowns: 0, bestWaves: 14, declaredCells: 0, undeclaredCells: 1, latestSubmittedAt: now - 86_400_000 }, contracts: [{ contractId: 'e1-dry-gulch', score: { secured: true, waves: 14, timeAlive: 614, gold: 140, baseValue: 280 }, difficulty: 'vein-hunter', harness: 'unknown-rig', submittedAt: now - 86_400_000 }] },
      { harness: 'undeclared rig', aggregate: { standings: 1, contracts: 1, crowns: 0, bestWaves: 12, declaredCells: 0, undeclaredCells: 1, latestSubmittedAt: now - 120_000 }, contracts: [{ contractId: 'the-claim', score: { secured: true, waves: 12, timeAlive: 612, gold: 120, baseValue: 240 }, difficulty: 'greenhorn', submittedAt: now - 120_000 }] },
    ] }
    : { byStack: [
      { model: 'gpt-5.6-sol', aggregate: { standings: 2, contracts: 2, crowns: 1, bestWaves: 20, totalTokensIn: 90_000, totalTokensOut: 8_000, totalCalls: 18, declaredCells: 1, undeclaredCells: 1, latestSubmittedAt: now - 60_000 }, contracts: [claim({ tokensIn: 90_000, tokensOut: 8_000, calls: 18, harness: 'codex', harnessVersion: '2026.08', worldModel: 'sim-import', config: 'medium' }), { contractId: 'e1-dry-gulch', score: { secured: true, waves: 14, timeAlive: 614, gold: 140, baseValue: 280 }, difficulty: 'vein-hunter', harness: 'gr-sim', submittedAt: now - 86_400_000, assayStatus: 'pending' }] },
      { model: 'pi-v4', aggregate: { standings: 1, contracts: 1, crowns: 0, bestWaves: 20, declaredCells: 0, undeclaredCells: 1, latestSubmittedAt: now - 180_000 }, contracts: [{ contractId: 'e1-dry-gulch', score: { secured: true, waves: 20, timeAlive: 700, gold: 260, baseValue: 420 }, difficulty: 'trail', harness: 'pi', submittedAt: now - 180_000 }] },
      { model: 'undeclared rider', aggregate: { standings: 1, contracts: 1, crowns: 0, bestWaves: 12, declaredCells: 0, undeclaredCells: 1, latestSubmittedAt: now - 120_000 }, contracts: [{ contractId: 'the-claim', score: { secured: true, waves: 12, timeAlive: 612, gold: 120, baseValue: 240 }, difficulty: 'greenhorn', submittedAt: now - 120_000 }] },
    ] };
  return { ok: true, view, epochId: 'epoch-1-frontier', contracts: ['the-claim', 'e1-dry-gulch', 'e1-night-shift', 'e1-twin-banks', 'e1-baron'], ...groups };
}
// The capture-side rule that keeps every rider unnamed on the fixture board: the row headers (self-declared model
// or harness, and their learn-more links) are hidden; the column and the numbers stay.
const UNNAMED_BOARD_RULE = ['[data-testid="field-book-aggregate"] tbody th[scope="row"] > *', '[data-testid="field-book-aggregate"] .field-book__info-link'];

const RIDE_CODE = '0123456789ABCDEF01234567';

async function take(browser, { name, beats, map, staged, stagedReason, storageState, fulfil = [], run }) {
  const { context, ledger } = await newCaptureContext(browser, viewport, { storageState, fulfil });
  const page = await context.newPage();
  const errors = collectErrors(page);
  const recorder = new TakeRecorder(page, { name, frame: shape.frame });
  recorders.push(recorder);
  let detail = null;
  try {
    await page.goto('about:blank');
    await recorder.start();
    detail = await run(page, recorder);
  } finally {
    const recording = await recorder.stop();
    const network = networkVerdict(ledger);
    writeSidecar(name, { take: name, beats, map, viewport: shape.id, deviceScaleFactor: shape.context.deviceScaleFactor, staged, stagedReason, plainBoot: true, capture: { name: CAPTURE_NAME, town: CAPTURE_TOWN }, detail, network, ledger: { county: ledger.county, fulfilled: ledger.fulfilled, aborted: ledger.aborted }, errors, recording });
    summary.takes.push({ name, staged, seconds: recording.seconds, network, errors });
    await context.close();
  }
}

// Story cards (a seeded store's first-boot card, a ledger page) would land over the panels; the capture hides only
// their layer, the same capture-side rule the HUD-off takes use, and never clicks one.
const STORY_LAYER_ONLY = ['[data-testid="story-beat-layer"]'];

async function enterTown(page) {
  await page.goto('/');
  await setHudVisible(page, false, { only: STORY_LAYER_ONLY });
  await page.getByTestId('start-menu-enter-town').click({ timeout: 60_000 });
  await waitForTown(page);
  await setHudVisible(page, false, { only: STORY_LAYER_ONLY });
}

const browser = await launchCaptureBrowser();
try {
  if (args.herald) {
    await take(browser, {
      name: takeName({ beat: 'B8', map: 'herald', viewport, take: args.take }), beats: ['B8'], map: 'herald', staged: true,
      stagedReason: 'seeded profile (e2e/gazette-living.spec.ts): four secured contracts including the Baron; no profile has turned him back on this engine',
      storageState: heraldSeedState(),
      run: async (page, recorder) => {
        await enterTown(page);
        recorder.mark('town');
        await sleep(2500);
        const badge = page.getByTestId('town-herald-badge');
        await recorder.still('town-badge');
        const unread = await badge.getAttribute('data-edition-number');
        await badge.click();
        await page.getByTestId('claim-herald').waitFor({ timeout: 15_000 });
        await sleep(1800);
        recorder.mark('editions');
        await recorder.still('editions');
        await page.getByTestId('claim-herald-edition-entry').filter({ hasText: 'Issue No. 5' }).click();
        await page.locator('[data-testid="claim-herald-edition"][data-edition-number="5"]').waitFor({ timeout: 10_000 });
        recorder.mark('issue-5');
        await sleep(3000);
        await recorder.still('issue-5-headline');
        const box = await page.getByTestId('claim-herald').boundingBox();
        if (box) await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        for (let step = 0; step < 24; step += 1) {
          await page.mouse.wheel(0, 28);
          await sleep(160);
        }
        recorder.mark('issue-5-read');
        await sleep(2500);
        await recorder.still('issue-5-lead');
        const headline = await page.getByTestId('claim-herald-edition-headline').textContent();
        const lead = await page.getByTestId('claim-herald-lead').textContent();
        return { unread, headline, lead: lead?.slice(0, 400) };
      },
    });
  }

  if (args['field-book']) {
    const openFieldBook = async (page) => {
      await page.goto('/');
      await setHudVisible(page, false, { only: STORY_LAYER_ONLY });
      await page.getByTestId('start-menu-claim-ledger').click({ timeout: 60_000 });
      await page.getByTestId('claim-ledger-field-book').click();
      await page.getByTestId('field-book').waitFor({ timeout: 15_000 });
    };
    await take(browser, {
      name: takeName({ beat: 'B10', map: 'field-book-front-desk', viewport, take: args.take }), beats: ['B10'], map: 'field-book', staged: false,
      storageState: loadLineage(args.lineage),
      run: async (page, recorder) => {
        await openFieldBook(page);
        await page.getByTestId('field-book-board').filter({ hasNotText: 'turns the field book' }).waitFor({ timeout: 15_000 }).catch(() => {});
        recorder.mark('field-book');
        await sleep(2500);
        await recorder.still('field-book-page');
        const desk = page.getByTestId('front-desk');
        await desk.scrollIntoViewIfNeeded();
        await sleep(1500);
        await desk.screenshot({ path: recorder.file.replace(/\.mp4$/, '-front-desk.png') });
        recorder.mark('front-desk');
        await sleep(2500);
        return { board: (await page.getByTestId('field-book-board').textContent())?.trim(), frontDesk: (await desk.textContent())?.replace(/\s+/g, ' ').trim() };
      },
    });
    await take(browser, {
      name: takeName({ beat: 'B10', map: 'field-book-fixture', viewport, take: args.take }), beats: ['B10'], map: 'field-book', staged: true,
      stagedReason: 'fixture standings from e2e/field-book.spec.ts served locally (no network); the rider name column hidden by a capture-side style rule (owner: boards unnamed; the Field Book has no unnamed presentation)',
      storageState: loadLineage(args.lineage),
      fulfil: [{ name: 'field-book-fixture', test: (url) => url.pathname === '/api/standings' && url.searchParams.has('view'), handle: (route, url) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fieldBookFixture(url)) }) }],
      run: async (page, recorder) => {
        await openFieldBook(page);
        await setHudVisible(page, false, { only: [...STORY_LAYER_ONLY, ...UNNAMED_BOARD_RULE] });
        await page.getByTestId('field-book-aggregate').waitFor({ timeout: 15_000 });
        recorder.mark('minds');
        await sleep(3000);
        await recorder.still('minds-unnamed');
        await page.getByTestId('field-book-view-byHarness').click();
        await page.getByTestId('field-book-aggregate').waitFor({ timeout: 15_000 });
        recorder.mark('rigs');
        await sleep(3000);
        await recorder.still('rigs-unnamed');
        const namesVisible = await page.evaluate(() => [...document.querySelectorAll('[data-testid="field-book-aggregate"] tbody th[scope="row"] button')].map((button) => getComputedStyle(button).visibility));
        return { rowHeaderVisibility: namesVisible };
      },
    });
  }

  if (args['ride-together']) {
    const openRide = async (page) => {
      await enterTown(page);
      await openBoard(page);
      const card = page.getByTestId('ride-together-card');
      if ((await card.getAttribute('open')) === null) await page.getByTestId('ride-together-toggle').click();
      await page.getByTestId('ride-open-claim').waitFor({ timeout: 10_000 });
      await page.getByTestId('ride-together-card').scrollIntoViewIfNeeded();
    };
    await take(browser, {
      name: takeName({ beat: 'B10', map: 'ride-together-card', viewport, take: args.take }), beats: ['B10'], map: 'ride-together', staged: false,
      storageState: loadLineage(args.lineage),
      run: async (page, recorder) => {
        await openRide(page);
        recorder.mark('ride-together');
        await sleep(2500);
        await recorder.still('ride-together-card');
        return { status: await page.getByTestId('ride-status').textContent(), word: await page.getByTestId('ride-code-word').textContent() };
      },
    });
    await take(browser, {
      name: takeName({ beat: 'B10', map: 'ride-together-invitation', viewport, take: args.take }), beats: ['B10'], map: 'ride-together', staged: true,
      stagedReason: 'the relay is a live service; "Open the Claim" was answered by the e2e fixture code (e2e/mp-07c-3-invitation.spec.ts) served locally, with an empty roster',
      storageState: loadLineage(args.lineage),
      fulfil: [
        { name: 'ride-create', test: (url) => url.pathname === '/api/multiplayer/create', handle: (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ code: RIDE_CODE }) }) },
        { name: 'ride-inspect', test: (url) => url.pathname.startsWith('/api/multiplayer/inspect'), handle: (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, started: false, players: 0, roster: [] }) }) },
      ],
      run: async (page, recorder) => {
        await openRide(page);
        await page.getByTestId('ride-open-claim').click();
        await page.waitForFunction(() => !document.querySelector('[data-testid="ride-code-word"]')?.textContent?.includes('No claim open'), null, { timeout: 15_000 });
        recorder.mark('invitation');
        await sleep(2500);
        const card = page.getByTestId('ride-together-card');
        await card.scrollIntoViewIfNeeded();
        await recorder.still('invitation');
        const invite = page.locator('.town-ui__ride-agent').last();
        const box = await invite.boundingBox();
        const cardBox = await card.boundingBox();
        if (box && cardBox) {
          const commandBox = await page.getByTestId('ride-agent-command').boundingBox();
          const clipBottom = commandBox ? commandBox.y - 4 : box.y + box.height;
          await page.screenshot({ path: recorder.file.replace(/\.mp4$/, '-above-command.png'), clip: { x: cardBox.x, y: cardBox.y, width: cardBox.width, height: Math.max(40, clipBottom - cardBox.y) } });
        }
        return { word: (await page.getByTestId('ride-code-word').textContent())?.trim(), status: await page.getByTestId('ride-status').textContent() };
      },
    });
  }
} catch (error) {
  summary.error = String(error?.stack ?? error).slice(0, 2000);
  process.exitCode = 1;
  log(`session failed: ${error?.message}`);
  for (const recorder of recorders) await recorder.stop().catch(() => {});
} finally {
  summary.finishedAt = new Date().toISOString();
  writeSidecar(`session-town-panels-${viewport}-${args.take}`, summary);
  await browser.close();
}
