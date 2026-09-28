import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'vite';
import * as THREE from 'three';

test('Twin Banks preserves counts, paints existing atlas cells, clears both banks and fords, and follows late terrain', async () => {
 const oldWindow=globalThis.window,oldDocument=globalThis.document,oldLocation=globalThis.location;
 globalThis.window={location:new URL('http://gr.local/?debug&contract=e1-twin-banks&seed=code-presentation&tier=full'),innerWidth:1280,matchMedia:()=>({matches:false}),addEventListener(){},removeEventListener(){}};
 globalThis.location=globalThis.window.location;
 globalThis.document={querySelector:()=>null,createElement:()=>({width:0,height:0,getContext:()=>new Proxy({createRadialGradient:()=>({addColorStop(){}})},{get:(o,p)=>o[p]??(()=>{})})}),createElementNS:()=>({addEventListener(){},removeEventListener(){},set src(v){}})};
 const vite=await createServer({appType:'custom',logLevel:'silent',server:{middlewareMode:true}});
 try{
  const {DetailScatter}=await vite.ssrLoadModule('/src/world/Scatter.ts');
  const terrain=await vite.ssrLoadModule('/src/world/Terrain.ts');
  const {activeContract}=await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
  assert.equal(activeContract().id,'e1-twin-banks');
  const scatter=new DetailScatter(),tile=activeContract().tileParams;
  assert.equal(scatter.diagnostics().seededInstances,248);
  assert.deepEqual(scatter.classes.filter(c=>c.instances.length).map(c=>c.profile.material.userData.riparianCard),['driftwood','willow','reeds','driftwood','willow','reeds']);
  assert.equal(new Set(scatter.classes.filter(c=>c.instances.length).map(c=>c.profile.material.map)).size,1);
  for(const entry of scatter.classes)for(const d of entry.instances){
   assert.ok(!tile.buildZones.some(b=>d.x>=b.minX-1&&d.x<=b.maxX+1&&d.z>=b.minZ-1&&d.z<=b.maxZ+1));
   assert.ok(!tile.fords.some(f=>Math.abs(d.x-f.x)<f.halfWidth+1&&Math.abs(d.z)<7));
   assert.equal(terrain.sample(d.x,d.z).zone,'bank');
  }
  const drawCount=scatter.group.children.filter(c=>c.visible&&c.count!==0).length;
  assert.equal(drawCount,6);
  const positions=scatter.seededInstances.map(d=>[d.x,d.z]);
  const release=terrain.installVisualHeightSource((x,z)=>2+x*.01+z*.02,[]);
  scatter.syncBuildingClearings([]);
  assert.ok(scatter.seededInstances.every(d=>Math.abs(d.y-(terrain.sampleHeight(d.x,d.z)-.025))<1e-9));
  assert.deepEqual(scatter.seededInstances.map(d=>[d.x,d.z]),positions);
  assert.equal(scatter.group.children.filter(c=>c.visible&&c.count!==0).length,drawCount);
  const first=scatter.seededInstances[0];scatter.syncBuildingClearings([{x:first.x,z:first.z,radius:1}]);assert.equal(first.hidden,true);
  const releaseAgain=terrain.installVisualHeightSource(()=>3,[]);
  scatter.syncBuildingClearings([{x:first.x,z:first.z,radius:1}]);
  scatter.syncBuildingClearings([]);assert.equal(first.hidden,false);
  const camera=new THREE.OrthographicCamera(-100,100,100,-100,.1,1000);camera.position.set(0,100,0);camera.lookAt(0,0,0);camera.updateMatrixWorld(true);scatter.group.updateMatrixWorld(true);
  const batch=scatter.group.children.find(c=>c.name.startsWith('DetailScatter.opaque.rocks'));batch.onBeforeRender(null,null,camera);
  const vertex=new THREE.Vector3().fromBufferAttribute(batch.geometry.attributes.position,0);
  assert.ok(Math.hypot(vertex.x-first.x,vertex.z-first.z)<1.1,'unhidden card must retain its nonzero baked transform after the ground swap');
  const contact=scatter.group.getObjectByName('DetailScatter.reeds.contact');const matrix=new THREE.Matrix4();contact.getMatrixAt(0,matrix);assert.ok(Math.abs(matrix.elements[13]-3.012)<1e-6,'contact shadow stays above ground while roots embed');
  releaseAgain();
  release();scatter.dispose();
 }finally{await vite.close();globalThis.window=oldWindow;globalThis.document=oldDocument;globalThis.location=oldLocation}
});
