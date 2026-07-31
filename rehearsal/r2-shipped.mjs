// ROUND 2 — THE SHIPPED PIPELINE ONLY.
//
// Round 1 built its own ToolSurface over its own adapter because BUILD and HARVEST died with
// NO_SYSTEM_API on main (F-SO-1). ap-06b re-landed the adapter, so round 2's law is: every verb
// executes through the surface the GAME installs (Game.ts:2058 -> AgentStub.install ->
// ToolSurface.install), over the GAME's own adapter (Game.ts:2059-2110). Nothing here implements a
// game verb. The only thing this file does is OBTAIN A HANDLE on the shipped object.
//
// WHY A HANDLE HAS TO BE OBTAINED AT ALL (F-SO-2, still open): ToolSurface.install stores the
// surface on the anonymous adapter literal (`game.agentTools`), which nothing outside Game can
// reach, and attaches a `view` getter to window.__GR_AGENT__ *only if it already exists* —
// and __GR_AGENT__ exists only under ?debug (AgentStub.ts:54), which the honest-play gate forbids.
// So a plain boot publishes NO door to et.goldrush.view / et.goldrush.orders.
//
// The capture below is the SAME technique the shipped conformance spec uses to reach the
// production surface without ?debug (e2e/ap-standing-orders.spec.ts:88-113): wrap
// WeakMap.prototype.set and keep the object `createToolSurface` registers in its
// `standingOrdersBySurface` map (ToolSurface.ts:196). It is an observation hook, not a transport:
// it constructs nothing, grants nothing, and changes no game state. Every call this rehearsal
// makes is a method ON THE GAME'S OWN SURFACE OBJECT.
//
// Difference from the spec: the spec un-patches after the first capture. A campaign plays many
// runs and each run builds a NEW surface (installAgentStub runs per contract boot), so the hook
// stays armed and always keeps the newest one.

export const CAPTURE_SCRIPT = `
(() => {
  if (window.__R2_HOOKED__) return;
  window.__R2_HOOKED__ = true;
  window.__R2_SURFACE__ = undefined;
  window.__R2_SURFACE_SEQ__ = 0;
  const proto = WeakMap.prototype;
  const originalSet = proto.set;
  proto.set = function (key, value) {
    if (key && key.namespace === 'et.goldrush' && key.tools && typeof key.tools.submit_orders === 'function') {
      window.__R2_SURFACE__ = key;
      window.__R2_SURFACE_SEQ__ = (window.__R2_SURFACE_SEQ__ || 0) + 1;
    }
    return originalSet.call(this, key, value);
  };
})();
`;

/** Proof the captured object is the GAME's surface and not something this harness made. */
export const SURFACE_PROVENANCE_FN = () => {
  const s = window.__R2_SURFACE__;
  const d = window.__THREE_GAME_DIAGNOSTICS__ || {};
  if (!s) return { captured: false };
  return {
    captured: true,
    seq: window.__R2_SURFACE_SEQ__ || 0,
    namespace: s.namespace,
    capabilities: (s.capabilities || []).map((c) => ({ id: c.id, level: c.level, tools: c.tools })),
    surfacePermissionLevel: s.permissionLevel(),
    diagnosticsPermissionLevel: d.agent && d.agent.stub ? d.agent.stub.permissionLevel : null,
    // The production adapter is the only one that implements all four ability groups; a synthetic
    // adapter would advertise a subset. Recorded verbatim so the review can show the match.
    toolKeys: Object.keys(s.tools).sort(),
    // The doors the doctrine assumes exist, measured:
    windowAgentStub: typeof window.__GR_AGENT__ !== 'undefined',
    windowAgentHasSubmitOrders: !!(window.__GR_AGENT__ && window.__GR_AGENT__.surface
      && window.__GR_AGENT__.surface.tools && window.__GR_AGENT__.surface.tools.submit_orders),
    windowTest: typeof window.__GR_TEST__ !== 'undefined',
  };
};

/** et.goldrush.view — one call, both halves: outcome.state is THE VIEW, outcome.result is ORDERS. */
export const VIEW_FN = () => {
  const s = window.__R2_SURFACE__;
  if (!s) return { error: 'no-surface' };
  const t0 = performance.now();
  const receipt = s.tools.view();
  const ms = performance.now() - t0;
  return { view: receipt.outcome.state, orders: receipt.outcome.result, buildMs: Math.round(ms * 100) / 100 };
};

/** One compact frame of published telemetry per reflex tick. No surface call: buildView() runs a
 *  stat-sim harness every time it is asked (View.ts:295), so polling it at reflex rate would be a
 *  measurement that changes what it measures. Orders are refreshed on a slower clock. */
export const SNAPSHOT_FN = () => {
  const d = window.__THREE_GAME_DIAGNOSTICS__ || {};
  const b = d.build || {};
  const ord = window.__R2_ORDERS__ || { needsRider: false, orders: [], log: [] };
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
    kills: d.kills || 0,
    contract: d.contract ? d.contract.activeId : null,
    secureWave: d.contract ? d.contract.secureWave : null,
    difficulty: d.difficultyPreset || null,
    secured: !!(d.run && d.run.secured),
    perm: d.agent && d.agent.stub ? d.agent.stub.permissionLevel : 0,
    prospector: d.agent && d.agent.embodiment ? d.agent.embodiment.position : null,
    build: {
      mode: b.mode === true,
      sel: b.selectedBuildable || null,
      nextCost: b.nextCost || null,
      placeRadius: b.placeRadius || null,
      reason: b.reason || null,
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
    surfaceReady: !!window.__R2_SURFACE__,
    // proof-of-honesty probes, sampled every tick
    hasGrTest: typeof window.__GR_TEST__ !== 'undefined',
    hasGrAgent: typeof window.__GR_AGENT__ !== 'undefined',
    search: window.location.search,
  };
};
