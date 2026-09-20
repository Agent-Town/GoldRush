// s1662 drain bookkeeping: BACKLOG edits, all in the drain-bookkeeping commit.
//   1. F-1660-1 row  -> SHIPPED marker with the merge hash.
//   2. F-1608-2 row  -> its "door-de-listed" reassurance is TRUE again (it was VOID).
//   3. ap16-4 SHIPPED row -> a pointer back, so a reader of the row that CAUSED the
//      reversal learns it had an omission (supersede, never delete).
// Usage: node s1662-backlog.mjs <short-hash>
import { readFileSync, writeFileSync } from 'node:fs';

const short = process.argv[2];
if (!/^[0-9a-f]{8,9}$/.test(short || '')) throw new Error('need the short merge hash');

const P = 'tasks/BACKLOG.md';
const lines = readFileSync(P, 'utf8').split('\n');
const edits = [];

const findOne = (needle, label) => {
  const hits = lines.map((l, i) => (l.includes(needle) ? i : -1)).filter((i) => i !== -1);
  if (hits.length !== 1) throw new Error(`${label}: expected exactly 1 line, found ${hits.length}`);
  return hits[0];
};

// 1. F-1660-1 -> SHIPPED
const i1 = findOne('🔧 **F-1660-1 (s1660 2026-08-11', 'F-1660-1 row');
lines[i1] = lines[i1].replace(/^🔧 /, '✅ ') +
  ` ✅ **SHIPPED s1662 \`${short}\` — THE DOOR SHUT AGAIN, AND THIS TIME IT CANNOT BE OPENED BY OMISSION.** ` +
  'Drained s1662 in detached worktree `gate-s1662b` (ort, zero conflicts, 8 files +1149/−1075). ' +
  '**The probe that matters, run directly rather than inferred:** `gr-sim --contract=e2-hill-mine --policy=idle` now exits **1** ' +
  'with the `AP-07 supports only` throw (the derived door named in that error carries **19** ids, no railcar), while ' +
  '`--mode=escort` exits **0** and emits `goldrush.view.v1` with the Railhead Escort objective — **both directions of ' +
  '`ap-16-same-game-law.md:33` hold**, which is precisely what the de-list was the mechanism for. ' +
  'Gates: tsc clean · build green (8.76s, 2186 modules) · `er01-e2-census` + `ap16-4-contract-admission` desktop **5/5** and ' +
  'mobile-390px **5/5** at `--workers=1` · `skillmd-guard` **5/5 untouched** · `gr-sim.test.mjs` green · the new ' +
  '`door-admission-ratchet` **re-proven to BITE by manufacturing the defect in the drain** rather than inheriting the runner’s ' +
  'transcript (delete the `e2-incline` entry → 1 fail; byte-identical restore → 1 pass). ' +
  '🔧 **F-1662-1 CURED IN THE SAME DRAIN:** the door change left `null-floor-anchors` **RED**, because ' +
  '`assets/contracts/null-floors.json` still carried idle rows for the three de-listed railcars and the runner was firewalled ' +
  'out of `assets/contracts/**`. **The firewall was right about its subject and wrong about its scope** — its rationale names ' +
  '*contract BUNDLES*, but `null-floors.json` is a **generated artifact** whose key set `scripts/null-floor-anchors.mjs` derives ' +
  'from the door, so removing the rows **follows** admission rather than changing it. **A firewall keyed on a PATH inherits every ' +
  'file that happens to live under it.** Cured by surgical splice (312→258 lines, 12→9 contracts), not regeneration — a full regen ' +
  'also rewrites `eraStamp` (`git merge-base HEAD main`, F-1653-3). RED before / GREEN after. ' +
  '🔺 **F-1662-2 (NON-BLOCKING, corrective owed):** `scripts/same-game-audit.mjs:379` hardcodes *"leaving five cited exemptions"* ' +
  'while the table now emits **eight** — **accurate on main today, false only after this merge**. Not hand-tuned in the drain: ' +
  '"five" may mean *five of that population of fifteen* (still true) or *five in total* (now false), and the generator must decide. ' +
  '💡 **It is the same class as this row’s own root** — a policy in a comment evaporates when its structure is derived; a **count in prose** ' +
  'rots when its table grows. 🔺 **F-1662-3 (NON-BLOCKING):** the three exemption `reason` strings are byte-identical asserting all three ' +
  '*"reached the wave ceiling"*, but the pinned null-floor evidence this drain deletes shows `e2-hill-mine` and `e2-trestle` at ' +
  '**18 waves / 540000ms** (the cap) and `e2-incline` terminating at **wave 2 in ~80s** on both seeds. Policy unaffected — the citation is ' +
  '**F-E2S-3, the owner ruling naming all three BY NAME** — but the prose over-generalises, and **the error is the MASTER’s, not the runner’s**: ' +
  'it ordered the uniform phrasing, inheriting s1605’s proof measured on `e2-hill-mine` alone. ' +
  'Review: `reviews/f1660-1-door-readmission-repair.md`.';
edits.push('F-1660-1 -> SHIPPED');

// 2. F-1608-2 reassurance restored
// Anchor on the row's own opening marker, NOT the reassurance sentence: the F-1660-1
// row quotes that sentence verbatim, so the obvious needle matches two lines.
const i2 = findOne('🔺 **F-1608-2 (s1608 2026-08-10', 'F-1608-2 row');
if (!lines[i2].includes('Both maps are currently door-de-listed per F-E2S-3')) {
  throw new Error('F-1608-2 row no longer carries the reassurance sentence — re-read before editing');
}
lines[i2] += ` ✅ **RE-CONFIRMED s1662 \`${short}\`:** that sentence was **VOID** from \`48a0d41ab\` until now — the derivation had ` +
  'silently re-admitted both maps (F-1660-1). The de-list is restored as a cited exemption, so **the reassurance is true again** and ' +
  'nothing is blocked meanwhile. Recorded because it was the ledger line whose quiet falsehood pointed s1660 at the reversal.';
edits.push('F-1608-2 -> reassurance restored');

// 3. back-pointer on the ap16-4 SHIPPED row
const i3 = findOne('✅ **SHIPPED s1643 `d4fcc354` — ap16-4 SAME-GAME ADMISSION', 'ap16-4 shipped row');
lines[i3] += ' ⚠️ **CORRECTION s1662:** this slice was sound but carried **one omission** — its derivation did not carry the three ' +
  'F-E2S-3 railcars into `CONTRACT_ADMISSION_EXEMPTIONS`, silently re-admitting them modelessly for ~15 hours (F-1660-1, cured at ' +
  `\`${short}\`). The row stands; read it with that pointer. **The door is now ratcheted against a repeat** by ` +
  '`scripts/door-admission-baseline.json`, whose denominator sits in a file the defect cannot touch.';
edits.push('ap16-4 row -> correction pointer');

writeFileSync(P, lines.join('\n'));
console.log(edits.join('\n'));
