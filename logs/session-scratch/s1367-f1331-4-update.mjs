// s1367: append the F-1367-1 cross-reference to the F-1331-4 owner-desk row.
// Kept in logs/session-scratch/ and committed per the RETENTION LAW (untracked
// scratch dies with the disk; tracked scratch is history).
import fs from 'node:fs';

const p = 'tasks/BACKLOG.md';
let src = fs.readFileSync(p, 'utf8');

const anchor =
  "**THE RULING THIS ROW ASKS FOR IS STILL OPEN AND STILL THE OWNER'S** — and it is now, at last, *genuinely* nothing but repo weight.";

const n = src.split(anchor).length - 1;
console.log('anchor occurrences:', n);
if (n !== 1) {
  console.error('ABORT: anchor not unique — refusing to edit');
  process.exit(1);
}

const add =
  anchor +
  ' 💰 **UPDATE s1367 (F-1367-1) — THE BYTES ARE UNCHANGED; WHAT THIS DIRECTORY COST IS NOT.**' +
  ' The `art-pose-library-01` run-note that supplies this row’s credit figures states' +
  ' *“generation stopped before any Prospector still or video was started”* — **false**:' +
  ' `pose-library/prospector/logs/` holds **18 distinct Seedance 2.0 job ids** (0 overlap with hero’s 36)' +
  ' with **6 polled results, all `status: completed`**, created **7 min 21 s AFTER the credit log’s' +
  ' accounting window closed** and **16 minutes before the note denying them was written**.' +
  ' **Unrecorded spend: 108 credits confirmed, up to 324 if the 12 unpolled submissions charged —' +
  ' in which case the run ended at 737.99, below the 800-credit floor it claims to have stopped for.**' +
  ' Not arbitrable from disk (the sibling notes record plan resets and concurrent attended-wave jobs);' +
  ' the decisive probe is a `higgsfield account transactions` query at `2026-07-11T13:22Z`, which is' +
  ' **owner/attended, being an external paid service (§7)**. **No salvage and no deletion owed** —' +
  ' that sub-directory has empty `contact-sheets/` and `frames/`, so it holds no curated layer.' +
  ' Corrective on main: `assets/motion-pilot/pose-library-CREDIT-CORRECTIVE.md`.';

src = src.replace(anchor, add);
fs.writeFileSync(p, src);
console.log('F-1331-4 update appended');
