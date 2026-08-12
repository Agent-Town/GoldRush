#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';

const contract = 'e1-night-shift';
const seed = 'e1-night-shift-01';
const variant = Number.parseInt(process.env.GR_VARIANT ?? '6', 10);
const child = spawn(process.execPath, ['scripts/gr-sim.mjs', '--contract', contract, '--seed', seed], {
  cwd: process.cwd(),
  stdio: ['pipe', 'pipe', 'inherit'],
});
const lines = createInterface({ input: child.stdout, crlfDelay: Infinity });

let finalOutcome = null;
let lastWave = -1;

function chooseUpgrade(offer) {
  const priorities = [
    'blast_damage', 'blast_radius', 'blast_cooldown',
    'rig_damage', 'rig_fire_rate', 'rig_range',
    'hero_health', 'move_speed', 'repair_efficiency',
  ];
  for (const needle of priorities) {
    const match = offer.find((entry) => entry.id.includes(needle));
    if (match) return match.id;
  }
  return offer[0].id;
}

function nearestActiveSeam(view) {
  const coords = new Map(view.stablePrefix.map.seams.map((seam) => [seam.id, seam]));
  const seams = (view.now.seams ?? []).map((seam) => ({ ...seam, ...coords.get(seam.id) }));
  const hero = view.now.prospector;
  return seams
    .filter((seam) => seam.active !== false && (seam.remaining ?? 1) > 0)
    .sort((a, b) => {
      const ad = (a.x - hero.x) ** 2 + (a.z - hero.z) ** 2;
      const bd = (b.x - hero.x) ** 2 + (b.z - hero.z) ** 2;
      return ad - bd;
    })[0];
}

