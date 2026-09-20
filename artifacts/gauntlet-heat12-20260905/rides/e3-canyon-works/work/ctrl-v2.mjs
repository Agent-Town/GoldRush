// v2 PROBE: pan only. Measures the map's true income ceiling against the wave-6 latch.
// No BUILD at all, so the Prospector never leaves the seam cluster after its opening commute.
const CLAIM = { x: 0, z: -44 };
const SURV = ['tinkers_plating', 'field_dressing', 'iron_lungs'];
const DMG = ['heavy_spark', 'double_tap_coil', 'split_spark', 'long_resonator', 'quick_fuse'];
const d = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

export default function ctrl(view) {
  const n = view.now;
  if (n.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
  const out = [];
  if (n.pendingOffer?.length) {
    let id = n.pendingOffer[0].id;
    for (const p of [SURV, DMG]) { const o = n.pendingOffer.find(x => p.includes(x.id)); if (o) { id = o.id; break; } }
    out.push({ verb: 'PICK_UPGRADE', id });
  }
  if (n.blastReadyInMs === 0) out.push({ verb: 'BLAST_AT', pos: { x: 0, z: -40 } });
  const live = (n.seams || []).filter(s => s.active && Number.isFinite(s.x) && Number.isFinite(s.z));
  const pros = n.prospector && Number.isFinite(n.prospector.x) ? n.prospector : CLAIM;
  live.sort((a, b) => d(a, pros) - d(b, pros));
  const slots = 31 - out.length;
  let k = 0;
  outer: while (k < slots && live.length) {
    for (const s of live) for (let j = 0; j < 6; j++) { if (k >= slots) break outer; out.push({ verb: 'HARVEST', seam: s.id }); k++; }
  }
  out.push({ verb: 'HOLD', pos: live.length ? { x: live[0].x, z: live[0].z } : CLAIM });
  return out.slice(0, 32);
}
