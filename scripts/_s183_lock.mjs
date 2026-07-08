import fs from 'node:fs';
const p = 'STATUS.md';
const s = fs.readFileSync(p, 'utf8');
const nl = s.indexOf('\n');
const lock = 'ACTIVE 2026-07-08T01:24:00Z (s183 fire) — verify board post attended-burst; NO-DRAIN expected (main tree dirty w/ attended src: Game.ts/BuildSystem/BuildButton/UiBridge/InputController/buildables); lane/polish now 2-ahead (contract-briefings 5642537 + world-info-notes 66bb9f4) for next quiet cycle.';
fs.writeFileSync(p, lock + s.slice(nl));
console.log('locked');
