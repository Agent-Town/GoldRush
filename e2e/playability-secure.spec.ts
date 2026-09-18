/**
 * playability-secure.spec.ts — "Lets do them all." (owner, 2026-09-17)
 *
 * THE SECOND HALF OF THE PLAYABILITY QUESTION. `playability-smoke.spec.ts` asks whether a plain
 * human boot gets as far as wave 2. Astra's own status table
 * (`reviews/sol-map-art-current-status-20260909.md`, rows 38-42 and 51) says what six maps still
 * owe beyond that, in its own words: Twin Banks "died wave 14 ... No current wave20/bank/reload
 * acceptance", the Long Road "desktop survival attempts died waves 5 and 4. Secure-wave, banking
 * and reload unverified", Night Shift "Mobile08 failed before secure", the Dry Gulch "no desktop
 * full objective pass yet", the Hill Mine "hit driver panning/travel deadline at wave 7", the
 * Baron "pending authored terminal and persistence proof".
 *
 * So this spec extends the smoke's METHOD — no `?debug`, no `__GR_TEST__`, no contract registry,
 * the same progressed-profile seed, the same `?timescale=4` — to the contract's OWN objective, and
 * asks six questions in the same shape:
 *
 *   boots     the requested contract actually loaded (diagnostics.contract.fallbackReason === null)
 *   secures   the run reaches the contract's secure wave AND the Claim Secured overlay appears
 *   banks     "Return to Town" writes a secured score for THIS contract at >= its secure wave
 *   board     the Book is on screen again after banking (the run ends where the next one starts)
 *   reload    a plain reload keeps that score byte-for-byte, and the board is reachable again
 *   clean     zero console errors and zero page errors across the whole journey
 *
 * WHAT "PLAYS IT" MEANS HERE. A first-time player who has read the run card: gather at the seams
 * the map offers, spend it on the buildings the card names, take an upgrade when the Patent Office
 * opens, and keep walking a circuit on your own ground so the turrets have something to shoot
 * past. Every verb below is one of those, driven by real key events and real button clicks and
 * read back off the READ-ONLY diagnostics the smoke already reads. Nothing here grants gold,
 * teleports, sets balance, or reaches into the engine — the point is exactly that it cannot.
 *
 * THE BUILD GHOST IS HERO-ANCHORED, ON PURPOSE. `BuildSystem.updateGhostPosition`
 * (src/systems/BuildSystem.ts:1667) only follows the pointer once the CANVAS has seen a
 * pointermove; until then the ghost sits two metres north of the hero. So this spec never moves a
 * pointer over `#game-canvas` — it walks the hero to where the building goes and presses Space.
 * That is also the cheapest honest input on a 390 px phone.
 *
 * WHY IT IS NOT IN THE DEFAULT BATTERY. Six contracts x 2 projects, each playing out to wave
 * 12-25 of real simulation, is 30+ minutes of wall clock. Tagged `@slow` AND gated behind
 * GR_PLAYABILITY_SECURE, for the same mechanical reason the smoke spells out at its own
 * `test.skip`: `playwright.config.ts` sets `testDir: './e2e'`, so a tag alone would not keep it
 * out of `npm test`.
 *
 *   GR_PLAYABILITY_SECURE=1 npx playwright test e2e/playability-secure.spec.ts \
 *     --project=desktop-chrome --project=mobile-chrome --workers=1 --reporter=line
 */
import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
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
import { ACTIVE_EPOCH_KEY, listBoardContracts, listEpochs, type ContractManifest } from '../src/meta/ContractFamilies';
import { researchStateKey } from '../src/meta/ResearchTree';
import { STORY_TALES_STORAGE_KEY } from '../src/story/settings';

const ARTIFACT_ROOT = path.resolve('artifacts/open-maps-acceptance-e1-e4');
const ROWS_PATH = path.join(ARTIFACT_ROOT, 'secure-rows.jsonl');
const TIMESCALE = process.env.GR_SECURE_TIMESCALE ?? '4';
const BOOT_TIMEOUT_MS = Number(process.env.GR_SECURE_BOOT_TIMEOUT_MS ?? 60_000);
/** Wall-clock budget for the play-out itself, per run. Wave 25 at timescale 4 is 190 s of sim. */
const PLAY_BUDGET_MS = Number(process.env.GR_SECURE_PLAY_BUDGET_MS ?? 600_000);
const ONLY = (process.env.GR_SECURE_ONLY ?? '')
  .split(',')
  .map((entry) => entry.trim())
  .filter(Boolean);

test.skip(
  !process.env.GR_PLAYABILITY_SECURE,
  'six full objective play-outs x 2 projects, ~30 min — set GR_PLAYABILITY_SECURE=1',
);

const PROFILE_ID = 'robin';

/**
 * THE SIX MAPS ASTRA LEFT OPEN OR PARTIAL ON THE PLAYABILITY HALF, in the order the master names:
 * Twin Banks, the Long Road, Night Shift, the Dry Gulch, the Hill Mine, the Baron.
 */
const SECURE_CONTRACTS = [
  'e1-twin-banks',
  'e4-long-road',
  'e1-night-shift',
  'e1-dry-gulch',
  'e2-hill-mine',
  'e1-baron',
] as const;

const BOARD_CONTRACTS: readonly ContractManifest[] = listBoardContracts();
const TARGETS = BOARD_CONTRACTS.filter(
  (entry) => (SECURE_CONTRACTS as readonly string[]).includes(entry.id) && (ONLY.length === 0 || ONLY.includes(entry.id)),
);

type Cell = { ok: boolean; detail: string };
const pass = (detail = ''): Cell => ({ ok: true, detail });
const fail = (detail: string): Cell => ({ ok: false, detail });

