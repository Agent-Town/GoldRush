import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const dir='artifacts/s3307';
const stamp=execFileSync('date',['-u','+%Y-%m-%dT%H:%MZ'],{encoding:'utf8'}).trim();
const previous=fs.readFileSync(dir+'/predecessor.txt','utf8').trimEnd();
const tail=previous.slice(previous.indexOf('DESK-NOT-OWED:'));
if(!tail.includes("OWNER'S DESK — 3 awaiting a word."))throw Error('Desk tail not identified');
fs.writeFileSync(dir+'/desk-tail.txt',tail+'\n');
const summary='Assayer sync visibility landed (b5d6d3c32, record 614f84ca5): 126 guards, five diff batteries, 34 adjacent checks and two clean plain boots; engine unchanged. F-3293-1 closed by verified attended runtime recovery, canonical week-43 200. October 23 private coverage 61/61; ticker and week 44 current. Board DRY, lanes absorbed. Next: existing Owner’s Desk and October 24 duties. Evidence artifacts/s3307/report.md, ledger-result.json; review reviews/assayer-sync-visibility-1.md.';
fs.writeFileSync(dir+'/handoff-summary.txt',summary+'\n');
const status=fs.readFileSync('STATUS.md','utf8');
if(!status.split('\n')[0].includes('(s3307 fire)'))throw Error('Lost lock');
const archives=[`- **s3306 handoff (line-1 archive):** ${previous}`];
for(const file of ['lock.txt','lock-refresh.txt','lock-after-drain.txt']){
 const line=fs.readFileSync(dir+'/'+file,'utf8').split('\n')[0];
 if(!status.includes(line+'\n'))archives.push(`- **s3307 ACTIVE (line-1 archive):** ${line}`);
 else if(line===status.split('\n')[0])archives.push(`- **s3307 ACTIVE (line-1 archive):** ${line}`);
}
const candidate=`ACTIVE ${stamp} (s3307 fire) — ${summary} ${tail}`;
fs.writeFileSync('STATUS.md',candidate+'\n\n'+archives.join('\n')+'\n'+status.slice(status.indexOf('\n')+1));
fs.writeFileSync(dir+'/tested-line1.txt',candidate+'\n');
const backlog=fs.readFileSync('tasks/BACKLOG.md','utf8').split('\n');
const i=backlog.findIndex(l=>l.startsWith('🟡 **F-3293-1 OPEN'));
if(i<0)throw Error('Runtime finding row missing');
fs.writeFileSync(dir+'/f3293-previous-row.txt',backlog[i]+'\n');
backlog[i]=`🟢 **F-3293-1 CLOSED (s3307, ${stamp}) — COUNTY RUNTIME AND WEEK-43 STANDINGS RECOVERED.** The attended Node switch is main commit 359052989 (handover 13z-115). Independent read-only checks: ledger and assay active on Node 26.12.1 with zero restarts, build 299b1db5, engine hash aa1435e29f312553b1fa9329ca6872bb1601a5b82b50741c400b95de8be895a3 identical to main and registered, whole weeks 37–44 rotation registry equal to main. Canonical week-43 transfer standings now returns 200 JSON with ok:true, matching direct Pages; week-42 control and both stats endpoints also return healthy JSON. The backup unit's first run on the new runtime ended at 02:02:32 UTC with status 0. This supersedes the October 22 stale-copy and bad_rotation observations; the existing Node-switch word has been executed and is no longer owed. No new player tape or production deployment by this fire. The historical mid-step failure's exact cause is unknown; its diagnostics corrective is separately landed as assayer-sync-visibility-1. Evidence: artifacts/s3307/droplet-runtime.json, live-probe.json, final-probe/live-probe.json, engine-main.json, report.md.`;
const duty=`🗄️ **LB-01 + FM-01 OCTOBER 23 COMPLETE (s3307, ${stamp}):** Today’s snapshot was pulled and pushed after 02:10 UTC to the verified PRIVATE archive; coverage is 61/61 days August 24–October 23. Strict exposure gate inspected 4,212 keys in 61 readable mirrors, zero account-class or unrecognised rows. Live ledger-backups head 659263e0616df47b2dc786084fb4e8aa3f6c79b9; FM-01 unchanged at 53d87470fb2670626fb4605d4dc0eb5bffd899fb, both remote heads verified. The server backup's first Node 26.12.1 run succeeded. No private corpus enters the public tree. Next coverage day October 24 after 02:10 UTC. Evidence: artifacts/s3307/ledger-pull.txt, ledger-push.txt, mirror-freshness-after.txt, fire-memory.txt, private-heads-after.txt, private-visibility.json, droplet-runtime.json, report.md.`;
const news='📰 **GZ-01 COUNTY RUNTIME RECOVERY REPORTED (s3307, 2026-10-23):** One draft records attended server update 359052989 and the freshly verified recovery of canonical week-43 standings. Publication remains owner-only. October 22 TK-01 digest remains complete; no duplicate digest. Evidence: marketing/outbox/gazette-queue.md and artifacts/s3307/final-probe/live-probe.json.';
fs.writeFileSync('tasks/BACKLOG.md',duty+'\n\n'+news+'\n\n'+backlog.join('\n'));
const gazette='marketing/outbox/gazette-queue.md';fs.readFileSync(gazette,'utf8');
fs.appendFileSync(gazette,'\n\n## ROUNDUP — Week 43 standings return after the server catches up\nWeek 43 standings are available again. The server runtime and replay copy now\nmatch build 299b1db5, with weeks 37–44 present.\nmerge `359052989` · handover `docs/HANDOVER-2026-09-06-attended.md` §13z-115 · evidence `artifacts/s3307/report.md`\nROUNDUP-CLASS — 2026-W43; s3307 verifies the attended October 23 runtime update and canonical week-43 recovery. Both services run Node 26.12.1 with matching engine identity; no new player tape was submitted by this verification. Draft only; publication stays owner-only.\n');
const verification='Fresh verification: actual launcher 16677 → 16721 → 16722 matches the 02:00:24 UTC FIRE START; this invocation uses Codex despite the supplied Claude-edition heading. Runner 31360 remains alive under parent 1; main semaphore scripts/lane-runner-v3.sh:322. The newly completed assayer task was policy-CLEAR and had real scoped edits; its stale October 20 index lock was preserved after liveness checks, delivery committed as 4fe2becb8, then gated in a clean npm-ci detached arena. One package roster conflict retained all current main entries and added the new guard. The merged current-main JSON-aware probe passed. Full diff batteries 5/5, including Node exit 0 in 2,453 seconds; 126 targeted checks, 34 desktop/mobile adjacencies, two zero-error plain boots, both builds and both deploy contracts passed. E1 payload 34,355,296 B; engine hash unchanged and registered. Final done board: 95 subjects, 82 merged and 13 closed/blocked, zero eligible/unknown; all four lane branches absorbed. Fleet 4/69 includes our retained arena; seven pre-existing ahead scratch trees remain attended-owned. Six queues, running tasks and crafting pending empty; no newer failure among 118 entries. Latest implementer service is proven by the actual completed run; future subscription capacity is unverified. CODEX-WALL observed, no refill or dispatch. Private coverage 61/61 and heads freshly checked; week 44 whole registry/fence equality and 19/19 skill checks; October 22 digest and ledger row verified without re-running its historical census. Server metadata and final public probes supersede the prior node-go and bad_rotation claims. Exact prior handoff and all committed ACTIVE lines archived; Owner’s Desk tail kept verbatim. Final ledger battery follows these documents and precedes the clearing commit, the last main write, then origin backup.';
fs.appendFileSync('docs/HANDOVER-2026-09-06-attended.md',`\n\n### s3307 verification: assayer visibility landed; runtime recovery and daily backups verified\n\n${stamp}. ${summary}\n\n${verification}\n\nThe first drain exceeded the approximate 35-minute budget because the mandatory diff-selected battery alone took 2,456.9 seconds; no second drain was initiated. The initial detached policy probe refused its frozen board and was corrected by the live-root check, with both receipts retained. Port 5297 was occupied; the fire used 5317 and stopped only its own Vite. The done-move is local runner state by .gitignore: its attempted add was refused, not forced; it was terminal-renamed on disk after landing. Commit 5198186d2 contains dashboard/run statistics despite its broader message. No deployment, remote write beyond the authorized private backups, or new replay submission occurred.\n`);
const report=`# s3307 — Assayer visibility landed and county runtime recovery verified

READY-FOR-GATES. One completed drain is on main: code merge b5d6d3c3248fdf0c4f61c853c040b651c650cf4f; review and goal/BACKLOG record 614f84ca5. Final bookkeeping acceptance is recorded in ledger-result.json. No second drain was initiated.

## Outcome and evidence

The assayer synchronization step now preserves scrubbed diagnostic tails for both failure halves, writes a build/time drift marker, clears it on success, and raises the existing health alert at most hourly while behind. Review: [assayer-sync-visibility-1](../../reviews/assayer-sync-visibility-1.md). The precise historical sync failure remains unknown because the old script discarded stderr; the fixed defect is visibility, not a reconstructed remote cause.

| Check | Result | Evidence |
|---|---|---|
| TypeScript, normal build, E1 build | all exit 0 | drain-gates.txt |
| E1 payload | 34,355,296 B, below 52,000,000 B | drain-gates.txt |
| Targeted script guards | 126/126 | drain-gates.txt |
| Diff-selected batteries | 5/5; full Node exit 0 in 2,453 s; power p95 0.326 ms | guard-stats.jsonl |
| Shell and deploy contracts | both syntax checks; 15 deploy PASS checks including schedule; seven site scenarios | shell-syntax.txt, deploy-contract-gates.txt |
| Adjacent browser suites | 34/34 desktop and mobile | browser-gates.txt |
| Plain boots | 2/2; 1280x800 and 390x844; console/page errors 0/0 each | desktop-chrome-plain.json, mobile-chrome-plain.json and PNGs |
| Engine hash | unchanged on detached tree and main; already registered | engine-final.json, engine-main.json |
| Done board and lanes | DRY: 95 subjects, 82 merged, 13 closed/blocked; zero eligible/unknown; four branches absorbed | dry-board-final.txt, lanes-final.txt |
| Runtime recovery | both services active on 26.12.1, zero restarts; build 299b1db5; hash and whole weeks 37–44 registry match main | droplet-runtime.json |
| Public endpoints | final canonical/direct week-43 and week-42 control 200 JSON; both stats healthy; game 200 | final-probe/live-probe.json |
| Daily private duties | 61/61 days; 4,212 keys inspected; zero account-class/unrecognised rows; private push complete, memory unchanged | ledger-push.txt, mirror-freshness-after.txt, fire-memory.txt, private-heads-after.txt |
| Rotation and ticker | week 44 opens October 26; whole eight-rotation fence equals registry; 19/19 checks; October 22 digest already complete | duties.json, skillmd-guard-pinned.txt, ledger-selection.json |

Full suite counts are not retained by the permanent diff-selected runner; its real exit and duration are retained, and no unrecorded count is claimed. Browser and shell deployment fixtures were unmodified. No red attribution control was needed. Every Playwright invocation used --workers=1. No engine input changed, so the fire protocol's conditional post-fast-forward full Node rerun does not apply. No new engine-era pin was minted.

## Custody, adaptations and commits

Initial lock 6e354aea9; dashboard bookkeeping 231d1145d; live lock refresh 189eda0ae; recovered lane delivery 4fe2becb8; code merge b5d6d3c32; dashboard/run statistics 5198186d2; bookkeeping join 32bf478ca; drain record 614f84ca5; post-drain lock refresh 3d01daa7c. The first origin push through 3d01daa7c succeeded. Full commit list: commits.txt. The clearing commit is the final main write and is backed up after the final ledger gate.

The empty lane index lock dated October 20 had no open owner. It was renamed to lane-a-index-lock-20261020-preserved, never deleted, then only task paths were committed. The lane had no ahead commit before recovery. A fresh detached worktree was prepared with npm ci and verified clean; scratch store main 5793a967da46e8f00c0ba16f92f17dc10d36558d was unchanged. The only conflict was the package roster; main's complete roster was retained and the new guard added once. Classification: classification.md. Initial and final root checks returned policy CLEAR. The composite driver retains OVERALL rc=1 from its detached-board policy refusal; policy-correction.txt records the documented live-root rerun with rc=0, while every functional arm passed. This is not a waived block.

The first drain's mandatory diff-selected stage took 2,456.9 seconds and exceeded the approximate 35-minute fire budget. No additional drain was started. The occupied 5297 port was left alone; only the fire's own Vite on 5317 was started/stopped. The actual launcher is Codex, matching the current runner, not the supplied protocol heading's Claude identity. Main lock liveness was refreshed while that healthy battery ran.

Runner-state paths are ignored intentionally. The attempted done-move add was refused; 5198186d2 contains only dashboard/run statistics despite its broader commit message. Nothing was force-added. The done-move was terminal-renamed locally after landing; done-move.txt records its path. Seven pre-existing ahead scratch worktrees retain attended custody. No refills, retries, authoring, subagents, art processing or deployment occurred.

## Runtime finding and standing duties

F-3293-1 is closed by independent verification of attended update 359052989. Earlier claims that node go was owed or canonical week 43 returned bad_rotation are superseded. The backup unit's first Node 26.12.1 run succeeded at 02:02:32 UTC. No new player tape was submitted, so newly submitted replay acceptance is not claimed. F-SRV-3's separate visibility slice is now landed.

LB-01/FM-01 ran after 02:10 UTC: private ledger-backups head 659263e0616df47b2dc786084fb4e8aa3f6c79b9, fire-memory 53d87470fb2670626fb4605d4dc0eb5bffd899fb. The archive was verified PRIVATE and mirrors stayed outside the public repository. RT-01 and yesterday's TK-01 are discharged. One Gazette draft records the attended player-visible recovery; publication remains owner-only. Crafting pending is empty and no art-store slice landed.

## Verification and closing boundary

${verification}

The unmodified npm run test:ledger-guards is run after the actual ledger rows, handoff and report exist, under .nvmrc Node 26.4.0 and process-local DEVELOPER_DIR=/Library/Developer/CommandLineTools. ledger-manifest.json pins HEAD and input hashes; ledger-result.json must show code 0, unchanged true and headUnchanged true before the final clearing commit. Only STATUS's lock/stamp envelope changes after green. The bounded status archive audit uses --limit 40 --quiet. No blanket green or published build is inferred from documentation commits.

## Remaining list in order

1. No implementation remainder for assayer-sync-visibility-1; preserve the new diagnostics for the next authorized attended deployment. The fire did not deploy.
2. The three existing Owner's Desk obligations remain verbatim: account-registry deploy day, B1 phone verdict rows, and the token revocation support follow-up. No additional Node-switch word is owed.
3. October 24 LB-01/FM-01 after 02:10 UTC, and the next TK-01 daily compilation after its local morning threshold. Gazette/ticker publication remains owner-only.
`;
fs.writeFileSync(dir+'/report.md',report);
let ledger=fs.readFileSync('artifacts/s3306/run-ledger.mjs','utf8').replaceAll('artifacts/s3306','artifacts/s3307');
ledger=ledger.replace("'tasks/assay-node-26-12-1.md'","'tasks/assayer-sync-visibility-1.md'").replace("'reviews/assay-node-26-12-1.md'","'reviews/assayer-sync-visibility-1.md'");
fs.writeFileSync(dir+'/run-ledger.mjs',ledger);
console.log('Prepared handoff at',stamp,'with exact Owner’s Desk tail.');
