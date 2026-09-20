import fs from 'node:fs';

const g = JSON.parse(fs.readFileSync('tasks/goals.json', 'utf8'));
const want = [
  'lane-headless-twin-banks',
  'lane-headless-baron',
  'lane-escort-mode-as-data',
];

const found = new Map();
let total = 0;
function walk(n) {
  if (!n || typeof n !== 'object') return;
  for (const k of ['goals', 'subgoals', 'tasks', 'children']) {
    if (Array.isArray(n[k])) n[k].forEach(walk);
  }
  if (n.id) {
    total++;
    for (const w of want) {
      if (String(n.id).includes(w) || String(n.taskFile || '').includes(w)) {
        found.set(w, { id: n.id, status: n.status, taskFile: n.taskFile });
      }
    }
  }
}
walk(g);

console.log('total leaves walked:', total);
for (const w of want) {
  console.log(w, '=>', found.has(w) ? JSON.stringify(found.get(w)) : 'NO LEAF');
}
// prove the walker is not silently blind: it must find the leaf I wrote this fire
console.log('control (my own leaf this fire):',
  found.size >= 0 && JSON.stringify(
    (function () { let r = null; (function w2(n) {
      if (!n || typeof n !== 'object') return;
      for (const k of ['goals', 'subgoals', 'tasks', 'children']) if (Array.isArray(n[k])) n[k].forEach(w2);
      if (n.id === 'f1397-1-e1-release-door-drill-yard') r = { id: n.id, status: n.status };
    })(g); return r; })()));

// do the master files exist on disk?
for (const w of want) {
  console.log('master file', w + '.md', fs.existsSync('tasks/' + w + '.md') ? 'EXISTS' : 'MISSING');
}
