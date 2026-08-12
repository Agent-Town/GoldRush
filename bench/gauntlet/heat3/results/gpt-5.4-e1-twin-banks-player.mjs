import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';

const DEFAULT_CONTRACT = 'e1-twin-banks';
const DEFAULT_SEED = 'e1-twin-banks-01';
const HARVEST_VALUE = 5;

const UPGRADE_PREFERENCE = [
  'split_spark',
  'heavy_spark',
  'double_tap_coil',
  'chain_spark_arc',
  'long_resonator',
  'quick_fuse',
  'tinkers_plating',
  'field_dressing',
  'spring_heels',
  'beacon_dynamo',
  'beacon_handoff',
  'sharpen',
  'powder_charge',
  'wide_ring',
  'prospectors_luck',
  'rich_seam_pact',
  'pan_legend',
  'auto_pan',
  'assay_bonus',
];

const BUILD_PLAN = [
  { what: 'turret', where: { x: -7, z: -8 }, seam: 'gold-seam-3', stand: { x: -1.5, z: -6.4 } },
  { what: 'turret', where: { x: -8, z: 8 }, seam: 'gold-seam-2', stand: { x: -9, z: 6.7 } },
  { what: 'turret', where: { x: 13, z: -8 }, seam: 'gold-seam-5', stand: { x: 18, z: -7 } },
  { what: 'turret', where: { x: 8, z: 8 }, seam: 'gold-seam-4', stand: { x: 7.5, z: 6.5 } },
  { what: 'sentry_beacon', where: { x: 3, z: -8 }, seam: 'gold-seam-3', stand: { x: -1.5, z: -6.4 } },
  { what: 'palisade', where: { x: -18, z: -8 }, seam: 'gold-seam-1', stand: { x: -22, z: -6.8 } },
  { what: 'palisade', where: { x: -4, z: -8 }, seam: 'gold-seam-3', stand: { x: -1.5, z: -6.4 } },
  { what: 'palisade', where: { x: 18, z: -8 }, seam: 'gold-seam-5', stand: { x: 18, z: -7 } },
  { what: 'palisade', where: { x: 0, z: -12 }, seam: 'gold-seam-3', stand: { x: -1.5, z: -6.4 } },
  { what: 'palisade', where: { x: 20, z: -12 }, seam: 'gold-seam-5', stand: { x: 18, z: -7 } },
  { what: 'palisade', where: { x: -20, z: -12 }, seam: 'gold-seam-1', stand: { x: -22, z: -6.8 } },
  { what: 'palisade', where: { x: 2, z: -8 }, seam: 'gold-seam-3', stand: { x: -1.5, z: -6.4 } },
];

function byKind(view, kind) {
  return view.now?.works?.byKind?.[kind] ?? 0;
}

function builtCount(view, what) {
  return byKind(view, what);
}

function positionOf(view, id) {
  return view.stablePrefix?.map?.seams?.find((seam) => seam.id === id) ?? null;
}

function distance(a, b) {
  const dx = (a?.x ?? 0) - (b?.x ?? 0);
  const dz = (a?.z ?? 0) - (b?.z ?? 0);
  return Math.hypot(dx, dz);
}

function buildCost(view, what, index) {
  const buildable = view.stablePrefix?.mechanics?.buildables?.find((entry) => entry.id === what);
  if (!buildable) return 999999;
  const costs = Array.isArray(buildable.costs) && buildable.costs.length > 0 ? buildable.costs : [buildable.cost ?? 0];
  return costs[Math.min(index, costs.length - 1)] ?? (buildable.cost ?? 0);
}

function nextPlanStep(view) {
  const consumedByKind = new Map();
  for (const step of BUILD_PLAN) {
    const seen = consumedByKind.get(step.what) ?? 0;
    if (builtCount(view, step.what) <= seen) return { ...step, cost: buildCost(view, step.what, builtCount(view, step.what)) };
    consumedByKind.set(step.what, seen + 1);
  }
  return null;
}

function activeSeams(view) {
  const live = new Map((view.now?.seams ?? []).filter((seam) => seam.active && seam.remaining > 0).map((seam) => [seam.id, seam]));
  return (view.stablePrefix?.map?.seams ?? [])
    .map((seam) => ({ ...seam, remaining: live.get(seam.id)?.remaining ?? 0, active: live.has(seam.id) }))
    .filter((seam) => seam.active);
}

function bestHarvestSeam(view, preferredId) {
  const live = activeSeams(view);
  if (live.length === 0) return null;
  const preferred = preferredId ? live.find((seam) => seam.id === preferredId) : null;
  if (preferred) return preferred;
  const prospector = view.now?.prospector ?? view.stablePrefix?.map?.claim ?? { x: 0, z: 0 };
  return live
    .slice()
    .sort((a, b) => distance(a, prospector) - distance(b, prospector) || b.remaining - a.remaining)[0];
}

function pickUpgrade(view) {
  const offer = view.now?.pendingOffer;
  if (!Array.isArray(offer) || offer.length === 0) return null;
  const ranked = offer
    .map((choice, index) => ({
      choice,
      index,
      rank: UPGRADE_PREFERENCE.indexOf(choice.id),
    }))
    .sort((a, b) => (a.rank === -1 ? 999 : a.rank) - (b.rank === -1 ? 999 : b.rank) || a.index - b.index);
  return { verb: 'PICK_UPGRADE', id: ranked[0].choice.id };
}

function harvestBurstCount(goldNeeded) {
  return Math.max(1, Math.ceil(Math.max(0, goldNeeded) / HARVEST_VALUE));
}

