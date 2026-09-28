// Generation 136 controller v2 — e5-regatta. v1's race line is proven (all five beacons fell clean:
// 2.73 / 28.07 / 44.8 / 64.13 / 87.67). v2 fixes exactly two self-inflicted faults:
//   (1) PICK_UPGRADE carried the offer OBJECT instead of `pick.id`, so EVERY array with a live
//       draft was refused whole; the sim re-served the same view and the run took 24,635 views.
//   (2) a per-view bogus-seam "sampling" probe with a fresh id each time is a view-storm generator.
//       Dropped, and replaced by a SIGNATURE DEDUPE that makes any storm structurally impossible.
//
// FORFEIT INVARIANT (unchanged): stepAshore needs `!navigable(point)`; navigable is the hull's water
// rect inset by CLAIM_BOAT_HULL_RADIUS 14.25 => +/-49.75. Every racing waypoint sits inside +/-44,
// so it is navigable, cannot be a step ashore, and cannot forfeit — whatever else goes wrong.
const CLAMP = 44;
const GATES = [
  { id: 'start-beacon', x: -49, z: 0 },
  { id: 'northwest-checkpoint', x: -28, z: 38 },
  { id: 'midcourse-checkpoint', x: 0, z: 18 },
  { id: 'northeast-checkpoint', x: 28, z: 38 },
  { id: 'finish-beacon', x: 49, z: 0 },
  { id: 'claim-boat', x: -49, z: 0 },
];
const AIM = GATES.map((g, i) => {
  const n = GATES[i + 1];
  let ax = g.x + 4.5; let az = g.z;
  if (n) {
    const dx = n.x - g.x; const dz = n.z - g.z;
    const len = Math.hypot(dx, dz) || 1;
    ax = g.x + (dx / len) * 4.5; az = g.z + (dz / len) * 4.5;
  }
  return { id: g.id, x: Math.max(-CLAMP, Math.min(CLAMP, +ax.toFixed(3))), z: Math.max(-CLAMP, Math.min(CLAMP, +az.toFixed(3))) };
});
const mv = (p) => ({ verb: 'MOVE_HERO', pos: { x: p.x, z: p.z } });

