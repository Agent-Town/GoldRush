// THE RIVER'S WIN (F-PP6-2; owner 2026-09-26, verbatim "2 - sure, lets do that", choosing "the pan is the win;
// the game writes a completed score at the pan"). Run 6 of the play proofs pulled the finale's real lever and
// panned the quiet River (30 gold, wave 0, no enemies through 35 s) but found no completed score, so its bank and
// reload cells failed (`artifacts/sol/play-proofs/run-6/e10-river/driver.ts:1416-1419` and `:1439-1441`). These
// tests prove the pan now writes that score and its reel exactly once, and that nothing writes on boot or on the
// lever alone.
//
// THE COUNTY POST (river-assay-1; `RIVER_STANDING_POSTS_ENABLED = true` in `src/game/Game.ts`). It was held while no
// assay instrument could reproduce a River reel (F-RES1-1, F-RES1-6, and F-RVA1-1: a live run moved by raw axes its
// reel records rounded). Now the pan posts ONE standing carrying the reel it kept, a second pan, a reload and a re-pull
// post nothing more, the county's own door stores it pending, and the county's own assay worker, run here against
// that standing, replays the reel in the ceremony world and VERIFIES it; the verified row then stands on the Claim
// Ledger's county board.
//
// NO `?debug` ANYWHERE (Mistake #10). The River is reached the way the lever reaches it: the spec computes the
// lever's two sessionStorage entries and its URL with the same calls `E10FinaleSystem.launchRiver` makes
// (`getPostCreditsCharter`, `stampCharter`, `charterLineageRootId`, the `nowaves` run policy) and boots that URL.
// The real lever click behind a native Last Claim prelude is the run-6 native driver's job; it is not repeated.
//
// NOTHING LEAVES THIS MACHINE: every request to the county's origin is answered here by the door's own handlers,
// in-process, over an in-memory store that lives for one test; the worker reaches the same handlers over 127.0.0.1,
// and its instrument's vite server binds a free local port.
//
// EVIDENCE (the pan, Book and county-board screenshots, the reel, the posted standing and the door's answers) lands in
// the gitignored test-results/evidence/river-assay-1/ unless GR_REFRESH_EVIDENCE=1 asks for
// artifacts/river-assay-1/spec/, so a gate run never churns a tracked file (F-RRR-5's rule, as in
// scripts/board-tape-gold.test.mjs).
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { createServer as createHttpServer, type IncomingMessage } from 'node:http';
import { createServer as createNetServer } from 'node:net';
import { homedir } from 'node:os';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { onRequest as standingsDoor, onRequestAssayQueue, onRequestAssayVerdict } from '../functions/api/standings';
import { charterLineageRootId } from '../src/charter/CharterSchema';
import { stampCharter } from '../src/charter/CharterStamp';
import { getPostCreditsCharter } from '../src/charter/TheRiver';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import {
  FIRST_CLAIM_DONE_KEY,
  PROFILE_KEY,
  SCOREBOARD_KEY,
  TOWN_NAME_KEY,
  TOWN_WELCOME_SEEN_KEY,
  profileDataKey,
  type ProfileState,
} from '../src/game/ProfileStorage';
import { RUN_TAPES_KEY, validateRunTape, type RunTape } from '../src/game/RunTape';
import { ACTIVE_EPOCH_KEY, CHARTER_LAUNCH_KEY, listEpochs } from '../src/meta/ContractFamilies';
import { researchStateKey } from '../src/meta/ResearchTree';
import { STORY_TALES_STORAGE_KEY } from '../src/story/settings';
import { TELEMETRY_DEV_SEND_STORAGE_KEY } from '../src/telemetry/payload';

const PROFILE_ID = 'robin';
const RIVER_ID = 'e10-river';
// `PLAYER_CONTRACT_LAUNCH_KEY` is module-private in `src/meta/ContractFamilies.ts`; `e2e/cp04-lever.spec.ts` stages
// the same literal.
const PLAYER_LAUNCH_KEY = 'gr.contract.launch.v1';
const COUNTY_ORIGIN = 'https://agenttown.app';
const SEEDED_AT = 1000;
// The scores that matter when the lever is earned: the secured Last Claim, and nothing yet for the River.
const SEEDED_SCORES = JSON.stringify([
  { kills: 40, gold: 120, timeAlive: 240, at: SEEDED_AT, waves: 8, secureWave: 8, deepestWave: 8, secured: true, contractId: 'e10-last-claim' },
]);
const EVIDENCE_DIR = path.resolve(process.env.GR_REFRESH_EVIDENCE === '1'
  ? 'artifacts/river-assay-1/spec'
  : 'test-results/evidence/river-assay-1');
