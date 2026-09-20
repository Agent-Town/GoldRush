import fs from 'node:fs';

// 1. BACKLOG: append the whole-repo corroboration.
const bp = 'tasks/BACKLOG.md';
let b = fs.readFileSync(bp, 'utf8').replace(/\s*$/, '\n');
b +=
  '- ✅ **F-1126-1 CORROBORATED ON A WIDER DENOMINATOR (same fire, abandoned probe finished late).** My finding was written from a grep over `scripts/` + `.claude/` + `.github/` + `AGENTS.md` + `CLAUDE.md`. A **whole-repo** grep (excluding only `node_modules`, `.git`, `worktrees`, `logs`, `dist`, `artifacts`, `reviews`, and the ledger/doc files `package.json`, `tasks/`, `STATUS.md`, `docs/`) then completed and **agrees, with nothing narrower left to hide in**: `test:node-guards` **0** refs · `test:power-budget` **0** · `test:stats` **0** · `test:accounts` **0** · `test:mp` **1** · `test:deploy-contract` **1** · `test:deploy-site-contract` **1** — and **all three of those 1s are `scripts/run-guards.mjs`, the file this fire shipped.** Before `9a2e4842` the count across the entire tree was **literally zero for all seven**.\n' +
  '- 🟡 **F-1126-2 (NEW, from the same wider sweep) — THE UNCALLED SET IS BIGGER THAN SEVEN, AND ONE OF THE EXTRAS IS A RELEASE GATE.** `test:release` has **0 references anywhere** — including in `scripts/deploy.sh`, which the DEPLOY LAW runs after a gameplay merge, so **no release-config suite gates a deploy**. `test:asset-diet` has 2 references and **both are comments** (`e2e/asset-diet.spec.ts:2` `// Run: npm run test:asset-diet`, and a failure-message string at `:12`) — a guard whose only callers are instructions to a human. These two are **playwright/browser** guards, so they are deliberately **outside** `test:guards` (which is the non-browser set and must stay fast); recording them as a separate finding rather than widening the tool. **Attended/owner call, same shape as (F).**\n';
fs.writeFileSync(bp, b);

// 2. STATUS line-1: extend item (C) with the wider denominator.
const sp = 'STATUS.md';
const L = fs.readFileSync(sp, 'utf8').split('\n');
const needle =
  'which is precisely why F-1125-1 could hide for a day.';
if (!L[0].includes(needle)) throw new Error('anchor not found in STATUS line-1');
L[0] = L[0].replace(
  needle,
  needle +
    ' ✅ **CORROBORATED LATE ON A WIDER DENOMINATOR:** an abandoned whole-repo grep finished after my handoff and agrees — **0 refs each** for `test:node-guards`/`test:power-budget`/`test:stats`/`test:accounts`, and the only hits for the other three are **`scripts/run-guards.mjs`, the file this fire shipped**. Before `9a2e4842` the tree-wide count was **literally zero for all seven**. 🟡 **And it surfaced F-1126-2: the uncalled set is BIGGER than seven** — **`test:release` has 0 refs anywhere, including `scripts/deploy.sh`, so no release suite gates a deploy**, and `test:asset-diet`’s only two references are **comments telling a human to run it**. Both are browser guards, so deliberately outside `test:guards`; logged for attended, not widened into the tool.',
);
fs.writeFileSync(sp, L.join('\n'));
console.log('BACKLOG appended; STATUS line-1 extended to', L[0].length, 'chars');
