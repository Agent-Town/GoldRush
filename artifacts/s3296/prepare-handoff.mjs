import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const dir = 'artifacts/s3296';
const stamp = execFileSync('date', ['-u', '+%Y-%m-%dT%H:%MZ'], { encoding: 'utf8' }).trim();
const read = name => fs.readFileSync(`${dir}/${name}`, 'utf8').trimEnd();
const initial = read('lock.txt');
const previous = read('predecessor.txt');
const desk = read('desk-tail.txt');
const summary = 'WHY no product landing: board DRY, 95 subjects, zero eligible/unknown; four lane branches have zero unmerged commits. F-3293-1 reproduced: public build 299b1db5 carries weeks 37–44, but canonical week-43 standings returns 400 bad_rotation versus direct Pages 200. October 22 private coverage verified 60/60; week 44 and October 21 ticker current. Next: existing attended Node-switch word and runtime synchronization with ASSAYER SYNCED. Evidence artifacts/s3296/report.md and ledger-result.json.';
const ack = 'DESK-NOT-OWED: F-2987-1 — Option B ruled and cut over attended; no further capacity choice owed. DESK-NOT-OWED: F-2742-1 — discharged attended 2026-09-29 by 40dbcf2f8; origin backup verified.';
const active = `ACTIVE ${stamp} (s3296 fire) — ${summary} ${ack} ${desk}`;
const status = fs.readFileSync('STATUS.md', 'utf8');
if (status.split('\n')[0] !== initial || !status.includes(`- **s3295 handoff (line-1 archive):** ${previous}`)) throw Error('Status custody changed');
const verification = 'Lock c78120b17; inherited dashboard bookkeeping 9e9d8fcbb. Own launcher 85276 → 85324 → 85325 matches directory-lock mtime 13:55:25 UTC and FIRE START; actual engine Codex. Runner 31360 alive under parent 1; main semaphore scripts/lane-runner-v3.sh:322 checks ACTIVE without lock CLEARED. Six queues, running tasks and crafting pending empty; none of 118 failures newer than predecessor. Latest October 22 run read; its 357cf6e77 and attended merge 2bbc6df06, pin 5d6e46fb2, public build commit 299b1db58 and maintenance record 314d074bd are main ancestors. CODEX-WALL observed; future subscription capacity UNVERIFIED. Seven ahead scratch trees retain attended custody (unreported.txt). Whole eight-rotation fence matches; skillmd guard 19/19. Live PRIVATE archive heads match completed s3287 receipts; mirror coverage 60/60. Stats returns healthy JSON at both endpoints. Canonical week-43 400 versus direct Pages and week-42 control 200 reproduces F-3293-1. Prior droplet metadata and maintenance findings were not re-probed; no server writes. Exact predecessor and initial ACTIVE archived; three-item Owner\'s Desk and discharge acknowledgements preserved. Final unmodified ledger battery follows these documents and precedes the clearing commit, the last main write, then origin backup.';
const handover = 'docs/HANDOVER-2026-09-06-attended.md';
fs.readFileSync(handover, 'utf8');
fs.appendFileSync(handover, `\n\n### s3296 verification: dry lanes and canonical standings mismatch persists\n\n${stamp}. ${summary}\n\n${verification}\n`);
fs.writeFileSync(`${dir}/report.md`, `# s3296 — Dry lanes and canonical standings mismatch persists

READY-FOR-GATES for bookkeeping. ${summary}

## Board and custody

The dry-board probe classifies 95 subjects: 82 merged and 13 closed/blocked; zero eligible or unknown. All four lane branch logs main..branch are empty. Six queues, running tasks and crafting pending are empty; none of 118 failures is new. Latest run 20261022-151639-lane-d-assay-node-26-12-1.md.log ends successfully at 357cf6e77, already on main. This proves the implementer served that run; future subscription capacity remains unverified. CODEX-WALL permits no new fire dispatch. No product drain, requeue or deployment occurred.

The lane probe covers 4 of 68 worktrees. Seven ahead scratch trees remain attended-owned: wt-holds1-candidate (1), wt-holds2 (1), wt-tape (1), wt-audio (1), wt-holds1 (2), wt-control (43), wt-aif1 (51). Full paths and evidence are in unreported.txt. No scratch tree was touched.

## Existing finding and heartbeat duties

Fresh bounded HTTP reads at 13:57 UTC show public build 299b1db5 and weeks 37–44. Canonical week-43 transfer standings returns HTTP 400 bad_rotation; direct Pages week 43 and canonical week-42 control return HTTP 200 JSON. Both stats endpoints return HTTP 200 JSON with ok:true and a stats object. These samples reproduce the player-facing symptom of F-3293-1; they do not prove sustained service health. The prior s3294 droplet metadata and maintenance measurements were not repeated, and no current server-runtime claim is made from them. The exact failed synchronization step remains unverified. Existing F-SRV-1/attended custody remains in force.

LB-01/FM-01 are already discharged for October 22. Fresh coverage is 60/60 days from August 24. Verified PRIVATE archive heads match s3287's completed receipts: ledger-backups 591a9d8dd55d8ed318fae4b8fa6d7f03decf899a and fire-memory 53d87470fb2670626fb4605d4dc0eb5bffd899fb. No redundant pull or private corpus copy into this public repository.

RT-01 is discharged: r2026w44 opens October 26, and all eight rotations match the skill fence; 19/19 skillmd checks pass. October 21 ticker exists with its completion row. The attended Node landing and same-era pin already have the s3293 Gazette draft. No new player-visible merge occurred; no duplicate news item is needed. Assayer pending is empty.

${verification}

## Validation and remaining list in order

One preliminary freshness invocation used a nonexistent script name; the corrected scripts/ledger-mirror-freshness.mjs ran successfully and supplies the coverage evidence. No repository source changed.

The final unmodified npm run test:ledger-guards runs under .nvmrc Node 26.4.0 with process-local DEVELOPER_DIR=/Library/Developer/CommandLineTools. ledger-manifest.json pins HEAD and handoff inputs; ledger-result.json records exit/counts and unchanged-input checks. After green, only the STATUS lock/stamp envelope changes; the clearing commit is the final main write. No product tsc/build/browser pass is claimed for this bookkeeping-only fire.

1. Existing attended F-SRV-1 Node-switch word, then runtime synchronization; require ASSAYER SYNCED, matching pins/rotations, canonical week-43 200 and fresh replay acceptance evidence for F-3293-1.
2. Existing historical replay-drift and device/release follow-ups; retain the three Owner's Desk obligations unchanged.
3. October 22 ticker after October 23 06:00 local; October 23 LB-01/FM-01 after 02:10 UTC.
`, { flag: 'wx' });
fs.writeFileSync('STATUS.md', active + '\n\n' + `- **s3296 ACTIVE (line-1 archive):** ${initial}\n` + status.slice(status.indexOf('\n') + 1));
fs.writeFileSync(`${dir}/tested-line1.txt`, active + '\n', { flag: 'wx' });
console.log(JSON.stringify({ stamp, report: `${dir}/report.md` }));
