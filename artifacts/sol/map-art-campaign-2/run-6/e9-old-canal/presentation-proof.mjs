import {chromium} from '@playwright/test';
import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chromium'});
try{
 const page=await browser.newPage();await page.goto('http://127.0.0.1:5303/?debug&contract=e9-old-canal&nowaves&nolevel&nopause');
 await page.waitForFunction(()=>window.__THREE_GAME_DIAGNOSTICS__?.canalChoices?.segments?.length===3);
 const proof=await page.evaluate(async()=>{
  const {CanalFlowPresentation}=await import('/src/systems/CanalFlowPresentation.ts');
  const data=structuredClone(window.__THREE_GAME_DIAGNOSTICS__.canalChoices),input=JSON.stringify(data);let offset=0;
  const sample=(x,z)=>x*.015+z*.023+offset,p=new CanalFlowPresentation(data,sample),ruins=p.group.children.filter(o=>o.name.startsWith('CanalDerelictBand'));
  const near=(a,b)=>Math.abs(a-b)<.00001;
  const assert=(value,msg)=>{if(!value)throw Error(msg)};
  p.resampleTerrain();const first=ruins.map(o=>[...o.geometry.attributes.position.array]);
  p.resampleTerrain();assert(JSON.stringify(first)===JSON.stringify(ruins.map(o=>[...o.geometry.attributes.position.array])),'resampling drift');
  const levels=ruins.map(o=>o.position.y);offset=3;p.resampleTerrain();assert(ruins.every((o,i)=>near(o.position.y-levels[i],3)),'terrain offset lost');
  const geometry=ruins.map(o=>{const pos=o.geometry.attributes.position;let low=Infinity,high=-Infinity;for(let i=0;i<pos.count;i++){const h=pos.getY(i)+o.position.y-sample(pos.getX(i)+o.position.x,pos.getZ(i)+o.position.z);low=Math.min(low,h);high=Math.max(high,h)}assert(low>=.0149&&high<=.4751,'masonry floats or exceeds low rubble height');return {id:o.name,triangles:o.geometry.index.count/3,minAboveGround:low,maxAboveGround:high,opacity:o.material.opacity,transparent:o.material.transparent}});
  assert(ruins.every(o=>o.visible),'initial ruins hidden');const choices=structuredClone(data);choices.choices.forEach((c,i)=>c.choice=['redig','demolish','undecided'][i]);p.sync(choices);
  const state=p.diagnostics;assert(state.wetBands.length===1&&state.filledBands.length===1&&state.derelictBands.length===1,'choice diagnostics drift');
  assert(p.group.children.filter(o=>o.name.startsWith('CanalDerelictBand')&&o.visible).length===1,'ruins persist after choice');
  assert(p.group.children.filter(o=>o.name.startsWith('CanalWetBand')&&o.visible).length===1,'water visibility changed');
  assert(p.group.children.filter(o=>o.name.startsWith('CanalFilledBand')&&o.visible).length===1,'backfill visibility changed');
  assert(JSON.stringify(data)===input,'input state mutated');
  const resources=new Set();for(const o of p.group.children){resources.add(o.geometry);resources.add(o.material)}let disposed=0;resources.forEach(r=>r.addEventListener('dispose',()=>disposed++));p.dispose();assert(disposed===resources.size&&p.group.children.length===0,'resource leak');
  return {geometry,state,inputUnchanged:true,resampleIdempotent:true,terrainShiftMeters:3,allFinalResourcesDisposed:disposed,groupCleared:true,childCountBeforeDispose:12};
 });
 assert.ok(proof.inputUnchanged);writeFileSync('artifacts/sol/map-art-campaign-2/run-6/e9-old-canal/presentation-proof.json',JSON.stringify(proof,null,2)+'\n');console.log(JSON.stringify(proof));
}finally{await browser.close()}
