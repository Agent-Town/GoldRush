// Evidence probe for variant dressing; no production diagnostics are changed.
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const [contractId,tileId,expected]=['e2-pressure-garden','e2-pressure-garden','5'];
const out=`artifacts/sol/map-art-campaign-2/run-9/${contractId}`,proof=JSON.parse(readFileSync(`${out}/invariants.json`,'utf8'));
const browser=await chromium.launch({channel:'chromium'}),rows=[];
try{for(const width of [1280,390]){
 const page=await browser.newPage({viewport:{width,height:width===390?844:800},isMobile:width===390,hasTouch:width===390});const errors=[];
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5303/?debug&nowaves&nolevel&nopause');
 const cycles=await page.evaluate(async({contractId,tileId})=>{
  const T=await import('/@id/three'),p=await import('/src/world/Terrain3dClaimPilot.ts'),rows=[],textures=[];
  const original=T.TextureLoader.prototype.load;
  T.TextureLoader.prototype.load=function(url,...args){const texture=original.call(this,url,...args);if(url.includes('engraved-river-gravel')){const record={disposed:0,loaded:!!texture.image};texture.addEventListener('dispose',()=>record.disposed++);textures.push(record)}return texture};
  try {
  for(let cycle=0;cycle<3;cycle++){
   const scene=new T.Scene(),canvas=document.createElement('canvas');
   const dispose=p.installTerrain3dClaimPilot({scene,canvas,contractId,tileId});
   await new Promise((resolve,reject)=>{const deadline=performance.now()+30000;function poll(){if(canvas.dataset.terrain3dPilotLandmarkLoadState==='mounted')resolve();else if(performance.now()>deadline)reject(Error(JSON.stringify(canvas.dataset)));else requestAnimationFrame(poll)}poll()});
   const dataset={...canvas.dataset};dispose();await new Promise(r=>setTimeout(r,300));rows.push({cycle,dataset,remainingSceneChildren:scene.children.length,nativeTextures:textures.length,nativeTexturesDisposed:textures.filter(t=>t.disposed>0).length});
  }return rows;}finally{T.TextureLoader.prototype.load=original}
 },{contractId,tileId});
 for(const r of cycles){assert.equal(r.dataset.terrain3dPilotLandmarks,expected);assert.equal(r.dataset.terrain3dPilotLandmarkSkipped,'0');assert.equal(r.dataset.terrain3dPilotWalkSurfaces,'0');assert.equal(r.remainingSceneChildren,0);assert.equal(r.nativeTextures,r.cycle+1);assert.equal(r.nativeTexturesDisposed,r.nativeTextures);const mounts=JSON.parse(r.dataset.terrain3dPilotLandmarkMounts);for(const id of proof.activeAdditionalMounts??[])assert.ok(mounts.some(m=>m.id===id));for(const id of proof.heldForCollisionAlias??[])assert.equal(mounts.some(m=>m.id===id),false)}
 assert.deepEqual(errors,[]);rows.push({width,cycles,errors});await page.close();
}}finally{await browser.close()}
writeFileSync(`${out}/native-texture-disposal-proof.json`,JSON.stringify(rows,null,2)+'\n');console.log(contractId,'3 mount/dispose cycles at each viewport;',expected,'bodies; held bodies absent; no errors; no retained scene objects');
