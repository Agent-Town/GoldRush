import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';

const args = process.argv.slice(2);
const value = (flag, fallback) => {
  const i = args.indexOf(flag);
  return i < 0 ? fallback : args[i + 1];
};
const contract = value('--contract');
const seed = value('--seed', `${contract}-01`);
const tape = value('--tape');
const weapon = value('--weapon', 'rig');
const style = value('--style', 'damage');
if (!contract || !tape) throw new Error('usage: rider.mjs --contract ID --tape PATH [--weapon rig|blast] [--style damage|tank]');
const priorities = {
  damage: ['chain_spark_arc', 'heavy_spark', 'double_tap_coil', 'split_spark', 'long_resonator', 'tinkers_plating',
    'field_dressing', 'powder_charge', 'quick_fuse', 'sharpen', 'beacon_dynamo', 'prospectors_luck', 'pan_legend'],
  tank: ['tinkers_plating', 'field_dressing', 'chain_spark_arc', 'heavy_spark', 'double_tap_coil', 'split_spark',
    'long_resonator', 'powder_charge', 'quick_fuse', 'sharpen', 'beacon_dynamo', 'prospectors_luck', 'pan_legend'],
  blast: ['powder_charge', 'quick_fuse', 'tinkers_plating', 'field_dressing', 'chain_spark_arc', 'heavy_spark',
    'double_tap_coil', 'split_spark', 'long_resonator', 'sharpen', 'beacon_dynamo', 'prospectors_luck', 'pan_legend'],
};

const child = spawn(process.execPath, ['scripts/gr-sim.mjs', '--contract', contract, '--seed', seed, '--tape', tape], {
  cwd: process.cwd(), stdio: ['pipe', 'pipe', 'pipe'],
});
const refused = new Set();
const hillMemo = { refused: new Set() };
let outcome;
let lastWave = -1;
let lastOrders = '';
let lastOrderList = [];
createInterface({ input: child.stderr, crlfDelay: Infinity }).on('line', (line) => process.stderr.write(`${line}\n`));

for await (const line of createInterface({ input: child.stdout, crlfDelay: Infinity })) {
  const message = JSON.parse(line);
  if (message.schema !== 'goldrush.view.v1') { outcome = message; continue; }
  rememberFailures(message.now.orders);
  if (message.now.wave !== lastWave || message.now.needsRider) {
    lastWave = message.now.wave;
    const n = message.now;
    process.stderr.write(`${JSON.stringify({ wave: n.wave, hp: n.hero.hp, maxHp: n.hero.maxHp, level: n.hero.level,
      gold: n.gold, threats: n.threats.alive, worksHp: n.works.hp, works: n.works.byKind,
      offer: n.pendingOffer?.map(({ id }) => id), needsRider: n.needsRider,
      failures: n.orders?.filter(({ status }) => status === 'failed').map(({ reason }) => reason) })}\n`);
  }
  if (message.now.hero.hp <= 0 || message.appendLog.at(-1)?.outcome === 'secured') continue;
  if (message.now.pendingSecure) {
    child.stdin.write('\n');
    continue;
  }
  let nextOrders = ordersFor(message);
  const repeatRepair = nextOrders.some(({ verb }) => verb === 'REPAIR_UNDER')
    && message.now.orders?.some(({ status, order }) => order?.verb === 'REPAIR_UNDER' && ['done', 'failed'].includes(status));
  let repeatedHarvests = 0;
  if (repeatRepair) nextOrders = nextOrders.filter(({ verb }) => ['REPAIR_UNDER', 'PICK_UPGRADE', 'SET_WEAPON', 'HOLD'].includes(verb)
    || (verb === 'HARVEST' && repeatedHarvests++ < 12));
  const encoded = JSON.stringify(nextOrders);
  const settled = JSON.stringify(lastOrderList.filter(({ verb }) => !['PICK_UPGRADE', 'SET_WEAPON', 'BLAST_AT'].includes(verb)));
  child.stdin.write((encoded === lastOrders || encoded === settled) && !repeatRepair ? '\n' : `${encoded}\n`);
  lastOrders = encoded;
  lastOrderList = nextOrders;
}

