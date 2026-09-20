// SCORED: yes

const plan = [
  ["palisade", { x: -6, z: 9 }],
  ["palisade", { x: 6, z: 9 }],
  ["palisade", { x: -7, z: 12 }],
  ["palisade", { x: 7, z: 12 }],
  ["sentry_beacon", { x: 0, z: 9 }],
  ["turret", { x: 0, z: 12 }],
  ["palisade", { x: -6, z: 15 }],
  ["palisade", { x: 6, z: 15 }],
  ["palisade", { x: -3, z: 18 }],
  ["palisade", { x: 3, z: 18 }],
  ["sentry_beacon", { x: -7.5, z: 15.5 }],
  ["sentry_beacon", { x: 7.5, z: 15.5 }],
  ["turret", { x: -4, z: 12 }],
  ["turret", { x: 4, z: 12 }],
  ["sentry_beacon", { x: -7.5, z: 8.5 }],
  ["sentry_beacon", { x: 7.5, z: 8.5 }],
  ["turret", { x: 0, z: 16 }],
  ["sentry_beacon", { x: 0, z: 20 }]
];

const costs = {
  palisade: [10, 10, 10, 10, 10, 10, 10, 10],
  sentry_beacon: [25, 35, 45, 55, 75, 95],
  turret: [50, 70, 95, 125]
};

function entries(view) {
  return view.now.works?.entries || [];
}

function countKind(view, kind) {
  const list = entries(view);
  if (list.length) {
    return list.filter(e =>
      e.id === kind ||
      e.kind === kind ||
      e.buildingId === kind
    ).length;
  }
  return view.now.works?.byKind?.[kind] || 0;
}

function chooseUpgrade(view) {
  const wave = view.now.wave || 0;
  const offer = view.now.pendingOffer || [];

  return offer
    .map((card, index) => {
      const text =
        `${card.id} ${card.name || ""} ${card.effectText || ""}`.toLowerCase();
      let score = -index * 0.01;

      if (/revive|second wind|fatal|death/.test(text)) score += 160;
      if (/heal|health|hp|max hp|vital|armor|damage reduction/.test(text)) {
        score += 135;
      }

      if (wave < 4) {
        if (/split spark|\+1 spark|spark per volley/.test(text)) score += 125;
        if (/fire rate|double.tap|attack speed/.test(text)) score += 115;
        if (/spark damage|heavy spark|\bspark\b|\brig\b/.test(text)) score += 105;
        if (/blast/.test(text)) score += 25;
      } else {
        if (/blast.*damage|damage.*blast/.test(text)) score += 125;
        if (/blast.*radius|radius.*blast|explosion/.test(text)) score += 115;
        if (/blast.*cooldown|cooldown.*blast|charge rate/.test(text)) score += 110;
        if (/fire rate|spark damage|split spark|\bspark\b|\brig\b/.test(text)) {
          score += 70;
        }
      }

      if (/damage|power|critical/.test(text)) score += 55;
      if (/speed|move|sprint/.test(text)) score += 35;
      if (/gold|pan|harvest|seam|capacity/.test(text)) score += 25;
      if (/repair|works health|building health/.test(text)) score += 20;

      return { id: card.id, score };
    })
    .sort((a, b) => b.score - a.score)[0].id;
}

export default function controller(view) {
  if (!view || view.schema !== "goldrush.view.v1" || !view.now) {
    return [{ verb: "HOLD", pos: { x: 0, z: 12 } }];
  }

  if (view.now.pendingOffer?.length) {
    return [{
      verb: "PICK_UPGRADE",
      id: chooseUpgrade(view)
    }];
  }

  if (view.now.pendingSecure) {
    return [{ verb: "SECURE_CHOICE", choice: "bank" }];
  }

  const wave = view.now.wave || 0;
  const orders = [{
    verb: "SET_WEAPON",
    weapon: wave < 4 ? "rig" : "blast"
  }];

  if (view.now.works?.standing || view.now.works?.wrecked) {
    orders.push({ verb: "REPAIR_UNDER", pct: 70 });
  }

  const existing = {
    palisade: countKind(view, "palisade"),
    sentry_beacon: countKind(view, "sentry_beacon"),
    turret: countKind(view, "turret")
  };

  const seen = {
    palisade: 0,
    sentry_beacon: 0,
    turret: 0
  };

  for (const [kind, where] of plan) {
    const index = seen[kind]++;
    if (index < existing[kind]) continue;
    if (orders.length >= 27) break;

    const priceList = costs[kind];
    orders.push({
      verb: "BUILD",
      what: kind,
      where,
      when: {
        goldGte: priceList[Math.min(index, priceList.length - 1)]
      }
    });
  }

  const prospector = view.now.prospector || { x: 0, z: 12 };
  const seams = (view.now.seams || [])
    .filter(seam =>
      seam.active &&
      seam.remaining > 0 &&
      Number.isFinite(seam.x) &&
      Number.isFinite(seam.z)
    )
    .sort((a, b) => {
      const da =
        (a.x - prospector.x) ** 2 +
        (a.z - prospector.z) ** 2;
      const db =
        (b.x - prospector.x) ** 2 +
        (b.z - prospector.z) ** 2;
      return da - db;
    });

  for (const seam of seams) {
    if (orders.length >= 30) break;
    orders.push({ verb: "HARVEST", seam: seam.id });
  }

  orders.push({
    verb: "FALLBACK_IF",
    threat: { enemiesGte: 6 },
    pos: { x: 0, z: 12 }
  });

  if (orders.length < 32) {
    orders.push({ verb: "HOLD", pos: { x: 0, z: 12 } });
  }

  return orders.slice(0, 32);
}
