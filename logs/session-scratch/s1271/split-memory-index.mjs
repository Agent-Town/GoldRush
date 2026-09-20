import fs from 'node:fs';
const DIR = '/Users/robin/.claude-fires/projects/-Users-robin-Claude-Projects-Gold-Rush/memory/';
const P = DIR + 'MEMORY.md';
let s = fs.readFileSync(P, 'utf8');
const before = Buffer.byteLength(s);
const lines = s.split('\n');

const take = (prefix) => {
  const i = lines.findIndex((l) => l.startsWith(prefix));
  if (i === -1) throw new Error('not found: ' + prefix);
  const l = lines[i];
  return { i, l };
};

const guards = take('- Guards: ');
const controls = take('- Controls: ');

// topic file carries the two full sub-lists verbatim (every pointer preserved)
const topic = `---
name: investigation-guards-and-controls
description: "Index of the guard-writing and experiment-control lessons — split out of MEMORY.md when it hit the read limit. Read this before writing a guard or designing a control arm."
metadata:
  type: reference
---

Split from the MEMORY.md index (s1271) to keep it under the read limit. Every pointer below was
inline in the index before; nothing was dropped. Paths are relative to this directory.

## Guards — writing one, and trusting one
${guards.l.replace('- Guards: ', '')}

## Controls — designing the arm that can refute you
${controls.l.replace('- Controls: ', '')}

Related: [[a-measurement-task-must-verify-its-subject-is-present]] · [[drive-the-guard-dont-reimplement-its-predicate]]
`;
fs.writeFileSync(DIR + 'investigation-guards-and-controls.md', topic);

lines[guards.i] = '- [**Guards + Controls (28 lessons — read before writing a guard or a control arm)**](investigation-guards-and-controls.md)';
lines[controls.i] = null;
s = lines.filter((l) => l !== null).join('\n');
fs.writeFileSync(P, s);

const idxLinks = [...s.matchAll(/\]\(([^)]+\.md)\)/g)].map((m) => m[1]);
const topLinks = [...topic.matchAll(/\]\(([^)]+\.md)\)/g)].map((m) => m[1]);
const all = [...idxLinks, ...topLinks];
const broken = all.filter((f) => !fs.existsSync(DIR + f));
console.log(`index ${before} -> ${Buffer.byteLength(s)} bytes`);
console.log(`pointers: index ${idxLinks.length} + topic ${topLinks.length} = ${all.length} (broken: ${broken.length})`);
