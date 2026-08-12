import readline from 'node:readline';

const CLAIM_POS = { x: 0, z: 12 };
const BUILD_PLAN = [
  { key: 'beacon-center', kind: 'sentry_beacon', pos: { x: -2, z: 7 }, gold: 25 },
  { key: 'turret-nw', kind: 'turret', pos: { x: -8, z: 7 }, gold: 50 },
  { key: 'turret-s', kind: 'turret', pos: { x: -2, z: -7 }, gold: 70 },
  { key: 'beacon-s', kind: 'sentry_beacon', pos: { x: 1, z: -7 }, gold: 35 },
  { key: 'turret-ne', kind: 'turret', pos: { x: 7, z: 7 }, gold: 95 },
  { key: 'beacon-ne', kind: 'sentry_beacon', pos: { x: 4, z: 7 }, gold: 45 },
  { key: 'turret-center', kind: 'turret', pos: { x: -5, z: 7 }, gold: 125 },
  { key: 'beacon-far-ne', kind: 'sentry_beacon', pos: { x: 10, z: 7 }, gold: 55 },
  { key: 'beacon-nw', kind: 'sentry_beacon', pos: { x: -11, z: 7 }, gold: 75 },
];

const UPGRADE_BASE_SCORE = {
  split_spark: 100,
  double_tap_coil: 97,
  heavy_spark: 95,
  long_resonator: 90,
  tinkers_plating: 86,
  spring_heels: 70,
  beacon_dynamo: 64,
  field_dressing: 62,
  sharpen: 60,
  powder_charge: 38,
  quick_fuse: 36,
  wide_ring: 34,
  pan_legend: 30,
  auto_pan: 28,
  prospectors_luck: 26,
  assay_bonus: 24,
};

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

function builtEntries(view, kind) {
  return (view.now?.works?.entries ?? []).filter((entry) => entry.id === kind);
}

function standingLanterns(view) {
  return builtEntries(view, 'lantern_post').filter((entry) => !entry.wrecked).length;
}

function planStepDone(view, step) {
  return builtEntries(view, step.kind).some((entry) => dist(entry.position, step.pos) <= 1.25);
}

function nextBuildStep(view) {
  return BUILD_PLAN.find((step) => !planStepDone(view, step)) ?? null;
}

function pickHarvestSeam(view, target = CLAIM_POS) {
  const seamPositions = new Map(
    (view.stablePrefix?.map?.seams ?? []).map((seam) => [seam.id, seam]),
  );
  const seams = (view.now?.seams ?? [])
    .filter((seam) => seam.active && seam.remaining > 0)
    .map((seam) => ({ ...seam, ...(seamPositions.get(seam.id) ?? {}) }))
    .filter((seam) => Number.isFinite(seam.x) && Number.isFinite(seam.z));
  if (seams.length === 0) return null;
  return seams
    .slice()
    .sort((a, b) => {
      const distanceDelta = dist(target, a) - dist(target, b);
      if (distanceDelta !== 0) return distanceDelta;
      return b.remaining - a.remaining;
    })[0];
}

function shouldRepair(view) {
  if ((view.now?.gold ?? 0) < 8) return false;
  const entries = view.now?.works?.entries ?? [];
  return entries.some((entry) => entry.wrecked || entry.hp < entry.maxHp);
}

function repairPct(view) {
  const wave = view.now?.wave ?? 0;
  if (wave >= 18) return 75;
  if (wave >= 10) return 65;
  return 55;
}