// The assay worker's shared secret, for the door this spec serves in-process and nowhere else.
const WORKER_SECRET = 'river-ending-score-local-assay';
// The worker refuses every Node but the canonical one (`assertCanonicalAssayNode`); its version is read from the
// script that declares it (a plain .mjs this TypeScript cannot import), and resolved as the worker's own tests do.
const CANONICAL_ASSAY_NODE_VERSION = /CANONICAL_ASSAY_NODE_VERSION = '([^']+)'/.exec(readFileSync('scripts/assay-replay-agent.mjs', 'utf8'))?.[1] ?? 'unknown';
const WORKER_NODE = process.versions.node === CANONICAL_ASSAY_NODE_VERSION
  ? process.execPath
  : path.join(homedir(), '.nvm/versions/node', `v${CANONICAL_ASSAY_NODE_VERSION}`, 'bin/node');

// THE LEVER, derived exactly as `E10FinaleSystem.launchRiver` derives it.
const RIVER_CHARTER = getPostCreditsCharter();
const STAMPED = stampCharter(RIVER_CHARTER);
if (!STAMPED.ok) throw new Error(`THE RIVER no longer stamps: ${JSON.stringify(STAMPED.reasons)}`);
const LEVER = (() => {
  const templateId = charterLineageRootId(RIVER_CHARTER);
  const next = new URLSearchParams({ contract: templateId });
  if (RIVER_CHARTER.envelope.seedPolicy.mode === 'fixed') next.set('seed', RIVER_CHARTER.envelope.seedPolicy.seed);
  if (RIVER_CHARTER.envelope.runPolicy?.waves === 'none') next.set('nowaves', '');
  return { templateId, document: STAMPED.document, url: `/?${next.toString()}` };
})();

type Score = {
  contractId?: string;
  secured?: boolean;
  completed?: boolean;
  waves?: number;
  secureWave?: number;
  deepestWave?: number;
  gold?: number;
  kills?: number;
  timeAlive?: number;
  baseValue?: number;
  at?: number;
};
type Seam = { id: string; x: number; z: number };
type RunView = {
  sim: number;
  gold: number;
  wave: number;
  enemies: number;
  paused: boolean;
  hero: { x: number; z: number };
  channeling: boolean;
  seams: Seam[];
  contract: { activeId: string; fallbackReason: string | null; name: string };
};
type Errors = { console: string[]; page: string[] };
type Standing = { contractId: string; epochId: string; seedMode: string; score: Record<string, number | boolean>; tape?: RunTape };
type Store = { get(key: string): Promise<string | null>; put(key: string, value: string): Promise<void> };
type DoorAnswer = { status: number; body: Record<string, unknown> };
type County = { errors: Errors; standings: Standing[]; answers: DoorAnswer[]; countyCalls: string[]; store: Store };

// The county's store for one test: the door's handlers read and write it, in this process.
function makeStore(): Store {
  const values = new Map<string, string>();
  return { get: async (key) => values.get(key) ?? null, put: async (key, value) => { values.set(key, value); } };
}

// One request to the county's own door (`functions/api/standings.ts`), in-process, over the test's store.
async function door(
  handler: typeof standingsDoor,
  store: Store,
  request: { method: string; path: string; body?: string; assayKey?: string },
): Promise<{ status: number; text: string }> {
  const response = await handler({
    request: new Request(`http://127.0.0.1${request.path}`, {
      method: request.method,
      headers: { 'content-type': 'application/json', 'CF-Connecting-IP': '127.0.0.1', ...(request.assayKey ? { 'x-assay-key': request.assayKey } : {}) },
      ...(request.body === undefined ? {} : { body: request.body }),
    }),
    env: { TELEMETRY: store, ASSAY_WORKER_SECRET: WORKER_SECRET },
  });
  return { status: response.status, text: await response.text() };
}

async function slip(store: Store, reel: RunTape): Promise<Record<string, unknown>> {
  const query = new URLSearchParams({ contract: RIVER_ID, epoch: 'epoch-10-deepsky', verdict: reel.id });
  return JSON.parse((await door(standingsDoor, store, { method: 'GET', path: `/api/standings?${query}` })).text);
}

async function freePort(): Promise<number> {
  const server = createNetServer();
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  await new Promise<void>((resolve) => server.close(() => resolve()));
  if (!address || typeof address === 'string') throw new Error('no free port');
  return address.port;
}

