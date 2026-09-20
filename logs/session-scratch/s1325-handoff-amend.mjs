import fs from 'node:fs';

const p = 'STATUS.md';
const lines = fs.readFileSync(p, 'utf8').split('\n');

const OLD = '**`test:ledger-guards` run as my LAST act**, after the rows existed — see §H for the result. ';
const NEW = [
  '🧪 **(F2) `test:ledger-guards` RUN AS MY LAST ACT — AND IT CAUGHT THREE DEFECTS, ALL THREE MINE (`da7d9808`).** ',
  'This is the F-1300-4 class doing exactly what it was written for, and it landed in **all three of the subjects a fire mutates late**: ',
  '⑴ **LAW SURFACE** — my own janitor fix inserted **15 lines directly above the RETENTION LAW epitaph**, rotting `CLAUDE.md`’s pointer `lane-runner-v3.sh:139` → **`:154`** (and the `.git` sweep `:137` → **`:152`**). ',
  '**Substance re-verified BY READING the file, not by trusting the guard:** the prune is still present only as a commented DO-NOT-RESTORE epitaph — the law is INTACT and was never violated. ',
  '⚠️ That coordinate has now rotted **twice** (`:118`→`:139`→`:154`), which is recorded in the clause itself so the third time is expected rather than alarming. ',
  '⑵ **LEDGER ROW** — my new goal leaf had no `title`, which `goal-tracker.test.mjs` requires. ⑶ **CITATION** — my BACKLOG row and master cited a spec line with no test title. ',
  '**All five segments now green, rc=0** (citations 377 scanned / PASS, findings-state PASS, blocker-panel PASS, ruling-propagation 3 RULED / 20 refusals / 0 stale, law-pointer 16 pointers re-based). ',
  '💡 **Note what this means: a fire that had run the battery once at drain time and stopped would have shipped all three.** The battery is not a formality at the end — it is the only instrument that sees the fire’s own tail. ',
].join('');

if (!lines[0].includes(OLD)) { console.log('anchor not found'); process.exit(1); }
lines[0] = lines[0].replace(OLD, NEW);

// lane-c is no longer merely "queued" — the runner picked it up at 10:59:16.
lines[0] = lines[0].replace(
  '➡️ **(G) NEXT FIRE.** **(1) lane-c is LIVE on F-1324-3**',
  '➡️ **(G) NEXT FIRE.** **(1) lane-c is LIVE on F-1324-3** (runner picked it up **10:59:16**; note its running copy predates the citation-title edit — a cosmetic difference only, and re-copying would have been a DUPLICATE dispatch, so I did not)'
);

fs.writeFileSync(p, lines.join('\n'));
console.log('handoff amended, line1 len', lines[0].length);
