import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const dir='artifacts/s3540',read=p=>fs.readFileSync(p,'utf8');
const stamp=execFileSync('date',['-u','+%Y-%m-%dT%H:%MZ'],{encoding:'utf8'}).trim();
const rotation=read(`${dir}/rotation-commit.txt`).trim();
const controls=read(`${dir}/inherited-failure-controls.txt`);
assert.match(controls,/ℹ fail 0/);
const controlCount=Number(controls.match(/ℹ tests (\d+)/)[1]);
const payload=JSON.parse(read(`${dir}/first-town-payload.json`)).bytes;
const duties=JSON.parse(read(`${dir}/private-duty-results.json`));
for(const name of ['ledger-fill-gaps','ledger-push','fire-memory','mirror-exposure','mirror-freshness-corrected','private-heads'])assert.equal(duties.find(r=>r.name===name).code,0);
assert.match(read(`${dir}/dry-board.txt`),/✅ DRY/);
const tail=read(`${dir}/desk-tail.txt`).trimEnd();
const summary=`Week 48 prepared (${rotation.slice(0,9)}), 36 guards, tsc and both builds green; E1 ${payload} B. Four private backup gaps recovered and pushed, coverage 86/86 through November 17; FM-01 unchanged. November 16–17 tickers complete. DRY: 95 subjects, zero eligible/unknown, four absorbed lanes; runner 33370 alive. Inherited failure controls ${controlCount}/${controlCount} pass on AC power. Live week-47 standings still 400 bad_rotation. Evidence artifacts/s3540/report.md and ledger-result.json. Next: attended deployment through week 48 with ASSAYER SYNCED; November 18 backup after 02:10 UTC; week-49 mint November 25. Seven-item desk preserved.`;
const body=summary+' '+tail;
const line=`ACTIVE ${stamp} (s3540 fire) — ${body}`;
let status=read('STATUS.md');assert(status.split('\n')[0].includes('(s3540 fire)'));
assert(status.includes('- **s3539 handoff (line-1 archive):** '+read(`${dir}/predecessor.txt`).trimEnd()));
fs.writeFileSync('STATUS.md',line+status.slice(status.indexOf('\n')));
fs.writeFileSync(`${dir}/tested-line1.txt`,line+'\n');fs.writeFileSync(`${dir}/handoff-body.txt`,body+'\n');
let backlog=read('tasks/BACKLOG.md');
backlog=backlog.replace('🗄️ **LB-01 NOVEMBER 16 WARNING; FM-01 COMPLETE (s3539, 2026-11-16T18:00Z):**','🗄️ **LB-01 NOVEMBER 16 WARNING; FM-01 COMPLETE (s3539, 2026-11-16T18:00Z):** **SUPERSEDED by s3540: all four gaps through November 17 recovered and privately pushed; historical warning follows.**');
const row=`✅ **s3540 VERIFICATION (${stamp}):** ${summary} Final acceptance is recorded separately in artifacts/s3540/ledger-result.json; this row does not anticipate it.\n\n🗄️ **LB-01 RECOVERY THROUGH NOVEMBER 17 COMPLETE; FM-01 CURRENT (s3540, ${stamp}):** Recovered November 13, 14, 16 and 17 snapshots and strictly pushed four files to the verified PRIVATE archive. Coverage 86/86 days August 24–November 17. Strict exposure inspected 6,572 keys in 86 readable mirrors, zero unreadable, account-class or unrecognised rows. Live ledger-backups head 685bc6d37586bdfd0ed0e063a4346183efec5b90 and unchanged fire-memory head 53d87470fb2670626fb4605d4dc0eb5bffd899fb verified. Recovery ran on AC power with temporary sleep inhibition and bounded noninteractive SSH. November 18 daily pull is not yet due: after 02:10 UTC, with the source timer able to supply it later. Private bytes remain outside this public repo. Evidence artifacts/s3540/private-duty-results.json, mirror-freshness-corrected.txt and private-heads.txt.\n\n📰 **TK-01 NOVEMBER 16–17 COMPLETE (s3540, November 18 local):** Two daily drafts record no player-visible change or engine pin. UTC+07 windows contain 4 and 1 main updates respectively, matching pinned first-parent counts. September 25 busy-day control 136. Every subject and path reviewed; no non-ancestral update. Drafts only, no publication. Evidence artifacts/s3540/ticker-census.json.\n\n`;
fs.writeFileSync('tasks/BACKLOG.md',row+backlog);
const hp='docs/HANDOVER-2026-09-06-attended.md';
fs.writeFileSync(hp,read(hp)+`\n\n### s3540 verification: week 48 ready and private backup gaps recovered\n\n${stamp}. ${summary}\n\nFresh checks: artifacts/s3540/report.md. Previous s3539 ACTIVE line archived exactly; its launcher ended before this run. This run owns launcher 16042 → 16090 → 16091 and tasks/.fire.lock. Board refusals do not reproduce; unchanged inherited-failure controls pass with AC power and temporary sleep inhibition. Full closing acceptance remains ledger-result.json. Existing publication and attended custody boundaries preserved; no new owner decision.\n`);
fs.writeFileSync(`${dir}/report.md`,`# s3540 fire — week 48 prepared and private backup gaps recovered

READY-FOR-GATES: rotation gates pass. Full fire closeout is determined by ledger-result.json; this report does not anticipate that result.

${summary}

## Verification

- Lock: s3539's November 16 18:00 UTC ACTIVE line was stale. Its launcher log records FIRE END at November 18 06:53:28 local. This run owns launcher 16042 → 16090 → 16091 and the process directory created at 06:58:28 local. Archived the exact previous ACTIVE line without calling its failed gate cleared. Runner 33370 is alive, PPID 1. The main semaphore remains scripts/lane-runner-v3.sh:322: ACTIVE and not lock CLEARED.
- Board: canonical probe resolves 1,483 done-moves into 95 subjects: 82 merged, 13 closed/blocked, zero real drains, zero unknown. All four lane main..branch histories are empty; lanes are behind main and require baseline checks before any future dispatch. All six queues, running tasks and crafting pending are empty. There are 118 historical failed entries, none newer than the predecessor. No drain, refill, dispatch, retry or assayer verdict was owed. CODEX-WALL and attended custody remain. Latest runner log is October 23 assayer-sync-visibility-1; its merged goal leaf and b5d6d3c3248fdf0c4f61c853c040b651c650cf4f ancestry were reverified. No paid capacity probe was attempted.
- Inherited failures: ${controlCount}/${controlCount} tests pass in the three unchanged suites covering parity, claimed-spec alias and Gazette scan-space. The Mac now reports AC Power; a process-bound caffeinate assertion inhibits idle/system sleep during this run. The s3539 timeout timings fit its recorded sleep, but the old parity mismatch's exact cause remains unproven. No assertion or timeout changed. Full ledger will run on Node 26.4.0 with test-file concurrency 1 and no concurrent builds.
- Rotation: r2026w48 opens November 23 and closes November 30 at 00:00 UTC; six seeds; all eleven historical rotations unchanged; full twelve-rotation public fence matches. Week-47 continuity reproduced 6/6 without printing the salt. 36 guards pass; tsc and both builds exit 0; E1 payload ${payload} B. Review: reviews/rotation-r2026w48.md. Standing-duty registry update only; no browser acceptance or engine-era change claimed.
- Private duties: recovery filled November 13, 14, 16 and 17, then strict push added four files. Coverage 86/86 through November 17. Exposure: 6,572 keys, 86 readable mirrors, zero unreadable/account-class/unrecognised. PRIVATE archive and both remote heads verified. FM-01 completed unchanged. November 18 pull waits until at least 02:10 UTC; it is not claimed complete. One helper invocation used a nonexistent freshness filename; its error is retained and the canonical ledger-mirror-freshness.mjs recheck exited 0. No private database or raw secret-bearing output entered this repo.
- News: November 16 and 17 local-day windows contain 4 and 1 updates, matching first-parent counts; September 25 busy-day control 136. All subjects and paths reviewed, zero player events or engine pins. Two ticker drafts plus a Gazette item for the rotation preparation; publication remains owner-only.
- Live checks at 00:00 UTC: landing/game/stats return 200; stats are nonempty valid JSON. Build 299b1db5 serves weeks 37–44. Current week-47 standings return 400 bad_rotation on canonical and Pages hosts; week-44 controls return 200. The existing attended deployment must carry the full registry and prove ASSAYER SYNCED. No deployment or live write attempted.

## Scope and commits

Read the complete BACKLOG corpus through ledger-corpus.mjs (19 parts), current handover, wall, predecessor evidence and shared-vault note. Seven owner items and both desk acknowledgements retained verbatim. Product change is limited to the prescribed rotation registry and matching documentation fence; all other changes are duty records and evidence.

Commits: 8aa19a2c8 acquired ACTIVE; 50f24b2c4 preserved inherited generated bookkeeping; ${rotation} prepared week 48 and was verified on origin. Final clearing commit is emitted by final-gate.mjs only after full ledger acceptance. That commit is the last write to main. A red preserves ACTIVE and the exact failure evidence.

## REMAINING LIST IN ORDER

1. Complete the closing ledger battery; if red, resolve its exact failure under a changed premise before clearing.
2. Attended deployment carrying weeks 45–48, followed by ASSAYER SYNCED, whole-registry parity and week-47 standings 200 on both hosts.
3. November 18 private snapshot after 02:10 UTC; next local daily ticker November 19 after 06:00; week-49 mint November 25 00:00 UTC.
4. Seven existing owner items, unchanged. No new owner decision.
`);
console.log({stamp,rotation,controlCount,prepared:true});
