// SCORED: yes
export default function controller(view) {
  if (!view || view.schema !== "goldrush.view.v1") return [];

  const now = view.now || {};
  const wave = Number(now.wave || 0);

  if (now.pendingOffer?.length) {
    const score = (offer) => {
      const text = `${offer.id} ${offer.name} ${offer.effectText}`.toLowerCase();
      let value = 0;

      if (/tinker|plating|max hp|maximum health|heals|healing|second wind|revive/.test(text)) value += 500;
      if (/damage reduction|armor|resist|health/.test(text)) value += 420;
      if (/blast damage|charge damage|explosion damage/.test(text)) value += 390;
      if (/cooldown|quick fuse|faster blast/.test(text)) value += 370;
      if (/wide ring|blast radius|explosion radius/.test(text)) value += 340;
      if (/blast|explosion|charge|fuse/.test(text)) value += 300;
      if (/double.tap|fire rate|heavy spark|spark damage|split spark/.test(text)) value += 190;
      if (/range|resonator|bolt speed/.test(text)) value += 140;
      if (/prospector.s luck|\+10 gold|seam respawn/.test(text)) value += 120;
      if (/move speed|spring heels/.test(text)) value += 90;
      if (/faster panning|pan like/.test(text)) value += 60;

      return value;
    };

    const choice = [...now.pendingOffer]
      .sort((a, b) => score(b) - score(a))[0];

    return [{ verb: "PICK_UPGRADE", id: choice.id }];
  }

  if (now.pendingSecure) {
    return [{ verb: "SECURE_CHOICE", choice: "bank" }];
  }

  const mechanics = view.stablePrefix?.mechanics || {};
  const buildables = mechanics.buildables || [];
  const available = new Set(buildables.map((item) => item.id));
  const entries = now.works?.entries || [];

  const totalCount = (kind) =>
    entries.filter((entry) => entry.id === kind).length;

  const priceFor = (kind, index) => {
    const item = buildables.find((entry) => entry.id === kind);
    if (!item) return 1000000;
    const costs = item.costs || [item.cost || 0];
    return costs[Math.min(index, costs.length - 1)];
  };

  const plans = {
    turret: [
      { x: -3.5, z: 10.5 },
      { x: 3.5, z: 10.5 },
      { x: -3.5, z: 14.5 },
      { x: 3.5, z: 14.5 }
    ],
    palisade: [
      { x: -5.5, z: 8 },
      { x: 0, z: 8 },
      { x: 5.5, z: 8 },
      { x: -7, z: 12 },
      { x: 7, z: 12 },
      { x: -5.5, z: 16 },
      { x: 5.5, z: 16 },
      { x: 0, z: 18 },
      { x: -9, z: 9 },
      { x: 9, z: 9 },
      { x: -9, z: 15 },
      { x: 9, z: 15 }
    ]
  };

  const orders = [{ verb: "SET_WEAPON", weapon: "blast" }];

  const addNext = (kind, desired) => {
    if (!available.has(kind)) return;
    const index = totalCount(kind);
    if (index >= desired || index >= plans[kind].length) return;

    orders.push({
      verb: "BUILD",
      what: kind,
      where: plans[kind][index],
      when: { goldGte: priceFor(kind, index) }
    });
  };

  const turrets = totalCount("turret");
  const walls = totalCount("palisade");

  if (turrets < 1) {
    addNext("turret", 1);
  } else if (walls < 4) {
    addNext("palisade", 4);
  } else if (turrets < 2) {
    addNext("turret", 2);
  } else if (walls < 8) {
    addNext("palisade", 8);
  } else if (turrets < 4) {
    addNext("turret", 4);
  } else {
    addNext("palisade", 12);
  }

  const prospector = now.prospector || { x: 0, z: 12 };
  const seams = (now.seams || [])
    .filter((seam) =>
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
    orders.push({ verb: "HARVEST", seam: seam.id });
  }

  if (wave >= 2 && entries.some((entry) => entry.id !== "lantern_post")) {
    orders.push({ verb: "REPAIR_UNDER", pct: wave < 8 ? 55 : 75 });
  }

  orders.push({
    verb: "FALLBACK_IF",
    threat: { enemiesGte: 4 },
    pos: { x: 0, z: 12 }
  });

  orders.push({ verb: "HOLD", pos: { x: 0, z: 12 } });

  return orders.slice(0, 32);
}
