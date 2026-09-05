// The census could not produce a trustworthy frame number: the host ran between load 3 and 114.
// This instrument enforces the survey's measurement law instead of merely recording it —
//   * every sample carries os.loadavg() before AND after,
//   * a sample whose max load exceeds the ceiling is DISCARDED and retaken,
//   * the reported figure is the MEDIAN OF THREE surviving samples,
//   * a map that cannot produce three clean samples is reported as such, never estimated.
// It reports delivered frames per second and renderMs, never frameMs p50, because frameMs p50 is
// the headless rAF pace (8.3 ms) in every row and says nothing about the game.
import {parseArgs} from 'node:util';
import {launch,pageFor,boot,sample,summarize,snapshot,read,write,host,stats} from './browser.mjs';
const {values}=parseArgs({options:{maps:{type:'string'},ceiling:{type:'string',default:'12'},
  reps:{type:'string',default:'3'},tries:{type:'string',default:'6'},minutes:{type:'string',default:'40'}}});
const CEILING=Number(values.ceiling),REPS=Number(values.reps),TRIES=Number(values.tries);
const inventory=await read('inventory.json');
const ids=(values.maps??'town,the-claim,e9-seed-run,e2-hill-mine,e1-night-shift,e4-long-road').split(',');
const env=await launch();const rows=[];const deadline=Date.now()+Number(values.minutes)*60000;
const median=v=>{const s=[...v].sort((a,b)=>a-b);return s[Math.floor((s.length-1)/2)];};
try{
 outer: for(const id of ids)for(const state of id==='town'?['town']:['wave1','stress']){
  const map=id==='town'?{id:'town'}:inventory.maps.find(m=>m.id===id);
  const row={key:`${id}-full-desktop-${state}-quiet`,map:id,state,tier:'full',viewport:{width:1280,height:800},
   ceiling:CEILING,reps:REPS,samples:[],discarded:[]};
  for(let attempt=0;attempt<TRIES&&row.samples.length<REPS;attempt++){
   if(Date.now()>deadline){row.stopped='time budget';break;}
   const before=host();
   if(before.load[0]>CEILING){row.discarded.push({attempt,reason:'load before',load:before.load[0]});await new Promise(r=>setTimeout(r,20000));continue;}
   const {page,context,errors}=await pageFor(env.browser,{width:1280,height:800});
   try{
    await boot(page,env.base,map,'full',state);
    const measured=await sample(page,10000);const after=host();
    const s=summarize(measured);const scene=await snapshot(page);
    const peak=Math.max(before.load[0],after.load[0]);
    const entry={attempt,before,after,peakLoad:peak,elapsedMs:measured.elapsedMs,
     fpsDelivered:measured.rows.length/(measured.elapsedMs/1000),
     renderMsP50:s.renderMs.p50,renderMsP95:s.renderMs.p95,renderMsP99:s.renderMs.p99,
     frameMsP95:s.frameMs.p95,frameMsP99:s.frameMs.p99,callsP95:s.calls.p95,trianglesP95:s.triangles.p95,
     longFrames:measured.rows.filter(r=>r.frameMs>16.7).length,
     errors:{console:errors.console.length,page:errors.page.length,network:errors.network.length}};
    if(peak>CEILING){row.discarded.push({...entry,reason:'load during'});}
    else row.samples.push(entry);
   }catch(e){row.discarded.push({attempt,reason:String(e)});}
   await context.close();
  }
  if(row.samples.length>=REPS){
   row.status='measured';
   row.median={fpsDelivered:median(row.samples.map(s=>s.fpsDelivered)),
    renderMsP50:median(row.samples.map(s=>s.renderMsP50)),renderMsP95:median(row.samples.map(s=>s.renderMsP95)),
    frameMsP95:median(row.samples.map(s=>s.frameMsP95)),longFrames:median(row.samples.map(s=>s.longFrames)),
    callsP95:median(row.samples.map(s=>s.callsP95)),trianglesP95:median(row.samples.map(s=>s.trianglesP95)),
    peakLoad:median(row.samples.map(s=>s.peakLoad))};
   row.spread={fpsDelivered:stats(row.samples.map(s=>s.fpsDelivered)),renderMsP95:stats(row.samples.map(s=>s.renderMsP95))};
  }else row.status='insufficient-clean-samples';
  rows.push(row);await write('quiet.json',{at:new Date().toISOString(),ceiling:CEILING,reps:REPS,
   method:'Median of three 10 s samples, each discarded and retaken if the 1-minute load exceeded the ceiling before or during it. Delivered frames per second and renderMs are the reported frame signals; frameMs p50 is the headless rAF pace and is not reported as a cost.',rows});
  console.log(`${row.key}: ${row.status} fps=${row.median?.fpsDelivered?.toFixed(0)??'—'} renderMs p95=${row.median?.renderMsP95?.toFixed(2)??'—'} longFrames=${row.median?.longFrames??'—'} peakLoad=${row.median?.peakLoad?.toFixed(1)??'—'} kept=${row.samples.length} discarded=${row.discarded.length}`);
  if(Date.now()>deadline)break outer;
 }
}finally{await env.close();}
