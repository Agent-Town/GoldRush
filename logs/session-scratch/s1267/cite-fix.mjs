import { readFileSync, writeFileSync } from 'node:fs';

const TITLE = '"the Gazette welcome fires once, walks skippably, and retriggers through the newsie"';
const edits = [
  ['tasks/BACKLOG.md',
    '`e2e/gazette-welcome.spec.ts:42` (`approachNewsie`) is a **second** latency-sensitive assertion in the same spec',
    '`e2e/gazette-welcome.spec.ts:42` (' + TITLE + ' — the `approachNewsie` nearest-actor check) is a **second** latency-sensitive assertion in the same spec'],
  ['reviews/newsie-drift-shell-divergence-rate.md',
    '**F-1267-2 — `e2e/gazette-welcome.spec.ts:42` is a SECOND latency-sensitive assertion in this\nspec.**',
    '**F-1267-2 — `e2e/gazette-welcome.spec.ts:42` (' + TITLE + ' — the `approachNewsie` nearest-actor check) is a SECOND\nlatency-sensitive assertion in this spec.**'],
  ['logs/session-scratch/s1267/RESULTS.md',
    '⚠️ **`e2e/gazette-welcome.spec.ts:42` is a SECOND latency-sensitive assertion in the same\nspec.**',
    '⚠️ **`e2e/gazette-welcome.spec.ts:42` (' + TITLE + ' — the `approachNewsie` nearest-actor check) is a SECOND\nlatency-sensitive assertion in the same spec.**'],
];

for (const [file, from, to] of edits) {
  const t = readFileSync(file, 'utf8');
  if (!t.includes(from)) throw new Error('anchor missing in ' + file);
  writeFileSync(file, t.replace(from, to));
  console.log('patched ' + file);
}
