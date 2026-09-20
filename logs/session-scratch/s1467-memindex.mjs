import fs from 'node:fs';

const p = '/Users/robin/.claude-fires/projects/-Users-robin-Claude-Projects-Gold-Rush/memory/MEMORY.md';
const lines = fs.readFileSync(p, 'utf8').split('\n');

// 1. dry-board line: add the DISJUNCTS mirror right after "count CONJUNCTS"
const dryIdx = lines.findIndex((l) => l.includes('count CONJUNCTS'));
if (dryIdx < 0) throw new Error('conjuncts anchor missing');
if (!lines[dryIdx].includes('count DISJUNCTS')) {
  lines[dryIdx] = lines[dryIdx].replace(
    '[**count CONJUNCTS**](a-verifiable-gate-is-not-a-satisfied-gate.md)',
    '[**count CONJUNCTS**](a-verifiable-gate-is-not-a-satisfied-gate.md) · [**count DISJUNCTS on a CLOSING gate**](a-closing-gate-needs-its-disjuncts-counted.md)',
  );
  console.log('dry-board line updated');
} else console.log('dry-board line already has it');

// 2. law/ledger line: extend the run-last pointer with the review-prose subject
const lawIdx = lines.findIndex((l) => l.includes('run `test:ledger-guards` LAST'));
if (lawIdx < 0) throw new Error('ledger-guards anchor missing');
if (!lines[lawIdx].includes('review-prose-is-a-late-mutated-guard-subject')) {
  lines[lawIdx] = lines[lawIdx].replace(
    '**gate runs BEFORE your row (run `test:ledger-guards` LAST)**',
    '**gate runs BEFORE your row (run `test:ledger-guards` LAST)** · [**REVIEW PROSE is the 4th late-mutated subject**](review-prose-is-a-late-mutated-guard-subject.md)',
  );
  console.log('law/ledger line updated');
} else console.log('law/ledger line already has it');

fs.writeFileSync(p, lines.join('\n'));
