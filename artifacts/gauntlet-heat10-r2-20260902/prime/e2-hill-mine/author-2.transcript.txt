// SCORED: yes

export default function controller(view) {
  if (!view || view.schema !== "goldrush.view.v1") return [];

  const now = view.now || {};

  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length > 0) {
    const choice = [...now.pendingOffer].sort(
      (a, b) => upgradeScore(b) - upgradeScore(a)
    )[0];
    return [{ verb: "PICK_UPGRADE", id: choice.id }];
  }

  if (now.pendingSecure) {
    return [{ verb: "SECURE_CHOICE", choice: "bank" }];
  }

  const orders = [{ verb: "SET_WEAPON", weapon: "rig" }];
  const entries = Array.isArray(now.works?.entries) ? now.works.entries : [];

  const plan = [
    { what: "turret", where: { x: -6, z: 14 }, cost: 50 },
    { what: "palisade", where: { x: -5, z: 10 }, cost: 10 },
    { what: "palisade", where: { x: 0, z: 8 }, cost: 10 },
    { what: "sentry_beacon", where: { x: 0, z: 15 }, cost: 25 },
    { what: "turret", where: { x: 6, z: 14 }, cost: 70 },
    { what: "palisade", where: { x: 5, z: 10 }, cost: 10 },
    { what: "palisade", where: { x: -8, z: 8 }, cost: 10 },
    { what: "palisade", where: { x: 8, z: 8 }, cost: 10 },
    { what: "turret", where: { x: -11, z: 18 }, cost: 95 },
    { what: "sentry_beacon", where: { x: -12, z: 16 }, cost: 35 },
    { what: "turret", where: { x: 11, z: 18 }, cost: 125 },
    { what: "sentry_beacon", where: { x: 12, z: 16 }, cost: 45 }
  ];

  const existing = new Map();
  for (const entry of entries) {
    if (entry.wrecked) continue;
    const id = entry.id || entry.kind || entry.buildable;
    if (id) existing.set(id, (existing.get(id) || 0) + 1);
  }

  const ordinal = new Map();
  const missing = [];

  for (const item of plan) {
    const index = ordinal.get(item.what) || 0;
    ordinal.set(item.what, index + 1);
    if ((existing.get(item.what) || 0) <= index) missing.push(item);
  }

  const px = Number(now.prospector?.x) || 0;
  const pz = Number(now.prospector?.z) || 12;
  const seams = (Array.isArray(now.seams) ? now.seams : [])
    .filter(
      seam =>
        seam.active &&
        seam.x != null &&
        seam.z != null &&
        Number(seam.remaining) > 0
    )
    .sort((a, b) => {
      const da = (a.x - px) ** 2 + (a.z - pz) ** 2;
      const db = (b.x - px) ** 2 + (b.z - pz) ** 2;
      return da - db;
    });

  let projectedGold = Math.max(0, Number(now.gold) || 0);
  const seamUses = new Map();

  function addHarvest() {
    const available = seams.filter(seam => {
      const used = seamUses.get(seam.id) || 0;
      return used * 5 < Number(seam.remaining);
    });

    if (available.length === 0 || orders.length >= 31) return false;

    available.sort((a, b) => {
      const au = seamUses.get(a.id) || 0;
      const bu = seamUses.get(b.id) || 0;
      if (au !== bu) return au - bu;

      const da = (a.x - px) ** 2 + (a.z - pz) ** 2;
      const db = (b.x - px) ** 2 + (b.z - pz) ** 2;
      return da - db;
    });

    const seam = available[0];
    orders.push({ verb: "HARVEST", seam: seam.id });
    seamUses.set(seam.id, (seamUses.get(seam.id) || 0) + 1);
    projectedGold += Math.min(5, Number(seam.remaining) || 5);
    return true;
  }

  for (const item of missing) {
    while (projectedGold < item.cost && orders.length < 31) {
      if (!addHarvest()) break;
    }

    if (projectedGold < item.cost || orders.length >= 32) break;

    orders.push({
      verb: "BUILD",
      what: item.what,
      where: item.where,
      when: { goldGte: item.cost }
    });
    projectedGold -= item.cost;
  }

  if (
    ((now.works?.standing || 0) >= 2 || (now.works?.wrecked || 0) > 0) &&
    orders.length < 32
  ) {
    orders.push({ verb: "REPAIR_UNDER", pct: 55 });
  }

  if (orders.length === 1) {
    orders.push({ verb: "HOLD", pos: { x: 0, z: 12 } });
  }

  return orders.slice(0, 32);
}

function upgradeScore(option) {
  const text = `${option.id || ""} ${option.name || ""} ${option.effectText || ""}`
    .toLowerCase();

  let score = 0;

  if (/max hp|maximum health|health cap|tough|vital|tank/.test(text)) score += 160;
  if (/heal|healing|regener|restore|recovery/.test(text)) score += 150;
  if (/armor|armour|damage reduction|resist|shield/.test(text)) score += 145;
  if (/spark.*damage|damage.*spark|rig.*damage|damage.*rig/.test(text)) score += 115;
  if (/attack speed|fire rate|cooldown|reload/.test(text) && /spark|rig/.test(text)) {
    score += 105;
  }
  if (/move|speed|sprint/.test(text)) score += 75;
  if (/gold|pan|harvest|seam|capacity/.test(text)) score += 65;
  if (/repair|works health|building health/.test(text)) score += 55;
  if (/blast/.test(text)) score += 10;

  return score;
}
