import { readFileSync, writeFileSync } from 'node:fs';
const p = 'STATUS.md';
const raw = readFileSync(p, 'utf8');
const lines = raw.split('\n');
const s87 = lines[0];
const active = 'ACTIVE 2026-07-06T15:45:00Z (s88 fire) — lane-d FOCUSED DRAIN: graft lane/m6-r3a-apply (perf-02 bench + reviews/m6-r3a-audit.md) onto clean main, genuine 3-way on hot core.';
const archiveBullet = '- **s87 handoff (line-1 archive):** ' + s87.replace(/^Last updated: /, '');
// new content: active line, blank, s87 archive bullet, then the rest (blank + existing bullets)
const rest = lines.slice(1); // starts with '' (blank) then bullets
const out = [active, '', archiveBullet, ...rest].join('\n');
writeFileSync(p, out);
console.log('lock written; s87 archived; line1 len', active.length);
