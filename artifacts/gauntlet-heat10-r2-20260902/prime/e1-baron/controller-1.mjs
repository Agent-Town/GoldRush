// SCORED: yes

const buildPlan = [
  ["sluice", -8, 1.5],
  ["sluice", 0, 1.5],
  ["sluice", 8, 1.5],
  ["stockpile", -4.5, 14.5],
  ["stockpile", 4.5, 14.5],
  ["sentry_beacon", 0, 4],
  ["sentry_beacon", -7, 7],
  ["sentry_beacon", 7, 7],
  ["sentry_beacon", -8, 14],
  ["sentry_beacon", 8, 14],
  ["sentry_beacon", 0, 19],
  ["turret", -4.5, 8],
  ["turret", 4.5, 8],
  ["turret", -5.5, 13],
  ["turret", 5.5, 13],
  ["palisade", -3, 11],
  ["palisade", 0, 11],
  ["palisade", 3, 11]
];

const fallbackCosts = {
  sluice: [60, 90],
  turret: [75, 110],
  sentry_beacon: [45, 70]
};

function kindOf(entry) {
  return entry.kind || entry.buildableId || entry.id;
}

function tierOf(entry) {
  return Number(entry.tier || entry.level || 1);
}

function liveEntries(view, kind) {
  return (view.now.works?.entries || []).filter(
    e => kindOf(e) === kind && !e.wrecked && (e.hp === undefined || e.hp > 0)
  );
}

function buildCost(view, kind) {
  const spec = view.stablePrefix.mechanics.buildables.find(b => b.id === kind);
  if (!spec) return Infinity;
  const count = liveEntries(view, kind).length;
  if (spec.costs && spec.costs.length) {
    if (count < spec.costs.length) return spec.costs[count];
    const last = spec.costs[spec.costs.length - 1];
    const prev = spec.costs[Math.max(0, spec.costs.length - 2)];
    return Math.ceil((last + Math.max(5, last - prev)) / 5) * 5;
  }
  return spec.cost;
}

function upgradeCost(entry, kind) {
  const published =
    entry.upgradeCost ??
    entry.nextUpgradeCost ??
    entry.context?.upgradeCost ??
    entry.actions?.upgrade?.cost;
  if (Number.isFinite(published)) return published;
  return fallbackCosts[kind]?.[Math.max(0, tierOf(entry) - 1)] ?? Infinity;
}

function posOf(entry) {
  const p = entry.pos || entry.position;
  return {
    x: Number(entry.x ?? p?.x ?? 0),
    z: Number(entry.z ?? p?.z ?? 12)
  };
}

function targetOf(entry, entries) {
  const id = entry.id || entry.buildableId || entry.kind;
  const index = Number.isInteger(entry.index)
    ? entry.index
    : entries.filter(e => kindOf(e) === kindOf(entry)).indexOf(entry);
  return { id, index: Math.max(0, index) };
}

function nearestActiveSeam(view) {
  const p = view.now.prospector || view.now.hero;
  return (view.now.seams || [])
    .filter(s => s.active && s.remaining > 0 && Number.isFinite(s.x) && Number.isFinite(s.z))
    .sort((a, b) =>
      Math.hypot(a.x - p.x, a.z - p.z) -
      Math.hypot(b.x - p.x, b.z - p.z)
    )[0];
}

function bestUpgrade(offer) {
  const priorities = [
    /blast.*(damage|radius|cooldown)/i,
    /(damage|radius|cooldown).*blast/i,
    /(health|healing|second wind|armor|armour)/i,
    /(gold|pan|sluice|income|capacity)/i,
    /rig.*damage/i
  ];
  for (const pattern of priorities) {
    const found = offer.find(x =>
      pattern.test(`${x.id} ${x.name || ""} ${x.effectText || ""}`)
    );
    if (found) return found;
  }
  return offer[0];
}

export default function controller(view) {
  if (!view || view.schema !== "goldrush.view.v1") {
    return [{ verb: "HOLD", pos: { x: 0, z: 11 } }];
  }

  const now = view.now;

  if (now.pendingOffer?.length) {
    return [{ verb: "PICK_UPGRADE", id: bestUpgrade(now.pendingOffer).id }];
  }

  if (now.pendingSecure) {
    return [{ verb: "SECURE_CHOICE", choice: "bank" }];
  }

  const entries = now.works?.entries || [];
  const orders = [];

  const tierPriority = ["sluice", "turret", "sentry_beacon"];
  for (const kind of tierPriority) {
    const candidate = liveEntries(view, kind)
      .filter(e => tierOf(e) < 3)
      .sort((a, b) => tierOf(a) - tierOf(b))[0];

    if (candidate) {
      const cost = upgradeCost(candidate, kind);
      if (now.gold >= cost) {
        const pos = posOf(candidate);
        orders.push({ verb: "MOVE_TO", pos });
        orders.push({
          verb: "CONTEXT_ACTION",
          action: "upgrade",
          target: targetOf(candidate, entries)
        });
        orders.push({ verb: "SET_WEAPON", weapon: "rig" });
        return orders;
      }
    }
  }

  const desiredCounts = {
    sluice: 3,
    stockpile: 2,
    sentry_beacon: 6,
    turret: 4,
    palisade: now.wave >= 18 ? 3 : 0
  };

  let nextBuild = null;
  for (const [kind, x, z] of buildPlan) {
    if (liveEntries(view, kind).length >= desiredCounts[kind]) continue;

    const ordinal = buildPlan
      .slice(0, buildPlan.indexOf(buildPlan.find(p => p === buildPlan.find(q => q[0] === kind && q[1] === x && q[2] === z))) + 1)
      .filter(p => p[0] === kind).length;

    if (liveEntries(view, kind).length < ordinal) {
      nextBuild = { kind, x, z, cost: buildCost(view, kind) };
      break;
    }
  }

  if (nextBuild) {
    if (now.gold < nextBuild.cost) {
      const seam = nearestActiveSeam(view);
      if (seam) orders.push({ verb: "HARVEST", seam: seam.id });
    }

    orders.push({ verb: "MOVE_TO", pos: { x: nextBuild.x, z: nextBuild.z } });
    orders.push({
      verb: "BUILD",
      what: nextBuild.kind,
      where: { x: nextBuild.x, z: nextBuild.z },
      when: { goldGte: nextBuild.cost }
    });
  } else if (now.wave >= 19 && (now.works?.wrecked > 0 || entries.some(e =>
    e.hp !== undefined && e.maxHp && e.hp / e.maxHp < 0.7
  ))) {
    orders.push({ verb: "REPAIR_UNDER", pct: 70 });
  }

  if (
    now.threats?.alive > 0 &&
    now.blastReadyInMs === 0 &&
    Math.hypot((now.hero?.x || 0), (now.hero?.z || 12) - 11) <= 10
  ) {
    orders.unshift({ verb: "BLAST_AT", pos: { x: 0, z: 11 } });
  }

  orders.push({ verb: "SET_WEAPON", weapon: "rig" });

  return orders.slice(0, 32);
}