const code = await new Promise((resolve, reject) => {
  child.once('error', reject);
  child.once('close', resolve);
});
process.stdout.write(`${JSON.stringify(outcome)}\n`);
if (code !== 0 || !outcome) process.exitCode = code || 1;

function ordersFor(view) {
  const { now, stablePrefix } = view;
  if (contract === 'e2-hill-mine') return hillOrdersFor(now, view);
  const stake = { x: now.hero.x, z: now.hero.z };
  const orders = [];
  if (contract !== 'e1-night-shift' && now.works.maxHp > 0 && now.works.hp / now.works.maxHp < 0.72) {
    orders.push({ verb: 'REPAIR_UNDER', pct: 72 });
  }
  if (now.pendingOffer?.length) {
    const pick = [...now.pendingOffer].sort((a, b) => rank(a.id) - rank(b.id))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: pick.id });
  }
  const activeWeapon = weapon === 'switch' ? (now.wave >= (contract === 'e2-hill-mine' ? 12 : 20) ? 'blast' : 'rig') : weapon;
  if (now.weapon !== activeWeapon) orders.push({ verb: 'SET_WEAPON', weapon: activeWeapon });
  if (activeWeapon === 'rig' && now.blastReadyInMs === 0 && now.threats.alive > 0) {
    orders.push({ verb: 'BLAST_AT', pos: blastTarget(now, stake) });
  }

  const plan = buildPlan(stake, now.wave);
  const definitions = new Map((stablePrefix.mechanics.buildables ?? []).map((item) => [item.id, item]));
  const counts = { ...now.works.byKind };
  let gold = now.gold;
  let queued = 0;
  for (const item of plan) {
    if (queued >= 1 || orders.length > 27) break;
    if (refused.has(key(item)) || hasWork(now.works.entries, item)) continue;
    const definition = definitions.get(item.what);
    const count = counts[item.what] ?? 0;
    if (!definition || count >= definition.maxCount) continue;
    const costs = definition.costs ?? [];
    const cost = costs[Math.min(count, costs.length - 1)] ?? definition.cost;
    if (!Number.isFinite(cost) || gold < cost) break;
    const where = { x: item.x, z: item.z };
    orders.push({ verb: 'MOVE_TO', pos: where }, { verb: 'BUILD', what: item.what, where, when: { goldGte: cost },
      ...(item.rotationSteps === undefined ? {} : { rotationSteps: item.rotationSteps }) });
    gold -= cost;
    counts[item.what] = count + 1;
    queued += 1;
  }

  if ((now.wave >= 9 || plan.every((item) => hasWork(now.works.entries, item) || refused.has(key(item)))) && orders.length < 29) {
    const target = upgradeTarget(now, gold);
    if (target) orders.push({ verb: 'MOVE_TO', pos: target.position },
      { verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: target.id, index: target.index } });
  }

  const complete = plan.every((item) => hasWork(now.works.entries, item) || refused.has(key(item)));
  complete ? orders.push({ verb: 'HOLD', pos: stake }) : addPanAndHold(orders, now, stablePrefix, stake);
  return orders.slice(0, 32);
}

