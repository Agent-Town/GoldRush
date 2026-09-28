import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import assert from 'node:assert/strict';
const root='artifacts/sol/map-art-campaign-2/run-10/code-presentation';
const id=process.argv[2], mode=process.argv[3]??'boards';
const config={
 'e2-hill-mine':{epoch:'epoch-2-steamworks',stations:[['end',-46,1],['bend',-10,27]]},
 'e2-incline':{epoch:'epoch-2-steamworks',stations:[['end',-12,-43]]},
 'e3-canyon-works':{epoch:'epoch-3-voltage',stations:[['end',-42,-27],['join',-13.5,-31],['turnaround',42,-27]]},
 'e1-twin-banks':{epoch:'epoch-1-frontier',stations:[['homestead',-13,-9],['river',0,9]]},
 'e2-trestle':{epoch:'epoch-2-steamworks',stations:[['crossing',0,7],['join',0,-19],['end',18,-23]]},
 'e7-relay-rush':{epoch:'epoch-7-signal',stations:[['r2',-25,44]]},
}[id];
assert.ok(config);const out=`${root}/${id}`;mkdirSync(out,{recursive:true});
const rows=[], browser=await chromium.launch({channel:'chromium'});
try{for(const width of [1280,390])for(let cycle=0;cycle<(mode==='performance'?4:1);cycle++)for(const arm of cycle%2?['after','before']:['before','after']){
 const page=await browser.newPage({viewport:{width,height:width===390?844:800},deviceScaleFactor:1,isMobile:width===390,hasTouch:width===390});
 page.setDefaultTimeout(90000);const errors=[];
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('pageerror',e=>errors.push(e.message));
 for(const [name,folder] of [['Scatter','world'],['RailPath','world'],['Game','game']])await page.route(`**/src/${folder}/${name}.ts*`,async route=>{
   const response=await route.fetch(),live=await response.text();let body=arm==='before'?readFileSync(`${root}/baseline-${name}.js`,'utf8'):live;
   const deps=new Map([...live.matchAll(/\/node_modules\/\.vite\/deps\/([^?"']+)\?v=[a-f0-9]+/g)].map(m=>[m[1],m[0]]));
   body=body.replace(/\/node_modules\/\.vite\/deps\/([^?"']+)\?v=[a-f0-9]+/g,(url,file)=>deps.get(file)??url);
   if(name==='Game'){const line='this.scene.add(this.detailScatter.group);';assert.equal(body.split(line).length,2);body=body.replace(line,line+' window.__CODE_GAME__ = this;');}
   await route.fulfill({response,body});
 });
 if(mode==='plain'){await page.goto('http://127.0.0.1:5312/');await page.evaluate(async id=>{(await import('/src/meta/ContractUnlock.ts')).setPreviewUnlockAll(true);(await import('/src/meta/ContractFamilies.ts')).stagePlayerContractLaunch(id)},id);}
 await page.goto(`http://127.0.0.1:5312/?${mode==='plain'?'':`debug&epoch=${config.epoch}&nowaves&nolevel&nokill&nopause&tier=full&`}contract=${id}&seed=map-art-campaign-2`);
 await page.waitForFunction(()=>window.__CODE_GAME__&&document.querySelector('#game-canvas')?.dataset.terrain3dPilotLandmarkLoadState==='mounted');
 assert.equal(await page.evaluate(()=>window.__THREE_GAME_DIAGNOSTICS__.contract.activeId),id);
 if(mode!=='plain')await page.evaluate(()=>{window.__GR_TEST__.setManualSim(true);window.__GR_GUI__?.hide()});
 const begin=page.getByTestId('contract-briefing-dismiss');if(await begin.isVisible())await begin.click();
 if(mode==='plain'){await page.waitForFunction(()=>window.__THREE_GAME_DIAGNOSTICS__.timeAlive>=10);assert.equal(await page.evaluate(()=>typeof window.__GR_TEST__),'undefined');}else await page.waitForTimeout(4500);
 const snapshot=()=>page.evaluate(async()=>{
   const g=window.__CODE_GAME__,T=await import('/src/world/Terrain.ts');
   const scatter=g.detailScatter;
   const lamps=['r1','r2','r3','r4'].map(id=>{const values=[];g.scene.getObjectByName(`rush-relay-${id}-frame`)?.traverse(o=>{for(const m of Array.isArray(o.material)?o.material:[o.material])if(m?.userData.relaySignal)values.push(m.userData.relaySignal.value)});return {id,values}});
   return {lamps,timeAlive:window.__THREE_GAME_DIAGNOSTICS__.timeAlive,scatter:scatter.diagnostics(),cards:scatter.classes.map(c=>({id:c.profile.id,kind:c.profile.material.userData.riparianCard??null,count:c.mesh.count,placed:c.instances.length,instances:c.instances.map(d=>({x:d.x,y:d.y,z:d.z,scale:d.scale,ground:T.visualY(d.x,d.z,0),hidden:d.hidden}))})),rails:g.railPath?.diagnostics(),finishing:g.railPath?.group.userData.railFinishing,relay:window.__THREE_GAME_DIAGNOSTICS__.interferenceFront,renderer:window.__THREE_GAME_DIAGNOSTICS__.renderer,performance:window.__THREE_GAME_DIAGNOSTICS__.performance,dataset:{...g.canvas?.dataset}};
 });
 const row={width,cycle,arm,errors,entry:await snapshot()};
 if(mode==='performance'){
  // Active relay work is included in the cost, using existing sim state.
  if(id==='e7-relay-rush')await page.evaluate(()=>{window.__GR_TEST__.placeFree('sentry_beacon',-25,44);window.__GR_TEST__.advanceSim(.2)});
  const stats=await page.evaluate(async()=>{const frames=[],calls=[],triangles=[];let last=performance.now();await new Promise(resolve=>{const tick=t=>{frames.push(t-last);last=t;const r=window.__THREE_GAME_DIAGNOSTICS__.renderer;calls.push(r.calls);triangles.push(r.triangles);if(frames.length<180)requestAnimationFrame(tick);else resolve()};requestAnimationFrame(tick)});return {frames,calls,triangles,p95:[...frames].sort((a,b)=>a-b)[Math.floor(frames.length*.95)]}});
  Object.assign(row,stats);console.log(width,cycle,arm,stats.p95,Math.min(...stats.calls));
 }else if(mode==='plain'){
  await page.screenshot({path:`${out}/${arm}-plain-${width}.png`});console.log(id,width,arm,row.entry.timeAlive,errors);
 }else{
  await page.screenshot({path:`${out}/${arm}-entry-${width}.png`});
  row.stations=[];
  for(const [name,x,z] of config.stations){await page.evaluate(([x,z])=>window.__GR_TEST__.teleport(x,z),[x,z]);await page.waitForTimeout(1100);await page.screenshot({path:`${out}/${arm}-${name}-${width}.png`});row.stations.push({name,x,z,...await snapshot()});}
  if(id==='e7-relay-rush'){
   for(const state of ['active','muted','restored']){
    await page.evaluate(state=>{const t=window.__GR_TEST__,f=window.__THREE_GAME_DIAGNOSTICS__.interferenceFront;if(state==='active'){t.placeFree('sentry_beacon',-25,44);t.advanceSim(.2)}else if(state==='muted')t.advanceSim(f.secondsToNextFront+5.8);else t.advanceSim(20)},state);
    await page.waitForTimeout(250);await page.screenshot({path:`${out}/${arm}-${state}-${width}.png`});row.stations.push({name:state,...await snapshot()});
   }
  }
  console.log(width,arm,row.entry.scatter.seededInstances,row.entry.renderer.calls,errors);
 }
 rows.push(row);writeFileSync(`${out}/${mode}.json`,JSON.stringify(rows,null,2)+'\n');assert.deepEqual(errors,[]);await page.close();
}}finally{await browser.close()}
