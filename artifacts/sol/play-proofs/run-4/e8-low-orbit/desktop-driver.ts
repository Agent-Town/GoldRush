/** Native inputs and read-only diagnostics; adapted from ../playability-secure.spec.ts.
 * Scores compare against pre-play state: secure itself banks, before Return to Town. */
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { META_PROGRESS_KEY } from '../../src/game/MetaProgress';
import {
  FIRST_CLAIM_DONE_KEY,
  PROFILE_KEY,
  SCOREBOARD_KEY,
  TOWN_NAME_KEY,
  TOWN_WELCOME_SEEN_KEY,
  profileDataKey,
  type ProfileState,
} from '../../src/game/ProfileStorage';
import { ACTIVE_EPOCH_KEY, listBoardContracts, listEpochs, type ContractManifest } from '../../src/meta/ContractFamilies';
import { researchStateKey } from '../../src/meta/ResearchTree';
import { STORY_TALES_STORAGE_KEY } from '../../src/story/settings';

const TIMESCALE = '4';
const HOLD_GROUND = process.env.GR_NATIVE_STRATEGY === 'hold-ground';
const BOOT_TIMEOUT_MS = 60_000;
const PLAY_BUDGET_MS = 600_000;
const PROFILE_ID = 'robin';
const BOARD_CONTRACTS = listBoardContracts();
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
  objective?: unknown;
  finalSnapshot?: Snapshot;
  peakHotBoilers: number;
  powerBanksPeak: Record<string, number>;
  at: string;
};

function epochOf(contractId: string): string {
  const ordinal = contractId.match(/^e(\d+)-/)?.[1];
  if (!ordinal) return 'epoch-1-frontier';
  return listEpochs().find((entry) => entry.id.startsWith(`epoch-${ordinal}-`))?.id ?? 'unknown';
}

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
  physics: ThreeGameDiagnostics['e8Physics'];
  air: ThreeGameDiagnostics['e8SuitAir'];
  probe: ThreeGameDiagnostics['probeRecovery'];
  fuel: ThreeGameDiagnostics['fuel'];
  vehicle: ThreeGameDiagnostics['vehicle'];
  repairs: number;
  channeling: boolean;
  objective: unknown;
  power: ThreeGameDiagnostics['power'];
  pressure: ThreeGameDiagnostics['pressure'];
  escort: ThreeGameDiagnostics['escort'];
  canyonWorks: ThreeGameDiagnostics['canyonWorks'];
  fairground: ThreeGameDiagnostics['fairground'];
  crowdFlocks: ThreeGameDiagnostics['crowdFlocks'];
};

