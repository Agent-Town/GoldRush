// SUPERSEDED by master-shipped-classifier.mjs. This filename-only method is the
// F-1568-1/F-1569-1 defect; its output must never be used to re-queue anything.
import { readdirSync, readFileSync } from 'node:fs';

const R = '/Users/robin/Claude/Projects/Gold Rush/';
const masters = readdirSync(R + 'tasks').filter((f) => f.endsWith('.md') && f !== 'BACKLOG.md');
const done = readdirSync(R + 'tasks/done');
const doneBlob = done.join('\n');

const unshipped = [];
for (const m of masters) {
  const stem = m.replace(/\.md$/, '');
  // a master counts as landed if any done-move mentions its stem (with or without the lane- prefix)
  const bare = stem.replace(/^lane-[a-d]?-?/, '');
  if (doneBlob.includes(stem) || (bare.length > 6 && doneBlob.includes(bare))) continue;
  let head = '';
  try {
    head = readFileSync(R + 'tasks/' + m, 'utf8').slice(0, 400).split('\n').slice(0, 6).join(' | ');
  } catch {}
  const banner = /DO-NOT-QUEUE|SHIPPED|⛔/.test(head) ? '  <<< HAS DO-NOT-QUEUE/SHIPPED BANNER' : '';
  unshipped.push(`${m}${banner}\n    ${head.slice(0, 260)}`);
}
console.log(`masters=${masters.length} done=${done.length} unshipped=${unshipped.length}\n`);
console.log(unshipped.join('\n\n'));
