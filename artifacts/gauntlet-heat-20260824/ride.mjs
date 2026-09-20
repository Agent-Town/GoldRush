import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';

export async function ride(config) {
  const argv = process.argv.slice(2);
  const value = (flag, fallback) => {
    const index = argv.indexOf(flag);
    return index < 0 ? fallback : argv[index + 1];
  };
  const seed = value('--seed', config.seed);
  const tape = value('--tape');
  if (!tape) throw new Error('missing --tape');

  const sim = spawn(process.execPath, [
    'scripts/gr-sim.mjs', '--contract', config.contract, '--seed', seed, '--tape', tape,
  ], { cwd: process.cwd(), stdio: ['pipe', 'pipe', 'pipe'] });
  const refused = new Set();
  let outcome;
  let lastWave = -1;

  createInterface({ input: sim.stderr, crlfDelay: Infinity }).on('line', (line) => {
    process.stderr.write(`${line}\n`);
  });

  for await (const line of createInterface({ input: sim.stdout, crlfDelay: Infinity })) {
    const message = JSON.parse(line);
    if (message.schema !== 'goldrush.view.v1') {
      outcome = message;
      continue;
    }
    rememberFailures(message.now.orders, refused);
    if (message.now.wave !== lastWave) {
      lastWave = message.now.wave;
      const { hero, works } = message.now;
      process.stderr.write(`${JSON.stringify({
        wave: lastWave, hp: hero.hp, gold: message.now.gold, threats: message.now.threats.alive,
        worksHp: works.hp, works: works.byKind,
      })}\n`);
    }
    if (message.now.pendingSecure) {
      // Silence takes the documented bank default without stamping a terminal-tick order.
      sim.stdin.write('\n');
      continue;
    }
    if (config.explicitPicks && message.now.pendingOffer?.length) {
      const hurt = message.now.hero.hp < message.now.hero.maxHp * 0.7;
      const priority = hurt
        ? ['field_dressing', 'tinkers_plating', 'split_spark', 'double_tap_coil', 'heavy_spark']
        : ['split_spark', 'double_tap_coil', 'tinkers_plating', 'heavy_spark',
          'long_resonator', 'field_dressing', 'powder_charge', 'quick_fuse'];
      const pick = [...message.now.pendingOffer].sort((a, b) => {
        const rank = (id) => { const index = priority.indexOf(id); return index < 0 ? priority.length : index; };
        return rank(a.id) - rank(b.id);
      })[0];
      sim.stdin.write(`${JSON.stringify([{ verb: 'PICK_UPGRADE', id: pick.id }])}\n${config.oneLine ? '' : '\n'}`);
      continue;
    }
    if (message.now.hero.hp <= 0 || message.appendLog.at(-1)?.outcome === 'secured') continue;
    sim.stdin.write(`${JSON.stringify(ordersFor(message, config, refused))}\n${config.oneLine ? '' : '\n'}`);
  }

  const code = await new Promise((resolve, reject) => {
    sim.once('error', reject);
    sim.once('close', resolve);
  });
  process.stdout.write(`${JSON.stringify(outcome)}\n`);
  if (code !== 0 || !outcome) process.exitCode = code || 1;
}

function ordersFor(view, config, refused) {
  const { now, stablePrefix } = view;
  const claim = stablePrefix.map.claim;
  const orders = [];
  // Draft silence takes the public door's documented first offer; keeping stale PICK_UPGRADE
  // orders out of the replacement prevents one expired offer from refusing the whole fort plan.
  if (now.blastReadyInMs === 0 && now.threats.alive > 0) {
    orders.push({ verb: 'BLAST_AT', pos: blastTarget(now, claim) });
  }
  const plan = config.plan(claim, now.wave);
  const definitions = new Map((stablePrefix.mechanics.buildables ?? []).map((item) => [item.id, item]));
  const counts = { ...now.works.byKind };
  let gold = now.gold;
  let queued = 0;
  for (const item of plan) {
    if (queued >= 4 || orders.length > 27) break;
    if (refused.has(key(item)) || hasWork(now.works.entries, item)) continue;
    const definition = definitions.get(item.what);
    const count = counts[item.what] ?? 0;
    if (!definition || count >= definition.maxCount) continue;
    const costs = definition.costs ?? [];
    const cost = costs[Math.min(count, costs.length - 1)] ?? definition.cost;
    if (!Number.isFinite(cost) || gold < cost) break;
    const pos = { x: item.x, z: item.z };
    orders.push(
      { verb: 'MOVE_TO', pos },
      { verb: 'BUILD', what: item.what, where: pos, when: { goldGte: cost },
        ...(item.rotationSteps === undefined ? {} : { rotationSteps: item.rotationSteps }) },
    );
    gold -= cost;
    counts[item.what] = count + 1;
    queued += 1;
  }

  if (config.upgradeTurrets && now.wave >= config.upgradeWave && orders.length < 29) {
    const turret = now.works.entries.find((work) => work.id === 'turret' && !work.wrecked && work.tier === 1);
    if (turret && gold >= 150) {
      orders.push(
        { verb: 'MOVE_TO', pos: turret.position },
        { verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: 'turret', index: turret.index } },
      );
    } else if (!turret && config.upgradeWalls && gold >= 90) {
      const wall = now.works.entries.find((work) => work.id === 'palisade' && !work.wrecked && work.tier === 1);
      if (wall) orders.push(
        { verb: 'MOVE_TO', pos: wall.position },
        { verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: 'palisade', index: wall.index } },
      );
    }
  }

  const seamPositions = new Map(stablePrefix.map.seams.map((seam) => [seam.id, seam]));
  const from = now.prospector ?? claim;
  const seams = now.seams.filter((seam) => seam.active && seam.remaining > 0 && seamPositions.has(seam.id))
    .sort((a, b) => distance(from, seamPositions.get(a.id)) - distance(from, seamPositions.get(b.id)));
  for (const seam of seams) {
    for (let pans = Math.ceil(seam.remaining / 5); pans > 0 && orders.length < 31; pans -= 1) {
      orders.push({ verb: 'HARVEST', seam: seam.id });
    }
  }
  if (now.wave >= (config.repairWave ?? 8) && orders.length < 32) {
    orders.push({ verb: 'REPAIR_UNDER', pct: config.repairPct ?? 60 });
  }
  orders.push({ verb: 'HOLD', pos: claim });
  return orders.slice(0, 32);
}

function blastTarget(now, claim) {
  const target = { ...claim };
  if (now.threats.edge === 'north') target.z -= 8;
  else if (now.threats.edge === 'south') target.z += 8;
  else if (now.threats.edge === 'east') target.x += 8;
  else if (now.threats.edge === 'west') target.x -= 8;
  const dx = target.x - now.hero.x;
  const dz = target.z - now.hero.z;
  const scale = Math.min(1, 9.5 / (Math.hypot(dx, dz) || 1));
  return { x: now.hero.x + dx * scale, z: now.hero.z + dz * scale };
}

function rememberFailures(records = [], refused) {
  for (const record of records) {
    if (record.status !== 'failed' || record.order?.verb !== 'BUILD') continue;
    const item = { what: record.order.what, x: record.order.where.x, z: record.order.where.z,
      rotationSteps: record.order.rotationSteps };
    refused.add(key(item));
    process.stderr.write(`build refused ${key(item)}: ${record.reason ?? 'unknown'}\n`);
  }
}

function hasWork(entries, item) {
  return entries.some((work) => work.id === item.what && distance(work.position, item) < 0.6);
}

function key(item) {
  return `${item.what}:${item.x}:${item.z}:${item.rotationSteps ?? 0}`;
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}