type Row = {
  project: string;
  contract: string;
  name: string;
  secureWave: number;
  boots: Cell;
  secures: Cell;
  banks: Cell;
  board: Cell;
  reload: Cell;
  clean: Cell;
  peakWave: number;
  simAtEnd: number;
  runStateAtEnd: string;
  hpAtEnd: number;
  goldAtEnd: number;
  killsAtEnd: number;
  builds: Array<{ id: string; at: number; wave: number; x: number; z: number }>;
  upgrades: string[];
  samples: Array<{ t: number; wave: number; hp: number; gold: number; kills: number; x: number; z: number; alive: number; seams: number }>;
  consoleErrors: string[];
  pageErrors: string[];
  notes: string[];
  at: string;
};

function epochOf(contractId: string): string {
  const ordinal = contractId.match(/^e(\d+)-/)?.[1];
  if (!ordinal) return 'epoch-1-frontier';
  return listEpochs().find((entry) => entry.id.startsWith(`epoch-${ordinal}-`))?.id ?? 'unknown';
}

/**
 * The smoke's seed — a player who has earned the whole board, no test-only channel — WITH ONE
 * DIFFERENCE, and the difference is the whole `banks` question.
 *
 * `Scoreboard.trimScores` (src/game/Scoreboard.ts:30) keeps the global top five PLUS each
 * contract's own best. The smoke seeds every contract at `waves: 30, gold: 400`, so a genuine
 * wave-20 secure on the Dry Gulch is WORSE than the row already sitting there and is trimmed away
 * the instant it is written: measured, AFTER run 1 — the Claim Secured overlay appeared at wave 20
 * / 600.1 s, "Return to Town" was clicked, and the click wrote ZERO new rows. Nothing is wrong with
 * the game; the seed was standing on the answer.
 *
 * So the contract UNDER TEST is seeded at the worst standing that still counts as secured
 * (`waves: 1`, empty purse). Every other contract keeps the smoke's row, so every unlock the board
 * needs is untouched — including this contract's, which reads `secured`, not `waves`.
 */
