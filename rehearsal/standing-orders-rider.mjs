// THE RIDER TRANSPORT — the page-side half of the standing-orders rehearsal (AP-01/AP-03).
//
// WHY THIS FILE EXISTS AT ALL (finding, not a design choice): the shipped game installs a
// ToolSurface (Game.ts:2055 -> AgentStub.install -> ToolSurface.install) but attaches it to an
// anonymous adapter literal, so `et.goldrush.view` and `et.goldrush.orders` have NO window handle
// in any build. `?debug` exposes only the AgentStub (pan/repair/chase/collect/place), which does
// not carry submit_orders. An external rider therefore has to construct its own surface over the
// game's own published telemetry. That is what this does — and nothing more:
//   * the permission rung is READ FROM THE GAME (diagnostics.agent.stub.permissionLevel), never set;
//   * consent is read by StandingOrders itself out of diagnostics.ui.agent.consent;
//   * the only actuator implemented is place_building, and it fires a real click on the real canvas
//     at the pilot's real, calibrated pointer position — no teleport, no grant, no manual sim.
// Everything the shipped adapter cannot reach from outside (repair / collect_xp / collect_gold) is
// deliberately LEFT UNIMPLEMENTED so the rehearsal measures the true gap instead of papering it.

export const BUILDABLE_COUNT_FIELD = {
  sentry_beacon: 'beacons',
  palisade: 'palisades',
  sluice: 'sluices',
  stockpile: 'stockpiles',
  boiler_house: 'boilerHouses',
  turret: 'turrets',
  assay_office: 'assayOffices',
  lantern_post: 'lanternPosts',
  capacitor_bank: 'capacitorBanks',
};

export const RIDER_SCRIPT = `
const COUNT_FIELD = ${JSON.stringify(BUILDABLE_COUNT_FIELD)};
const D = () => window.__THREE_GAME_DIAGNOSTICS__;
const canvas = () => document.querySelector('#game-canvas');
const countOf = (def, d) => (d && d.build ? d.build[COUNT_FIELD[def]] ?? 0 : 0);

window.__RIDER__ = {
  ready: false,
  aim: null,          // { clientX, clientY } — where the pilot's REAL mouse is parked
  aimWorld: null,     // the ground point that pointer resolves to, per diagnostics.build.ghostPos
  harvest: null,      // seam id assigned by a HARVEST order
  actions: [],        // audit of every side-effect the adapter attempted
  builds: [],         // audit of every place_building attempt, requested vs actually placed
};

const adapter = {
  // The rung is the GAME's, not ours. Whatever the meta track + policy slots say, we obey.
  metaProgress: {
    get agentAutonomyLevel() {
      const d = D();
      return (d && d.agent && d.agent.stub ? d.agent.stub.permissionLevel : 0) ?? 0;
    },
  },
  diagnostics: () => D(),
  // The economy LOG is Game-private (Game.ts:2058 closes over this.economy.log). An external
  // rider cannot read it; THE VIEW's score block is therefore empty for us. Reported, not faked.
  economyLog: () => [],
  placeBuilding: (def, pos, rot = 0) => {
    const R = window.__RIDER__;
    const d0 = D();
    const rec = {
      at: d0 && d0.timeAlive || 0,
      wave: d0 && d0.wave || 0,
      def,
      requested: { x: pos.x, z: pos.z },
      staged: R.aimWorld ? { x: R.aimWorld.x, z: R.aimWorld.z } : null,
      goldBefore: d0 && d0.economy ? d0.economy.gold : null,
    };
    const fail = (why) => { rec.result = why; R.builds.push(rec); return false; };
    if (!d0 || !d0.build) return fail('no-diagnostics');
    if (d0.build.mode !== true) return fail('build-mode-off');
    if (d0.build.selectedBuildable !== def) return fail('wrong-selection:' + d0.build.selectedBuildable);
    if (!R.aim) return fail('unstaged-no-aim');
    const c = canvas();
    if (!c) return fail('no-canvas');
    // WHY THE RECEIPT IS DECIDED BEFORE THE CLICK, not after it. Diagnostics are published ONCE
    // PER FRAME (Game.publishDiagnostics), so anything read in the same JS turn as the click is a
    // snapshot from BEFORE it — attempt 2 of the-claim marked two genuinely-placed turrets
    // "rejected" that way, failed both orders, and fired two false surprises. There is no
    // page-observable synchronous signal from BuildSystem.confirm. So the receipt is gated on the
    // GAME'S OWN verdict for this exact cell — build.ghostValid, which is computeValid() over
    // count/gold/terrain/radius/overlap, the same predicate confirm() re-runs before it spends —
    // and the pilot writes the ground truth into rec.verified one frame later. Nothing is assumed
    // true that the game did not already say was placeable.
    rec.preValid = d0.build.ghostValid === true;
    rec.preCount = countOf(def, d0);
    rec.preGhost = d0.build.ghostPos ? { x: d0.build.ghostPos.x, z: d0.build.ghostPos.z } : null;
    if (!rec.preValid) return fail('cell-invalid-per-game');
    // The real click, at the real pointer position the pilot calibrated with page.mouse.move.
    // BuildSystem.onCanvasClick reads event.clientX/Y, recomputes the ground point synchronously
    // (placementPoint -> updateGhostPosition) and confirms — so this is one honest placement.
    c.dispatchEvent(new MouseEvent('click', {
      bubbles: true, cancelable: true, view: window,
      clientX: R.aim.clientX, clientY: R.aim.clientY,
    }));
    rec.result = 'clicked';
    rec.verified = null; // the pilot fills this from the next published frame
    R.builds.push(rec);
    return true;
  },
  panAt: (node) => {
    const R = window.__RIDER__;
    R.harvest = node;
    R.actions.push({ tool: 'pan_at', node, at: (D() || {}).timeAlive || 0 });
    // HARNESS INTERPRETATION, declared: the shipped adapter has no panAt at all, so HARVEST is
    // NO_SYSTEM_API on main. Here it means "the rider works that seam" — the reflex clock walks
    // the hero there and stands still; the game's own HarvestSystem pays out. Nothing is granted.
    return { node, assignedToRider: true };
  },
  // repair / collectXp / collectGold: intentionally ABSENT. They live behind Game-private methods
  // (Game.ts:2059-2061) with no external seam, so REPAIR_UNDER honestly returns NO_SYSTEM_API.
};

import('/src/agent/ToolSurface.ts').then((m) => {
  window.__RIDER_SURFACE__ = m.install(adapter);
  window.__RIDER__.ready = true;
}).catch((err) => {
  window.__RIDER_ERROR__ = String(err && err.message || err);
});
`;

