import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createServer } from 'vite';
import * as THREE from 'three';

const contracts = JSON.parse(readFileSync('assets/contracts/epoch-2-steamworks/contracts.json')).contracts;
test('rail junctions have one sleeper run, flangeways and four buffers with two draws and immutable routes', async () => {
 const vite=await createServer({appType:'custom',logLevel:'silent',server:{middlewareMode:true}});
 try{
  const {RailPathView}=await vite.ssrLoadModule('/src/world/RailPath.ts');
  const terrain=await vite.ssrLoadModule('/src/world/Terrain.ts');
  const paths=structuredClone(contracts.find(c=>c.id==='e2-trestle').tileParams.rails);
  const before=JSON.stringify(paths);
  for(const path of paths){path.points.forEach(Object.freeze);Object.freeze(path.points);Object.freeze(path)}Object.freeze(paths);
  const view=new RailPathView(paths);
  assert.deepEqual(view.group.userData.railFinishing,{joins:1,buffers:4,frogs:4});
  assert.equal(view.diagnostics().drawCalls,2);
  const junction=view.diagnostics().ties.filter(t=>Math.hypot(t.x,t.z+22)<1.55);
  assert.equal(junction.length,5);assert.ok(junction.every(t=>t.yaw===0&&t.width===2.8));
  const release=terrain.installVisualHeightSource((x,z)=>4+x*.03+z*.01,[]);
  view.resampleTerrain();assert.ok(view.diagnostics().samples.every(p=>Math.abs(p.y-(4+Math.max(terrain.bounds.minX,Math.min(terrain.bounds.maxX,p.x))*.03+Math.max(terrain.bounds.minZ,Math.min(terrain.bounds.maxZ,p.z))*.01+.08))<1e-8));
  const matrices=Array.from(view.group.children[0].instanceMatrix.array);
  assert.ok(matrices.every(Number.isFinite));view.resampleTerrain();assert.deepEqual(Array.from(view.group.children[0].instanceMatrix.array),matrices);
  assert.equal(JSON.stringify(paths),before);release();view.dispose();
  const retraced=new RailPathView([{style:'steamworks',points:[{x:0,z:0},{x:10,z:0},{x:0,z:0}]}]);
  assert.equal(retraced.group.userData.railFinishing.buffers,2,'a retraced spur still terminates at its turnaround');
  const matrix=new THREE.Matrix4();
  for(let i=0;i<24;i++){retraced.group.children[0].getMatrixAt(i,matrix);assert.ok(Math.abs(Math.abs(matrix.elements[14])-.39)<1e-6,'rail sides must not swap and cross over the return leg')}
  retraced.dispose();
  for(const style of ['mass-driver','feeder-canal']){
   const other=new RailPathView([{style,points:[{x:0,z:0},{x:0,z:10}]}]);
   assert.deepEqual(other.group.userData.railFinishing,{joins:0,buffers:0,frogs:0});assert.equal(other.diagnostics().railInstances,24);other.dispose();
  }
 }finally{await vite.close()}
});
