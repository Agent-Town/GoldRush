#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const args = process.argv.slice(2);
const seed = valueOf('--seed') ?? 'e6-half-life-hollow-01';
const quiet = args.includes('--quiet');
const LAUNCH = { x: 0, z: -47 };
const CAUSEWAY = { x: 0, z: 0 };
const EXTRACTION = { x: 0, z: 48 };
const KEEP = { x: 0, z: 12 };
const PLAN = [
  { what: 'turret', where: { x: 10, z: 12 }, cost: 50 },
  { what: 'sentry_beacon', where: { x: 8.5, z: 15 }, cost: 25 },
  { what: 'turret', where: { x: 10, z: 18 }, cost: 70 },
  { what: 'sentry_beacon', where: { x: 8.5, z: 21 }, cost: 35 },
  { what: 'turret', where: { x: 14, z: 12 }, cost: 95 },
  { what: 'turret', where: { x: 14, z: 18 }, cost: 125 },
  { what: 'sentry_beacon', where: { x: 12, z: 15 }, cost: 45 },
  { what: 'sentry_beacon', where: { x: 12, z: 21 }, cost: 55 },
  { what: 'sentry_beacon', where: { x: 16, z: 15 }, cost: 75 },
  { what: 'sentry_beacon', where: { x: 16, z: 21 }, cost: 95 },
  ...Array.from({ length: 6 }, (_, index) => ({ what: 'palisade', where: { x: 8.5, z: 10.5 + index * 3 }, cost: 10 })),
];
const UPGRADE_PREFERENCE = [
  'pan_legend', 'prospectors_luck', 'field_dressing', 'tinkers_plating', 'beacon_dynamo',
  'heavy_spark', 'double_tap_coil', 'split_spark', 'sharpen', 'long_resonator', 'wide_ring', 'spring_heels', 'assay_bonus',
];
const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

function orders(view, memo) {
  const now = view.now;
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
  const picks = now.pendingOffer?.length
    ? [{ verb: 'PICK_UPGRADE', id: UPGRADE_PREFERENCE.find((id) => now.pendingOffer.some((offer) => offer.id === id)) ?? now.pendingOffer[0].id }]
    : [];
  const standing = now.works.byKind ?? {};
  const crossing = now.hollowCrossing;
  if (crossing && crossing.stage !== 'complete' && (standing.turret ?? 0) >= 2 && (standing.sentry_beacon ?? 0) >= 2) {
    const target = crossing.stage === 'launch' ? LAUNCH : crossing.stage === 'crossing' ? CAUSEWAY : EXTRACTION;
    return [...picks, { verb: 'HOLD', pos: target }];
  }

  const seen = {};
  const step = PLAN.find(({ what }) => (seen[what] = (seen[what] ?? 0) + 1) > (standing[what] ?? 0));
  const seam = now.seams.find(({ active, remaining }) => active && remaining > 0);
  if (!step || now.gold < step.cost) {
    return [...picks,
      ...(now.atomic?.wrangle.active.some(({ state }) => state === 'exhausted') ? [{ verb: 'CAPTURE' }] : []),
      ...(seam ? Array.from({ length: 8 }, () => ({ verb: 'HARVEST', seam: seam.id })) : [{ verb: 'HOLD', pos: KEEP }])];
  }
  const stage = { x: Math.max(8.5, step.where.x - 2), z: step.where.z };
  if (!memo.staged || distance(now.prospector, stage) > 1.5) {
    memo.staged = true;
    return [...picks, { verb: 'HOLD', pos: stage }];
  }
  memo.staged = false;
  return [...picks, { verb: 'BUILD', what: step.what, where: step.where, when: { goldGte: step.cost } }, { verb: 'HOLD', pos: stage }];
}

const child = spawn(process.execPath, ['scripts/gr-sim.mjs', '--contract', 'e6-half-life-hollow', '--seed', seed], { cwd: ROOT, stdio: ['pipe', 'pipe', 'inherit'] });
const memo = {};
let outcome = null;
for await (const line of createInterface({ input: child.stdout, crlfDelay: Infinity })) {
  if (!line.trim()) continue;
  const message = JSON.parse(line);
  if (message.schema !== 'goldrush.view.v1') {
    outcome = message;
    process.stdout.write(`${line}\n`);
    continue;
  }
  if (!quiet) process.stderr.write(`w${message.now.wave} hp=${message.now.hero.hp.toFixed(0)} gold=${message.now.gold} crossing=${message.now.hollowCrossing?.stage ?? '-'} works=${JSON.stringify(message.now.works.byKind)}\n`);
  if (child.stdin.writable && !child.stdin.destroyed) child.stdin.write(`${JSON.stringify(orders(message, memo))}\n`);
}
child.stdin.end();
await new Promise((resolve) => child.on('close', resolve));
if (!outcome?.secured) process.exitCode = 1;

function valueOf(flag) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}