function seedEntries(underTest: string): Array<[string, string]> {
  const profile: ProfileState = {
    version: 2,
    activeId: PROFILE_ID,
    profiles: [{ id: PROFILE_ID, name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
  };
  const scores = BOARD_CONTRACTS.map((entry, index) =>
    entry.id === underTest
      ? { kills: 0, gold: 0, timeAlive: 1, at: index + 1, waves: 1, secured: true, contractId: entry.id, profileName: 'Robin' }
      : { kills: 40, gold: 400, timeAlive: 600, at: index + 1, waves: 30, secured: true, contractId: entry.id, profileName: 'Robin' },
  );
  const meta = JSON.stringify({ version: 1, tracks: { territory: 40, science: 999, hero: 40, agent: 40 } });
  const research = JSON.stringify({ version: 1, steps: 999, taken: [], proposalSalt: 0, pinnedTarget: null, metaScienceCursor: 999 });
  const logical: Array<[string, string]> = [
    [SCOREBOARD_KEY, JSON.stringify(scores)],
    [META_PROGRESS_KEY, meta],
    [TOWN_NAME_KEY, 'Quartz Hill'],
    [ACTIVE_EPOCH_KEY, 'epoch-10-deepsky'],
    [FIRST_CLAIM_DONE_KEY, '1'],
    [TOWN_WELCOME_SEEN_KEY, '1'],
    [STORY_TALES_STORAGE_KEY, '0'],
    ...listEpochs().map((epoch): [string, string] => [researchStateKey(epoch.id), research]),
  ];
  return [
    [PROFILE_KEY, JSON.stringify(profile)],
    ...logical.flatMap(([key, value]): Array<[string, string]> => [
      [key, value],
      [profileDataKey(PROFILE_ID, key), value],
    ]),
  ];
}

/**
 * The seed runs ONCE per browser context. A reload later in the journey has to find the banked
 * score still there — a seeding init script that cleared storage on every navigation would be
 * testing itself, not the game. Same guard Astra's native probes used.
 */
async function seed(page: Page, contractId: string): Promise<void> {
  await page.addInitScript(
    ({ entries, launchKey, launchValue, guardKey }) => {
      try {
        if (sessionStorage.getItem(guardKey)) return;
      } catch {
        /* storage unavailable: fall through and try to seed */
      }
      try {
        localStorage.clear();
        for (const [key, value] of entries) localStorage.setItem(key, value);
      } catch {}
      try {
        sessionStorage.clear();
        sessionStorage.setItem(launchKey, launchValue);
        sessionStorage.setItem(guardKey, '1');
      } catch {}
    },
    { entries: seedEntries(contractId), launchKey: 'gr.contract.launch.v1', launchValue: contractId, guardKey: 'gr.secure.seeded.v1' },
  );
}

type Snapshot = {
  frame: number;
  sim: number;
  wave: number;
  hudWave: number;
  runState: string;
  paused: boolean;
  secured: boolean;
  hp: number;
  maxHp: number;
  gold: number;
  hero: { x: number; z: number };
  enemiesAlive: number;
  kills: number;
  pendingLevels: number;
  offer: string[] | null;
  upgradeOpen: boolean;
  buildMode: boolean;
  ghostValid: boolean;
  ghostPos: { x: number; z: number };
  nodes: Array<{ id: string; active: boolean; x: number; z: number; respawnIn: number; respawnScheduled: boolean }>;
  buildables: Array<{ id: string; cost: number; count: number; maxCount: number; canAfford: boolean }>;
  defences: Array<{ id: string; index: number; hp: number; maxHp: number; wrecked: boolean; repairCost: number; x: number; z: number }>;
  repairs: number;
  channeling: boolean;
};

async function read(page: Page): Promise<Snapshot | null> {
  return page
    .evaluate(() => {
      const d = window.__THREE_GAME_DIAGNOSTICS__;
      if (!d) return null;
      return {
        frame: d.frame ?? 0,
        sim: d.timeAlive ?? 0,
        wave: d.wave ?? 0,
        hudWave: Number.parseInt(document.querySelector('[data-hud-wave-number]')?.textContent?.trim() ?? '', 10) || 0,
        runState: String(d.runState ?? ''),
        paused: d.paused === true,
        secured: d.run?.secured === true,
        hp: d.hp ?? 0,
        maxHp: d.maxHp ?? 1,
        gold: d.economy?.gold ?? 0,
        hero: { x: d.heroPos?.x ?? 0, z: d.heroPos?.z ?? 0 },
        enemiesAlive: d.enemiesAlive ?? 0,
        kills: d.kills ?? 0,
        pendingLevels: d.progression?.pendingLevels ?? 0,
        offer: d.progression?.offer ?? null,
        upgradeOpen: document.querySelector('[data-testid="upgrade-overlay"]')?.getAttribute('aria-hidden') === 'false',
        buildMode: d.build?.mode === true,
        ghostValid: d.build?.ghostValid === true,
        ghostPos: { x: d.build?.ghostPos?.x ?? 0, z: d.build?.ghostPos?.z ?? 0 },
        nodes: (d.harvest?.activeNodes ?? []).map((n) => ({
          id: n.id,
          active: n.active,
          x: n.position.x,
          z: n.position.z,
          respawnIn: n.respawnIn,
          respawnScheduled: n.respawnScheduled,
        })),
        buildables: (d.ui?.buildables ?? []).map((b) => ({
          id: String(b.id),
          cost: b.cost,
          count: b.count,
          maxCount: b.maxCount,
          canAfford: b.canAfford,
        })),
        defences: (d.build?.hp ?? []).map((b) => ({
          id: String(b.id),
          index: b.index,
          hp: b.hp,
          maxHp: b.maxHp,
          wrecked: b.wrecked,
          repairCost: b.repairCost,
          x: b.position.x,
          z: b.position.z,
        })),
        repairs: d.wreck?.repairs ?? 0,
        channeling: d.harvest?.channeling === true,
      };
    })
    .catch(() => null);
}

/** Real key events, exactly like the smoke's `moves` cell. */
async function steer(page: Page, dx: number, dz: number, ms: number): Promise<void> {
  const keys: string[] = [];
  if (Math.abs(dx) > 0.35) keys.push(dx > 0 ? 'KeyD' : 'KeyA');
  if (Math.abs(dz) > 0.35) keys.push(dz > 0 ? 'KeyS' : 'KeyW');
  if (keys.length === 0) {
    await page.waitForTimeout(ms);
    return;
  }
  for (const key of keys) await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  for (const key of keys) await page.keyboard.up(key);
}

/**
 * The Patent Office freezes the sim until a card is taken; a player takes one. Digit1/2/3 is the
 * card keyboard (src/ui/UpgradeOverlay.ts:124) — the cheapest honest input on both projects. The
 * priority list is a first-time player's obvious reading of the cards: stay alive, then hit harder.
 */
const UPGRADE_PRIORITY = [
  'field_dressing',
  'tinkers_plating',
  'heavy_spark',
  'split_spark',
  'double_tap_coil',
  'long_resonator',
  'sharpen',
  'spring_heels',
  'quick_fuse',
  'powder_charge',
  'wide_ring',
];

async function takeUpgrades(page: Page, row: Row): Promise<void> {
  for (let guard = 0; guard < 6; guard += 1) {
    const now = await read(page);
    if (!now || !now.upgradeOpen) return;
    const offer = now.offer ?? [];
    let index = 0;
    if (now.hp < now.maxHp * 0.7) {
      const healer = offer.findIndex((id) => id === 'field_dressing');
      if (healer >= 0) index = healer;
    }
    if (index === 0) {
      for (const id of UPGRADE_PRIORITY) {
        const found = offer.indexOf(id);
        if (found >= 0) {
          index = found;
          break;
        }
      }
    }
    row.upgrades.push(offer[index] ?? `card${index}`);
    await page.keyboard.press(`Digit${Math.min(3, index + 1)}`);
    await page.waitForTimeout(250);
  }
}

/** Leave the run running whatever a panel did (the smoke's own helper). */
async function unpause(page: Page, row: Row): Promise<void> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const paused = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.paused === true).catch(() => false);
    if (!paused) return;
    await page.keyboard.press('KeyP');
    await page.waitForTimeout(250);
  }
  row.notes.push('WARNING: run still reported paused after three KeyP presses');
}

type Home = { x: number; z: number; circuit: Array<[number, number]> };

/**
 * WHERE A FIRST-TIME PLAYER STANDS AND WALKS, read out of the contract's OWN data: its hero-start
 * stake if it declares one, else the centre of its first build zone, else the origin. The circuit
 * is a small square of that ground — the thing a player does while the turrets work.
 */