/** One compact frame of truth, read in a single page.evaluate per reflex tick. */
export const SNAPSHOT_FN = () => {
  const d = window.__THREE_GAME_DIAGNOSTICS__ || {};
  const surface = window.__RIDER_SURFACE__;
  let ord = { needsRider: false, orders: [], log: [] };
  if (surface) {
    try {
      ord = surface.tools.view().outcome.result;
    } catch {
      /* surface not ready */
    }
  }
  const b = d.build || {};
  return {
    t: d.timeAlive || 0,
    frame: d.frame || 0,
    runState: d.runState || null,
    paused: d.paused === true,
    hp: d.hp || 0,
    maxHp: d.maxHp || 0,
    hero: d.heroPos ? { x: d.heroPos.x, z: d.heroPos.z } : null,
    speed: d.speed || 0,
    wave: d.wave || 0,
    waveState: d.waveState || null,
    nextWaveInSim: d.nextWaveInSim || 0,
    enemies: d.enemiesAlive || 0,
    edge: d.edge || null,
    gold: d.economy ? d.economy.gold : 0,
    bankCap: d.economy ? d.economy.bankCap : 0,
    xp: d.xp || null,
    kills: d.kills || 0,
    contract: d.contract ? d.contract.activeId : null,
    secureWave: d.contract ? d.contract.secureWave : null,
    difficulty: d.difficultyPreset || null,
    secured: !!(d.run && d.run.secured),
    perm: d.agent && d.agent.stub ? d.agent.stub.permissionLevel : 0,
    build: {
      mode: b.mode === true,
      sel: b.selectedBuildable || null,
      ghostPos: b.ghostPos || null,
      ghostValid: b.ghostValid === true,
      nextCost: b.nextCost || null,
      turrets: b.turrets || 0,
      beacons: b.beacons || 0,
      sluices: b.sluices || 0,
      palisades: b.palisades || 0,
      stockpiles: b.stockpiles || 0,
      hp: (b.hp || []).map((e) => ({ id: e.id, index: e.index, hp: e.hp, maxHp: e.maxHp, wrecked: e.wrecked === true })),
    },
    seams: ((d.harvest || {}).activeNodes || []).map((n) => ({
      id: n.id,
      active: n.active === true,
      x: n.position ? n.position.x : 0,
      z: n.position ? n.position.z : 0,
      remaining: n.remaining || 0,
    })),
    orders: (ord.orders || []).map((o) => ({ id: o.id, status: o.status, verb: o.order.verb, order: o.order, reason: o.reason })),
    needsRider: ord.needsRider === true,
    surpriseCount: (ord.log || []).filter((e) => e.type === 'surprise').length,
    riderHarvest: window.__RIDER__ ? window.__RIDER__.harvest : null,
    riderReady: !!(window.__RIDER__ && window.__RIDER__.ready),
    // proof-of-honesty probes, sampled every tick
    hasGrTest: typeof window.__GR_TEST__ !== 'undefined',
    hasGrAgent: typeof window.__GR_AGENT__ !== 'undefined',
    search: window.location.search,
  };
};
