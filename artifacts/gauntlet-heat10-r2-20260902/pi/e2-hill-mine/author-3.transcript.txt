// SCORED: yes
const plan = [
  { what: "palisade", x: 0, z: 18 },
  { what: "palisade", x: -5, z: 17 },
  { what: "palisade", x: 5, z: 17 },
  { what: "sentry_beacon", x: 0, z: 12 },
  { what: "palisade", x: -7, z: 12 },
  { what: "palisade", x: 7, z: 12 },
  { what: "turret", x: -6, z: 12 },
  { what: "turret", x: 6, z: 12 },
  { what: "sentry_beacon", x: 0, z: 20 },
  { what: "turret", x: -8, z: 20 },
  { what: "turret", x: 8, z: 20 }
];

function positionOf(entry) {
  return entry.position ?? entry.pos ?? entry;
}

function exists(entries, item) {
  return entries.some(entry => {
    if (entry.id !== item.what && entry.kind !== item.what && entry.what !== item.what) {
      return false;
    }
    const pos = positionOf(entry);
    return Number.isFinite(pos.x) &&
      Number.isFinite(pos.z) &&
      Math.hypot(pos.x - item.x, pos.z - item.z) < 1.5;
  });
}

function buildCosts(view) {
  const result = {};
  const buildables = view.stablePrefix?.mechanics?.buildables ?? [];

  for (const buildable of buildables) {
    result[buildable.id] = Array.isArray(buildable.costs)
      ? buildable.costs
      : [buildable.cost];
  }

  return result;
}

function countKind(entries, kind) {
  return entries.filter(entry =>
    entry.id === kind || entry.kind === kind || entry.what === kind
  ).length;
}

function chooseUpgrade(offer) {
  return offer
    .map((choice, index) => {
      const text =
        `${choice.id} ${choice.name ?? ""} ${choice.effectText ?? ""}`.toLowerCase();
      let score = -index;

      if (/spark.*(damage|rate|speed|range)|rig.*(damage|rate|speed|range)|heavy_spark/.test(text)) {
        score += 180;
      }
      if (/health|maximum hp|max hp|armor|armour|damage reduction|tough|surviv/.test(text)) {
        score += 150;
      }
      if (/move|speed|spring/.test(text)) score += 90;
      if (/repair|works health|building health|structure|fortif|mend/.test(text)) {
        score += 75;
      }
      if (/pan|gold|harvest|seam/.test(text)) score += 45;
      if (/blast|charge/.test(text)) score += 15;

      return { choice, score };
    })
    .sort((a, b) => b.score - a.score)[0]?.choice;
}

export default function controller(view) {
  if (!view || view.schema !== "goldrush.view.v1") {
    return [{ verb: "SET_WEAPON", weapon: "rig" }];
  }

  const now = view.now ?? {};

  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
    const pick = chooseUpgrade(now.pendingOffer);
    return [{ verb: "PICK_UPGRADE", id: pick.id }];
  }

  if (now.pendingSecure) {
    return [{ verb: "SECURE_CHOICE", choice: "bank" }];
  }

  const entries = now.works?.entries ?? [];
  const costs = buildCosts(view);
  const plannedCounts = {};
  const orders = [{ verb: "SET_WEAPON", weapon: "rig" }];

  for (const item of plan) {
    if (exists(entries, item)) continue;

    const alreadyBuilt = countKind(entries, item.what);
    const alreadyPlanned = plannedCounts[item.what] ?? 0;
    const instance = alreadyBuilt + alreadyPlanned;
    const curve = costs[item.what] ?? [10];
    const cost = curve[Math.min(instance, curve.length - 1)] ?? curve[0] ?? 10;

    orders.push({
      verb: "BUILD",
      what: item.what,
      where: { x: item.x, z: item.z },
      when: { goldGte: cost }
    });

    plannedCounts[item.what] = alreadyPlanned + 1;
  }

  orders.push({ verb: "REPAIR_UNDER", pct: 70 });

  const prospector = now.prospector ?? { x: 0, z: 12 };
  const seams = (now.seams ?? [])
    .filter(seam =>
      seam.active &&
      seam.remaining > 0 &&
      Number.isFinite(seam.x) &&
      Number.isFinite(seam.z)
    )
    .sort((a, b) =>
      Math.hypot(a.x - prospector.x, a.z - prospector.z) -
      Math.hypot(b.x - prospector.x, b.z - prospector.z)
    );

  if (seams.length) {
    orders.push({ verb: "HARVEST", seam: seams[0].id });
  }

  orders.push({
    verb: "FALLBACK_IF",
    threat: { enemiesGte: 5 },
    pos: { x: 0, z: 12 }
  });
  orders.push({ verb: "HOLD", pos: { x: 0, z: 12 } });

  return orders.slice(0, 32);
}
