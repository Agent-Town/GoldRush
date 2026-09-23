import {chromium} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const root='artifacts/sol/map-art-campaign-2',name='e9-old-canal',rows=[];
const browser=await chromium.launch({channel:'chromium'});
try {for(const arm of ['before','after']){
 const context=await browser.newContext();const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 if(arm==='before')await page.route('**/src/systems/CanalFlowPresentation.ts*',r=>r.fulfill({status:200,contentType:'text/javascript',body:readFileSync(`${root}/_raw/run-9/${name}-before/CanalFlowPresentation.js`)}));
 await page.goto('http://127.0.0.1:5303/?debug&contract=e9-old-canal&nowaves&nolevel&nopause');await page.waitForFunction(()=>window.__THREE_GAME_DIAGNOSTICS__?.canalChoices?.segments?.length===3);
 const proof=await page.evaluate(async()=>{
  const {CanalFlowPresentation}=await import('/src/systems/CanalFlowPresentation.ts');
  const data=structuredClone(window.__THREE_GAME_DIAGNOSTICS__.canalChoices),input=JSON.stringify(data);let offset=0;
  const sample=(x,z)=>x*.015+z*.023+offset,p=new CanalFlowPresentation(data,sample),ruins=p.group.children.filter(o=>o.name.startsWith('CanalDerelictBand'));
  const near=(a,b)=>Math.abs(a-b)<.00001,check=(v,m)=>{if(!v)throw Error(m)};
  p.resampleTerrain();const first=ruins.map(o=>[...o.geometry.attributes.position.array]);p.resampleTerrain();check(JSON.stringify(first)===JSON.stringify(ruins.map(o=>[...o.geometry.attributes.position.array])),'resampling drift');
  const levels=ruins.map(o=>o.position.y);offset=3;p.resampleTerrain();check(ruins.every((o,i)=>near(o.position.y-levels[i],3)),'terrain offset lost');
  const geometry=ruins.map(o=>{const pos=o.geometry.attributes.position;let low=Infinity,high=-Infinity;for(let i=0;i<pos.count;i++){const h=pos.getY(i)+o.position.y-sample(pos.getX(i)+o.position.x,pos.getZ(i)+o.position.z);low=Math.min(low,h);high=Math.max(high,h)}check(low>=.0149&&high<=.4751,'masonry floats or exceeds low rubble height');o.geometry.computeBoundingBox();const b=o.geometry.boundingBox,col=o.geometry.attributes.color;return {id:o.name,triangles:(o.geometry.index?.count??pos.count)/3,minAboveGround:low,maxAboveGround:high,opaque:!o.material.transparent&&o.material.opacity===1,position:[o.position.x,o.position.z],xzBounds:[b.min.x,b.max.x,b.min.z,b.max.z],colorCount:new Set(Array.from({length:col.count},(_,i)=>col.getX(i).toFixed(5))).size}});
  check(ruins.every(o=>o.visible),'initial ruins hidden');const choices=structuredClone(data);choices.choices.forEach((c,i)=>c.choice=['redig','demolish','undecided'][i]);p.sync(choices);
  const state=p.diagnostics;check(state.wetBands.length===1&&state.filledBands.length===1&&state.derelictBands.length===1,'choice diagnostics drift');
  for(const prefix of ['CanalDerelictBand','CanalWetBand','CanalFilledBand'])check(p.group.children.filter(o=>o.name.startsWith(prefix)&&o.visible).length===1,'choice visibility drift');
  check(JSON.stringify(data)===input,'input mutated');const resources=new Set();for(const o of p.group.children){resources.add(o.geometry);resources.add(o.material)}let disposed=0;resources.forEach(r=>r.addEventListener('dispose',()=>disposed++));p.dispose();check(disposed===resources.size&&p.group.children.length===0,'resource leak');
  return {geometry,state,inputUnchanged:true,resampleIdempotent:true,terrainShiftMeters:3,allFinalResourcesDisposed:disposed,groupCleared:true,childCountBeforeDispose:12};
 });assert.equal(errors.length,0);rows.push({arm,...proof,errors});await context.close();
}}finally{await browser.close()}
assert.deepEqual(rows[0].state,rows[1].state);for(let i=0;i<3;i++){const a=rows[0].geometry[i],b=rows[1].geometry[i];assert.deepEqual(a.position,b.position);assert.ok(a.xzBounds.every((v,j)=>j%2?b.xzBounds[j]<=v+.00001:b.xzBounds[j]>=v-.00001),'rubble exceeds old envelope');assert.ok(Math.abs(a.maxAboveGround-b.maxAboveGround)<.0001);assert.ok(b.colorCount>a.colorCount);assert.ok(b.triangles<3000)}
writeFileSync(`${root}/run-9/${name}/presentation-proof.json`,JSON.stringify({rows,bandCentersStatesAndLowEnvelopeUnchanged:true},null,2)+'\n');console.log('PAIRED PRESENTATION PROOF PASS');
