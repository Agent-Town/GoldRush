// v3: no builds (v2 proved the relay sites are out of the fight). The draft is the
// only compounding lever: survive on plating/dressing, spend everything else on kill rate.
const SURV = ['field_dressing', 'tinkers_plating'];
const KILL = ['split_spark', 'double_tap_coil', 'heavy_spark', 'long_resonator', 'sharpen',
  'powder_charge', 'quick_fuse', 'wide_ring'];
const JUNK = ['spring_heels', 'pan_legend', 'prospectors_luck', 'beacon_dynamo', 'assay_bonus', 'auto_pan'];

export function score(now) {
  const offer = now.pendingOffer || [];
  if (!offer.length) return null;
  const ids = offer.map((o) => o.id);
  const frac = now.hero.hp / now.hero.maxHp;
  const taken = now.hero.upgradesTaken || {};
  const plate = taken.tinkers_plating || 0;
  const order = [];
  if (frac < 0.5) order.push('field_dressing', 'tinkers_plating');
  if (plate < 3) order.push('tinkers_plating');
  if (frac < 0.75) order.push('field_dressing');
  order.push(...KILL, ...SURV, ...JUNK);
  for (const id of order) if (ids.includes(id)) return id;
  return ids[0];
}

export default function controller(view) {
  const now = view.now;
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
  const o = [];
  const pick = score(now);
  if (pick) o.push({ verb: 'PICK_UPGRADE', id: pick });
  o.push({ verb: 'SET_WEAPON', weapon: 'rig' });
  const hx = now.hero.x, hz = now.hero.z;
  const ring = [[0, 0], [0, 3], [3, 0], [0, -3], [-3, 0], [2, 2], [-2, 2], [2, -2], [-2, -2], [0, 5], [5, 0], [-5, 0]];
  for (const [dx, dz] of ring) o.push({ verb: 'BLAST_AT', pos: { x: hx + dx, z: hz + dz } });
  const live = (now.seams || []).filter((s) => s.active && s.x !== null);
  if (live.length) {
    const px = now.prospector.x, pz = now.prospector.z;
    live.sort((a, b) => Math.hypot(a.x - px, a.z - pz) - Math.hypot(b.x - px, b.z - pz));
    while (o.length < 31) o.push({ verb: 'HARVEST', seam: live[0].id });
  }
  return o.slice(0, 32);
}
