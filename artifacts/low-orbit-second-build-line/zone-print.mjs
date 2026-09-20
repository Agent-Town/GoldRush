/**
 * THE ZONE PRINT — what Low Orbit's authored ground actually is, measured rather than read off a
 * review. Scope item 1 of `tasks/low-orbit-second-build-line.md`.
 *
 *   /opt/homebrew/bin/node artifacts/low-orbit-second-build-line/zone-print.mjs [--contract e8-low-orbit]
 *
 * It prints, from the contract bytes and from the ENGINE's own two predicates
 * (`Terrain.isBuildable`, `Terrain.sample().walkable`, the pair `HeadlessContractSim` binds at
 * `src/sim/HeadlessContractSim.ts:1384` and `:1394`):
 *
 *   · every authored rectangle (build zones, scaffold decks, debris fields) with its bounds;
 *   · the hero's start and the prover's post, and which rectangle each is inside;
 *   · the crossing rectangles the air system derives, and the `enter` point the prover aims at;
 *   · a buildable/walkable raster of the spine corridor, so "a turret can stand here" is a
 *     measurement rather than an assumption;
 *   · every site of the prover's fort with a buildable verdict.
 *
 * Nothing here writes to the tree; it is a print.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const args = process.argv.slice(2);
const contractId = args.includes('--contract') ? args[args.indexOf('--contract') + 1] : 'e8-low-orbit';
const seed = args.includes('--seed') ? args[args.indexOf('--seed') + 1] : `${contractId}-01`;

const bundle = JSON.parse(readFileSync(new URL('../../assets/contracts/epoch-8-orbital/contracts.json', import.meta.url), 'utf8'));
const contract = bundle.contracts.find((entry) => entry.id === contractId);
const tile = contract.tileParams;

const location = new URL(`http://gr-sim.local/?debug&contract=${contractId}&seed=${seed}`);
globalThis.location = location;
globalThis.window = { location };
const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
const Terrain = await vite.ssrLoadModule('/src/world/Terrain.ts');
const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');
const { E8SuitAirSystem } = await vite.ssrLoadModule('/src/systems/E8SuitAirSystem.ts');

const rect = (zone) => `${String(zone.minX).padStart(4)}..${String(zone.maxX).padStart(4)} x ${String(zone.minZ).padStart(4)}..${String(zone.maxZ).padStart(4)}`;
const inside = (zone, p) => p.x >= zone.minX && p.x <= zone.maxX && p.z >= zone.minZ && p.z <= zone.maxZ;
const heroRadius = Balance.hero.radius;
const walkable = (x, z) => x >= Terrain.bounds.minX + heroRadius && x <= Terrain.bounds.maxX - heroRadius
  && z >= Terrain.bounds.minZ + heroRadius && z <= Terrain.bounds.maxZ - heroRadius
  && Terrain.sample(x, z).walkable;

const lines = [];
const say = (text = '') => lines.push(text);

say(`# ZONE PRINT ${contractId} (seed ${seed}) — measured on this tree`);
say(`terrain bounds ${rect(Terrain.bounds)}   hero radius ${heroRadius}`);
say('');
say('## build zones (tileParams.buildZones) — the only ground BUILD accepts (Terrain.isBuildable, src/world/Terrain.ts:238)');
for (const zone of tile.buildZones ?? []) {
  say(`  ${zone.id.padEnd(28)} bank=${String(zone.bank).padEnd(6)} ${rect(zone)}  (${zone.maxX - zone.minX} x ${zone.maxZ - zone.minZ})`);
}
say('');
say('## orbital scaffold zones (tileParams.orbitalScaffoldZones) — the crossing candidates');
for (const zone of tile.orbitalScaffoldZones ?? []) say(`  ${zone.id.padEnd(28)} ${rect(zone)}`);
say('');
say('## debris fields');
for (const zone of tile.debrisFields ?? []) say(`  ${zone.id.padEnd(28)} ${rect(zone)}`);
say('');
say('## handhold routes');
for (const route of tile.handholdRoutes ?? []) say(`  ${route.id.padEnd(28)} ${route.points.map((p) => `(${p.x},${p.z})`).join(' -> ')}`);
say('');
say('## harvest anchors');
for (const anchor of tile.harvestAnchors ?? []) {
  const zone = (tile.buildZones ?? []).find((entry) => inside(entry, anchor));
  say(`  (${String(anchor.x).padStart(4)}, ${String(anchor.z).padStart(4)})  in ${zone?.id ?? 'NO BUILD ZONE'}`);
}
say('');

const stake = (tile.stakeMarkers ?? []).find((marker) => marker.heroStart) ?? null;
const heroStart = { x: stake?.x ?? 0, z: stake?.z ?? 12 };
say('## the hero');
say(`  start (HeadlessContractSim.ts:1007-1008, stakeMarkers ${JSON.stringify(tile.stakeMarkers ?? [])}) = (${heroStart.x}, ${heroStart.z})`);
say(`  start is inside: ${(tile.buildZones ?? []).filter((zone) => inside(zone, heroStart)).map(({ id }) => id).join(', ') || 'NO ZONE'}`);
say(`  start walkable=${walkable(heroStart.x, heroStart.z)} buildable=${Terrain.isBuildable(heroStart.x, heroStart.z)}`);
say('');

const air = E8SuitAirSystem.create(contract);
const diag = air.diagnostics ?? {};
say('## the air system (E8SuitAirSystem.create, src/systems/E8SuitAirSystem.ts:265)');
say(`  pressurisedZoneIds (authored) = ${JSON.stringify(contract.twist.atmosphere?.pressurisedZoneIds ?? null)}`);
say(`  shelters  = ${JSON.stringify((diag.shelters ?? []).map((s) => s.id ?? s))}`);
say(`  crossings = ${JSON.stringify((diag.crossings ?? []).map((c) => c.id ?? c))}`);
say(`  suit ${contract.twist.atmosphere?.suitSeconds}s, harm ${contract.twist.atmosphere?.harmPerSecond}/s, required ${contract.twist.atmosphere?.crossingRequired} in windows of ${contract.twist.atmosphere?.crossingWindowWaves} waves`);
say('');

say('## buildable raster — rows are z, columns are x; # buildable, . walkable-not-buildable, space unwalkable');
const xs = [];
for (let x = -50; x <= 50; x += 2) xs.push(x);
say(`      ${xs.map((x) => (x % 10 === 0 ? String(Math.abs(x) / 10 % 10) : ' ')).join('')}   (x tens digit; step 2 from -50 to 50)`);
for (let z = 34; z >= -34; z -= 2) {
  let row = '';
  for (const x of xs) {
    row += Terrain.isBuildable(x, z) ? '#' : (walkable(x, z) ? '.' : ' ');
  }
  say(`z=${String(z).padStart(4)} ${row}`);
}
say('');

// The prover's own fort and the two crossing entries it aims at.
const DEFENCE = [
  { what: 'turret', where: { x: -12, z: 4 } },
  { what: 'turret', where: { x: 12, z: 4 } },
  { what: 'turret', where: { x: -14, z: 12 } },
  { what: 'turret', where: { x: 14, z: 12 } },
  { what: 'sentry_beacon', where: { x: -5, z: 14 } },
  { what: 'sentry_beacon', where: { x: 5, z: 14 } },
  { what: 'sentry_beacon', where: { x: -5, z: 8 } },
  { what: 'sentry_beacon', where: { x: 5, z: 8 } },
  { what: 'sentry_beacon', where: { x: -7, z: 12 } },
  { what: 'sentry_beacon', where: { x: 7, z: 12 } },
];
say('## the prover fort (artifacts/e8-air-logical/prover.mjs:235-246) against the authored ground');
for (const site of DEFENCE) {
  const zone = (tile.buildZones ?? []).find((entry) => inside(entry, site.where));
  say(`  ${site.what.padEnd(14)} (${String(site.where.x).padStart(4)}, ${String(site.where.z).padStart(4)})  buildable=${String(Terrain.isBuildable(site.where.x, site.where.z)).padEnd(5)} zone=${zone?.id ?? 'NONE'}`);
}
say('');
say('## reach — turret range and beacon range against the hero post and the crossing entries');
say(`  Balance.turret.range=${Balance.turret.range} maxCount=${Balance.turret.maxCount}; Balance.beacon.range=${Balance.beacon.range} maxCount=${Balance.beacon.maxCount} gridSnap=${Balance.beacon.gridSnap} overlapRadius=${Balance.beacon.overlapRadius}`);
const post = { x: 0, z: 10 };
const entries = { 'west-scaffold-deck': { x: -28, z: 0 }, 'east-scaffold-deck': { x: 28, z: 0 } };
const away = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
for (const [id, enter] of Object.entries(entries)) {
  say(`  ${id}: enter (${enter.x}, ${enter.z}) is ${away(post, enter).toFixed(1)} wu from the post (0, 10); walkable=${walkable(enter.x, enter.z)}`);
  const covering = DEFENCE.filter((site) => away(site.where, enter) <= (site.what === 'turret' ? Balance.turret.range : Balance.beacon.range));
  say(`     covered by ${covering.length} of the fort's ten works`);
  const nearestBuild = (tile.buildZones ?? [])
    .map((zone) => ({ id: zone.id, d: Math.hypot(Math.max(zone.minX - enter.x, 0, enter.x - zone.maxX), Math.max(zone.minZ - enter.z, 0, enter.z - zone.maxZ)) }))
    .sort((a, b) => a.d - b.d);
  say(`     nearest build zone: ${nearestBuild.map((entry) => `${entry.id} ${entry.d.toFixed(1)}wu`).join(' | ')}`);
}
say('');
say('## the sortie leg — every 2 wu along z=0 from the post to the west entry');
for (let x = 0; x >= -30; x -= 2) {
  const zone = (tile.buildZones ?? []).find((entry) => inside(entry, { x, z: 0 }));
  const guns = DEFENCE.filter((site) => away(site.where, { x, z: 0 }) <= (site.what === 'turret' ? Balance.turret.range : Balance.beacon.range)).length;
  say(`  (${String(x).padStart(4)},   0) walkable=${String(walkable(x, 0)).padEnd(5)} buildable=${String(Terrain.isBuildable(x, 0)).padEnd(5)} zone=${(zone?.id ?? '-').padEnd(20)} works in range=${guns}`);
}

await vite.close();
process.stdout.write(`${lines.join('\n')}\n`);
