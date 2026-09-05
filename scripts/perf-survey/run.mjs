import {parseArgs} from 'node:util';
import {launch,pageFor,boot,sample,snapshot,summarize,read,write,host} from './browser.mjs';
const {values}=parseArgs({options:{map:{type:'string'},all:{type:'boolean'},tier:{type:'string'},viewport:{type:'string'},state:{type:'string'},resume:{type:'boolean'},minutes:{type:'string'}}});
const inventory=await read('inventory.json');
const allMaps=[...inventory.maps,{id:'town'}];
const ordered=[...inventory.priority,...allMaps.map(m=>m.id).filter(id=>!inventory.priority.includes(id))];
const ids=values.all?ordered:[values.map??'the-claim'];
const rows=values.resume?(await read('census.json')).rows:[];
const env=await launch();
const deadline=Date.now()+Number(values.minutes??120)*60000;
try{
 outer: for(const id of ids)for(const tier of values.tier?[values.tier]:['full','lite'])for(const viewportName of values.viewport?[values.viewport]:['desktop','mobile'])for(const state of id==='town'?['town']:values.state?[values.state]:['wave1','stress']){
  if(Date.now()>deadline){console.log('Measurement deadline reached; remaining combinations are unmeasured.');break outer;}
  const key=`${id}-${tier}-${viewportName}-${state}`;if(rows.some(r=>r.key===key))continue;
  const map=allMaps.find(m=>m.id===id);if(!map)throw new Error(`Unknown map ${id}`);
  const viewport=viewportName==='mobile'?{width:390,height:844}:{width:1280,height:800};
  const {context,page,errors}=await pageFor(env.browser,viewport);const row={key,map:id,tier,viewport,state,browser:env.browser.version(),buildMode:'vite production build, all epochs, debug enabled',before:host(),errors};
  try{
   await boot(page,env.base,map,tier,state);
   const start=await snapshot(page);row.start={renderer:start.renderer,heap:start.heap,performance:start.diagnostics.performance};
   const measured=await sample(page,10000);row.elapsedMs=measured.elapsedMs;row.metrics=summarize(measured);
   const end=await snapshot(page);row.end={renderer:end.renderer,heap:end.heap,gpuEstimate:end.gpuEstimate,performance:end.diagnostics.performance,canvas:end.canvas};row.scenePath=`scenes/${key}.json`;await write(row.scenePath,end);
   row.drawAttribution=await page.evaluate(()=>window.__GR_TEST__?.drawCallCensus()??null);
   row.rawSamples=`samples/${key}.json`;await write(row.rawSamples,measured);
   row.status='measured';
  }catch(e){row.status='failed';row.failure=String(e);row.pageState=await page.evaluate(()=>({url:location.href,text:document.body.innerText.slice(0,1200),dataset:{...document.querySelector('canvas')?.dataset}})).catch(()=>null);}
  row.after=host();rows.push(row);await write('census.json',{schemaVersion:1,instrument:'scripts/perf-survey/run.mjs',windowMs:10000,expectedMaps:allMaps.map(m=>m.id),rows});
  console.log(`${key}: ${row.status} calls=${row.metrics?.calls?.p95} p95=${row.metrics?.frameMs?.p95?.toFixed(2)} load=${row.after.load[0].toFixed(1)} ${row.failure??''}`);
  await context.close();
 }
}finally{await env.close();}
