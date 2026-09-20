// s1481 — fold two dense index clusters into topic files. Nothing is dropped: the cluster's
// full line is moved verbatim into the topic file and the index keeps a pointer. Anchored on
// the line's leading label, and it refuses if a label is not unique.
import { readFileSync, writeFileSync } from 'node:fs';

const DIR = '/Users/robin/.claude-fires/projects/-Users-robin-Claude-Projects-Gold-Rush/memory/';
const P = DIR + 'MEMORY.md';

const FOLDS = [
  {
    file: 'merge-fingerprint-and-graft.md',
    name: 'merge-fingerprint-and-graft',
    description: 'Index of the fingerprinting and graft/re-land memories — how to attribute a red and how to land a stale lane.',
    title: 'Fingerprinting a red · grafting a stale lane',
    labels: ['- Fingerprint: ', '- Graft: '],
    pointer: '- Fingerprint a red · graft a stale lane: **[all 16 →](merge-fingerprint-and-graft.md)** — control-run before blaming; COPY imports the block, PATCH does not',
  },
  {
    file: 'queue-dispatch-and-refill.md',
    name: 'queue-dispatch-and-refill',
    description: 'Index of the dispatch-order and pre-refill memories — commit evidence before the queue cp, and what to verify before refilling a lane.',
    title: 'Dispatch order · what to verify before a refill',
    labels: ['- [**commit evidence BEFORE queue cp**]', '- Before refill: '],
    pointer: '- Dispatch + refill checks: **[all 14 →](queue-dispatch-and-refill.md)** — commit evidence BEFORE the cp; "stopped"≠clean and "stopped-" can be FINISHED',
  },
];

const src = readFileSync(P, 'utf8');
const before = Buffer.byteLength(src);
let lines = src.split('\n');

for (const fold of FOLDS) {
  const moved = [];
  for (const label of fold.labels) {
    const hits = lines.filter((l) => l.startsWith(label));
    if (hits.length !== 1) {
      console.error(`REFUSING: label ${JSON.stringify(label)} matched ${hits.length} lines`);
      process.exit(2);
    }
    moved.push(hits[0]);
  }
  const body =
    `---\nname: ${fold.name}\ndescription: ${fold.description}\nmetadata:\n  type: reference\n---\n\n` +
    `# ${fold.title}\n\nMoved out of MEMORY.md (s1481) to keep the index under its read limit. ` +
    `Nothing was dropped — every entry below is the index line verbatim.\n\n` +
    moved.join('\n') + '\n';
  writeFileSync(DIR + fold.file, body);

  const first = lines.indexOf(moved[0]);
  lines = lines.filter((l) => !moved.includes(l));
  lines.splice(first, 0, fold.pointer);
  console.log(`folded ${moved.length} lines -> ${fold.file}`);
}

const out = lines.join('\n');
writeFileSync(P, out);
const after = Buffer.byteLength(out);
console.log(`${before} -> ${after} bytes (saved ${before - after}); limit 17100 => ${after < 17100 ? 'OK' : 'STILL OVER'}`);
