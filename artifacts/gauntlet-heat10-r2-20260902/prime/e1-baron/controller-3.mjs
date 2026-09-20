// SCORED: yes

const buildPlan = [
  { kind: "sentry_beacon", x: 0, z: 4 },
  { kind: "turret", x: -4.5, z: 8 },
  { kind: "turret", x: 4.5, z: 8 },

  { kind: "sluice", x: -8, z: -1.5 },
  { kind: "sluice", x: 0, z: -1.5 },
  { kind: "sluice", x: 8, z: -1.5 },

  { kind: "stockpile", x: -4.5, z: 14.5 },
  { kind: "stockpile", x: 4.5, z: 14.5 },

  { kind: "sentry_beacon", x: -7, z: 7 },
  { kind: "sentry_beacon", x: 7, z: 7 },
  { kind: "turret", x: -5.5, z: 13 },
  { kind: "turret", x: 5.5, z: 13 },
  { kind: "sentry_beacon", x: -8, z: 14 },
  { kind: "sentry_beacon", x: 8, z: 14 },
  { kind: "sentry_beacon", x: 0, z: 19 },

  { kind: "palisade", x: -3, z: 11, wave: 18 },
  { kind: "palisade", x: 0, z: 11, wave: 18 },
  { kind: "palisade", x: 3, z: 11, wave: 18 }
];

const fallbackUpgradeCosts = {
  sluice: [60, 90],
  turret: [75, 110],
  sentry_beacon: [45, 70]
};

const failedSites = new Set();

function kindOf(entry) {
  return entry.kind || entry.buildableId || entry.type || entry.id;
}

function tierOf(entry) {
  return Number(entry.tier ?? entry.level ?? 1);
}

function positionOf(entry) {
  const position = entry.pos || entry.position || {};
  return {
    x: Number(entry.x ?? position.x ?? 0),
    z: Number(entry.z ?? position.z ?? 12)
  };
}

function standing(entry) {
  return !entry.wrecked && (entry.hp === undefined || entry.hp > 0);
}

function entriesOf(view, kind, standingOnly = true) {
  return (view.now.works?.entries || []).filter(entry =>
    kindOf(entry) === kind && (!standingOnly || standing(entry))
  );
}

function siteKey(kind, x, z) {
  return `${kind}:${x}:${z}`;
}

function observeFailures(view) {
  for (const accepted of view.now.orders || []) {
    const order = accepted.order || {};
    if (
      accepted.status === "failed" &&
      order.verb === "BUILD" &&
      order.where
    ) {
      failedSites.add(
        siteKey(order.what, order.where.x, order.where.z)
      );
    }
  }
}

function occupied(view, site) {
  return entriesOf(view, site.kind).some(entry => {
    const position = positionOf(entry);
    return Math.hypot(position.x - site.x, position.z - site.z) < 1.6;
  });
}

function buildCost(view, kind) {
  const specification = (view.stablePrefix.mechanics.buildables || [])
    .find(item => item.id === kind);

  if (!specification) return Infinity;

  const count = entriesOf(view, kind, false).length;
  const costs = specification.costs || [];

  if (count < costs.length) return Number(costs[count]);
  if (!costs.length) return Number(specification.cost ?? Infinity);

  const last = Number(costs[costs.length - 1]);
  const previous = Number(costs[Math.max(0, costs.length - 2)]);
  return Math.ceil((last + Math.max(5, last - previous)) / 5) * 5;
}

function upgradeCost(entry, kind) {
  const published =
    entry.upgradeCost ??
    entry.nextUpgradeCost ??
    entry.context?.upgradeCost ??
    entry.actions?.upgrade?.cost;

  if (Number.isFinite(published)) return Number(published);
  return fallbackUpgradeCosts[kind]?.[tierOf(entry) - 1] ?? Infinity;
}

function targetFor(view, entry, kind) {
  const all = entriesOf(view, kind, false);
  const explicit = Number(entry.index);

  return {
    id: kind,
    index: Number.isInteger(explicit) && explicit >= 0
      ? explicit
      : Math.max(0, all.indexOf(entry))
  };
}

function chooseHeroUpgrade(offer) {
  const priorities = [
    /split spark/i,
    /double.tap|fire rate/i,
    /heavy spark/i,
    /long.barrel|resonator|spark.*range|range.*spark/i,
    /tinker|plating|max hp|heal|second wind|armor|armour/i,
    /powder charge|blast.*damage|damage.*blast/i,
    /wide ring|blast.*radius|radius.*blast/i,
    /quick fuse|blast.*cooldown|cooldown.*blast/i,
    /spring heels|move speed/i,
    /prospector.s luck|seam respawn|gold per seam/i,
    /pan like|panning/i,
    /sluice|income|capacity|gold/i
  ];

  for (const pattern of priorities) {
    const selected = offer.find(item =>
      pattern.test(`${item.id} ${item.name || ""} ${item.effectText || ""}`)
    );
    if (selected) return selected;
  }

  return offer[0];
}

