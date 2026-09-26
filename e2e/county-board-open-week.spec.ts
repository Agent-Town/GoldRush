import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import engineEra from '../assets/engine-era.json' with { type: 'json' };
import registry from '../assets/rotations/rotation-seeds.json' with { type: 'json' };
import { onRequest as countyDoor } from '../functions/api/standings';
import { CONTRACT_BUNDLES } from '../src/playbook/PlaybookFormat';
import { GAME_API_ORIGIN } from '../src/app/GameApi';
import { liveSeedLabel, liveSeedRotationId, resolveLiveSeed } from '../src/game/liveSeed';
import {
  FIRST_CLAIM_DONE_KEY,
  PROFILE_KEY,
  SCOREBOARD_KEY,
  TOWN_NAME_KEY,
  profileDataKey,
  type ProfileState,
} from '../src/game/ProfileStorage';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';
import { TELEMETRY_DEV_SEND_STORAGE_KEY, TELEMETRY_OPT_IN_STORAGE_KEY } from '../src/telemetry/payload';
import { expectNoConsoleErrors, watchErrors } from './support/console-watch';

// COUNTY-BOARD-OPEN-WEEK-1 (F-LSR1-1; owner 2026-09-26, verbatim "3 - ok, lets do that"). Since the live
// seed landed, a human who secures a week's claim is stamped with that week's `rotationId`, and the public
// board kept only rows without one, so their standing reached no in-game board. The door now serves one
// week's partition on the public board's own grammar (`?rotation=<id>`, or `open`); omitted, the board is
// the all-time constant-seed board it always was. These tests read the REAL door over an in-memory ledger.

type Kv = { get(key: string): Promise<string | null>; put(key: string, value: string): Promise<void> };
type DoorAnswer = { status: number; text: string; body: Record<string, any> };

const DAY = 86_400_000;
const BOARD_KEY = 'standings:s2:epoch-1-frontier:the-claim';
const CLAIM = 'contract=the-claim&epoch=epoch-1-frontier';
const DIGEST = 'c'.repeat(64);
const CLAIM_WEEKS = [...registry.rotations]
  .filter((rotation) => typeof (rotation.seeds as Record<string, string>)['the-claim'] === 'string')
  .sort((a, b) => Date.parse(a.opensAt) - Date.parse(b.opensAt));
const LATEST = CLAIM_WEEKS.at(-1)!;
const PRIOR = CLAIM_WEEKS.at(-2)!;
const claimSeed = (rotation: (typeof registry.rotations)[number]): string => (rotation.seeds as Record<string, string>)['the-claim'];
const ROTATION_BOARDS = [...new Set(registry.rotations.flatMap((rotation) => Object.keys(rotation.seeds)))];
// A board the door keeps that no week carries (the Drill Yard is not one: the door keeps no board for it).
const OFF_WEEK = CONTRACT_BUNDLES.flatMap((bundle) => bundle.contracts.map((contract) => ({ epochId: bundle.epochId, contractId: contract.id })))
  .find(({ contractId }) => contractId !== 'e1-drill-yard' && !ROTATION_BOARDS.includes(contractId))!;
const ALL_TIME_KEYS = ['ok', 'season', 'assayEra', 'epochId', 'contractId', 'party', 'board', 'rejectedCount', 'retiredCount', 'probeCount'];
const WEEK_KEYS = ['ok', 'season', 'assayEra', 'epochId', 'contractId', 'party', 'rotationId', 'board', 'rejectedCount', 'retiredCount', 'probeCount'];
const RUN_START = {
  meta: { version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: 0 } },
  research: { version: 1, progress: { version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: 0 } }, taken: [], proposalSalt: 0, pinnedTarget: null },
};

function makeKv(): Kv {
  const store = new Map<string, string>();
  return { get: async (key) => store.get(key) ?? null, put: async (key, value) => { store.set(key, value); } };
}

