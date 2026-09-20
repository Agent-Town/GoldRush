// SCORED: yes

let lastBuildKey = "";
let buildFailures = 0;

const sites = [
  { what: "sluice", x: -6, z: 1, gold: 40 },
  { what: "sluice", x: 0, z: 1, gold: 40 },
  { what: "sluice", x: 6, z: 1, gold: 40 },

  { what: "turret", x: -4, z: 11, gold: 50 },
  { what: "turret", x: 4, z: 11, gold: 70 },
  { what: "sentry_beacon", x: -7, z: 11, gold: 25 },
  { what: "sentry_beacon", x: 7, z: 11, gold: 35 },

  { what: "stockpile", x: -8, z: 16, gold: 60 },
  { what: "stockpile", x: 8, z: 16, gold: 60 },

  { what: "turret", x: -3, z: 15, gold: 95 },
  { what: "turret", x: 3, z: 15, gold: 125 },

  { what: "sentry_beacon", x: -5, z: 16, gold: 45 },
  { what: "sentry_beacon", x: 5, z: 16, gold: 55 },
  { what: "sentry_beacon", x: -5, z: 7, gold: 75 },
  { what: "sentry_beacon", x: 5, z: 7, gold: 95 },

  { what: "palisade", x: -3, z: 11, wave: 19 },
  { what: "palisade", x: 0, z: 11, wave: 19 },
  { what: "palisade", x: 3, z: 11, wave: 19 }
];

function entries(view, id) {
  return (view.now.works?.entries || []).filter(e => e.id === id);
}

function count(view, id) {
  return entries(view, id).length;
}

function chooseUpgrade(offer) {
  const priorities = [
    /blast.*cooldown|cooldown.*blast/i,
    /blast.*damage|damage.*blast/i,
    /radius|splash|explosion/i,
    /rig.*damage|damage.*rig/i,
    /fire rate|attack speed/i,
    /movement|move speed/i,
    /health|armor|resist/i
  ];

  for (const pattern of priorities) {
    const found = offer.find(o =>
      pattern.test(`${o.id} ${o.name || ""} ${o.effectText || ""}`)
    );
    if (found) return found.id;
  }

  return offer[0].id;
}

function tierOf(entry) {
  return Number(entry.tier ?? entry.level ?? entry.upgradeTier ?? 1);
}

function upgradePrice(entry) {
  const candidates = [
    entry.upgradeCost,
    entry.nextUpgradeCost,
    entry.context?.upgradeCost,
    entry.actions?.upgrade?.cost
  ];

  for (const value of candidates) {
    if (Number.isFinite(value)) return value;
  }

  return tierOf(entry) === 1 ? 75 : 125;
}

function nextTierUpgrade(view) {
  const preferred = ["sluice", "turret", "sentry_beacon"];

  for (const id of preferred) {
    for (const entry of entries(view, id)) {
      const tier = tierOf(entry);
      const price = upgradePrice(entry);

      if (
        tier < 3 &&
        !entry.wrecked &&
        view.now.gold >= price &&
        Number.isInteger(entry.index)
      ) {
        return entry;
      }
    }
  }

  return null;
}

function completedBefore(view, siteIndex) {
  const wanted = Object.create(null);

  for (let i = 0; i <= siteIndex; i++) {
    const id = sites[i].what;
    wanted[id] = (wanted[id] || 0) + 1;
  }

  for (const [id, amount] of Object.entries(wanted)) {
    if (count(view, id) < amount) return false;
  }

  return true;
}

function nextSite(view) {
  for (let i = 0; i < sites.length; i++) {
    if (!completedBefore(view, i)) return sites[i];
  }
  return null;
}

function nearestActiveSeam(view) {
  const p = view.now.prospector || view.now.hero;
  const active = (view.now.seams || []).filter(
    seam => seam.active && Number.isFinite(seam.x) && Number.isFinite(seam.z)
  );

  active.sort((a, b) => {
    const ad = (a.x - p.x) ** 2 + (a.z - p.z) ** 2;
    const bd = (b.x - p.x) ** 2 + (b.z - p.z) ** 2;
    return ad - bd;
  });

  return active[0];
}

export default function controller(view) {
  if (!view || view.schema !== "goldrush.view.v1") {
    return [{ verb: "HOLD", pos: { x: 0, z: 12 } }];
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

  const orders = [];
  const wave = view.now.wave || 0;

  if (view.now.blastReadyInMs === 0 && wave >= 18) {
    orders.push({ verb: "BLAST_AT", pos: { x: 0, z: 11 } });
  }

  orders.push({ verb: "SET_WEAPON", weapon: "rig" });

  if (wave >= 19) {
    orders.push({ verb: "REPAIR_UNDER", pct: 62 });
  } else {
    orders.push({ verb: "REPAIR_UNDER", pct: 42 });
  }

  const upgrade = nextTierUpgrade(view);
  if (upgrade) {
    const pos = upgrade.pos || {
      x: upgrade.x,
      z: upgrade.z
    };

    if (Number.isFinite(pos.x) && Number.isFinite(pos.z)) {
      orders.push({ verb: "MOVE_TO", pos: { x: pos.x, z: pos.z } });
    }

    orders.push({
      verb: "CONTEXT_ACTION",
      action: "upgrade",
      target: { id: upgrade.id, index: upgrade.index }
    });
  }

  const site = nextSite(view);
  if (site) {
    const key = `${site.what}:${site.x}:${site.z}`;

    if (key !== lastBuildKey) {
      lastBuildKey = key;
      buildFailures = 0;
    } else if (view.now.needsRider) {
      buildFailures++;
    }

    const spread = Math.min(buildFailures, 3) * 0.6;
    const x = site.x + (buildFailures % 2 ? spread : -spread);
    const z = site.z;

    orders.push({ verb: "MOVE_TO", pos: { x, z } });

    if (site.wave !== undefined) {
      orders.push({
        verb: "BUILD",
        what: site.what,
        where: { x, z },
        when: { waveGte: site.wave }
      });
    } else {
      orders.push({
        verb: "BUILD",
        what: site.what,
        where: { x, z },
        when: { goldGte: site.gold }
      });
    }
  }

  const seam = nearestActiveSeam(view);
  if (seam && wave < 20) {
    orders.push({ verb: "HARVEST", seam: seam.id });
  }

  orders.push({
    verb: "FALLBACK_IF",
    threat: { enemiesGte: 24 },
    pos: { x: 0, z: 12 }
  });

  orders.push({ verb: "HOLD", pos: { x: 0, z: 11 } });

  return orders.slice(0, 32);
}
