// SCORED: yes
export default function controller(view) {
  if (!view || view.schema !== "goldrush.view.v1") return [];

  const now = view.now || {};
  const wave = Number(now.wave || 0);

  if (now.pendingOffer?.length) {
    const score = (offer) => {
      const text = `${offer.id} ${offer.name} ${offer.effectText}`.toLowerCase();
      let value = 0;

      if (/health|heal|healing|armor|damage reduction|resist|revive|second wind/.test(text)) value += 300;
      if (/max hp|maximum health|vital/.test(text)) value += 280;

      if (wave < 4) {
        if (/split spark|\+1 spark|extra spark/.test(text)) value += 230;
        if (/fire rate|double.tap|heavy spark|spark damage/.test(text)) value += 210;
        if (/range|resonator|bolt speed/.test(text)) value += 150;
        if (/blast|fuse|explosion|radius|charge/.test(text)) value += 70;
      } else {
        if (/blast damage|charge damage|explosion damage/.test(text)) value += 240;
        if (/cooldown|quick fuse|faster blast/.test(text)) value += 220;
        if (/blast|explosion|radius|wide ring|charge/.test(text)) value += 200;
        if (/split spark|fire rate|heavy spark|spark damage/.test(text)) value += 90;
      }

      if (/prospector.s luck|\+10 gold|seam respawn/.test(text)) value += 100;
      if (/faster panning|pan like/.test(text)) value += 75;
      if (/gold|harvest|pan|seam|economy/.test(text)) value += 40;

      return value;
    };

    const choice = [...now.pendingOffer].sort((a, b) => score(b) - score(a))[0];
    return [{ verb: "PICK_UPGRADE", id: choice.id }];
  }

  if (now.pendingSecure) {
    return [{ verb: "SECURE_CHOICE", choice: "bank" }];
  }

  const mechanics = view.stablePrefix?.mechanics || {};
  const available = new Set((mechanics.buildables || []).map((item) => item.id));
  const entries = now.works?.entries || [];
  const standing = entries.filter((entry) => !entry.wrecked);

  const count = (kind) => standing.filter((entry) => entry.id === kind).length;

  const plans = {
    palisade: [
      { x: -5.5, z: 8 },
      { x: 0, z: 7.5 },
      { x: 5.5, z: 8 },
      { x: -7, z: 12 },
      { x: 7, z: 12 },
      { x: -5.5, z: 16 },
      { x: 5.5, z: 16 },
      { x: 0, z: 18 },
      { x: -8, z: 9 },
      { x: 8, z: 9 },
      { x: -8, z: 15 },
      { x: 8, z: 15 }
    ],
    sentry_beacon: [
      { x: 0, z: 5.5 },
      { x: -8.5, z: 12 },
      { x: 8.5, z: 12 },
      { x: 0, z: 20 }
    ],
    turret: [
      { x: -3.5, z: 10.5 },
      { x: 3.5, z: 10.5 },
      { x: -3.5, z: 14.5 },
      { x: 3.5, z: 14.5 }
    ]
  };

  const priceFor = (kind, index) => {
    const item = (mechanics.buildables || []).find((entry) => entry.id === kind);
    if (!item) return 1000000;
    const curve = item.costs || [item.cost || 0];
    return curve[Math.min(index, curve.length - 1)];
  };

  const orders = [
    { verb: "SET_WEAPON", weapon: wave < 4 ? "rig" : "blast" }
  ];

  const addNext = (kind, desired) => {
    if (!available.has(kind)) return;
    const index = count(kind);
    if (index >= desired || index >= plans[kind].length) return;

    orders.push({
      verb: "BUILD",
      what: kind,
      where: plans[kind][index],
      when: { goldGte: priceFor(kind, index) }
    });
  };

  addNext("palisade", wave < 4 ? 6 : 12);
  addNext("sentry_beacon", wave < 3 ? 1 : 4);
  addNext("turret", wave < 2 ? 1 : 4);

  const prospector = now.prospector || { x: 0, z: 12 };
  const seams = (now.seams || [])
    .filter((seam) =>
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
    orders.push({ verb: "HARVEST", seam: seam.id });
  }

  orders.push({
    verb: "FALLBACK_IF",
    threat: { enemiesGte: wave < 4 ? 5 : 8 },
    pos: { x: 0, z: 12 }
  });

  orders.push({ verb: "HOLD", pos: { x: 0, z: 12 } });
  return orders.slice(0, 32);
}