// A stored row the door validates and ranks: a current-era reel (its engine hash is minted from the live
// registry, as agent-reels.spec.ts does, so a later pin cannot stale it) on the row's own seed.
function storedRow(options: {
  name: string; anon: string; waves: number; seed: string; submittedAt: number;
  rotationId?: string; riders?: string[]; assay?: 'pending' | 'verified' | 'rejected'; digest?: boolean;
}): Record<string, unknown> {
  const id = `cbw1-${options.anon.slice(0, 6)}-${options.waves}`;
  const outcome = { waves: options.waves, timeAlive: 120, gold: 40 };
  const assay = options.assay ?? 'pending';
  return {
    secured: true, ...outcome, baseValue: 60,
    profileName: options.name, anonId: options.anon, difficulty: 'trail',
    seed: options.seed, seedMode: 'live', seedHash: 'a'.repeat(64), inputLogHash: 'b'.repeat(64),
    submittedAt: options.submittedAt,
    ...(options.digest ? { stack: { declaredBy: 'self', model: 'week-test', harness: 'week-rig', harnessVersion: '1', harnessDigest: DIGEST } } : {}),
    ...(options.riders ? { party: { riderCount: options.riders.length, riders: options.riders.map((name) => ({ name })) } } : {}),
    tape: {
      version: 2, id, createdAt: 1, kept: true, contract: 'the-claim', seed: options.seed, difficulty: 'trail', simVersion: 1,
      meta: { buildId: 'abcdef12', engineHash: engineEra.engineHash, era: engineEra.era },
      runStart: RUN_START,
      inputLog: {
        version: 1, name: id, contractId: 'the-claim', seed: options.seed, difficultyPreset: 'trail', stepSeconds: 1 / 30,
        start: { x: 0, z: 12 }, durationTicks: 1, entries: [], truncated: null, primarySlot: 0, streams: [],
      },
      eventLogHash: 'fnv1a32:1234abcd',
      outcome: { reason: 'secured', secured: true, ...outcome },
    },
    assay,
    ...(assay === 'pending' ? {} : { assayedAt: options.submittedAt + 1, assayHash: 'fnv1a32:1234abcd' }),
    ...(options.rotationId ? { rotationId: options.rotationId } : {}),
  };
}

// One ledger holding every partition the board must keep apart: the all-time constant seed, the latest
// week (solo, a posse, a refused reel) and the week before it.
async function seededKv(at: number): Promise<Kv> {
  const kv = makeKv();
  await kv.put(BOARD_KEY, JSON.stringify([
    storedRow({ name: 'All-Time Rider', anon: '1'.repeat(32), waves: 40, seed: 'gold-rush', submittedAt: at - 9 * DAY, assay: 'verified', digest: true }),
    storedRow({ name: 'Week Rider', anon: '2'.repeat(32), waves: 12, seed: claimSeed(LATEST), rotationId: LATEST.id, submittedAt: at - DAY, assay: 'verified', digest: true }),
    storedRow({ name: 'Week Posse', anon: '3'.repeat(32), waves: 15, seed: claimSeed(LATEST), rotationId: LATEST.id, submittedAt: at - DAY, riders: ['Ada', 'Robin'] }),
    storedRow({ name: 'Refused Week Reel', anon: '4'.repeat(32), waves: 50, seed: claimSeed(LATEST), rotationId: LATEST.id, submittedAt: at - DAY, assay: 'rejected' }),
    storedRow({ name: 'Last Week Rider', anon: '5'.repeat(32), waves: 30, seed: claimSeed(PRIOR), rotationId: PRIOR.id, submittedAt: at - 8 * DAY }),
  ]));
  return kv;
}

async function door(kv: Kv, query: string): Promise<DoorAnswer> {
  const response = await countyDoor({ request: new Request(`http://127.0.0.1/api/standings?${query}`), env: { TELEMETRY: kv } });
  const text = await response.text();
  return { status: response.status, text, body: JSON.parse(text) as Record<string, any> };
}

// The door reads the wall clock for the week window; the door tests pin it the way scripts/test-standings.mjs
// does, so they hold on any day the registry covers (no page is open while the clock is pinned).
async function atInstant<T>(now: number, body: () => Promise<T>): Promise<T> {
  const real = Date.now;
  Date.now = () => now;
  try {
    return await body();
  } finally {
    Date.now = real;
  }
}

const names = (answer: DoorAnswer): unknown[] => (answer.body.board as Array<Record<string, unknown>>)
  .map((row) => [row.rank, row.profileName, row.rotationId ?? null]);

