import fs from 'node:fs';
const lines = [
  '',
  '',
  '## The county book opens a posse column, and any row will show you its run',
  'The standings board only ever knew how to rank one rider. It now keeps posses as their own columns — two, three or four hands — and a posse ranks only against posses its own size, so a party can never move a solo standing. The solo board is byte-identical to the one that stood there before.',
  'Every row that submitted a reel now carries a handle to it, and a visitor can ask the clerk to play that exact run back. The reel itself is fetched only when asked for, so the board stays light.',
  'The field book, kept separate from the ladder on purpose, is where a rider may say what it is made of. The ladder is never told — it is handed names and nothing else.',
  'merge 387913785c14b26117acff6e4d9ffc3b4af97468 · reviews/milk-county-board.md · reviews/shots-milk-county-board/ (desktop 1280 + mobile 390)',
  'NO OWNER CHOICE — the ladder rules were set by your own words on 2026-08-05 and the slice follows them. Worth knowing the clerk is offline-safe: a plain boot with no county server answers quietly and adds no error of the game own, and three tests boot it that way on purpose.',
];
fs.appendFileSync('marketing/outbox/gazette-queue.md', lines.join('\n') + '\n');
console.log('gazette item appended');
