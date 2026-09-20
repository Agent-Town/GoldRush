import { readFileSync } from 'node:fs';
import { board } from '../needs-cells-art-batch/board.mjs';
const contract = JSON.parse(readFileSync('assets/layer-contracts/characters.v2.json', 'utf8'));
const slot = (id) => contract.slots.find((x) => x.slot === id);
const P = 'assets/processed/', TMP = 'artifacts/needs-cells-codex-strips/tmp/', A = 'artifacts/needs-cells-codex-strips/after/';
const Q4 = ['r0c0', 'r0c1', 'r1c0', 'r1c1'];
const live = (s, d) => { const b = slot(s).walk4; return (b.directions[d] ?? b.directions[b.aliases?.[d]]).frames.files.map((f) => P + f); };
const fresh = (stem) => Q4.map((c) => `${TMP}${stem}-${c}.png`);
// Wrecker heading comparison: phase 1 and 3 of each of the four south/east headings, big.
await board([
  { label: 'live s', files: [live('char.e2.steam_wrecker', 's')[0], live('char.e2.steam_wrecker', 's')[2]] },
  { label: 'NEW se', files: [fresh('char-steamwrecker-se4-v1')[0], fresh('char-steamwrecker-se4-v1')[2]] },
  { label: 'live e (today’s se alias)', files: [live('char.e2.steam_wrecker', 'e')[0], live('char.e2.steam_wrecker', 'e')[2]] },
  { label: 'live sw', files: [live('char.e2.steam_wrecker', 'sw')[0], live('char.e2.steam_wrecker', 'sw')[2]] },
], A + 'wrecker-heading-zoom.png', 380);
// Jumper heading comparison: phase 1 of each new row beside the live cardinal it borders.
await board([
  { label: 's / se / e', files: [...fresh('char-jumper-s4-codex-v1').slice(0, 2), ...fresh('char-jumper-se4-codex-v1').slice(0, 2), ...fresh('char-jumper-e4-codex-v1').slice(0, 2)] },
  { label: 'sw / ne / nw', files: [...fresh('char-jumper-sw4-codex-v1').slice(0, 2), ...fresh('char-jumper-ne4-codex-v1').slice(0, 2), ...fresh('char-jumper-nw4-codex-v1').slice(0, 2)] },
  { label: 'live n / live w / live sheet-b sw (replaced)', files: [live('char.claim_jumper', 'n')[0], live('char.claim_jumper', 'n')[1], live('char.claim_jumper', 'w')[0], live('char.claim_jumper', 'w')[1], live('char.claim_jumper', 'sw')[0], live('char.claim_jumper', 'sw')[1]] },
], A + 'jumper-heading-zoom.png', 250);
console.log('ok');