test('door: a named week and the open alias serve that week alone, and the all-time board keeps its shape', async () => {
  expect(CLAIM_WEEKS.length, 'the registry holds at least two Claim weeks').toBeGreaterThanOrEqual(2);
  const now = Date.parse(LATEST.opensAt) + 3.5 * DAY;
  const kv = await seededKv(now);
  await atInstant(now, async () => {
    // The all-time board: the same keys in the same order as before this slice, no week rows, no week key,
    // and the held-out cell still joins the same-digest verified row of the week the county reads.
    const allTime = await door(kv, CLAIM);
    expect(allTime.status).toBe(200);
    expect(Object.keys(allTime.body)).toEqual(ALL_TIME_KEYS);
    expect(names(allTime)).toEqual([[1, 'All-Time Rider', null]]);
    expect(allTime.body.board[0].heldOut).toEqual({ rotationId: LATEST.id, waves: 12 });
    expect(allTime.body.rejectedCount).toBe(0);

    // The week: its own rows only, ranked among themselves, named in the payload, every other rule kept.
    const week = await door(kv, `${CLAIM}&rotation=${LATEST.id}`);
    expect(week.status).toBe(200);
    expect(Object.keys(week.body)).toEqual(WEEK_KEYS);
    expect(week.body).toMatchObject({ ok: true, season: 2, assayEra: true, contractId: 'the-claim', party: 'solo', rotationId: LATEST.id });
    expect(names(week)).toEqual([[1, 'Week Rider', LATEST.id]]);
    expect(week.body.board[0].heldOut).toEqual({ rotationId: LATEST.id, waves: 12 });
    expect(week.body.rejectedCount, 'the refused reel is counted on its own week, never on the all-time board').toBe(1);

    // `open` is the week the held-out cell reads: byte-identical to naming it.
    const open = await door(kv, `${CLAIM}&rotation=open`);
    expect(open.status).toBe(200);
    expect(open.text).toBe(week.text);

    // Posses still rank within their size, on the week as on the all-time board.
    const posse = await door(kv, `${CLAIM}&party=2&rotation=${LATEST.id}`);
    expect(names(posse)).toEqual([[1, 'Week Posse', LATEST.id]]);
    expect(posse.body.board[0].party).toEqual({ riderCount: 2, riders: [{ name: 'Ada', declared: false }, { name: 'Robin', declared: false }] });
    expect(names(await door(kv, `${CLAIM}&party=2`))).toEqual([]);

    // A closed week stays readable as history; the difficulty filter and the season param still compose.
    expect(names(await door(kv, `${CLAIM}&rotation=${PRIOR.id}`))).toEqual([[1, 'Last Week Rider', PRIOR.id]]);
    expect(names(await door(kv, `${CLAIM}&difficulty=trail&rotation=${LATEST.id}`))).toEqual([[1, 'Week Rider', LATEST.id]]);
    expect(names(await door(kv, `${CLAIM}&difficulty=greenhorn&rotation=${LATEST.id}`))).toEqual([]);
    const current = await door(kv, `${CLAIM}&season=2&rotation=${LATEST.id}`);
    expect(current.text).toBe(week.text);
    const archive = await door(kv, `${CLAIM}&season=1&rotation=${LATEST.id}`);
    expect(archive.status).toBe(200);
    expect(archive.body).toMatchObject({ season: 1, rotationId: LATEST.id, board: [] });
  });
});