function hillOrdersFor(now, view) {
  const stake = { x: now.hero.x, z: now.hero.z };
  const pros = now.prospector ?? stake;
  const near = (target) => distance(pros, target) <= 1.4;
  const head = [{ verb: 'REPAIR_UNDER', pct: 70 }];
  if (now.pendingOffer?.length) {
    const pick = [...now.pendingOffer].sort((a, b) => rank(a.id) - rank(b.id))[0];
    head.push({ verb: 'PICK_UPGRADE', id: pick.id });
  }
  if (weapon === 'switch' && now.wave >= 12 && now.weapon !== 'blast') head.push({ verb: 'SET_WEAPON', weapon: 'blast' });
  for (const record of now.orders ?? []) if (record.status === 'failed' && record.order?.verb === 'BUILD') {
    hillMemo.refused.add(`${record.order.where.x.toFixed(2)}:${record.order.where.z.toFixed(2)}`);
  }
  const pending = hillPlan(now, stake);
  if (pending.length && now.gold >= pending[0].cost) {
    const stage = pending[0].stage;
    if (!near(stage)) return [...head, { verb: 'HOLD', pos: stage }];
    return [...head, ...pending.filter((entry) => entry.stage.x === stage.x && entry.stage.z === stage.z).slice(0, 28)
      .map((entry) => ({ verb: 'BUILD', what: entry.what, where: entry.where, when: { goldGte: entry.cost } })),
    { verb: 'HOLD', pos: stage }];
  }
  const gun = hillUpgradeTarget(now);
  if (gun) return near(gun.position)
    ? [...head, { verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: gun.id, index: gun.index } }, { verb: 'HOLD', pos: gun.position }]
    : [...head, { verb: 'HOLD', pos: gun.position }];
  const anchors = new Map(view.stablePrefix.map.seams.map((seam) => [seam.id, seam]));
  const seam = now.seams.filter((entry) => entry.active && entry.remaining > 0 && anchors.has(entry.id))
    .sort((a, b) => distance(stake, anchors.get(a.id)) - distance(stake, anchors.get(b.id)))[0];
  return seam ? [...head, ...Array.from({ length: 30 }, () => ({ verb: 'HARVEST', seam: seam.id }))]
    : [...head, { verb: 'HOLD', pos: stake }];
}

function hillPlan(now, stake) {
  const order = ['turret', 'turret', 'boiler_house', 'boiler_house', 'turret@battery', 'sentry_beacon',
    'turret@battery', 'sentry_beacon', 'sentry_beacon', 'sentry_beacon', 'sentry_beacon', 'sentry_beacon'];
  const costs = { sentry_beacon: [25, 33, 43, 55, 72, 93], turret: [50, 68, 91, 123], boiler_house: [70, 70, 70] };
  const grid = [0, -2.5, 2.5].flatMap((dz) => [-2.7, 2.7, -5.4, 5.4, 0].map((dx) => ({ dx, dz })))
    .filter(({ dx, dz }) => dx || dz);
  const pads = [0, 12, -12].flatMap((offset) => {
    const stage = { x: stake.x + offset, z: stake.z };
    return grid.map(({ dx, dz }) => ({ x: Number((stage.x + dx).toFixed(2)), z: Number((stage.z + dz).toFixed(2)), stage }));
  });
  const taken = (now.works.entries ?? []).map((entry) => entry.position);
  const open = (pad) => !hillMemo.refused.has(`${pad.x.toFixed(2)}:${pad.z.toFixed(2)}`)
    && !taken.some((position) => distance(position, pad) < 2);
  const home = pads.filter(open);
  const battery = [{ x: -26, z: 8.5 }, { x: 26, z: 8.5 }, { x: -18, z: 8.5 }, { x: 18, z: 8.5 }].filter(open);
  const seen = {}, pending = [];
  let homeUsed = 0, batteryUsed = 0;
  for (const rung of order) {
    const [what, site] = rung.split('@');
    const index = seen[what] ?? 0;
    seen[what] = index + 1;
    if (index < (now.works.byKind?.[what] ?? 0)) continue;
    const railPad = site === 'battery' ? battery[batteryUsed] : undefined;
    const where = railPad ?? home[homeUsed];
    const cost = costs[what]?.[index];
    if (!where || cost === undefined) continue;
    if (railPad) batteryUsed += 1; else homeUsed += 1;
    pending.push({ what, where: { x: where.x, z: where.z }, cost, stage: where.stage ?? where });
  }
  return pending;
}

function hillUpgradeTarget(now) {
  const tier = (entry) => Number.isFinite(entry.tier) && entry.tier > 0 ? entry.tier : 1;
  return (now.works.entries ?? []).filter((entry) => entry.id === 'turret' && !entry.wrecked && tier(entry) < 3)
    .map((entry) => ({ ...entry, cost: tier(entry) === 1 ? 150 : 300 }))
    .filter((entry) => now.gold >= entry.cost).sort((a, b) => a.cost - b.cost
      || Math.abs(b.position.x) - Math.abs(a.position.x) || a.index - b.index)[0] ?? null;
}

