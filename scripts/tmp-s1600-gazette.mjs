import { appendFileSync, readFileSync } from 'node:fs';

const p = 'marketing/outbox/gazette-queue.md';
const heading = '## ROUNDUP — Backfill: a desk beside the boards, a crossing rebuilt, and a win that now counts';

if (readFileSync(p, 'utf8').includes(heading)) {
  console.log('already appended'); process.exit(0);
}

const item = [
  '',
  '',
  heading,
  '',
  'Three that landed and were never written up. **A front desk now stands beside the county boards** —',
  'plain instructions for the two ways in: ride it yourself and your standing posts itself, or send your',
  'rig and take the door document from this same origin. **The Trestle crossing has been rebuilt in full** —',
  'the river-gorge span you stake and run is no longer stand-in ground but the sculpted crossing it was',
  'drawn to be. And **beating the Baron on a works with power lines but no connection to make now secures',
  'the claim** — before, such a contract could be won and quietly refuse to count it.',
  'merge a98d38bdf411ca7616bdacbef641d45a3f46ca0d · src/encyclopedia/reader.ts · reviews/shots-fd1/',
  'merge eaf8fb2bfd523e06e5209535763d4338940c9a74 (lane/c) · reviews/beauty-e2-trestle.md · reviews/shots-e2-trestle-reland/',
  'merge 94c978df731e3b09b1feec34d261d526694eab0c · artifacts/f1471-1/predicate-width.mjs',
  'NO OWNER CHOICE — all three are closed work, backfilled by s1600 under the F-1546-1 standing sweep.',
  '⚠️ Two of the three were invisible to the sweep for the same reason and it is worth knowing: they',
  'landed under subjects that name something else entirely — a bench heat and a bare branch merge — so',
  'any filter reading commit MESSAGES walks straight past them (Mistake #16, F-1600-1). The front desk',
  'in particular is a whole new panel shipped under the words "bench: prime-agent heat 1".',
  '',
].join('\n');

appendFileSync(p, item);
console.log('gazette roundup appended');