test('door: an unknown, unopened or non-carrying week is refused 400 bad_rotation, and every other read keeps its grammar', async () => {
  const now = Date.parse(LATEST.opensAt) + DAY;
  const kv = await seededKv(now);
  await atInstant(now, async () => {
    for (const bad of ['r1999w01', '', 'OPEN', 'open ', LATEST.id.toUpperCase(), `${LATEST.id} `]) {
      const refused = await door(kv, `${CLAIM}&rotation=${encodeURIComponent(bad)}`);
      expect(refused.status, JSON.stringify(bad)).toBe(400);
      expect(refused.body, JSON.stringify(bad)).toEqual({ ok: false, error: 'bad_rotation', message: 'Rotation not accepted.' });
    }
    // A board no week carries: naming a week, or the open one, for it is refused rather than served empty. The
    // Drill Yard is refused before that, bad_contract, exactly as without the param: the door keeps no board for it.
    expect(OFF_WEEK, 'the bundles hold a board no week carries').toBeTruthy();
    for (const week of [LATEST.id, 'open']) {
      const refused = await door(kv, `contract=${OFF_WEEK.contractId}&epoch=${OFF_WEEK.epochId}&rotation=${week}`);
      expect(refused.body.error, `${OFF_WEEK.contractId} ${week}`).toBe('bad_rotation');
      expect((await door(kv, `contract=e1-drill-yard&epoch=epoch-1-frontier&rotation=${week}`)).body.error, week).toBe('bad_contract');
    }
    expect((await door(kv, `contract=${OFF_WEEK.contractId}&epoch=${OFF_WEEK.epochId}`)).status, 'its own board still answers').toBe(200);
    // The strict param arithmetic still refuses a repeat, and the earlier checks keep their precedence.
    expect((await door(kv, `${CLAIM}&rotation=${LATEST.id}&rotation=${LATEST.id}`)).body.error).toBe('bad_contract');
    expect((await door(kv, `${CLAIM}&party=9&rotation=r1999w01`)).body.error).toBe('bad_party');
    expect((await door(kv, `${CLAIM}&difficulty=prospector&rotation=r1999w01`)).body.error).toBe('bad_difficulty');
    expect((await door(kv, `${CLAIM}&season=9&rotation=${LATEST.id}`)).body.error).toBe('bad_season');
    // The field book, the reel shelf and the transfer board did not learn the param.
    expect((await door(kv, `view=byStack&epoch=epoch-1-frontier&rotation=${LATEST.id}`)).body.error).toBe('bad_view');
    expect((await door(kv, `${CLAIM}&reel=cbw1-222222-12&rotation=${LATEST.id}`)).body.error).toBe('bad_reel');
    const transfer = await door(kv, `board=transfer&rotation=${LATEST.id}`);
    expect(transfer.status).toBe(200);
    expect(transfer.body.board).toBe('transfer');
  });

  // The week turns at its own opensAt: one millisecond before, its id is held out and `open` is last week.
  await atInstant(Date.parse(LATEST.opensAt) - 1, async () => {
    expect((await door(kv, `${CLAIM}&rotation=${LATEST.id}`)).body).toEqual({ ok: false, error: 'bad_rotation', message: 'Rotation not accepted.' });
    const open = await door(kv, `${CLAIM}&rotation=open`);
    expect(open.status).toBe(200);
    expect(open.body.rotationId).toBe(PRIOR.id);
    expect(names(open)).toEqual([[1, 'Last Week Rider', PRIOR.id]]);
  });
  await atInstant(Date.parse(LATEST.opensAt), async () => {
    const opened = await door(kv, `${CLAIM}&rotation=${LATEST.id}`);
    expect(opened.status).toBe(200);
    expect(opened.body.rotationId).toBe(LATEST.id);
  });
});

// ── THE IN-GAME BOARD (scope item 2) ─────────────────────────────────────────────────────────────────────
// The Claim Ledger's County Standings (src/encyclopedia/reader.ts) reads the REAL door above, in this
// process, over an in-memory ledger; every other request to the live county is refused and counted, so each
// test can also prove the board never reached agenttown.app.
const ART = path.resolve('artifacts/county-board-open-week-1');
const SEEDED_KEY = 'gr.county-board-open-week-1.seeded';
type CountyTraffic = { asks: string[]; methods: string[]; answers: string[]; live: string[] };

async function serveCounty(page: Page, kv: Kv): Promise<CountyTraffic> {
  const traffic: CountyTraffic = { asks: [], methods: [], answers: [], live: [] };
  await page.route('https://agenttown.app/**', (route) => {
    traffic.live.push(`${route.request().method()} ${route.request().url()}`);
    return route.abort('blockedbyclient');
  });
  // The Claim Pages records card reads the assay office's figures once a run has discovered it (the rider in the
  // standing test has); that read is not the board's, so it gets the office's empty answer here, not the fence.
  await page.route(`${GAME_API_ORIGIN}/api/stats`, (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true,"empty":true}' }));
  await page.route(`${GAME_API_ORIGIN}/api/standings**`, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const body = request.postData() ?? undefined;
    traffic.asks.push(url.search);
    traffic.methods.push(request.method());
    const response = await countyDoor({
      request: new Request(`http://127.0.0.1${url.pathname}${url.search}`, {
        method: request.method(),
        headers: { 'content-type': 'application/json', 'CF-Connecting-IP': '127.0.0.1' },
        ...(body === undefined ? {} : { body }),
      }),
      env: { TELEMETRY: kv },
    });
    const text = await response.text();
    if (request.method() === 'POST') traffic.answers.push(`${response.status} ${text}`);
    await route.fulfill({ status: response.status, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: text });
  });
  return traffic;
}

