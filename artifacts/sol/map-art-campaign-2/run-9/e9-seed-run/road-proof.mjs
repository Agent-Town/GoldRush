// Compare the real frozen/live presentation owners, not duplicated route fixtures.
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const out='artifacts/sol/map-art-campaign-2/run-9/e9-seed-run',raw='artifacts/sol/map-art-campaign-2/_raw/run-9/e9-seed-run-before';
const browser=await chromium.launch({channel:'chromium'}),rows=[];
try{for(const arm of ['before','after']){
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 if(arm==='before')await page.route('**/src/systems/SeedCaravanPresentation.ts*',async route=>{
  const response=await route.fetch(),live=await response.text(),deps=new Map([...live.matchAll(/\/node_modules\/\.vite\/deps\/([^?"']+)\?v=[a-f0-9]+/g)].map(m=>[m[1],m[0]]));
  const body=readFileSync(raw+'/SeedCaravanPresentation.js','utf8').replace(/\/node_modules\/\.vite\/deps\/([^?"']+)\?v=[a-f0-9]+/g,(url,file)=>deps.get(file)??url);await route.fulfill({response,body});
 });
 await page.goto('http://127.0.0.1:5303/?debug&contract=e9-seed-run&epoch=epoch-9-redfields&nowaves&nolevel&nopause');
 await page.waitForFunction(()=>window.__THREE_GAME_DIAGNOSTICS__?.seedCaravan?.route?.length>1);
 const proof=await page.evaluate(async()=>{
  const {SeedCaravanPresentation}=await import('/src/systems/SeedCaravanPresentation.ts');
  const data=structuredClone(window.__THREE_GAME_DIAGNOSTICS__.seedCaravan),input=JSON.stringify(data);let offset=0;const ground=(x,z)=>x*.01+z*.02+offset;
  const p=new SeedCaravanPresentation(data,ground,'#82916e');const road=p.group.getObjectByName('SeedCaravanRoad');
  const read=()=>road.children.map(m=>{m.geometry.computeBoundingBox();const b=m.geometry.boundingBox;return {position:m.position.toArray(),rotation:m.rotation.toArray(),width:b.max.x-b.min.x,length:b.max.y-b.min.y,opacity:m.material.opacity,triangles:m.geometry.index.count/3,vertices:[...m.geometry.attributes.position.array]}});
  const before=read(),diagnostics=p.diagnostics;offset=3;p.resampleTerrain();const shifted=read();
  if(!shifted.every((r,i)=>Math.abs(r.position[1]-before[i].position[1]-3)<1e-6))throw Error('ruts did not follow ground');
  if(!shifted.every((r,i)=>JSON.stringify(r.vertices)===JSON.stringify(before[i].vertices)))throw Error('resampling changed rut shapes');
  p.resampleTerrain();if(JSON.stringify(shifted)!==JSON.stringify(read()))throw Error('resampling drift');
  if(JSON.stringify(data)!==input)throw Error('input mutated');
  const resources=new Set();p.group.traverse(o=>{if(o.isMesh&&o.geometry)resources.add(o.geometry);if(o.material){resources.add(o.material);if(o.material.map)resources.add(o.material.map)}});let disposed=0;resources.forEach(r=>r.addEventListener('dispose',()=>disposed++));p.dispose();if(disposed!==resources.size)throw Error('resource leak');
  return {diagnostics,route:data.route,ruts:before,terrainShiftMeters:3,resampleIdempotent:true,inputUnchanged:true,disposedResources:disposed};
 });assert.deepEqual(errors,[]);rows.push({arm,...proof,errors});await page.close();
}}finally{await browser.close()}
const [before,after]=rows;assert.equal(before.diagnostics.roadRuts,after.diagnostics.roadRuts);assert.equal(before.diagnostics.waypointRings,after.diagnostics.waypointRings);assert.deepEqual(before.route,after.route);
for(let i=0;i<before.ruts.length;i++){assert.deepEqual(before.ruts[i].position,after.ruts[i].position);assert.deepEqual(before.ruts[i].rotation,after.ruts[i].rotation);assert.ok(after.ruts[i].width<=before.ruts[i].width);assert.ok(after.ruts[i].length<=before.ruts[i].length)}
writeFileSync(out+'/road-proof.json',JSON.stringify({sameRoutePositionsRotationsCount:true,rows},null,2)+'\n');console.log('ROAD PROOF',after.diagnostics.roadRuts,'same stations, five worn lengths, idempotent terrain following, no leaks/errors');