function homeFor(contract: ContractManifest, hero: { x: number; z: number }): Home {
  const tile = contract.tileParams as {
    stakeMarkers?: Array<{ x: number; z: number; heroStart?: boolean }>;
    buildZones?: Array<{ minX: number; maxX: number; minZ: number; maxZ: number }>;
  };
  const stake = tile.stakeMarkers?.find((marker) => marker.heroStart) ?? tile.stakeMarkers?.[0];
  const zones = tile.buildZones ?? [];
  // A map that declares build zones only lets you build inside them. Stand in the one the map's
  // own hero stake sits in; if the stake is outside every zone (the Long Road parks the lead
  // Hauler 32 units west of its first way-station), take the first zone's middle instead.
  const holding = stake ? zones.find((entry) => stake.x >= entry.minX && stake.x <= entry.maxX && stake.z >= entry.minZ && stake.z <= entry.maxZ) : undefined;
  const zone = holding ?? zones[0];
  const centre =
    stake && (holding || zones.length === 0)
      ? { x: stake.x, z: stake.z }
      : zone
        ? { x: (zone.minX + zone.maxX) / 2, z: (zone.minZ + zone.maxZ) / 2 }
        : { x: hero.x, z: hero.z };
  // STAY INSIDE THE RING YOU BUILT. Measured on the Dry Gulch with identical data: a hero walking a
  // 7-unit circuit died at wave 15 with nine buildings, and a hero that stayed put behind four guns
  // reached wave 20 with 175 HP. Exposure, not geometry, is what decides these runs — so the plain
  // strategy is a player's: keep close to your own guns.
  const radius = 4;
  const clampX = (v: number) => (zone ? Math.min(zone.maxX - 2, Math.max(zone.minX + 2, v)) : v);
  const clampZ = (v: number) => (zone ? Math.min(zone.maxZ - 2, Math.max(zone.minZ + 2, v)) : v);
  return {
    x: centre.x,
    z: centre.z,
    circuit: [
      [clampX(centre.x - radius), clampZ(centre.z - radius)],
      [clampX(centre.x + radius), clampZ(centre.z - radius)],
      [clampX(centre.x + radius), clampZ(centre.z + radius)],
      [clampX(centre.x - radius), clampZ(centre.z + radius)],
    ],
  };
}

/**
 * Walk there with WASD, and GIVE UP when the ground says no. A river claim's banks are separated by
 * water the hero can only cross at a ford; a player who walks into the braid for four seconds and
 * gets nowhere turns round and goes somewhere else. Without that, the instrument spends its whole
 * budget pressed against a channel (measured, first Twin Banks BEFORE run: 4 x 53 sim-seconds of
 * nothing, gold never left 0, not one building raised).
 */
async function walkTo(page: Page, row: Row, x: number, z: number, tolerance: number, steps = 90): Promise<boolean> {
  let best = Number.POSITIVE_INFINITY;
  let stalled = 0;
  for (let step = 0; step < steps; step += 1) {
    await takeUpgrades(page, row);
    const now = await read(page);
    if (!now || now.runState === 'dead') return false;
    const dx = x - now.hero.x;
    const dz = z - now.hero.z;
    const gap = Math.hypot(dx, dz);
    if (gap <= tolerance) return true;
    if (gap < best - 0.35) {
      best = gap;
      stalled = 0;
    } else {
      stalled += 1;
      if (stalled >= 8) return false;
    }
    // Sidestep once the straight line has stopped paying: a player rounds the obstacle.
    const slide = stalled >= 4 ? 1 : 0;
    await steer(page, dx + slide * -dz * 0.8, dz + slide * dx * 0.8, Math.min(200, Math.max(40, gap * 45)));
  }
  return false;
}

/**
 * Pan at the nearest seam the map is offering until the purse holds `amount`. On a river claim the
 * hero's OWN bank comes first — the other side is across water, and this spec does not pretend the
 * hero can swim. A seam that turns out to be unreachable is struck off for the rest of the run.
 */
/**
 * A BRAIDED CLAIM IS NOT A FLAT FIELD. Twin Banks' water mask makes both channels un-wadeable and
 * leaves exactly two dry crossings — the fords its own card names ("Two fords carry pressure across
 * the river"). A hero that steers straight at a seam on the far bank walks into the channel and
 * stops there for the rest of the run (measured, Twin Banks BEFORE run 2: stuck at -2.4,3.9 from
 * sim 45 s to death at 345 s, 50 gold, nothing built). A player uses the ford. So does this.
 */
type Crossing = { x: number };

function crossingsFor(contract: ContractManifest): Crossing[] {
  const tile = contract.tileParams as { river?: boolean; ford?: boolean; fords?: Array<{ x: number }> };
  if (tile.river !== true) return [];
  if (tile.fords?.length) return tile.fords.map(({ x }) => ({ x }));
  return tile.ford === true ? [{ x: 0 }] : [];
}

/** Walk there, crossing at a ford when the destination is on the other bank. */
async function journey(page: Page, row: Row, x: number, z: number, tolerance: number, fords: Crossing[], steps = 90): Promise<boolean> {
  if (fords.length > 0) {
    const now = await read(page);
    if (!now) return false;
    const bankHere = Math.sign(now.hero.z);
    const bankThere = Math.sign(z);
    if (bankHere !== 0 && bankThere !== 0 && bankHere !== bankThere && Math.abs(now.hero.z) > 1.5 && Math.abs(z) > 1.5) {
      const ford = fords.slice().sort((a, b) => Math.abs(a.x - now.hero.x) - Math.abs(b.x - now.hero.x))[0];
      row.notes.push(`crossing at the ford x=${ford.x} (${now.hero.z.toFixed(1)} -> ${z.toFixed(1)})`);
      if (!(await walkTo(page, row, ford.x, bankHere * 7, 1.4, 45))) return false;
      if (!(await walkTo(page, row, ford.x, bankThere * 7, 1.4, 45))) return false;
    }
  }
  return walkTo(page, row, x, z, tolerance, steps);
}