function addHarvest(view, orders, maximum) {
  const rider = view.now.prospector || { x: 0, z: 12 };
  const seams = (view.now.seams || [])
    .filter(seam =>
      seam.active &&
      Number(seam.remaining) > 0 &&
      Number.isFinite(seam.x) &&
      Number.isFinite(seam.z)
    )
    .sort((left, right) =>
      Math.hypot(left.x - rider.x, left.z - rider.z) -
      Math.hypot(right.x - rider.x, right.z - rider.z)
    );

  let count = 0;

  for (const seam of seams) {
    const repetitions = Math.min(
      6,
      Math.ceil(Number(seam.remaining) / 5),
      maximum - count
    );

    for (let index = 0; index < repetitions; index++) {
      orders.push({ verb: "HARVEST", seam: seam.id });
      count++;
    }

    if (count >= maximum) break;
  }
}

function nextBuilding(view) {
  return buildPlan.find(site =>
    view.now.wave >= (site.wave || 0) &&
    !occupied(view, site) &&
    !failedSites.has(siteKey(site.kind, site.x, site.z))
  );
}

function nextWorksUpgrade(view) {
  const desiredCounts = {
    sluice: 3,
    turret: 4,
    sentry_beacon: 6
  };

  for (const kind of ["sluice", "turret", "sentry_beacon"]) {
    if (entriesOf(view, kind).length < desiredCounts[kind]) continue;

    const candidate = entriesOf(view, kind)
      .filter(entry => tierOf(entry) < 3)
      .sort((left, right) => tierOf(left) - tierOf(right))[0];

    if (candidate) {
      return {
        kind,
        entry: candidate,
        cost: upgradeCost(candidate, kind)
      };
    }
  }

  return null;
}

function addCombat(view, orders) {
  const now = view.now;
  if (!(now.threats?.alive > 0)) return;

  if (now.blastReadyInMs === 0) {
    orders.push({ verb: "BLAST_AT", pos: { x: 0, z: 11 } });
    return;
  }

  const padding = Math.min(
    18,
    Math.max(3, Math.ceil(Number(now.blastReadyInMs) / 140))
  );

  for (let index = 0; index < padding; index++) {
    orders.push({ verb: "SET_WEAPON", weapon: "rig" });
  }

  orders.push({ verb: "BLAST_AT", pos: { x: 0, z: 11 } });
}

export default function controller(view) {
  if (!view || view.schema !== "goldrush.view.v1") {
    return [{ verb: "HOLD", pos: { x: 0, z: 11 } }];
  }

  observeFailures(view);

  const now = view.now;

  if (now.pendingOffer?.length) {
    return [{
      verb: "PICK_UPGRADE",
      id: chooseHeroUpgrade(now.pendingOffer).id
    }];
  }

  if (now.pendingSecure) {
    return [{ verb: "SECURE_CHOICE", choice: "bank" }];
  }

  const orders = [];
  addCombat(view, orders);

  if (orders.length >= 20 && now.blastReadyInMs > 0) {
    return orders.slice(0, 32);
  }

  const damaged = (now.works?.entries || []).some(entry =>
    entry.hp !== undefined &&
    Number(entry.maxHp) > 0 &&
    Number(entry.hp) / Number(entry.maxHp) < 0.55
  );

  if (now.wave >= 19 && (now.works?.wrecked > 0 || damaged)) {
    orders.push({ verb: "REPAIR_UNDER", pct: 65 });
    orders.push({ verb: "SET_WEAPON", weapon: "rig" });
    return orders.slice(0, 32);
  }

  const building = nextBuilding(view);
  const worksUpgrade = nextWorksUpgrade(view);

  if (building) {
    const cost = buildCost(view, building.kind);

    if (now.gold >= cost) {
      orders.push({
        verb: "MOVE_TO",
        pos: { x: building.x, z: building.z }
      });
      orders.push({
        verb: "BUILD",
        what: building.kind,
        where: { x: building.x, z: building.z },
        when: { goldGte: cost }
      });
    } else {
      addHarvest(view, orders, Math.max(0, 30 - orders.length));
    }
  } else if (worksUpgrade && now.gold >= worksUpgrade.cost) {
    const position = positionOf(worksUpgrade.entry);

    orders.push({ verb: "MOVE_TO", pos: position });
    orders.push({
      verb: "CONTEXT_ACTION",
      action: "upgrade",
      target: targetFor(
        view,
        worksUpgrade.entry,
        worksUpgrade.kind
      )
    });
  } else {
    addHarvest(view, orders, Math.max(0, 30 - orders.length));
  }

  orders.push({ verb: "SET_WEAPON", weapon: "rig" });
  return orders.slice(0, 32);
}
