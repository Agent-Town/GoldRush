import fs from 'node:fs';
const bp = 'tasks/BACKLOG.md';
let b = fs.readFileSync(bp, 'utf8');

// 1. correct F-1515-1's price in place: it said UNMEASURED, I measured it this fire.
const stale = '📊 **CORPUS INCIDENCE IS UNMEASURED AND I AM NOT INVENTING A NUMBER.**';
if (!b.includes(stale)) throw new Error('F-1515-1 pricing sentence not found');
const priced =
  '📊 **PRICED THE SAME FIRE — INCIDENCE IS 2, NOT ZERO, SO THIS IS NOT THEORY (measured s1515, method below).** ' +
  'Copied the guard, dropped its CLI at `:293`, re-rooted it and widened `rows.push` to carry `win` + `titles`. ' +
  '**CONTROL FIRST:** the copy reproduces the shipped guard exactly — **511 / 262 / 206 / 43** — so it is the same instrument ' +
  'and the answer is about the corpus, not the copy. An all-pairs non-destructive scan then recovers **4** `NUMBER-ONLY` rows — ' +
  '**but 2 of those 4 are artefacts of [F-1515-2] and are NOT test titles at all** (`e10Static.arrivalZ`, cited from ' +
  '`tasks/lane-rig-repair.md:14` and `tasks/DRAFT-rehearsal-rig-repair-and-rerun.md:14`). ✅ **The 2 genuine ones were verified ' +
  'by reading the spec, not by trusting the matcher:** `e2e/tl-01-run-telemetry.spec.ts:229` *("plain no-debug secure return ' +
  'keeps telemetry invisible to gameplay")* and `e2e/asset-diet.spec.ts:73` *("honest town and claim cues appear while GLBs are ' +
  'throttled and leave at ready")*. ⓘ **2 is a LOWER BOUND:** my matcher required `MIN_PREFIX` on the `title.startsWith(span)` ' +
  'branch where the guard\'s `matchesATitle` imposes no minimum and also has fragment logic, so the shipped matcher is *more* ' +
  'permissive than the probe. **A 2-citation cure is small; the case for building it is that it also removes the workaround tax ' +
  '— prose has been hand-massaged around this bug for 13 fires.** ' +
  '🪤 **AND THE OBVIOUS WAY TO MEASURE IT SILENTLY RETURNS A FALSE ZERO — this is the reusable half.**';
b = b.replace(stale, priced);

// drop the now-superseded "close as theory" instruction and the old REC tail
const oldRec = 'Per [F-1514-1] the successor must be priced *before* ' +
  'authoring: of today\'s 262 `NUMBER-ONLY` rows, how many would a non-destructive all-pairs scan recover? **If the answer is ~0, ' +
  'CLOSE THIS ROW AS THEORY rather than building it.** ';
if (b.includes(oldRec)) b = b.replace(oldRec, '');

const oldGate = '**REC: price it by copying the guard and exporting the ' +
  'window derivation — the way s1514 measured the by-kind arm — NOT by consuming `scan()`\'s public rows. ' +
  'GATE: closes when either (a) a corpus measurement shows the all-pairs scan recovers ≥1 real `NUMBER-ONLY` citation AND a slice ' +
  'lands it with a manufactured-defect arm for the odd-delimiter window, or (b) a measured incidence of 0 closes it as theory.**';
const newGate = '**REC: the pricing duty is DISCHARGED — build it, together with [F-1515-2], which lives in the same file and ' +
  'whose cure removes 2 of the 4 raw hits. GATE: closes when the odd-same-kind-delimiter window is recovered by a ' +
  'manufactured-defect arm proved RED against today\'s union scanner, with `citations == 511` and `CARRIES-TITLE >= 206` held.**';
if (!b.includes(oldGate)) throw new Error('F-1515-1 gate sentence not found');
b = b.replace(oldGate, newGate);

// 2. file F-1515-2 immediately after F-1515-1
const lines = b.split('\n');
const i = lines.findIndex((l) => l.includes('**F-1515-1 (s1515 —'));
if (i < 0) throw new Error('F-1515-1 row not found for insertion');
const row =
  '🟡 **F-1515-2 (s1515 — `TITLE_DECL` HARVESTS NON-TITLE STRINGS INTO THE TITLE CORPUS, SO `citation-title-guard` CAN FAIL ' +
  '**OPEN**: A CITATION COULD EARN `CARRIES-TITLE` BY QUOTING A BALANCE KEY THAT NAMES NO TEST.** Non-blocking, fire-authorable. ' +
  '**Latent today — 0 live exploiters — but reachable, and it is the opposite polarity to [F-1515-1], which fails CLOSED.**) ' +
  '📐 **THE MECHANISM, read from the regex:** `TITLE_DECL = /^\\s*(?:test|it)(?:\\.\\w+)*\\s*\\(\\s*([\'"`])([\\s\\S]*?)\\1/gm`. ' +
  'The `(?:\\.\\w+)*` exists for the real modifiers (`test.skip`, `test.only`, `test.describe`, …) but it matches **any** dotted ' +
  'helper, so `test.setBalance(\'e10Static.arrivalZ\', 20)` is parsed as a test declaration and its **first string argument is ' +
  'harvested as a title**. 📊 **MEASURED s1515 across all 393 specs the guard reads: 1270 genuine test/suite titles and ' +
  '**87 non-title strings** admitted via **3** helper suffixes — `test.setBalance` (84), `test.placeBoatBuilding` (2), ' +
  '`test.repair` (1).** ✅ **AND THE IMPACT WAS MEASURED SEPARATELY RATHER THAN ASSUMED, WHICH CHANGES THE PRIORITY:** of the ' +
  '**206** live `CARRIES-TITLE` rows, **0** are carried by a polluted string — so the guard is **not currently passing anything ' +
  'it should refuse**. ⚠️ **But 67 of the 87 clear the 12-char `QUOTED` floor, so the fail-open is reachable, not impossible** — ' +
  'and it is exactly the kind of hole a future citation would fall into by accident while looking correct. ' +
  '💡 **How it surfaced is the instructive part: it was NOT looked for.** It fell out of pricing [F-1515-1] — 2 of that probe\'s ' +
  '4 raw hits resolved to `e10Static.arrivalZ`, which looked wrong on sight, and reading the spec showed it is a `setBalance` ' +
  'key. **A probe\'s false positives were the finding.** ' +
  '**REC: restrict the suffix group to an allowlist of real modifiers rather than `(?:\\.\\w+)*`. GATE: closes when a ' +
  'manufactured-defect arm proves a `test.setBalance(\'…\')` line is NOT harvested as a title, AND the live tally is unchanged at ' +
  '`511 / 262 / 206 / 43` — the 0-live measurement predicts the cure moves NOTHING, so any movement means that measurement was ' +
  'wrong and must be re-derived before the slice merges.** Related: [F-1515-1], [F-1501-5], [F-1252-3].';
lines.splice(i, 0, row);
fs.writeFileSync(bp, lines.join('\n'));
console.log('F-1515-1 re-priced (incidence 2, lower bound); F-1515-2 filed above it');
