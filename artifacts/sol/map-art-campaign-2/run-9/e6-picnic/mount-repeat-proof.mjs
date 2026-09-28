// Evidence only: the native Picnic pigment must load and release on every mount.
import {chromium} from '@playwright/test';
import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chromium'}),rows=[];
try {for(const width of [1280,390]){
 const page=await browser.newPage({viewport:{width,height:width===390?844:800},isMobile:width===390,hasTouch:width===390});const errors=[];
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5303/?debug&nowaves&nolevel&nopause');
 const cycles=await page.evaluate(async()=>{
  const T=await import('/@id/three'),p=await import('/src/world/Terrain3dClaimPilot.ts'),rows=[];
  const original=T.TextureLoader.prototype.load;let created=[],released=[];
  T.TextureLoader.prototype.load=function(url,...args){const texture=original.call(this,url,...args);if(url.includes('/sources/e6-picnic-fidelity-2/')){created.push(texture);texture.addEventListener('dispose',()=>released.push(texture.uuid));}return texture;};
  try {for(let cycle=0;cycle<3;cycle++){
   created=[];released=[];const scene=new T.Scene(),canvas=document.createElement('canvas');
   const dispose=p.installTerrain3dClaimPilot({scene,canvas,contractId:'e6-picnic',tileId:'e6-glow-mesa'});
   await new Promise((resolve,reject)=>{const deadline=performance.now()+30000;function poll(){if(canvas.dataset.terrain3dPilotLandmarkLoadState==='mounted'&&created.length&&created.every(t=>t.image?.width))resolve();else if(performance.now()>deadline)reject(Error(JSON.stringify(canvas.dataset)));else requestAnimationFrame(poll)}poll()});
   const dataset={...canvas.dataset},textureIds=created.map(t=>t.uuid);dispose();rows.push({cycle,dataset,textureIds,releasedIds:[...released],remainingSceneChildren:scene.children.length});
  }}finally{T.TextureLoader.prototype.load=original;}return rows;
 });
 for(const r of cycles){assert.equal(r.dataset.terrain3dPilotLandmarks,'10');assert.equal(r.dataset.terrain3dPilotLandmarkSkipped,'0');assert.equal(r.remainingSceneChildren,0);assert.equal(r.textureIds.length,1);assert.deepEqual(r.releasedIds,r.textureIds);const mounts=JSON.parse(r.dataset.terrain3dPilotLandmarkMounts);assert.equal(mounts.filter(m=>m.id.includes('picnic-blanket')).length,3);assert.equal(mounts.some(m=>m.id==='mesa-civilian-shade'),true);}
 assert.deepEqual(errors,[]);rows.push({width,cycles,errors});await page.close();
}}finally{await browser.close();}
writeFileSync('artifacts/sol/map-art-campaign-2/run-9/e6-picnic/mount-repeat-proof.json',JSON.stringify(rows,null,2)+'\n');console.log('PASS: six mount/dispose cycles, ten bodies, one decoded/released pigment per cycle, no retained scene children or errors');