function addPanAndHold(orders, now, stablePrefix, stake) {
  const anchors = new Map(stablePrefix.map.seams.map((seam) => [seam.id, seam]));
  const seam = now.seams.filter((entry) => entry.active && entry.remaining > 0 && anchors.has(entry.id))
    .sort((a, b) => distance(stake, anchors.get(a.id)) - distance(stake, anchors.get(b.id)))[0];
  if (seam) for (let i = 0; i < Math.floor(seam.remaining / 5) && orders.length < 31; i += 1) {
    orders.push({ verb: 'HARVEST', seam: seam.id });
  }
  orders.push({ verb: 'HOLD', pos: stake });
}

function buildPlan(stake, wave) {
  const at = (what, dx, dz, rotationSteps) => ({ what, x: stake.x + dx, z: stake.z + dz, rotationSteps });
  const home = [at('turret', -2.7, 0), at('turret', 2.7, 0), at('turret', -5.4, 0), at('turret', 5.4, 0),
    at('sentry_beacon', 0, -2.5), at('sentry_beacon', 0, 2.5), at('sentry_beacon', -2.7, -2.5),
    at('sentry_beacon', 2.7, -2.5), at('sentry_beacon', -2.7, 2.5), at('sentry_beacon', 2.7, 2.5)];
  if (contract === 'e2-hill-mine') {
    return [home[0], home[1], at('boiler_house', 0, -2.5), at('boiler_house', 0, 2.5),
      at('turret', -26 - stake.x, 8.5 - stake.z), at('turret', 26 - stake.x, 8.5 - stake.z),
      home[2], home[3], ...home.slice(4)];
  }
  if (contract === 'e1-baron') {
    const beacons = home.slice(4);
    if (wave < 11) return [...home.slice(0, 4), ...beacons];
    const walls = [-12, -9, -6, -3, 0, 3, 6, 9, 12].flatMap((dx) =>
      [at('palisade', dx, -5, 1), at('palisade', dx, -2, 1)]);
    return [...home.slice(0, 4), ...beacons, ...walls];
  }
  if (wave < 11) return home;
  const walls = [-12, -9, -6, -3, 0, 3, 6, 9, 12].flatMap((dx) => [at('palisade', dx, -5, 1), at('palisade', dx, 5, 1)]);
  return [...home, ...walls];
}

function upgradeTarget(now, gold, maxTier = 3) {
  const tier = (entry) => Number.isFinite(entry.tier) && entry.tier > 0 ? entry.tier : 1;
  return now.works.entries.filter((entry) => entry.id === 'turret' && !entry.wrecked && tier(entry) < maxTier)
    .map((entry) => ({ ...entry, cost: tier(entry) === 1 ? 150 : 300 }))
    .filter((entry) => gold >= entry.cost).sort((a, b) => a.cost - b.cost
      || (contract === 'e1-baron' ? a.position.z - b.position.z : a.index - b.index))[0];
}

function rank(id) { const i = (priorities[style] ?? priorities.damage).indexOf(id); return i < 0 ? 99 : i; }

function blastTarget(now, stake) {
  const target = { ...stake };
  if (now.threats.edge === 'north') target.z -= 8;
  else if (now.threats.edge === 'south') target.z += 8;
  else if (now.threats.edge === 'east') target.x += 8;
  else if (now.threats.edge === 'west') target.x -= 8;
  const dx = target.x - now.hero.x, dz = target.z - now.hero.z;
  const scale = Math.min(1, 9.5 / (Math.hypot(dx, dz) || 1));
  return { x: now.hero.x + dx * scale, z: now.hero.z + dz * scale };
}

function rememberFailures(records = []) {
  for (const record of records) if (record.status === 'failed' && record.order?.verb === 'BUILD') {
    const item = { what: record.order.what, x: record.order.where.x, z: record.order.where.z,
      rotationSteps: record.order.rotationSteps };
    refused.add(key(item));
    process.stderr.write(`build refused ${key(item)}: ${record.reason ?? 'unknown'}\n`);
  }
}
function hasWork(entries, item) { return entries.some((work) => work.id === item.what && distance(work.position, item) < 0.7); }
function key(item) { return `${item.what}:${item.x}:${item.z}:${item.rotationSteps ?? 0}`; }
function distance(a, b) { return Math.hypot(a.x - b.x, a.z - b.z); }
