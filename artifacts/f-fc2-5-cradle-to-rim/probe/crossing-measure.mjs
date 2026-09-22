// F-FC2-5 scope 1 — MEASURE THE MECHANISM.
//
// Re-runs `scripts/e8-remaining-maps.test.mjs`'s `crossingRide('e8-far-side', …)` order-for-order
// and records, per turn: the hero's position, the MOVE_HERO target and whether the submission was
// accepted, the crossing window state, and whether `now.probeRecovery.recovered` ever flips.
//
// Usage: node artifacts/f-fc2-5-cradle-to-rim/probe/crossing-measure.mjs <label> [maxDecisions]
// Writes artifacts/f-fc2-5-cradle-to-rim/probe/<label>.json and prints a summary.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const label = process.argv[2] ?? 'run';
const maxDecisions = Number(process.argv[3] ?? 200);

const read = (relative) => readFileSync(new URL(`../../../${relative}`, import.meta.url), 'utf8');
const bundle = JSON.parse(read('assets/contracts/epoch-8-orbital/contracts.json')).contracts;
const manifestOf = (id) => bundle.find((entry) => entry.id === id);

const location = new URL('http://gr-sim.local/?debug&contract=e8-far-side&seed=e8-far-side-01');
globalThis.location = location;
globalThis.window = { location };
const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
const { landmarkBlockersFor } = await vite.ssrLoadModule('/src/world/LandmarkCollision.ts');

const centreOf = (zone) => ({ x: (zone.minX + zone.maxX) / 2, z: (zone.minZ + zone.maxZ) / 2 });
const zoneOf = (id, contractId) => {
  const tile = manifestOf(contractId).tileParams;
  return [...(tile.buildZones ?? []), ...(tile.orbitalScaffoldZones ?? []), ...(tile.probeRecoveryZones ?? [])]
    .find((zone) => zone.id === id);
};

const blockers = landmarkBlockersFor('e8-far-side');
const contractId = 'e8-far-side';
const seed = 'e8-far-side-01';

const sim = new HeadlessContractSim({ contractId, seed });
sim.hero.applyStats(10_000, 1);
sim.hero.heal(10_000);

const rows = [];
let turn = sim.currentTurn();
let offered = false;
let decisions = 0;
let recoveredAt = null;
let firstInZoneAt = null;

// `private readonly hero = new Hero(...)`; TS `private` is compile-time only, so the body is
// reachable here. `Hero.group.position` is the planar truth the sim steps and depenetrates.
const heroPos = () => ({ x: round(sim.hero.group.position.x), z: round(sim.hero.group.position.z) });
const round = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : v);
// The zone the ride walks to, with the engine's own 2.2 slack (ProbeRecovery REACH).
const ZONE = zoneOf('listening-probe-crater', contractId);
const reachDist = (p) => {
  const dx = Math.max(ZONE.minX - p.x, p.x - ZONE.maxX, 0);
  const dz = Math.max(ZONE.minZ - p.z, p.z - ZONE.maxZ, 0);
  return round(Math.hypot(dx, dz));
};

while (!turn.terminal && decisions < maxDecisions) {
  const now = turn.view.now;
  const before = heroPos();
  const row = {
    d: decisions,
    wave: now.wave,
    timeMs: now.timeMs ?? null,
    heroBefore: before,
    reachToZone: reachDist(before),
    recovered: now.probeRecovery?.recovered ?? null,
    refusals: now.probeRecovery?.refusals ? { ...now.probeRecovery.refusals } : null,
    inReach: now.probeRecovery?.inReach ?? null,
    crossing: now.air?.crossing
      ? {
        credited: now.air.crossing.credited,
        creditedThisWindow: now.air.crossing.creditedThisWindow,
        reached: [...(now.air.crossing.reached ?? [])],
        complete: now.air.crossing.complete,
      }
      : null,
    suit: now.air?.suit ? { seconds: round(now.air.suit.seconds ?? now.air.suit.remaining ?? NaN) } : null,
  };
  if (now.pendingSecure) {
    offered = true;
    const r = sim.submitOrders([{ verb: 'SECURE_CHOICE', choice: 'bank' }]);
    row.orders = [{ verb: 'SECURE_CHOICE' }];
    row.accepted = r.outcome.ok;
    row.outcome = r.outcome;
  } else {
    const crossing = now.air?.crossing;
    const orders = [];
    if (now.probeRecovery && !now.probeRecovery.recovered) orders.push({ verb: 'CONTEXT_ACTION', action: 'recover' });
    const target = crossing === undefined
      ? null
      : crossing.creditedThisWindow === 0
        ? crossing.zones.find((id) => !crossing.reached.includes(id)) ?? crossing.zones[crossing.credited % crossing.zones.length]
        : (now.air.domes[0]?.id ?? crossing.zones[0]);
    if (target) orders.push({ verb: 'MOVE_HERO', pos: centreOf(zoneOf(target, contractId)) });
    row.target = target;
    row.targetPos = target ? centreOf(zoneOf(target, contractId)) : null;
    row.orders = orders.map((o) => o.verb);
    if (orders.length) {
      const r = sim.submitOrders(orders);
      row.accepted = r.outcome.ok;
      row.outcome = JSON.parse(JSON.stringify(r.outcome));
    }
  }
  rows.push(row);
  if (row.recovered && recoveredAt === null) recoveredAt = decisions;
  if (row.reachToZone <= 2.2 && firstInZoneAt === null) firstInZoneAt = decisions;
  turn = sim.advanceToTurn();
  decisions += 1;
  row.heroAfter = heroPos();
  row.movedBy = round(Math.hypot(row.heroAfter.x - before.x, row.heroAfter.z - before.z));
}

const final = turn.view.now;
const summary = {
  label,
  blockers: blockers.map((b) => ({ id: b.id, x: b.x, z: b.z, halfX: round(b.halfX), halfZ: round(b.halfZ) })),
  zone: ZONE,
  decisions,
  terminal: turn.terminal,
  offered,
  recoveredAt,
  firstWithin2m2OfZoneAt: firstInZoneAt,
  finalWave: final.wave,
  finalHero: heroPos(),
  finalRecovered: final.probeRecovery?.recovered ?? null,
  finalRefusals: final.probeRecovery?.refusals ?? null,
  finalCrossing: final.air?.crossing ?? null,
  outcome: turn.terminal ? sim.outcome() : null,
  closestApproach: rows.reduce((best, r) => (r.reachToZone < best.reachToZone ? r : best), rows[0]),
  maxZ: rows.reduce((m, r) => Math.max(m, r.heroBefore.z), -Infinity),
};
writeFileSync(new URL(`../${label}.json`, import.meta.url), JSON.stringify({ summary, rows }, null, 2));
console.log(JSON.stringify(summary, null, 2));
await vite.close();
