import fs from 'node:fs';

const p = 'tasks/BACKLOG.md';
const lines = fs.readFileSync(p, 'utf8').split('\n');

const idx = lines.findIndex((l) => l.includes('GOAL-LEAF DEBT (3 masters) next fire.'));
if (idx === -1) { console.error('debt line not found — aborting'); process.exit(1); }

lines[idx] = lines[idx].replace(
  'GOAL-LEAF DEBT (3 masters) next fire.',
  '✅ **GOAL-LEAF DEBT DISCHARGED s1398** — all three masters now carry leaves ' +
  '(e1-headless-twin-banks + e1-headless-baron under e1-frontier, e2-escort-mode-as-data under e2-steamworks), ' +
  'each status "building" because the runner had already consumed the queue copies when s1398 measured them ' +
  '(tasks/running/ held all three plus live .pid files at 18:22). Registered, NOT authored or gated by the fire: ' +
  'the three masters remain exactly as the attended session wrote them. Leaf count 579 to 582, +30 lines, pure additions.'
);

fs.writeFileSync(p, lines.join('\n'));
console.log('retired at line', idx + 1);
