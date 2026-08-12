#!/usr/bin/env node

import { createInterface } from 'node:readline';

const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });
let terminalView = false;

for await (const line of rl) {
  if (!line.trim()) continue;
  const view = JSON.parse(line);
  if (view.schema !== 'goldrush.view.v1') {
    console.error(JSON.stringify(view));
    break;
  }

  const last = view.appendLog?.at(-1)?.outcome;
  if (last === 'secured' || last === 'rider-down' || view.now.hero.hp <= 0) {
    terminalView = true;
    continue;
  }
  if (terminalView) continue;
  if (view.now.pendingSecure) {
    process.stdout.write('[{"verb":"SECURE_CHOICE","choice":"bank"}]\n');
    continue;
  }
  if (view.now.pendingOffer?.length) {
    const pick = view.now.pendingOffer.toSorted((a, b) => upgradeScore(b) - upgradeScore(a))[0];
    process.stdout.write(`${JSON.stringify([{ verb: 'PICK_UPGRADE', id: pick.id }])}\n`);
    continue;
  }

  process.stdout.write(`${JSON.stringify(ordersFor(view))}\n`);
}

function ordersFor(view) {
  const { now } = view;
  const orders = [{ verb: 'SET_WEAPON', weapon: now.wave >= 6 ? 'blast' : 'rig' }];
  const damaged = now.works.entries.some((entry) => entry.wrecked || entry.hp < entry.maxHp * 0.8);
  if (damaged) orders.unshift({ verb: 'REPAIR_UNDER', pct: 80 });

  const seam = now.seams
    .filter((entry) => entry.active && entry.remaining > 0)
    .toSorted((a, b) => b.remaining - a.remaining)[0];
  if (seam) {
    for (let i = 0; i < 8; i += 1) orders.push({ verb: 'HARVEST', seam: seam.id });
  }

  const target = nextBuild(now);
  if (target && now.gold >= target.cost) {
    orders.push({ verb: 'MOVE_TO', pos: target.pos });
    orders.push({
      verb: 'BUILD',
      what: target.id,
      where: target.pos,
      when: { goldGte: target.cost },
      ...(target.rotationSteps === undefined ? {} : { rotationSteps: target.rotationSteps }),
    });
  }
  return orders;
}

function nextBuild(now) {
  const targets = [
    ['turret', -4, 12],
    ['turret', 4, 12],
    ['sentry_beacon', 0, 16],
    ['sentry_beacon', 0, 8],
    ['turret', -4, 16],
    ['turret', 4, 16],
    ['sentry_beacon', -6, 16],
    ['sentry_beacon', 6, 16],
  ];
  const used = now.works.entries;
  for (const [id, x, z] of targets) {
    if (used.some((entry) => entry.id === id && Math.hypot(entry.position.x - x, entry.position.z - z) < 1.5)) continue;
    const count = used.filter((entry) => entry.id === id).length;
    const cost = id === 'turret' ? curve(50, 1.35, count) : curve(25, 1.3, count);
    return { id, pos: { x, z }, cost };
  }
  return null;
}

function curve(base, growth, index) {
  return Math.ceil((base * growth ** index) / 5) * 5;
}

function upgradeScore(offer) {
  const id = offer.id;
  if (id === 'heavy_spark') return 100;
  if (id === 'double_tap_coil') return 95;
  if (id === 'split_spark') return 90;
  if (id === 'long_resonator') return 75;
  if (id === 'tinkers_plating') return 70;
  if (id === 'beacon_dynamo') return 65;
  if (id === 'powder_charge') return 60;
  if (id === 'wide_ring') return 55;
  if (id === 'quick_fuse') return 50;
  if (id === 'field_dressing') return 45;
  if (id === 'sharpen') return 40;
  return 20;
}