async function seedProfile(page: Page, options: { standings?: boolean; epochId?: string } = {}): Promise<void> {
  await page.addInitScript(({ keys, seededKey, standings, epochId }) => {
    // Seed once per test: the rider in the standing test navigates back to the menu, and must keep its profile.
    if (sessionStorage.getItem(seededKey)) return;
    localStorage.clear();
    sessionStorage.clear();
    const profile: ProfileState = {
      version: 2,
      activeId: 'robin',
      profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: ['story:first-contract'] }],
    };
    localStorage.setItem(keys.profile, JSON.stringify(profile));
    localStorage.setItem(keys.town, 'Quartz Hill');
    localStorage.setItem(keys.firstClaim, '1');
    localStorage.setItem(keys.activeEpoch, epochId);
    localStorage.setItem(keys.scores, '[]');
    localStorage.setItem(keys.optIn, standings ? '1' : '0');
    if (standings) localStorage.setItem(keys.devSend, '1');
    sessionStorage.setItem(seededKey, '1');
  }, {
    keys: {
      profile: PROFILE_KEY,
      town: profileDataKey('robin', TOWN_NAME_KEY),
      firstClaim: profileDataKey('robin', FIRST_CLAIM_DONE_KEY),
      activeEpoch: profileDataKey('robin', ACTIVE_EPOCH_KEY),
      scores: profileDataKey('robin', SCOREBOARD_KEY),
      optIn: TELEMETRY_OPT_IN_STORAGE_KEY,
      devSend: TELEMETRY_DEV_SEND_STORAGE_KEY,
    },
    seededKey: SEEDED_KEY,
    standings: options.standings === true,
    epochId: options.epochId ?? 'epoch-1-frontier',
  });
}

async function openCountyStandings(page: Page): Promise<void> {
  await page.getByTestId('start-menu-claim-ledger').click();
  await page.getByTestId('claim-ledger-county-standings').click();
}

async function shoot(page: Page, name: string): Promise<void> {
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  mkdirSync(ART, { recursive: true });
  await page.getByTestId('claim-ledger').screenshot({ path: path.join(ART, name) });
}

