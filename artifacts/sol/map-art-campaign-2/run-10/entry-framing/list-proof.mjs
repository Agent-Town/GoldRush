import assert from 'node:assert/strict';
import { createServer } from 'vite';
import * as THREE from 'three';
import { writeFileSync } from 'node:fs';
const root='artifacts/sol/map-art-campaign-2/run-10/entry-framing';
const vite=await createServer({appType:'custom',logLevel:'silent',server:{middlewareMode:true,watch:null}});
try{
 const {CameraRig}=await vite.ssrLoadModule('/src/systems/CameraRig.ts');
 const {Balance}=await vite.ssrLoadModule('/src/game/Balance.ts');
 const camera=new THREE.PerspectiveCamera(42,1.6,.1,100),rig=new CameraRig(camera),hero=new THREE.Vector3(0,.7,-32),velocity=new THREE.Vector3();
 const first=new THREE.Vector3(-56,8,50),second=new THREE.Vector3(28,.5,-59);
 rig.snapTo(hero);const rotation=camera.quaternion.clone();
 rig.entryGlance={position:first,nextPosition:second,elapsed:0,seconds:2.5};
 let firstHeld=false,secondHeld=false;
 for(let i=1;i<=151;i++){
  rig.update(1/60,hero,velocity);
  assert.ok(camera.quaternion.angleTo(rotation)<1e-7,'two-stop route preserves orientation');
  assert.ok(camera.position.clone().sub(rig.focus).distanceTo(Balance.camera.offset)<1e-8,'fixed offset');
  if(i===48){assert.ok(rig.focus.distanceTo(first)<1e-8);firstHeld=true;}
  if(i===102){assert.ok(rig.focus.distanceTo(second)<1e-8);secondHeld=true;}
 }
 assert.equal(rig.entryGlance,null);assert.ok(rig.focus.distanceTo(hero)<1e-8);
 assert.deepEqual(hero.toArray(),[0,.7,-32]);assert.deepEqual(velocity.toArray(),[0,0,0]);
 const scene=new THREE.Scene();
 for(const [name,position] of [['mesa-starstone-derrick',first],['isotope-cooling-rack',second]]){
  const model=new THREE.Group();model.name=name;model.position.copy(position);model.userData.landmarkAsset=true;scene.add(model);
 }
 const rows=[];
 for(const visible of [[],['isotope-cooling-rack'],['mesa-starstone-derrick'],['mesa-starstone-derrick','isotope-cooling-rack']]){
  const probe=new CameraRig(camera.clone());let calls=0;
  probe.bodyPixels=model=>{calls++;return visible.includes(model.name)?1:0};
  probe.tryEntryGlance('e6-glow-mesa',scene,{});
  const expected=[['mesa-starstone-derrick',first],['isotope-cooling-rack',second]].filter(([id])=>!visible.includes(id));
  if(!expected.length)assert.equal(probe.entryGlance,null);
  else{assert.deepEqual(probe.entryGlance.position.toArray(),expected[0][1].toArray());assert.deepEqual(probe.entryGlance.nextPosition?.toArray(),expected[1]?.[1].toArray());assert.equal(probe.entryGlance.seconds,2.5);}
  probe.tryEntryGlance('e6-glow-mesa',scene,{});assert.equal(calls,2,'one census per declared body, once per boot');
  rows.push({visible,queued:expected.map(([id])=>id)});
 }
 writeFileSync(`${root}/list-proof.json`,JSON.stringify({seconds:2.5,easeIn:.7,firstHold:.2,transition:.7,secondHold:.2,easeOut:.7,firstHeld,secondHeld,offsetAndOrientationPreserved:true,returnsToUnchangedHero:true,visibilityCases:rows},null,2)+'\n');
}finally{await vite.close()}
