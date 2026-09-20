import fs from 'fs';
const p = '/Users/robin/Claude/Projects/Gold Rush/STATUS.md';
const lines = fs.readFileSync(p, 'utf8').split('\n');
// preserve s1037's line-1 for the handoff archive
fs.writeFileSync('/Users/robin/Claude/Projects/Gold Rush/logs/_s1037_line1.txt', lines[0]);
lines[0] = 'ACTIVE 2026-07-25T10:05Z (s1038 fire) — lane-a perf-05 attribution went rc1 with real work UNCOMMITTED in the worktree; salvaging it before any refill can reset --hard over it, then judging whether it drains.';
fs.writeFileSync(p, lines.join('\n'));
console.log('lock written');
