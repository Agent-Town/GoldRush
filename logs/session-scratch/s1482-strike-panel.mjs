// blocker-panel-closed-guard: the panel selects and excludes PER LINE, so appending a closure
// elsewhere never clears a row. F-1398-1's ORIGINAL filing row still read as an open blocker.
// Strike it IN PLACE, retaining every word (Retention Law) — the ✅ prefix is what the panel's
// own exclusion grep in scripts/dashboard-gen.sh:252 reads.
import fs from 'node:fs';
const P = 'tasks/BACKLOG.md';
const lines = fs.readFileSync(P, 'utf8').split('\n');
const i = lines.findIndex((l) => l.startsWith('🟢 **F-1398-1 (s1398, MEASURED)'));
if (i < 0) throw new Error('F-1398-1 filing row not found by its opening text');
lines[i] =
  '✅ **F-1398-1 CLOSED s1482 — `98690e837`, guard `scripts/claimed-spec-harness-guard.mjs`; full ruling and both arms priced at the row above (:286). Original filing retained verbatim below.** ' +
  lines[i];
fs.writeFileSync(P, lines.join('\n'));
console.log('struck F-1398-1 filing row at :' + (i + 1));
