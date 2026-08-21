#!/usr/bin/env node
/**
 * F-2142-1 — read the terminal state that GATE B discards.
 *
 * `scripts/gr-sim-campaign.mjs:111/:113` computes `outcome`, then throws
 * `"<contract> ended unsecured at wave N"` the instant `outcome.secured` is false, and the whole
 * of it — kills, gold, timeMs, the terminal `canyonConnect` row — is discarded with the exception.
 * The s2141 census therefore reported "the leg ends at wave 2" without being able to say WHY.
 *
 * This probe re-runs the SAME leg (same resume checkpoint, same pinned bench seed, same player
 * module) through the same `HeadlessContractSim` loop, and instead of throwing, prints:
 *   - the full terminal `outcome()`
 *   - `HeadlessContractSim.terminal` is `this.dead || this.secureChoice === 'bank'`
 *     (`src/sim/HeadlessContractSim.ts:1308`), so with `secured:false` the discriminator between
 *     "the rider went down" and "the rider banked" is decidable from the outcome + the last view
 *   - a RICH per-turn trace (hp, gold, kills, threats, works, prospector) beside the four-field
 *     census row, so the wave-2 end has a cause and not just a wave number
 *
 * It writes nothing to any pinned artifact and mutates no shipped file. Read-only investigation.
 *
 * Usage:
 *   node scripts/f2142-canyon-terminal-probe.mjs \
 *     --player scripts/f2135-canyon-census-player.mjs \
 *     --contract e3-canyon-works \
 *     --resume artifacts/f2135-canyon-census/epoch3-checkpoint.json \
 *     --out /tmp/s2142-canyon-terminal.json
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import benchSeeds from '../assets/contracts/bench-seeds.json' with { type: 'json' };

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const args = parseArgs(process.argv.slice(2));
const playerModule = await import(pathToFileURL(resolve(args.player)).href);
const player = playerModule.default ?? playerModule.ordersFor;
if (typeof player !== 'function') throw new Error('Player module must export a default order-generator function.');

// DEFAULT: byte-for-byte the harness's own URL (`scripts/gr-sim-campaign.mjs:17`) — `?debug` with
// NO `contract=`. `--search` overrides it so the SAME probe can be run under the query
// `scripts/gr-sim.test.mjs` uses (`?debug&contract=<id>`), which is the control that decides
// whether the refusals below are a fact about the contract or about the harness's URL.
globalThis.location = new URL(`http://gr-sim-campaign.local/${args.search ?? '?debug'}`);
const originalConsole = { log: console.log, info: console.info, debug: console.debug };
console.log = console.info = console.debug = () => undefined;
const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });

try {
  const { FakeStorage } = await vite.ssrLoadModule('/src/sim/FakeStorage.ts');
  const storage = new FakeStorage();
  installStorage(storage);
  const [
    { HeadlessContractSim },
    { unpackProfile },
    { contractUnlockStatus },
    { listBoardContracts },
    { resetStandingOrders },
  ] = await Promise.all([
    vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts'),
    vite.ssrLoadModule('/src/game/ProfileTransfer.ts'),
    vite.ssrLoadModule('/src/meta/ContractUnlock.ts'),
    vite.ssrLoadModule('/src/meta/ContractFamilies.ts'),
    vite.ssrLoadModule('/src/agent/StandingOrders.ts'),
  ]);
  Object.assign(console, originalConsole);

  const checkpoint = JSON.parse(await readFile(resolve(args.resume), 'utf8'));
  const restored = unpackProfile(storage, checkpoint);
  if (!restored.ok) throw new Error(restored.message);

  const board = listBoardContracts();
  const contract = board.find((candidate) => candidate.id === args.contract);
  if (!contract) throw new Error(`Contract "${args.contract}" is not on the board.`);
  const unlock = contractUnlockStatus(contract);
  if (!unlock.unlocked) throw new Error(`Contract "${contract.id}" is locked: ${unlock.condition}`);
  const seed = benchSeeds[contract.id]?.[0];
  if (!seed) throw new Error(`No pinned bench seed for ${contract.id}.`);

  resetStandingOrders();
  player.reset?.({ contractId: contract.id, legIndex: 0 });

  const sim = new HeadlessContractSim({ contractId: contract.id, seed }, { storage });
  const trace = [];
  let turn = sim.currentTurn();
  let turnIndex = 0;
  let rejected = null;
  while (!turn.terminal) {
    trace.push(row(turnIndex, turn.view));
    const orders = await player(turn.view, { contractId: contract.id, legIndex: 0 });
    const receipt = sim.submitOrders(orders ?? []);
    if (!receipt.outcome.ok) {
      rejected = { turnIndex, message: receipt.outcome.message ?? receipt.outcome.reason };
      break;
    }
    turn = sim.advanceToTurn();
    turnIndex += 1;
  }
  // The terminal view is the one the census never saw: the harness's loop exits on it and GATE B
  // throws before anything reads it.
  const terminalView = rejected ? null : row(turnIndex, turn.view);
  const outcome = rejected ? null : sim.outcome();

  // The refusal the trace names is `out_of_zone`, which `BuildSystem.rejectionDetail` maps from
  // `invalid_placement` — i.e. `matchesPlacement()` said no, NOT the range check (which reports
  // `out_of_reach` and sits one rung LOWER in the same ladder). `sentry_beacon` is
  // `placement: 'bank'`, so the binding predicate is `Terrain.isBuildable(x, z)`. Sample it at the
  // authored relay sites, on the terrain this very run booted.
  const Terrain = await vite.ssrLoadModule('/src/world/Terrain.ts');
  // CONTROL, before any verdict is read off `isBuildable`: `Terrain.ts` binds CLAIM_WIDTH/HEIGHT to
  // `ACTIVE_CONTRACT.tileParams` at MODULE-EVALUATION time. If this module resolved against a
  // different contract than the one the sim booted, `isBuildable` answers about the wrong map and
  // every cell outside the default 64x64 claim reads unbuildable AND unwalkable for a reason that
  // has nothing to do with the canyon. The canyon's own claim is 96x112.
  const { CLAIM_WIDTH, CLAIM_HEIGHT } = Terrain;
  if (CLAIM_WIDTH === undefined) throw new Error('CLAIM_WIDTH is undefined in /src/world/Terrain.ts');
  if (CLAIM_HEIGHT === undefined) throw new Error('CLAIM_HEIGHT is undefined in /src/world/Terrain.ts');
  const contractDimensions = contract.tileParams.dimensions;
  if (contractDimensions === undefined) {
    throw new Error('contract.tileParams.dimensions is undefined in /src/meta/ContractFamilies.ts');
  }
  if (contractDimensions.width === undefined) {
    throw new Error('contract.tileParams.dimensions.width is undefined in /src/meta/ContractFamilies.ts');
  }
  if (contractDimensions.height === undefined) {
    throw new Error('contract.tileParams.dimensions.height is undefined in /src/meta/ContractFamilies.ts');
  }
  const matchesRequestedContract = CLAIM_WIDTH === contractDimensions.width && CLAIM_HEIGHT === contractDimensions.height;
  const terrainBinding = {
    activeContractId: matchesRequestedContract ? contract.id : null,
    claimWidth: CLAIM_WIDTH,
    claimHeight: CLAIM_HEIGHT,
    contractDimensions,
    matchesRequestedContract,
  };
  const grid = args.grid ? JSON.parse(await readFile(resolve(args.grid), 'utf8')) : null;
  const sites = grid ?? [
    { id: 'pylon-west-base', x: -12, z: -36 }, { id: 'pylon-east-base', x: 12, z: -36 },
    { id: 'pylon-west-switch', x: -24, z: -20 }, { id: 'pylon-east-switch', x: 24, z: -20 },
    { id: 'pylon-east-rim', x: 28, z: 8 }, { id: 'pylon-west-rim', x: -28, z: 8 },
  ];
  // `HeadlessContractSim.syncContractPowerGrid` brings a relay online only while a standing
  // `sentry_beacon` sits within `tileParams.pylonSites[].radius` of the site — NOT only at its
  // exact centre. So the honest question is not "is the centre buildable?" but "is ANY point of
  // the admissible disc buildable?". Scan the whole disc at 0.25 wu, which is finer than any
  // placement grid in the build path.
  const RADIUS = Number(args.radius ?? 2.5);
  const STEP = 0.25;
  const groundCensus = sites.map((site) => {
    const sample = Terrain.sample(site.x, site.z);
    let scanned = 0;
    let buildableInDisc = 0;
    let nearest = null;
    for (let dx = -RADIUS; dx <= RADIUS + 1e-9; dx += STEP) {
      for (let dz = -RADIUS; dz <= RADIUS + 1e-9; dz += STEP) {
        const d = Math.hypot(dx, dz);
        if (d > RADIUS) continue;
        scanned += 1;
        const x = round(site.x + dx);
        const z = round(site.z + dz);
        if (!Terrain.isBuildable(x, z)) continue;
        buildableInDisc += 1;
        if (!nearest || d < nearest.d) nearest = { x, z, d: round(d) };
      }
    }
    return {
      ...site,
      centreBuildable: Terrain.isBuildable(site.x, site.z),
      centreWalkable: sample.walkable,
      discRadius: RADIUS,
      discScanned: scanned,
      discBuildable: buildableInDisc,
      nearestBuildableInDisc: nearest,
    };
  });

  const report = {
    schema: 'goldrush.f2142.canyon-terminal.v2',
    terrainBinding,
    groundCensus,
    contractId: contract.id,
    seed,
    ordersRejected: rejected,
    outcome,
    // `terminal === this.dead || this.secureChoice === 'bank'`; a non-secured terminal that
    // carries no bank choice is therefore the rider going down.
    terminalCause: outcome ? (outcome.secured ? 'secured/banked' : 'rider-down (dead)') : 'orders-rejected',
    terminalView,
    turnsObserved: trace.length,
    trace,
  };
  const out = resolve(args.out ?? '/tmp/s2142-canyon-terminal.json');
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({
    contractId: report.contractId,
    seed,
    terminalCause: report.terminalCause,
    outcome,
    turnsObserved: report.turnsObserved,
    firstRow: trace[0],
    lastLiveRow: trace[trace.length - 1],
    terminalView,
    wrote: out,
  }, null, 2));
} finally {
  await vite.close();
}

function row(turnIndex, view) {
  const now = view.now;
  const connect = view.canyonConnect ?? now.canyonConnect ?? null;
  return {
    turnIndex,
    wave: now.wave,
    runSeconds: round(now.timers?.runSeconds),
    hp: round(now.hero?.hp),
    maxHp: round(now.hero?.maxHp),
    gold: round(now.gold),
    prospector: now.prospector ? { x: round(now.prospector.x), z: round(now.prospector.z) } : null,
    heroPos: now.hero ? { x: round(now.hero.x), z: round(now.hero.z) } : null,
    threats: now.threats ? { ...now.threats } : null,
    works: now.works
      ? { standing: now.works.standing, wrecked: now.works.wrecked, hp: round(now.works.hp), byKind: { ...now.works.byKind } }
      : null,
    seamsActive: (now.seams ?? []).filter((seam) => seam.active && seam.remaining > 0).length,
    // The standing-order records carry `status` and, on refusal, the receipt's own reason
    // (`StandingOrders.finishAction` → `fail`). A BUILD that is ACCEPTED at submit time and then
    // REFUSED at execution time is invisible to `receipt.outcome.ok` in the harness loop, and this
    // is the only place the refusal is legible.
    orders: (now.orders ?? []).map((record) => ({
      verb: record?.order?.verb,
      what: record?.order?.what,
      where: record?.order?.where,
      when: record?.order?.when,
      status: record?.status,
      reason: record?.reason,
    })),
    connect: connect
      ? { powered: connect.powered, required: connect.required, complete: connect.complete, failed: connect.failed }
      : null,
  };
}

function round(value) {
  return typeof value === 'number' ? Math.round(value * 1000) / 1000 : value;
}

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) continue;
    parsed[token.slice(2)] = argv[index + 1];
    index += 1;
  }
  for (const required of ['player', 'contract', 'resume']) {
    if (!parsed[required]) throw new Error(`Missing --${required}`);
  }
  return parsed;
}

// Verbatim from `scripts/gr-sim-campaign.mjs:191` — the probe must boot the modules the same way
// the harness does, or it is measuring a different arrangement.
function installStorage(storage) {
  globalThis.localStorage = storage;
  globalThis.window = { location: globalThis.location, localStorage: storage };
}
