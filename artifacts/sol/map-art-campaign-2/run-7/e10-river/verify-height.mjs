import {chromium} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const out='artifacts/sol/map-art-campaign-2/run-7/e10-river',grid=JSON.parse(readFileSync('assets/pilots/map-rebuild-spike/river-fallback-height-grid.json'));
const browser=await chromium.launch({channel:'chromium'});
try{
 const page=await browser.newPage();
 await page.route('**/src/world/Terrain3dClaimPilot.ts*',async route=>{
  const response=await route.fetch();const body=(await response.text()).replace('function installTerrain3dClaimPilot(host) {','function installTerrain3dClaimPilot(host) {window.__RIVER_TERRAIN__=Terrain;');
  await route.fulfill({response,body});
 });
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.goto('http://127.0.0.1:5303/?debug&epoch=epoch-10-deepsky&contract=e10-river&nowaves&nolevel&nopause&seed=map-art-campaign-2');
 await page.waitForFunction(()=>document.querySelector('#game-canvas')?.dataset.terrain3dPilotLandmarkLoadState==='mounted');
 const result=await page.evaluate(async grid=>{
  const t=window.__RIVER_TERRAIN__;const vertexErrors=[],offGridErrors=[];
  for(let z=-64;z<=64;z++)for(let x=-64;x<=64;x++)vertexErrors.push(Math.abs(t.visualY(x,z)-grid.heights[(z+64)*129+x+64]));
  for(const [x,z,h] of grid.validation)offGridErrors.push(Math.abs(t.visualY(x,z)-h));
  const stats=a=>{a.sort((a,b)=>a-b);return {samples:a.length,max:a.at(-1),p95:a[Math.floor(a.length*.95)],mean:a.reduce((a,b)=>a+b)/a.length}};
  return {vertices:stats(vertexErrors),offGrid:stats(offGridErrors),dataset:{...document.querySelector('#game-canvas').dataset}};
 },grid);
 console.log(JSON.stringify({vertices:result.vertices,offGrid:result.offGrid}));assert.ok(result.vertices.max<1e-6);assert.deepEqual(errors,[]);assert.ok(result.offGrid.max>1e-8,'positive control: drawn Float32 triangle interpolation differs off grid');result.errors=errors;result.method='Compare existing fallback visual height samples to mounted regular-grid surface. Planar collision and sampler source unchanged; off-grid error is sculpt interpolation only.';
 writeFileSync(out+'/height-proof.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({vertices:result.vertices,offGrid:result.offGrid,errors}));
}finally{await browser.close()}