test('board: a rotation contract opens on the live week under its own label, with the all-time board one tap away', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const now = Date.now();
  const seed = resolveLiveSeed('the-claim', now);
  const label = liveSeedLabel(seed);
  const weekId = liveSeedRotationId(seed);
  expect(label, 'the Claim rides a minted week in this tree').toMatch(/^Week \d{1,2} claim$/);
  const kv = makeKv();
  await kv.put(BOARD_KEY, JSON.stringify([
    storedRow({ name: 'All-Time Rider', anon: '1'.repeat(32), waves: 40, seed: 'gold-rush', submittedAt: now - 9 * DAY }),
    storedRow({ name: 'Week Rider', anon: '2'.repeat(32), waves: 12, seed, rotationId: weekId!, submittedAt: now - 60_000 }),
    storedRow({ name: 'Week Posse', anon: '3'.repeat(32), waves: 15, seed, rotationId: weekId!, submittedAt: now - 60_000, riders: ['Ada', 'Robin'] }),
  ]));
  const watch = watchErrors(page);
  const traffic = await serveCounty(page, kv);
  await seedProfile(page);
  await page.goto('/');
  await expect(page.getByTestId('start-menu-claim-ledger')).toBeVisible();
  // Mistake #7: a plain boot neither reads nor writes the county; the board is read when a player opens it.
  expect(traffic.asks).toEqual([]);
  await openCountyStandings(page);

  const live = page.getByTestId('county-standings-week-live');
  const allTime = page.getByTestId('county-standings-week-all');
  const rows = page.locator('[data-testid^="county-standings-row-"]');
  const boardLabel = page.locator('.county-standings__board-label strong');
  await expect(live).toHaveText(label!);
  await expect(live).toHaveAttribute('aria-pressed', 'true');
  await expect(allTime).toHaveText('All time');
  await expect(allTime).toHaveAttribute('aria-pressed', 'false');
  await expect(boardLabel).toHaveText(label!);
  await expect(page.getByTestId('county-standings-row-1')).toContainText('Week Rider');
  await expect(rows).toHaveCount(1);
  expect(traffic.asks.at(-1)).toBe(`?${CLAIM}&rotation=${weekId}`);
  await shoot(page, `board-week-${testInfo.project.name}.png`);

  // Posses rank within their size on the week, as everywhere.
  await page.getByTestId('county-standings-party-2').click();
  await expect(page.getByTestId('county-standings-row-1')).toContainText('Week Posse');
  await expect(page.getByTestId('county-standings-riders-1')).toContainText('Ada');
  expect(traffic.asks.at(-1)).toBe(`?${CLAIM}&party=2&rotation=${weekId}`);
  await page.getByTestId('county-standings-party-solo').click();
  await expect(page.getByTestId('county-standings-row-1')).toContainText('Week Rider');

  // One tap to the all-time board: the request this reader always sent, the board it always showed.
  await allTime.click();
  await expect(allTime).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('county-standings-row-1')).toContainText('All-Time Rider');
  await expect(rows).toHaveCount(1);
  await expect(boardLabel).toHaveText('County board');
  expect(traffic.asks.at(-1)).toBe(`?${CLAIM}`);
  await shoot(page, `board-all-time-${testInfo.project.name}.png`);

  // The closed first ledger predates every week: no week row, no week in its request, and the choice waits.
  await page.getByTestId('county-standings-season-first').click();
  await expect(page.getByTestId('county-standings-board')).toHaveText('The first ledger holds no rows for this contract.');
  await expect(page.getByTestId('county-standings-weeks')).toHaveCount(0);
  expect(traffic.asks.at(-1)).toBe(`?${CLAIM}&season=1`);
  await page.getByTestId('county-standings-season-current').click();
  await expect(allTime).toHaveAttribute('aria-pressed', 'true');
  await live.click();
  await expect(page.getByTestId('county-standings-row-1')).toContainText('Week Rider');

  // Every rotation board opens on its own week.
  const gulch = resolveLiveSeed('e1-dry-gulch');
  await page.getByTestId('county-standings-contract-e1-dry-gulch').click();
  await expect(live).toHaveText(liveSeedLabel(gulch)!);
  await expect(page.getByTestId('county-standings-board')).toHaveText('No standings yet; the door is open.');
  expect(traffic.asks.at(-1)).toBe(`?contract=e1-dry-gulch&epoch=epoch-1-frontier&rotation=${liveSeedRotationId(gulch)}`);

  // Phone width: the week row fits the ledger and the viewport without a sideways scroll.
  const weeks = page.getByTestId('county-standings-weeks');
  expect(await weeks.evaluate((nav) => nav.scrollWidth <= nav.clientWidth)).toBe(true);
  const box = await weeks.boundingBox();
  expect(box!.x + box!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  expect(traffic.methods.every((method) => method === 'GET'), traffic.methods.join(',')).toBe(true);
  expect(traffic.live).toEqual([]);
  expectNoConsoleErrors(watch, 'county board open week');
});

