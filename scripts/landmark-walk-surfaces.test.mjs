import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createLandmarkWalkSurfaces as create} from '../src/world/LandmarkWalkSurfaces.ts';
const surface={minX:-1,maxX:1,minZ:-1,maxZ:1,height:1};
const entry=model=>[{model,mount:{walkSurfaces:[surface]}}];
assert.equal(create(()=>0,[{model:new THREE.Object3D(),mount:{}}]),null);
const shear=new THREE.Object3D();shear.matrixAutoUpdate=false;shear.matrix.set(1,1,0,0,0,1,0,0,0,0,1,0,0,0,0,1);
for(const model of [shear,new THREE.Object3D()]){
 if(model!==shear){model.position.set(4,3,-5);model.rotation.y=.71;model.scale.set(2,3,.8);}
 const binding=create(()=>-2,entry(model));let disposed=0;binding.pointers[0].geometry.addEventListener('dispose',()=>disposed++);binding.pointers[0].material.addEventListener('dispose',()=>disposed++);
 for(const [x,z]of [[0,0],[.5,.5],[-.7,.3],[2,2]]){
  const p=new THREE.Vector3(x,1,z).applyMatrix4(model.matrixWorld);const expected=Math.abs(x)<=1&&Math.abs(z)<=1?p.y:-2;
  assert.ok(Math.abs(binding.heightAt(p.x,p.z)-expected)<1e-8);
  const ray=new THREE.Raycaster(new THREE.Vector3(p.x,p.y+10,p.z),new THREE.Vector3(0,-1,0));const hit=ray.intersectObjects(binding.pointers)[0];
  if(expected===-2)assert.equal(hit,undefined);else assert.ok(hit.point.distanceTo(p)<1e-8);
 }
 binding.dispose();binding.dispose();assert.equal(disposed,2);assert.equal(binding.heightAt(0,0),-2);
}
for(const kind of ['singular','tilted','nonfinite','bounds']){
 const model=new THREE.Object3D();if(kind==='singular')model.scale.y=0;if(kind==='tilted')model.rotation.x=.4;if(kind==='nonfinite')model.position.x=NaN;
 const entries=entry(model);if(kind==='bounds')entries[0].mount.walkSurfaces=[{...surface,minX:1}];assert.throws(()=>create(()=>0,entries),/invalid horizontal/);
}
console.log('PASS: translated/rotated/scaled/sheared surfaces agree with raycasts; invalid transforms and bounds rejected; disposal idempotent');
