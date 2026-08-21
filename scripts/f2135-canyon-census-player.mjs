import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const PYLONS = [
  { x: -12, z: -36 }, { x: 12, z: -36 },
  { x: -24, z: -20 }, { x: 24, z: -20 },
  { x: 28, z: 8 }, { x: -28, z: 8 },
];
const COSTS = [25, 35, 45, 55, 75, 95];
const output = resolve(process.env.F2135_CENSUS_FILE ?? 'artifacts/f2135-canyon-census/census.json');
const runId = process.env.F2135_CENSUS_RUN ?? 'run-1';
let turnNumber = 0;
let rows = [];

export default async function censusOrders(view) {
  const connect = view.canyonConnect ?? view.now.canyonConnect;
  if (!connect) throw new Error('Canyon connect diagnostics were absent from THE VIEW.');
  rows.push({
    wave: view.now.wave,
    powered: connect.powered,
    required: connect.required,
    complete: connect.complete,
    failed: connect.failed,
  });
  await persist();

  const now = view.now;
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const built = now.works.byKind.sentry_beacon ?? 0;
  if (built < PYLONS.length) {
    const sites = built === 4
      ? [...PYLONS.slice(0, 4), ...PYLONS.slice(4).sort((a, b) => distance(now.prospector, a) - distance(now.prospector, b))]
      : PYLONS;
    const pairEnd = Math.min(PYLONS.length, built < 4 ? (built % 2 === 0 ? built + 2 : built + 1) : built + 1);
    const pairCost = COSTS.slice(built, pairEnd).reduce((sum, cost) => sum + cost, 0);
    if (now.gold >= pairCost) {
      return [
        ...sites.slice(built, pairEnd).flatMap((pos, index) => [
          { verb: 'MOVE_TO', pos },
          { verb: 'BUILD', what: 'sentry_beacon', where: pos, when: { goldGte: COSTS[built + index] } },
        ]),
        nextTurn(),
      ];
    }
    return harvestOrPoll(view, sites[built]);
  }
  return [{ verb: 'HOLD', pos: { x: 0, z: -44 } }];
}

censusOrders.reset = () => { turnNumber = 0; rows = []; };

async function persist() {
  let artifact = {
    schema: 'goldrush.f2135.canyon-census.v1',
    contractId: 'e3-canyon-works',
    runs: [],
    comparison: { comparedRunIds: [], identical: null },
  };
  try {
    artifact = JSON.parse(await readFile(output, 'utf8'));
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
  artifact.runs = [...artifact.runs.filter((run) => run.id !== runId), { id: runId, rows }];
  if (artifact.runs.length === 2) {
    artifact.comparison = {
      comparedRunIds: artifact.runs.map((run) => run.id),
      identical: JSON.stringify(artifact.runs[0].rows) === JSON.stringify(artifact.runs[1].rows),
    };
  }
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(artifact, null, 2)}\n`);
}

function harvestOrPoll(view, destination) {
  const seam = [...view.now.seams]
    .filter(({ active, remaining }) => active && remaining > 0)
    .sort((a, b) => b.id.localeCompare(a.id))[0];
  if (seam) {
    return [
      ...Array.from({ length: Math.ceil(seam.remaining / 5) }, () => ({ verb: 'HARVEST', seam: seam.id })),
      nextTurn(),
    ];
  }

  const here = view.now.prospector ?? destination;
  const pos = distance(here, destination) < 0.2
    ? { x: here.x + (Math.floor(view.now.timers.runSeconds * 5) % 2 ? -1 : 1), z: here.z }
    : destination;
  return [{ verb: 'MOVE_TO', pos }, nextTurn()];
}

function nextTurn() {
  return { verb: 'HARVEST', seam: `__turn-${++turnNumber}` };
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}
