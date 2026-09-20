// s1318 — drain 2 bookkeeping: flip the f1297-2 leaf, fix the review's merge-hash placeholder,
// retire F-1297-2 and file F-1318-3.
import { readFileSync, writeFileSync } from 'node:fs';

const MERGE = 'ae2a60f3ba1439d9515b73a5fb81b72805030355';

// --- goal leaf ---------------------------------------------------------------
const doc = JSON.parse(readFileSync('tasks/goals.json', 'utf8'));
const walk = (node, out = []) => {
  for (const child of [...(node.subgoals ?? []), ...(node.tasks ?? [])]) {
    out.push(child);
    walk(child, out);
  }
  return out;
};
const leaf = walk({ subgoals: doc.goals ?? [] }).find((n) => n.id === 'f1297-2-plain-boot-tape-button');
if (!leaf) throw new Error('leaf f1297-2-plain-boot-tape-button not found');
console.log('leaf before:', leaf.status, leaf.mergeHash ?? '(no hash)');
leaf.status = 'shipped';
leaf.mergeHash = MERGE;
leaf.closureReason = [
  `s1318 drain: ACCEPT, merged ${MERGE.slice(0, 8)}.`,
  'The keep-run-tape button is now asserted on a plain boot with no ?debug; previously every assertion on it sat downstream of a single ?debug query, so nothing would have noticed it vanishing from normal play (CLAUDE.md Mistake #10).',
  'Both pre-declared REJECT bars cleared. The decisive one I reproduced MYSELF rather than inheriting the runner’s proof: gating onKeepTape behind isDebugEnabled() in Game.ts reds the guard 2/2 ("element(s) not found"), git checkout reverts it byte-exact (Game.ts sha256 bcfb3d10024842dc identical, git diff -- src/ empty), and it greens again 2/2. A guard that has never executed its violation path is not evidence.',
  'The spec asserts the RENDERED button (getByTestId visible), not __THREE_GAME_DIAGNOSTICS__.',
  'Scope 1 was measure-first and correctly did NOT cancel: a plain boot does reach a death overlay (99.77s at /?seed=f1297-2-plain-only); the harness params only make it gateable in 13.69s. I verified the load-bearing claim at source — seed/timescale/nolevel are read independently of debug in src/core/DebugParams.ts, so the "plain boot" is genuinely plain.',
  'Gates on the merged tree: tsc clean; build green; own spec 2/2 desktop+390; adjacent derived by grep (tape-01-run-tape) 10 passed combined; zero console/page errors.',
  'Filed F-1318-3 (process, non-blocking): the slice shipped no artifacts report.md — its report lives only in the run log, which could make a later drainer reject a slice that fully satisfied its bar.',
  'Review: reviews/f1297-2-plain-boot-tape-button.md',
].join(' ');
writeFileSync('tasks/goals.json', `${JSON.stringify(doc, null, 2)}\n`);
JSON.parse(readFileSync('tasks/goals.json', 'utf8'));
console.log('leaf after :', leaf.status, leaf.mergeHash, `(${leaf.mergeHash.length} hex)`);

// --- review file: replace the merge-hash placeholder --------------------------
const rp = 'reviews/f1297-2-plain-boot-tape-button.md';
let review = readFileSync(rp, 'utf8');
const placeholder = '`<recorded in the drain commit — see tasks/goals.json leaf>`';
if (!review.includes(placeholder)) throw new Error('review placeholder not found');
review = review.replace(placeholder, `\`${MERGE}\` (\`--no-ff\`)`);
writeFileSync(rp, review);
console.log('review merge hash filled in');

// --- BACKLOG: retire F-1297-2, file F-1318-3 ---------------------------------
const bp = 'tasks/BACKLOG.md';
const lines = readFileSync(bp, 'utf8').split('\n');
const i = lines.findIndex((l) => /^[🔴🟠🟡🔵].*\*\*F-1297-2\b/.test(l));
if (i < 0) throw new Error('F-1297-2 row not found');

const closure =
  `✅ **SHIPPED s1318 at \`${MERGE.slice(0, 8)}\`, review \`reviews/f1297-2-plain-boot-tape-button.md\`. The plain-boot alarm now exists, and the thing that had to be proven was the RED, not the green.** ` +
  'Because the button was already correct by control flow, the new spec is green the moment it is written — *including if it is written wrong* — so the deliverable was always a guard demonstrated to fail on the defect it guards. ' +
  '✓ **I reproduced that proof myself on the merged tree instead of inheriting the runner’s:** gating `onKeepTape` behind `isDebugEnabled()` in `keepTapeOptions()` (`src/game/Game.ts`) reds it **2/2 — `element(s) not found`**; `git checkout HEAD -- src/game/Game.ts` restores it **byte-exact** (sha256 `bcfb3d10024842dc` identical either side, `git diff -- src/` empty); it greens **2/2** again. ' +
  '✓ Second bar also cleared: the spec asserts the **rendered** button (`getByTestId(\'keep-run-tape\')` visible), not `__THREE_GAME_DIAGNOSTICS__`. ' +
  '✓ **Scope 1 was measure-first and correctly did not cancel**, and I checked its load-bearing premise at source rather than taking it: a plain boot really does reach a death overlay (99.77s at `/?seed=f1297-2-plain-only`), and `seed` / `timescale` / `nolevel` are read **independently of `debug`** in `src/core/DebugParams.ts` (`:41`, `:42` + `getTimescale()` with no `isDebugEnabled()` check, `:79` reading the URL directly) — so the "plain boot" is genuinely plain and not a debug boot under another name. ' +
  'Gates: tsc clean · build green · own spec 2/2 desktop+390 · adjacent derived by grep (`tape-01-run-tape`) 10 passed combined · zero console/page errors · node-guards 204/204. ' +
  '*(original line retained per the Retention Law:)* ';
lines[i] = closure + lines[i];

const f1318_3 =
  '🔵 **F-1318-3 (s1318, met while draining f1297-2 — THE SLICE SHIPPED NO `report.md`, AND ITS PROOF LIVES ONLY IN THE RUN LOG).** ' +
  '`artifacts/f1297-2-plain-boot-tape-button/` holds the two screenshots and **no report**, unlike every recent slice (`artifacts/f1316-1-float-legibility/report.md`, `artifacts/f1314-3-stockpile-tier-voice/report.md`, …). The report itself is complete — plain measurements, mutation proof, gates, derived adjacent set — but it exists only as the runner’s closing message in `tasks/runs/20260801-055645-lane-b-lane-b-f1297-2-plain-boot-tape-button.md.log`. ' +
  '⚠️ **Why it matters rather than being tidiness:** the master made a manufactured RED the acceptance condition, so a drainer who looks for that proof where reports normally live finds **nothing** and can reject a slice that fully satisfied its bar. **I nearly did** — I had written the words "no report ⇒ REJECT" before checking the run log. The evidence is safe (run logs are mirrored into git under the Retention Law); the *discoverability* is what failed. ' +
  '➡️ **Cure (cheap, template-level):** the task master’s self-check should name `artifacts/<slice>/report.md` as a required artefact rather than "report what you found", so the proof lands as a file. Non-blocking; filed so the next author closes it in passing.';

lines.splice(i + 1, 0, f1318_3, '');
writeFileSync(bp, lines.join('\n'));
console.log('F-1297-2 retired; F-1318-3 filed at line', i + 2);
