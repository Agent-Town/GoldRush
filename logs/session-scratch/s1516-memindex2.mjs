// s1516: final pass — strip explanatory TAILS from the index (each linked file's own
// frontmatter description carries the lesson, which is what recall actually reads).
import fs from 'node:fs';

const P = '/Users/robin/.claude-fires/projects/-Users-robin-Claude-Projects-Gold-Rush/memory/MEMORY.md';
let s = fs.readFileSync(P, 'utf8');
const before = Buffer.byteLength(s);
const linksBefore = (s.match(/\]\([a-z0-9-]+\.md\)/g) || []).length;

const SUBS = [
  ['Terse keys; open the linked file for the lesson. Bracketed counts = topic aggregators.',
   'Terse keys; open the file for the lesson. Bracketed counts = aggregators.'],
  ['## Merge state (false-ahead / grafts / stale base)', '## Merge state (false-ahead / grafts)'],
  ['**[all 14 →](queue-dispatch-and-refill.md)** — commit evidence BEFORE the cp',
   '**[all 14 →](queue-dispatch-and-refill.md)**'],
  ['(a-done-moves-mtime-is-its-queue-insertion-time-not-its-completion.md) — use the run log',
   '(a-done-moves-mtime-is-its-queue-insertion-time-not-its-completion.md)'],
  ['[**done-move mtime = QUEUE-INSERTION, not completion**]', '[**done-move mtime = QUEUE time, not completion**]'],
  ['](investigation-law-and-ledger-hazards.md) — incl. run `test:ledger-guards` LAST',
   '](investigation-law-and-ledger-hazards.md)'],
  ['(a-probe-outside-the-subject-tree-can-pass-through-the-wrong-module-system.md) — the PASS is what misled',
   '(a-probe-outside-the-subject-tree-can-pass-through-the-wrong-module-system.md)'],
  ['[**a probe OUTSIDE the tree can PASS via the wrong module system**]', '[**probe OUTSIDE the tree PASSES via wrong module system**]'],
  ['(a-gate-on-a-whole-corpus-count-is-rotted-by-your-own-authoring-commit.md) — make it RELATIVE',
   '(a-gate-on-a-whole-corpus-count-is-rotted-by-your-own-authoring-commit.md)'],
  ['- Fingerprint a red · graft a stale lane: **[all 16 →]', '- Fingerprint/graft: **[all 16 →]'],
  ['- Block checks + done/failed triage: **[all 18 →]', '- Block checks + triage: **[all 18 →]'],
  ['- A review is PERISHABLE in 2 places: ', '- Review PERISHABLE in 2: '],
  ['- Read the real subject: ', '- Real subject: '],
  ['- Probe composition: ', '- Probe comp: '],
  ['- Controls + bisects: ', '- Controls/bisects: '],
];

let hits = 0;
for (const [from, to] of SUBS) {
  if (s.includes(from)) { s = s.split(from).join(to); hits++; }
  else console.log('  MISS:', from.slice(0, 60));
}

fs.writeFileSync(P, s);
const after = Buffer.byteLength(s);
const linksAfter = (s.match(/\]\([a-z0-9-]+\.md\)/g) || []).length;
console.log(`\nsubstitutions: ${hits}/${SUBS.length}`);
console.log(`bytes ${before} -> ${after}  (saved ${before - after})`);
console.log(`links ${linksBefore} -> ${linksAfter}  ${linksBefore === linksAfter ? 'ALL PRESERVED ✓' : 'LINK LOST ✗'}`);
console.log(`under 17.1KB (17510)? ${after < 17510 ? 'YES ✓' : 'NO — ' + (after - 17510) + ' over'}`);
