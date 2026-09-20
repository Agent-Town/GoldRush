import fs from 'node:fs';

const p = 'tasks/BACKLOG.md';
const lines = fs.readFileSync(p, 'utf8').split('\n');

if (!lines[9].startsWith('✅ **F-1397-2 CLOSED')) {
  console.error('anchor moved — aborting');
  process.exit(1);
}

const CITE = '`playwright.config.ts:40`';
const QUOTE = `"  '**/release-build.spec.ts',"`;

const row =
  '🟢 **F-1398-1 (s1398, MEASURED) — an authored master prescribed a Playwright harness that cannot execute its own spec.** ' +
  'The master f1397-1-e1-release-door-drill-yard told the runner, at its lines 38 and 61, to run the spec under the DEFAULT config. But ' +
  CITE + ' ' + QUOTE + ' sits inside that config’s claimedByAnotherConfig list, which the default harness ignores, ' +
  'so the master’s own self-check command could never exercise the spec it was checking. ' +
  '⚠️ **Measured, not assumed — and the measurement corrected my own first instinct:** the command prints No tests found and exits **rc=1**, ' +
  'so it fails LOUDLY rather than producing a false green. The real cost is a runner cycle spent diagnosing a harness error, which this runner absorbed and reported correctly. ' +
  'This is the author-could-not-run-its-own-cure class: the command was written from a desk that had no way to execute it. ' +
  'Worth knowing that the same config file records the INVERSE direction of this trap already biting once — a grep-derived adjacency swept this spec INTO the wrong harness and manufactured eight false reds. ' +
  '**REC (cheap, mechanical, fire-authorable, NOT done this fire):** the claimed-spec list is machine-readable, so a guard can red when a task file names a claimed spec without also naming its owning config. ' +
  'Out of a drain’s scope; wants its own slice. Evidence reviews/f1397-1-e1-release-door-drill-yard.md. **GATE: none.**';

lines.splice(10, 0, '', row);
fs.writeFileSync(p, lines.join('\n'));
console.log('inserted row at index 11:', lines[11].slice(0, 90));
