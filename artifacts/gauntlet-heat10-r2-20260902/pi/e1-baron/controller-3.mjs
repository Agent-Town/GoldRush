// SCORED: yes

const buildPlan = [
  { what: "sluice", x: -8, z: 3 },
  { what: "sluice", x: 0, z: 3 },
  { what: "sluice", x: 8, z: 3 },

  { what: "turret", x: -4, z: 11 },
  { what: "turret", x: 4, z: 11 },
  { what: "turret", x: -3, z: 15 },
  { what: "turret", x: 3, z: 15 },

  { what: "sentry_beacon", x: -7, z: 11 },
  { what: "sentry_beacon", x: 7, z: 11 },
  { what: "sentry_beacon", x: -5, z: 16 },
  { what: "sentry_beacon", x: 5, z: 16 },
  { what: "sentry_beacon", x: -5, z: 7 },
  { what: "sentry_beacon", x: 5, z: 7 },

  { what: "stockpile", x: -8, z: 16 },
  { what: "stockpile", x: 8, z: 16 },

  { what: "palisade", x: -3, z: 11, wave: 19 },
  { what: "palisade", x: 0, z: 11, wave: 19 },
  { what: "palisade", x: 3, z: 11, wave: 19 }
];

function entries(view, id) {
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
    return Number(spec.costs[instance]);
  }

  return Number.isFinite(spec.cost) ? Number(spec.cost) : Infinity;
}

function completedThrough(view, index) {
  const needed = {};

  for (let i = 0; i <= index; i++) {
    const id = buildPlan[i].what;
    needed[id] = (needed[id] || 0) + 1;
  }

  return Object.entries(needed).every(
    ([id, count]) => entries(view, id).length >= count
  );
}

function nextBuild(view) {
  for (let i = 0; i < buildPlan.length; i++) {
    if (!completedThrough(view, i)) {
      const site = buildPlan[i];
      return {
        ...site,
        cost: buildCost(view, site.what, entries(view, site.what).length)
      };
    }
  }

  return null;
}

function upgradeCost(entry) {
  const candidates = [
    entry.upgradeCost,
    entry.nextUpgradeCost,
    entry.context?.upgradeCost,
    entry.actions?.upgrade?.cost
  ];

  return candidates.find(Number.isFinite);
}

function nextUpgrade(view) {
  const priorities = ["sluice", "turret", "sentry_beacon"];

  for (const id of priorities) {
    for (const entry of entries(view, id)) {
      if (
        !entry.wrecked &&
        tier(entry) < 3 &&
        Number.isInteger(entry.index)
      ) {
        return {
          entry,
          cost: upgradeCost(entry)
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
    Number(seam.remaining) > 0 &&
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
    /double.?tap|fire rate/i,
    /spark.*damage|damage.*spark/i,
    /powder.?charge/i,
    /blast.*damage|damage.*blast/i,
    /quick.?fuse|blast.*cooldown|cooldown.*blast/i,
    /long.?resonator|long.?barrel|range/i,
    /tinker.?s.?plating|max hp|heals?/i,
    /wide.?ring|blast radius|radius/i,
    /prospector.?s.?luck|gold per seam/i,
    /spring.?heels|move speed/i,
    /pan like|panning/i
  ];

  for (const pattern of priorities) {
    const match = offer.find(choice =>
      pattern.test(
        `${choice.id} ${choice.name || ""} ${choice.effectText || ""}`
      )
    );

    if (match) return match.id;
  }

  return offer[0].id;
}

function cadenceOrders(view, limit) {
  const orders = [];

  if (view.now.blastReadyInMs === 0) {
    orders.push({ verb: "BLAST_AT", pos: { x: 0, z: 11 } });
  }

  while (orders.length < limit) {
    orders.push({ verb: "SET_WEAPON", weapon: "rig" });
  }

  return orders;
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

  if (wave >= 19) {
    orders.push({ verb: "REPAIR_UNDER", pct: 62 });
  }

  const upgrade = nextUpgrade(view);
  const site = nextBuild(view);

  if (
    upgrade &&
    Number.isFinite(upgrade.cost) &&
    gold >= upgrade.cost
  ) {
    const pos = position(upgrade.entry);

    if (pos) {
      orders.push({
        verb: "MOVE_TO",
        pos: { x: pos.x, z: pos.z }
      });
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
    Number.isFinite(site.cost) &&
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
  } else if (wave < 20) {
    const seam = nearestSeam(view);

    if (seam) {
      orders.push({ verb: "HARVEST", seam: seam.id });
    }
  }

  orders.push(...cadenceOrders(view, Math.min(30, 32 - orders.length)));

  if (orders.length < 32) {
    orders.push({
      verb: "FALLBACK_IF",
      threat: { enemiesGte: 28 },
      pos: { x: 0, z: 12 }
    });
  }

  if (orders.length < 32) {
    orders.push({ verb: "HOLD", pos: { x: 0, z: 11 } });
  }

  return orders.slice(0, 32);
}
