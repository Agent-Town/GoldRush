// e6-glow-mesa controller.
// Secure = kill CORE (spawns when VAC dies in act 1) AND reach wave 12.
// Boss anchors at (0,-8); base-flat build zone reaches z=-10; turret range 16.
// Economy: wrangle pen (CAPTURE exhausted machines, 1g/machine/15s) + night veins + seams.

const BOSS = { x: 0, z: -8 };
const CLAIM = { x: 0, z: -32 };

// Turret slots: all inside base-flat (z<=-10) and well within 16wu of the boss anchor.
// Carry more candidates than slots (gen 10/14: a ladder that cannot skip a bad rung loses runs).
const TURRET_SLOTS = [
  { x: 0, z: -11 }, { x: -6, z: -11 }, { x: 6, z: -11 }, { x: -12, z: -12 },
  { x: 12, z: -12 }, { x: 0, z: -14 }, { x: -6, z: -15 }, { x: 6, z: -15 },
  { x: 0, z: -18 }, { x: -10, z: -16 },
];
const BEACON_SLOTS = [
  { x: -4, z: -24 }, { x: 4, z: -24 }, { x: 0, z: -26 }, { x: -8, z: -22 },
  { x: 8, z: -22 }, { x: 0, z: -20 },
];

const CAPTURE_POST = { x: 0, z: -21 }; // north approach, outside the hero's 10wu rig ring

const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

function pickUpgrade(offer) {
  // gen 14: score the offer, never take offer[0]. Prefer survivability then damage.
  const score = (o) => {
    const t = ((o.name || '') + ' ' + (o.effectText || '') + ' ' + (o.id || '')).toLowerCase();
    let s = 0;
    if (/plating|health|hp|vitality|tough|armou?r/.test(t)) s += 100;
    if (/regen|heal|mend/.test(t)) s += 60;
    if (/damage|spark|coil|tap|power|bolt/.test(t)) s += 40;
    if (/range|reload|rate|fire/.test(t)) s += 30;
    if (/turret|beacon|works|build/.test(t)) s += 25;
    return s;
  };
  return [...offer].sort((a, b) => score(b) - score(a))[0];
}

export default function controller(view) {
  const now = view.now;

  // gen 9: pendingSecure accepts exactly ONE order and refuses anything else.
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const orders = [];

  // REPLACE semantics: the pick must own the tick, then resend everything else.
  if (now.pendingOffer && now.pendingOffer.length) {
    const u = pickUpgrade(now.pendingOffer);
    if (u) orders.push({ verb: 'PICK_UPGRADE', id: u.id });
  }

  const gold = now.gold || 0;
  const byKind = (now.works && now.works.byKind) || {};
  const entries = (now.works && now.works.entries) || [];
  const nT = byKind.turret || 0;
  const nB = byKind.sentry_beacon || 0;
  const mech = view.stablePrefix.mechanics.buildables || [];
  const costOf = (id, n) => {
    const b = mech.find((m) => m.id === id);
    if (!b) return Infinity;
    return b.costs[Math.min(n, b.costs.length - 1)];
  };

  const occupied = entries.map((e) => e.position).filter(Boolean);
  const free = (slots) => slots.filter((s) => !occupied.some((p) => dist(p, s) < 2.5));

  // gen 17: emit only builds affordable RIGHT NOW, so a gate can never fire mid-commute.
  // Turrets are the whole contract: nothing else on this board reaches the boss.
  if (nT < 4 && gold >= costOf('turret', nT)) {
    for (const s of free(TURRET_SLOTS).slice(0, 3)) {
      orders.push({ verb: 'BUILD', what: 'turret', where: s, when: { goldGte: costOf('turret', nT) } });
    }
  } else if (nT >= 2 && nB < 6 && gold >= costOf('sentry_beacon', nB)) {
    for (const s of free(BEACON_SLOTS).slice(0, 2)) {
      orders.push({ verb: 'BUILD', what: 'sentry_beacon', where: s, when: { goldGte: costOf('sentry_beacon', nB) } });
    }
  }

  // Night veins: 4g each, one-shot, only harvestable while night is active (range 1.5).
  const at = now.atomic;
  const veins = at && at.tiles && at.tiles.veins;
  if (veins && veins.active) {
    const live = veins.nodes.filter((v) => !v.harvested);
    // Only chase a vein if it is cheap from the post; the ring sits 34-55wu out.
    const near = live
      .map((v) => ({ v, d: dist(v, now.prospector || CAPTURE_POST) }))
      .sort((a, b) => a.d - b.d)[0];
    if (near && near.d < 26) {
      orders.push({ verb: 'MOVE_TO', pos: { x: near.v.x, z: near.v.z } });
      orders.push({ verb: 'MOVE_TO', pos: { x: near.v.x + 0.4, z: near.v.z } });
      orders.push({ verb: 'MOVE_TO', pos: { x: near.v.x, z: near.v.z + 0.4 } });
    }
  }

  // The pen is the E6 economy: CAPTURE takes the nearest exhausted machine within 2.2wu,
  // owns exactly one tick, then the record is spent. Stack them; failures buy decision points.
  const room = 31 - orders.length;
  for (let i = 0; i < Math.max(0, room); i++) orders.push({ verb: 'CAPTURE' });

  orders.push({ verb: 'HOLD', pos: CAPTURE_POST });
  return orders.slice(0, 32);
}
