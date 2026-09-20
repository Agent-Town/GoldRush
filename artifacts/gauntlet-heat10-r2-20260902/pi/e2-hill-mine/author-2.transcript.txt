// SCORED: yes
const plan = [
  { what: "sentry_beacon", x: 0, z: 12, gold: 25 },
  { what: "turret", x: -6, z: 12, gold: 50 },
  { what: "turret", x: 6, z: 12, gold: 70 },
  { what: "palisade", x: 0, z: 18, gold: 10 },
  { what: "palisade", x: -5, z: 17, gold: 10 },
  { what: "palisade", x: 5, z: 17, gold: 10 },
  { what: "sentry_beacon", x: 0, z: 20, gold: 35 },
  { what: "turret", x: -8, z: 20, gold: 95 },
  { what: "turret", x: 8, z: 20, gold: 125 }
];

function positionOf(entry) {
  return entry.position ?? entry.pos ?? entry;
}

function exists(entries, item) {
  return entries.some(entry => {
    const pos = positionOf(entry);
    return Number.isFinite(pos.x) &&
      Number.isFinite(pos.z) &&
      Math.hypot(pos.x - item.x, pos.z - item.z) < 1.5;
  });
}

function chooseUpgrade(offer) {
  return offer
    .map((choice, index) => {
      const text =
        `${choice.id} ${choice.name ?? ""} ${choice.effectText ?? ""}`.toLowerCase();
      let score = -index;

      if (/blast.*(damage|radius|cooldown)|charge.*(damage|radius|cooldown)/.test(text)) score += 140;
      if (/health|maximum hp|max hp|armor|armour|damage reduction|tough|surviv/.test(text)) score += 120;
      if (/move|speed|spring/.test(text)) score += 80;
      if (/repair|works health|building health|structure|fortif|mend/.test(text)) score += 65;
      if (/pan|gold|harvest|seam/.test(text)) score += 50;
      if (/rig|spark|bolt/.test(text)) score += 10;

      return { choice, score };
    })
    .sort((a, b) => b.score - a.score)[0]?.choice;
}

export default function controller(view) {
  if (!view || view.schema !== "goldrush.view.v1") return [];

  const now = view.now ?? {};

  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
    const pick = chooseUpgrade(now.pendingOffer);
    return [{ verb: "PICK_UPGRADE", id: pick.id }];
  }

  if (now.pendingSecure) {
    return [{ verb: "SECURE_CHOICE", choice: "bank" }];
  }

  const entries = now.works?.entries ?? [];
  const orders = [{ verb: "SET_WEAPON", weapon: "blast" }];

  for (const item of plan) {
    if (!exists(entries, item)) {
      orders.push({
        verb: "BUILD",
        what: item.what,
        where: { x: item.x, z: item.z },
        when: { goldGte: item.gold }
      });
    }
  }

  orders.push({ verb: "REPAIR_UNDER", pct: 55 });

  const prospector = now.prospector ?? { x: 0, z: 12 };
  const seams = (now.seams ?? [])
    .filter(seam =>
      seam.active &&
      Number.isFinite(seam.x) &&
      Number.isFinite(seam.z) &&
      seam.remaining > 0
    )
    .sort((a, b) =>
      Math.hypot(a.x - prospector.x, a.z - prospector.z) -
      Math.hypot(b.x - prospector.x, b.z - prospector.z)
    );

  if (seams.length) {
    orders.push({ verb: "HARVEST", seam: seams[0].id });
  }

  orders.push({
    verb: "FALLBACK_IF",
    threat: { enemiesGte: 7 },
    pos: { x: 0, z: 12 }
  });
  orders.push({ verb: "HOLD", pos: { x: 0, z: 12 } });

  return orders.slice(0, 32);
}