/**
 * The county's own assay worker (`scripts/assay-worker.mjs --once`, no dry run) against the door's two assay routes,
 * served over 127.0.0.1 from the test's store: it fetches the pending River row, replays its reel with the real browser
 * instrument (`scripts/assay-replay.mjs`) and posts the verdict back to the door, which records it.
 */
async function runAssayWorker(store: Store): Promise<{ code: number | null; lines: Array<Record<string, unknown>>; stderr: string }> {
  const routes: Record<string, typeof standingsDoor> = {
    '/api/standings/assay-queue': onRequestAssayQueue,
    '/api/standings/assay-verdict': onRequestAssayVerdict,
  };
  const readBody = async (incoming: IncomingMessage) => {
    const chunks: Buffer[] = [];
    for await (const chunk of incoming) chunks.push(chunk as Buffer);
    return Buffer.concat(chunks).toString('utf8');
  };
  const server = createHttpServer(async (incoming, outgoing) => {
    const url = new URL(incoming.url ?? '/', 'http://127.0.0.1');
    const handler = routes[url.pathname];
    if (!handler) {
      outgoing.writeHead(404, { 'content-type': 'application/json' }).end('{"ok":false}');
      return;
    }
    const body = incoming.method === 'POST' ? await readBody(incoming) : undefined;
    const answer = await door(handler, store, {
      method: incoming.method ?? 'GET',
      path: `${url.pathname}${url.search}`,
      ...(body === undefined ? {} : { body }),
      assayKey: String(incoming.headers['x-assay-key'] ?? ''),
    });
    outgoing.writeHead(answer.status, { 'content-type': 'application/json' }).end(answer.text);
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('the local county did not bind');
  const replayPort = await freePort();
  try {
    return await new Promise((resolve, reject) => {
      const child = spawn(WORKER_NODE, ['scripts/assay-worker.mjs', '--once'], {
        cwd: process.cwd(),
        env: {
          ...process.env,
          ASSAY_API_BASE: `http://127.0.0.1:${address.port}`,
          ASSAY_WORKER_SECRET: WORKER_SECRET,
          GR_ASSAY_REPLAY_PORT: String(replayPort),
          ASSAY_BACKOFF_INITIAL_MS: '1000',
          ASSAY_BACKOFF_MAX_MS: '2000',
        },
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      let stdout = '';
      let stderr = '';
      child.stdout.on('data', (chunk) => { stdout += chunk; });
      child.stderr.on('data', (chunk) => { stderr += chunk; });
      child.on('error', reject);
      child.on('close', (code) => resolve({
        code,
        lines: stdout.trim().split('\n').filter(Boolean).map((line) => JSON.parse(line) as Record<string, unknown>),
        stderr,
      }));
    });
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

// A progressed profile that has just earned the lever: ONE secured Last Claim, nothing for the River. Chapters and
// research are opened the way the run-6 driver opened them, so the Book can show the E10 chapter.
function seedEntries(): Array<[string, string]> {
  const profile: ProfileState = {
    version: 2,
    activeId: PROFILE_ID,
    profiles: [{ id: PROFILE_ID, name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
  };
  const research = JSON.stringify({ version: 1, steps: 999, taken: [], proposalSalt: 0, pinnedTarget: null, metaScienceCursor: 999 });
  const logical: Array<[string, string]> = [
    [SCOREBOARD_KEY, SEEDED_SCORES],
    [META_PROGRESS_KEY, JSON.stringify({ version: 1, tracks: { territory: 40, science: 999, hero: 40, agent: 40 } })],
    [TOWN_NAME_KEY, 'Quartz Hill'],
    [ACTIVE_EPOCH_KEY, 'epoch-10-deepsky'],
    [FIRST_CLAIM_DONE_KEY, '1'],
    [TOWN_WELCOME_SEEN_KEY, '1'],
    [STORY_TALES_STORAGE_KEY, '0'],
    ...listEpochs().map((epoch): [string, string] => [researchStateKey(epoch.id), research]),
  ];
  return [
    [PROFILE_KEY, JSON.stringify(profile)],
    // A dev build posts a county standing only with this flag (`shouldPostCountyStanding`), so with it seeded every
    // standing the game tried to post would reach the route below: an empty capture is the hold's, not the opt-in's.
    [TELEMETRY_DEV_SEND_STORAGE_KEY, '1'],
    ...logical.flatMap(([key, value]): Array<[string, string]> => [[key, value], [profileDataKey(PROFILE_ID, key), value]]),
  ];
}

async function prepare(page: Page, stageLever: boolean): Promise<County> {
  const errors: Errors = { console: [], page: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.console.push(message.text());
  });
  page.on('pageerror', (error) => errors.page.push(error.message));
  const standings: Standing[] = [];
  const answers: DoorAnswer[] = [];
  const countyCalls: string[] = [];
  const store = makeStore();
  // The county's standings route is the county's own door, in-process, over this test's store: a POST is judged and
  // stored exactly as the droplet would, and the board the Claim Ledger reads is that store. Anything else the county
  // is asked answers `ok`.
  await page.route(`${COUNTY_ORIGIN}/**`, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    countyCalls.push(`${request.method()} ${url.pathname}`);
    if (url.pathname === '/api/standings') {
      const body = request.postData() ?? undefined;
      if (request.method() === 'POST') standings.push(JSON.parse(body ?? '{}') as Standing);
      const answer = await door(standingsDoor, store, { method: request.method(), path: `${url.pathname}${url.search}`, ...(body === undefined ? {} : { body }) });
      if (request.method() === 'POST') answers.push({ status: answer.status, body: JSON.parse(answer.text) as Record<string, unknown> });
      await route.fulfill({ status: answer.status, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: answer.text });
      return;
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  await page.route('**/api/telemetry', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }));
  await page.addInitScript(({ entries, lever, launchKey, charterKey }) => {
    if (sessionStorage.getItem('gr.riverEnding.seeded') === '1') return;
    localStorage.clear();
    for (const [key, value] of entries) localStorage.setItem(key, value);
    sessionStorage.clear();
    sessionStorage.setItem('gr.riverEnding.seeded', '1');
    if (!lever) return;
    sessionStorage.setItem(launchKey, lever.templateId);
    sessionStorage.setItem(charterKey, JSON.stringify({ templateId: lever.templateId, document: lever.document }));
  }, { entries: seedEntries(), lever: stageLever ? LEVER : null, launchKey: PLAYER_LAUNCH_KEY, charterKey: CHARTER_LAUNCH_KEY });
  return { errors, standings, answers, countyCalls, store };
}

// The lever's own staging, repeated on a live page: `stageCharterLaunch` writes the launch key, clears and then
// rewrites the charter entry, and `launchRiver` assigns the URL.
async function pullLever(page: Page): Promise<void> {
  await page.evaluate(({ lever, launchKey, charterKey }) => {
    sessionStorage.setItem(launchKey, lever.templateId);
    sessionStorage.removeItem(charterKey);
    sessionStorage.setItem(charterKey, JSON.stringify({ templateId: lever.templateId, document: lever.document }));
  }, { lever: LEVER, launchKey: PLAYER_LAUNCH_KEY, charterKey: CHARTER_LAUNCH_KEY });
  await page.goto(LEVER.url);
}

async function bootedRun(page: Page): Promise<RunView> {
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 12, undefined, { timeout: 60_000 });
  return view(page);
}

async function view(page: Page): Promise<RunView> {
  const snapshot = await page.evaluate(() => {
    const d = window.__THREE_GAME_DIAGNOSTICS__;
    if (!d) return null;
    return {
      sim: d.timeAlive,
      gold: d.economy.gold,
      wave: d.wave,
      enemies: d.enemiesAlive,
      paused: d.paused,
      hero: { x: d.heroPos.x, z: d.heroPos.z },
      channeling: d.harvest.channeling === true,
      seams: d.harvest.activeNodes.filter((node) => node.active).map((node) => ({ id: node.id, x: node.position.x, z: node.position.z })),
      contract: { activeId: d.contract.activeId, fallbackReason: d.contract.fallbackReason, name: d.contract.name },
    };
  });
  if (!snapshot) throw new Error('the run published no diagnostics');
  return snapshot;
}

async function enterRiver(page: Page): Promise<RunView> {
  const booted = await bootedRun(page);
  expect(booted.contract, 'the lever opens THE RIVER on its lineage root').toEqual({ activeId: LEVER.templateId, fallbackReason: null, name: 'The River' });
  await expect(page.getByTestId('contract-briefing-name')).toHaveText('The River');
  await page.getByTestId('contract-briefing-dismiss').click();
  for (let attempt = 0; attempt < 3 && (await view(page)).paused; attempt += 1) {
    await page.keyboard.press('KeyP');
    await page.waitForTimeout(250);
  }
  return view(page);
}

async function steer(page: Page, dx: number, dz: number, ms: number): Promise<void> {
  const keys: string[] = [];
  if (Math.abs(dx) > 0.35) keys.push(dx > 0 ? 'KeyD' : 'KeyA');
  if (Math.abs(dz) > 0.35) keys.push(dz > 0 ? 'KeyS' : 'KeyW');
  if (keys.length === 0) return page.waitForTimeout(ms);
  for (const key of keys) await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  for (const key of keys) await page.keyboard.up(key);
}

async function walkTo(page: Page, x: number, z: number, tolerance: number): Promise<void> {
  for (let step = 0; step < 90; step += 1) {
    const now = await view(page);
    const gap = Math.hypot(x - now.hero.x, z - now.hero.z);
    if (gap <= tolerance) return;
    await steer(page, x - now.hero.x, z - now.hero.z, Math.min(160, Math.max(16, gap * 18)));
  }
  throw new Error(`the hero never reached (${x}, ${z})`);
}

/** Walks to the nearest live seam (over the centre ford when it lies across the water) and holds until a pan lands. */
async function panOnce(page: Page): Promise<{ swingSim: number | null; landedSim: number; gold: number }> {
  const start = await view(page);
  const bank = Math.sign(start.hero.z);
  const distance = (seam: Seam) => Math.hypot(seam.x - start.hero.x, seam.z - start.hero.z);
  const seam = [...start.seams].sort((a, b) => Number(Math.sign(a.z) !== bank) - Number(Math.sign(b.z) !== bank) || distance(a) - distance(b))[0];
  if (!seam) throw new Error('the River has no live seam');
  if (bank !== 0 && Math.sign(seam.z) !== bank) {
    await walkTo(page, 0, bank * 7, 1.4);
    await walkTo(page, 0, -bank * 7, 1.4);
  }
  await walkTo(page, seam.x, seam.z, 1.1);
  let swingSim: number | null = null;
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    const now = await view(page);
    if (swingSim === null && now.channeling) swingSim = now.sim;
    if (now.gold > start.gold) return { swingSim, landedSim: now.sim, gold: now.gold };
    await page.waitForTimeout(40);
  }
  throw new Error(`no pan landed at ${seam.id} (${seam.x}, ${seam.z})`);
}

async function rawStore(page: Page): Promise<{ scores: string | null; tapes: string | null }> {
  return page.evaluate(([scoresKey, tapesKey]) => ({ scores: localStorage.getItem(scoresKey), tapes: localStorage.getItem(tapesKey) }), [
    profileDataKey(PROFILE_ID, SCOREBOARD_KEY),
    profileDataKey(PROFILE_ID, RUN_TAPES_KEY),
  ] as const);
}

function parsedScores(raw: string | null): Score[] {
  const value: unknown = JSON.parse(raw ?? '[]');
  return Array.isArray(value) ? (value as Score[]) : [];
}

function parsedTapes(raw: string | null): RunTape[] {
  const value = JSON.parse(raw ?? 'null') as { tapes?: RunTape[] } | null;
  return value?.tapes ?? [];
}

async function walkToTavern(page: Page): Promise<void> {
  for (let step = 0; step < 70; step += 1) {
    const town = await page.evaluate(() => {
      const d = window.__GR_TOWN_DIAGNOSTICS__;
      if (!d) return null;
      const tavern = d.buildings.find((building) => building.id === 'tavern');
      return { prompt: d.activePrompt, player: d.player, approach: tavern?.approach ?? null };
    });
    if (town?.prompt === 'tavern') return;
    if (!town?.approach) throw new Error('the town published no tavern approach');
    await steer(page, town.approach.x - town.player.x, town.approach.z - town.player.z, 170);
  }
  throw new Error('the tavern was not reached in 70 steps');
}

async function evidence(name: string, value: unknown): Promise<void> {
  await mkdir(EVIDENCE_DIR, { recursive: true });
  await writeFile(path.join(EVIDENCE_DIR, name), `${JSON.stringify(value, null, 2)}\n`);
}

test("the River's first pan writes one completed e10-river score and its reel, posts one standing the assay verifies, and never writes a second", async ({ page }, testInfo) => {
  test.setTimeout(420_000);
  const { errors, standings, answers, countyCalls, store } = await prepare(page, true);
  await page.goto(LEVER.url);
  const opened = await enterRiver(page);
  const before = await rawStore(page);
  expect(before.scores, 'the boot wrote no score').toBe(SEEDED_SCORES);
  const beforeScores = parsedScores(before.scores);
  const beforeAts = new Set(beforeScores.map((score) => score.at));
  expect(beforeScores.filter((score) => score.contractId === RIVER_ID), 'a fresh ending: no River score yet').toEqual([]);
  expect(parsedTapes(before.tapes), 'no reel before the pan').toEqual([]);
  expect(opened).toMatchObject({ gold: 0, wave: 0, enemies: 0 });

  // (a) THE PAN. The first gold the player's own pan lands is the ending.
  const pan = await panOnce(page);
  expect(pan.gold).toBe(5);
  await mkdir(EVIDENCE_DIR, { recursive: true });
  await page.screenshot({ path: path.join(EVIDENCE_DIR, `pan-${testInfo.project.name}.png`) });
  const atPan = await rawStore(page);
  const scores = parsedScores(atPan.scores);
  // The run-6 driver's failing bank assertion, verbatim (driver.ts:1416).
  const completed = scores.find((s) => s.contractId === 'e10-river' && !beforeAts.has(s.at) && (s.secured || s.completed));
  expect(completed, 'run 6 banks cell: a new secured/completed e10-river score after the authored pan').toBeTruthy();
  const rivers = scores.filter((score) => score.contractId === RIVER_ID);
  expect(rivers).toHaveLength(1);
  expect(rivers[0]).toMatchObject({ secured: true, waves: 0, secureWave: 0, deepestWave: 0, kills: 0, gold: 5 });
  expect(rivers[0]!.timeAlive).toBeGreaterThanOrEqual(pan.swingSim ?? 0);
  expect(rivers[0]!.timeAlive).toBeLessThanOrEqual(pan.landedSim);
  expect(scores.find((score) => score.contractId === 'e10-last-claim'), 'the earned Last Claim row is untouched').toMatchObject({ at: SEEDED_AT, waves: 8, secured: true });

  // The reel: the same outcome a secured standing's reel declares, kept in the tape ring under the River.
  const reels = parsedTapes(atPan.tapes);
  expect(reels).toHaveLength(1);
  const reel = reels[0]!;
  expect(reel.contract).toBe(RIVER_ID);
  expect(reel.inputLog.contractId).toBe(RIVER_ID);
  expect(reel.outcome).toEqual({ reason: 'secured', secured: true, waves: 0, timeAlive: rivers[0]!.timeAlive, gold: 5 });
  expect(reel.inputLog.durationTicks).toBeGreaterThan(0);
  expect(reel.meta?.engineHash).toMatch(/^[a-f0-9]{64}$/);

  // (b) THE STANDING: ONE post at the pan, carrying the reel the pan kept; the county's door stores it, pending.
  expect(validateRunTape(reel), 'the client validator reads the kept reel back whole').toEqual(reel);
  await expect.poll(() => standings.length, { message: 'the pan posts its standing', timeout: 15_000 }).toBe(1);
  const standing = standings[0]!;
  expect(standing, 'the standing is the River\'s completed score').toMatchObject({
    contractId: RIVER_ID,
    epochId: 'epoch-10-deepsky',
    seedMode: 'live',
    score: { secured: true, waves: 0, gold: 5, timeAlive: rivers[0]!.timeAlive, baseValue: 0 },
  });
  expect(standing.tape, 'the standing carries the reel the pan kept, byte for byte').toEqual(reel);
  expect(answers[0], 'the county\'s door stores the standing').toMatchObject({ status: 200, body: { ok: true, stored: true } });
  expect(await slip(store, reel), 'its verdict is pending until the assay').toMatchObject({ ok: true, tapeId: reel.id, assay: 'pending' });
  await evidence(`reel-${testInfo.project.name}.json`, reel);
  await evidence(`standing-${testInfo.project.name}.json`, { ...standing, door: answers[0] });

  // (3) A SECOND PAN on the same run writes nothing more.
  await expect.poll(async () => (await view(page)).gold, { timeout: 20_000 }).toBeGreaterThanOrEqual(15);
  const afterSecondPan = await rawStore(page);
  expect(afterSecondPan.scores, 'a second pan rewrites nothing').toBe(atPan.scores);
  expect(parsedTapes(afterSecondPan.tapes), 'a second pan keeps no second reel').toEqual(reels);

  // A RELOAD reboots the staged River; its pan writes nothing more.
  await page.reload();
  await enterRiver(page);
  const reloadedPan = await panOnce(page);
  expect((await rawStore(page)).scores, 'a reload and a pan rewrite nothing').toBe(atPan.scores);

  // A RE-PULL of the lever opens the ceremony again; its pan writes nothing more.
  await pullLever(page);
  await enterRiver(page);
  const repulledPan = await panOnce(page);
  const afterRepull = await rawStore(page);
  expect(afterRepull.scores, 'a re-pull and a pan rewrite nothing').toBe(atPan.scores);
  expect(parsedTapes(afterRepull.tapes), 'a re-pull keeps no second reel').toEqual(reels);
  await page.waitForTimeout(1500);
  expect(standings, 'still one standing through the second pan, the reload and the re-pull').toHaveLength(1);

  // (c) THE ASSAY. The county's own worker, run against that standing, replays the reel in the ceremony world (the
  // instrument stages the lever's charter and `nowaves`) and verifies it; the county applies the replay's snapshot.
  expect(existsSync(WORKER_NODE), `the assay worker requires Node ${CANONICAL_ASSAY_NODE_VERSION}`).toBe(true);
  const worker = await runAssayWorker(store);
  expect(worker.code, worker.stderr).toBe(0);
  const workerVerdict = worker.lines.find((line) => (line.locator as { tapeId?: string } | undefined)?.tapeId === reel.id);
  expect(workerVerdict, 'the worker verifies the River reel').toMatchObject({
    verdict: 'verified',
    hashes: { claimed: reel.eventLogHash, replayed: reel.eventLogHash },
  });
  expect(await slip(store, reel), 'the county records the verdict').toMatchObject({ assay: 'verified', assayHash: reel.eventLogHash, ranked: true });
  await evidence(`assay-${testInfo.project.name}.json`, { worker: worker.lines, slip: await slip(store, reel) });

  // The ordinary exit (pause, Back to Town) suspends the River; the reload cell reads the score byte for byte.
  await page.getByTestId('hud-pause').click();
  await page.getByTestId('pause-back-to-town').click();
  await expect(page.getByTestId('start-menu-enter-town')).toBeVisible({ timeout: 20_000 });
  const saved = await rawStore(page);
  expect(saved.scores, 'the ordinary exit writes no score').toBe(atPan.scores);
  await page.goto('/');
  // The run-6 driver's reload cell (driver.ts:1439): the completed River score survives a plain reload byte for byte.
  expect((await rawStore(page)).scores).toBe(saved.scores);
  await page.getByTestId('start-menu-enter-town').click({ timeout: 20_000 });
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 60_000 });
  await walkToTavern(page);
  await page.getByTestId('town-open-board').click();
  await expect(page.getByTestId('contract-board')).toBeVisible();
  await page.getByTestId('contract-chapter-tab-epoch-10-deepsky').click();
  const riverBest = page.getByTestId(`contract-best-${RIVER_ID}`);
  await riverBest.scrollIntoViewIfNeeded();
  await expect(riverBest, 'the Book shows the River ending').toHaveText('Secured: wave 0, 5 gold');
  await page.screenshot({ path: path.join(EVIDENCE_DIR, `book-${testInfo.project.name}.png`) });
  expect((await rawStore(page)).scores).toBe(saved.scores);

  // (d) THE COUNTY BOARD, where the player sees it: the Claim Ledger's County Standings, the River's board, read from
  // the same door. The verified standing ranks first with the replay's own score.
  await page.goto('/');
  await page.getByTestId('start-menu-claim-ledger').click({ timeout: 20_000 });
  await page.getByTestId('claim-ledger-county-standings').click();
  await page.getByTestId(`county-standings-contract-${RIVER_ID}`).click();
  const row = page.getByTestId('county-standings-row-1');
  await expect(row, 'the verified River standing ranks first on its county board').toContainText('Robin', { timeout: 20_000 });
  await row.scrollIntoViewIfNeeded();
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await page.getByTestId('claim-ledger').screenshot({ path: path.join(EVIDENCE_DIR, `county-board-${testInfo.project.name}.png`) });
  const board = JSON.parse((await door(standingsDoor, store, { method: 'GET', path: `/api/standings?${new URLSearchParams({ contract: RIVER_ID, epoch: 'epoch-10-deepsky' })}` })).text) as {
    board: Array<Record<string, unknown>>;
  };
  expect(board.board, 'one ranked River row, verified, at the replay\'s own score').toEqual([
    expect.objectContaining({ rank: 1, profileName: 'Robin', assay: 'verified', secured: true, waves: 0, gold: 5, timeAlive: rivers[0]!.timeAlive }),
  ]);
  testInfo.annotations.push(
    { type: 'pans', description: JSON.stringify({ first: pan, reloaded: reloadedPan, repulled: repulledPan }) },
    { type: 'county-calls', description: JSON.stringify(countyCalls) },
  );
  expect(standings, 'one standing, from the lever to the county board').toHaveLength(1);
  expect(countyCalls.filter((call) => call.startsWith('POST ')), 'one county write: the standing').toEqual(['POST /api/standings']);
  expect(errors).toEqual({ console: [], page: [] });
});

test('a River run paused and resumed mid-run replays to its live hash', async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  const { errors, standings, store } = await prepare(page, true);
  await page.goto(LEVER.url);
  await enterRiver(page);
  await steer(page, -1, 0, 200);
  await page.keyboard.press('KeyP');
  await expect.poll(async () => (await view(page)).paused).toBe(true);
  const pausedAt = (await view(page)).sim;
  await page.waitForTimeout(250);
  expect((await view(page)).sim).toBe(pausedAt);
  await page.keyboard.press('KeyP');
  await expect.poll(async () => (await view(page)).paused).toBe(false);
  await panOnce(page);
  await expect.poll(() => standings.length).toBe(1);
  const reel = parsedTapes((await rawStore(page)).tapes)[0]!;
  expect(reel.inputLog.entries.flatMap((entry) => entry.a ?? []).filter((action) => 'type' in action && action.type === 'set_pause'))
    .toEqual([{ type: 'set_pause', paused: true }]);
  const worker = await runAssayWorker(store);
  expect(worker.code, worker.stderr).toBe(0);
  expect(worker.lines.find((line) => (line.locator as { tapeId?: string } | undefined)?.tapeId === reel.id))
    .toMatchObject({ verdict: 'verified', hashes: { claimed: reel.eventLogHash, replayed: reel.eventLogHash } });
  expect(errors).toEqual({ console: [], page: [] });
  const directory = path.resolve('artifacts/tape-pause-fix-1/spec');
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, `reel-${testInfo.project.name}.json`), `${JSON.stringify(reel, null, 2)}\n`);
  await writeFile(path.join(directory, `proof-${testInfo.project.name}.json`), `${JSON.stringify({ pausedAt, worker, errors }, null, 2)}\n`);
  await page.screenshot({ path: path.join(directory, `pan-${testInfo.project.name}.png`) });
});