test('board: a secured live run posts to its week, and its rider finds the standing on the board they open', async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  const now = Date.now();
  const open = CLAIM_WEEKS.find((week) => Date.parse(week.opensAt) <= now && now < Date.parse(week.closesAt));
  test.skip(!open, 'no Claim week is open on this clock in this tree (F-LSR1-2); the door refuses such a standing rotation_closed, as live-seed-rotation.spec.ts pins');
  const kv = makeKv();
  const watch = watchErrors(page);
  const traffic = await serveCounty(page, kv);
  await page.route('https://agenttown.app/api/telemetry', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }));
  await seedProfile(page, { standings: true });
  await page.goto('/?debug&timescale=100&nolevel');
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 5);
  await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('enemy.contactDamage', 0);
    window.__GR_TEST__?.setBalance('waves.waveInterval', 0.35);
    window.__GR_TEST__?.setBalance('waves.trickleInterval', 9999);
    window.__GR_TEST__?.setBalance('waves.pulseBase', 1);
    window.__GR_TEST__?.setBalance('waves.pulsePerWave', 0);
    window.__GR_TEST__?.setBalance('waves.pulsesPerWave', 1);
    window.__GR_TEST__?.setBalance('waves.edgesPerPulse', 1);
    window.__GR_TEST__?.resetRun();
  });
  await expect(page.getByTestId('claim-secured')).toBeVisible({ timeout: 20_000 });
  await page.getByTestId('bank-secured-claim').click();
  await expect(page.getByTestId('county-standing-answer')).toHaveText('County rank #1. This run holds the crown.', { timeout: 15_000 });
  const stored = JSON.parse((await kv.get(BOARD_KEY)) ?? '[]') as Array<Record<string, unknown>>;
  expect(stored.map((row) => [row.profileName, row.seed, row.rotationId])).toEqual([['Robin', claimSeed(open!), open!.id]]);
  mkdirSync(ART, { recursive: true });
  writeFileSync(path.join(ART, `own-standing-door-${testInfo.project.name}.json`), `${JSON.stringify({ week: open!.id, answers: traffic.answers }, null, 2)}\n`);

  // Back at the menu, the county board opens on that week, with the rider's own row on it.
  await page.goto('/');
  await openCountyStandings(page);
  await expect(page.getByTestId('county-standings-week-live')).toHaveText(liveSeedLabel(claimSeed(open!))!);
  await expect(page.getByTestId('county-standings-row-1')).toContainText('Robin');
  expect(traffic.asks.at(-1)).toBe(`?${CLAIM}&rotation=${open!.id}`);
  await shoot(page, `own-standing-${testInfo.project.name}.png`);
  // The all-time board never carries a week's row: the two boards share no rank.
  await page.getByTestId('county-standings-week-all').click();
  await expect(page.getByTestId('county-standings-board')).toHaveText('No standings yet; the door is open.');
  expect(traffic.methods.filter((method) => method === 'POST')).toHaveLength(1);
  expect(traffic.live).toEqual([]);
  expectNoConsoleErrors(watch, 'own standing on the week');
});

test('board: a contract no week carries keeps the one board it always had', async ({ page }) => {
  const watch = watchErrors(page);
  const traffic = await serveCounty(page, makeKv());
  await seedProfile(page, { epochId: 'epoch-2-steamworks' });
  await page.goto('/');
  await openCountyStandings(page);
  await expect(page.getByTestId('county-standings-board')).not.toHaveText('The county clerk turns the pages.');
  const ids = await page.locator('[data-standings-contract]').evaluateAll((buttons) => buttons.map((button) => (button as HTMLElement).dataset.standingsContract ?? ''));
  const plain = ids.find((id) => !ROTATION_BOARDS.includes(id));
  expect(plain, `a contract off the weeks among ${ids.join(', ')}`).toBeTruthy();
  await page.getByTestId(`county-standings-contract-${plain}`).click();
  await expect.poll(() => traffic.asks.at(-1)).toBe(`?contract=${plain}&epoch=epoch-2-steamworks`);
  await expect(page.getByTestId('county-standings-board')).toHaveText('No standings yet; the door is open.');
  await expect(page.getByTestId('county-standings-weeks')).toHaveCount(0);
  await expect(page.locator('.county-standings__board-label strong')).toHaveText('County board');
  if (ids.includes('e2-hill-mine')) {
    const hill = resolveLiveSeed('e2-hill-mine');
    await page.getByTestId('county-standings-contract-e2-hill-mine').click();
    await expect(page.getByTestId('county-standings-week-live')).toHaveText(liveSeedLabel(hill)!);
    await expect.poll(() => traffic.asks.at(-1)).toBe(`?contract=e2-hill-mine&epoch=epoch-2-steamworks&rotation=${liveSeedRotationId(hill)}`);
  }
  expect(traffic.live).toEqual([]);
  expectNoConsoleErrors(watch, 'a contract off the weeks');
});