export function makeController() {
  const st = { last: null, capProbed: false, water: false, ashore: false, notAboard: false, seamIds: [], notes: [] };
  const send = (orders) => {
    if (!orders || !orders.length) return null;
    const cut = orders.slice(0, 32);
    const sig = JSON.stringify(cut);
    if (sig === st.last) return null; // nothing changed -> silence: cheap, and storm-proof.
    st.last = sig;
    return cut;
  };

  return function controller(view) {
    const now = view.now || {};
    const r = now.regatta || {};
    const boat = r.boat || {};
    const t = now.timers?.runSeconds ?? 0;
    const gold = now.gold ?? 0;

    // Silence at the secure boundary: takes the `bank` default and CANNOT be rejected (a rejected
    // in-window submission is invisible to the tape and visible to the sim -> replay divergence).
    if (now.pendingSecure) { st.notes.push(`t=${t} SECURE -> silence(bank)`); return null; }

    const offer = (now.pendingOffer || []).find((o) => o && typeof o.id === 'string');
    const head = offer ? [{ verb: 'PICK_UPGRADE', id: offer.id }] : [];

    const live = (now.seams || []).filter((s) => s && s.active !== false
      && Number.isFinite(s.x) && Number.isFinite(s.z) && typeof s.id === 'string');
    if (live.length) st.seamIds = live.map((s) => s.id);

    // ---------------- PHASE A: the race ----------------
    if (!r.finished && !r.forfeited && r.nextBuoy) {
      const idx = GATES.findIndex((g) => g.id === r.nextBuoy.id);
      if (idx < 0) return null;
      const chain = [...head];
      if (!boat.aboard) chain.push(mv({ x: -42, z: -6 }), mv({ x: -47, z: 6 }));
      for (let i = idx; i < AIM.length; i += 1) chain.push(mv(AIM[i]));
      st.notes.push(`t=${t} race idx=${idx} next=${r.nextBuoy.id} n=${chain.length}`);
      return send(chain);
    }
    if (r.forfeited) { st.notes.push(`t=${t} FORFEITED`); return null; }

    // ---------------- PHASE B: the purse ----------------
    const orders = [...head];
    if (!st.capProbed) {
      st.capProbed = true;
      // Does ANY path raise bankCap here? BuildSystem.addCapSource is its only caller and a boat pad
      // only records a building in a Map. Measure it rather than inherit the inference.
      orders.push({ verb: 'BOAT_BUILD', padId: 'bow', buildingId: 'stockpile' });
      orders.push({ verb: 'BUILD', what: 'stockpile', where: { x: -50, z: 2 }, when: { goldGte: 60 } });
      orders.push({ verb: 'BUILD', what: 'stockpile', where: { x: -47, z: -2 }, when: { goldGte: 60 } });
    }

    // The two published boat refusals, provoked ONLY with the purse capped and the race finished:
    // after `finishedAt` is set `advance` returns early, so a forfeit is unreachable from here.
    const capped = gold >= 200;
    if (capped && t > 226 && !st.water && boat.aboard) {
      st.water = true;
      orders.push({ verb: 'MOVE_HERO', pos: { x: 0, z: 62 } }); // non-navigable, 62 >> 6.4 gangway
      st.notes.push(`t=${t} UW-probe boat=(${boat.x},${boat.z})`);
    } else if (capped && t > 238 && st.water && !st.ashore && boat.aboard) {
      st.ashore = true;
      const bx = boat.x ?? -49; const bz = boat.z ?? 0;
      const cands = [{ x: bx - 5.2, z: bz }, { x: bx + 5.2, z: bz }, { x: bx, z: bz + 5.2 },
        { x: bx, z: bz - 5.2 }, { x: bx + 5.0, z: bz + 3.6 }, { x: bx - 5.0, z: bz - 3.6 }];
      const p = cands.find((c) => (Math.abs(c.x) > 49.75 || Math.abs(c.z) > 49.75)
        && (Math.abs(c.x - bx) > 4.4 || Math.abs(c.z - bz) > 14.25)
        && Math.hypot(c.x - bx, c.z - bz) <= 6.4);
      if (p) { orders.push({ verb: 'MOVE_HERO', pos: { x: +p.x.toFixed(3), z: +p.z.toFixed(3) } }); st.notes.push(`t=${t} ashore-probe ${JSON.stringify(p)}`); }
      else st.notes.push(`t=${t} no legal step-ashore from (${bx},${bz})`);
    } else if (capped && t > 250 && !st.notAboard && !boat.aboard) {
      st.notAboard = true;
      orders.push({ verb: 'MOVE_HERO', pos: { x: 0, z: 0 } });
      st.notes.push(`t=${t} NA-probe hero=(${now.hero?.x},${now.hero?.z})`);
    }

    // The tail IS the economy. Drain one seam in a block before walking to the next.
    const hx = now.hero?.x ?? -49; const hz = now.hero?.z ?? 0;
    const ranked = live.slice().sort((a, b) => Math.hypot(a.x - hx, a.z - hz) - Math.hypot(b.x - hx, b.z - hz));
    if (ranked.length) {
      const per = Math.max(4, Math.floor((32 - orders.length) / Math.min(3, ranked.length)));
      for (let i = 0; i < Math.min(3, ranked.length) && orders.length < 32; i += 1) {
        for (let k = 0; k < per && orders.length < 32; k += 1) orders.push({ verb: 'HARVEST', seam: ranked[i].id });
      }
    } else {
      for (const id of st.seamIds.slice(0, 3)) {
        for (let k = 0; k < 6 && orders.length < 32; k += 1) orders.push({ verb: 'HARVEST', seam: id });
      }
    }
    st.notes.push(`t=${t} pan gold=${gold} live=${ranked.length} n=${orders.length}`);
    return send(orders);
  };
}
