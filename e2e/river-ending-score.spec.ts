// THE RIVER'S WIN (F-PP6-2; owner 2026-09-26, verbatim "2 - sure, lets do that", choosing "the pan is the win;
// the game writes a completed score at the pan"). Run 6 of the play proofs pulled the finale's real lever and
// panned the quiet River (30 gold, wave 0, no enemies through 35 s) but found no completed score, so its bank and
// reload cells failed (`artifacts/sol/play-proofs/run-6/e10-river/driver.ts:1416-1419` and `:1439-1441`). These
// tests prove the pan now writes that score and its reel exactly once, and that nothing writes on boot or on the
// lever alone.
//
// THE COUNTY POST IS HELD (`RIVER_STANDING_POSTS_ENABLED = false` in `src/game/Game.ts`, attended session
// 2026-09-26): no assay instrument can reproduce a River reel yet (F-RES1-1, F-RES1-6), so a posted River row would
// rank while pending and then be rejected. The spec asserts ZERO standing POSTs through every pan, reload and
// re-pull, with the dev-send flag seeded so the silence is the hold's and not the opt-in's; and it keeps the kept
// reel door-shaped by judging it in-process, with the client's `validateRunTape` and with the door's own
// `onRequest` on the body `submitCountyStanding` would build, for the day the one line flips.
//
// NO `?debug` ANYWHERE (Mistake #10). The River is reached the way the lever reaches it: the spec computes the
// lever's two sessionStorage entries and its URL with the same calls `E10FinaleSystem.launchRiver` makes
// (`getPostCreditsCharter`, `stampCharter`, `charterLineageRootId`, the `nowaves` run policy) and boots that URL.
// The real lever click behind a native Last Claim prelude is the run-6 native driver's job; it is not repeated.
//
// NOTHING LEAVES THIS MACHINE: every request to the county's origin is answered here, and the door's handler runs
// in-process with no storage bound, so it validates and stores nothing.
//
// EVIDENCE (the pan and Book screenshots, the reel, the door-shaped body and the door's answer) lands in the gitignored
// test-results/evidence/river-ending-score-1/ unless GR_REFRESH_EVIDENCE=1 asks for artifacts/river-ending-score-1/,
// so a gate run never churns a tracked file (F-RRR-5's rule, as in scripts/board-tape-gold.test.mjs).
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { onRequest as standingsDoor } from '../functions/api/standings';
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
  ? 'artifacts/river-ending-score-1'
  : 'test-results/evidence/river-ending-score-1');

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
// A fixed, well-formed anonymous id for the in-process door judgement; the door only checks its shape.
const DOOR_ANON_ID = '0123456789abcdef0123456789abcdef';

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

async function prepare(page: Page, stageLever: boolean): Promise<{ errors: Errors; standings: Standing[]; countyCalls: string[] }> {
  const errors: Errors = { console: [], page: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.console.push(message.text());
  });
  page.on('pageerror', (error) => errors.page.push(error.message));
  const standings: Standing[] = [];
  const countyCalls: string[] = [];
  await page.route(`${COUNTY_ORIGIN}/**`, async (route) => {
    const request = route.request();
    countyCalls.push(`${request.method()} ${new URL(request.url()).pathname}`);
    if (request.method() === 'POST' && new URL(request.url()).pathname === '/api/standings') {
      standings.push(JSON.parse(request.postData() ?? '{}') as Standing);
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true,"stored":true,"rank":1}' });
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
  return { errors, standings, countyCalls };
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

/**
 * The body `submitCountyStanding` would post for this score and reel, field for field (`Game.ts`, the body literal in
 * `submitCountyStanding`): the ceremony's post is held, so the spec builds it here to keep the reel door-shaped.
 */
function doorShapedStanding(reel: RunTape, score: Score): Standing & Record<string, unknown> {
  const sha256 = (text: string) => createHash('sha256').update(text).digest('hex');
  return {
    contractId: reel.contract,
    epochId: 'epoch-10-deepsky',
    score: {
      secured: true,
      waves: Math.max(0, Math.floor(score.waves ?? 0)),
      timeAlive: Math.max(0, score.timeAlive ?? 0),
      gold: Math.max(0, Math.floor(score.gold ?? 0)),
      baseValue: Math.max(0, Math.floor(score.baseValue ?? 0)),
    },
    profileName: 'Robin',
    anonId: DOOR_ANON_ID,
    difficulty: reel.difficulty,
    seed: reel.seed,
    seedMode: 'live',
    seedHash: sha256(reel.seed),
    inputLogHash: sha256(JSON.stringify(reel.inputLog)),
    tape: reel,
  };
}

async function evidence(name: string, value: unknown): Promise<void> {
  await mkdir(EVIDENCE_DIR, { recursive: true });
  await writeFile(path.join(EVIDENCE_DIR, name), `${JSON.stringify(value, null, 2)}\n`);
}

test("the River's first pan writes one completed e10-river score and its reel, posts nothing, and never writes a second", async ({ page }, testInfo) => {
  test.setTimeout(240_000);
  const { errors, standings, countyCalls } = await prepare(page, true);
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

  // (b) THE STANDING IS HELD: nothing reaches the county, although the dev-send flag would carry any post.
  await page.waitForTimeout(1500);
  expect(standings, 'the River posts no standing while RIVER_STANDING_POSTS_ENABLED is false (F-RES1-1, F-RES1-6)').toEqual([]);
  // The kept reel stays door-shaped for the day the post is enabled: the client's validator reads it back whole, and
  // the door's own handler, in-process with no store bound, admits the body `submitCountyStanding` would build.
  expect(validateRunTape(reel), 'the client validator reads the kept reel back whole').toEqual(reel);
  const standing = doorShapedStanding(reel, rivers[0]!);
  const verdict = await standingsDoor({
    request: new Request(`${COUNTY_ORIGIN}/api/standings`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(standing) }),
    env: {},
  });
  const door = await verdict.json() as { ok?: boolean; stored?: boolean; error?: string };
  expect({ status: verdict.status, door }, 'the door, run in-process with no store bound, admits the River standing').toEqual({ status: 200, door: { ok: true, stored: false } });
  await evidence(`reel-${testInfo.project.name}.json`, reel);
  await evidence(`door-shaped-standing-${testInfo.project.name}.json`, { ...standing, door: { status: verdict.status, ...door } });

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
  expect(standings, 'no standing through the pans, the reload and the re-pull').toEqual([]);

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
  testInfo.annotations.push(
    { type: 'pans', description: JSON.stringify({ first: pan, reloaded: reloadedPan, repulled: repulledPan }) },
    { type: 'county-calls', description: JSON.stringify(countyCalls) },
  );
  expect(standings, 'no standing, from the lever to the Book').toEqual([]);
  expect(countyCalls.filter((call) => call.startsWith('POST ')), 'no county write at all').toEqual([]);
  expect(errors).toEqual({ console: [], page: [] });
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
