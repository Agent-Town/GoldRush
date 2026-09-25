import {chromium} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const out='artifacts/sol/map-art-campaign-2/run-11/braid/e1-twin-banks';
const threeUrl=readFileSync(`${out}/baseline-Terrain.js`,'utf8').match(/from "([^"]+three.js[^\"]*)"/)[1];
const browser=await chromium.launch({channel:'chromium'});
try {
 const page=await browser.newPage();
 await page.goto('http://127.0.0.1:5188/?debug&contract=e1-twin-banks&nowaves&nolevel&nokill&tier=lite');
 await page.waitForFunction(()=>window.__GR_TEST__);
 const proof=await page.evaluate(async threeUrl=>{
  const T=await import('/src/world/Terrain.ts'), THREE=await import(threeUrl);
  const river=T.createRiverPlaceholder();river.updateMatrixWorld(true);
  const fords=T.fordRanges().map(r=>T.createFordPlaceholder(r));for(const f of fords)f.updateMatrixWorld(true);
  const ray=new THREE.Raycaster();const errors=[];let samples=0;
  for(let x=-31.875;x<=31.875;x+=.25)for(let z=-6.875;z<=6.875;z+=.25){
   const sample=T.sample(x,z);ray.set(new THREE.Vector3(x,10,z),new THREE.Vector3(0,-1,0));
   const wet=ray.intersectObjects([river,...fords]).length>0;
   if(wet!==(sample.zone!=='bank'))errors.push({x,z,zone:sample.zone,wet});samples++;
  }
  const anchors=[[0,0],[0,2],[0,-2],[-28,0],[-16,0],[16,0],[-7.5,.2],[7.4,-.25]].map(([x,z])=>({x,z,sample:T.sample(x,z),buildable:T.isBuildable(x,z)}));
  const result={samples,errors,anchors,vertices:river.geometry.attributes.position.count,triangles:river.geometry.index.count/3,visualHalfWidth:river.userData.visualHalfWidth};
  river.geometry.dispose();river.material.dispose();for(const f of fords){f.geometry.dispose();f.material.dispose()}
  return result;
 },threeUrl);
 writeFileSync(`${out}/geometry-proof.json`,JSON.stringify(proof,null,2));console.log(JSON.stringify(proof));assert.equal(proof.errors.length,0);
 await page.close();
}finally{await browser.close()}
