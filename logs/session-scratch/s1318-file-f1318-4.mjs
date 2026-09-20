// s1318 — file F-1318-4, deliberately with a 🟡 lead so that it is visible to the very census it
// describes. (Two of the three findings I filed earlier this fire are invisible to it.)
import { readFileSync, writeFileSync } from 'node:fs';

const path = 'tasks/BACKLOG.md';
const lines = readFileSync(path, 'utf8').split('\n');
const i = lines.findIndex((l) => l.startsWith('🟠 **F-1318-1 (s1318,'));
if (i < 0) throw new Error('anchor row not found');

const row =
  '🟡 **F-1318-4 (s1318, MEASURED WHILE RECONCILING MY OWN CENSUS — `declared open` IS DENOMINATED IN 🟡 ROWS ONLY, SO MOST OPEN FINDINGS ARE INVISIBLE TO IT).** ' +
  '`findings-state-guard.mjs:64` skips any row whose lead is not `🟡` or `✅` (or struck / bullet-closed), and extracts the F-ID from the first **90** characters (`SUBJECT_CHARS`, `:35`). That is correct **for its actual job** — detecting a finding declared both open and closed — but its printed line `declared open : N` is read by fires as *the number of open findings*, and it is not: **a finding filed with 🔴, 🟠 or 🔵 is counted as neither open nor closed.** ' +
  '✓ **Measured this fire, not inferred** (`logs/session-scratch/s1318-census-reconcile.mjs`, diffing the ID sets across `57b9d9bb..HEAD` rather than trusting the totals): **F-1316-1 sat as a 🔴 row and was NOT COUNTED AT ALL** the whole time it was the board’s top player-facing defect; two of the three findings I filed today (🟠 F-1318-1, 🔵 F-1318-2/3) are likewise invisible. This row leads 🟡 on purpose, so that it appears in the census it is about. ' +
  '⚠️ **And the 90-char zone is a live trap for the standard closure shape.** Prepending a `✅ **SHIPPED sNNNN at …**` paragraph to an existing row — the house pattern — pushes that row’s own F-ID **past char 90**, so the finding does not become CLOSED, it **disappears from the census entirely**. **I did exactly this to F-1297-2 and caught it only because the arithmetic did not reconcile** (expected 204/159/45, read 200/157/43); repaired by leading the closure with `✅ **F-1297-2 CLOSED — …**`, after which the numbers came out 202/159/43 and every delta was explicable. **Any earlier closure written in the prepend shape has silently dropped its subject the same way** — that is the audit worth running, and it is why `double-state` reads a reassuring 0. ' +
  '➡️ **Cure options (cheap, no owner call):** (a) have the guard extract F-IDs from the **whole line** for the *closed* determination while keeping the narrow zone for *open* (it already widens closed-only in one direction — see the `wide` vocabulary at `:49` and `blocker-panel-closed-guard.mjs`); and/or (b) print an explicit `uncounted-lead : N` line so nobody reads `declared open` as a total again. ' +
  '💡 *This is the "DENOMINATED in what?" law landing on a number the factory quotes in every handoff.*';

lines.splice(i, 0, row, '');
writeFileSync(path, lines.join('\n'));
console.log('F-1318-4 filed with a 🟡 lead at line', i + 1);
