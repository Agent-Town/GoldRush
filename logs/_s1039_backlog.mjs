import fs from 'node:fs';
const P = 'tasks/BACKLOG.md';
let s = fs.readFileSync(P, 'utf8');
const mergeHash = process.argv[2];

// 1) Mark the F-1038 entry closed, in place, right after its lesson line.
const anchor = '- ⚠️ **F-1038 (opened s1038';
const i = s.indexOf(anchor);
if (i < 0) throw new Error('F-1038 anchor not found');
const marker = "destroys it.**";
const end = s.indexOf('\n', s.indexOf(marker, i));
if (end < 0) throw new Error('F-1038 end not found');

const closer = ` ✅ **CLOSED s1039 — MERGED (\`${mergeHash}\`), and the gate condition above was never satisfiable as written.**`
  + ` s1038's step-4 dichotomy (*green ⇒ merge; red on an idle machine ⇒ genuine TTI regression*) is a **false dichotomy**:`
  + ` it never asks whether **unmodified \`main\` fails \`:231\` too.** **It does.** A paired, alternating A/B — main's spec and`
  + ` \`cec50777\`'s spec swapped into the *same* worktree, run alternately against the *same* server so load cancels —`
  + ` puts **MAIN at mean 3670ms and the LANE at 3368ms over 5 desktop pairs**, with main red on **4 of 5** runs.`
  + ` **The unchanged baseline is ~300ms SLOWER than the change it was blocking.** Both variants show ~825ms of spread,`
  + ` so the noise belongs to the machine, not the diff. On mobile at load ~2.2 the lane is **green 2/2 with a 1ms spread**`
  + ` (1694/1695) while main is **red 2/2** on the favicon collision. Merged-tree gate **GREEN both projects**: desktop`
  + ` \`ttiMs\` **2621**, mobile **1714**, \`beforeFirstFrame\` **[]**, prefetch **5/5**, console/page/asset errors **0/0/0**;`
  + ` tsc clean, build green; all 5 files LANE-TOUCHED-only (\`git log d72188f3..main -- <paths>\` empty), zero \`src/\` bytes,`
  + ` so no gazette item and no deploy. Review addendum: \`reviews/perf-05-startup-attribution.md\`.`;

s = s.slice(0, end) + closer + s.slice(end);

// 2) New finding + new ladder rung, appended after the (now closed) F-1038 entry.
const newEntries = `
- 🔬 **F-1039-1 (OPEN, pre-existing, NOT caused by any recent slice — the residue the s1039 A/B exposed).** \`perf-05-startup:231\` (\`expect(ttiMs).toBeLessThan(3_000)\`) **fails on unmodified \`main\`** at load ≳4 and passes at load ≲3 — measured, not inferred: main scored **2874 / 3876 / 4392 / 3566 / 3643** across five interleaved desktop runs while the lane variant scored **3224 / 2947 / 3386 / 3510 / 3771**. The assertion is a **bare wall-clock threshold with no load precondition**, on a box that also runs Codex lanes, so its verdict is a function of what else the factory happens to be doing. That is why it drifted through four fires wearing three different explanations (F-1034-3 "threshold-shaped", F-1037-1 "refuted, the artifacts pass", F-1038-1 "load-sensitive, hold"). **DO NOT WIDEN THE THRESHOLD — F-1026-1 class**; a bigger number would buy silence, not truth, and the 3000ms bar is a real product commitment from \`8bd9eca\`. The two honest repairs, both needing an attended/owner call on which: **(a)** give the spec a **run precondition** — \`--workers=1\` plus a skip-with-a-loud-reason when \`pgrep -f "codex exec"\` is non-empty, so the gate refuses to render a verdict it cannot support; or **(b)** assert on a **load-normalised or best-of-N statistic** rather than a single draw. **(a) is the recommendation** — it keeps the product bar intact and makes the gate honest about when it can speak. **NOT fire-authorable blind** (it changes what "green" means for a shipped perf commitment = design-adjacent).
- 🧭 **F-1039-2 (process, OPEN — cheap, and it protects the whole factory).** Handoff stamps are being **hand-computed and drifting into the future**: s1038's line-1 reads \`2026-07-25T11:00Z\` but its handoff commit is \`17:14:05+07:00\` = **10:14Z**, a stamp **46 minutes ahead of real time**; the same fire reported lane-c as running "~70 min" when its run file was 15 minutes old. Harmless this once, because s1038 **cleared** its lock — but §1 tells every fire to **EXIT SILENTLY** while an \`ACTIVE\` lock is <45 min old, so **a future-dated \`ACTIVE\` stamp left by a fire that then dies stalls the entire factory for the skew plus 45 minutes**, and the staleness law's own clock is the thing that would be lying. **FIX (one line, any fire):** stamps come from \`date -u +%Y-%m-%dT%H:%MZ\`, never from arithmetic — s1039's lock did exactly this and lands within 10s of true UTC. Worth a line in \`scripts/fire.md\` §1 so it binds rather than depends on each fire noticing.
`;
const insertAt = s.indexOf('\n', end + closer.length);
s = s.slice(0, insertAt + 1) + newEntries.trimStart() + s.slice(insertAt + 1);

fs.writeFileSync(P, s);
console.log('BACKLOG updated: F-1038 closed, F-1039-1 + F-1039-2 laddered');
