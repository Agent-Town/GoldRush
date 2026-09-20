// SCORED: yes

let seamCursor = 0;

export default function controller(view) {
  if (!view || view.schema !== "goldrush.view.v1") return [];

  const now = view.now || {};

  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length > 0) {
    const ranked = [...now.pendingOffer].sort(
      (a, b) => upgradeScore(b) - upgradeScore(a)
    );
    return [{ verb: "PICK_UPGRADE", id: ranked[0].id }];
  }

  if (now.pendingSecure) {
    return [{ verb: "SECURE_CHOICE", choice: "bank" }];
  }

  const orders = [
    { verb: "SET_WEAPON", weapon: "blast" },
    {
      verb: "FALLBACK_IF",
      threat: { enemiesGte: 1 },
      pos: { x: 0, z: 12 }
    }
  ];

  if ((now.works?.standing || 0) > 0 || (now.works?.wrecked || 0) > 0) {
    orders.push({ verb: "REPAIR_UNDER", pct: 48 });
  }

  const entries = Array.isArray(now.works?.entries) ? now.works.entries : [];
  const existing = new Map();

  for (const entry of entries) {
    const id = entry.id || entry.kind || entry.buildable;
    if (id) existing.set(id, (existing.get(id) || 0) + 1);
  }

  const plan = [
    { what: "palisade", where: { x: -5, z: 10 }, cost: 10 },
    { what: "palisade", where: { x: 5, z: 10 }, cost: 10 },
    { what: "palisade", where: { x: 0, z: 7 }, cost: 10 },
    { what: "palisade", where: { x: -8, z: 7 }, cost: 10 },
    { what: "palisade", where: { x: 8, z: 7 }, cost: 10 },
    { what: "sentry_beacon", where: { x: 0, z: 15 }, cost: 25 },
    { what: "turret", where: { x: -6, z: 14 }, cost: 50 },
    { what: "turret", where: { x: 6, z: 14 }, cost: 70 },
    { what: "turret", where: { x: -11, z: 7 }, cost: 95 },
    { what: "turret", where: { x: 11, z: 7 }, cost: 125 },
    { what: "sentry_beacon", where: { x: -13, z: 7 }, cost: 35 },
    { what: "sentry_beacon", where: { x: 13, z: 7 }, cost: 45 }
  ];

  const seen = new Map();
  const missing = [];

  for (const item of plan) {
    const ordinal = seen.get(item.what) || 0;
    seen.set(item.what, ordinal + 1);
    if ((existing.get(item.what) || 0) <= ordinal) missing.push(item);
  }

  const seams = (now.seams || [])
    .filter(s => s.active && s.x != null && s.z != null && s.remaining > 0)
    .sort((a, b) => {
      const px = now.prospector?.x ?? 0;
      const pz = now.prospector?.z ?? 12;
      const da = (a.x - px) ** 2 + (a.z - pz) ** 2;
      const db = (b.x - px) ** 2 + (b.z - pz) ** 2;
      return da - db;
    });

  if (seams.length > 1) {
    const shift = seamCursor++ % seams.length;
    seams.push(...seams.splice(0, shift));
  }

  let projectedGold = Number(now.gold) || 0;
  let buildIndex = 0;

  for (const seam of seams) {
    if (orders.length >= 31) break;

    orders.push({ verb: "HARVEST", seam: seam.id });
    projectedGold += Math.max(0, Number(seam.remaining) || 0);

    while (
      buildIndex < missing.length &&
      projectedGold >= missing[buildIndex].cost &&
      orders.length < 32
    ) {
      const item = missing[buildIndex++];
      orders.push({
        verb: "BUILD",
        what: item.what,
        where: item.where,
        when: { goldGte: item.cost }
      });
      projectedGold -= item.cost;
    }
  }

  while (
    buildIndex < missing.length &&
    projectedGold >= missing[buildIndex].cost &&
    orders.length < 32
  ) {
    const item = missing[buildIndex++];
    orders.push({
      verb: "BUILD",
      what: item.what,
      where: item.where,
      when: { goldGte: item.cost }
    });
    projectedGold -= item.cost;
  }

  if (orders.length === 3 && seams.length === 0 && missing.length === 0) {
    orders.push({ verb: "HOLD", pos: { x: 0, z: 12 } });
  }

  return orders.slice(0, 32);
}

function upgradeScore(option) {
  const text = `${option.id || ""} ${option.name || ""} ${option.effectText || ""}`
    .toLowerCase();

  let score = 0;

  if (/max hp|maximum health|health cap|tough|vital|tank/.test(text)) score += 120;
  if (/heal|healing|regener|restore|recovery/.test(text)) score += 110;
  if (/armor|armour|damage reduction|resist|shield/.test(text)) score += 105;
  if (/blast.*damage|damage.*blast|blast radius|blast charge/.test(text)) score += 90;
  if (/cooldown|charge rate|reload/.test(text) && /blast/.test(text)) score += 85;
  if (/move|speed|sprint/.test(text)) score += 55;
  if (/gold|pan|harvest|seam|capacity/.test(text)) score += 45;
  if (/repair|works health|building health/.test(text)) score += 40;
  if (/spark|rig/.test(text)) score += 10;

  return score;
}
