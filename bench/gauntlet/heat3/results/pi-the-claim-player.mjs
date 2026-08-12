#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { writeFileSync } from 'node:fs';

const args = ['scripts/gr-sim.mjs', '--contract', 'the-claim', '--seed', 'e1-the-claim-02'];
const child = spawn(process.execPath, args, { stdio: ['pipe', 'pipe', 'inherit'] });
const rl = createInterface({ input: child.stdout });
const transcript = [];

function policy(view) {
  if (view.now?.pendingOffer?.length) {
    const offer = view.now.pendingOffer;
    const priorities = ['split_spark', 'double_tap_coil', 'heavy_spark', 'tinkers_plating', 'long_resonator', 'spring_heels', 'prospectors_luck', 'pan_legend', 'quick_fuse', 'wide_ring'];
    const pick = priorities.map(id => offer.find(x => x.id === id)).find(Boolean) ?? offer[0];
    return [{ verb: 'PICK_UPGRADE', id: pick.id }];
  }
  if (view.now?.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
  const claim = view.stablePrefix?.map?.claim ?? { x: 0, z: 12 };
  const seams = view.now?.seams ?? [];
  const seam = seams.find(s => s.active && s.id === 'gold-seam-2')?.id
    ?? seams.find(s => s.active)?.id ?? 'gold-seam-2';
  const entries = view.now?.works?.entries ?? [];
  const count = id => entries.filter(e => e.id === id && !e.wrecked).length;
  const plans = [
    ['palisade', -2, 10, 10], ['palisade', 2, 10, 10],
    ['palisade', -3, 12, 10], ['palisade', 3, 12, 10],
    ['palisade', -2, 14, 10], ['palisade', 2, 14, 10],
    ['palisade', 0, 9, 10], ['palisade', 0, 15, 10],
  ];
  const seen = {};
  const builds = [];
  for (const [what, x, z, cost] of plans) {
    seen[what] = (seen[what] ?? 0) + 1;
    if (count(what) < seen[what]) builds.push({ verb: 'BUILD', what, where: { x, z }, when: { goldGte: cost } });
  }
  return [
    { verb: 'SET_WEAPON', weapon: 'rig' },
    ...(view.now?.blastReadyInMs === 0 ? [{ verb: 'BLAST_AT', pos: claim }] : []),
    { verb: 'REPAIR_UNDER', pct: 65 },
    ...(builds.length ? [{ verb: 'MOVE_TO', pos: claim }, ...builds] : []),
    { verb: 'HARVEST', seam },
    { verb: 'FALLBACK_IF', threat: { enemiesGte: 12 }, pos: claim },
  ];
}

rl.on('line', line => {
  let value;
  try { value = JSON.parse(line); } catch { console.log(line); return; }
  transcript.push(value);
  if (value?.schema === 'goldrush.view.v1' && !value.now?.terminal) {
    child.stdin.write(JSON.stringify(policy(value)) + '\n');
  } else if (value?.secured !== undefined) {
    console.log(JSON.stringify(value));
  }
});
child.on('close', code => {
  if (process.env.GR_TRANSCRIPT) writeFileSync(process.env.GR_TRANSCRIPT, JSON.stringify(transcript, null, 2));
  process.exitCode = code ?? 1;
});
