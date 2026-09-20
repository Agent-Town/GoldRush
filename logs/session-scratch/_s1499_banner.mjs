import fs from 'node:fs';

const p = 'reviews/milk-agent-seat.md';
const lines = fs.readFileSync(p, 'utf8').split('\n');
const idx = lines.findIndex((l) => l.trim() === '---');
if (idx < 0) { console.log('ANCHOR MISS'); process.exit(1); }

const banner = [
  '',
  '> ## 🟩 DRAIN BANNER — MERGED TO MAIN s1499, `90f9a9a58cf8474e260265c8f9e2b27d9cfe6def`',
  '> **Verdict: MERGED.** The last of the eight milk branches; the pile is empty. Gated in detached `gate-s1499b` (§3.0b, `--workers=1`): tsc rc=0 · build `built in 1.05s` · `test:node-guards` **345 / 342 pass / 0 fail / 3 skipped** (+4 vs main — this slice’s own guard is genuinely running, and `gate-caller-audit` green proves the new npm script is ROOTED, not orphaned) · `e2e/agent-seat.spec.ts` rc=0 · **adjacent: all nine `er01-e2..e10` census suites, 72/72 green in 211 s** — re-measured rather than inherited, because `HeadlessContractSim.ts` is shared with every one of them and a slice-local green is structurally blind to that.',
  '> **Five conflicts, all resolved as UNIONS, none as a choice.** The one worth naming: taking this branch’s `package.json` line whole would have silently DELETED three guards main added after this branch’s base — including `skillmd-guard.test.mjs`, **the guard watching `public/skill.md`, which this branch also edits**. It would have left valid JSON and a green battery behind. Resolved by computing the union set-wise in code and asserting all three main-only guards present BY NAME, never by reading two long lines side by side. The `HeadlessContractSim.ts` conflict s1498 flagged as *the dangerous kind* turned out to be a 7-line import hunk (this branch widened `LockstepClient` to carry `type LockstepAction`; main added the two era sockets from the twin-sockets drain) — both kept.',
  '> **Declared deviation, recorded not excused:** the probe runs on ONE project by its own `test.skip` (*"one door proof is enough; the 390px arm is captured in-test"*), with the mobile arm covered by the shipped `artifacts/agent-seat/seat-390px.png`. **Reproducibility, found by accident:** re-running the probe in the gate changed exactly one field — the freshly minted room claim word (`537DBEA9…` → `5DE4F5B0…`) — and re-derived every other field and both screenshots identically. Main deliberately carries the shift’s own artifacts, not the gate’s re-run.',
  '',
];

lines.splice(idx, 0, ...banner);
fs.writeFileSync(p, lines.join('\n'));
console.log('banner inserted at line', idx + 1);