function ordersFor(view) {
  const { now } = view;
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
  if (now.pendingOffer?.length) return [{ verb: 'PICK_UPGRADE', id: chooseUpgrade(now.pendingOffer) }];

  const wave = now.wave;
  const hero = now.hero;
  const seam = nearestActiveSeam(view);
  const orders = [{ verb: 'SET_WEAPON', weapon: variant === 2 ? 'blast' : 'rig' }];

  if (variant >= 4) {
    const byKind = now.works.byKind ?? {};
    if (variant >= 6) {
      const beaconCount = byKind.sentry_beacon ?? 0;
      const beaconCosts = [25, 35, 45];
      const beaconPositions = [{ x: 0, z: 11 }, { x: -4, z: 11 }, { x: 4, z: 11 }];
      const palisadeCount = byKind.palisade ?? 0;
      const cover = [{ x: -2, z: 10 }, { x: 0, z: 10 }, { x: 2, z: 10 }, { x: -2, z: 14 }, { x: 2, z: 14 }];
      if (beaconCount < beaconCosts.length && now.gold >= beaconCosts[beaconCount]) {
        orders.push({ verb: 'MOVE_TO', pos: { x: 0, z: 12 } });
        orders.push({ verb: 'BUILD', what: 'sentry_beacon', where: beaconPositions[beaconCount], when: { goldGte: beaconCosts[beaconCount] } });
      } else if (palisadeCount < cover.length && now.gold >= 10) {
        orders.push({ verb: 'MOVE_TO', pos: { x: 0, z: 12 } });
        orders.push({ verb: 'BUILD', what: 'palisade', where: cover[palisadeCount], when: { goldGte: 10 } });
      }
      if (wave < 7 && seam) orders.push({ verb: 'HARVEST', seam: seam.id });
      orders.push({ verb: 'FALLBACK_IF', threat: { enemiesGte: 4 }, pos: { x: 0, z: 12 } });
      orders.push({ verb: 'HOLD', pos: { x: 0, z: 12 } });
      return orders;
    }
    if (variant >= 5) {
      const palisadeCount = byKind.palisade ?? 0;
      const ring = [
        { x: -2, z: 10 }, { x: 0, z: 10 }, { x: 2, z: 10 },
        { x: -2, z: 12 }, { x: 2, z: 12 },
        { x: -2, z: 14 }, { x: 0, z: 14 }, { x: 2, z: 14 },
      ];
      if (palisadeCount < ring.length && now.gold >= 10) {
        orders.push({ verb: 'MOVE_TO', pos: { x: 0, z: 12 } });
        orders.push({ verb: 'BUILD', what: 'palisade', where: ring[palisadeCount], when: { goldGte: 10 } });
      }
      if (wave < 7 && seam) orders.push({ verb: 'HARVEST', seam: seam.id });
      orders.push({ verb: 'FALLBACK_IF', threat: { enemiesGte: 3 }, pos: { x: 0, z: 12 } });
      orders.push({ verb: 'HOLD', pos: { x: 0, z: 12 } });
      return orders;
    }
    const turretCount = byKind.turret ?? 0;
    const turretCosts = [50, 70, 95, 125];
    const turretPositions = [{ x: -3, z: 12 }, { x: 3, z: 12 }, { x: 0, z: 9 }, { x: 0, z: 15 }];
    if (turretCount < turretCosts.length && now.gold >= turretCosts[turretCount]) {
      orders.push({ verb: 'MOVE_TO', pos: { x: 0, z: 12 } });
      orders.push({ verb: 'BUILD', what: 'turret', where: turretPositions[turretCount], when: { goldGte: turretCosts[turretCount] } });
    }
    if (wave < 9 && seam) orders.push({ verb: 'HARVEST', seam: seam.id });
    orders.push({ verb: 'FALLBACK_IF', threat: { enemiesGte: variant >= 5 ? 3 : 6 }, pos: { x: 0, z: 12 } });
    orders.push({ verb: 'HOLD', pos: { x: 0, z: 12 } });
    return orders;
  }

  if (variant >= 3) {
    const byKind = now.works.byKind ?? {};
    const plan = [
      { what: 'turret', count: byKind.turret ?? 0, costs: [50, 70, 95, 125], where: { x: 0, z: 12 } },
      { what: 'sentry_beacon', count: byKind.sentry_beacon ?? 0, costs: [25, 35, 45, 55, 75, 95], where: { x: 3, z: 12 } },
    ];
    const candidate = plan.find((item) => item.count < item.costs.length && now.gold >= item.costs[item.count]);
    if (candidate) {
      orders.push({ verb: 'BUILD', what: candidate.what, where: candidate.where, when: { goldGte: candidate.costs[candidate.count] } });
    }
    const hold = { x: 0, z: 12 };
    orders.push({ verb: 'FALLBACK_IF', threat: { enemiesGte: 5 }, pos: hold });
    orders.push({ verb: 'HOLD', pos: hold });
    return orders;
  }

  const buildPlan = variant === 1
    ? [
        ['sentry_beacon', 0, 11, 20],
        ['sentry_beacon', -4, 11, 45],
        ['sentry_beacon', 4, 11, 75],
      ]
    : [
        ['turret', 0, 11, 25],
        ['turret', -4, 11, 55],
        ['turret', 4, 11, 95],
        ['sentry_beacon', 0, 15, 135],
      ];
  for (const [what, x, z, goldGte] of buildPlan) {
    orders.push({ verb: 'BUILD', what, where: { x, z }, when: { goldGte } });
  }

  if (wave < (variant >= 4 ? 12 : 7) && seam) {
    orders.push({ verb: 'HARVEST', seam: seam.id });
  } else {
    const hold = variant >= 5 ? { x: 0, z: 8 } : { x: 0, z: 12 };
    if (Math.hypot(hero.x - hold.x, hero.z - hold.z) > 2) orders.push({ verb: 'MOVE_TO', pos: hold });
    orders.push({ verb: 'FALLBACK_IF', threat: { enemiesGte: 8 }, pos: hold });
    orders.push({ verb: 'HOLD', pos: hold });
  }
  return orders;
}

for await (const line of lines) {
  if (!line.trim()) continue;
  const message = JSON.parse(line);
  if (message.schema === 'goldrush.view.v1') {
    lastWave = message.now.wave;
    child.stdin.write(`${JSON.stringify(ordersFor(message))}\n`);
  } else {
    finalOutcome = message;
  }
}

const code = await new Promise((resolve) => child.on('close', resolve));
if (code !== 0 || !finalOutcome) {
  throw new Error(`gr-sim failed at wave ${lastWave} (exit ${code})`);
}
process.stdout.write(`${JSON.stringify(finalOutcome)}\n`);
