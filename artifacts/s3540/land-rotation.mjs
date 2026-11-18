import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const dir = 'artifacts/s3540';
const read = p => fs.readFileSync(p, 'utf8');
const git = (...args) => execFileSync('git', args, {encoding:'utf8', timeout:120000}).trim();
assert.equal(JSON.parse(read(`${dir}/rotation-guard-result.json`)).code, 0);
assert.match(read(`${dir}/rotation-guards.txt`), /ℹ pass 36/);
const builds = read(`${dir}/build-receipts.jsonl`).trim().split('\n').map(JSON.parse);
assert.equal(builds.length,3); assert(builds.every(r=>r.exitCode===0));
const payload = JSON.parse(read(`${dir}/first-town-payload.json`)); assert(payload.bytes<52000000);
const base = git('rev-parse','HEAD');
const reviewPath = 'reviews/rotation-r2026w48.md'; assert(!fs.existsSync(reviewPath));
fs.writeFileSync(reviewPath, `# Week 48 rotation prepared before its opening

**Verdict: READY-FOR-GATES for RT-01; deployment remains overdue.** Fire s3540, November 18. This is the prescribed standing-duty data update on main, with no lane drain.

Six seeds cover November 23–30 UTC. All eleven historical rotations remain unchanged, and the public skill guide mirrors the entire twelve-rotation registry. The existing selector will use this rotation when its week opens after deployment.

| Check | Result |
| --- | --- |
| Salt continuity | Week 47 reproduced exactly, six seeds and window; salt never printed or copied |
| Append invariants | Eleven old rotations unchanged; one new rotation with six seeds |
| Skill, landing rotation, live seed and bench-seed guards | 36 passed, zero failures |
| TypeScript / normal build / E1 build | Exit 0 / 0 / 0 |
| E1 first-town payload | ${payload.bytes} B, below 52,000,000 B |
| Live sample at 00:00 UTC | Build 299b1db5 serves weeks 37–44; week-47 standings return 400 bad_rotation on both hosts; week-44 controls return 200 |

Evidence: artifacts/s3540/rotation-control.json, rotation-invariants.json, rotation-guards.txt, rotation-guard-result.json, build-receipts.jsonl, first-town-payload.json and live-probe.json.

Merge classification: direct standing-duty update from ${base}; registry and documentation fence only, 13 added lines each, no conflicts. No simulation or rendering rule, engine pin or era changes. Browser drain gates do not apply to this data-only duty; no browser acceptance is claimed. Assertions and timeouts are unchanged.

Remaining: the attended deployment must carry the complete registry, then verify ASSAYER SYNCED and served-registry/standings parity. Deployment retains attended custody under the FIRE publication gate; none attempted here. Next RT-01 mint is week 49, due November 25 at 00:00 UTC.
`);
const backlogPath='tasks/BACKLOG.md';
const old=read(backlogPath).replace('Next mint: week 48 on Wednesday November 18 00:00 UTC.','Week-48 mint discharged by s3540 on November 18; see the current RT-01 row.');
const row=`🗓️ **RT-01 WEEK 48 MINTED (s3540, 2026-11-18):** r2026w48 opens November 23 00:00 UTC and closes November 30 00:00 UTC; six seeds, all eleven earlier rotations preserved, whole twelve-rotation registry refreshed in public/skill.md. Week-47 continuity control matches 6/6. Canonical guards 36/36; tsc and both builds exit 0; E1 payload ${payload.bytes} B below 52,000,000 B. Review: reviews/rotation-r2026w48.md; evidence artifacts/s3540/. Public build 299b1db5 still ends at week 44; week-47 standings return 400 bad_rotation on both hosts, week-44 controls 200. Existing attended deployment must carry weeks 45–48 and verify ASSAYER SYNCED and served-registry/standings parity. No fire deployment or new owner decision. Next mint: week 49 on Wednesday November 25 00:00 UTC.\n\n`;
fs.writeFileSync(backlogPath,row+old);
const paths=['assets/rotations/rotation-seeds.json','public/skill.md',reviewPath,backlogPath,...['rotation-control.json','rotation-invariants.json','rotation-guard-result.json','rotation-guards.txt','build-receipts.jsonl','first-town-payload.json'].map(p=>`${dir}/${p}`)];
git('diff','--check','--',...paths);git('add','--',...paths);
console.log(git('commit','-m','s3540: prepare week 48 rotation — 36 guards and both builds green'));
const hash=git('rev-parse','HEAD'); fs.writeFileSync(`${dir}/rotation-commit.txt`,hash+'\n');
read('marketing/outbox/gazette-queue.md');
fs.appendFileSync('marketing/outbox/gazette-queue.md',`\n\n## ROUNDUP — Week 48 seeds are prepared for deployment\nSix claim seeds are ready for November 23–30 UTC. The complete twelve-week\nregistry preserves earlier weeks and is included in the agent instructions.\nmerge \`${hash.slice(0,9)}\` · review \`reviews/rotation-r2026w48.md\`\nROUNDUP-CLASS — 2026-W47; s3540 performs the November 18 RT-01 duty. Prepared on main; current public week-47 standings still return bad_rotation. Awaiting attended deployment and ASSAYER SYNCED. Draft only; publication stays owner-only.\n`);
console.log(git('push','origin','main'));
assert.equal(git('ls-remote','origin','refs/heads/main').split(/\s+/)[0],hash);
console.log(JSON.stringify({hash,originVerified:true}));
