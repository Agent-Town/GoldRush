#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { writeFileSync } from 'node:fs';

const CONTRACT = 'the-claim';
const SEED = 'e1-the-claim-02';

const BUILD_STEPS = [
  { key: 'beacon-center', what: 'sentry_beacon', cost: 25, where: { x: 0, z: 9 } },
  { key: 'turret-west', what: 'turret', cost: 50, where: { x: -2, z: 9 } },
  { key: 'beacon-east', what: 'sentry_beacon', cost: 35, where: { x: 2, z: 9 } },
  { key: 'turret-north', what: 'turret', cost: 70, where: { x: 2, z: 14 } },
  { key: 'turret-claim', what: 'turret', cost: 95, where: { x: -4, z: 12 } },
];

const UPGRADE_PRIORITY = [
  'split_spark',
  'double_tap_coil',
  'long_resonator',
  'tinkers_plating',
  'heavy_spark',
  'wide_ring',
  'powder_charge',
  'prospectors_luck',
  'pan_legend',
  'spring_heels',
];

const runLog = [];
let lastView = null;
let finalOutcome = null;
let settled = false;
let lastHarvestSeam = null;
const knownSeamPositions = new Map();
const child = spawn(process.execPath, ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED], {
  stdio: ['pipe', 'pipe', 'pipe'],
});

const stdout = createInterface({ input: child.stdout, crlfDelay: Infinity });
const stderr = createInterface({ input: child.stderr, crlfDelay: Infinity });

stderr.on('line', (line) => {
  runLog.push({ type: 'stderr', line });
});

stdout.on('line', (line) => {
  if (!line.trim()) return;
  const message = JSON.parse(line);
  if (message.schema === 'goldrush.view.v1') {
    lastView = message;
    const orders = ordersFor(message);
    runLog.push({
      type: 'orders',
      wave: message.now.wave,
      gold: message.now.gold,
      hp: message.now.hero.hp,
      prospector: message.now.prospector,
      works: message.now.works.byKind,
      offer: message.now.pendingOffer?.map((offer) => offer.id) ?? [],
      secure: Boolean(message.now.pendingSecure),
      orders,
    });
    child.stdin.write(`${JSON.stringify(orders)}\n`);
    return;
  }
  finalOutcome = message;
  runLog.push({ type: 'outcome', outcome: message });
});

child.on('close', (code) => {
  if (settled) return;
  settled = true;
  writeFileSync('last-run-log.json', `${JSON.stringify({ code, finalOutcome, lastView, runLog }, null, 2)}\n`);
  if (finalOutcome) {
    process.stdout.write(`${JSON.stringify(finalOutcome)}\n`);
    process.exitCode = finalOutcome.secured ? 0 : 2;
  } else {
    process.stderr.write(`player: simulator exited without outcome (code ${code})\n`);
    process.exitCode = code || 1;
  }
});

function ordersFor(view) {
  if (view.now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  rememberHarvestPosition(view);

  const pick = pickUpgrade(view);
  const prefix = [...(pick ? [pick] : []), ...combatOrders(view)];
  const next = nextBuildStep(view);

  if (next && view.now.gold >= next.cost) {
    return [
      ...prefix,
      { verb: 'MOVE_TO', pos: next.where },
      { verb: 'BUILD', what: next.what, where: next.where, when: { waveGte: 0 } },
      failFastView(),
    ];
  }

  if (next) {
    const seam = bestHarvestSeam(view);
    if (seam) {
      lastHarvestSeam = seam;
      return [...prefix, { verb: 'HARVEST', seam }, failFastView()];
    }
  }

  return [
    ...prefix,
    { verb: 'REPAIR_UNDER', pct: 80 },
    { verb: 'HOLD', pos: { x: 0, z: 10.5 } },
  ];
}

function nextBuildStep(view) {
  const live = view.now.works.entries ?? [];
  const counts = {
    sentry_beacon: live.filter((entry) => entry.id === 'sentry_beacon' && !entry.wrecked).length,
    turret: live.filter((entry) => entry.id === 'turret' && !entry.wrecked).length,
  };
  let wantedBeacons = 0;
  let wantedTurrets = 0;
  for (const step of BUILD_STEPS) {
    if (step.what === 'sentry_beacon') {
      wantedBeacons += 1;
      if (counts.sentry_beacon >= wantedBeacons) continue;
    }
    if (step.what === 'turret') {
      wantedTurrets += 1;
      if (counts.turret >= wantedTurrets) continue;
    }
    return step;
  }
  return null;
}

function bestHarvestSeam(view) {
  const active = (view.now.seams ?? []).filter((seam) => seam.active && seam.remaining > 0);
  if (lastHarvestSeam && active.some((seam) => seam.id === lastHarvestSeam)) {
    const known = knownSeamPositions.get(lastHarvestSeam);
    if (!known || distance(view.now.prospector, known) < 15) return lastHarvestSeam;
  }
  active.sort((a, b) => {
    const posA = knownSeamPositions.get(a.id);
    const posB = knownSeamPositions.get(b.id);
    if (posA && posB) return distance(view.now.prospector, posA) - distance(view.now.prospector, posB);
    if (posA) return -1;
    if (posB) return 1;
    return b.remaining - a.remaining;
  });
  return active[0]?.id ?? null;
}

function pickUpgrade(view) {
  const offer = view.now.pendingOffer;
  if (!offer?.length) return null;
  if (view.now.hero.hp < 60 && offer.some((candidate) => candidate.id === 'tinkers_plating')) {
    return { verb: 'PICK_UPGRADE', id: 'tinkers_plating' };
  }
  for (const id of UPGRADE_PRIORITY) {
    if (offer.some((candidate) => candidate.id === id)) return { verb: 'PICK_UPGRADE', id };
  }
  return { verb: 'PICK_UPGRADE', id: offer[0].id };
}

function combatOrders(view) {
  if (view.now.blastReadyInMs !== 0 || view.now.threats.alive <= 0) return [];
  return [{ verb: 'BLAST_AT', pos: blastPoint(view) }];
}

function blastPoint(view) {
  const hero = view.now.hero;
  const edge = view.now.threats.edge;
  if (edge === 'north') return { x: hero.x, z: hero.z - 8 };
  if (edge === 'south') return { x: hero.x, z: hero.z + 8 };
  if (edge === 'east') return { x: hero.x + 8, z: hero.z };
  if (edge === 'west') return { x: hero.x - 8, z: hero.z };
  return { x: hero.x, z: hero.z };
}

function rememberHarvestPosition(view) {
  const done = [...(view.now.orders ?? [])].reverse().find((record) => record.order?.verb === 'HARVEST' && record.status === 'done');
  if (!done?.order?.seam) return;
  knownSeamPositions.set(done.order.seam, { x: view.now.prospector.x, z: view.now.prospector.z });
  lastHarvestSeam = done.order.seam;
}

function failFastView() {
  return { verb: 'BLAST_AT', pos: { x: 0, z: 50 } };
}

function distance(a, b) {
  return Math.hypot((a?.x ?? 0) - b.x, (a?.z ?? 0) - b.z);
}
