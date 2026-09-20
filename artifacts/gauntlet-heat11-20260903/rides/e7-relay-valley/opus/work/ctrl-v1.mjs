// v1: isolate the sustain question. No builds. Upgrades + blast + harvest.
const HEAL_FIRST = ['field_dressing', 'tinkers_plating'];
const TANK = ['tinkers_plating'];
const DPS = ['heavy_spark', 'split_spark', 'double_tap_coil', 'long_resonator', 'sharpen', 'powder_charge', 'quick_fuse', 'wide_ring'];
const JUNK = ['spring_heels', 'pan_legend', 'prospectors_luck', 'beacon_dynamo', 'assay_bonus', 'auto_pan'];

export function pickUpgrade(now) {
  const offer = now.pendingOffer || [];
  if (!offer.length) return null;
  const ids = offer.map((o) => o.id);
  const hurt = now.hero.hp / now.hero.maxHp;
  const taken = now.hero.upgradesTaken || {};
  const has = (id) => taken[id] || 0;
  const order = [];
  if (hurt < 0.6) order.push(...HEAL_FIRST);
  if (has('tinkers_plating') < 3) order.push(...TANK);
  order.push(...DPS, ...HEAL_FIRST, ...JUNK);
  for (const id of order) if (ids.includes(id)) return id;
  return ids[0];
}

export default function controller(view) {
  const now = view.now;
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
  const o = [];
  const pick = pickUpgrade(now);
  if (pick) o.push({ verb: 'PICK_UPGRADE', id: pick });
  o.push({ verb: 'SET_WEAPON', weapon: 'rig' });

  // Free AoE at the hero's own feet: enemies converge there. Stacked, so each
  // order_failure (cooldown) buys a decision point and the next view fires again.
  const hx = now.hero.x, hz = now.hero.z;
  const ring = [[0, 0], [0, 3], [3, 0], [0, -3], [-3, 0], [2, 2], [-2, 2], [2, -2], [-2, -2], [0, 5], [5, 0], [0, -5]];
  for (const [dx, dz] of ring) o.push({ verb: 'BLAST_AT', pos: { x: hx + dx, z: hz + dz } });

  // Nearest live seam, stacked (gen-15: stack by seam when the seams are far).
  const live = (now.seams || []).filter((s) => s.active && s.x !== null);
  if (live.length) {
    const px = now.prospector.x, pz = now.prospector.z;
    live.sort((a, b) => Math.hypot(a.x - px, a.z - pz) - Math.hypot(b.x - px, b.z - pz));
    const n = Math.max(0, 31 - o.length);
    for (let i = 0; i < n; i++) o.push({ verb: 'HARVEST', seam: live[0].id });
  }
  return o.slice(0, 32);
}
