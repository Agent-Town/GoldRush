// Register the accepted rows in assets/layer-contracts/characters.v2.json. Aliased diagonals become
// real registrations (and the alias key is REMOVED - scripts/character-direction-assets.test.mjs
// reds if an alias shadows an explicit direction).
import { readFileSync, writeFileSync } from 'node:fs';
const FILE = 'assets/layer-contracts/characters.v2.json';
const contract = JSON.parse(readFileSync(FILE, 'utf8'));
const slot = (id) => { const s = contract.slots.find((x) => x.slot === id); if (!s) throw new Error('no slot ' + id); return s; };
const cells = (stem, list) => ({ frames: { files: list.map((c) => `${stem}-${c}.png`) },
  clips: { walk: { frames: list.map((_, i) => i), fps: list.length > 4 ? 16 : 8 } } });
const Q4 = ['r0c0', 'r0c1', 'r1c0', 'r1c1'];
const Q8 = ['r0c0', 'r0c1', 'r0c2', 'r0c3', 'r1c0', 'r1c1', 'r1c2', 'r1c3'];
const done = [];
const accepted = new Set(JSON.parse(process.env.NCB_ACCEPTED || '[]'));
const has = (id) => accepted.size === 0 || accepted.has(id);

if (has('baron-e')) {
  const b = slot('char.baron').walk8;
  b.directions.e = cells('char-baron-east8-v1', Q8);
  b.directions.e.clips.walk.fps = b.fps ?? 16;
  done.push('char.baron.walk8.e');
}
if (has('jumper-n') || has('jumper-w')) {
  const j = slot('char.claim_jumper').walk4;
  if (has('jumper-n')) { j.directions.n = cells('char-jumper-north4-v1', Q4); done.push('char.claim_jumper.walk4.n'); }
  if (has('jumper-w')) { j.directions.w = cells('char-jumper-west4-v1', Q4); done.push('char.claim_jumper.walk4.w'); }
}
for (const [slotId, stemBase, prefix] of [['char.e2.steam_wrecker', 'char-steamwrecker', 'wrecker'], ['char.e2.coal_thief', 'char-coalthief', 'thief']]) {
  const block = slot(slotId).walk4;
  for (const dir of ['se', 'sw', 'ne', 'nw']) {
    if (!has(`${prefix}-${dir}`)) continue;
    block.directions[dir] = cells(`${stemBase}-${dir}4-v1`, Q4);
    delete block.aliases[dir];
    done.push(`${slotId}.walk4.${dir}`);
  }
}
writeFileSync(FILE, JSON.stringify(contract, null, 2) + '\n');
console.log('registered:', done.join(', '));
