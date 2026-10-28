import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const dir = 'artifacts/s3413', read = p => fs.readFileSync(p, 'utf8');
const stamp = execFileSync('date', ['-u', '+%Y-%m-%dT%H:%MZ'], { encoding: 'utf8' }).trim();
const initial = read(`${dir}/lock.txt`).trim(), status = read('STATUS.md');
if (status.split('\n')[0] !== initial) throw Error('Lock ownership changed');
if (!read(`${dir}/dry-board.txt`).includes('✅ DRY') || !read(`${dir}/skillmd-guard.txt`).includes('ℹ pass 19')) throw Error('Verification incomplete');
const desk = read(`${dir}/desk-tail.txt`).trim();
const summary = 'WHY no product landing: board DRY (95 subjects, zero eligible/unknown), four absorbed lanes. Runner and nine public checks healthy; private coverage 66/66; skill checks 19/19. Ledger receipt: artifacts/s3413/ledger-result.json. Week 45 deployment due before November 2. Evidence artifacts/s3413/report.md.';
const acknowledgements = 'DESK-NOT-OWED: F-2987-1 — Option B ruled and cut over attended; no further capacity choice owed. DESK-NOT-OWED: F-2742-1 — discharged attended 2026-09-29 by 40dbcf2f8; origin backup verified.';
const body = `${summary} ${acknowledgements} ${desk}`;
const active = `ACTIVE ${stamp} (s3413 fire) — ${body}`;
fs.writeFileSync('STATUS.md', active + '\n\n- **s3413 lock (line-1 archive):** ' + initial + status.slice(status.indexOf('\n')));
fs.writeFileSync(`${dir}/tested-line1.txt`, active + '\n');
fs.writeFileSync(`${dir}/handoff-body.txt`, body + '\n');
const verification = `Fresh verification at ${stamp}: dry-board-probe read 1,483 done-moves and classified 95 subjects: 82 merged, 13 closed/blocked, zero eligible/unknown. All four main..lane histories are empty, with zero tracked lane dirt. Five registered worktrees, zero unreported ahead and zero could-not-answer. Six queues, running tasks and pending crafting orders are empty; none of 118 historical failures is newer than s3412. The latest implementer run's index-lock obstruction is historical: delivery 4fe2becb8, drain b5d6d3c32 and record 614f84ca5 are main ancestors, and assayer-sync-visibility-1 has the matching merged goal leaf. CODEX-WALL and attended custody remain; subscription capacity was not tested by dispatch. Later authorized dispatch needs a dependency-aware lane refresh.

Launcher 76751 → 76800 → 76801 owns the process lock, created at 12:37:00 UTC with matching 19:37:01 local FIRE START. The preceding fire ended at 18:36:54 local, rc 0. Runner 26518 is alive under parent 1, independently confirmed by ps and health-watch; no restart or predecessor takeover was needed. The main-slot semaphore is ACTIVE and not lock CLEARED at scripts/lane-runner-v3.sh:322. The actual launcher uses Codex, and its exit trap owns lock-directory cleanup.

At 12:38 UTC all nine public GETs returned HTTP 200; five API bodies parsed as ok:true, with both stats responses empty:false. Public build 299b1db5 advertises weeks 37–44. Local r2026w45 opens November 2 and closes November 9 at 00:00 UTC; mint 685bd41d9 is a main ancestor. The whole nine-rotation skill fence matches the registry, and skill checks passed 19/19 under .nvmrc Node 26.4.0. RT-01 mint duty is discharged. Week 45 requires the next authorized deployment before opening, followed by ASSAYER SYNCED and served-registry verification. No deployment, browser gameplay or fresh replay acceptance was tested.

October 28 private-duty execution receipts and the completion row were read. A fresh strict census confirms 66/66 days August 24–October 28. Live ledger-backups eb74b13da3da715dc6553d4aea2e23fe48edcbed and fire-memory 53d87470fb2670626fb4605d4dc0eb5bffd899fb match today's receipts; archive visibility is PRIVATE. No duplicate pull or push is due. Private data remains outside this public tree; next coverage day October 29 after 02:10 UTC.

The 19-file ledger corpus was accessed through ledger-corpus.mjs. October 27 ticker and completion row were read; 49db2f8b5 is a main ancestor, without repeating the completed historical census. Latest attended handover §13z-116 and relevant Owner's Desk entries were read. F-STO-1 retains attended custody; 7b619795b is a main ancestor, storage was not remeasured. No player-visible landing or Gazette item; publication remains owner-only.`;
const method = `Lock 96d92a7a7 and inherited dashboard bookkeeping 2d262316e preserve the starting state. No product defect or new corrective was established. Reused the preceding fire's read-only probe and ledger harness with current paths and launcher attribution. No source, assertions, timeouts, goal leaf, BACKLOG row or law changed. No drain means the TypeScript/build/browser drain battery is inapplicable.

s3412's complete ledger receipt was read: exit 0, 1,263 pass, zero failures/cancellations/skips, all chained kits green, unchanged inputs and HEAD. It discharged s3411's incomplete run. This fire runs npm run test:ledger-guards under Node 26.4.0; the evidence-local adapter adds --test-concurrency=1 only to the package's first node --test entry. Maintained assertions and timeouts are unchanged. The manifest fingerprints the prepared handoff and review inputs; the closing receipt must report code 0, unchanged true and headUnchanged true before clearance.

The ledger battery precedes the clearing commit. After green, only the tested STATUS lock/stamp envelope changes. That clearing commit is the last main write, followed by origin backup. Exact predecessor and initial lock are archived; the Owner's Desk tail is verbatim. Later dashboard churn belongs to its live writer. Final commit: git log --all --grep='s3413: handoff'. Raw latest-run tail remains disk-local under the retention amendment.`;
const remaining = `1. Carry r2026w45 with the next authorized deployment before November 2 00:00 UTC; require ASSAYER SYNCED and served-registry verification.
2. Compile October 28 ticker after October 29 06:00 local (UTC+07); execute October 29 LB-01/FM-01 after 02:10 UTC.
3. Existing Owner's Desk: account-registry deploy day, B1 phone verdict rows and token-revocation support follow-up. F-STO-1/F-CUT-1 remain attended-owned; CODEX-WALL remains in force.`;
fs.writeFileSync(`${dir}/report.md`, `# s3413 fire — dry board and current standing duties\n\n${summary}\n\nREADY-FOR-GATES for bookkeeping closeout, subject to the complete [ledger receipt](ledger-result.json).\n\n## Verification\n\n${verification}\n\n## Adaptations and commits\n\n${method}\n\n## REMAINING LIST IN ORDER\n\n${remaining}\n`);
const handover = 'docs/HANDOVER-2026-09-06-attended.md'; read(handover);
fs.appendFileSync(handover, `\n\n### s3413 verification: dry board and current standing duties\n\n${stamp}. ${summary}\n\n${verification}\n\nLock 96d92a7a7; inherited dashboard bookkeeping 2d262316e. s3412 ledger receipt verified complete: 1,263 pass, zero failures, all chained kits green. Current closeout requires artifacts/s3413/ledger-result.json code 0, unchanged true and headUnchanged true. The battery precedes the clearing commit, the last main write; origin backup follows. Complete method, limits and ordered remainder: artifacts/s3413/report.md. Exact predecessor and initial lock archived; desk tail preserved.\n`);
const suffix = execFileSync('date', ['-u', '+%Y%m%dT%H%M%SZ'], { encoding: 'utf8' }).trim();
const note = `/Users/robin/Obsidian/Brain/Projects/Gold Rush/Gold Rush — s3413 verifies dry lanes and current private coverage ${suffix}.md`;
try {
  fs.writeFileSync(note, `---\nsource: codex\nproject: Gold Rush\ndate: 2026-10-28\ntype: reference\n---\n# Gold Rush — s3413 verifies dry lanes and current private coverage\n\n${summary}\n\nAll operational claims were freshly checked against the repository, runner, public GETs and private remote heads. Local week 45 requires the next authorized deployment before November 2; served build remains 299b1db5 with weeks 37–44. No product merge, dispatch or publication. Final ledger and origin receipts belong in the session digest.\n\nEvidence: /Users/robin/Claude/Projects/Gold Rush/artifacts/s3413/report.md. [[Gold Rush MOC]].\n`, { flag: 'wx' });
  fs.writeFileSync(`${dir}/vault-note-path.txt`, note + '\n');
} catch (error) { console.log('Vault unavailable:', error.message); }
console.log('Prepared under ACTIVE at', stamp);