function pickUpgrade(view) {
  const offer = view.now?.pendingOffer ?? [];
  const hpRatio = (view.now?.hero?.hp ?? 1) / Math.max(1, view.now?.hero?.maxHp ?? 1);
  const beaconCount = builtEntries(view, 'sentry_beacon').length;
  const turretCount = builtEntries(view, 'turret').length;
  const taken = view.now?.hero?.upgradesTaken ?? {};
  const wave = view.now?.wave ?? 0;
  let best = offer[0];
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const card of offer) {
    const text = `${card.id} ${card.name ?? ''} ${card.effectText ?? ''}`.toLowerCase();
    let score = UPGRADE_BASE_SCORE[card.id] ?? 40;

    if (text.includes('spark damage')) score += 26;
    if (text.includes('fire rate')) score += 24;
    if (text.includes('range')) score += 18;
    if (text.includes('bolt speed')) score += 8;
    if (text.includes('spark per volley')) score += 22;
    if (text.includes('max hp')) score += hpRatio < 0.8 ? 20 : 10;
    if (text.includes('heals')) score += hpRatio < 0.4 ? 36 : hpRatio < 0.65 ? 18 : 4;
    if (text.includes('move speed')) score += wave >= 12 ? 18 : 10;
    if (text.includes('beacon fire rate')) score += beaconCount >= 2 ? 18 : 8;
    if (text.includes('gold now')) score += wave < 8 ? 10 : 4;
    if (text.includes('panning')) score -= 4;
    if (text.includes('blast')) score -= 8;

    if (card.id === 'tinkers_plating' && hpRatio < 0.7) score += 18;
    if (card.id === 'field_dressing' && hpRatio < 0.5) score += 26;
    if (card.id === 'spring_heels' && wave >= 15) score += 10;
    if (turretCount === 0 && beaconCount === 0 && card.id === 'pan_legend' && (taken.pan_legend ?? 0) < 1) score += 80;
    if (turretCount === 0 && card.id === 'long_resonator') score -= 12;

    score -= offer.indexOf(card) * 0.001;
    if (score > bestScore) {
      bestScore = score;
      best = card;
    }
  }

  return best?.id ?? offer[0]?.id ?? null;
}

function buildMode(view, step) {
  const orders = [{ verb: 'FALLBACK_IF', threat: { enemiesGte: 1 }, pos: CLAIM_POS }];
  if (dist(view.now?.prospector ?? CLAIM_POS, step.pos) > 5.75) {
    orders.push({ verb: 'MOVE_TO', pos: step.pos });
  }
  orders.push({ verb: 'BUILD', what: step.kind, where: step.pos, when: { goldGte: step.gold } });
  return orders;
}

function economyMode(view, step) {
  const orders = [{ verb: 'FALLBACK_IF', threat: { enemiesGte: 1 }, pos: CLAIM_POS }];
  const defenseCount = builtEntries(view, 'turret').length + builtEntries(view, 'sentry_beacon').length;
  if (defenseCount > 0 && standingLanterns(view) < 2 && (view.now?.gold ?? 0) >= 8) {
    orders.push({ verb: 'REPAIR_UNDER', pct: 50 });
    orders.push({ verb: 'HOLD', pos: CLAIM_POS });
  } else {
    const seam = pickHarvestSeam(view, step.pos);
    if (seam) orders.push({ verb: 'HARVEST', seam: seam.id });
    else orders.push({ verb: 'HOLD', pos: CLAIM_POS });
  }
  return orders;
}

function maintenanceMode(view) {
  const orders = [{ verb: 'FALLBACK_IF', threat: { enemiesGte: 1 }, pos: CLAIM_POS }];
  if (shouldRepair(view)) orders.push({ verb: 'REPAIR_UNDER', pct: repairPct(view) });
  const seam = pickHarvestSeam(view);
  if (seam) orders.push({ verb: 'HARVEST', seam: seam.id });
  orders.push({ verb: 'HOLD', pos: CLAIM_POS });
  return orders;
}

function chooseOrders(view) {
  if (view.now?.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const upgradeId = pickUpgrade(view);
  if (upgradeId) return [{ verb: 'PICK_UPGRADE', id: upgradeId }];

  const nextStep = nextBuildStep(view);
  if (!nextStep) return maintenanceMode(view);
  return (view.now?.gold ?? 0) >= nextStep.gold ? buildMode(view, nextStep) : economyMode(view, nextStep);
}

const rl = readline.createInterface({
  input: process.stdin,
  crlfDelay: Infinity,
});

rl.on('line', (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  let message;
  try {
    message = JSON.parse(trimmed);
  } catch {
    return;
  }
  if (message?.schema !== 'goldrush.view.v1') return;
  const orders = chooseOrders(message).slice(0, 32);
  process.stdout.write(`${JSON.stringify(orders)}\n`);
});
