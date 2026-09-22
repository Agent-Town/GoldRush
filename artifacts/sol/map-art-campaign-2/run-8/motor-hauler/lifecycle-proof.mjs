// Isolated render-body lifecycle, with actual GLB loads and controlled late/rejected completions.
import {chromium} from '@playwright/test';
import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const out='artifacts/sol/map-art-campaign-2/run-8/motor-hauler',browser=await chromium.launch({channel:'chromium'}),rows=[];
try{for(const width of [1280,390]){
 const page=await browser.newPage({viewport:{width,height:width===390?844:800}}),errors=[];page.setDefaultTimeout(120000);
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/src/entities/Vehicle.ts?art-lifecycle=controlled',async route=>{
  const response=await route.fetch(),source=await response.text();assert.ok(source.includes('createGltfLoader().loadAsync(haulerBodyUrl)'));
  await route.fulfill({response,body:source.replace('createGltfLoader().loadAsync(haulerBodyUrl)','window.__MOTOR_ART_LOAD__()')});
 });
 await page.goto('http://127.0.0.1:5303/?debug&contract=e4-boneyard&epoch=epoch-4-motor&nowaves&nolevel&nopause&tier=full');
 await page.waitForFunction(()=>window.__GR_TEST__&&document.querySelector('#game-canvas')?.dataset.terrain3dPilotLandmarkLoadState==='mounted');
 if(await page.getByTestId('contract-briefing-dismiss').isVisible())await page.getByTestId('contract-briefing-dismiss').click();
 await page.evaluate(()=>window.__GR_TEST__.setManualSim(true));
 const proof=await page.evaluate(async()=>{
  const T=await import('/@id/three'),{Vehicle}=await import('/src/entities/Vehicle.ts'),cycles=[];
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const watch=v=>{const counts={geometries:0,materials:0,instances:0};for(const g of v.geometries)g.addEventListener('dispose',()=>counts.geometries++);for(const m of v.materials)m.addEventListener('dispose',()=>counts.materials++);v.group.traverse(n=>{if(n.isInstancedMesh)n.addEventListener('dispose',()=>counts.instances++)});return counts};
  const fuel={draw:amount=>amount},options={start:{x:0,z:0},path:[{x:5,z:0}],loop:true};
  for(let i=0;i<3;i++){
   const vehicle=new Vehicle(fuel,options),fallback=watch(vehicle),stateBefore=JSON.stringify(vehicle.diagnostics);
   const deadline=performance.now()+30000;while(vehicle.group.userData.bodySource!=='glb'){if(performance.now()>deadline)throw Error('body load timeout');await sleep(20)}
   const stateAfter=JSON.stringify(vehicle.diagnostics),authored=watch(vehicle),geometryCount=vehicle.geometries.length,materialCount=vehicle.materials.length,bounds=new T.Box3().setFromObject(vehicle.group),emission=vehicle.materials.map(m=>m.emissiveIntensity??0);
   vehicle.dispose();vehicle.dispose();cycles.push({cycle:i,fallback,authored,geometryCount,materialCount,emission,stateUnchangedOnLoad:stateBefore===stateAfter,remainingChildren:vehicle.group.children.length,bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()}});
  }
  const pending=[];window.__MOTOR_ART_LOAD__=()=>new Promise((resolve,reject)=>pending.push({resolve,reject}));
  const {Vehicle:Controlled}=await import('/src/entities/Vehicle.ts?art-lifecycle=controlled');
  const late=new Controlled(fuel,options),lateFallback=watch(late);late.dispose();
  const geometry=new T.BoxGeometry(),texture=new T.Texture(),material=new T.MeshStandardMaterial({map:texture}),scene=new T.Group();scene.add(new T.Mesh(geometry,material));
  const lateDisposed={geometry:0,material:0,texture:0};geometry.addEventListener('dispose',()=>lateDisposed.geometry++);material.addEventListener('dispose',()=>lateDisposed.material++);texture.addEventListener('dispose',()=>lateDisposed.texture++);pending.shift().resolve({scene});await sleep(20);
  const failure=new Controlled(fuel,options),failedFallback=watch(failure);pending.shift().reject(Error('controlled art-load rejection'));await sleep(20);const failedState={source:failure.group.userData.bodySource,children:failure.group.children.length};failure.dispose();
  delete window.__MOTOR_ART_LOAD__;
  return {cycles,late:{fallback:lateFallback,disposed:lateDisposed,children:late.group.children.length,bodyDisposed:late.bodyDisposed},failure:{state:failedState,disposed:failedFallback,childrenAfterDispose:failure.group.children.length}};
 });
 for(const r of proof.cycles){assert.deepEqual(r.fallback,{geometries:3,materials:3,instances:1});assert.equal(r.authored.geometries,r.geometryCount);assert.equal(r.authored.materials,r.materialCount);assert.ok(Math.max(...r.emission)<=.6);assert.ok(r.stateUnchangedOnLoad);assert.equal(r.remainingChildren,0)}
 assert.deepEqual(proof.late.fallback,{geometries:3,materials:3,instances:1});assert.deepEqual(proof.late.disposed,{geometry:1,material:1,texture:1});assert.equal(proof.late.children,0);assert.ok(proof.late.bodyDisposed);
 assert.deepEqual(proof.failure.state,{source:'fallback',children:3});assert.deepEqual(proof.failure.disposed,{geometries:3,materials:3,instances:1});assert.equal(proof.failure.childrenAfterDispose,0);assert.deepEqual(errors,[]);
 rows.push({width,...proof,errors});writeFileSync(out+'/lifecycle-proof.json',JSON.stringify(rows,null,2)+'\n');console.log(width,'PASS: three actual loads/disposals, late load, rejected load');await page.close();
}}finally{await browser.close()}
