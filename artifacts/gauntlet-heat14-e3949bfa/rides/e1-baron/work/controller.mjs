// Generation 122 controller — e1-baron, seed e1-baron-01.
// The secure is a KILL: autoSecureWaveForRun returns MAX_SAFE_INTEGER while (baron && !baronBeaten).
// Plan (generation 75's named synthesis, funded early):
//   - 4 turrets, then ALL FOUR to tier 2 (x1.65 dps) BEFORE the horn: that is the damage budget.
//   - A dense palisade ring around the hero post. Enemy.chooseTarget: a baron inside pursuitRange 18
//     attacks ONLY a palisade blocking its straight route to the hero, else walks the hero.
//     baronRocketMeleeSuppressed: rockets are OFF while the nearest building is within
//     wreck.reach(1.1) * visualScale(4) + 0.35 = 4.75 of the baron. So timber = leash + silencer,
//     and there is no line-of-sight term, so the turrets keep firing through it.
//   - REPAIR_UNDER ungated: it is bounded to sparkRig range 10 around the Prospector, which drifts
//     to the hero, so a ring at radius <= 9 is inside the sweep. Palisade mend is 25% of 10g.

const TURRET_TIER2 = 150;

export function makeController() {
  let post = null;            // hero post {x,z}
  let ring = [];              // palisade candidate coords
  let turretSpots = [];
  let beaconSpots = [];
  const poisoned = new Set(); // GROUND refusals only
  const placed = [];          // my own successful builds, by id
  let lastSig = '';
  let upgradeIdx = 0;

  const key = (p) => `${p.x},${p.z}`;

  function initGeometry(view) {
    const sp = view.stablePrefix || {};
    const n = view.now || {};
    post = { x: Math.round(n.hero?.x ?? 0), z: Math.round(n.hero?.z ?? 0) };

    // Turrets: range 16, want them covering the post and the ring. Tight cluster, integer lattice.
    turretSpots = [
      { x: post.x - 4, z: post.z + 2 }, { x: post.x + 4, z: post.z + 2 },
      { x: post.x - 4, z: post.z - 2 }, { x: post.x + 4, z: post.z - 2 },
      { x: post.x - 6, z: post.z }, { x: post.x + 6, z: post.z },
      { x: post.x, z: post.z + 4 }, { x: post.x, z: post.z - 4 },
      { x: post.x - 2, z: post.z + 5 }, { x: post.x + 2, z: post.z + 5 },
    ];
    beaconSpots = [
      { x: post.x - 2, z: post.z + 2 }, { x: post.x + 2, z: post.z + 2 },
      { x: post.x - 2, z: post.z - 2 }, { x: post.x + 2, z: post.z - 2 },
      { x: post.x, z: post.z + 2 }, { x: post.x, z: post.z - 2 },
      { x: post.x - 5, z: post.z + 4 }, { x: post.x + 5, z: post.z + 4 },
    ];
    // Dense ring: two radii so gaps in one are covered by the other. Integer lattice (gridSnap 1).
    const seen = new Set();
    ring = [];
    for (const r of [8, 9, 7, 10, 11]) {
      for (let a = 0; a < 360; a += 6) {
        const rad = (a * Math.PI) / 180;
        const p = { x: Math.round(post.x + Math.cos(rad) * r), z: Math.round(post.z + Math.sin(rad) * r) };
        const k = key(p);
        if (seen.has(k)) continue;
        seen.add(k);
        ring.push(p);
      }
    }
  }

  function costOf(view, id) {
    const b = (view.stablePrefix?.mechanics?.buildables || []).find((x) => x.id === id);
    const standing = view.now?.works?.byKind?.[id] ?? 0;
    if (!b) return Infinity;
    const costs = b.costs || [];
    return costs[standing] ?? costs[costs.length - 1] ?? Infinity;
  }
  function capOf(view, id) {
    const b = (view.stablePrefix?.mechanics?.buildables || []).find((x) => x.id === id);
    return b?.maxCount ?? 0;
  }

  function pickSpot(list) {
    for (const p of list) if (!poisoned.has(key(p))) return p;
    return null;
  }

  return {
    onView(view) {
      const n = view.now || {};
      if (!post) initGeometry(view);

      // --- refusal blacklist: GROUND poisons the coordinate, ECONOMY never does ---
      for (const rec of n.orders || []) {
        if (rec.status !== 'failed') continue;
        const o = rec.order || {};
        if (o.verb !== 'BUILD' || !o.where) continue;
        const reason = String(rec.reason || '').toLowerCase();
        if (reason.includes('insufficient') || reason.includes('gold')) continue; // ECONOMY: retry
        poisoned.add(key({ x: o.where.x, z: o.where.z }));
      }

      const orders = [];

      // 1. Draft first (replace semantics). Plating first, then heals, then damage.
      if (Array.isArray(n.pendingOffer) && n.pendingOffer.length) {
        const score = (u) => {
          const s = `${u.id} ${u.name} ${u.effectText}`.toLowerCase();
          if (/plating|max hp|maxhp|vitality|tough/.test(s)) return 100;
          if (/heal|regen|mend|dressing/.test(s)) return 80;
          if (/damage|spark|coil|tap|power/.test(s)) return 60;
          return 10;
        };
        const best = [...n.pendingOffer].sort((a, b) => score(b) - score(a))[0];
        orders.push({ verb: 'PICK_UPGRADE', id: best.id });
      }

      const wave = n.wave ?? 0;
      const gold = n.gold ?? 0;
      const byKind = n.works?.byKind || {};
      const nTurret = byKind.turret ?? 0;
      const entries = n.works?.entries || [];
      const tiers = entries.filter((e) => e.id === 'turret');
      const needTier = tiers.filter((e) => (e.tier ?? 1) < 2);

      // 2. Free supplementary blast, above any traveller (returns {} either way).
      if ((n.blastReadyInMs ?? 1) === 0) {
        orders.push({ verb: 'BLAST_AT', pos: { x: post.x, z: post.z + 6 } });
      }

      // 3. Ungated mend: bounded to rig range around the Prospector, which drifts to the hero.
      orders.push({ verb: 'REPAIR_UNDER', pct: 99 });

      // 4. Tier-2 turrets BEFORE the horn. CONTEXT_ACTION does not travel, so pair with MOVE_HERO.
      //    Never during the boss fight: a walking MOVE_HERO owns the tick.
      let travelling = false;
      const ringDone = (byKind.palisade ?? 0) >= 40;
      if (wave < 19 && ringDone && needTier.length && gold >= TURRET_TIER2 && nTurret >= 2) {
        const tgt = needTier[upgradeIdx % needTier.length];
        const p = tgt.position || {};
        const dx = (n.hero?.x ?? 0) - (p.x ?? 0);
        const dz = (n.hero?.z ?? 0) - (p.z ?? 0);
        const d = Math.hypot(dx, dz);
        if (d > 1.4) {
          const ux = d > 0.001 ? dx / d : 0, uz = d > 0.001 ? dz / d : 1;
          orders.push({ verb: 'MOVE_HERO', pos: { x: +(p.x + ux * 0.8).toFixed(2), z: +(p.z + uz * 0.8).toFixed(2) } });
          travelling = true;
        }
        orders.push({ verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: 'turret', index: tgt.index } });
        upgradeIdx += 1;
      } else if (Math.hypot((n.hero?.x ?? 0) - post.x, (n.hero?.z ?? 0) - post.z) > 1.0) {
        // come home, above the tail
        orders.push({ verb: 'MOVE_HERO', pos: { x: post.x, z: post.z } });
        travelling = true;
      }

      // 5. ONE ladder, ONE ordinal per id, priced at the live instance.
      //    Strategy order: turrets (damage) -> a little chaff/beacon -> RING -> beacons.
      const ladder = [];
      const tCap = Math.min(4, capOf(view, 'turret'));
      for (let i = nTurret; i < tCap; i += 1) ladder.push({ id: 'turret', list: turretSpots });
      const nBeacon = byKind.sentry_beacon ?? 0;
      for (let i = nBeacon; i < Math.min(3, capOf(view, 'sentry_beacon')); i += 1) {
        ladder.push({ id: 'sentry_beacon', list: beaconSpots });
      }

      // The ring is the LEASH and the ROCKET SILENCER, and it is what the hero's life is made of.
      // It must never be gated behind a spend that can silently never fire (tune-1 lost the run
      // that way: entries[].tier defaults to 1, so a `needTier` gate is permanently true).
      const ringWanted = wave >= 3 && nTurret >= 2;
      const nPal = byKind.palisade ?? 0;
      const palCap = Math.min(48, capOf(view, 'palisade'));

      let emitted = 0;
      if (!travelling) {
        for (const rung of ladder) {
          const c = costOf(view, rung.id);
          if (!Number.isFinite(c) || gold < c) break;
          const spot = pickSpot(rung.list);
          if (!spot) continue; // rung RETIRED, never stalls the rungs behind it
          orders.push({ verb: 'BUILD', what: rung.id, where: spot, when: { goldGte: c } });
          emitted += 1;
          if (emitted >= 2) break;
        }
        // Ring: dense and complete, funded straight out of a purse that otherwise pins at the cap.
        if (ringWanted && nPal < palCap && emitted < 12) {
          const budget = Math.max(0, Math.floor((gold - 10) / 10));
          const want = Math.min(budget, palCap - nPal, 14 - emitted);
          for (let i = 0; i < want; i += 1) {
            const spot = pickSpot(ring.filter((p) => !placed.includes(key(p))));
            if (!spot) break;
            placed.push(key(spot));
            orders.push({ verb: 'BUILD', what: 'palisade', where: spot, when: { goldGte: 10 } });
            emitted += 1;
          }
        }
      }

      // 6. Harvest tail — the clock AND the economy. Finite-filter first (inactive seams publish nulls).
      const seams = (n.seams || []).filter(
        (s) => s.active !== false && Number.isFinite(s.x) && Number.isFinite(s.z),
      );
      const ranked = seams
        .map((s) => ({ s, d: Math.hypot(s.x - post.x, s.z - post.z) }))
        .sort((a, b) => a.d - b.d);
      const chain = ranked.length ? ranked.slice(0, 2).map((r) => r.s) : [];
      const room = 32 - orders.length;
      if (chain.length) {
        for (let i = 0; i < room; i += 1) {
          orders.push({ verb: 'HARVEST', seam: chain[Math.floor(i / 6) % chain.length].id });
        }
      } else if (room > 0) {
        // never let the array end empty of work: name the nearest ANCHOR anyway
        const anchors = view.stablePrefix?.map?.harvestAnchors || [];
        const id = (n.seams || [])[0]?.id;
        if (id) for (let i = 0; i < Math.min(room, 6); i += 1) orders.push({ verb: 'HARVEST', seam: id });
      }

      // Secure boundary: SILENCE. It takes the bank default and cannot be rejected,
      // so the replay cannot diverge on refused in-window submissions.
      if (n.pendingSecure) return null;

      const arr = orders.slice(0, 32);
      const sig = JSON.stringify(arr);
      if (sig === lastSig && !n.pendingOffer) return null; // blank line: cheap, unrejectable
      lastSig = sig;
      return arr;
    },
  };
}
