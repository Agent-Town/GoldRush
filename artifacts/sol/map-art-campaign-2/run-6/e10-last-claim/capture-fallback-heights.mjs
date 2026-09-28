import {chromium} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chromium'});
try{
 const page=await browser.newPage();await page.goto('http://127.0.0.1:5303/?debug&epoch=epoch-10-deepsky&contract=e10-last-claim&nowaves&nolevel&nopause&seed=map-art-campaign-2');
 await page.waitForFunction(()=>window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId==='e10-last-claim'&&document.querySelector('#game-canvas').dataset.terrain3dPilotState==='failed');
 const result=await page.evaluate(async()=>{
  const t=await import('/src/world/Terrain.ts');const heights=[],validation=[];
  for(let z=-64;z<=64;z++)for(let x=-64;x<=64;x++)heights.push(t.visualY(x,z));
  for(let z=-63.63;z<64;z+=1.37)for(let x=-63.71;x<64;x+=1.43)validation.push([x,z,t.visualY(x,z)]);
  return {contractId:window.__THREE_GAME_DIAGNOSTICS__.contract.activeId,renderSource:document.querySelector('#game-canvas').dataset.terrain3dPilotRenderSource,segments:128,boundsXZ:[-64,-64,64,64],order:'z outer, x inner, ascending 1 m grid',heights,validation};
 });assert.equal(result.renderSource,'painted');assert.equal(result.heights.length,16641);
 const base=JSON.parse(readFileSync('artifacts/sol/map-art-campaign-2/run-6/e10-last-claim/base.json','utf8'));
 result.provenance={base,seed:'map-art-campaign-2',terrainSourceSha256:createHash('sha256').update(readFileSync('src/world/Terrain.ts')).digest('hex'),method:'Read Terrain.visualY without a mounted GLB; production sampler unchanged.'};
 writeFileSync('assets/pilots/map-rebuild-spike/last-claim-fallback-height-grid.json',JSON.stringify(result)+'\n');
 console.log(JSON.stringify({samples:result.heights.length,validation:result.validation.length,min:Math.min(...result.heights),max:Math.max(...result.heights),base}));
}finally{await browser.close()}
