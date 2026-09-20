import { readFileSync, writeFileSync } from 'node:fs';
const P = 'tasks/BACKLOG.md';
let t = readFileSync(P, 'utf8');
let n = 0;

// --- (A) F-1336-2's own row: its declared-owed UNVERIFIED half is discharged. Cite by content.
const a_from = '**UNVERIFIED and owed to whoever takes it: whether any consumer keys off the `ap-*` ids (drain-block-check matching, review cross-references) — survey before renumbering.**';
const a_to = a_from + ' ✅ **SURVEYED s1356 (F-1356-1) — DISCHARGED, AND NEITHER NAMED SUSPECT WAS THE ANSWER.** Three functional consumers, measured by execution: **`drain-block-check.mjs`\'s id branch is REAL but insensitive** (40 id-resolved hits across 2,266 real filenames, **none `ap-*`**; bumping all 13 `ap-*` ids changed **0/2,266** — proven non-vacuous by a control mutation of `e1-contracts`, which changed 3). **`law-pointer-guard.mjs` keys its BASELINE on the goal id** (`tasks/goals.json[<id>] -> <file>:<line>`), so a rename reads as `NEW POINTER` and REDS — **live but unarmed: 7 goal-id-keyed pointers in the baseline, 0 of them `ap-*`.** **`goal-tracker.test.mjs` asserts id UNIQUENESS + lowercase**, which also corrects the word *collision* in F-1260-3: the existing `ap-07`×5 overlap is **semantic, not string**, and nothing is red today. 🔥 **The one that actually breaks is review cross-references: 7 of the 16 `ap-*` ids have a review file whose filename IS the id** (a house convention holding for **120 of 564** id-bearing nodes), and **nothing guards it** — renumbering without renaming those 7 loses the link silently. ⓘ **Count correction to the candidate note that banked this: the ids number 16, not 29** — 29 is the uppercase `AP-NN` label count. ➡️ **Renumbering stays ATTENDED, but its cost is now bounded: rename the 7 review files in the same commit, keep uniqueness, re-run `law-pointer-guard --update` only if an `ap-*` leaf has gained a citation by then, and expect no `drain-block-check` risk.**';
if (t.includes(a_from)) { t = t.replace(a_from, a_to); n++; } else console.log('!! A anchor MISS');

// --- (B) F-1351-1's banked candidate (6): mark done so nobody re-takes it.
const b_from = '**(6) F-1336-2** — the row declares a survey *"owed to whoever takes it"*: which consumers key off `ap-*` ids (29 live in `goals.json`).';
const b_to = '**(6) F-1336-2** — the row declares a survey *"owed to whoever takes it"*: which consumers key off `ap-*` ids (29 live in `goals.json`). ✅ **DONE s1356 (F-1356-1) — AND THE COUNT IN THIS VERY SENTENCE IS WRONG: there are 16 `ap-*` ids; 29 is the uppercase `AP-NN` label count, a different noun.** Surveyed by execution: `drain-block-check`\'s id branch is real but **insensitive** (0/2,266 resolutions changed by renumbering, control-proven), `law-pointer-guard` keys its **baseline** on the id (live, but 0 of its 7 goal-id pointers are `ap-*`), `goal-tracker` asserts uniqueness — **and the real break is review cross-references: 7 of the 16 ids have a review file named for them, unguarded.** **Do NOT re-take this candidate.**';
if (t.includes(b_from)) { t = t.replace(b_from, b_to); n++; } else console.log('!! B anchor MISS');

writeFileSync(P, t);
console.log('amended', n, 'of 2');
