// Actual LandYacht presentation, deterministic component damage, and loader lifecycle.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
const out=process.env.GOLD_RUSH_SPRITE_EVIDENCE??'artifacts/sol/sprite-roster-fixes-20260908/land-yacht-review';
fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'chromium'}),reports=[];
try{
 for(const [mode,width]of [['full',1280],['full',390],['lite',390],['wrong-model',390],['cancel',390],['demote-loading',390]]){
  const page=await browser.newPage({viewport:{width,height:800},deviceScaleFactor:2});const errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  let requests=0,release,started;const begun=new Promise(r=>started=r),held=new Promise(r=>release=r);
  await page.route('**/land-yacht.glb',async route=>{requests++;started();if(mode==='cancel'||mode==='demote-loading')await held;if(mode==='wrong-model'||process.env.GOLD_RUSH_REVIEW_MODEL)await route.fulfill({path:mode==='wrong-model'?'assets/pilots/crawler-3d/crawler.glb':process.env.GOLD_RUSH_REVIEW_MODEL,contentType:'model/gltf-binary'});else await route.continue()});
  await page.route('**/__sprite_review__.html',route=>route.fulfill({contentType:'text/html',body:'<html><body style="margin:0"></body></html>'}));
  await page.addInitScript(mode=>localStorage.setItem('gr.performance.tier.v1',mode==='lite'?'lite':'full'),mode);
  await page.goto(new URL('/__sprite_review__.html',process.env.GOLD_RUSH_REVIEW_URL??'http://127.0.0.1:5319/').href);
  await page.evaluate(async()=>{
   const THREE=await import('/node_modules/.vite/deps/three.js'),{LandYachtBossSystem}=await import('/src/systems/LandYachtBossSystem.ts');
   const enemies=['wheels','crane','wheelhouse'].map((id,i)=>({isAlive:true,variantId:'land_yacht',bossComponentId:id,position:new THREE.Vector3((i-1)*2,0,0),group:new THREE.Group(),currentHp:100,maxHp:100,scriptMoveTo(){},scriptMoveRoute(){}}));
   const system=new LandYachtBossSystem(()=>enemies,()=>null,()=>false,()=>null,()=>false,()=>{});
   const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(2);renderer.setSize(innerWidth,800);renderer.setClearColor('#ded5b9');document.body.append(renderer.domElement);
   const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(42,innerWidth/800,.1,100);camera.position.set(15,12,20);camera.lookAt(0,2,0);
   scene.add(new THREE.HemisphereLight('#fff8e0','#79613d',2));const light=new THREE.DirectionalLight('#fff1d1',3);light.position.set(4,12,7);scene.add(light,system.group);
   const floor=new THREE.Mesh(new THREE.PlaneGeometry(60,60),new THREE.MeshStandardMaterial({color:'#b99b68'}));floor.rotation.x=-Math.PI/2;floor.position.y=-.02;scene.add(floor);
   window.fixture={system,enemies,renderer,scene,camera,render:()=>{camera.position.copy(system.body.position).add(new THREE.Vector3(15,12,20));camera.lookAt(system.body.position.clone().add(new THREE.Vector3(0,2,0)));renderer.render(scene,camera)}};
   system.update(0);
  });
  if(mode==='cancel'||mode==='demote-loading'){
   await begun;await page.evaluate(async mode=>{if(mode==='cancel')window.fixture.system.dispose();else{localStorage.setItem('gr.performance.tier.v1','lite');(await import('/src/game/PerformanceTier.ts')).applyStoredPerformanceTier();window.fixture.system.update(0)}},mode);release();
   await page.waitForResponse(r=>r.url().endsWith('/land-yacht.glb'));
   await page.evaluate(async()=>{for(let i=0;i<60;i++)await new Promise(requestAnimationFrame)});
   assert.deepEqual(await page.evaluate(()=>({state:window.fixture.system.modelState,mounted:!!window.fixture.system.model})),{state:mode==='cancel'?'disposed':'lite',mounted:false});
   reports.push({mode,width,requests,lateLoadIgnored:true,errors});assert.deepEqual(errors,[]);await page.close();continue;
  }
  const state=mode==='full'?'ready':mode==='lite'?'lite':'failed';
  await page.waitForFunction(state=>window.fixture.system.modelState===state,state);
  const result=await page.evaluate(()=>{const f=window.fixture;f.system.update(0);f.render();return{fallbackCraneX:f.system.components.get('crane').children.map(m=>m.position.x),fallbackHouseX:f.system.components.get('wheelhouse').children.map(m=>m.position.x),state:f.system.modelState,meshes:[...f.system.modelMeshes.keys()],fallbackVisible:[...f.system.components.values()].every(c=>c.visible),textures:f.renderer.info.memory.textures,calls:f.renderer.info.render.calls}});
  assert.ok(result.fallbackCraneX.every(x=>x<0));assert.ok(result.fallbackHouseX.every(x=>x>0));
  assert.equal(result.fallbackVisible,mode!=='full');if(mode==='full')assert.deepEqual(result.meshes.sort(),['crane','wheelhouse','wheels']);if(mode==='lite')assert.equal(requests,0);
  await page.locator('canvas').screenshot({path:path.join(out,`${mode}-${width}-intact.png`)});
  if(mode==='full'){
   for(const id of ['wheels','crane','wheelhouse']){
    const damage=await page.evaluate(id=>{const f=window.fixture;for(const e of f.enemies)e.currentHp=e.bossComponentId===id?49:100;f.system.update(0);f.render();return Object.fromEntries([...f.system.modelMeshes].map(([key,mesh])=>[key,mesh.morphTargetInfluences[0]]))},id);
    for(const [key,value]of Object.entries(damage))assert.equal(value,key===id?1:0);
    await page.locator('canvas').screenshot({path:path.join(out,`${mode}-${width}-${id}-damaged.png`)});
   }
   const tracking=await page.evaluate(()=>{const f=window.fixture;for(const e of f.enemies.filter(e=>e.bossComponentId!=='wheels')){e.isAlive=false;f.system.onComponentKilled(e.bossComponentId,e.position,0)}f.system.update(0);const before=f.system.body.position.clone(),wheel=f.enemies[0];wheel.position.x+=48;f.system.update(0);return{delta:f.system.body.position.x-before.x,forwardZ:Math.sin(f.system.body.rotation.y)}});assert.equal(tracking.delta,48);assert.ok(tracking.forwardZ<-.999);
   await page.evaluate(()=>{const f=window.fixture;for(const e of f.enemies){e.isAlive=false;f.system.onComponentKilled(e.bossComponentId,e.position,0)}f.system.update(0);f.render()});
   assert.deepEqual(await page.evaluate(()=>{const s=window.fixture.system;return{wreck:s.diagnostics().wreckRemains,visible:s.body.visible,morphs:[...s.modelMeshes.values()].map(m=>m.morphTargetInfluences[0])}}),{wreck:true,visible:true,morphs:[1,1,1]});
   await page.locator('canvas').screenshot({path:path.join(out,`${mode}-${width}-wreck.png`)});
   const lifecycle=await page.evaluate(async()=>{const f=window.fixture;for(let i=0;i<180;i++)f.render();const warm=f.renderer.info.memory.textures;for(let i=0;i<180;i++)f.render();const final=f.renderer.info.memory.textures;const wreckPose={position:f.system.body.position.toArray(),yaw:f.system.body.rotation.y};let disposed=0;for(const mesh of f.system.modelMeshes.values())mesh.geometry.addEventListener('dispose',()=>disposed++);f.system.reset();const reset={state:f.system.modelState,visible:f.system.body.visible,meshes:f.system.modelMeshes.size,damage:f.system.diagnostics().damageStates};f.system.restoreWreck(new f.enemies[0].position.constructor(...wreckPose.position));const start=performance.now();while(f.system.modelState!=='ready'){await new Promise(requestAnimationFrame);if(performance.now()-start>15000)throw Error('wreck reload timeout')}f.render();return{warm,final,disposed,reset,wreckPose,restored:{yaw:f.system.body.rotation.y,position:f.system.body.position.toArray(),morphs:[...f.system.modelMeshes.values()].map(m=>m.morphTargetInfluences[0])}}});
   assert.equal(lifecycle.warm,lifecycle.final);assert.equal(lifecycle.disposed,3);assert.deepEqual(lifecycle.reset,{state:'off',visible:false,meshes:0,damage:{wheels:false,crane:false,wheelhouse:false}});assert.deepEqual(lifecycle.restored.morphs,[1,1,1]);assert.deepEqual(lifecycle.restored.position,lifecycle.wreckPose.position);assert.equal(lifecycle.restored.yaw,lifecycle.wreckPose.yaw);result.lifecycle=lifecycle;
   const demoted=await page.evaluate(async()=>{const f=window.fixture;localStorage.setItem('gr.performance.tier.v1','lite');(await import('/src/game/PerformanceTier.ts')).applyStoredPerformanceTier();f.system.update(0);return{state:f.system.modelState,model:!!f.system.model,fallback:[...f.system.components.values()].every(c=>c.visible)}});assert.deepEqual(demoted,{state:'lite',model:false,fallback:true});
  }
  await page.evaluate(()=>{window.fixture.system.dispose();window.fixture.renderer.dispose()});assert.deepEqual(errors,[]);reports.push({mode,width,requests,errors,...result});console.log({mode,width,state,requests});await page.close();
 }
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(reports,null,2)+'\n');
}finally{await browser.close()}
