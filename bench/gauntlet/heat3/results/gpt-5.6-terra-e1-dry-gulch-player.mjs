import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import readline from 'node:readline';

const BUILD_PLAN = [
  ['sentry_beacon', 0, -4, 8],
  ['turret', 0, 7, 7],
  ['turret', 0, 2, -7],
  ['sentry_beacon', 0, 4, 8],
  ['turret', 0, -7, -7],
  ['sentry_beacon', 0, -5, -7],
  ['turret', 0, 0, 7],
  ['sentry_beacon', 0, 5, -7],
  ['sentry_beacon', 0, -12, 7],
  ['sentry_beacon', 0, 11, 7],
];

const orderFor = (view) => {
  const { now = {} } = view;
  if (now.pendingOffer?.length) return [{ verb: 'PICK_UPGRADE', id: now.pendingOffer[0].id }];
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
  const claim = view.stablePrefix?.map?.claim ?? { x: 0, z: 12 };
  const built = now.works?.byKind ?? {};
  const buildables = view.stablePrefix?.mechanics?.buildables ?? [];
  const plannedCounts = {};
  const next = BUILD_PLAN.find(([what, wave]) => {
    plannedCounts[what] = (plannedCounts[what] ?? 0) + 1;
    return wave <= now.wave && (built[what] ?? 0) < plannedCounts[what];
  });
  const [what, , x, z] = next ?? [];
  const price = buildables.find((item) => item.id === what)?.costs?.[built[what] ?? 0];
  if (next && now.gold >= price) return [
    { verb: 'REPAIR_UNDER', pct: 80 },
    { verb: 'MOVE_TO', pos: { x, z } },
    { verb: 'BUILD', what, where: { x, z }, when: { goldGte: 0 } },
    { verb: 'HOLD', pos: claim },
  ];
  const seam = now.seams?.find((item) => item.active && item.remaining >= 5);
  if (seam) return [
    { verb: 'REPAIR_UNDER', pct: 80 },
    ...Array.from({ length: Math.floor(seam.remaining / 5) }, () => ({ verb: 'HARVEST', seam: seam.id })),
    { verb: 'HOLD', pos: claim },
  ];
  return [{ verb: 'REPAIR_UNDER', pct: 80 }, { verb: 'HOLD', pos: claim }];
};

if (process.argv[2] === '--self-check') {
  assert.deepEqual(orderFor({ now: { pendingSecure: {} } }), [{ verb: 'SECURE_CHOICE', choice: 'bank' }]);
  assert.ok(orderFor({ now: { seams: [{ id: 'wash', active: true, remaining: 5 }] } }).some(({ verb }) => verb === 'HARVEST'));
  process.exit(0);
}

const sim = spawn(process.execPath, [
  'scripts/gr-sim.mjs', '--contract', 'e1-dry-gulch', '--seed', 'e1-dry-gulch-01',
], { stdio: ['pipe', 'pipe', 'pipe'] });

sim.stderr.pipe(process.stderr);
readline.createInterface({ input: sim.stdout }).on('line', (line) => {
  const message = JSON.parse(line);
  if (message.schema === 'goldrush.view.v1') {
    sim.stdin.write(`${JSON.stringify(orderFor(message))}\n`);
  }
  else process.stdout.write(`${JSON.stringify(message)}\n`);
});

sim.on('error', (error) => {
  console.error(error);
  process.exitCode = 1;
});