async function fund(page: Page, row: Row, amount: number, deadline: number, fords: Crossing[], unreachable: Set<string>): Promise<boolean> {
  while (Date.now() < deadline) {
    await takeUpgrades(page, row);
    const now = await read(page);
    if (!now || now.runState === 'dead') return false;
    if (now.gold >= amount) return true;
    const live = now.nodes.filter((node) => node.active && !unreachable.has(node.id));
    const bank = fords.length > 0 ? live.filter((node) => Math.sign(node.z) === Math.sign(now.hero.z) || Math.abs(node.z) < 1.5) : live;
    const pool = bank.length > 0 ? bank : live;
    if (pool.length === 0) {
      await page.waitForTimeout(600);
      continue;
    }
    const node = pool.sort(
      (a, b) => Math.hypot(a.x - now.hero.x, a.z - now.hero.z) - Math.hypot(b.x - now.hero.x, b.z - now.hero.z),
    )[0];
    if (!(await journey(page, row, node.x, node.z, 1.2, fords, 45))) {
      unreachable.add(node.id);
      row.notes.push(`seam ${node.id} (${node.x.toFixed(1)},${node.z.toFixed(1)}) unreachable on foot`);
      continue;
    }
    for (let tick = 0; tick < 140; tick += 1) {
      await takeUpgrades(page, row);
      const next = await read(page);
      if (!next || next.runState === 'dead') return false;
      if (next.gold >= amount) return true;
      if (!next.nodes.find((entry) => entry.id === node.id)?.active) break;
      await page.waitForTimeout(140);
    }
  }
  return false;
}

/**
 * Build what the card asks for, the way the HUD offers it: open Build, choose the tile, stand where
 * it goes, press Space. The ghost is hero-anchored (see the header), so "stand where it goes" means
 * two metres south of the spot.
 */
async function build(
  page: Page,
  row: Row,
  id: string,
  x: number,
  z: number,
  deadline: number,
  fords: Crossing[],
  unreachable: Set<string>,
): Promise<boolean> {
  const before = await read(page);
  if (!before) return false;
  const offer = before.buildables.find((entry) => entry.id === id);
  if (!offer) {
    row.notes.push(`no build offer for ${id} (offered: ${before.buildables.map((entry) => entry.id).join(',')})`);
    return false;
  }
  if (offer.count >= offer.maxCount) return false;
  if (!(await fund(page, row, offer.cost, deadline, fords, unreachable))) {
    row.notes.push(`could not fund ${id} (cost ${offer.cost}, purse ${Math.round(before.gold)})`);
    return false;
  }
  // A PLAYER BUILDS WHERE HE CAN STAND. Walking to an exact metre fails on a terraced map with
  // cliff bands (the Hill Mine placed NOTHING in three runs because this leg returned false in
  // silence), so a near miss is not a refusal: get as close as the ground allows and let the
  // ghost's own validity decide.
  if (!(await journey(page, row, x, z + 2, 1.2, fords, 90))) {
    const here = await read(page);
    row.notes.push(`could not stand at ${x.toFixed(1)},${(z + 2).toFixed(1)} for ${id}; building from ${here?.hero.x.toFixed(1)},${here?.hero.z.toFixed(1)}`);
    if (!here || here.runState === 'dead') return false;
  }
  await takeUpgrades(page, row);
  await page.getByTestId('hud-build').click({ timeout: 6_000 }).catch(() => undefined);
  await page.getByTestId(`hud-build-tile-${id}`).click({ timeout: 6_000 }).catch(() => undefined);
  await page.waitForTimeout(200);
  for (let nudge = 0; nudge < 10; nudge += 1) {
    const now = await read(page);
    if (!now || now.runState === 'dead') return false;
    if (now.ghostValid) break;
    // A first-time player shuffles a step when the footprint reads red.
    const turn = (nudge * 2.39996) % (Math.PI * 2);
    await steer(page, Math.cos(turn) * 2, Math.sin(turn) * 2, 170);
  }
  await page.keyboard.press('Space');
  await page.waitForTimeout(250);
  const after = await read(page);
  if (!after) return false;
  const placed = (after.buildables.find((entry) => entry.id === id)?.count ?? 0) > offer.count;
  if (placed) row.builds.push({ id, at: after.sim, wave: after.wave, x: after.ghostPos.x, z: after.ghostPos.z });
  else row.notes.push(`${id} did not place at ${x.toFixed(1)},${z.toFixed(1)} (ghostValid=${after.ghostValid})`);
  if (after.buildMode) await page.getByTestId('hud-build').click({ timeout: 4_000 }).catch(() => undefined);
  return placed;
}

/**
 * The kit a player raises from the card's own words: pan at the seams, then ring your own ground
 * with the two things that shoot. `sentry_beacon` and `turret` are the ids the HUD offers
 * (src/game/Buildables.ts:3); `sluice` is `river-adjacent` and is left to the maps whose cards
 * actually name it.
 */
/**
 * A CLAIM IS KEPT, NOT JUST RAISED. The first version of this instrument built four pieces in the
 * opening and then walked a circuit for the next fifteen waves, and every map died between wave 16
 * and 17 with the purse on zero and half the ring wrecked. That is not what a player does and it is
 * not what Astra's own passing runs did either (`dry-gulch-native-16.mjs`: repair any turret under
 * half HP every 15 s, and keep spending). So between waves the hero goes back to the seams, mends
 * what the wreckers chewed, and adds another gun while the gold lasts. Every verb is a plain one.
 */
