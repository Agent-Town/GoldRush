import {chromium} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chromium'});
try{
 const page=await browser.newPage();page.on('pageerror',e=>console.log('PAGE ERROR',e.message));page.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text())});
 await page.route('**/src/world/Terrain3dClaimPilot.ts*',async route=>{
  const response=await route.fetch();const live=await response.text();let body=readFileSync('artifacts/sol/map-art-campaign-2/run-7/e10-river/before-source/Terrain3dClaimPilot.js','utf8');
  const deps=new Map([...live.matchAll(/\/node_modules\/\.vite\/deps\/([^?"']+)\?v=[a-f0-9]+/g)].map(m=>[m[1],m[0]]));
  body=body.replace(/\/node_modules\/\.vite\/deps\/([^?"']+)\?v=[a-f0-9]+/g,(url,file)=>deps.get(file)??url);
  // Preserve singleton identity for unchanged source imports after Vite HMR.
  const localImports=new Map([...live.matchAll(/\/src\/[^"'\s?]+(?:\?t=\d+)?/g)].map(m=>[m[0].split('?')[0],m[0]]));
  body=body.replace(/\/src\/[^"'\s?]+(?:\?t=\d+)?/g,url=>localImports.get(url.split('?')[0])??url);
  body=body.replace('function installTerrain3dClaimPilot(host) {','function installTerrain3dClaimPilot(host) {window.__RIVER_TERRAIN__=Terrain;');
  await route.fulfill({response,body});
 });
 await page.goto('http://127.0.0.1:5303/?debug&epoch=epoch-10-deepsky&contract=e10-river&nowaves&nolevel&nopause&seed=map-art-campaign-2');
 await page.waitForFunction(()=>window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId==='e10-river'&&document.querySelector('#game-canvas').dataset.terrain3dPilotState==='failed');
 const result=await page.evaluate(async()=>{
  const t=window.__RIVER_TERRAIN__;const heights=[],validation=[];
  for(let z=-64;z<=64;z++)for(let x=-64;x<=64;x++)heights.push(t.visualY(x,z));
  for(let z=-63.63;z<64;z+=1.37)for(let x=-63.71;x<64;x+=1.43)validation.push([x,z,t.visualY(x,z)]);
  return {contractId:window.__THREE_GAME_DIAGNOSTICS__.contract.activeId,renderSource:document.querySelector('#game-canvas').dataset.terrain3dPilotRenderSource,segments:128,boundsXZ:[-64,-64,64,64],order:'z outer, x inner, ascending 1 m grid',heights,validation};
 });assert.equal(result.renderSource,'painted');assert.equal(result.heights.length,16641);
 const base=JSON.parse(readFileSync('artifacts/sol/map-art-campaign-2/run-7/e10-river/base.json','utf8'));
 result.provenance={base,seed:'map-art-campaign-2',terrainSourceSha256:createHash('sha256').update(readFileSync('src/world/Terrain.ts')).digest('hex'),method:'Read the actual installer-imported Terrain.visualY from frozen before-source, without a mounted GLB; production sampler unchanged. A bare dynamic import can create a different Vite timestamp module instance and is prohibited here.'};
 writeFileSync('assets/pilots/map-rebuild-spike/river-fallback-height-grid.json',JSON.stringify(result)+'\n');
 console.log(JSON.stringify({samples:result.heights.length,validation:result.validation.length,min:Math.min(...result.heights),max:Math.max(...result.heights),base}));
}finally{await browser.close()}
