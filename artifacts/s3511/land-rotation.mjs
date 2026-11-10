import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const dir='artifacts/s3511';
const read=p=>fs.readFileSync(p,'utf8');
const run=(c,a)=>execFileSync(c,a,{encoding:'utf8'}).trim();
const guards=JSON.parse(read(`${dir}/rotation-guard-result.json`));
assert.equal(guards.code,0);
assert.match(read(`${dir}/rotation-guards-canonical.txt`),/ℹ pass 36/);
const builds=read(`${dir}/build-receipts.jsonl`).trim().split('\n').map(JSON.parse);
assert.equal(builds.length,3);assert(builds.every(r=>r.exitCode===0));
const payload=JSON.parse(read(`${dir}/first-town-payload.json`));assert(payload.bytes<52000000);
const before=run('git',['rev-parse','HEAD']);
const review=`# Week 46 rotation recovered after its opening

**Verdict: READY-FOR-GATES for RT-01; deployment remains overdue.** Fire s3511, November 10. This is the prescribed standing-duty data update on main, with no lane drain.

The missed week-46 rotation now carries six seeds for November 9–16 UTC. The existing ranked-contract selector can select this open week after deployment. All nine historical rotations are unchanged, and the public skill guide includes the entire ten-rotation registry. No new interface, naming or canon is introduced.

| Check | Result |
| --- | --- |
| Salt continuity | Week 45 exactly reproduced, all six seeds and its window; salt never printed or copied |
| Append invariants | Nine historical rotations unchanged; one new rotation, six seeds, November 9–16 UTC |
| Skill, landing rotation, live seed and bench-seed guards | 36 passed; zero failures |
| TypeScript / normal build / E1 build | Exit 0 / 0 / 0 |
| E1 first-town payload | ${payload.bytes} B, below 52,000,000 B |
| Public sample at 03:08 UTC | Build 299b1db5 still serves weeks 37–44; both week-46 standings GETs return 400 bad_rotation, week-44 controls return 200 |

Evidence: artifacts/s3511/rotation-control.json, rotation-invariants.json, rotation-guards-canonical.txt, rotation-guard-result.json, build-receipts.jsonl, first-town-payload.json and live-probe.json.

Merge classification: direct standing-duty update from ${before}; registry and documentation fence only, 13 added lines each, no conflicts. No simulation or rendering rule, engine pin or era changes. Browser drain gates do not apply to this data-only standing duty; no browser acceptance is claimed. The initial command named an absent mint test and reported 19 skill tests passing; the canonical 36-test RT-01 set above is the accepted guard set. Assertions and timeouts were unchanged.

**Remaining:** the authorized attended deployment must carry the complete registry, followed by ASSAYER SYNCED and served-registry/standings verification. The FIRE publication gate and inherited attended custody leave deployment to that session. No deployment was attempted. RT-01 week 47 becomes due Wednesday November 11 at 00:00 UTC.
`;
const reviewPath='reviews/rotation-r2026w46.md';assert(!fs.existsSync(reviewPath));fs.writeFileSync(reviewPath,review);
const backlog='tasks/BACKLOG.md',old=read(backlog);
const row=`🗓️ **RT-01 WEEK 46 MINTED LATE (s3511, 2026-11-10):** r2026w46 opens November 9 00:00 UTC and closes November 16 00:00 UTC; six seeds, all nine earlier rotations preserved, whole ten-rotation registry refreshed in public/skill.md. Week-45 continuity control matches 6/6. Canonical guards 36/36; tsc and both builds exit 0; E1 payload ${payload.bytes} B below 52,000,000 B. Review: reviews/rotation-r2026w46.md; evidence artifacts/s3511/. Public build 299b1db5 still ends at week 44, with both week-46 standings reads returning 400 bad_rotation and week-44 controls 200. The authorized attended deployment is OVERDUE and must carry the entire registry, then require ASSAYER SYNCED and served-registry/standings parity. No fire deployment or new owner decision. Next mint: week 47 on Wednesday November 11 00:00 UTC.\n\n`;
fs.writeFileSync(backlog,row+old);
const paths=['assets/rotations/rotation-seeds.json','public/skill.md',reviewPath,backlog,`${dir}/rotation-control.json`,`${dir}/rotation-invariants.json`,`${dir}/rotation-guard-result.json`,`${dir}/rotation-guards-canonical.txt`,`${dir}/build-receipts.jsonl`,`${dir}/first-town-payload.json`];
run('git',['diff','--check','--',...paths]);run('git',['add','--',...paths]);
console.log(run('git',['commit','-m','s3511: prepare overdue week 46 rotation — 36 guards and both builds green']));
const hash=run('git',['rev-parse','HEAD']);fs.writeFileSync(`${dir}/rotation-commit.txt`,hash+'\n');
const gazette='marketing/outbox/gazette-queue.md';read(gazette);
fs.appendFileSync(gazette,`\n\n## ROUNDUP — Week 46 seeds are prepared for deployment\nSix claim seeds are ready for November 9–16 UTC. The complete ten-week\nregistry preserves earlier weeks and is included in the agent instructions.\nmerge \`${hash.slice(0,9)}\` · review \`reviews/rotation-r2026w46.md\`\nROUNDUP-CLASS — 2026-W46; s3511 recovers the missed RT-01 mint. Prepared on main; current public week-46 standings still return bad_rotation. Awaiting authorized attended deployment and ASSAYER SYNCED. Draft only; publication stays owner-only.\n`);
console.log(run('git',['push','origin','main']));
