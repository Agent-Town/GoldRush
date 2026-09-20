import fs from 'node:fs';

const p = 'tasks/BACKLOG.md';
const lines = fs.readFileSync(p, 'utf8').split('\n');

const row = [
  '- 🟥 **F-1467-2 (s1467, MEASURED + CURED + PROVEN SAME FIRE) — THE REVIEW FILE DOCUMENTING THE NUL CURE REINTRODUCED THE NUL DEFECT IN ITS OWN TITLE, AND LEFT `test:node-guards` RED ON MAIN FOR THE WHOLE FIRE THAT SHIPPED IT.**',
  ' `reviews/f1465-1-nul-delimiters.md` carried **2 raw 0x00 bytes** — `:1` (its own headline) and `:19` — at both sites where the author meant to write the six-character escape and instead wrote the literal byte.',
  ' **So the file explaining why `grep` goes blind was itself invisible to `grep`**, and `nul-audit`, the gate that same slice shipped, was RED on main from `42628516` until this fire.',
  ' ⓘ **NOT s1466 being careless — s1466 did exactly what the law told it to, and the law could not see this.** Its handoff correctly reports `nul-audit: CLEAN` "visibly running as the final leaf": that battery ran on the **merged tree** at `1a2871fd` (00:23:47), and the offending review file did not land until `42628516` (**00:27:18, 3.5 minutes later**).',
  ' It then ran `test:ledger-guards` LAST exactly as **F-1300-4** orders — **but `nul-audit` is a leaf of `test:node-guards` and is ABSENT from `test:ledger-guards`** (verified s1467 by reading both script bodies in `package.json`), so the prescribed remedy was **structurally incapable** of catching it.',
  ' 🎯 **THIS WIDENS F-1300-4 A THIRD TIME, AND THE NEW SUBJECT IS THE ONE EVERY DRAIN WRITES.** s1301 derived the class as *"guards whose subject a fire mutates late in its own run"* and named three subjects — ledger rows, law surfaces, gate topology.',
  ' **There is a fourth: REVIEW AND EVIDENCE PROSE.** Every drain writes `reviews/<slice>.md` after its battery, `nul-audit` reads tracked text as **bytes**, and nothing re-read it. The pattern s1301 warned about repeated precisely: a denominator derived by asking *what do these guards read?* instead of *what does a fire change after the battery runs?*',
  ' ✅ **CURED IN MECHANISM, NOT IN A NOTE:** `nul-audit.mjs` is now the final leaf of **`test:ledger-guards`** as well as `test:node-guards`, so the F-1300-4 run-last duty now covers the prose a fire writes last. One-line `package.json` edit; `nul-audit` was already rooted, so gate topology is unchanged.',
  ' 🧪 **PROVEN BY MANUFACTURING THE DEFECT, NOT BY A GREEN (the s1299/s1301 standard — a passing guard never executes its violation path):** baseline `rc=0 CLEAN` → inject one raw NUL into a tracked review file → **`rc=1`, file named** → restore → `rc=0`, and the target verified **byte-identical by sha256** (`edc4f133…f39b` both sides). Probe: `logs/session-scratch/s1467-prove-nul-guard.mjs`.',
  ' 🔧 **The instance is fixed too:** both raw bytes replaced with the `\\u0000` escape the audit itself prescribes — the parsed string is unchanged, only the on-disk bytes move — and the file is now grep-readable (`grep -c "" ` → **154**, previously blind/exit-1). **GATE: CLOSED.**',
].join('');

const anchor = lines.findIndex((l) => l.includes('F-1467-1 (s1467'));
if (anchor < 0) throw new Error('F-1467-1 anchor not found — refusing to guess a position');
if (lines.some((l) => l.includes('F-1467-2 (s1467'))) {
  console.log('row already present, no-op');
  process.exit(0);
}
lines.splice(anchor + 1, 0, row);
fs.writeFileSync(p, lines.join('\n'));
console.log('inserted F-1467-2 after line', anchor + 1);
