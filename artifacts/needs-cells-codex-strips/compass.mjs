import { readFileSync } from 'node:fs';
import { board } from '../needs-cells-art-batch/board.mjs';
const contract = JSON.parse(readFileSync('assets/layer-contracts/characters.v2.json', 'utf8'));
const wk = contract.slots.find((x) => x.slot === 'char.claim_jumper').walk4;
const P = 'assets/processed/', T = 'artifacts/needs-cells-codex-strips/tmp/', A = 'artifacts/needs-cells-codex-strips/after/';
const L = (d, i = 0) => P + wk.directions[d].frames.files[i];
const N = (d, i = 0) => `${T}char-jumper-${d}4-codex-v1-${['r0c0', 'r0c1', 'r1c0', 'r1c1'][i]}.png`;
// Read left to right: the compass must sweep continuously. Row A turns from the live west profile
// through the new south winds to the live east profile; row B does the same across the north winds.
await board([
  { label: 'A  live w | NEW sw | NEW s | NEW se | live e', files: [L('w'), N('sw'), N('s'), N('se'), L('e')] },
  { label: 'A2 same, phase 3', files: [L('w', 2), N('sw', 2), N('s', 2), N('se', 2), L('e', 2)] },
  { label: 'B  live w | NEW nw | live n | NEW ne | live e', files: [L('w'), N('nw'), L('n'), N('ne'), L('e')] },
  { label: 'B2 same, phase 3', files: [L('w', 2), N('nw', 2), L('n', 2), N('ne', 2), L('e', 2)] },
], A + 'jumper-compass.png', 290);
console.log('ok');
