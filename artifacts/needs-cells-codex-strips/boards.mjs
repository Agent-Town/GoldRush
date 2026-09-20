import { readFileSync } from 'node:fs';
import { board } from '../needs-cells-art-batch/board.mjs';
const contract = JSON.parse(readFileSync('assets/layer-contracts/characters.v2.json', 'utf8'));
const slot = (id) => contract.slots.find((x) => x.slot === id);
const P = 'assets/processed/';
const TMP = 'artifacts/needs-cells-codex-strips/tmp/';
const A = 'artifacts/needs-cells-codex-strips/after/';
const Q4 = ['r0c0', 'r0c1', 'r1c0', 'r1c1'];
const live = (slotId, dir) => {
  const b = slot(slotId).walk4;
  const d = b.directions[dir] ?? b.directions[b.aliases?.[dir]];
  return d.frames.files.map((f) => P + f);
};
const fresh = (stem) => Q4.map((c) => `${TMP}${stem}-${c}.png`);

const JD = ['s', 'e', 'se', 'sw', 'ne', 'nw'];
console.log(await board(JD.map((d) => ({ label: `jumper ${d} (live)`, files: live('char.claim_jumper', d) })), A + 'jumper-before.png', 160));
console.log(await board(JD.map((d) => ({ label: `jumper ${d} (new)`, files: fresh(`char-jumper-${d}4-codex-v1`) })), A + 'jumper-after.png', 160));
console.log(await board([
  { label: 'wrecker se -> aliased to e (live)', files: live('char.e2.steam_wrecker', 'se') },
  { label: 'wrecker se (new)', files: fresh('char-steamwrecker-se4-v1') },
  { label: 'wrecker s (live neighbour)', files: live('char.e2.steam_wrecker', 's') },
  { label: 'wrecker sw (live neighbour)', files: live('char.e2.steam_wrecker', 'sw') },
], A + 'wrecker-before-after.png', 180));
// Whole-family after board: the eight jumper winds and the eight wrecker winds as they will read once wired.
const jAfter = ['s', 'se', 'e', 'ne', 'n', 'nw', 'w', 'sw'].map((d) => ({ label: `jumper ${d}`,
  files: JD.includes(d) ? fresh(`char-jumper-${d}4-codex-v1`) : live('char.claim_jumper', d) }));
console.log(await board(jAfter, A + 'jumper-family-after.png', 128));
const wAfter = ['s', 'se', 'e', 'ne', 'n', 'nw', 'w', 'sw'].map((d) => ({ label: `wrecker ${d}`,
  files: d === 'se' ? fresh('char-steamwrecker-se4-v1') : live('char.e2.steam_wrecker', d) }));
console.log(await board(wAfter, A + 'wrecker-family-after.png', 128));
