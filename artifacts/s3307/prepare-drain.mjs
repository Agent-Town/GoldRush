import fs from 'node:fs';
import {execFileSync,spawnSync} from 'node:child_process';
const wt=fs.readFileSync('artifacts/s3307/worktree-path.txt','utf8').trim();
const git=(...a)=>execFileSync('git',a,{cwd:wt,encoding:'utf8'}).trim();
const base=JSON.parse(git('show',':1:package.json')),ours=JSON.parse(git('show',':2:package.json')),theirs=JSON.parse(git('show',':3:package.json'));
const guard='scripts/assayer-sync-visibility.test.mjs';
if(theirs.scripts['test:node-guards'].replace(' '+guard,'')!==base.scripts['test:node-guards'])throw Error('Unexpected lane roster delta');
if(ours.scripts['test:node-guards'].includes(guard))throw Error('Guard already in main');
ours.scripts['test:node-guards']=ours.scripts['test:node-guards'].replace('node scripts/run-node-guards.mjs','node scripts/run-node-guards.mjs '+guard);
fs.writeFileSync(wt+'/package.json',JSON.stringify(ours,null,2)+'\n');
git('add','--','package.json');
if(git('diff','--name-only','--diff-filter=U'))throw Error('Unresolved conflict');
fs.writeFileSync('artifacts/s3307/merged-diff.txt',git('diff','--cached','--','package.json','scripts/deploy.sh','scripts/health-watch.sh','scripts/assayer-sync-visibility.test.mjs')+'\n');
console.log(git('commit','-m','fix: merge assayer sync visibility — preserve current guard roster and JSON-aware health probe'));
fs.writeFileSync('artifacts/s3307/merge-hash.txt',git('rev-parse','HEAD')+'\n');
const jobs=[
 ['policy','node','scripts/drain-block-check.mjs','--strict','tasks/assayer-sync-visibility-1.md'],
 ['tsc','npx','tsc','--noEmit'],
 ['build','npm','run','build'],
 ['E1 build','env','GR_RELEASE=e1','npm','run','build'],
 ['payload','node','scripts/first-town-payload.mjs'],
 ['slice and adjacent script guards','node','--test','scripts/assayer-sync-visibility.test.mjs','scripts/gate-caller-audit.test.mjs','scripts/edge-alarm-clock-guard.test.mjs','scripts/edge-probe-json.test.mjs','scripts/edge-probe-composite-guard.test.mjs','scripts/deploy-budget.test.mjs','scripts/deploy-mirror-allowlist.test.mjs'],
 ['diff-selected guards','node','scripts/run-guards.mjs','--changed-since','231d1145d'],
 ['evidence budget','node','scripts/evidence-budget.mjs','231d1145d','HEAD']
];
fs.writeFileSync('artifacts/s3307/drain-jobs.json',JSON.stringify(jobs,null,2)+'\n');
const out=fs.openSync('artifacts/s3307/drain-driver.txt','a');
const r=spawnSync('/Users/robin/.nvm/versions/node/v26.4.0/bin/node',['scripts/gate-battery.mjs','--cwd',wt,'--label','s3307 assayer sync visibility drain','--transcript','artifacts/s3307/drain-gates.txt','--env','PATH=/Users/robin/.nvm/versions/node/v26.4.0/bin:/opt/homebrew/bin:'+process.env.PATH,'--env','DEVELOPER_DIR=/Library/Developer/CommandLineTools','--env','GR_GUARD_NO_ARTIFACT=1',JSON.stringify(jobs)],{stdio:['ignore',out,out]});
fs.closeSync(out);fs.writeFileSync('artifacts/s3307/drain-result.json',JSON.stringify({code:r.status,signal:r.signal,at:new Date().toISOString()})+'\n');console.log('Drain battery exit',r.status);process.exitCode=r.status??1;
