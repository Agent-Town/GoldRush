// s1225 / F-1225-1 — build the proposed /drain SKILL.md rather than retype it.
//
// A headless fire cannot write .claude/** (permission-gated; measured this fire — the Edit
// was refused). So the cure is produced as an artifact an attended session or the owner can
// apply with ONE command:
//
//   cp logs/session-scratch/s1225-drain-skill-proposed-SKILL.md .claude/skills/drain/SKILL.md
//
// Three insertions, each pure ENCODING of a law that is already binding elsewhere — no new
// policy is invented here:
//   1. §0  scripts/fire.md §3.0 — drain-block-check, "the FIRST command of every drain".
//          Its own cure commit d39e831a wired it into /author-task and skipped /drain.
//   2. §3  npm run test:node-guards — F-1125-1's recommendation, asked 38 times on the desk.
//          tsc's include is [src, e2e, playwright.config.ts], so it does NOT cover scripts/**;
//          these guards are the only gate there.  Measured green this fire, 7/7.
//   3. §5  the Goal Registration Law (owner ruling 2026-07-16) — "every drain updates that
//          leaf's status and merge hash IN THE DRAIN COMMIT."  Absent from every skill.
import fs from 'fs';

const src = '.claude/skills/drain/SKILL.md';
const out = 'logs/session-scratch/s1225-drain-skill-proposed-SKILL.md';
let text = fs.readFileSync(src, 'utf8');
const before = text;

const BLOCK_CHECK = `- [ ] **IS IT ALLOWED? — the FIRST command, before classification and before you form an opinion:** \`node scripts/drain-block-check.mjs <done-move filename | taskfile | branch>\`. **Exit 1 = STOP: do not drain, do not gate, do not "just check the merge."** Every other precondition asks *is it READY* — but a policy block is **not a property of the tree**, so no git probe can ever see it. s1104 merged owner-gated rf-34 with a genuinely-ahead branch, a real two-dot diff, and a runner report it judged sound — then reversed it the same fire. **A well-argued runner report is not an unblock; it is often exactly what made the fork worth reserving for the owner.** The block lives in \`tasks/goals.json\` (\`status:"blocked"\` + \`blockedReason\`) keyed by \`taskFile\`, which every done-move filename already contains — a lookup, not a judgement, one second. A block is lifted by the OWNER only, never by a green battery. Exit 2/UNKNOWN = no goal leaf matched: that is a Goal Registration Law bookkeeping finding, **not a clearance** (F-1116-1: 524 of 644 masters have no leaf). \`--all\` audits every blocked leaf on the board.
`;

const anchor0 = '## 0. Preconditions (abort if any fails; fix the precondition first)\n';
if (!text.includes(anchor0)) throw new Error('anchor 0 not found');
text = text.replace(anchor0, anchor0 + BLOCK_CHECK);

const anchor3 = 'npx tsc --noEmit\nnpm run build\n';
if (!text.includes(anchor3)) throw new Error('anchor 3 not found');
text = text.replace(anchor3, 'node scripts/drain-block-check.mjs <the drain unit>   # §0 — re-assert on the merged tree\nnpx tsc --noEmit\nnpm run build\nnpm run test:node-guards        # tsc does NOT cover scripts/** — these guards are its only gate\n');

const anchor5 = '- [ ] `tasks/BACKLOG.md`: mark the ladder line';
if (!text.includes(anchor5)) throw new Error('anchor 5 not found');
text = text.replace(
  anchor5,
  '- [ ] **GOAL REGISTRATION LAW (owner ruling 2026-07-16): flip this slice\'s leaf in `tasks/goals.json` IN THE DRAIN COMMIT** — `status` → `merged` and `mergeHash` → the full 40-char hash. Not `mergeCommit`: that near-miss key is read by NO consumer, so such a leaf is simultaneously "merged without evidence" to `goal-tracker.test.mjs` and "not shipped" to the queue guard (F-1123-1). Missing goal-tree bookkeeping means the drain duty is UNFINISHED.\n' + anchor5,
);

fs.writeFileSync(out, text);

const added = text.split('\n').length - before.split('\n').length;
console.log(`wrote ${out}`);
console.log(`lines: ${before.split('\n').length} -> ${text.split('\n').length} (+${added})`);
console.log(`apply with: cp ${out} ${src}`);
