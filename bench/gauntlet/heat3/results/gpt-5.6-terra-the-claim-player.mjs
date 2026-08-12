import { spawn } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline';

const runNumber = Number(process.env.GAUNTLET_RUN ?? 1);
const sim = spawn('node', ['scripts/gr-sim.mjs', '--contract', 'the-claim', '--seed', 'e1-the-claim-02'], {
  stdio: ['pipe', 'pipe', 'inherit'],
});

let base = { x: 0, z: 0 };
let calls = 0;
let printedInitial = false;
let mechanics = {};

const buildPlan = [
  { what: 'sentry_beacon', where: { x: -3, z: 11 } },
  { what: 'sentry_beacon', where: { x: 3, z: 11 } },
  { what: 'turret', where: { x: -3, z: 14 } },
  { what: 'turret', where: { x: 3, z: 14 } },
  { what: 'turret', where: { x: 0, z: 8 } },
];

function point(value) {
  if (!value || !Number.isFinite(value.x) || !Number.isFinite(value.z)) return null;
  return { x: value.x, z: value.z };
}

function priceFor(what, count) {
  const buildable = mechanics.buildables?.find((entry) => entry.id === what);
  const prices = buildable?.costs ?? [buildable?.cost ?? Infinity];
  return prices[Math.min(count, prices.length - 1)] ?? Infinity;
}

function ordersFor(view) {
  const now = view.now ?? {};
  mechanics = view.stablePrefix?.mechanics ?? mechanics;
  const rider = point(now.prospector) ?? point(now.prospector?.pos) ?? point(now.prospector?.position) ?? point(now.hero) ?? point(now.hero?.pos) ?? point(now.hero?.position);
  if (rider) base = rider;
  if (now.pendingOffer?.length) return [{ verb: 'PICK_UPGRADE', id: now.pendingOffer[0].id }];
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
  const seam = now.seams?.find((entry) => entry.remaining > 0) ?? now.activeSeams?.find((entry) => entry.remaining > 0);
  const nextBuild = buildPlan.find((entry, index) => {
    const { what } = entry;
    const count = Number(now.works?.byKind?.[what] ?? 0);
    const ordinal = buildPlan.slice(0, index).filter((previous) => previous.what === what).length;
    return count === ordinal && now.gold >= priceFor(what, count);
  });
  const orders = [
    { verb: 'SET_WEAPON', weapon: 'rig' },
    ...(nextBuild ? [{ verb: 'MOVE_TO', pos: base }, { verb: 'BUILD', what: nextBuild.what, where: nextBuild.where, when: { goldGte: 0 } }] : []),
    ...(seam ? Array.from({ length: 6 }, () => ({ verb: 'HARVEST', seam: seam.id })) : []),
    { verb: 'MOVE_TO', pos: base },
    ...(now.works?.hp > 0 && now.works.hp < now.works.maxHp ? [{ verb: 'REPAIR_UNDER', pct: 100 }] : []),
    { verb: 'HOLD', pos: base },
  ];
  return orders;
}

function better(next, previous) {
  if (!previous) return true;
  if (next.secured !== previous.secured) return next.secured;
  if ((next.waves ?? 0) !== (previous.waves ?? 0)) return (next.waves ?? 0) > (previous.waves ?? 0);
  return (next.kills ?? 0) > (previous.kills ?? 0);
}

function saveOutcome(outcome) {
  const previous = existsSync('outcome.json') ? JSON.parse(readFileSync('outcome.json', 'utf8')) : null;
  const candidate = { ...outcome, bestRun: runNumber, runsSoFar: runNumber };
  const best = better(candidate, previous) ? candidate : { ...previous, runsSoFar: runNumber };
  writeFileSync('outcome.json', `${JSON.stringify(best, null, 2)}\n`);
}

createInterface({ input: sim.stdout }).on('line', (line) => {
  const message = JSON.parse(line);
  if (message.schema === 'goldrush.view.v1') {
    if (!printedInitial) {
      printedInitial = true;
      console.log(JSON.stringify({ initial: { stablePrefix: message.stablePrefix, now: message.now } }, null, 2));
    }
    if (process.env.GAUNTLET_TRACE) {
      console.error(JSON.stringify({ wave: message.now?.wave, gold: message.now?.gold, works: message.now?.works, threats: message.now?.threats, needsRider: message.now?.needsRider, pendingOffer: message.now?.pendingOffer }));
    }
    calls += 1;
    sim.stdin.write(`${JSON.stringify(ordersFor(message))}\n`);
    return;
  }
  saveOutcome(message);
  console.log(JSON.stringify({ outcome: message, calls }));
});

sim.on('close', (code) => {
  if (code !== 0) process.exitCode = code;
});
