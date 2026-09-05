import {parseArgs} from 'node:util';
import {launch,pageFor,read,write,host} from './browser.mjs';
const {values}=parseArgs({options:{map:{type:'string'}}});
const sim=await read('sim.json'),inventory=await read('inventory.json');
const workerAsset=inventory.dist.all.find(f=>/\/BrowserAgentTapeWorker-.*\.js$/.test(f.path));
if(!workerAsset)throw new Error('Built browser replay worker not found');
const env=await launch(),rows=[];
try{
 for(const m of sim.rows.filter(m=>!values.map||m.map===values.map))for(const source of m.tapes){
  const {page,context,errors}=await pageFor(env.browser,{width:390,height:844});
  const row={key:source.key,map:m.map,tapePath:source.tapePath,before:host(),errors};
  try{
   await page.route('**/perf-survey-blank',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><title>Replay throughput instrument</title>'}));
   await page.goto(`${env.base}/perf-survey-blank`);
   row.result=await page.evaluate(({asset,tape})=>new Promise((resolve,reject)=>{
    const start=performance.now();const worker=new Worker(asset,{type:'module'});const timer=setTimeout(()=>{worker.terminate();reject(new Error('60 second browser replay bound'));},60000);
    let bootMs;
    worker.onerror=e=>{clearTimeout(timer);worker.terminate();reject(new Error(e.message));};
    worker.onmessage=({data})=>{
     if(data.error){clearTimeout(timer);worker.terminate();reject(new Error(data.error));return;}
     if(data.id===1){bootMs=performance.now()-start;worker.postMessage({id:2,type:'advance',targetTick:tape.inputLog.durationTicks+18000});return;}
     clearTimeout(timer);const totalMs=performance.now()-start,replayMs=totalMs-bootMs;worker.terminate();resolve({bootMs,replayMs,totalMs,...data,ticksPerSecond:data.snapshot.tick/(replayMs/1000),realtimeMultiple:data.snapshot.tick/30/(replayMs/1000),estimateTenMinuteSeconds:600/(data.snapshot.tick/30/(replayMs/1000)),actualVerificationSeconds:totalMs/1000,hashMatches:data.result?.eventLogHash===tape.eventLogHash});
    };worker.postMessage({id:1,type:'start',tape});
   }),{asset:`/${workerAsset.path.replace(/^dist\//,'')}`,tape:await read(source.tapePath)});
   row.status='measured';
  }catch(e){row.status='failed';row.failure=String(e);}
  row.after=host();rows.push(row);await write('worker.json',{at:new Date().toISOString(),workerAsset,rows});console.log(`${row.key}: ${row.status} x=${row.result?.realtimeMultiple?.toFixed(0)}`);await context.close();
 }
}finally{await env.close();}
