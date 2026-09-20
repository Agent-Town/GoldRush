/**
 * s1336 — (1) rewrite this fire's own four rows into the shape the OPEN census
 * can actually read, and (2) append F-1336-5, the finding that explains why.
 *
 * findings-state-guard.mjs:57 computes `lead = line.trimStart()` and admits an
 * OPEN declaration only when `lead.startsWith('🟡')` (:64). A bullet is NOT
 * stripped, so "- 🟡 ..." is invisible. 64 of the ledger's 🟡 rows are bare and
 * visible; 31 are bullet-led and are not. Writing my rows bare is not a
 * vocabulary change — it is using the shape the guard already reads.
 * 🟠 is not a declaration marker at all (s1303 hit this with 🔵).
 */
import fs from 'node:fs';

const P = 'tasks/BACKLOG.md';
const lines = fs.readFileSync(P, 'utf8').split('\n');

let reshaped = 0;
for (let i = 0; i < lines.length; i++) {
  if (!/F-1336-[1-4]/.test(lines[i].slice(0, 90))) continue;
  const before = lines[i];
  // strip the leading bullet; promote 🟠 -> 🟡 so the row is a tracked marker
  const bare = before.replace(/^[-*•]\s*/, '').replace(/^🟠/, '🟡');
  if (bare !== before) {
    lines[i] = bare;
    reshaped++;
  }
}

const row =
  `🟡 **F-1336-5** (s1336, MEASURED — THE OPEN-FINDINGS CENSUS IS BLIND TO A THIRD OF THE OPEN SET, BECAUSE ONE GUARD ADMITS A ROW BY A SHAPE THE LEDGER'S NEWEST ROWS DO NOT USE). ` +
  `\`scripts/findings-state-guard.mjs:57\` computes \`const lead = line.trimStart()\` and \`:64\` admits a declaration only when \`lead.startsWith('🟡')\` or \`'✅'\`. **\`trimStart()\` removes whitespace, not the list bullet**, so a row written \`- 🟡 **F-x** …\` has \`lead\` starting with \`-\` and is admitted as **neither open nor closed — it is not seen at all.** ` +
  `✓ MEASURED on the live ledger: **64 bare 🟡 rows (visible) vs 31 bullet-led 🟡 rows (invisible)**, carrying **33 distinct ids, of which 32 are absent from the census entirely**. The gate's reported figure is \`declared open 58\`; the true figure under the same rule with the bullet stripped is **90**. **The census understates the open set by 36%.** ` +
  `⚠️ **This is not an abstract shape complaint — it silently undid a deliberate repair.** F-1334-2 found 10 desk items on no board the owner reads and s1335 backfilled 9 rows *specifically so the owner would see them*; **8 of those 9 (F-1120-2, F-1182-2, F-1193-2, F-1193-3, F-1204-1, F-1208-3, F-1209-3, F-1254-3) were written bullet-led and are invisible to the open census.** They satisfy \`desk-declaration-guard\` (which asks only *does a row exist?* and PASSes 48/48) and fail \`findings-state-guard\` (which asks *what state is it in?*). **Two guards, same rows, different admission rules — F-1335-4's arity asymmetry on a second axis, and this one costs visibility rather than closure.** ` +
  `🪞 **It caught me first: I wrote all four of my own rows bullet-led, and one (\`🟠\`) with a marker that is not a declaration marker at all — the exact shape s1303 had to promote a \`🔵\` row out of.** All four are rewritten bare in this same commit; that is a shape fix, not a vocabulary change. ` +
  `📐 **BLAST RADIUS OF THE OBVIOUS CURE, MEASURED BEFORE PROPOSING IT (F-1334-1's law):** stripping a leading bullet before the marker test yields subjects 233 → **325**, open 58 → **90**, closed 175 → **236**, and **exactly ONE new double-state: F-1126-2** — which is a **TRUE POSITIVE**, not noise: it is declared open at \`:2111\` (s1126) and closed at \`:2134\` (s1128, *"its factual half is true, its implied remedy is WRONG"*, superseded by F-1128-1). A half-retired row the census could not see. ` +
  `⛔ **THEREFORE FILED, NOT SHIPPED, AND THE REASON IS THE GATE ITSELF:** \`findings-state-guard\` fails on \`double-state > 0\`, so landing the one-line cure without first retiring \`:2111\` would turn \`test:node-guards\` **RED and block the board**. The correct order is: retire/strike the stale F-1126-2 open row, *then* the cure. ` +
  `ⓘ **NOT a re-ask of the settled question.** s1260's \`findings-state-vocabulary-triage\` answered *"should we widen the guard?"* with a **MEASURED NO** — but that ruling was about the **CLOSURE** vocabulary (23 candidates, verdicts 14/2/3/0/4), and the guard's own header states the design as *"Wide widens CLOSED ONLY, never open."* **This is the OPEN axis, it is never discussed in that header, and the header explicitly reasons about bullet-led \`✅\` while never mentioning bullet-led \`🟡\`** — which reads as an oversight rather than a choice. ` +
  `➡️ **ATTENDED/OWNER CALL (census correctives are owner-triage-gated, not fire-authorable): (a) land the two-step cure above — recommended, cost is one strike plus one line; or (b) rule that bullet-led 🟡 is not a declaration and require the bare shape, in which case 31 existing rows need reshaping and a guard should enforce it.** Either way **the number every fire has been reporting is wrong**, and it is wrong in the direction that makes the board look cleaner than it is.`;

let tail = lines.length;
while (tail > 0 && lines[tail - 1].trim() === '') tail--;
lines.splice(tail, 0, row);

fs.writeFileSync(P, lines.join('\n'));
console.log(`reshaped ${reshaped} rows; appended F-1336-5 at line ${tail + 1}`);
