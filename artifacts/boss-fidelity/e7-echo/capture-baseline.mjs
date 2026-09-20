import assert from 'node:assert/strict';
import { chromium, devices } from 'playwright';
import { mkdir,writeFile } from 'node:fs/promises';
const out=process.env.ECHO_CAPTURE_OUT??'artifacts/boss-fidelity/e7-echo/baseline-varied';await mkdir(out,{recursive:true});
const report={scope:'Current development runtime, manual simulation and varied base preplaced via existing BuildSystem placement validation; catalog unlocking bypassed for visual fixture. No source or asset routing. Screenshots retain game UI.',cases:[],errors:[]};
const browser=await chromium.launch({headless:true});
try {for(const tier of ['full','lite']) {
 let releaseModels;const heldModels=new Promise(resolve=>releaseModels=resolve);
 const page=await browser.newPage({...devices[process.env.ECHO_MOBILE?'Pixel 5':'Desktop Chrome'],viewport:process.env.ECHO_MOBILE?{width:390,height:844}:{width:1280,height:800}});
 if(process.env.ECHO_DELAYED&&tier==='full')await page.route('**/assets/pilots/run3d/*.glb*',async route=>{await heldModels;await route.continue();});
 if(process.env.ECHO_STALE_CONTROL)await page.route('**/src/game/Run3dPilot.ts*',async route=>{const response=await route.fetch();let body=await response.text();const pattern=/(snapshot: \(id, index, origin, material\) => \{\s*)update\(\);/;assert(pattern.test(body));body=body.replace(pattern,'$1');await route.fulfill({response,body});});
 page.on('pageerror',e=>report.errors.push({tier,error:e.message}));page.on('console',m=>{if(m.type()==='error')report.errors.push({tier,error:m.text()});});
 await page.addInitScript(()=>{performance.setResourceTimingBufferSize(10000);localStorage.clear();});
 await page.goto(`http://127.0.0.1:5246/?debug&contract=${(process.env.ECHO_WATER||process.env.ECHO_ENCLOSED)?'the-claim&e7boss&epoch=epoch-7-signal':'e7-relay-valley'}&nowaves&nolevel&nopause&tier=${tier}&seed=echo-fidelity`);
 await page.waitForFunction(contract=>window.__GR_TEST__&&window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId===contract,(process.env.ECHO_WATER||process.env.ECHO_ENCLOSED)?'the-claim':'e7-relay-valley');
 const briefing=page.getByTestId('contract-briefing-dismiss');await briefing.evaluate(el=>{if(el.getClientRects().length)el.click();});
 await page.evaluate(async ({water,enclosed})=>{
  const url=performance.getEntriesByType('resource').map(e=>e.name).find(u=>new URL(u).pathname==='/src/game/Game.ts');
  const {Game}=await import(url),original=Game.prototype.warmCombatPools;
  Game.prototype.warmCombatPools=function(...args){window.__echoGame=this;Game.prototype.warmCombatPools=original;return original.apply(this,args);};
  const h=window.__GR_TEST__;h.setManualSim(true);await h.warmVfx();h.grantGold(10000);
  window.__placed=[];
  const offsets=[];for(let dz=-60;dz<=60;dz+=2)for(let dx=-60;dx<=60;dx+=2)offsets.push({dx,dz});if(enclosed)offsets.sort((a,b)=>a.dx*a.dx+a.dz*a.dz-b.dx*b.dx-b.dz*b.dz);
  for(const [id,x,baseZ,rotation] of [['turret',-3,8,0],['palisade',3,8,1],['sentry_beacon',-6,5,0],[water?'sluice':'boiler_house',6,5,0],[water?'assay_office':'stockpile',0,5,0],['lantern_post',0,9,0]]) {const z=baseZ+(enclosed?-28:0);let placed=false;for(const {dx,dz} of offsets){if(placed)break;if(window.__echoGame.buildSystem.placeFree(id,{x:x+dx,z:z+dz},rotation,{preplaced:true})){window.__placed.push({id,x:x+dx,z:z+dz,rotation,placed:true});placed=true;}}if(!placed){const {getBuildableDef}=await import('/src/game/buildables.ts');const t=await import('/src/world/Terrain.ts');throw Error(JSON.stringify({id,def:getBuildableDef(id),sample:t.sample(0,0),buildable:t.isBuildable(0,0),ground:window.__echoGame.buildSystem.isGroundOpen(0,0)}));}} 
  if(enclosed){const additions=[];for(const x of [-9,-6,-3,0,3,6,9])for(const z of [8,22])additions.push(['palisade',x,z,1]);for(const x of [-11,11])for(const z of [10,13,16,19])additions.push(['palisade',x,z,0]);for(const x of [-8,8])for(const z of [11,19])additions.push(['sentry_beacon',x,z,0]);for(const [id,x,baseZ,rotation]of additions){const z=baseZ-34;if(window.__echoGame.buildSystem.placeFree(id,{x,z},rotation,{preplaced:true}))window.__placed.push({id,x,z,rotation,placed:true});}if(window.__placed.length<24)throw Error('Enclosed fixture incomplete');}
  if(water){const turret=window.__placed.find(p=>p.id==='turret');h.teleport(turret.x,turret.z);if(!h.upgradeBuilding('turret',0))throw Error('Turret upgrade failed');}
 },{water:Boolean(process.env.ECHO_WATER),enclosed:Boolean(process.env.ECHO_ENCLOSED)});
 await page.waitForTimeout(2000);
 const capture=async label=>{await page.evaluate(label=>{const g=window.__echoGame;const pts=label==='base'?window.__placed.map(p=>({x:p.x,z:p.z})):label==='jar'?[g.echoBoss.jar.position]:g.echoBoss.copies.map(c=>c.mesh.position);if(pts.length)window.__GR_TEST__.teleport(pts.reduce((s,p)=>s+p.x,0)/pts.length,pts.reduce((s,p)=>s+p.z,0)/pts.length+5);},label);await page.waitForTimeout(500);await page.screenshot({path:`${out}/${tier}-${label}.png`});report.cases.push(await page.evaluate(({tier,label})=>({tier,label,canvas:{...document.querySelector('canvas').dataset},placed:window.__placed,diagnostics:window.__THREE_GAME_DIAGNOSTICS__.echoBoss,copies:window.__echoGame.echoBoss.copies.map(c=>({name:c.mesh.name,original:c.mesh.userData.original,start:c.start.toArray(),end:c.end.toArray(),position:c.mesh.position.toArray(),geometry:c.mesh.geometry?.type,parts:c.mesh.children.map(m=>({name:m.name,vertices:m.geometry?.attributes.position.count}))})),buildings:window.__echoGame.buildSystem.diagnostics.hp}),{tier,label}));};
 if(process.env.ECHO_SLOT_REUSE&&tier==='full'){
  await page.waitForFunction(()=>document.querySelector('canvas').dataset.run3dPilotState==='ready');
  const result=await page.evaluate(()=>{
   const g=window.__echoGame,b=g.buildSystem,entry=b.diagnostics.hp.find(e=>e.id==='turret'),origin={x:entry.position.x,z:entry.position.z},material=g.echoBoss.copyMaterial;
   const before=g.run3dPilot.snapshot('turret',entry.index,origin,material);
   if(!b.demolish('turret',entry.index,g.timeAlive,origin))throw Error('Demolish failed');
   let placed;for(let dx=8;dx<=40&&!placed;dx+=2)for(let dz=-10;dz<=10&&!placed;dz+=2){const p={x:origin.x+dx,z:origin.z+dz};if(b.placeFree('turret',p,0,{preplaced:true}))placed=p;}
   if(!placed)throw Error('Replacement placement failed');
   const next=b.diagnostics.hp.find(e=>e.id==='turret');if(next.index!==entry.index)throw Error('Slot not reused');
   const after=g.run3dPilot.snapshot('turret',next.index,next.position,material);
   let maxDelta=0;for(let i=0;i<before.children.length;i++){const a=before.children[i].geometry.attributes.position.array,c=after.children[i].geometry.attributes.position.array;if(a.length!==c.length)throw Error('Different shape');for(let j=0;j<a.length;j++)maxDelta=Math.max(maxDelta,Math.abs(a[j]-c[j]));}
   for(const shape of [before,after])shape.traverse(n=>{if(n.geometry)n.geometry.dispose();});
   Object.assign(window.__placed.find(p=>p.id==='turret'),{x:next.position.x,z:next.position.z});
   return {index:next.index,old:origin,next:next.position,maxDelta};
  });if(process.env.ECHO_STALE_CONTROL){assert(result.maxDelta>1,'Control did not expose stale location');report.cases.push({tier,label:'stale-control-reproduced',...result});await page.close();break;}assert(result.maxDelta<1e-5);report.cases.push({tier,label:'same-frame-slot-reuse',...result});
 }
 await capture('base');
 await page.evaluate(async()=>{const {Balance}=await import('/src/game/Balance.ts');window.__GR_TEST__.startWaveForTest(Balance.e7Boss.arriveWave);window.__GR_TEST__.advanceSim(.02);});
 await capture('mirror-start');
 if(process.env.ECHO_DELAYED&&tier==='full'){
  const before=await page.evaluate(()=>{const b=window.__echoGame.echoBoss;return {state:document.querySelector('canvas').dataset.run3dPilotState,shapes:JSON.stringify(b.copies.map(c=>c.mesh.children.map(n=>({name:n.name,positions:Array.from(n.geometry.attributes.position.array)})))),diagnostics:b.diagnostics()};});
  assert.equal(before.state,'loading');releaseModels();await page.waitForFunction(()=>document.querySelector('canvas').dataset.run3dPilotState==='ready');
  const after=await page.evaluate(()=>{const b=window.__echoGame.echoBoss;return {shapes:JSON.stringify(b.copies.map(c=>c.mesh.children.map(n=>({name:n.name,positions:Array.from(n.geometry.attributes.position.array)})))),diagnostics:b.diagnostics()};});
  assert.equal(after.shapes,before.shapes);assert.deepEqual(after.diagnostics,before.diagnostics);report.cases.push({tier,label:'late-model-load',shapeUnchanged:true,diagnosticsUnchanged:true});
 }

 await page.evaluate(async()=>{const {Balance}=await import('/src/game/Balance.ts');window.__GR_TEST__.advanceSim(Balance.e7Boss.adaptationSeconds+.05);});
 await capture('mirror-arrived');
 if(process.env.ECHO_LIFECYCLE){
  report.cases.push({tier,label:'lifecycle-d demotion',...await page.evaluate(async()=>{
   const g=window.__echoGame,b=g.echoBoss,geometry=new Set();b.copiesGroup.traverse(n=>{if(n.geometry)geometry.add(n.geometry);});
   const bytes=()=>JSON.stringify([...geometry].map(g=>Array.from(g.attributes.position.array)));const before=bytes();
   let disposed=0;for(const item of geometry)item.addEventListener('dispose',()=>disposed++);
   let shared=0;g.scene.traverse(n=>{if(n.geometry&&geometry.has(n.geometry)){let p=n;while(p&&p!==b.copiesGroup)p=p.parent;if(!p)shared++;}});
   const diagnostics=JSON.stringify(b.diagnostics());g.fallbackToLiteRendering();b.update(g.timeAlive);
   const result={geometryCount:geometry.size,disposedDuringDemotion:disposed,sharedWithSource:shared,geometryUnchanged:bytes()===before,diagnosticsUnchanged:JSON.stringify(b.diagnostics())===diagnostics};
   window.__echoLifetime={geometry,getDisposed:()=>disposed};
   const terrain=await import('/src/world/Terrain.ts');let minGap=Infinity,supports=0;g.scene.updateMatrixWorld(true);
   b.copiesGroup.traverse(n=>{if(!n.isMesh)return;const a=n.geometry.attributes.position,p=n.position.clone();for(let i=0;i<a.count;i++){p.fromBufferAttribute(a,i);if(p.y>.4)continue;p.applyMatrix4(n.matrixWorld);minGap=Math.min(minGap,p.y-terrain.visualY(p.x,p.z));supports++;}});
   return {...result,supports,minGap};
  })});
 }

 for(const key of ['KeyW','KeyA','KeyS','KeyD']) {await page.keyboard.down(key);await page.evaluate(()=>window.__GR_TEST__.advanceSim(.05));await page.keyboard.up(key);}
 await page.waitForFunction(()=>window.__THREE_GAME_DIAGNOSTICS__.echoBoss.captured);
 await capture('jar');
 if(process.env.ECHO_LIFECYCLE){const result=await page.evaluate(()=>{const b=window.__echoGame.echoBoss,l=window.__echoLifetime;b.reset();const resources=new Set();b.jar.traverse(n=>{if(n.geometry)resources.add(n.geometry);if(n.material)for(const m of Array.isArray(n.material)?n.material:[n.material])resources.add(m);});const counts=new Map([...resources].map(r=>[r,0]));for(const r of resources)r.addEventListener('dispose',()=>counts.set(r,counts.get(r)+1));b.dispose();if([...counts.values()].some(n=>n!==1))throw Error('Jar resources not disposed exactly once');return {geometries:l.geometry.size,disposed:l.getDisposed(),copies:b.copies.length,jarResources:resources.size,jarDisposedExactlyOnce:true};});assert.equal(result.disposed,result.geometries);assert.equal(result.copies,0);report.cases.push({tier,label:'reset-disposal',...result});}

 await page.close();
}
 for(const tier of process.env.ECHO_STALE_CONTROL?[]:['full','lite']) {
  const arrived=report.cases.find(c=>c.tier===tier&&c.label==='mirror-arrived');
  assert.equal(arrived.copies.length,arrived.placed.length);
  for(const a of arrived.copies){assert(a.parts.length>0,a.name);for(const b of arrived.copies){const before=Math.hypot(a.original.x-b.original.x,a.original.z-b.original.z);const after=Math.hypot(a.position[0]-b.position[0],a.position[2]-b.position[2]);assert(Math.abs(before-after)<1e-5,'Formation spacing changed');}}
  const jar=report.cases.find(c=>c.tier===tier&&c.label==='jar');assert.equal(jar.diagnostics.captured,true);assert.equal(jar.diagnostics.killPath,false);
 }
 for(const row of report.cases.filter(c=>c.label==='lifecycle-d demotion')){assert.equal(row.disposedDuringDemotion,0);assert.equal(row.sharedWithSource,0);assert(row.geometryUnchanged&&row.diagnosticsUnchanged);}
 assert.deepEqual(report.errors,[]);report.completed=true;}finally{await writeFile(`${out}/report.json`,JSON.stringify(report,null,2)+'\n');await browser.close();}
