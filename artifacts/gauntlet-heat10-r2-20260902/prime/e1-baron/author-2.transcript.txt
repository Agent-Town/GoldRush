// SCORED: yes

const sites = [
  { kind: "sluice", x: -8, z: 1.5 },
  { kind: "sluice", x: 0, z: 1.5 },
  { kind: "sluice", x: 8, z: 1.5 },

  { kind: "stockpile", x: -4.5, z: 14.5 },
  { kind: "stockpile", x: 4.5, z: 14.5 },

  { kind: "sentry_beacon", x: 0, z: 4 },
  { kind: "sentry_beacon", x: -7, z: 7 },
  { kind: "sentry_beacon", x: 7, z: 7 },
  { kind: "sentry_beacon", x: -8, z: 14 },
  { kind: "sentry_beacon", x: 8, z: 14 },
  { kind: "sentry_beacon", x: 0, z: 19 },

  { kind: "turret", x: -4.5, z: 8 },
  { kind: "turret", x: 4.5, z: 8 },
  { kind: "turret", x: -5.5, z: 13 },
  { kind: "turret", x: 5.5, z: 13 },

  { kind: "palisade", x: -3, z: 11, wave: 18 },
  { kind: "palisade", x: 0, z: 11, wave: 18 },
  { kind: "palisade", x: 3, z: 11, wave: 18 }
];

const fallbackUpgradeCosts = {
  sluice: [60, 90],
  turret: [75, 110],
  sentry_beacon: [45, 70]
};

function kindOf(entry) {
  return entry.kind || entry.buildableId || entry.type || entry.id;
}

function tierOf(entry) {
  return Number(entry.tier ?? entry.level ?? 1);
}

function positionOf(entry) {
  const pos = entry.pos || entry.position || {};
  return {
    x: Number(entry.x ?? pos.x ?? 0),
    z: Number(entry.z ?? pos.z ?? 12)
  };
}

function isStanding(entry) {
  return !entry.wrecked && (entry.hp === undefined || entry.hp > 0);
}

function entriesOf(view, kind, standingOnly = true) {
  return (view.now.works?.entries || []).filter(entry =>
    kindOf(entry) === kind && (!standingOnly || isStanding(entry))
  );
}

function siteOccupied(view, site) {
  return entriesOf(view, site.kind).some(entry => {
    const pos = positionOf(entry);
    return Math.hypot(pos.x - site.x, pos.z - site.z) < 1.6;
  });
}

function buildCost(view, kind) {
  const spec = (view.stablePrefix.mechanics.buildables || [])
    .find(buildable => buildable.id === kind);

  if (!spec) return Infinity;

  const count = entriesOf(view, kind, false).length;
  const costs = spec.costs || [];

  if (count < costs.length) return costs[count];
  if (!costs.length) return Number(spec.cost ?? Infinity);

  const last = costs[costs.length - 1];
  const previous = costs[Math.max(0, costs.length - 2)];
  return Math.ceil((last + Math.max(5, last - previous)) / 5) * 5;
}

