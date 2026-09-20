import { readFileSync } from 'node:fs';
const goals = JSON.parse(readFileSync('tasks/goals.json', 'utf8'));
const leaves = [];
(function walk(nodes) {
  for (const n of nodes ?? []) {
    if (n.taskFile || n.mergeHash || (n.status && !n.subgoals && !n.tasks)) leaves.push(n);
    walk(n.subgoals); walk(n.tasks);
  }
})(goals.goals);
for (const want of process.argv.slice(2)) {
  const l = leaves.find((x) => x.id === want) || leaves.find((x) => (x.taskFile || '') === want + '.md');
  console.log('===== ' + want);
  if (!l) { console.log('  NO LEAF'); continue; }
  console.log('  id:', l.id, '| status:', l.status, '| mergeHash:', l.mergeHash);
  console.log('  taskFile:', l.taskFile);
  if (l.reason) console.log('  reason:', String(l.reason).slice(0, 600));
  console.log('');
}
