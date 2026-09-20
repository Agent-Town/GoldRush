// SCORED: yes

const sites = [
  { what: "sluice", x: -6, z: 1 },
  { what: "sluice", x: 0, z: 1 },
  { what: "sluice", x: 6, z: 1 },

  { what: "turret", x: -4, z: 11 },
  { what: "turret", x: 4, z: 11 },
  { what: "sentry_beacon", x: -7, z: 11 },
  { what: "sentry_beacon", x: 7, z: 11 },

  { what: "stockpile", x: -8, z: 16 },
  { what: "stockpile", x: 8, z: 16 },

  { what: "turret", x: -3, z: 15 },
  { what: "turret", x: 3, z: 15 },

  { what: "sentry_beacon", x: -5, z: 16 },
  { what: "sentry_beacon", x: 5, z: 16 },
  { what: "sentry_beacon", x: -5, z: 7 },
  { what: "sentry_beacon", x: 5, z: 7 },

  { what: "palisade", x: -3, z: 11, wave: 19 },
  { what: "palisade", x: 0, z: 11, wave: 19 },
  { what: "palisade", x: 3, z: 11, wave: 19 }
];

function works(view, id) {
  return (view.now.works?.entries || []).filter(entry => entry.id === id);
}

function tier(entry) {
  return Number(entry.tier ?? entry.level ?? entry.upgradeTier ?? 1);
}

function position(entry) {
  const candidates = [
    entry.pos,
    entry.position,
    entry.where,
    { x: entry.x, z: entry.z }
  ];

  return candidates.find(pos =>
    pos && Number.isFinite(pos.x) && Number.isFinite(pos.z)
  );
}

function buildCost(view, id, instance) {
  const spec = (view.stablePrefix.mechanics?.buildables || [])
    .find(item => item.id === id);

  if (!spec) return Infinity;
  if (Array.isArray(spec.costs) && Number.isFinite(spec.costs[instance])) {
    return spec.costs[instance];
  }
  return Number.isFinite(spec.cost) ? spec.cost : Infinity;
}

function completedThrough(view, index) {
  const needed = {};

  for (let i = 0; i <= index; i++) {
    needed[sites[i].what] = (needed[sites[i].what] || 0) + 1;
  }

  return Object.entries(needed).every(
    ([id, amount]) => works(view, id).length >= amount
  );
}

function nextSite(view) {
  for (let i = 0; i < sites.length; i++) {
    if (!completedThrough(view, i)) {
      const site = sites[i];
      return {
        ...site,
        cost: buildCost(view, site.what, works(view, site.what).length)
      };
    }
  }
  return null;
}

function advertisedUpgradeCost(entry) {
  const values = [
    entry.upgradeCost,
    entry.nextUpgradeCost,
    entry.context?.upgradeCost,
    entry.actions?.upgrade?.cost
  ];

  return values.find(Number.isFinite);
}

function estimatedUpgradeCost(view, entry) {
  const advertised = advertisedUpgradeCost(entry);
  if (Number.isFinite(advertised)) return advertised;

  const spec = (view.stablePrefix.mechanics?.buildables || [])
    .find(item => item.id === entry.id);
  const base = Number(spec?.cost);

  if (!Number.isFinite(base)) return Infinity;
  return tier(entry) === 1 ? base : base * 2;
}

function nextUpgrade(view) {
  const priorities = ["sluice", "turret", "sentry_beacon"];

  for (const id of priorities) {
    for (const entry of works(view, id)) {
      if (
        tier(entry) < 3 &&
        !entry.wrecked &&
        Number.isInteger(entry.index)
      ) {
        return {
          entry,
          cost: estimatedUpgradeCost(view, entry)
        };
      }
    }
  }

  return null;
}

