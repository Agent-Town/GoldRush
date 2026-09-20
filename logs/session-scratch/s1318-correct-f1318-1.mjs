// s1318 — correct my OWN finding. F-1318-1 was filed from a probe that measured a single string
// (the tier-II stockpile sentence), which is the same narrow denominator I criticised the new spec
// for. upgradeFloatText interpolates a tier suffix and tier 3 ships today, so the reachable
// population is 8 strings, not 1 — and the worst of them sits ON the floor, not above it.
import { readFileSync, writeFileSync } from 'node:fs';

const path = 'tasks/BACKLOG.md';
const lines = readFileSync(path, 'utf8').split('\n');
const i = lines.findIndex((l) => l.startsWith('🟠 **F-1318-1 (s1318,'));
if (i < 0) throw new Error('F-1318-1 row not found');

const correction =
  ' ⚠️ **CORRECTED BY ITS OWN AUTHOR, SAME FIRE — THE FIRST MEASUREMENT USED THE SAME NARROW DENOMINATOR I HAD JUST CRITICISED THE SPEC FOR.** ' +
  'I filed "two characters of headroom" from a probe that grew **one** string — the tier-**II** stockpile sentence. But `upgradeFloatText` interpolates a tier suffix (`["", "I", "II", "III"]`), **`III` is one character longer than `II`**, and tier 3 ships today (bt-02b bought two more courses). The reachable population is **8 strings (4 buildables × tiers 2–3), not 1.** ' +
  '✓ **All 8 measured** (`logs/session-scratch/s1318-real-copy-probe.mjs`, replicating the shipped loop): all 8 currently fit, so nothing is broken on screen right now — **but `Stockpile Yard III - the yard holds more gold` (45 chars) renders at `fontPx = 32`, which is the floor ITSELF, not one pixel above it.** It has **zero font steps left**; it clears its 748px budget only by 17.8px of raw slack, about one character at that size. ' +
  'Sluice III is the runner-up and is nearly as tight — 747.12px into 748px, a **0.88px** margin. ' +
  '➡️ **So the corrected statement is sharper than the original, not softer: the game already ships a sentence that has exhausted the fit mechanism entirely, and the cure below is what stands between that and a silent return of F-1316-1.** 💡 *And the lesson is the finding\'s own: I measured a sample and wrote a claim about the population. "Is it a rate or a sample?" applies to your own instruments, not only to inherited ones.*';

// Append the correction to the existing row rather than rewriting it (supersede, never delete).
lines[i] = lines[i] + correction;
writeFileSync(path, lines.join('\n'));
console.log('F-1318-1 corrected in place (appended, original claim retained) at line', i + 1);
