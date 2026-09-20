#!/usr/bin/env node
// s1261 — enumerate every `stopped` goal task with its taskFile, drainNotes and blocked state.
import { readFileSync } from 'node:fs';

const g = JSON.parse(readFileSync('tasks/goals.json', 'utf8'));
const tasks = [];
const walk = (n, path) => {
  const here = [...path, n.id ?? n.title ?? '?'];
  for (const k of ['subgoals', 'tasks', 'children']) {
    if (Array.isArray(n[k])) n[k].forEach((c) => walk(c, here));
  }
  if (n.taskFile || n.status) tasks.push({ ...n, _path: here.join(' > ') });
};
g.goals.forEach((n) => walk(n, []));

const byStatus = {};
for (const t of tasks) byStatus[t.status ?? '(none)'] = (byStatus[t.status ?? '(none)'] ?? 0) + 1;
console.log('status histogram:', byStatus, '\n');

for (const t of tasks.filter((x) => x.status === 'stopped')) {
  console.log(`--- ${t.id}   [stopped]`);
  console.log(`    title:    ${t.title ?? ''}`);
  console.log(`    taskFile: ${t.taskFile ?? '(none)'}`);
  if (t.blockedReason) console.log(`    BLOCKED:  ${t.blockedReason}`);
  if (t.drainNotes) console.log(`    drainNotes: ${String(t.drainNotes).slice(0, 900)}`);
  if (t.mergeHash) console.log(`    mergeHash: ${t.mergeHash}`);
  console.log(`    path:     ${t._path}`);
  console.log();
}
