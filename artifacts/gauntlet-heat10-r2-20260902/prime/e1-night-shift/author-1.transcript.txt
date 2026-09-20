// SCORED: yes
export default function controller(view) {
  if (!view || view.schema !== "goldrush.view.v1") return [];

  const now = view.now || {};
  const mechanics = view.stablePrefix?.mechanics || {};
  const available = new Set((mechanics.buildables || []).map((item) => item.id));

  if (now.pendingOffer?.length) {
    const score = (offer) => {
      const text = `${offer.id} ${offer.name} ${offer.effectText}`.toLowerCase();
      let value = 0;
      if (/blast|charge|explosion|radius|cooldown/.test(text)) value += 100;
      if (/health|heal|armor|damage reduction|survival|revive/.test(text)) value += 80;
      if (/damage|critical|attack/.test(text)) value += 60;
      if (/gold|harvest|pan|seam|respawn/.test(text)) value += 35;
      if (/spark|rig/.test(text)) value += 10;
      return value;
    };

    const choice = [...now.pendingOffer].sort((a, b) => score(b) - score(a))[0];
    return [{ verb: "PICK_UPGRADE", id: choice.id }];
  }

  if (now.pendingSecure) {
    return [{ verb: "SECURE_CHOICE", choice: "bank" }];
  }

  const orders = [{ verb: "SET_WEAPON", weapon: "blast" }];
  const byKind = now.works?.byKind || {};
  const standingEntries = (now.works?.entries || []).filter((entry) => !entry.wrecked);

  const standingCount = (kind) =>
    standingEntries.filter((entry) => entry.id === kind).length;

  const targets = {
    turret: [
      { x: -3.5, z: 10 },
      { x: 3.5, z: 10 },
      { x: -3.5, z: 14 },
      { x: 3.5, z: 14 }
    ],
    sentry_beacon: [
      { x: 0, z: 7 },
      { x: -7, z: 12 },
      { x: 7, z: 12 },
      { x: 0, z: 20 }
    ],
    palisade: [
      { x: -5.5, z: 8 },
      { x: 0, z: 7.5 },
      { x: 5.5, z: 8 },
      { x: -7, z: 12 },
      { x: 7, z: 12 },
      { x: -5.5, z: 16 },
      { x: 5.5, z: 16 },
      { x: 0, z: 18 }
    ],
    lantern_post: [
      { x: 0, z: 5 },
      { x: -9, z: 12 },
      { x: 9, z: 12 }
    ]
  };

  const costs = {};
  for (const item of mechanics.buildables || []) {
    costs[item.id] = item.costs || [item.cost || 0];
  }

  const addNextBuild = (kind, desired) => {
    if (!available.has(kind)) return;
    const count = standingCount(kind);
    if (count >= desired || count >= targets[kind].length) return;
    const curve = costs[kind] || [0];
    const price = curve[Math.min(count, curve.length - 1)];
    orders.push({
      verb: "BUILD",
      what: kind,
      where: targets[kind][count],
      when: { goldGte: price }
    });
  };

  addNextBuild("sentry_beacon", 1);
  addNextBuild("palisade", 4);
  addNextBuild("turret", 1);
  addNextBuild("palisade", 8);
  addNextBuild("turret", 4);
  addNextBuild("sentry_beacon", 4);
  addNextBuild("lantern_post", 3);

  if ((now.wave || 0) >= 3 && (now.gold || 0) >= 5) {
    orders.push({ verb: "REPAIR_UNDER", pct: 55 });
  }

  const prospector = now.prospector || now.hero || { x: 0, z: 12 };
  const seams = (now.seams || [])
    .filter((seam) => seam.active && seam.remaining > 0 && Number.isFinite(seam.x) && Number.isFinite(seam.z))
    .sort((a, b) => {
      const da = (a.x - prospector.x) ** 2 + (a.z - prospector.z) ** 2;
      const db = (b.x - prospector.x) ** 2 + (b.z - prospector.z) ** 2;
      return da - db;
    });

  for (const seam of seams) {
    orders.push({ verb: "HARVEST", seam: seam.id });
  }

  const threats = now.threats || {};
  if ((threats.alive || 0) >= 8) {
    orders.push({ verb: "FALLBACK_IF", threat: { enemiesGte: 8 }, pos: { x: 0, z: 12 } });
  }

  orders.push({ verb: "HOLD", pos: { x: 0, z: 12 } });
  return orders.slice(0, 32);
}
