import fs from 'fs';
const p = 'STATUS.md';
const lines = fs.readFileSync(p, 'utf8').split('\n');
const prev = lines[0]; // s184 handoff line-1 (huge) — pointer-archive it
const archiveBullet = '- **s184 handoff (line-1 archive):** s184 no-drain (attended HOT: live codex review pid68601 + npm dev pid68024); recorded drainables lane/polish 2-ahead (contract-briefings→world-info-notes) + lane/m3 save-visibility + lane/perf water-depth; gt-04=OAuth auth-fail not credit-wall (defer). …[full text in git @6e15aea]';
lines[0] = 'ACTIVE 2026-07-08T01:56:00Z (s185 fire) — verify board post-s184; NO-DRAIN expected (attended HOT on main: 056 committed <60s ago + src writes seconds ago); record board delta (lane/m3 save-visibility MERGED, lane/perf now 2-ahead, pile=4).';
lines.splice(1, 0, archiveBullet);
fs.writeFileSync(p, lines.join('\n'));
console.log('s185 lock written; prev line-1 archived (git @6e15aea)');
