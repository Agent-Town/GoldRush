// s1275 — F-1275-2: the drain skill carried a STALE PROHIBITION.
//
// It stated `playwright.config.ts` sets no `workers` key and ended "Never move this into
// playwright.config.ts". Both were false as of d1a0846d (s1270): line 30 carries
// `workers: isFireShell ? 1 : undefined`. The prohibition existed to keep lanes at full
// parallelism, and the shipped mechanism SATISFIES that — so read literally it condemned
// its own cure, and a session obeying it would delete line 30 and re-open F-1270-1.
//
// Written as a script because .claude/** is write-gated for fires; node fs is not.
import fs from 'node:fs';

const FILE = '.claude/skills/drain/SKILL.md';

const OLD =
  '`playwright.config.ts` sets no `workers` key, so a fire defaults to **6 obtained workers**, ' +
  "and at 6 the fire shell's per-job CPU ceiling (F-1269-1) starves each chromium into timing " +
  'reds. Interleaved, same shell, same hour: **w=1 → 3/3 runs rc=0, 0 drift reds / 18 · default ' +
  '→ 3/3 runs rc=1, 17 drift reds / 18**, and w=1 was *faster* (55.94 s vs 60.74 s mean). **A red ' +
  'seen at default workers is not evidence until it reproduces at `--workers=1`.** Never move ' +
  'this into `playwright.config.ts` — the lane shell runs 6 workers ~3.5× faster and would pay ' +
  'for a fire-only defect.';

const NEW =
  'Before the mechanism landed, `playwright.config.ts` set no `workers` key, so a fire defaulted ' +
  "to **6 obtained workers**, and at 6 the fire shell's per-job CPU ceiling (F-1269-1) starves " +
  'each chromium into timing reds. Interleaved, same shell, same hour: **w=1 → 3/3 runs rc=0, 0 ' +
  'drift reds / 18 · default → 3/3 runs rc=1, 17 drift reds / 18**, and w=1 was *faster* ' +
  '(55.94 s vs 60.74 s mean). **A red seen at default workers is not evidence until it ' +
  'reproduces at `--workers=1`.**\n' +
  "  - ✅ **THE LAW NOW HAS A MECHANISM — THIS BULLET'S OLD PROHIBITION WAS STALE AND IS " +
  'CORRECTED (F-1275-2, s1275).** It used to end *"Never move this into `playwright.config.ts`"* ' +
  'and to state that the config sets no `workers` key. Both were **false as of `d1a0846d` ' +
  '(s1270)**: `playwright.config.ts:30` carries `workers: isFireShell ? 1 : undefined`, keyed on ' +
  '`CLAUDE_CONFIG_DIR` being PRESENT (launchd and `fire-runner.sh:81` set it; lanes and attended ' +
  'sessions never do). The prohibition existed to stop lanes paying for a fire-only defect — and ' +
  'the shipped mechanism **satisfies** that constraint rather than violating it, so read ' +
  'literally the old sentence condemned its own cure. `scripts/fire.md` §3.1 carries the same ' +
  'warning; this sibling surface simply never got the update. **Do NOT "restore" the old wording ' +
  'by deleting line 30** — that silently re-opens F-1270-1 and returns every fire-side gate to a ' +
  'known-unreliable instrument.\n' +
  '  - 🚫 What remains genuinely forbidden is pinning `workers` **unconditionally** — the lane ' +
  'shell runs 6 workers ~3.5× faster (F-1267-1). 🔒 Both directions are guarded by ' +
  '`scripts/fire-shell-serialisation.test.mjs` in `test:node-guards`. Keep passing `--workers=1` ' +
  'explicitly anyway: it is free, it survives anyone editing the config, and it keeps the intent ' +
  'legible at the call site.\n' +
  "  - 🧰 **Prefer `node scripts/gate-battery.mjs '<jobs JSON>'` to a hand-rolled driver " +
  '(F-1255-3, s1275).** It injects `--workers=1` into every playwright job, keeps an ' +
  '**append-only ISO-stamped transcript** so a multi-battery drain cannot overwrite its own ' +
  'earlier arms, and takes its verdict from exit codes rather than a parse of stdout. Fires ' +
  'previously re-minted this driver each session and kept re-introducing the bugs the last fire ' +
  'had fixed.';

const src = fs.readFileSync(FILE, 'utf8');
const hits = src.split(OLD).length - 1;
if (hits !== 1) {
  console.error(`ANCHOR MATCHED ${hits} TIMES — refusing to patch, nothing written.`);
  process.exit(9);
}
fs.writeFileSync(FILE, src.replace(OLD, NEW));
console.log('patched', FILE);
console.log('stale claims remaining:', /sets no `workers` key/.test(fs.readFileSync(FILE, 'utf8')));
