// SCORED: yes

export default function controller(view) {
  if (!view || view.schema !== "goldrush.view.v1") return [];

  const now = view.now || {};

  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
    const choice = [...now.pendingOffer].sort(
      (a, b) => upgradeScore(b) - upgradeScore(a)
    )[0];
    return [{ verb: "PICK_UPGRADE", id: choice.id }];
  }

  if (now.pendingSecure) {
    return [{ verb: "SECURE_CHOICE", choice: "bank" }];
  }

  const orders = [{ verb: "SET_WEAPON", weapon: "blast" }];
  const entries = Array.isArray(now.works?.entries) ? now.works.entries : [];

  const damaged = entries.some(entry =>
    entry.wrecked || Number(entry.hp) < Number(entry.maxHp) * 0.7
  );

  if (damaged) {
    orders.push({ verb: "REPAIR_UNDER", pct: 75 });
  }

  const plan = [
    { what: "turret", where: { x: -6, z: 14 }, cost: 50 },
    { what: "palisade", where: { x: -5, z: 10 }, cost: 10 },
    { what: "palisade", where: { x: 0, z: 8 }, cost: 10 },
    { what: "turret", where: { x: 6, z: 14 }, cost: 70 },
    { what: "palisade", where: { x: 5, z: 10 }, cost: 10 },
    { what: "palisade", where: { x: -8, z: 8 }, cost: 10 },
    { what: "palisade", where: { x: 8, z: 8 }, cost: 10 },
    { what: "turret", where: { x: -10, z: 14 }, cost: 95 },
    { what: "palisade", where: { x: -10, z: 9 }, cost: 10 },
    { what: "palisade", where: { x: 10, z: 9 }, cost: 10 },
    { what: "turret", where: { x: 10, z: 14 }, cost: 125 }
  ];

  const counts = new Map();
  for (const entry of entries) {
    const id = entry.id || entry.kind || entry.buildable;
    if (id) counts.set(id, (counts.get(id) || 0) + 1);
  }

  const ordinal = new Map();
  let target = null;

  for (const item of plan) {
    const index = ordinal.get(item.what) || 0;
    ordinal.set(item.what, index + 1);

    if ((counts.get(item.what) || 0) <= index) {
      target = item;
      break;
    }
  }

  let projectedGold = Math.max(0, Number(now.gold) || 0);
  const seams = (Array.isArray(now.seams) ? now.seams : [])
    .filter(seam =>
      seam.active &&
      seam.x != null &&
      seam.z != null &&
      Number(seam.remaining) > 0
    )
    .sort((a, b) => {
      const px = Number(now.prospector?.x) || 0;
      const pz = Number(now.prospector?.z) || 12;
      const da = (Number(a.x) - px) ** 2 + (Number(a.z) - pz) ** 2;
      const db = (Number(b.x) - px) ** 2 + (Number(b.z) - pz) ** 2;
      return da - db;
    });

  if (target) {
    const uses = new Map();

    while (projectedGold < target.cost && orders.length < 30) {
      const seam = seams.find(candidate => {
        const used = uses.get(candidate.id) || 0;
        return used * 5 < Number(candidate.remaining);
      });

      if (!seam) break;

      orders.push({ verb: "HARVEST", seam: seam.id });
      uses.set(seam.id, (uses.get(seam.id) || 0) + 1);
      projectedGold += 5;

      seams.sort((a, b) =>
        (uses.get(a.id) || 0) - (uses.get(b.id) || 0)
      );
    }

    if (projectedGold >= target.cost && orders.length < 32) {
      orders.push({
        verb: "BUILD",
        what: target.what,
        where: target.where,
        when: { goldGte: target.cost }
      });
    }
  }

  if (!target && !damaged) {
    orders.push({ verb: "HOLD", pos: { x: 0, z: 12 } });
  }

  return orders.slice(0, 32);
}

function upgradeScore(option) {
  const text =
    `${option.id || ""} ${option.name || ""} ${option.effectText || ""}`
      .toLowerCase();

  let score = 0;

  if (/max hp|maximum health|health cap|plating|tough|vital|tank/.test(text)) {
    score += 220;
  }
  if (/heal|healing|regener|restore|recovery/.test(text)) score += 210;
  if (/armor|armour|damage reduction|resist|shield/.test(text)) score += 200;

  if (/blast.*damage|damage.*blast|powder charge/.test(text)) score += 185;
  if (/blast radius|wide ring/.test(text)) score += 175;
  if (/cooldown|reload|fire rate/.test(text) && /blast|charge/.test(text)) {
    score += 170;
  }

  if (/split spark|spark per volley/.test(text)) score += 135;
  if (/spark.*damage|damage.*spark|heavy spark/.test(text)) score += 125;
  if (/range|bolt speed|resonator/.test(text)) score += 110;
  if (/fire rate|double-tap/.test(text)) score += 105;

  if (/move|speed|sprint/.test(text)) score += 90;
  if (/pan like|faster panning/.test(text)) score += 75;
  if (/gold per seam|seam respawn|prospector's luck/.test(text)) score += 70;
  if (/gold|pan|harvest|seam|capacity/.test(text)) score += 55;
  if (/repair|works health|building health/.test(text)) score += 45;

  return score;
}
