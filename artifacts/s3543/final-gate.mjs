import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync,spawn} from 'node:child_process';
const dir='artifacts/s3543';
const git=(...a)=>execFileSync('git',a,{encoding:'utf8',maxBuffer:16e6,timeout:120000}).trim();
const stamp=()=>execFileSync('date',['-u','+%Y-%m-%dT%H:%MZ'],{encoding:'utf8'}).trim();
const runtime='/Users/robin/.nvm/versions/node/v26.4.0/bin';
if(process.version!=='v26.4.0')throw Error('Wrong Node');
fs.mkdirSync(`${dir}/test-runtime`,{recursive:true});
fs.writeFileSync(`${dir}/test-runtime/node`,`#!/bin/sh\nif [ "$1" = "--test" ] && [ "$2" = "--test-timeout=300000" ]; then\n  exec ${runtime}/node --test-concurrency=1 "$@"\nfi\nexec ${runtime}/node "$@"\n`,{mode:0o755});
const evidence=fs.readdirSync(dir).filter(p=>!p.endsWith('.diff')&&!p.endsWith('-pid.txt')&&p!=='test-runtime'&&!/^ledger-(?:manifest|result|guards)/.test(p)).map(p=>`${dir}/${p}`);
const core=['STATUS.md','tasks/BACKLOG.md','tasks/goals.json','tasks/CODEX-WALL','docs/HANDOVER-2026-09-06-attended.md','package.json','.nvmrc','assets/rotations/rotation-seeds.json','public/skill.md'];
const files=[...core,...evidence,`${dir}/test-runtime/node`];
const hashes=()=>Object.fromEntries(files.map(p=>[p,createHash('sha256').update(fs.readFileSync(p)).digest('hex')]));
const manifest={command:'npm run test:ledger-guards',head:git('rev-parse','HEAD'),started:stamp(),node:process.version,scheduling:'Test-file concurrency 1, AC power and process-bound sleep inhibition; unchanged assertions, timeouts and complete package script',hashes:hashes()};
fs.writeFileSync(`${dir}/ledger-manifest.json`,JSON.stringify(manifest,null,2));
const raw=process.env.HOME+'/.goldrush/fire-evidence/s3543/ledger-guards.txt';
const fd=fs.openSync(raw,'a',0o600);
const env={...process.env,PATH:`${process.cwd()}/${dir}/test-runtime:${runtime}:/usr/sbin:/sbin:/Library/Developer/CommandLineTools/usr/bin:${process.env.PATH}`};
const child=spawn(`${runtime}/npm`,['run','test:ledger-guards'],{env,stdio:['ignore',fd,fd]});
console.log(JSON.stringify({gatePid:child.pid,started:manifest.started}));
child.on('close',(code,signal)=>{
  fs.closeSync(fd);
  let output=fs.readFileSync(raw,'utf8');
  for(const l of fs.readFileSync('.env.local','utf8').split('\n')){
    const i=l.indexOf('=');if(i<0)continue;
    const v=l.slice(i+1).trim().replace(/^['"]|['"]$/g,'');
    if(v.length>7)output=output.split(v).join('[REDACTED]');
    if(v.includes('@'))output=output.split(v.split('@').at(-1)).join('[PRIVATE HOST]');
  }
  output=output.replace(/\b(?:sk-(?:ant|proj|live|test)?-?[A-Za-z0-9_-]{24,}|gh[pousr]_[A-Za-z0-9_]{30,}|xox[abp]-[A-Za-z0-9-]{20,})/g,'[REDACTED]');
  fs.writeFileSync(`${dir}/ledger-guards.txt`,output);
  const receipt={code,signal,finished:stamp(),unchanged:JSON.stringify(hashes())===JSON.stringify(manifest.hashes),headUnchanged:git('rev-parse','HEAD')===manifest.head,summary:output.split('\n').filter(l=>/^(ℹ (tests|pass|fail|cancelled|skipped)|RESULT:|✖)/.test(l))};
  fs.writeFileSync(`${dir}/ledger-result.json`,JSON.stringify(receipt,null,2));
  console.log(JSON.stringify(receipt));
  if(!receipt.unchanged||!receipt.headUnchanged)throw Error('Concurrent changes; refusing commit');
  const success=code===0;
  const status=fs.readFileSync('STATUS.md','utf8');
  const tested=fs.readFileSync(`${dir}/tested-line1.txt`,'utf8').trimEnd();
  const body=fs.readFileSync(`${dir}/handoff-body.txt`,'utf8').trimEnd();
  if(status.split('\n')[0]!==tested||git('branch','--show-current')!=='main'||git('diff','--cached','--name-only'))throw Error('Closeout ownership changed');
  if(success){
    fs.writeFileSync('STATUS.md',`Last updated: ${stamp()} s3543 handoff, lock CLEARED — ${body}`+status.slice(tested.length));
  }else{
    fs.appendFileSync(`${dir}/report.md`,`\n\n## BLOCKED CLOSEOUT — ${stamp()}\n\nREADY-FOR-GATES: NO. Complete ledger returned ${code}, signal ${signal}. See ledger-result.json and ledger-guards.txt. Downstream chained checks may not have run. STATUS remains ACTIVE. No identical full retry under an unchanged premise.\n`);
  }
  const added=[...evidence,`${dir}/test-runtime/node`,`${dir}/ledger-manifest.json`,`${dir}/ledger-result.json`,`${dir}/ledger-guards.txt`];
  git('diff','--check','--','STATUS.md','tasks/BACKLOG.md','docs/HANDOVER-2026-09-06-attended.md');
  git('add','--','STATUS.md','tasks/BACKLOG.md','docs/HANDOVER-2026-09-06-attended.md',...added);
  console.log(git('commit','-m',success?'s3543: handoff — dry board and current duties; ledger gates pass':'s3543: blocked handoff — preserve verification and ledger findings'));
  const head=git('rev-parse','HEAD');
  console.log(git('push','origin','main'));
  const remote=git('ls-remote','origin','refs/heads/main').split(/\s+/)[0];
  if(remote!==head)throw Error('Backup mismatch');
  console.log(JSON.stringify({head,remote,cleared:success}));
  process.exitCode=success?0:1;
});
