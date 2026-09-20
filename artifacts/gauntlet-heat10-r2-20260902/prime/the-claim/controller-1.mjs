// SCORED: yes

const turretSites = [
  { x: 0, z: 9 },
  { x: -4.5, z: 12 },
  { x: 4.5, z: 12 },
  { x: 0, z: 16 }
];

const beaconSites = [
  { x: -7.5, z: 12 },
  { x: 7.5, z: 12 },
  { x: 0, z: 5 },
  { x: 0, z: 20 },
  { x: -6, z: 7 },
  { x: 6, z: 7 }
];

const palisadeSites = [
  { x: -3, z: 6 },
  { x: 0, z: 6 },
  { x: 3, z: 6 },
  { x: -6, z: 8.5 },
  { x: 6, z: 8.5 },
  { x: -7, z: 12 },
  { x: 7, z: 12 },
  { x: -6, z: 15.5 },
  { x: 6, z: 15.5 },
  { x: -3, z: 18 },
  { x: 0, z: 18 },
  { x: 3, z: 18 }
];

function chooseUpgrade(offer) {
  const ranked = offer.map((card, index) => {
    const text = `${card.id} ${card.name || ""} ${card.effectText || ""}`.toLowerCase();
    let score = -index * 0.01;

    if (/revive|second wind|fatal|death/.test(text)) score += 120;
    if (/heal|health|hp|max hp|vital/.test(text)) score += 95;
    if (/blast.*damage|damage.*blast/.test(text)) score += 90;
    if (/blast.*radius|radius.*blast|explosion/.test(text)) score += 82;
    if (/blast.*cooldown|cooldown.*blast|charge rate/.test(text)) score += 78;
    if (/damage|power|critical/.test(text)) score += 60;
    if (/speed|move|sprint/.test(text)) score += 35;
    if (/gold|pan|harvest|seam|capacity/.test(text)) score += 28;
    if (/repair|works health|building health/.test(text)) score += 22;
    if (/spark|rig/.test(text)) score -= 20;

    return { id: card.id, score };
  });

  ranked.sort((a, b) => b.score - a.score);
  return ranked[0].id;
}

function countKind(view, kind) {
  const byKind = view.now.works && view.now.works.byKind;
  if (byKind && typeof byKind[kind] === "number") return byKind[kind];

  const entries = (view.now.works && view.now.works.entries) || [];
  return entries.filter(entry =>
    entry.id === kind || entry.kind === kind || entry.buildingId === kind
  ).length;
}

function buildRemaining(orders, view, kind, sites, costs) {
  const present = Math.min(countKind(view, kind), sites.length);

  for (let i = present; i < sites.length && orders.length < 28; i++) {
    orders.push({
      verb: "BUILD",
      what: kind,
      where: sites[i],
      when: { goldGte: costs[Math.min(i, costs.length - 1)] }
    });
  }
}

export default function controller(view) {
  if (!view || view.schema !== "goldrush.view.v1" || !view.now) {
    return [{ verb: "HOLD", pos: { x: 0, z: 12 } }];
  }

  if (view.now.pendingOffer && view.now.pendingOffer.length) {
    return [{
      verb: "PICK_UPGRADE",
      id: chooseUpgrade(view.now.pendingOffer)
    }];
  }

  if (view.now.pendingSecure) {
    return [{ verb: "SECURE_CHOICE", choice: "bank" }];
  }

  const orders = [{ verb: "SET_WEAPON", weapon: "blast" }];

  buildRemaining(orders, view, "turret", turretSites, [50, 70, 95, 125]);
  buildRemaining(orders, view, "sentry_beacon", beaconSites, [25, 35, 45, 55, 75, 95]);
  buildRemaining(orders, view, "palisade", palisadeSites, Array(12).fill(10));

  const prospector = view.now.prospector || view.now.hero || { x: 0, z: 12 };
  const seams = (view.now.seams || [])
    .filter(seam =>
      seam.active &&
      seam.remaining > 0 &&
      Number.isFinite(seam.x) &&
      Number.isFinite(seam.z)
    )
    .sort((a, b) => {
      const da = (a.x - prospector.x) ** 2 + (a.z - prospector.z) ** 2;
      const db = (b.x - prospector.x) ** 2 + (b.z - prospector.z) ** 2;
      return da - db;
    });

  for (const seam of seams) {
    if (orders.length >= 29) break;
    orders.push({ verb: "HARVEST", seam: seam.id });
  }

  if (orders.length < 31) {
    orders.push({ verb: "REPAIR_UNDER", pct: 65 });
  }

  orders.push({
    verb: "FALLBACK_IF",
    threat: { enemiesGte: 10 },
    pos: { x: 0, z: 12 }
  });

  if (orders.length < 32) {
    orders.push({ verb: "HOLD", pos: { x: 0, z: 12 } });
  }

  return orders.slice(0, 32);
}
