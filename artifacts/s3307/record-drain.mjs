import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const wt=fs.readFileSync('artifacts/s3307/worktree-path.txt','utf8').trim();
const merge=fs.readFileSync('artifacts/s3307/merge-hash.txt','utf8').trim();
const tip=fs.readFileSync('artifacts/s3307/lane-tip.txt','utf8').trim();
const evidence='artifacts/assayer-sync-visibility-1/drain-s3307';
const selected=['drain-gates.txt','policy-correction.txt','shell-syntax.txt','deploy-contract-gates.txt','browser-gates.txt','browser-result.json','guard-stats.jsonl','engine-final.json','classification.md','new-content-scan.json','arena-clean.txt','npm-ci-result.json','desktop-chrome-plain.png','mobile-chrome-plain.png','desktop-chrome-plain.json','mobile-chrome-plain.json'];
if(JSON.parse(fs.readFileSync('artifacts/s3307/browser-result.json')).code!==0)throw Error('Browser gate is not green');
const functional=JSON.parse(fs.readFileSync('artifacts/s3307/drain-gates.txt','utf8').match(/^SUMMARY (.*)$/m)[1]);
if(Object.entries(functional).some(([key,value])=>key!=='policy'&&value!==0))throw Error('Functional gate failed');
if(!fs.readFileSync('artifacts/s3307/policy-correction.txt','utf8').includes('OVERALL rc=0'))throw Error('Policy correction missing');
fs.mkdirSync(path.join(wt,evidence),{recursive:true});for(const f of selected)fs.copyFileSync('artifacts/s3307/'+f,path.join(wt,evidence,f));
const goalsPath=path.join(wt,'tasks/goals.json'),goals=JSON.parse(fs.readFileSync(goalsPath,'utf8'));let found=0;
function visit(v){if(!v||typeof v!=='object')return;if(v.id==='assayer-sync-visibility-1'){if(v.status!=='queued')throw Error('Unexpected leaf state');v.status='merged';v.mergeHash=merge;found++;}for(const x of Object.values(v))visit(x);}
visit(goals);if(found!==1)throw Error('Goal match count '+found);fs.writeFileSync(goalsPath,JSON.stringify(goals,null,2)+'\n');
const backlogPath=path.join(wt,'tasks/BACKLOG.md');const rows=fs.readFileSync(backlogPath,'utf8').split('\n');
const ladder=rows.findIndex(l=>l.startsWith('🔔 **ASSAYER SYNC VISIBILITY 1 —'));
const finding=rows.findIndex(l=>l.startsWith('🔕 **F-SRV-3 ('));
if(ladder<0||finding<0)throw Error('Missing ledger rows');
rows[ladder]=`🔔 **ASSAYER SYNC VISIBILITY 1 — \`assayer-sync-visibility-1\` SHIPPED (s3307, 2026-10-23), merge \`${merge}\`; F-SRV-3.** The deploy captures and scrubs both sync halves, records drift after a mid-step failure, clears it on success, and the health watcher alerts at most hourly. Gates: tsc and both builds exit 0; E1 payload 34,355,296 B; targeted guards 126/126; diff-selected batteries 5/5 (full Node exit 0); both deploy contracts; 34/34 adjacent browser checks and 2/2 plain boots with zero console/page errors. Engine hash unchanged. Review: reviews/assayer-sync-visibility-1.md; evidence: ${evidence}/. No public deployment by this fire.`;
rows[finding]=`🔕 **F-SRV-3 CLOSED (s3307, 2026-10-23) — FAILED SYNC DIAGNOSTICS AND PERSISTENT ALERTS LANDED.** Corrective \`assayer-sync-visibility-1\` landed in \`${merge}\`; review reviews/assayer-sync-visibility-1.md. Both rsync and remote sed/restart failures preserve scrubbed diagnostic tails and a build/time drift marker; the existing health alert repeats at most hourly until recovery. Original October 22 failure: build 299b1db5's deploy printed ASSAYER SYNC FAILED while discarding stderr; the worker kept its previous engine copy for about sixteen hours until the attended Node switch. The exact historical failure remains unknowable. Existing missing-host/unreachable prechecks retain their prior behavior; this slice covers the task's two mid-step failure halves.`;
fs.writeFileSync(backlogPath,rows.join('\n'));
const review=`# Assayer sync visibility — accepted drain

Slice: assayer-sync-visibility-1. Branch: sol/open-findings-astra. Lane tip: ${tip}. Code merge: ${merge}. Fire: s3307, 2026-10-23.

## Verdict

ACCEPTED for integration. All functional gates passed, and the policy check on the live main board returned CLEAR. The original composite driver returned 1 because its policy job refused a linked worktree (rc 2); the documented live-root rerun returned 0. This is an instrument-location correction, not a policy waiver. No assertion was weakened and no control attribution was needed.

## Behavior

A failed rsync or remote sed/restart during assayer synchronization now prints its failing half, exit codes, and last ten scrubbed diagnostics. It records the build and UTC time in the local drift marker. Success clears the marker. The health watcher uses its existing alert mechanism immediately and at most once per hour while drift remains. Its status format and the current JSON-aware API health probe are retained.

This is an operations change: the player sees the existing game in a plain boot. It makes an out-of-date replay copy visible to operators; it does not change gameplay, the mirror allowlist, Pages publishing, or the existing missing-host/unreachable prechecks. No production deployment or remote write was performed for this drain.

## Evidence

All paths below are under \`${evidence}/\`.

| Check | Measured result | Evidence |
|---|---|---|
| TypeScript | exit 0, 6.1 s | drain-gates.txt |
| Normal / E1 builds | exits 0 / 0, 26.4 / 9.9 s | drain-gates.txt |
| E1 first-town payload | 34,355,296 B < 52,000,000 B | drain-gates.txt |
| Slice and adjacent script guards | 126/126 passed; includes four new fixture tests | drain-gates.txt |
| Diff-selected batteries | 5/5 passed; full Node exit 0 in 2,453 s; power p95 0.326 ms | guard-stats.jsonl, drain-gates.txt |
| Shell syntax | both scripts exit 0 | shell-syntax.txt |
| Deploy contracts | 15 PASS checks including schedule; site contract seven scenarios | deploy-contract-gates.txt |
| Browser warm-up | 1/1 passed | browser-gates.txt |
| task-025, m1-01, m2-01 | 34/34 passed on desktop and mobile, 2.8 min | browser-gates.txt |
| Plain boots | 2/2 passed; 1280x800 and 390x844; zero console/page errors; no debug flag | browser-gates.txt, *-plain.json, *-plain.png |
| Engine identity | unchanged aa1435e29f312553b1fa9329ca6872bb1601a5b82b50741c400b95de8be895a3; already registered | engine-final.json |
| Sensitive output scan | 11 new/changed lane files; zero secret-pattern or configured-host hits | new-content-scan.json |

The permanent diff-selected runner retains each suite's actual exit and duration, not the full Node suite's test count; no unrecorded count is claimed. Tests use .nvmrc Node 26.4.0. The canonical production assay runtime is separately pinned to 26.12.1. Every Playwright command used --workers=1. The occupied 5297 port was left alone; this fire started and stopped only its own Vite on 5317.

## Merge classification and adaptations

Base 4cd9cfc6124c059dcee55f1e0d8860dcc45d7af0; initial main 231d1145d. package.json and health-watch.sh had also moved on main. The single package conflict was resolved by retaining main's entire roster and adding the new guard exactly once. Health merged additively, retaining main's JSON-aware probe. deploy.sh was lane-only; the guard and seven implementer evidence files were new. Full classification: classification.md. The later main merge brought only lock/dashboard bookkeeping; application and test sources stayed identical to the gated code merge.

The implementer and runner could not commit because an empty October 20 lane index lock remained. With no open handle and no live owner, the fire moved it aside into artifacts/s3307/lane-a-index-lock-20261020-preserved and committed only the task's paths as ${tip}. No reset, deletion, retry, or dispatch occurred. Detached arena npm ci exited 0 and git status was clean before the merge. The scratch art store is at main 5793a967da46e8f00c0ba16f92f17dc10d36558d; no art changed.

The full diff-selected guard stage took 2,456.9 seconds and exceeded the fire's approximate 35-minute drain budget during its first drain. No additional drain was started. Since this diff changes no ENGINE_SOURCE_INPUTS, sim, system, or entity source, the fire protocol's conditional post-fast-forward Node rerun does not apply. The required full suite already passed on the merged code; the final ledger battery follows the actual ledger edits.

## Findings and remaining work

F-SRV-3 is resolved for the specified mid-step visibility defect. No new product finding or implementation remainder. The historical remote sync failure's exact cause is unavailable because the old script discarded it. Future authorized deployments use these diagnostics; this fire did not publish a build. The local done-move is terminal-renamed after the fast-forward, respecting .gitignore's runner-state policy.
`;
const reviewPath=path.join(wt,'reviews/assayer-sync-visibility-1.md');if(fs.existsSync(reviewPath))throw Error('Review already exists');fs.writeFileSync(reviewPath,review);
const report=path.join(wt,'artifacts/assayer-sync-visibility-1/report.md');const old=fs.readFileSync(report,'utf8');fs.writeFileSync(report,old+`\n## s3307 integration update — 2026-10-23\n\nThe earlier commit-blocked remainder is superseded: the verified stale index lock was preserved, delivery committed as ${tip}, and the drain accepted in reviews/assayer-sync-visibility-1.md. Current-main edge-probe-json checks passed within the 126-test targeted battery. The original report above remains the implementer's completion record.\n`);
console.log(execFileSync('git',['add','--','tasks/goals.json','tasks/BACKLOG.md','reviews/assayer-sync-visibility-1.md','artifacts/assayer-sync-visibility-1'],{cwd:wt,encoding:'utf8'}));
console.log(execFileSync('git',['commit','-m','fix: assayer sync visibility — gated drain record and ledger\n\n126 targeted checks; 5/5 diff batteries; 34 adjacent browser checks and two clean plain boots; engine hash unchanged.'],{cwd:wt,encoding:'utf8'}));
fs.writeFileSync('artifacts/s3307/drain-tip.txt',execFileSync('git',['rev-parse','HEAD'],{cwd:wt,encoding:'utf8'}));
