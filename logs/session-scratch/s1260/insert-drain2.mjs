#!/usr/bin/env node
// s1260 — the triage-report drain line + F-1260-6/-7, and retire the s1260 QUEUED line it discharges.
import { readFileSync, writeFileSync } from 'node:fs';

const path = 'tasks/BACKLOG.md';
const lines = readFileSync(path, 'utf8').split('\n');

// 1. Retire the QUEUED line this drain discharges (strike-in-place, reasoning retained per the Retention Law).
const qIdx = lines.findIndex((l) => l.startsWith('🔨 **QUEUED (s1260, FIRE-AUTHORED — refresh + re-land'));
if (qIdx < 0) throw new Error('QUEUED line not found');
lines[qIdx] = lines[qIdx].replace(
  '🔨 **QUEUED (s1260, FIRE-AUTHORED — refresh + re-land',
  '🔨 ~~**QUEUED (s1260, FIRE-AUTHORED — refresh + re-land',
).replace(
  "of s1259's STOPPED rung) —",
  "of s1259's STOPPED rung)**~~ **→ SHIPPED s1260 (see the DRAINED line above) —",
);

const anchorIdx = lines.findIndex((l) => l.startsWith('✅ **DRAINED (s1260) — `lane-gr-sim` MERGED'));
if (anchorIdx < 0) throw new Error('anchor not found');

const DRAINED =
  '✅ **DRAINED (s1260) — `findings-state-vocabulary-triage` MERGED `637e156e7acae8a2fa012b15f6366c6c1e400151`: F-1259-1\'s rung landed on ATTEMPT 2, and the answer to "should we widen the guard?" is a MEASURED NO.** ' +
  '(review `reviews/findings-state-vocabulary-triage.md`, leaf `findings-state-vocabulary-triage` → `merged`.) One file, **+98/−0**, zero `src/`/`e2e/`/`tasks/` bytes. All **23** named candidates located; verdicts **(a) STALE 14 · (b) LAWFUL 2 · (c) GENUINELY OPEN 3 · (d) UNDETERMINED 0 · (e) INSTRUMENT ARTEFACT 4**, every row carrying a hash, leaf id, or `file:symbol`. ' +
  '**The scope-4 answer is the explicitly-permitted "no such rule exists":** widening would catch 17 true positives against 2 false positives, but no defensible glyph-plus-verb rule survives this file\'s conventions — glyphs are not states (`🚨` marks both live defects and completions; `🔻` marks live defects, stale ones, *and* a no-repair refutation), closure is free prose rather than a verb vocabulary, some lawful history carries no closure verb on its own line, and one F-ID can hold a fixed half beside an open half. The maximal rule found is "a 23-row phrase lookup, not a guard vocabulary" — **and the run says so itself.** ' +
  '➡️ **THE NEXT RUNG IS AN ATTENDED/OWNER LEDGER CONVENTION, NOT A PARSER CHANGE:** one canonical leading state token (`OPEN`/`CLOSED`/`WORKFLOW`/`RETAINED`) on every declaration, with mixed-scope IDs split. **Until then the shipped guard stays narrow — now a measured ruling instead of a guess.** ' +
  '**The 14 `(a)` rows are the strike list for a later fire.** All three `(c)` rows (`F-1126-2`, `F-1173-7`, `F-1252-1`) are already owner-gated or blocked, **so this table yields no fire-authorable corrective** — worth knowing before someone spends an authoring slot looking. ' +
  'Gates: tsc 0 · build 1.20 s · findings-state-guard **PASS** `double-state : 0` · its test fail 0 · citations **PASS**. Spot-verified rather than inherited: `npm:test:release` still NO CALLER (confirmed twice — grep, and my own gate-caller run this fire), the `/Total: [1-9]\\d* tests/` regex still in source, and all four cited leaves exactly as claimed.';

const F6 =
  '🔬 **F-1260-6 (s1260, MEASURED — THE DRAIN FIRE\'S OWN PREDICTION INSTRUMENT CARRIED THE DEFECT IT WAS ACCUSING, ONE LEVEL DOWN: IT COULD NOT READ NEGATION).** ' +
  'My F-1260-2 scope-1b prediction named 5 instrument artefacts. The run **confirmed 3** (`F-1032-1`, `F-1104-1`, `F-1179-3`), **refuted 2** (`F-1068-5`, `F-1252-1`), and **found a 6th I had missed** (`F-1045-1`, whose alleged open row reads *"NOW ACTUALLY IN THE LAW FILE"* — a completion phrase). ' +
  '✓ **Re-ran my own regex against the two refuted lines; the cause is exact and singular:** it matched `FIXED` inside **"not fixed"** (`F-1068-5`) and **"DELIBERATELY NOT FIXED"** (`F-1252-1`). **A closure-word vocabulary with no negation handling reads a refusal as a closure.** ' +
  '➡️ **So the family is now three deep, and each level was found by the level below it: F-1259-1** the guard\'s *open* vocabulary too narrow (`🟡` = 5%) · **F-1260-2** the probe\'s *closed* vocabulary too narrow (`DRAINED` absent) · **F-1260-6** my own closure vocabulary blind to negation. ' +
  '**Recorded, deliberately NOT fixed — the remedy is the ledger convention above, not a fourth regex.** And the reason it was caught at all: the master framed the prediction as **falsifiable** and declared refutation explicitly valuable. **An instrument that cannot disagree with its author finds nothing.**';

const F7 =
  '🔻 **F-1260-7 (s1260, informational — the report demonstrates the very thing it classifies as open).** Merging `artifacts/findings-state-vocabulary-triage.md` moved the citation guard\'s `NOT GATED` tally **862 → 866**: the report\'s own `file:line` citations sit outside `tasks/**`, which is exactly the scope question **F-1252-1** — the one it classified **(c) GENUINELY OPEN** and which sits on the owner\'s desk. No action; a live, self-demonstrating datum for that ruling.';

lines.splice(anchorIdx, 0, DRAINED, '', F6, '', F7, '');
writeFileSync(path, lines.join('\n'));
console.log(`inserted drain + F-1260-6/-7 before L${anchorIdx + 1}; retired QUEUED at L${qIdx + 1}; file now ${lines.length} lines`);
