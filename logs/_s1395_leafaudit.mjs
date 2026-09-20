// s1395 scratch instrument (Retention Law: every number in the handoff is re-derivable from this).
// Question: which goal leaves are NOT in a terminal state, and is each one's state still TRUE today?
// A leaf is "non-terminal" if it claims work is in flight or unstarted: building / queued / planned / ? (no status).
// blocked/stopped are terminal-for-a-fire (owner or explicit do-not-requeue), but we print them for the block-class census.
import fs from 'fs';
const g = JSON.parse(fs.readFileSync('tasks/goals.json', 'utf8'));

const leaves = [];
const walk = (n, path) => {
  const kids = [].concat(n.subgoals || [], n.tasks || []);   // BOTH keys — a walker that reads one loses half the tree
  const here = path.concat(n.id || n.name || n.title || '?');
  if (!kids.length) { leaves.push({ node: n, path: here }); return; }
  kids.forEach(k => walk(k, here));
};
const roots = g.goals || g.subgoals || [g];
(Array.isArray(roots) ? roots : [roots]).forEach(r => walk(r, []));

const INTERESTING = new Set(['building', 'queued', 'planned', 'blocked', 'stopped', undefined, null, '']);
const out = leaves.filter(l => INTERESTING.has(l.node.status));

for (const { node, path } of out) {
  // reason lives under many key names — print whichever exist rather than guessing one
  const reasonKeys = Object.keys(node).filter(k => /reason|why|note|block|owner|gate/i.test(k));
  console.log([
    `STATUS=${JSON.stringify(node.status)}`,
    `id=${node.id || node.name || '(none)'}`,
    `taskFile=${node.taskFile || '(none)'}`,
    `mergeHash=${node.mergeHash || '(none)'}`,
    `blockClass=${node.blockClass || '(none)'}`,
    `parent=${path.slice(-2, -1)[0] || '(root)'}`,
    ...reasonKeys.map(k => `  ${k}: ${JSON.stringify(node[k]).slice(0, 300)}`),
  ].join('\n'));
  console.log('---');
}
console.log(`TOTAL leaves=${leaves.length}  non-terminal-or-blocked printed=${out.length}`);
