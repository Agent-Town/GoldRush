import fs from 'node:fs';
import {execFileSync, spawnSync} from 'node:child_process';
import {resolveMirrorDest} from '../../scripts/ledger-mirror-dest.mjs';
const dir = 'artifacts/s3536';
const read = p => fs.readFileSync(p, 'utf8');
const save = (name, data) => fs.writeFileSync(`${dir}/${name}.json`, JSON.stringify(data, null, 2));
const run = (cmd, args) => execFileSync(cmd, args, {encoding:'utf8', timeout:30000}).trim();
const ancestor = hash => spawnSync('git', ['merge-base', '--is-ancestor', hash, 'main']).status === 0;
const remote = run('git', ['ls-remote', 'archive', 'refs/heads/ledger-backups', 'refs/heads/fire-memory']);
fs.writeFileSync(`${dir}/private-heads.txt`, remote + '\n');
const heads = Object.fromEntries(remote.split('\n').map(l => {const [hash, ref] = l.split(/\s+/);return [ref.split('/').at(-1), hash];}));
const dest = resolveMirrorDest();
if(dest.dir.startsWith(process.cwd() + '/')) throw Error('Private mirror points inside public repo');
const dates = fs.readdirSync(dest.dir).map(f=>f.match(/^ledger-(\d{4}-\d{2}-\d{2})\.db$/)?.[1]).filter(Boolean).sort();
const expected = [];
for(let day=Date.parse('2026-08-24T00:00:00Z');day<=Date.parse('2026-11-12T00:00:00Z');day+=86400000) expected.push(new Date(day).toISOString().slice(0,10));
const pull = read('artifacts/s3533/ledger-pull.txt');
const push = read('artifacts/s3533/ledger-push.txt');
const memory = read('artifacts/s3532/fire-memory.txt');
const ledgerResult = JSON.parse(read('artifacts/s3533/private-duty-results.json'));
const memoryResults = JSON.parse(read('artifacts/s3532/private-duty-results.json'));
const ticker = read('marketing/outbox/ticker-digest-2026-11-11.md');
const duties = JSON.parse(read(`${dir}/duties.json`));
const data = {
  at:new Date().toISOString(), destination:dest,
  coverage:{first:dates[0],last:dates.at(-1),observed:dates.length,expected:expected.length,missing:expected.filter(d=>!dates.includes(d))},
  ledger:{alreadyCompletedToday:true,receipt:'artifacts/s3533/private-duty-results.json',result:ledgerResult,pullReceiptRead:pull.length>0,pushReceiptPassed:/PUSHED/.test(push),liveHeadMatches:heads['ledger-backups']==='be0647a2c8476b00f4a4c36652297c431b2fd76c'},
  fireMemory:{alreadyCompletedToday:true,receipt:'artifacts/s3532/private-duty-results.json',result:memoryResults.find(x=>x.name==='fire-memory'),unchanged:/unchanged/.test(memory),liveHeadMatches:heads['fire-memory']==='53d87470fb2670626fb4605d4dc0eb5bffd899fb'},
  ticker:{path:'marketing/outbox/ticker-digest-2026-11-11.md',commit:'28f98b092',ancestor:ancestor('28f98b092'),read:ticker.length>0,censusRerun:false},
  week47Prepared:JSON.stringify(duties.registry).includes('r2026w47'),wholeFenceMatches:duties.wholeFenceMatches
};
save('duty-verification',data);
const leaves=[];
const walk=x=>{if(!x||typeof x!=='object')return;if(x.id==='assayer-sync-visibility-1')leaves.push(x);for(const v of Object.values(x))walk(v);};
walk(JSON.parse(read('tasks/goals.json')));
save('latest-run-resolution',{leaves,verifiedAncestors:Object.fromEntries([...leaves.map(l=>l.mergeHash),'4fe2becb8','614f84ca5','28f98b092'].map(h=>[h,ancestor(h)]))});
console.log(JSON.stringify(data,null,2));