function upgradeCost(entry, kind) {
  const published =
    entry.upgradeCost ??
    entry.nextUpgradeCost ??
    entry.context?.upgradeCost ??
    entry.actions?.upgrade?.cost;

  if (Number.isFinite(published)) return published;

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

function chooseUpgrade(offer) {
  const priorities = [
    /tinker|plating|max hp|heal|second wind|armor|armour/i,
    /split spark/i,
    /heavy spark/i,
    /long.barrel|resonator|spark.*range|range.*spark/i,
    /powder charge|blast.*damage|damage.*blast/i,
    /wide ring|blast.*radius|radius.*blast/i,
    /blast.*cooldown|cooldown.*blast/i,
    /spring heels|move speed/i,
    /prospector.s luck|seam respawn|gold per seam/i,
    /sluice|income|capacity|gold/i
  ];

  for (const pattern of priorities) {
    const choice = offer.find(item =>
      pattern.test(`${item.id} ${item.name || ""} ${item.effectText || ""}`)
    );
    if (choice) return choice;
  }

  return offer[0];
}

function addHarvestOrders(view, orders, limit) {
  const prospector = view.now.prospector || view.now.hero || { x: 0, z: 12 };
  const seams = (view.now.seams || [])
    .filter(seam =>
      seam.active &&
      seam.remaining > 0 &&
      Number.isFinite(seam.x) &&
      Number.isFinite(seam.z)
    )
    .sort((a, b) =>
      Math.hypot(a.x - prospector.x, a.z - prospector.z) -
      Math.hypot(b.x - prospector.x, b.z - prospector.z)
    );

  let added = 0;

  for (const seam of seams) {
    const cycles = Math.min(
      Math.ceil(Number(seam.remaining) / 5),
      limit - added
    );

    for (let i = 0; i < cycles; i++) {
      orders.push({ verb: "HARVEST", seam: seam.id });
      added++;
    }

    if (added >= limit) break;
  }

  return added;
}

function nextUpgrade(view) {
  for (const kind of ["sluice", "turret", "sentry_beacon"]) {
    const candidate = entriesOf(view, kind)
      .filter(entry => tierOf(entry) < 3)
      .sort((a, b) => tierOf(a) - tierOf(b))[0];

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

function combatPrefix(view, orders) {
  const now = view.now;
  if (!(now.threats?.alive > 0)) return;

  if (now.blastReadyInMs === 0) {
    orders.push({ verb: "BLAST_AT", pos: { x: 0, z: 11 } });
    return;
  }

  const padding = Math.min(
    24,
    Math.max(4, Math.ceil(Number(now.blastReadyInMs) / 100))
  );

  for (let i = 0; i < padding; i++) {
    orders.push({ verb: "SET_WEAPON", weapon: "rig" });
  }

  orders.push({ verb: "BLAST_AT", pos: { x: 0, z: 11 } });
}

export default function controller(view) {
  if (!view || view.schema !== "goldrush.view.v1") {
    return [{ verb: "HOLD", pos: { x: 0, z: 11 } }];
  }

  const now = view.now;

  if (now.pendingOffer?.length) {
    return [{
      verb: "PICK_UPGRADE",
      id: chooseUpgrade(now.pendingOffer).id
    }];
  }

  if (now.pendingSecure) {
    return [{ verb: "SECURE_CHOICE", choice: "bank" }];
  }

  const orders = [];
  combatPrefix(view, orders);

  if (orders.length >= 25 && now.blastReadyInMs > 0) {
    return orders.slice(0, 32);
  }

  const upgrade = nextUpgrade(view);

  if (upgrade && now.gold >= upgrade.cost) {
    const pos = positionOf(upgrade.entry);
    orders.push({ verb: "MOVE_TO", pos });
    orders.push({
      verb: "CONTEXT_ACTION",
      action: "upgrade",
      target: targetFor(view, upgrade.entry, upgrade.kind)
    });
  } else {
    const nextSite = sites.find(site =>
      now.wave >= (site.wave || 0) && !siteOccupied(view, site)
    );

    if (nextSite) {
      const cost = buildCost(view, nextSite.kind);

      if (now.gold >= cost) {
        orders.push({
          verb: "MOVE_TO",
          pos: { x: nextSite.x, z: nextSite.z }
        });
        orders.push({
          verb: "BUILD",
          what: nextSite.kind,
          where: { x: nextSite.x, z: nextSite.z },
          when: { goldGte: cost }
        });
      } else {
        addHarvestOrders(view, orders, Math.max(0, 30 - orders.length));
      }
    } else if (upgrade) {
      addHarvestOrders(view, orders, Math.max(0, 30 - orders.length));
    } else if (
      now.wave >= 19 &&
      (
        now.works?.wrecked > 0 ||
        (now.works?.entries || []).some(entry =>
          entry.hp !== undefined &&
          entry.maxHp > 0 &&
          entry.hp / entry.maxHp < 0.7
        )
      )
    ) {
      orders.push({ verb: "REPAIR_UNDER", pct: 70 });
    } else {
      addHarvestOrders(view, orders, Math.max(0, 30 - orders.length));
    }
  }

  orders.push({ verb: "SET_WEAPON", weapon: "rig" });

  return orders.slice(0, 32);
}