async function maintain(page: Page, row: Row, home: Home, deadline: number, fords: Crossing[], unreachable: Set<string>): Promise<void> {
  const now = await read(page);
  if (!now || now.runState === 'dead') return;
  const hurt = now.defences
    .filter((entry) => !entry.wrecked && entry.hp < entry.maxHp * 0.55 && entry.repairCost > 0)
    .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
  if (hurt) {
    if (!(await fund(page, row, hurt.repairCost, Math.min(deadline, Date.now() + 45_000), fords, unreachable))) return;
    if (!(await journey(page, row, hurt.x, hurt.z - 1, 1, fords, 45))) return;
    const before = (await read(page))?.repairs ?? 0;
    for (let tick = 0; tick < 40; tick += 1) {
      await takeUpgrades(page, row);
      const next = await read(page);
      if (!next || next.runState === 'dead') return;
      if (next.repairs > before) {
        row.notes.push(`mended a ${hurt.id} at sim ${next.sim.toFixed(0)}s (${Math.round(hurt.hp)}/${Math.round(hurt.maxHp)} HP)`);
        return;
      }
      await page.waitForTimeout(150);
    }
    return;
  }
  // Nothing to mend: add another gun where the ring is thin — the turret first, because that is
  // what a player who has watched a wave come in buys next, and only then the cheaper beacon.
  // Never spend the last of the purse: a mend costs gold too.
  const room =
    now.buildables.find((entry) => entry.id === 'turret' && entry.count < entry.maxCount && entry.cost <= now.gold + 120) ??
    now.buildables.find((entry) => entry.id === 'sentry_beacon' && entry.count < entry.maxCount);
  if (!room || now.defences.length >= 8) return;
  const ring = now.defences.length;
  const angle = (ring * 2.39996) % (Math.PI * 2);
  const radius = 5 + (ring % 3) * 2;
  await build(page, row, room.id, home.x + Math.cos(angle) * radius, home.z + Math.sin(angle) * radius, Math.min(deadline, Date.now() + 60_000), fords, unreachable);
}

type KitPiece = { id: string; dx: number; dz: number };

/**
 * THE CARD'S OWN VERBS, WHERE THE CARD HAS EXTRA ONES. Night Shift's rules say it in plain words —
 * "Relight cold lanterns or build new posts to see threats" — and its data backs them up: seven
 * `prePlacedBuildables` lantern posts, every one `wrecked: true` with a `relightCost` of 8. A
 * first-time player who read that card puts light on their own ground before wave 10 turns the
 * map black (`twist.lightRamp.darkWave`). Measured without it, Night Shift BEFORE: dead at wave 15
 * of 25, 460 s sim, 614 kills, four buildings and no light.
 */
function kitFor(contract: ContractManifest): KitPiece[] {
  const pieces = [...KIT];
  if ((contract.twist as { lightRamp?: unknown }).lightRamp) {
    pieces.splice(1, 0, { id: 'lantern_post', dx: 4, dz: 4 }, { id: 'lantern_post', dx: -4, dz: -4 });
  }
  return pieces;
}

const KIT: Array<{ id: string; dx: number; dz: number }> = [
  { id: 'turret', dx: 0, dz: -4 },
  { id: 'sentry_beacon', dx: -4, dz: 1 },
  { id: 'turret', dx: 5, dz: -3 },
  { id: 'turret', dx: -5, dz: 3 },
];