async function read(page: Page): Promise<Snapshot | null> {
  return page
    .evaluate(() => {
      const d = window.__THREE_GAME_DIAGNOSTICS__;
      if (!d) return null;
      return {
        physics: d.e8Physics,
        air: d.e8SuitAir,
        probe: d.probeRecovery,
        fuel: d.fuel,
        vehicle: d.vehicle,
        escort: d.escort,
        canyonWorks: d.canyonWorks,
        fairground: d.fairground,
        crowdFlocks: d.crowdFlocks,
        power: d.power,
        pressure: d.pressure,
        objective: { air: d.e8SuitAir, probe: d.probeRecovery, fuel: d.fuel, vehicle: d.vehicle, landYacht: d.landYachtBoss, fairground: d.fairground, crowdFlocks: d.crowdFlocks, canyonWorks: d.canyonWorks, baron: d.baronRocket, boss: d.readability?.bossHpBar, medals: d.contract?.medals, pressure: d.pressure, escort: d.escort, power: d.power },
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
    if (now && now.sim - (row.samples.at(-1)?.t ?? 0) >= 10) {
      row.samples.push({ t: +now.sim.toFixed(1), wave: Math.max(now.wave, now.hudWave), hp: Math.round(now.hp), gold: Math.round(now.gold), kills: now.kills, x: +now.hero.x.toFixed(1), z: +now.hero.z.toFixed(1), alive: now.enemiesAlive, seams: now.nodes.filter(n => n.active).length });
      console.log(row.contract, JSON.stringify(row.samples.at(-1)));
    }
    if (now) for (const node of now.power.nodes) {
      if (node.kind === 'storage') row.powerBanksPeak[node.id] = Math.max(row.powerBanksPeak[node.id] ?? 0, node.storedWh ?? 0);
    }
    if (now) row.peakHotBoilers = Math.max(row.peakHotBoilers, now.pressure?.objective.hotBoilers ?? 0);
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

function homeFor(contract: ContractManifest, hero: { x: number; z: number }): Home {
  const tile = contract.tileParams as {
    stakeMarkers?: Array<{ x: number; z: number; heroStart?: boolean }>;
    buildZones?: Array<{ minX: number; maxX: number; minZ: number; maxZ: number }>;
  };
  const stake = tile.stakeMarkers?.find((marker) => marker.heroStart) ?? tile.stakeMarkers?.[0];
  const zones = tile.buildZones ?? [];

  const holding = stake ? zones.find((entry) => stake.x >= entry.minX && stake.x <= entry.maxX && stake.z >= entry.minZ && stake.z <= entry.maxZ) : undefined;
  const zone = holding ?? zones[0];
  const centre =
    stake && (holding || zones.length === 0)
      ? { x: stake.x, z: stake.z }
      : zone
        ? { x: (zone.minX + zone.maxX) / 2, z: (zone.minZ + zone.maxZ) / 2 }
        : { x: hero.x, z: hero.z };

  if (contract.id === "e1-baron") { centre.x = 3; centre.z = 11; }
  if (contract.id === "e2-incline") { centre.x = 0; centre.z = -18; }
  if (contract.id === 'e8-low-orbit') { centre.x = 10; centre.z = -6; }
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

async function walkTo(page: Page, row: Row, x: number, z: number, tolerance: number, steps = 90): Promise<boolean> {
  let best = Number.POSITIVE_INFINITY;
  let stalled = 0;
  for (let step = 0; step < steps; step += 1) {
    await takeUpgrades(page, row);
    const now = await read(page);
    if (!now || now.runState === 'dead' || now.secured || now.fairground?.spinning === false) return false;
    const dx = x - now.hero.x;
    const dz = z - now.hero.z;
    const gap = Math.hypot(dx, dz);
    const drifting = now.physics.active && now.physics.movement !== 'normal';
    const velocity = now.physics.filteredMovement;
    if (gap <= tolerance && (!drifting || Math.hypot(velocity.x, velocity.y) < 0.12)) return true;
    if (drifting && gap < 8) {
      // Counter-thrust against the published momentum before calling a seam reached.
      // Releasing keys alone coasts out of the 1.6-unit harvest disc.
      await steer(page, (gap <= tolerance ? 0 : dx) - 3 * velocity.x, (gap <= tolerance ? 0 : dz) - 3 * velocity.y, Math.min(65, Math.max(16, gap * 8)));
      await page.waitForTimeout(60);
      continue;
    }
    if (gap < best - 0.35) {
      best = gap;
      stalled = 0;
    } else {
      stalled += 1;
      if (stalled >= 8) return false;
    }

    const slide = stalled >= 4 ? 1 : 0;
    await steer(page, dx + slide * -dz * 0.8, dz + slide * dx * 0.8, Math.min(160, Math.max(16, gap * 18)));
  }
  return false;
}

type Crossing = { x: number };

function crossingsFor(contract: ContractManifest): Crossing[] {
  const tile = contract.tileParams as { river?: boolean; ford?: boolean; fords?: Array<{ x: number }> };
  if (tile.river !== true) return [];
  if (tile.fords?.length) return tile.fords.map(({ x }) => ({ x }));
  return tile.ford === true ? [{ x: 0 }] : [];
}

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
    if (!now || now.runState === 'dead' || now.secured || now.fairground?.spinning === false) return false;
    if (now.gold >= amount) return true;
    if (now.air && now.air.suit.seconds < 30) {
      if (!(await refillOrbital(page, row))) return false;
      continue;
    }
    const live = now.nodes.filter((node) => node.active && !unreachable.has(`${node.x},${node.z}`));
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
      unreachable.add(`${node.x},${node.z}`);
      row.notes.push(`seam ${node.id} (${node.x.toFixed(1)},${node.z.toFixed(1)}) unreachable on foot`);
      continue;
    }
    for (let tick = 0; tick < 140; tick += 1) {
      await takeUpgrades(page, row);
      const next = await read(page);
      if (!next || next.runState === 'dead') return false;
      if (next.gold >= amount) return true;
      if (next.air && next.air.suit.seconds < 30) break;
      if (!next.nodes.find((entry) => entry.id === node.id)?.active) break;
      if (Math.hypot(next.hero.x - node.x, next.hero.z - node.z) > 1.5) break;
      await page.waitForTimeout(140);
    }
  }
  return false;
}

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

  if (!(await journey(page, row, x, z + 2, 1.2, fords, 90))) {
    const here = await read(page);
    row.notes.push(`could not stand at ${x.toFixed(1)},${(z + 2).toFixed(1)} for ${id}; building from ${here?.hero.x.toFixed(1)},${here?.hero.z.toFixed(1)}`);
    if (!here || here.runState === 'dead') return false;
  }
  await takeUpgrades(page, row);
  const tile = page.getByTestId(`hud-build-tile-${id}`);
  let selected = false;
  for (let retry = 0; retry < 12; retry++) {
    await takeUpgrades(page, row);
    if (!(await tile.isVisible())) {
      await page.getByTestId('hud-build').click({ timeout: 600 }).catch(() => undefined);
      continue;
    }
    try { await tile.click({ timeout: 600 }); selected = true; break; } catch {}
  }
  if (!selected) { row.notes.push(`could not select ${id} after upgrade interruptions`); return false; }
  await page.waitForTimeout(200);
  for (let nudge = 0; nudge < 10; nudge += 1) {
    const now = await read(page);
    if (!now || now.runState === 'dead' || now.secured || now.fairground?.spinning === false) return false;
    if (now.ghostValid) break;

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

async function maintain(page: Page, row: Row, home: Home, deadline: number, fords: Crossing[], unreachable: Set<string>): Promise<void> {
  const now = await read(page);
  if (!now || now.runState === 'dead') return;
  if (row.contract === "e1-baron" && HOLD_GROUND && now.wave >= 12 && now.gold < 10) return;
  if (row.contract === "e1-twin-banks" && HOLD_GROUND && now.wave >= 13) return;
  if (row.contract === "e2-pressure-garden") return;
  if (row.contract === "e2-incline" && now.wave >= 8) return;
  const hurt = now.defences
    .filter(entry => row.contract !== "e3-blackout-ridge" || Math.hypot(entry.x - home.x, entry.z - home.z) < 18)
    .filter((entry) => (!entry.wrecked || row.contract === 'e3-fairground') && entry.hp < entry.maxHp * 0.55 && entry.repairCost > 0)
    .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
  if (hurt) {
    if (row.contract === "e1-baron" && HOLD_GROUND && now.wave >= 12 && now.gold < hurt.repairCost) return;
    if (!(await fund(page, row, hurt.repairCost, Math.min(deadline, Date.now() + 45_000), fords, unreachable))) return;
    if (row.contract === 'e3-fairground') {
      if (!(await walkTo(page, row, hurt.x, hurt.z, 1.25, 45))) return;
    } else if (!(await journey(page, row, hurt.x, hurt.z - 1, 1, fords, 45))) return;
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

  if (row.contract === "e3-fairground") return;
  if (row.contract === "e1-baron" && HOLD_GROUND && now.wave >= 12) return;
  const room =
    now.buildables.find((entry) => entry.id === 'turret' && entry.count < entry.maxCount && entry.cost <= now.gold + 120) ??
    now.buildables.find((entry) => entry.id === 'sentry_beacon' && entry.count < entry.maxCount);
  if (!room || now.defences.length >= 8) return;
  const ring = now.defences.length;
  const angle = (ring * 2.39996) % (Math.PI * 2);
  const radius = 5 + (ring % 3) * 2;
  await build(page, row, room.id, home.x + Math.cos(angle) * radius, home.z + Math.sin(angle) * radius, Math.min(deadline, Date.now() + 60_000), fords, unreachable);
}

// Return to this map's authored pressurised ground, using ordinary movement.
async function refillOrbital(page: Page, row: Row): Promise<boolean> {
  const target = row.contract === 'e8-far-side' ? [10, -34] : [10, -6];
  if (!(await walkTo(page, row, target[0], target[1], 1.5, 150))) return false;
  for (let tick = 0; tick < 100; tick++) {
    await takeUpgrades(page, row);
    const now = await read(page);
    if (!now || now.runState === 'dead') return false;
    if ((now.air?.suit.seconds ?? 0) >= 58) return true;
    await page.waitForTimeout(150);
  }
  return false;
}

async function farSideCrossing(page: Page, row: Row): Promise<void> {
  if (!(await refillOrbital(page, row))) return;
  // Enter the rectangle itself for air credit; recovery alone has a larger reach.
  const reached = await walkTo(page, row, 10, 39.5, 1, 220);
  await takeUpgrades(page, row);
  if (reached) {
    for (let press = 0; press < 5; press++) {
      await takeUpgrades(page, row);
      await page.keyboard.press('Space');
      await page.waitForTimeout(150);
      if ((await read(page))?.probe.recovered) break;
    }
  }
  const now = await read(page);
  if (reached && now && now.gold >= 50 && !row.builds.some(b => b.z >= 38)) {
    await build(page, row, 'turret', 10, 40, Date.now() + 5000, [], new Set());
  }
  row.notes.push(`Far Side crossing: reached=${reached}, hero=${JSON.stringify(now?.hero)}, air=${JSON.stringify(now?.air)}, probe=${JSON.stringify(now?.probe)}`);
  await refillOrbital(page, row);
}

async function lowOrbitCrossing(page: Page, row: Row, deadline: number, unreachable: Set<string>): Promise<void> {
  const start = await read(page);
  const crossing = start?.air?.crossing;
  const side = crossing?.reached.includes('west-scaffold-deck') && !crossing.reached.includes('east-scaffold-deck') ? 1
    : (crossing?.credited ?? 0) % 2 === 0 ? -1 : 1;
  await fund(page, row, 50, Math.min(deadline, Date.now() + 30_000), [], unreachable);
  if (!(await refillOrbital(page, row))) return;
  await walkTo(page, row, 0, -10, 1.5, 100);
  await walkTo(page, row, side * 18, 0, 1.5, 100);
  const reached = await walkTo(page, row, side * 32, 0, 1.5, 140);
  const now = await read(page);
  row.notes.push(`Low Orbit deck ${side}: reached=${reached}, hero=${JSON.stringify(now?.hero)}, air=${JSON.stringify(now?.air)}`);
  if (reached && !row.builds.some(b => side * b.x >= 26)) {
    await build(page, row, 'turret', side * 34, 0, Math.min(deadline, Date.now() + 10_000), [], unreachable);
  }
  await walkTo(page, row, side * 18, 0, 1.5, 100);
  await walkTo(page, row, 0, -10, 1.5, 100);
  await refillOrbital(page, row);
}

// Motor errands use the ordinary confirm key at surveyed stakes and haul destinations.
async function motorStop(page: Page, row: Row, x: number, z: number, tolerance = 0.8): Promise<boolean> {
  if (!(await walkTo(page, row, x, z, tolerance, 120))) {
    row.notes.push(`motor stop unreachable: ${x},${z}; hero=${JSON.stringify((await read(page))?.hero)}`);
    return false;
  }
  // Confirm can be consumed by an upgrade appearing between movement and the key event.
  // Verify the actual destination, and issue a fresh key only if the dispatch never changed.
  for (let press = 0; press < 5; press++) {
    await takeUpgrades(page, row);
    await page.keyboard.press('Space');
    await page.waitForTimeout(250);
    const next = await read(page);
    if (!next || next.runState === 'dead') return false;
    const target = next.vehicle?.target;
    if (target && Math.hypot(target.x - x, target.z - z) < 2) break;
    if (next.vehicle?.state === 'arrived' && Math.hypot(next.vehicle.x - x, next.vehicle.z - z) < 2) break;
  }
  for (let tick = 0; tick < 100; tick++) {
    await takeUpgrades(page, row);
    const now = await read(page);
    if (!now || now.runState === 'dead') return false;
    if (now.vehicle?.state === 'arrived' || now.vehicle?.state === 'dry') {
      const arrived = now.vehicle.state === 'arrived' && Math.hypot(now.vehicle.x - x, now.vehicle.z - z) < 2;
      row.notes.push(`motor stop ${x},${z}: arrived=${arrived}, sim=${now.sim.toFixed(1)}, vehicle=${JSON.stringify(now.vehicle)}, fuel=${JSON.stringify(now.fuel)}`);
      return arrived;
    }
    await page.waitForTimeout(150);
  }
  row.notes.push(`motor stop ${x},${z}: arrival wait exhausted`);
  return false;
}

async function motorOpening(page: Page, row: Row): Promise<void> {
  const initial = await read(page);
  for (const node of initial?.fuel?.nodes ?? []) {
    const reached = await walkTo(page, row, node.x, node.z, 0.8, 120);
    if (reached) await page.waitForTimeout(350);
    row.notes.push(`tar ${node.x},${node.z}: reached=${reached}, fuel=${JSON.stringify((await read(page))?.fuel)}`);
  }
  if (row.contract === 'e4-boneyard') {
    // Aim outside the solid boiler centre but within hitch reach; this approach remains unproved.
    if (await motorStop(page, row, -8, -38)) {
      if (await motorStop(page, row, -34, -4)) {
        await walkTo(page, row, -24, -14, 0.8);
        await walkTo(page, row, -18, -14, 0.8);
        if (await motorStop(page, row, -18, -10, 0.5)) {
          if (await motorStop(page, row, -34, -4)) await motorStop(page, row, -8, -38);
        }
      }
    }
    await walkTo(page, row, 0, -44, 1.2, 120);
  }
  if (row.contract === 'e4-gusher-county') {
    // Keep the Hauler on graded spokes, returning through camp rather than cutting between leases.
    const leases = [
      { index: 0, start: [-12, -8], end: [-50, -40] },
      { index: 1, start: [12, -8], end: [48, -38] },
      { index: 2, start: [0, 8], end: [0, 46] },
    ];
    for (const lease of leases) {
      if (!(await motorStop(page, row, lease.start[0], lease.start[1]))) break;
      // A closed spoke loses its fuel discount. Wait at the stake through its own storm.
      for (let wait = 0; wait < 100; wait++) {
        await takeUpgrades(page, row);
        const now = await read(page);
        if (!now || now.runState === 'dead') return;
        const within = now.sim % 30;
        if (Math.floor(now.sim / 30) % 3 !== lease.index || within < 6 || within >= 22) break;
        await page.waitForTimeout(150);
      }
      if (!(await motorStop(page, row, lease.end[0], lease.end[1]))) break;
      // A parked Hauler delivers as soon as this lease reopens.
      for (let wait = 0; wait < 100; wait++) {
        await takeUpgrades(page, row);
        const now = await read(page);
        if (!now || now.runState === 'dead') return;
        if (Math.floor(now.sim / 30) % 3 !== lease.index || now.sim % 30 < 10 || now.sim % 30 >= 22) break;
        await page.waitForTimeout(150);
      }
      row.notes.push(`lease ${lease.index} rested open at sim=${(await read(page))?.sim}`);
      if (lease.index !== 2 && !(await motorStop(page, row, lease.start[0], lease.start[1]))) break;
    }
    await walkTo(page, row, 0, -4, 1.2, 120);
  }
  if (row.contract === 'e4-dust-flats') {
    if (await motorStop(page, row, 0, 12)) await motorStop(page, row, 0, 72);
    await walkTo(page, row, 0, 8, 1.2, 120);
  }
}

type KitPiece = { id: string; dx: number; dz: number };

function kitFor(contract: ContractManifest): KitPiece[] {
  if (contract.id === 'e3-fairground') return [
    { id: 'palisade', dx: -8, dz: 0 },
    { id: 'sentry_beacon', dx: -4, dz: -4 },
    { id: 'palisade', dx: 8, dz: 0 },
    { id: 'sentry_beacon', dx: 4, dz: -4 },
    { id: 'palisade', dx: -8, dz: 8 },
    { id: 'palisade', dx: 8, dz: 8 },
    { id: 'sentry_beacon', dx: -4, dz: 4 },
    { id: 'sentry_beacon', dx: 4, dz: 4 },
    { id: 'palisade', dx: -8, dz: -8 },
    { id: 'palisade', dx: 8, dz: -8 },
  ];
  if (contract.id === 'e3-canyon-works') return [
    { id: 'sentry_beacon', dx: -12, dz: 8 },
    { id: 'sentry_beacon', dx: -24, dz: 24 },
    { id: 'sentry_beacon', dx: -28, dz: 52 },
    { id: 'sentry_beacon', dx: 12, dz: 8 },
    { id: 'sentry_beacon', dx: 24, dz: 24 },
    { id: 'sentry_beacon', dx: 28, dz: 52 },
  ];
  if (contract.id === 'e3-blackout-ridge') return [
    { id: 'capacitor_bank', dx: -8, dz: -26 },
    { id: 'capacitor_bank', dx: -18, dz: -26 },
  ];
  if (contract.id === 'e2-incline') return [
    { id: 'sentry_beacon', dx: 8, dz: -4 },
    { id: 'turret', dx: -8, dz: -4 },
    { id: 'turret', dx: 8, dz: -4 },
    { id: 'turret', dx: -8, dz: 3 },
    { id: 'turret', dx: 8, dz: 3 },
  ];
  if (contract.id === 'e2-pressure-garden') return [
    { id: 'boiler_house', dx: 0, dz: 0 },
    { id: 'boiler_house', dx: 12, dz: 0 },
    { id: 'boiler_house', dx: 24, dz: 0 },
    { id: 'turret', dx: -6, dz: 1 },
  ];
  if (contract.id === 'e1-baron' && HOLD_GROUND) return [
    { id: 'turret', dx: 0, dz: -2 },
    { id: 'sluice', dx: 4, dz: -5 },
    { id: 'turret', dx: 5, dz: 1 },
    { id: 'turret', dx: -5, dz: 2 },
    { id: 'turret', dx: 1, dz: 6 },
  ];
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

export function nativeProof(id: string, run = 1) {
  const contract = BOARD_CONTRACTS.find(entry => entry.id === id)!;
  const ARTIFACT_ROOT = path.resolve(`artifacts/sol/play-proofs/run-${process.env.GR_NATIVE_RUN ?? run}`, id);

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

      let secureWave = Math.max(0, Math.floor(contract.twist?.secureWave ?? 0));
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
        peakHotBoilers: 0,
        powerBanksPeak: {},
        builds: [],
        upgrades: [],
        samples: [],
        consoleErrors,
        pageErrors,
        notes: [`epoch=${epochOf(contract.id)}`, `strategy=${HOLD_GROUND || contract.id === "e2-incline" ? "hold-ground" : "gather-and-extend"}`],
        at: new Date().toISOString(),
      };

      try {

        await seed(page, contract.id);
        if (contract.id === 'e2-incline') {
          // The Book's real launch button selects Incline Haul; a bare contract URL does not.
          await page.goto('/');
          await page.getByTestId('start-menu-enter-town').click({ timeout: 20_000 });
          await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: BOOT_TIMEOUT_MS });
          expect(await walkToTavern(page, row)).toBe(true);
          await page.getByTestId('town-open-board').click();
          await page.getByTestId(`contract-chapter-tab-${epochOf(contract.id)}`).click();
          await page.getByTestId(`contract-launch-${contract.id}`).click();
          await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.escort.enabled === true, undefined, { timeout: BOOT_TIMEOUT_MS });
          const launch = new URL(page.url());
          launch.searchParams.set('timescale', TIMESCALE);
          await page.goto(launch.toString());
        } else await page.goto(`/?contract=${encodeURIComponent(contract.id)}&timescale=${TIMESCALE}`);
        try {
          await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 12, undefined, { timeout: BOOT_TIMEOUT_MS });
          const active = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract);
          row.boots =
            active?.activeId === contract.id && active?.fallbackReason === null
              ? pass(`activeId=${active.activeId} secureWave=${active.secureWave}`)
              : fail(`requested ${contract.id}, got activeId=${active?.activeId ?? 'none'} fallbackReason=${String(active?.fallbackReason)}`);
          secureWave = row.secureWave = active?.secureWave ?? secureWave;
          row.notes.push(`engine secureWave=${active?.secureWave ?? 'unknown'} cadenceMult=${active?.waveCadenceMult ?? 'unknown'}`);
        } catch (error) {
          row.boots = fail(`no game frame within ${BOOT_TIMEOUT_MS}ms: ${String((error as Error).message).split('\n')[0]}`);
        }
        expect(row.boots.ok, `boots: ${row.boots.detail}`).toBe(true);

        await page.getByTestId('contract-briefing-dismiss').click({ timeout: 10_000 }).catch(() => undefined);
        await expect(page.getByTestId('contract-briefing')).toBeHidden({ timeout: 10_000 });
        await unpause(page, row);
        const initialScores = new Set((await readScores(page)).map(score => JSON.stringify(score)));

        const opened = await read(page);
        const home = homeFor(contract, opened?.hero ?? { x: 0, z: 0 });
        row.notes.push(`home=${home.x.toFixed(1)},${home.z.toFixed(1)} circuit=${JSON.stringify(home.circuit)}`);
        const deadline = Date.now() + PLAY_BUDGET_MS;
        const secured = page.getByTestId('claim-secured');
        const fords = crossingsFor(contract);
        const unreachable = new Set<string>();

        if (contract.id === 'e8-far-side') await farSideCrossing(page, row);
        if (contract.id === 'e4-boneyard') {
          await build(page, row, 'turret', 0, -48, Math.min(deadline, Date.now() + 90_000), fords, unreachable);
          await motorOpening(page, row);
        }
        if (contract.id === 'e4-gusher-county') await motorOpening(page, row);
        if (contract.id === 'e4-dust-flats') {
          // Establish cover before the long railhead errand; the haul-first attempt died gathering.
          await build(page, row, 'turret', 0, 4, Math.min(deadline, Date.now() + 90_000), fords, unreachable);
          await build(page, row, 'sentry_beacon', -4, 9, Math.min(deadline, Date.now() + 90_000), fords, unreachable);
          await motorOpening(page, row);
        }
        if (contract.id === 'e2-pressure-garden') {
          if (HOLD_GROUND) {
            await build(page, row, 'turret', -29, 24, Math.min(deadline, Date.now() + 60_000), fords, unreachable);
            await build(page, row, 'turret', -21, 27, Math.min(deadline, Date.now() + 60_000), fords, unreachable);
          }
          // Coal is on the high terrace. Walk outside the central manifold first.
          await walkTo(page, row, -32, 12, 1.2);
          await walkTo(page, row, -32, 26, 1.2);
          await walkTo(page, row, -24, 39, 1.2);
          for (const seam of opened?.pressure.seams ?? []) {
            const reached = await walkTo(page, row, seam.x, seam.z, 1);
            if (reached) await page.waitForTimeout(350);
            const coal = (await read(page))?.pressure;
            row.notes.push(`coal ${seam.x},${seam.z}: reached=${reached}, stored=${coal?.coal}`);
          }
        }
        if (contract.id === 'e2-pressure-garden') {
          await fund(page, row, 200, Math.min(deadline, Date.now() + 120_000), fords, unreachable);
          await walkTo(page, row, -32, 26, 1.2);
          await walkTo(page, row, -32, 12, 1.2);
          await walkTo(page, row, -12, 14, 1.2);
          // Coal is finite. Commission the boilers near wave 7 so they can run through wave 12.
          while (Date.now() < deadline) {
            await takeUpgrades(page, row);
            const ready = await read(page);
            if (!ready || ready.sim >= 205 || ready.runState === 'dead' || ready.secured) break;
            await page.waitForTimeout(150);
          }
          const ready = await read(page);
          row.notes.push(`boiler commissioning: sim=${ready?.sim}, wave=${ready?.wave}, hp=${ready?.hp}, gold=${ready?.gold}, coal=${ready?.pressure.coal}, hero=${JSON.stringify(ready?.hero)}`);
        }
        if (contract.id === 'e3-blackout-ridge') {
          await fund(page, row, 200, Math.min(deadline, Date.now() + 120_000), fords, unreachable);
        }
        if (contract.id === 'e3-canyon-works') {
          // Test the marked bridge, then independent approaches along the full-width terrace.
          const approaches = testInfo.project.name === 'desktop-chrome' ? [0, -24, -44] : [0, 24, 44];
          for (const x of approaches) {
            await walkTo(page, row, x, -12, 1);
            const crossed = await walkTo(page, row, x, -5.5, 0.6, 65);
            const probe = await read(page);
            row.notes.push(`southern terrace approach x=${x}: crossed=${crossed}, hero=${JSON.stringify(probe?.hero)}, wave=${probe?.wave}, gold=${probe?.gold}`);
            if (crossed) {
              await journey(page, row, -34, 30, 1.2, fords);
              break;
            }
          }
        }
        const kit = kitFor(contract);
        row.notes.push(`kit=${kit.map((piece) => piece.id).join('+')}`);
        let kitIndex = 0;
        let corner = 0;
        let cornerBest = Number.POSITIVE_INFINITY;
        let cornerStall = 0;
        let lastMaintenance = 0;
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
          row.objective = now.objective;
          if (now.sim - (row.samples.at(-1)?.t ?? 0) >= 10) {
            console.log(contract.id, JSON.stringify({t: Math.round(now.sim), wave: now.wave, hp: Math.round(now.hp), gold: now.gold, hero: now.hero, builds: row.builds.length}));
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
          if (contract.id === 'e2-incline' && now.escort.enabled && now.escort.objectiveLost) {
            died = `ore cart lost at wave ${now.wave}, sim ${now.sim.toFixed(1)}, hero ${now.hero.x.toFixed(1)},${now.hero.z.toFixed(1)}`;
            break;
          }
          if (contract.id === 'e3-canyon-works' && now.canyonWorks?.failed) {
            died = `CONNECT deadline missed: ${JSON.stringify(now.canyonWorks)}; hero=${JSON.stringify(now.hero)}, gold=${now.gold}`;
            break;
          }
          if (now.paused) await unpause(page, row);

          if (contract.id === 'e8-low-orbit' && now.air?.crossing && !now.air.crossing.complete && now.air.crossing.creditedThisWindow === 0) {
            await lowOrbitCrossing(page, row, deadline, unreachable);
            continue;
          }
          if (contract.id === 'e8-far-side' && now.air?.crossing && !now.air.crossing.complete && now.air.crossing.creditedThisWindow === 0) {
            await farSideCrossing(page, row);
            continue;
          }
          if (now.air && now.air.suit.seconds < 30) {
            await refillOrbital(page, row);
            continue;
          }
          if (contract.id === 'e3-fairground' && now.fairground?.spinning === false) {
            died = `Fair Wheel stopped irreversibly: ${JSON.stringify(now.fairground)}; flocks=${JSON.stringify(now.crowdFlocks)}`;
            break;
          }
          if (contract.id === 'e3-fairground' && kitIndex >= 4 && now.sim - lastMaintenance >= 12) {
            lastMaintenance = now.sim;
            await maintain(page, row, home, deadline, fords, unreachable);
            continue;
          }
          if (kitIndex < kit.length) {
            const piece = kit[kitIndex];
            kitIndex += 1;
            await build(page, row, piece.id, home.x + piece.dx, home.z + piece.dz, Math.min(deadline, Date.now() + 90_000), fords, unreachable);
            continue;
          }

          if (contract.id === 'e3-blackout-ridge') {
            // Restore paid banks as well as the trunk; a connected wreck stores nothing.
            const broken = now.defences.filter(b =>
              (b.id === 'capacitor_bank' || b.id === 'sentry_beacon') && b.hp < b.maxHp * 0.8,
            ).sort((a, b) => a.x - b.x)[0];
            const reserve = now.defences.reduce((sum, b) => sum + b.repairCost, 10);
            if (broken && await fund(page, row, reserve, Math.min(deadline, Date.now() + 30_000), fords, unreachable)) {
              await walkTo(page, row, broken.x, broken.z, 1.25);
              const before = (await read(page))?.repairs ?? 0;
              for (let tick = 0; tick < 40; tick++) {
                await takeUpgrades(page, row);
                const repaired = await read(page);
                if (!repaired || repaired.runState === 'dead' || repaired.secured || repaired.repairs > before) break;
                await page.waitForTimeout(150);
              }
              row.notes.push(`repair ${broken.id} ${broken.x},${broken.z}: ${(await read(page))?.repairs}, before=${before}; storage=${JSON.stringify(row.powerBanksPeak)}`);
            } else await page.waitForTimeout(200);
            continue;
          }
          if (now.sim - lastMaintenance >= 25) {
            lastMaintenance = now.sim;
            await maintain(page, row, home, deadline, fords, unreachable);
            continue;
          }

          if (contract.id === 'e2-incline' && now.wave >= 8) {
            if (Math.hypot(now.hero.x, now.hero.z + 18) > 1.5) await walkTo(page, row, 0, -18, 1.5, 20);
            else await page.waitForTimeout(200);
            continue;
          }
          if (contract.id === 'e1-twin-banks' && HOLD_GROUND && now.wave >= 13) {
            if (Math.hypot(now.hero.x + 2, now.hero.z + 13) > 1.5) {
              await walkTo(page, row, -2, -13, 1.5, 20);
            } else await page.waitForTimeout(200);
            continue;
          }
          const [cx, cz] = home.circuit[corner];
          const gap = Math.hypot(cx - now.hero.x, cz - now.hero.z);

          if (gap < 1.6 || cornerStall >= 12) {
            corner = (corner + 1) % home.circuit.length;
            cornerBest = Number.POSITIVE_INFINITY;
            cornerStall = 0;
          } else if (fords.length > 0 && Math.sign(now.hero.z) !== Math.sign(cz) && Math.abs(now.hero.z) > 1.5) {

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
          row.objective = atSecure.objective;
        }
        row.finalSnapshot = atSecure ?? undefined;
        row.secures = sawOverlay
          ? pass(`Claim Secured at wave ${row.peakWave} / ${row.simAtEnd.toFixed(1)}s sim, ${row.hpAtEnd.toFixed(0)} HP, ${row.builds.length} buildings`)
          : fail(
              died ||
                `never secured: peak wave ${row.peakWave} of ${secureWave} after ${row.simAtEnd.toFixed(1)}s sim (runState=${row.runStateAtEnd || 'unknown'}, ${row.builds.length} buildings, ${row.killsAtEnd} kills)`,
            );

        if (contract.id === 'e8-low-orbit' && (!atSecure?.air?.crossing?.complete || ![-1, 0, 1].every(side => row.builds.some(b => side === 0 ? Math.abs(b.x) <= 18 : side * b.x >= 26)))) {
          row.secures = fail(`${row.secures.detail}; four air-supported deck entries and builds on all three decks not proved`);
        }
        if (contract.id === 'e8-far-side' && (!atSecure?.air?.crossing?.complete || !atSecure.probe.recovered || atSecure.probe.playbackCount !== 1 || !row.builds.some(b => b.z >= 38) || !row.builds.some(b => b.z <= -30))) {
          row.secures = fail(`${row.secures.detail}; four air-supported crossings, one probe playback and builds at both grounds not proved`);
        }
        if (contract.id === 'e3-blackout-ridge' && !['capacitor-west', 'capacitor-east'].every(id => (row.powerBanksPeak[id] ?? 0) > 0)) {
          row.secures = fail(`${row.secures.detail}; authored banks not both observed storing current: ${JSON.stringify(row.powerBanksPeak)}`);
        }
        if (contract.id === 'e3-fairground' && (!atSecure?.fairground?.spinning || !atSecure?.crowdFlocks?.allCrossed)) {
          row.secures = fail(`${row.secures.detail}; wheel and all three flock crossings not proved`);
        }
        if (contract.id === 'e3-canyon-works' && !atSecure?.canyonWorks?.complete) {
          row.secures = fail(`${row.secures.detail}; both galleries were not connected by wave 8`);
        }
        if (contract.id === 'e2-incline' && (!atSecure?.escort.enabled || atSecure.escort.arrived < atSecure.escort.required)) {
          row.secures = fail(`${row.secures.detail}; Incline Haul not completed: ${JSON.stringify(atSecure?.escort)}`);
        }
        if (contract.id === 'e2-pressure-garden' && row.peakHotBoilers < 3) {
          row.secures = fail(`${row.secures.detail}; wave ${row.peakWave}, overlay=${sawOverlay}, but only ${row.peakHotBoilers}/3 authored boiler beds operated hot`);
        }
        await page.screenshot({ path: path.join(ARTIFACT_ROOT, `terminal-${testInfo.project.name}.png`) });

        if (sawOverlay) {
          try {

            const before = initialScores;
            await page.getByTestId('bank-secured-claim').click({ timeout: 10_000 });
            await expect(page.getByTestId('claim-secured')).toBeHidden({ timeout: 10_000 });
            const scores = await readScores(page);
            const fresh = scores.filter((score) => !before.has(JSON.stringify(score)));
            const banked = fresh.find((score) => score.contractId === contract.id && score.secured === true && (score.waves ?? 0) >= secureWave);
            row.banks = banked
              ? pass(`a NEW secured row for ${contract.id}: waves=${banked.waves} gold=${banked.gold} timeAlive=${Math.round(banked.timeAlive ?? 0)} kills=${banked.kills ?? '?'} (${fresh.length} new row(s) since pre-play, retained after Return to Town)`)
              : fail(
                  `no new secured row since pre-play for ${contract.id} at >= wave ${secureWave} (${fresh.length} new row(s): ${JSON.stringify(fresh.slice(0, 2))})`,
                );
          } catch (error) {
            row.banks = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
          }
        } else {
          row.banks = fail('skipped: never secured');
        }

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
            await page.screenshot({ path: path.join(ARTIFACT_ROOT, `board-${testInfo.project.name}.png`) });
          } catch (error) {
            row.board = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
          }
        } else {
          row.board = fail('skipped: never banked');
        }

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
            expect(await rawScores(page), 'score still byte-identical after opening the Book').toBe(before);
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
        if (!row.banks.ok) row.finalSnapshot = (await read(page)) ?? undefined;
        if (row.finalSnapshot) {
          row.objective = row.finalSnapshot.objective;
          if (!row.banks.ok) {
            row.peakWave = Math.max(row.peakWave, row.finalSnapshot.wave, row.finalSnapshot.hudWave);
            row.simAtEnd = row.finalSnapshot.sim;
            row.hpAtEnd = row.finalSnapshot.hp;
            row.goldAtEnd = row.finalSnapshot.gold;
            row.runStateAtEnd = row.finalSnapshot.runState;
          }
        }
        await page.screenshot({ path: path.join(ARTIFACT_ROOT, `last-${testInfo.project.name}.png`) }).catch(() => undefined);
        row.clean = consoleErrors.length === 0 && pageErrors.length === 0 ? pass('0 console, 0 page') : fail(JSON.stringify({consoleErrors, pageErrors}));
        await writeFile(path.join(ARTIFACT_ROOT, `row-${testInfo.project.name}.json`), JSON.stringify(row, null, 2) + '\n');
      }

      expect(row.secures.ok, `secures: ${row.secures.detail}`).toBe(true);
      expect(row.banks.ok, `banks: ${row.banks.detail}`).toBe(true);
      expect(row.board.ok, `board: ${row.board.detail}`).toBe(true);
      expect(row.reload.ok, `reload: ${row.reload.detail}`).toBe(true);
      expect(row.clean.ok, `clean: ${row.clean.detail}`).toBe(true);
    });
}

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
