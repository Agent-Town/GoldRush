// s1521 — WHERE does the F-1518-2 tell live? The goals-leaf corpus above found 8 candidates and
// none of them is the F-1518-2 shape. Before pricing a parser, locate the subject.
import { readFileSync } from 'node:fs';
import path from 'node:path';

const goals = JSON.parse(readFileSync('tasks/goals.json', 'utf8'));
const leaves = [];
(function walk(n) {
  if (!n || typeof n !== 'object') return;
  if (n.id || n.taskFile) leaves.push(n);
  for (const k of [].concat(n.subgoals || [], n.tasks || [])) walk(k);
})({ subgoals: goals.goals || [] });

console.log('=== 1. the F-1518-2 leaf itself, verbatim ===');
for (const l of leaves) {
  const s = JSON.stringify(l);
  if (/baron-fort-solidity/.test(l.id || '') || /baron-fort-solidity/.test(l.taskFile || '')) {
    console.log(JSON.stringify(l, null, 1).slice(0, 2600));
  }
}

console.log('\n=== 2. which goals leaf carries "supersedes nothing" ===');
for (const l of leaves) {
  for (const [k, v] of Object.entries(l)) {
    if (typeof v === 'string' && v.includes('supersedes nothing')) {
      console.log(`leaf=${l.id || l.taskFile} [${l.status}] key=${k}`);
      console.log(v.replace(/\s+/g, ' ').slice(0, 900));
    }
  }
}

console.log('\n=== 3. the same phrase in the PROSE ledgers ===');
for (const f of ['tasks/BACKLOG.md', 'STATUS.md']) {
  const txt = readFileSync(f, 'utf8');
  const lines = txt.split('\n');
  lines.forEach((ln, i) => {
    if (ln.includes('supersedes nothing')) {
      const at = ln.indexOf('supersedes nothing');
      console.log(`${f}:${i + 1}  …${ln.slice(Math.max(0, at - 300), at + 200).replace(/\s+/g, ' ')}…`);
      console.log('');
    }
  });
}
