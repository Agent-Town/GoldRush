/**
 * s1336 — append today's re-measurement to the tail of each row this fire
 * checked for currency. Appending at the END keeps each row's first 90 chars
 * (the subject zone both desk-declaration-guard and findings-state-guard read)
 * byte-identical — F-1335-4.
 */
import fs from 'node:fs';

const P = 'tasks/BACKLOG.md';
const lines = fs.readFileSync(P, 'utf8').split('\n');

/** [1-indexed line, id it must contain, text to append] */
const edits = [
  [486, 'F-1242-1', ` ⏱️ **RE-MEASURED s1336 — STILL TRUE, AND THE NUMBER IN THIS ROW IS NOW 173 MB LIGHT (see F-1336-1).** \`find logs/runs-archive -type f\` ⇒ **300** · \`git ls-files\` ⇒ **1** tracked · **299 untracked = 764.55 MB** (\`du -sh\` 765M). Series **591.19 → 635 → 764.55 MB**, monotonic. Cause byte-identical: \`.gitignore:7\` is still \`*.log\`, no negation anywhere in the file's 79 lines. The fork is unchanged; only its price tag moved.`],
  [227, 'F-1267-3', ` ⏱️ **RE-MEASURED s1336 — STILL TRUE, NUMBERS STALE-LOW (see F-1336-1).** Today: **1 tracked of 300** (was 1 of 247) · **299 ignored = 764.55 MB** (was 246 / 635 MB) · \`tasks/runs/\` **361.58 MB** (was 381 — the one figure that FELL, because the live pruner keeps trimming it, F-1242-2). \`check-ignore\` output identical. The recommended \`.log.gz\` negation is still unimplemented.`],
  [490, 'F-1242-2', ` ⏱️ **RE-MEASURED s1336 — STILL TRUE, UPTIME STALE-LOW.** \`pgrep -fl lane-runner\` ⇒ **one** process, **pid 35584**, started **Sat Jul 11 06:10:18 2026**, uptime **21d 10h** (filed at 18d 23h) — never restarted, so the live parse still predates the s1033 removal by **7 days**. The FILE is clean (prune present only as the commented DO-NOT-RESTORE epitaph, \`scripts/lane-runner-v3.sh:154\`); the PROCESS is not. Cliff signature reproduces: \`tasks/runs\` oldest **3.96d**, **0 files past 4.0d**, 137-file overlap with the archive. Remedy is still a runner RESTART — no file edit substitutes for it.`],
  [165, 'F-1260-3', ` ⏱️ **RE-MEASURED s1336 — STILL TRUE, AND ITS OWN DE-ESCALATION HAS EXPIRED (F-1336-2).** This row rated itself *"cosmetic until someone tries to register AP-08+ against the spec"*; that condition **fired 2026-07-31**, when \`specs/agent-play/README.md:96\` minted **AP-08 = THE ALPHA EXCHANGE** against a tree already carrying \`ap-08b-view-collection-firewall\` **merged** under a different AP-08. Also: the *"one off from AP-06 up"* quantifier is **too broad** — five \`ap-07-*\` leaves and \`ap-11\` are spec-correct; the defect is **two isolated collisions**, not a drift.`],
  [1922, 'F-1101-1', ` ⏱️ **RE-MEASURED s1336 — PREMISE PARTLY FALSE, AND THE "OWED" ACT IS NOW A TRAP (F-1336-3).** \`playwright.config.ts:50\` HAS carried \`workers: isFireShell ? 1 : undefined\` since \`d1a0846d\` (2026-07-30), guarded in BOTH directions by \`scripts/fire-shell-serialisation.test.mjs\`. So "pins no workers" is **FALSE for a fire** and **TRUE for lane/attended/plain \`npm test\`** (⇒ 8 workers, 16 cores) — and that residue is deliberately protected, not neglected. **Executing this row's OWED "authored master pinning workers explicitly" as written reds both guard arms, and its pre-flight demands a grep that now prints 5 lines.** RETIRE THE THREAD retires the OWED line with it.`],
  [110, 'F-1313-3', ` ⏱️ **RE-MEASURED s1336 — STILL TRUE, ZERO DRIFT, AND IT IS ONE DECISION WITH F-1313-2 (F-1336-4).** \`ToolSurface.ts:233-235\` still gates on the ceiling alone (\`PermissionLadder.ts:24-32\` takes no consent argument); \`StandingOrders.ts:410\` still checks consent while wrapping the same surface (\`:232\`). No commit after the filing touches the consent path.`],
  [108, 'F-1313-2', ` ⏱️ **RE-MEASURED s1336 — CORE STILL TRUE, ONE CLAUSE NARROWLY FALSE (F-1336-4).** \`prospectorCan\` (\`Game.ts:5874\`) still types only \`auto_collect | auto_repair | light_duty\`, so \`auto_pan\` stays structurally unaskable on the game loop. ✗ But *"unchecking it changes nothing"* is false on the orders path: \`StandingOrders.ts:419\` maps HARVEST → \`auto_pan\` and denies it. True only in a plain boot — the frame it was measured in. Fork **(4)** is F-1313-3's question restated.`],
  [30, 'F-1312-2', ` ⏱️ **RE-MEASURED s1336 — STILL TRUE, 100% REPRODUCED, ZERO DRIFT.** Contract unchanged (\`rail_tough\` 8 dirs / empty aliases; \`steam_wrecker\` + \`coal_thief\` 4 dirs with all four diagonals aliased). Processed diagonal cells on disk today: **railtough 16 · steamwrecker 0 · coalthief 0** — exactly as filed. Newest commit touching \`characters.v2.json\` **predates the finding**; the 3-rejected-takes-each crops are unchanged and **no 4th premise has been attempted**. Still owner/attended art-gated.`],
];

let ok = 0;
for (const [n, id, add] of edits) {
  const i = n - 1;
  if (!lines[i] || !lines[i].includes(id)) {
    console.error(`REFUSING line ${n}: expected ${id}, found: ${(lines[i] || '').slice(0, 80)}`);
    process.exit(2);
  }
  const before = lines[i].slice(0, 90);
  lines[i] = lines[i] + add;
  if (lines[i].slice(0, 90) !== before) {
    console.error(`REFUSING line ${n}: subject zone changed`);
    process.exit(2);
  }
  ok++;
}

fs.writeFileSync(P, lines.join('\n'));
console.log(`refreshed ${ok} rows; subject zones all byte-identical`);
