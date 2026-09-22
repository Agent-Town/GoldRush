import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chromium'});
try {
 const page=await browser.newPage();
 await page.goto('http://127.0.0.1:5303/');
 const result=await page.evaluate(async()=>{
  const source=await (await fetch('/src/systems/CameraRig.ts')).text();
  const T=await import(source.match(/import \* as THREE from ["']([^"']+)/)[1]), {CameraRig}=await import('/src/systems/CameraRig.ts');
  const renderer=new T.WebGLRenderer();renderer.setSize(160,100);renderer.setClearColor(0x606060);
  const camera=new T.PerspectiveCamera(42,1.6,.1,100), rig=new CameraRig(camera);
  const scene=new T.Scene(), target=new T.Mesh(new T.BoxGeometry(2,2,2),new T.MeshBasicMaterial({color:0x443322}));
  target.name='mesa-starstone-derrick';target.userData.landmarkAsset='test';scene.add(target);
  camera.position.set(0,0,10);camera.lookAt(0,0,0);
  const original=target.material, visible=rig.bodyPixels(target,scene,renderer);
  rig.tryEntryGlance('e6-glow-mesa',scene,renderer);const alreadyVisibleNoop=rig.entryGlance===null;
  target.position.x=40;const outside=rig.bodyPixels(target,scene,renderer);
  rig.entryChecked=false;rig.tryEntryGlance('e6-glow-mesa',scene,renderer);const outsideTriggers=rig.entryGlance!==null;
  const first=rig.entryGlance;rig.tryEntryGlance('e6-glow-mesa',scene,renderer);const once=rig.entryGlance===first;
  rig.snapTo(new T.Vector3());camera.position.set(0,0,10);camera.lookAt(0,0,0);target.position.x=0;
  const wall=new T.Mesh(new T.BoxGeometry(8,8,1),new T.MeshBasicMaterial({color:0xabcdef}));wall.position.z=5;scene.add(wall);
  const occluded=rig.bodyPixels(target,scene,renderer);
  rig.entryChecked=false;rig.tryEntryGlance('e6-glow-mesa',scene,renderer);const occludedTriggers=rig.entryGlance!==null;
  rig.entryChecked=false;rig.entryGlance=null;rig.tryEntryGlance('the-claim',scene,renderer);const undeclaredNoop=rig.entryGlance===null;
  const restored=target.material===original&&renderer.getRenderTarget()===null&&renderer.autoClear;
  target.geometry.dispose();target.material.dispose();wall.geometry.dispose();wall.material.dispose();renderer.dispose();
  return {visible,outside,occluded,alreadyVisibleNoop,outsideTriggers,occludedTriggers,undeclaredNoop,once,restored};
 });
 assert.ok(result.visible>0);assert.equal(result.outside,0);assert.equal(result.occluded,0);
 for(const k of ['alreadyVisibleNoop','outsideTriggers','occludedTriggers','undeclaredNoop','once','restored'])assert.equal(result[k],true,k);
 writeFileSync('artifacts/sol/map-art-campaign-2/run-8/entry-framing/visibility-proof.json',JSON.stringify(result,null,2)+'\n');
} finally {await browser.close();}
