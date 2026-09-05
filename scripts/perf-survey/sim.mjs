import fs from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {parseArgs} from 'node:util';
import {read,write,root,out,host} from './browser.mjs';
const {values}=parseArgs({options:{map:{type:'string'},node:{type:'string',default:process.execPath}}});
const inventory=await read('inventory.json'),county=await read('county-tapes.json');
await fs.mkdir(path.join(out,'profiles'),{recursive:true});await fs.mkdir(path.join(out,'sim'),{recursive:true});await fs.mkdir(path.join(out,'tapes'),{recursive:true});
async function run(args,logName){
 const start=performance.now(),log=await fs.open(path.join(out,logName),'w');
 return new Promise(resolve=>{const child=spawn(values.node,args,{cwd:root,stdio:['ignore',log.fd,log.fd]});const timer=setTimeout(()=>child.kill('SIGKILL'),60000);child.on('error',async e=>{clearTimeout(timer);await log.close();resolve({error:String(e),wallMs:performance.now()-start});});child.on('exit',async(code,signal)=>{clearTimeout(timer);await log.close();resolve({code,signal,wallMs:performance.now()-start,log:logName});});});
}
const rows=[];
for(const map of inventory.maps.filter(m=>!values.map||m.id===values.map)){
 const row={map:map.id,host:host(),tapes:[]};
 const idle=`tapes/idle-${map.id}.json`;
 row.grSim=await run(['--cpu-prof',`--cpu-prof-dir=${path.join(out,'profiles')}`,`--cpu-prof-name=${map.id}-gr-sim.cpuprofile`,'scripts/gr-sim.mjs','--contract',map.id,'--seed','perf-survey-20260905','--policy=idle','--tape',path.join(out,idle)],`sim/${map.id}-gr-sim.log`);
 const played=county.rows.find(r=>r.map===map.id)?.tapePath;
 for(const [kind,tapePath] of [['idle',row.grSim.code===0?idle:null],['county',played]]){
  if(!tapePath)continue;const key=`${kind}-${map.id}`;
  const measurement=await run(['--cpu-prof',`--cpu-prof-dir=${path.join(out,'profiles')}`,`--cpu-prof-name=${key}-node.cpuprofile`,'scripts/perf-survey/sim-tape.mjs',tapePath,key],`sim/${key}-measure.log`);
  const verifier=await run(['scripts/assay-replay-agent.mjs',path.join(out,tapePath)],`sim/${key}-assay.log`);
  row.tapes.push({key,tapePath,measurement,verifier,...(measurement.code===0?{measuredPath:`sim/${key}.json`}:{})});
 }
 row.countyTape=played??null;rows.push(row);await write('sim.json',{at:new Date().toISOString(),node:values.node,rows});console.log(`${map.id}: idle rc=${row.grSim.code}, ${row.tapes.length} tapes`);
}