function nearestSeam(view) {
  const rider = view.now.prospector || view.now.hero;
  const seams = (view.now.seams || []).filter(seam =>
    seam.active &&
    seam.remaining > 0 &&
    Number.isFinite(seam.x) &&
    Number.isFinite(seam.z)
  );

  seams.sort((a, b) => {
    const da = (a.x - rider.x) ** 2 + (a.z - rider.z) ** 2;
    const db = (b.x - rider.x) ** 2 + (b.z - rider.z) ** 2;
    return da - db;
  });

  return seams[0];
}

function chooseUpgrade(offer) {
  const priorities = [
    /split.?spark/i,
    /heavy.?spark/i,
    /spark.*damage|damage.*spark/i,
    /powder.?charge/i,
    /blast.*damage|damage.*blast/i,
    /blast.*cooldown|cooldown.*blast/i,
    /long.?barrel|resonator|range/i,
    /tinker.?s.?plating|max hp|heals?/i,
    /wide.?ring|blast radius|radius/i,
    /prospector.?s.?luck|gold per seam/i,
    /spring.?heels|move speed/i,
    /pan like|panning/i
  ];

  for (const pattern of priorities) {
    const match = offer.find(choice =>
      pattern.test(`${choice.id} ${choice.name || ""} ${choice.effectText || ""}`)
    );
    if (match) return match.id;
  }

  return offer[0].id;
}

function damagedWorks(view) {
  return (view.now.works?.entries || []).some(entry => {
    const hp = Number(entry.hp);
    const maxHp = Number(entry.maxHp);
    return entry.wrecked ||
      (Number.isFinite(hp) && Number.isFinite(maxHp) && hp < maxHp);
  });
}

export default function controller(view) {
  if (!view || view.schema !== "goldrush.view.v1") {
    return [{ verb: "HOLD", pos: { x: 0, z: 11 } }];
  }

  if (view.now.pendingOffer?.length) {
    return [{
      verb: "PICK_UPGRADE",
      id: chooseUpgrade(view.now.pendingOffer)
    }];
  }

  if (view.now.pendingSecure) {
    return [{ verb: "SECURE_CHOICE", choice: "bank" }];
  }

  const wave = Number(view.now.wave || 0);
  const gold = Number(view.now.gold || 0);
  const orders = [];

  if (view.now.blastReadyInMs === 0) {
    orders.push({ verb: "BLAST_AT", pos: { x: 0, z: 11 } });
  }

  orders.push({ verb: "SET_WEAPON", weapon: "rig" });

  if (damagedWorks(view)) {
    orders.push({
      verb: "REPAIR_UNDER",
      pct: wave >= 19 ? 62 : 42
    });
  }

  const upgrade = nextUpgrade(view);
  const site = nextSite(view);

  if (
    upgrade &&
    Number.isFinite(upgrade.cost) &&
    gold >= upgrade.cost
  ) {
    const pos = position(upgrade.entry);

    if (pos) {
      orders.push({ verb: "MOVE_TO", pos: { x: pos.x, z: pos.z } });
    }

    orders.push({
      verb: "CONTEXT_ACTION",
      action: "upgrade",
      target: {
        id: upgrade.entry.id,
        index: upgrade.entry.index
      }
    });
  } else if (
    site &&
    gold >= site.cost &&
    (site.wave === undefined || wave >= site.wave)
  ) {
    orders.push({
      verb: "MOVE_TO",
      pos: { x: site.x, z: site.z }
    });

    orders.push({
      verb: "BUILD",
      what: site.what,
      where: { x: site.x, z: site.z },
      when: site.wave === undefined
        ? { goldGte: site.cost }
        : { waveGte: site.wave }
    });
  }

  const seam = nearestSeam(view);
  if (seam && wave < 20) {
    orders.push({ verb: "HARVEST", seam: seam.id });
  }

  orders.push({
    verb: "FALLBACK_IF",
    threat: { enemiesGte: 28 },
    pos: { x: 0, z: 12 }
  });

  orders.push({ verb: "HOLD", pos: { x: 0, z: 11 } });

  return orders.slice(0, 32);
}
