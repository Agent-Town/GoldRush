// SCORED: yes

const fortPlan = [
  ["turret", { x: 0, z: 12 }],
  ["sentry_beacon", { x: 0, z: 9 }],
  ["turret", { x: -4, z: 12 }],
  ["sentry_beacon", { x: -6, z: 12 }],
  ["turret", { x: 4, z: 12 }],
  ["sentry_beacon", { x: 6, z: 12 }],
  ["turret", { x: 0, z: 16 }],
  ["sentry_beacon", { x: 0, z: 17 }],
  ["sentry_beacon", { x: -5, z: 17 }],
  ["sentry_beacon", { x: 5, z: 17 }]
];

const costs = {
  turret: [50, 70, 95, 125],
  sentry_beacon: [25, 35, 45, 55, 75, 95]
};

function worksEntries(view) {
  return view.now.works?.entries || [];
}

function countKind(view, kind) {
  const list = worksEntries(view);
  if (list.length) {
    return list.filter(entry =>
      entry.id === kind ||
      entry.kind === kind ||
      entry.buildingId === kind
    ).length;
  }
  return view.now.works?.byKind?.[kind] || 0;
}

function chooseUpgrade(view) {
  const offer = view.now.pendingOffer || [];

  return offer
    .map((card, index) => {
      const text =
        `${card.id} ${card.name || ""} ${card.effectText || ""}`.toLowerCase();
      let score = -index * 0.01;

      if (/revive|second wind|fatal|death/.test(text)) score += 180;
      if (/split spark|\+1 spark|spark per volley/.test(text)) score += 170;
      if (/fire rate|double.?tap|attack speed|faster.*rig/.test(text)) score += 155;
      if (/spark damage|heavy spark|rig damage|damage.*spark/.test(text)) score += 150;
      if (/critical|crit chance|crit damage/.test(text)) score += 125;
      if (/heal|regener|life steal|recovery/.test(text)) score += 115;
      if (/damage reduction|armor|resist/.test(text)) score += 100;
      if (/max hp|maximum health|hero health|vital/.test(text)) score += 85;
      if (/move speed|movement|sprint/.test(text)) score += 35;
      if (/gold|pan|harvest|seam|capacity/.test(text)) score += 25;
      if (/blast/.test(text)) score += 15;
      if (/works health|building health|repair|plating/.test(text)) score -= 20;

      return { id: card.id, score };
    })
    .sort((a, b) => b.score - a.score)[0].id;
}

function nextBuild(view) {
  const existing = {
    turret: countKind(view, "turret"),
    sentry_beacon: countKind(view, "sentry_beacon")
  };

  const seen = {
    turret: 0,
    sentry_beacon: 0
  };

  for (const [kind, where] of fortPlan) {
    const index = seen[kind]++;
    if (index < existing[kind]) continue;

    const price = costs[kind][index];
    if ((view.now.gold || 0) >= price) {
      return {
        verb: "BUILD",
        what: kind,
        where,
        when: { goldGte: price }
      };
    }

    return null;
  }

  return null;
}

export default function controller(view) {
  if (!view || view.schema !== "goldrush.view.v1" || !view.now) {
    return [
      { verb: "SET_WEAPON", weapon: "rig" },
      { verb: "HOLD", pos: { x: 0, z: 12 } }
    ];
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

  const orders = [
    { verb: "SET_WEAPON", weapon: "rig" }
  ];

  const build = nextBuild(view);
  if (build) orders.push(build);

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

  for (const seam of seams.slice(0, 4)) {
    orders.push({ verb: "HARVEST", seam: seam.id });
  }

  orders.push({
    verb: "FALLBACK_IF",
    threat: { enemiesGte: 4 },
    pos: { x: 0, z: 12 }
  });

  orders.push({
    verb: "HOLD",
    pos: { x: 0, z: 12 }
  });

  return orders.slice(0, 32);
}
