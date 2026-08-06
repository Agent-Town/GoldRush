// Scratch probe 2 (milk/twin-sockets): re-run the two questions probe 1 answered with a
// DEFECTIVE INSTRUMENT (my hand-built CombatSystem stub, and a snapshot key that does not exist),
// plus the E6 roster question the socket depends on.
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const location = new URL('http://gr-sim.local/');
location.searchParams.set('debug', '');
location.searchParams.set('contract', 'the-claim');
globalThis.location = location;
globalThis.window = { location };

const originalConsole = { log: console.log, info: console.info, debug: console.debug };
console.log = console.info = console.debug = () => undefined;

const root = fileURLToPath(new URL('../..', import.meta.url));
const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });

const report = [];
const probe = async (label, body) => {
  try {
    report.push([label, 'OK', await body()]);
  } catch (error) {
    report.push([label, 'THROW', String(error?.stack ?? error).split('\n').slice(0, 3).join(' | ')]);
  }
};

try {
  const THREE = await vite.ssrLoadModule('three');
  const { loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
  const { createDeepwaterClaimTile } = await vite.ssrLoadModule('/src/world/DeepwaterClaimTile.ts');
  const { DeepwaterArsenal } = await vite.ssrLoadModule('/src/entities/DeepwaterArsenal.ts');
  const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');

  const claim = loadContract('e5-deepwater-claim');
  const tile = createDeepwaterClaimTile(claim);

  await probe('E5 authored boat anchors + pads (contract data)', () => {
    const boat = claim.tileParams.deepwater.claimBoat;
    return `anchors=${JSON.stringify(boat.anchors)} pads=${JSON.stringify(boat.pads.map((p) => p.id))}`;
  });
  await probe('E5 reanchor is a real lever', () => {
    const before = tile.snapshot().boat.anchor.id;
    const anchors = claim.tileParams.deepwater.claimBoat.anchors;
    const other = anchors.find((a) => a.id !== before);
    const moved = other ? tile.reanchor(other.id) : false;
    const rejectSame = tile.reanchor(tile.snapshot().boat.anchor.id);
    return `from=${before} to=${tile.snapshot().boat.anchor.id} moved=${moved} rejectsSameAnchor=${rejectSame === false}`;
  });
  await probe('E5 placeBoatBuilding is a real lever', () => {
    const padId = claim.tileParams.deepwater.claimBoat.pads[0].id;
    const first = tile.placeBoatBuilding(padId, 'turret');
    const dupe = tile.placeBoatBuilding(padId, 'sentry_beacon');
    return `place=${first} rejectsOccupiedPad=${dupe === false} buildings=${JSON.stringify(tile.snapshot().boat.buildings)}`;
  });
  await probe('E5 water sample depth classes', () => {
    const params = claim.tileParams.deepwater.waterTile;
    return `regions=${JSON.stringify(params.regions?.map((r) => `${r.id}:${r.depthClass ?? '?'}`) ?? params)}`.slice(0, 300);
  });

  // The instrument defect from probe 1: build the arsenal against a REAL CombatSystem,
  // the one HeadlessContractSim already constructs successfully.
  await probe('E5 DeepwaterArsenal against the real headless CombatSystem', () => {
    const sim = new HeadlessContractSim({ contractId: 'the-claim', seed: 'probe-01' });
    const arsenal = new DeepwaterArsenal(
      sim.combat,
      () => new THREE.Vector3(),
      () => tile.snapshot().boat.buildings,
      () => true,
      () => true,
      () => false,
      () => false,
    );
    for (let step = 0; step < 300; step += 1) arsenal.update(step / 30);
    const d = arsenal.diagnostics;
    return `active=${d.active} items=${JSON.stringify(d.items)} munition=${JSON.stringify(d.sharedMunition)}`;
  });

  // E6: does the authored roster actually name the machine variants WrangleSystem acts on?
  await probe('E6 rosters vs WrangleSystem MACHINE_VARIANTS', async () => {
    const rows = [];
    for (const id of ['e6-glow-mesa', 'e6-showroom', 'e6-half-life-hollow', 'e6-picnic']) {
      const roster = loadContract(id).twist.enemyRoster ?? [];
      rows.push(`${id}=[${roster.map((e) => e.id).join(',')}]`);
    }
    return rows.join(' ');
  });
  await probe('E6 secureWave / baron per contract', () => {
    return ['e6-glow-mesa', 'e6-showroom', 'e6-half-life-hollow', 'e6-picnic'].map((id) => {
      const t = loadContract(id).twist;
      return `${id}: secureWave=${t.secureWave ?? 'default'} baron=${t.baron?.variantId ?? 'none'}`;
    }).join(' | ');
  });
  await probe('E5 claim: secureWave / baron / stake markers', () => {
    const t = claim.twist;
    return `secureWave=${t.secureWave} baron=${t.baron?.variantId}@wave${t.baron?.wave} stakes=${JSON.stringify((claim.tileParams.stakeMarkers ?? []).map((s) => `${s.id}:${s.heroStart ? 'start' : '-'}`))} harvestAnchors=${(claim.tileParams.harvestAnchors ?? []).length}`;
  });
} finally {
  await vite.close();
  Object.assign(console, originalConsole);
}

for (const [label, status, detail] of report) {
  process.stdout.write(`${status === 'OK' ? '  OK  ' : ' THROW'} | ${label}\n         ${detail}\n`);
}