function harvestPlan(view, goldNeeded, preferredIds = []) {
  const live = activeSeams(view);
  const preferred = preferredIds
    .map((id) => live.find((seam) => seam.id === id))
    .filter(Boolean);
  const seen = new Set(preferred.map((seam) => seam.id));
  const prospector = view.now?.prospector ?? view.stablePrefix?.map?.claim ?? { x: 0, z: 0 };
  const ordered = [
    ...preferred,
    ...live
      .filter((seam) => !seen.has(seam.id))
      .sort((a, b) => b.remaining - a.remaining || distance(a, prospector) - distance(b, prospector)),
  ];
  const plan = [];
  let need = Math.max(0, goldNeeded);
  for (const seam of ordered) {
    if (need <= 0) break;
    const count = Math.min(Math.floor(seam.remaining / HARVEST_VALUE), harvestBurstCount(need));
    if (count <= 0) continue;
    plan.push({ seam, count });
    need -= count * HARVEST_VALUE;
  }
  return plan;
}

function ordersForBuild(view, step) {
  const orders = [];
  const gold = view.now?.gold ?? 0;
  const stand = step.stand ?? positionOf(view, step.seam);
  const prospector = view.now?.prospector ?? view.stablePrefix?.map?.claim ?? stand;
  const funding = harvestPlan(view, step.cost - gold, [step.seam]);
  for (const segment of funding) {
    for (let i = 0; i < segment.count; i += 1) {
      orders.push({ verb: 'HARVEST', seam: segment.seam.id });
    }
  }
  const willNeedMoveBack = orders.length > 0 || (stand && distance(prospector, stand) > 1.2);
  if (willNeedMoveBack && stand) orders.push({ verb: 'MOVE_TO', pos: stand });
  orders.push({ verb: 'BUILD', what: step.what, where: step.where, when: { goldGte: step.cost } });
  if (stand) orders.push({ verb: 'HOLD', pos: { x: stand.x, z: stand.z } });
  return orders;
}

function sustainOrders(view) {
  const seam = bestHarvestSeam(view, null);
  if (!seam) return [];
  const orders = [];
  const prospector = view.now?.prospector ?? view.stablePrefix?.map?.claim ?? seam;
  if (distance(prospector, seam) > 1.2) orders.push({ verb: 'MOVE_TO', pos: { x: seam.x, z: seam.z } });
  for (let i = 0; i < 8; i += 1) orders.push({ verb: 'HARVEST', seam: seam.id });
  orders.push({ verb: 'REPAIR_UNDER', pct: 60 });
  orders.push({ verb: 'HOLD', pos: { x: seam.x, z: seam.z } });
  return orders;
}

function chooseOrders(view) {
  const upgrade = pickUpgrade(view);
  if (upgrade) return [upgrade];
  if (view.now?.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
  const step = nextPlanStep(view);
  if (step) return ordersForBuild(view, step).slice(0, 32);
  return sustainOrders(view).slice(0, 32);
}

function makePolicy() {
  return {
    next(view) {
      return chooseOrders(view);
    },
  };
}

async function runPolicy({ input, output }) {
  const rl = createInterface({ input, crlfDelay: Infinity });
  const policy = makePolicy();
  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const message = JSON.parse(trimmed);
    if (message?.schema === 'goldrush.view.v1') {
      output.write(`${JSON.stringify(policy.next(message))}\n`);
      continue;
    }
    output.write(`${trimmed}\n`);
  }
}

async function runSimulator(contract = DEFAULT_CONTRACT, seed = DEFAULT_SEED) {
  const sim = spawn(process.execPath, ['scripts/gr-sim.mjs', '--contract', contract, '--seed', seed], {
    cwd: process.cwd(),
    stdio: ['pipe', 'pipe', 'inherit'],
  });
  const rl = createInterface({ input: sim.stdout, crlfDelay: Infinity });
  const policy = makePolicy();
  let outcome = null;
  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const message = JSON.parse(trimmed);
    if (message?.schema === 'goldrush.view.v1') {
      sim.stdin.write(`${JSON.stringify(policy.next(message))}\n`);
      continue;
    }
    outcome = message;
  }
  await new Promise((resolve, reject) => {
    sim.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`gr-sim exited ${code}`));
    });
    sim.on('error', reject);
  });
  return outcome;
}

function selfCheck() {
  const fakeView = {
    stablePrefix: {
      map: {
        claim: { x: 0, z: -12 },
        seams: [
          { id: 'gold-seam-2', x: -9, z: 6.7 },
          { id: 'gold-seam-3', x: -1.5, z: -6.4 },
        ],
      },
      mechanics: {
        buildables: [
          { id: 'turret', costs: [50, 70, 95, 125] },
          { id: 'sentry_beacon', costs: [25, 35, 45, 55] },
        ],
      },
    },
    now: {
      gold: 0,
      prospector: { x: -1.8, z: -13.07 },
      works: { byKind: {} },
      seams: [
        { id: 'gold-seam-2', active: true, remaining: 30 },
        { id: 'gold-seam-3', active: true, remaining: 30 },
      ],
    },
  };
  const orders = chooseOrders(fakeView);
  if (!Array.isArray(orders) || orders.length === 0) throw new Error('no orders');
  if (orders.at(-1)?.verb !== 'HOLD') throw new Error('expected hold tail');
}

export { chooseOrders, makePolicy, runSimulator };

if (import.meta.url === `file://${process.argv[1]}`) {
  const mode = process.argv[2];
  if (mode === '--self-check') {
    selfCheck();
  } else if (mode === '--run') {
    const contract = process.argv[3] || DEFAULT_CONTRACT;
    const seed = process.argv[4] || DEFAULT_SEED;
    const outcome = await runSimulator(contract, seed);
    process.stdout.write(`${JSON.stringify(outcome)}\n`);
  } else {
    await runPolicy({ input: process.stdin, output: process.stdout });
  }
}