test.describe('playability secure: the six open maps, plain boot to secure, bank, reload, board', () => {
  for (const contract of TARGETS) {
    test(`${contract.id} plays to its secure wave, banks, reloads and returns to the board`, { tag: '@slow' }, async ({ page }, testInfo) => {
      test.setTimeout(PLAY_BUDGET_MS + BOOT_TIMEOUT_MS + 180_000);
      await mkdir(ARTIFACT_ROOT, { recursive: true });

      const consoleErrors: string[] = [];
      const pageErrors: string[] = [];
      page.on('console', (message) => {
        if (message.type() === 'error') consoleErrors.push(message.text());
      });
      page.on('pageerror', (error) => pageErrors.push(error.message));
      page.on('dialog', (dialog) => void dialog.accept().catch(() => undefined));

      const secureWave = Math.max(0, Math.floor(contract.twist?.secureWave ?? 0));
      const row: Row = {
        project: testInfo.project.name,
        contract: contract.id,
        name: contract.name,
        secureWave,
        boots: fail('not run'),
        secures: fail('not run'),
        banks: fail('not run'),
        board: fail('not run'),
        reload: fail('not run'),
        clean: fail('not run'),
        peakWave: 0,
        simAtEnd: 0,
        runStateAtEnd: '',
        hpAtEnd: 0,
        goldAtEnd: 0,
        killsAtEnd: 0,
        builds: [],
        upgrades: [],
        samples: [],
        consoleErrors,
        pageErrors,
        notes: [`epoch=${epochOf(contract.id)}`],
        at: new Date().toISOString(),
      };

      try {
        // --- boot, exactly as the smoke does -------------------------------------------------
        await seed(page, contract.id);
        await page.goto(`/?contract=${encodeURIComponent(contract.id)}&seed=secure-${contract.id}&timescale=${TIMESCALE}`);
        try {
          await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 12, undefined, { timeout: BOOT_TIMEOUT_MS });
          const active = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract);
          row.boots =
            active?.activeId === contract.id && active?.fallbackReason === null
              ? pass(`activeId=${active.activeId} secureWave=${active.secureWave}`)
              : fail(`requested ${contract.id}, got activeId=${active?.activeId ?? 'none'} fallbackReason=${String(active?.fallbackReason)}`);
          row.notes.push(`engine secureWave=${active?.secureWave ?? 'unknown'} cadenceMult=${active?.waveCadenceMult ?? 'unknown'}`);
        } catch (error) {
          row.boots = fail(`no game frame within ${BOOT_TIMEOUT_MS}ms: ${String((error as Error).message).split('\n')[0]}`);
        }
        expect(row.boots.ok, `boots: ${row.boots.detail}`).toBe(true);

        await page.getByTestId('contract-briefing-dismiss').click({ timeout: 10_000 }).catch(() => undefined);
        await expect(page.getByTestId('contract-briefing')).toBeHidden({ timeout: 10_000 });
        await unpause(page, row);

        // --- play ---------------------------------------------------------------------------
        const opened = await read(page);
        const home = homeFor(contract, opened?.hero ?? { x: 0, z: 0 });
        row.notes.push(`home=${home.x.toFixed(1)},${home.z.toFixed(1)} circuit=${JSON.stringify(home.circuit)}`);
        const deadline = Date.now() + PLAY_BUDGET_MS;
        const secured = page.getByTestId('claim-secured');
        const fords = crossingsFor(contract);
        const unreachable = new Set<string>();

        const kit = kitFor(contract);
        row.notes.push(`kit=${kit.map((piece) => piece.id).join('+')}`);
        let kitIndex = 0;
        let corner = 0;
        let cornerBest = Number.POSITIVE_INFINITY;
        let cornerStall = 0;
        let lastMaintenance = 0;
        let lastSample = 0;
        let died = '';
        while (Date.now() < deadline) {
          if (await secured.isVisible().catch(() => false)) break;
          await takeUpgrades(page, row);
          const now = await read(page);
          if (!now) {
            died = 'the page stopped answering';
            break;
          }
          row.peakWave = Math.max(row.peakWave, now.wave, now.hudWave);
          row.simAtEnd = now.sim;
          row.runStateAtEnd = now.runState;
          row.hpAtEnd = now.hp;
          row.goldAtEnd = now.gold;
          row.killsAtEnd = now.kills;
          if (now.sim - lastSample >= 10) {
            lastSample = now.sim;
            row.samples.push({
              t: Number(now.sim.toFixed(1)),
              wave: Math.max(now.wave, now.hudWave),
              hp: Math.round(now.hp),
              gold: Math.round(now.gold),
              kills: now.kills,
              x: Number(now.hero.x.toFixed(1)),
              z: Number(now.hero.z.toFixed(1)),
              alive: now.enemiesAlive,
              seams: now.nodes.filter((node) => node.active).length,
            });
          }
          if (now.runState === 'dead') {
            died = `runState=dead at wave ${Math.max(now.wave, now.hudWave)} / ${now.sim.toFixed(1)}s sim, ${now.kills} kills, ${Math.round(now.gold)} gold`;
            break;
          }
          if (now.paused) await unpause(page, row);

          // The opening: raise the kit the card asks for, one piece at a time.
          if (kitIndex < kit.length) {
            const piece = kit[kitIndex];
            kitIndex += 1;
            await build(page, row, piece.id, home.x + piece.dx, home.z + piece.dz, Math.min(deadline, Date.now() + 90_000), fords, unreachable);
            continue;
          }

          // Between waves: mend and extend. Then walk your ground.
          if (now.sim - lastMaintenance >= 25) {
            lastMaintenance = now.sim;
            await maintain(page, row, home, deadline, fords, unreachable);
            continue;
          }

          // Wave 2 to the secure wave is patience, not cleverness.
          const [cx, cz] = home.circuit[corner];
          const gap = Math.hypot(cx - now.hero.x, cz - now.hero.z);
          // A corner behind a rock is not a reason to stand still for nine waves (measured, Dry
          // Gulch BEFORE run: parked at -7,14.8 from sim 280 s to the secure). Give up on it and
          // walk the next leg — which is what a player does when the way is blocked.
          if (gap < 1.6 || cornerStall >= 12) {
            corner = (corner + 1) % home.circuit.length;
            cornerBest = Number.POSITIVE_INFINITY;
            cornerStall = 0;
          } else if (fords.length > 0 && Math.sign(now.hero.z) !== Math.sign(cz) && Math.abs(now.hero.z) > 1.5) {
            // Stranded on the far bank: go home the way you came, through a ford.
            await journey(page, row, cx, cz, 1.6, fords, 45);
            cornerStall = 0;
          } else {
            if (gap < cornerBest - 0.3) {
              cornerBest = gap;
              cornerStall = 0;
            } else cornerStall += 1;
            await steer(page, cx - now.hero.x, cz - now.hero.z, 180);
          }
        }

        const atSecure = await read(page);
        const sawOverlay = await secured.isVisible().catch(() => false);
        if (atSecure) {
          row.peakWave = Math.max(row.peakWave, atSecure.wave, atSecure.hudWave);
          row.simAtEnd = atSecure.sim;
          row.runStateAtEnd = atSecure.runState;
          row.hpAtEnd = atSecure.hp;
          row.goldAtEnd = atSecure.gold;
          row.killsAtEnd = atSecure.kills;
        }
        row.secures = sawOverlay
          ? pass(`Claim Secured at wave ${row.peakWave} / ${row.simAtEnd.toFixed(1)}s sim, ${row.hpAtEnd.toFixed(0)} HP, ${row.builds.length} buildings`)
          : fail(
              died ||
                `never secured: peak wave ${row.peakWave} of ${secureWave} after ${row.simAtEnd.toFixed(1)}s sim (runState=${row.runStateAtEnd || 'unknown'}, ${row.builds.length} buildings, ${row.killsAtEnd} kills)`,
            );

        // --- bank ---------------------------------------------------------------------------
        if (sawOverlay) {
          try {
            // THE SEED ALREADY HOLDS A SECURED ROW FOR EVERY CONTRACT (it has to: a player who has
            // earned the whole board is the only one who can launch every map plainly). So "banks"
            // cannot be "a secured row exists" — it has to be a row that WAS NOT THERE BEFORE THE
            // CLICK. Measured on the first Dry Gulch BEFORE run, which reported the seeded row
            // (waves=30 gold=400 timeAlive=600) and would have passed on any map at all.
            const before = new Set((await readScores(page)).map((score) => JSON.stringify(score)));
            await page.getByTestId('bank-secured-claim').click({ timeout: 10_000 });
            await expect(page.getByTestId('claim-secured')).toBeHidden({ timeout: 10_000 });
            const scores = await readScores(page);
            const fresh = scores.filter((score) => !before.has(JSON.stringify(score)));
            const banked = fresh.find((score) => score.contractId === contract.id && score.secured === true && (score.waves ?? 0) >= secureWave);
            row.banks = banked
              ? pass(`a NEW secured row for ${contract.id}: waves=${banked.waves} gold=${banked.gold} timeAlive=${Math.round(banked.timeAlive ?? 0)} kills=${banked.kills ?? '?'} (${fresh.length} row(s) written by the click)`)
              : fail(
                  `the click wrote no new secured row for ${contract.id} at >= wave ${secureWave} (${fresh.length} new row(s): ${JSON.stringify(fresh.slice(0, 2))})`,
                );
          } catch (error) {
            row.banks = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
          }
        } else {
          row.banks = fail('skipped: never secured');
        }

        // --- board (the run ends where the next one starts) ----------------------------------
        if (row.banks.ok) {
          try {
            for (let card = 0; card < 2; card += 1) {
              if (await page.getByTestId('research-card-0').isVisible().catch(() => false)) {
                await page.getByTestId('research-card-0').click({ timeout: 5_000 }).catch(() => undefined);
                await page.waitForTimeout(250);
              }
            }
            await page.getByTestId('stake-again').click({ timeout: 10_000 });
            await expect(page.getByTestId('contract-board-title')).toBeVisible({ timeout: 20_000 });
            row.board = pass('the Book is on screen straight off the run ledger');
          } catch (error) {
            row.board = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
          }
        } else {
          row.board = fail('skipped: never banked');
        }

        // --- reload with the score retained, and the board reachable again -------------------
        if (row.banks.ok) {
          try {
            const before = await rawScores(page);
            await page.goto('/');
            await page.waitForLoadState('domcontentloaded');
            const after = await rawScores(page);
            expect(after, 'the banked score survives a plain reload byte for byte').toBe(before);
            await page.getByTestId('start-menu-enter-town').click({ timeout: 20_000 });
            await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 40_000 });
            const reachedTavern = await walkToTavern(page, row);
            expect(reachedTavern, 'the tavern is reachable on foot after the reload').toBe(true);
            await page.getByTestId('town-open-board').click({ timeout: 10_000 });
            await expect(page.getByTestId('contract-board')).toBeVisible({ timeout: 20_000 });
            row.reload = pass(`score retained across reload (${(before ?? '').length} bytes) and the Book reopened on foot`);
          } catch (error) {
            row.reload = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
          }
        } else {
          row.reload = fail('skipped: never banked');
        }

        row.clean =
          consoleErrors.length === 0 && pageErrors.length === 0
            ? pass('0 console, 0 page')
            : fail(`${consoleErrors.length} console / ${pageErrors.length} page: ${[...consoleErrors, ...pageErrors].slice(0, 3).join(' || ')}`);
      } finally {
        await appendFile(ROWS_PATH, `${JSON.stringify(row)}\n`, 'utf8');
      }

      expect(row.secures.ok, `secures: ${row.secures.detail}`).toBe(true);
      expect(row.banks.ok, `banks: ${row.banks.detail}`).toBe(true);
      expect(row.board.ok, `board: ${row.board.detail}`).toBe(true);
      expect(row.reload.ok, `reload: ${row.reload.detail}`).toBe(true);
      expect(row.clean.ok, `clean: ${row.clean.detail}`).toBe(true);
    });
  }
});

