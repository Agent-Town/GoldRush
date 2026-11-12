import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync, spawnSync} from 'node:child_process';
import {isPlayerPath} from '../../scripts/gazette-backfill-sweep.mjs';
const dir = 'artifacts/s3532';
const git = (...args) => execFileSync('git', args, {encoding:'utf8', maxBuffer:64e6}).trim();
const root = fs.readFileSync(`${dir}/entry-head.txt`, 'utf8').trim();
const reflog = git('reflog','show','main','--date=iso-strict','--format=%H%x09%gD%x09%gs').split('\n').map(line => {
  const [hash, ref, subject] = line.split('\t'); const stamp = ref.match(/@\{(.+)\}/)[1];
  return {hash, stamp, time:Date.parse(stamp), subject};
}).reverse();
const history = git('log',root,'--first-parent','--format=%H%x09%cI%x09%s').split('\n').map(line => {
  const [hash,stamp,subject] = line.split('\t'); return {hash,stamp,subject,time:Date.parse(stamp)};
});
const control = git('log','9fee4bc02','--first-parent','--format=%H%x09%cI').split('\n').filter(line => {
  const t = Date.parse(line.split('\t')[1]);return t >= Date.parse('2026-09-25T00:00:00+07:00') && t < Date.parse('2026-09-26T00:00:00+07:00');
});
assert.equal(control.length,136);
const days=[];
for(let n=11;n<=11;n++){
  const date=`2026-11-${String(n).padStart(2,'0')}`;
  const start=Date.parse(date+'T00:00:00+07:00'),end=start+86400000;
  const updates=reflog.filter(r=>r.time>=start&&r.time<end), before=reflog.filter(r=>r.time<start).at(-1);
  assert(before,'Missing preceding reflog boundary');
  let previous=before.hash; const changes=[];
  for(const update of updates){
    assert.equal(spawnSync('git',['merge-base','--is-ancestor',previous,update.hash]).status,0,'Non-ancestral update needs individual review');
    const files=git('diff','--name-only',previous,update.hash).split('\n').filter(Boolean);
    changes.push({...update,previous,files,playerFiles:files.filter(isPlayerPath)}); previous=update.hash;
  }
  assert.equal(spawnSync('git',['merge-base','--is-ancestor',previous,root]).status,0);
  const commits=history.filter(r=>r.time>=start&&r.time<end);
  const paths=[...new Set(changes.flatMap(r=>r.files))].sort();
  const result={date,root,start:new Date(start).toISOString(),end:new Date(end).toISOString(),before:before.hash,final:previous,mainUpdates:updates.length,firstParentCommits:commits.length,controlSeptember25:control.length,commits,changes,nonEvidence:paths.filter(p=>!/^(artifacts\/|logs\/|reviews\/shots-|tasks\/runs\/)/.test(p)),playerPaths:paths.filter(isPlayerPath),enginePins:paths.filter(p=>p==='assets/engine-era.json')};
  days.push(result);
}
fs.writeFileSync(`${dir}/ticker-census.json`,JSON.stringify(days,null,2)+'\n');
console.log(JSON.stringify(days.map(({date,mainUpdates,firstParentCommits,commits,nonEvidence,playerPaths,enginePins})=>({date,mainUpdates,firstParentCommits,subjects:commits.map(c=>c.subject),nonEvidence,playerPaths,enginePins})),null,2));
