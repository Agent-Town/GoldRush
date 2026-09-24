import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import * as THREE from 'three';
import ts from 'typescript';
import { createServer } from 'vite';
const root = 'artifacts/sol/map-art-campaign-2/run-10/entry-framing';
const vite = await createServer({ appType:'custom', logLevel:'silent', server:{middlewareMode:true,watch:null} });
try {
  const { CameraRig } = await vite.ssrLoadModule('/src/systems/CameraRig.ts');
  const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');
  const source = readFileSync(`${root}/baseline-CameraRig.ts`,'utf8').replace(/^import.*\n/gm,'').replace(/const entryPacks:[\s\S]*?};/, '').replace('export class','class');
  const Baseline = new Function('THREE','Balance','entryPacks',ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText+'\nreturn CameraRig;')(THREE,Balance,{});
  const before = new THREE.PerspectiveCamera(42,1.6,.1,100), after=before.clone();
  const old = new Baseline(before), rig = new CameraRig(after);
  const target=new THREE.Vector3(0,.7,12), velocity=new THREE.Vector3();
  const pose=c=>[...c.position.toArray(),...c.quaternion.toArray(),...c.projectionMatrix.elements];
  old.snapTo(target);rig.snapTo(target);
  let compared=0;
  for(let i=0;i<1200;i++){
    target.set(Math.sin(i/90)*30,.7+Math.sin(i/25),Math.cos(i/70)*25);
    velocity.set(Math.cos(i/90),0,-Math.sin(i/70));
    if(i===100){old.impulse(target,.1);rig.impulse(target,.1);}
    if(i===200){old.setGlanceTarget(target,velocity);rig.setGlanceTarget(target,velocity);}
    if(i===400){old.setGlanceTarget(null);rig.setGlanceTarget(null);}
    if(i===600){old.snapTo(target);rig.snapTo(target);}
    if(i===800){old.setDistanceScale(1.3);rig.setDistanceScale(1.3);}
    const delta=[1/60,1/120,.033,.008][i%4];old.update(delta,target,velocity);rig.update(delta,target,velocity);
    assert.deepEqual(pose(after),pose(before),`non-entry/replay/multiplayer pose ${i}`);compared++;
  }
  rig.entryGlance={position:new THREE.Vector3(50,0,-50),elapsed:0,seconds:2.5};
  const savedTarget=target.clone(), savedVelocity=velocity.clone();
  for(let i=0;i<360;i++) rig.update(1/60,target,velocity);
  assert.equal(rig.entryGlance,null);
  assert.deepEqual(target,savedTarget);assert.deepEqual(velocity,savedVelocity);
  const expected=new THREE.Vector3().copy(Balance.camera.offset).multiplyScalar(1.3).add(target);
  assert.ok(after.position.distanceTo(expected)<1e-7,'returns to the resting hero offset');
  rig.entryGlance={position:new THREE.Vector3(),elapsed:0,seconds:2.5};rig.snapTo(target);assert.equal(rig.entryGlance,null);
  rig.entryGlance={position:new THREE.Vector3(),elapsed:0,seconds:2.5};rig.setGlanceTarget(target,velocity);assert.equal(rig.entryGlance,null);
  rig.setGlanceTarget(null);velocity.set(0,0,0);target.set(0,.7,0);let entryFrames=0;
  for(const destination of [new THREE.Vector3(0,.7,92),new THREE.Vector3(0,.7,-71),new THREE.Vector3(-56,.7,82),new THREE.Vector3(56,6,-82)]){
    rig.snapTo(target);const rotation=after.quaternion.clone();
    rig.entryGlance={position:destination,elapsed:0,seconds:2.5};
    for(let i=0;i<150;i++){
      rig.update(1/60,target,velocity);
      assert.ok(after.quaternion.angleTo(rotation)<1e-7,'long entry pan preserves the normal rig orientation');
      assert.ok(after.position.clone().sub(rig.focus).distanceTo(Balance.camera.offset.clone().multiplyScalar(1.3))<1e-10,'entry keeps the authored camera offset');
      entryFrames++;
    }
  }
  writeFileSync(`${root}/rig-proof.json`,JSON.stringify({comparedBaselineFrames:compared,exactPoses:true,covered:['replay pan targets','moving hero','impulse','multiplayer glance and cancellation','zoom','snap'],timedReturnsToHero:true,inputVectorsUnchanged:true,snapCancels:true,multiplayerOverrides:true,entryFramesWithFixedOrientation:entryFrames,longPanDoesNotFlip:true},null,2)+'\n');
} finally {await vite.close();}
