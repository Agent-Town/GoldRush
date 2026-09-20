// s1468: inspect the leaf + the house convention for a drained leaf.
import { readFileSync } from 'node:fs';
const g = JSON.parse(readFileSync('tasks/goals.json', 'utf8'));

const leaves = [];
(function walk(n) {
  if (Array.isArray(n)) return n.forEach(walk);
  if (n && typeof n === 'object') {
    if (n.id && n.status) leaves.push(n);
    Object.values(n).forEach(walk);
  }
})(g);

console.log('total leaves:', leaves.length);
const counts = {};
for (const l of leaves) counts[l.status] = (counts[l.status] || 0) + 1;
console.log('status counts:', JSON.stringify(counts));

const mine = leaves.find(l => l.id === 'f1467-1-alpha-recipe-ab');
console.log('\n=== my leaf ===');
console.log(JSON.stringify(mine, null, 2).slice(0, 1200));

console.log('\n=== two recent merged leaves (house shape) ===');
for (const l of leaves.filter(x => x.mergeHash).slice(-2)) {
  console.log(JSON.stringify({ id: l.id, status: l.status, mergeHash: l.mergeHash, lane: l.lane, review: l.review }, null, 2));
}