test('a boot of the River with no player action writes nothing', async ({ page }) => {
  test.setTimeout(90_000);
  const { errors, standings } = await prepare(page, true);
  await page.goto(LEVER.url);
  const booted = await bootedRun(page);
  expect(booted.contract).toEqual({ activeId: LEVER.templateId, fallbackReason: null, name: 'The River' });
  const before = await rawStore(page);
  expect(before.scores, 'the boot wrote no score').toBe(SEEDED_SCORES);
  // No click, no key: the briefing stays up while the quiet River runs on.
  await expect.poll(async () => (await view(page)).sim, { timeout: 45_000 }).toBeGreaterThanOrEqual(12);
  const idle = await view(page);
  expect(idle).toMatchObject({ gold: 0, wave: 0, enemies: 0, channeling: false });
  const after = await rawStore(page);
  expect(after.scores, 'no score on boot or on the lever alone').toBe(before.scores);
  expect(parsedScores(after.scores).filter((score) => score.contractId === RIVER_ID)).toEqual([]);
  expect(parsedTapes(after.tapes), 'no reel on boot or on the lever alone').toEqual([]);
  expect(standings, 'no standing on boot or on the lever alone').toEqual([]);
  expect(errors).toEqual({ console: [], page: [] });
});

test('a plain boot of ?contract=e10-river, and the Book-staged raw River, are clean and write nothing', async ({ page }) => {
  test.setTimeout(90_000);
  const { errors, standings } = await prepare(page, false);
  await page.goto(`/?contract=${RIVER_ID}`);
  const plain = await bootedRun(page);
  const before = await rawStore(page);
  expect(before.scores, 'the boot wrote no score').toBe(SEEDED_SCORES);
  await page.waitForTimeout(3000);
  // The raw River route as the Book launches it: `stagePlayerContractLaunch` writes only the launch key.
  await page.evaluate((launchKey) => sessionStorage.setItem(launchKey, 'e10-river'), PLAYER_LAUNCH_KEY);
  await page.goto(`/?contract=${RIVER_ID}`);
  const raw = await bootedRun(page);
  await page.waitForTimeout(3000);
  const after = await rawStore(page);
  test.info().annotations.push({ type: 'plain-boot', description: JSON.stringify(plain.contract) }, { type: 'raw-river', description: JSON.stringify(raw.contract) });
  expect(raw.contract.name).toBe('The River');
  expect(after.scores, 'neither boot writes a score').toBe(before.scores);
  expect(parsedTapes(after.tapes)).toEqual([]);
  expect(standings).toEqual([]);
  expect(errors).toEqual({ console: [], page: [] });
});