type Score = { contractId?: string; secured?: boolean; waves?: number; gold?: number; timeAlive?: number; kills?: number; at?: number };

async function rawScores(page: Page): Promise<string | null> {
  return page.evaluate(
    ([key, profileKey]) => localStorage.getItem(`${profileKey}.robin.${key}`) ?? localStorage.getItem(key),
    [SCOREBOARD_KEY, PROFILE_KEY] as const,
  );
}

async function readScores(page: Page): Promise<Score[]> {
  const raw = await rawScores(page);
  try {
    const parsed = JSON.parse(raw ?? '[]');
    return Array.isArray(parsed) ? (parsed as Score[]) : [];
  } catch {
    return [];
  }
}

/** Walk to the tavern the way a player does — the Board button only appears when you are there. */
async function walkToTavern(page: Page, row: Row): Promise<boolean> {
  for (let step = 0; step < 70; step += 1) {
    const town = await page
      .evaluate(() => {
        const d = window.__GR_TOWN_DIAGNOSTICS__;
        if (!d) return null;
        const tavern = d.buildings.find((building) => building.id === 'tavern');
        return { prompt: d.activePrompt, player: d.player, approach: tavern?.approach ?? null };
      })
      .catch(() => null);
    if (!town) return false;
    if (town.prompt === 'tavern') return true;
    if (!town.approach) return false;
    await steer(page, town.approach.x - town.player.x, town.approach.z - town.player.z, 170);
  }
  row.notes.push('could not reach the tavern in 70 steps');
  return false;
}
