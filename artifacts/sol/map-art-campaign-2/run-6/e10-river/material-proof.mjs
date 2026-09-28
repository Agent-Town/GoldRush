// Evidence-only instrumentation: exercise the actual raw-route materials and cleanup.
import {chromium} from '@playwright/test';
import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const out='artifacts/sol/map-art-campaign-2/run-6/e10-river',browser=await chromium.launch({channel:'chromium'});
try{
 const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.route('**/src/world/Terrain3dClaimPilot.ts*',async route=>{
  const response=await route.fetch();let body=await response.text();
  assert.equal(body.split('return paintRiverReturn(host);').length,2);
  body=body.replace('return paintRiverReturn(host);','window.__RIVER_HOST__=host;window.__RIVER_RESET__=paintRiverReturn(host);return window.__RIVER_RESET__;');
  body+='\nwindow.__RIVER_TEST__={apply:paintRiverReturn,T:THREE};';await route.fulfill({response,body});
 });
 await page.goto('http://127.0.0.1:5303/?debug&epoch=epoch-10-deepsky&contract=e10-river&nowaves&nolevel&nopause&tier=full&seed=map-art-campaign-2');
 await page.waitForFunction(()=>window.__RIVER_HOST__&&window.__GR_TEST__);
 if(await page.getByTestId('contract-briefing-dismiss').isVisible())await page.getByTestId('contract-briefing-dismiss').click();
 await page.evaluate(()=>window.__GR_TEST__.setManualSim(true));await page.waitForTimeout(800);
 const proof=await page.evaluate(()=>{
  const {T,apply}=window.__RIVER_TEST__,host=window.__RIVER_HOST__,meshes=[],materials=new Set();
  host.scene.traverse(n=>{if(n.isMesh)for(const m of Array.isArray(n.material)?n.material:[n.material])if(m.userData.terrainUniforms||m.userData.waterUniforms){meshes.push(n);materials.add(m)}});
  const ms=[...materials];window.__RIVER_RESET__();
  const originals=ms.map(m=>({m,compile:m.onBeforeCompile,key:m.customProgramCacheKey,uniforms:m.userData.waterUniforms??m.userData.terrainUniforms}));
  const snapshot=()=>JSON.stringify({geometry:meshes.map(n=>({uuid:n.geometry.uuid,position:Array.from(n.geometry.attributes.position.array),index:n.geometry.index?Array.from(n.geometry.index.array):null,matrix:n.matrix.toArray(),visible:n.visible})),materials:ms.map(m=>({uuid:m.uuid,color:m.color.toArray(),emissive:m.emissive.toArray(),emissiveIntensity:m.emissiveIntensity,opacity:m.opacity,transparent:m.transparent,depthWrite:m.depthWrite,depthTest:m.depthTest,roughness:m.roughness,metalness:m.metalness,map:m.map?.uuid,uniforms:m.userData.waterUniforms??m.userData.terrainUniforms}))});
  const initial=snapshot(),cycles=[];
  for(let i=0;i<6;i++){
   const reset=apply(host),compiled=ms.map(m=>{const s={vertexShader:T.ShaderLib.standard.vertexShader,fragmentShader:T.ShaderLib.standard.fragmentShader,uniforms:T.UniformsUtils.clone(T.ShaderLib.standard.uniforms)};m.onBeforeCompile(s,{});return {water:!!m.userData.waterUniforms,waterInsertions:s.fragmentShader.split('vec3 returnWater =').length-1,bankInsertions:s.fragmentShader.split('uniform vec3 returnBankPigment;').length-1,cacheSuffixes:m.customProgramCacheKey().split('|raw-river-dawn-v1:').length-1,alphaRetained:!m.userData.waterUniforms||s.fragmentShader.includes('vec4 sampledDiffuseColor = vec4(waterColor, alpha);'),timeUniformIdentity:!m.userData.waterUniforms||s.uniforms.waterTime===m.userData.waterUniforms.time}});
   const unchanged=initial===snapshot(),uniformIdentity=originals.every(o=>(o.m.userData.waterUniforms??o.m.userData.terrainUniforms)===o.uniforms);reset();
   cycles.push({cycle:i,compiled,unchanged,uniformIdentity,callbacksRestored:originals.every(o=>o.m.onBeforeCompile===o.compile&&o.m.customProgramCacheKey===o.key),restoredSnapshot:initial===snapshot()});
  }
  const noOp=apply({...host,contractId:'the-claim'});noOp();
  const otherRouteUntouched=originals.every(o=>o.m.onBeforeCompile===o.compile&&o.m.customProgramCacheKey===o.key)&&initial===snapshot();
  return {meshCount:meshes.length,uniqueMaterials:ms.length,meshes:meshes.map(n=>({name:n.name,triangles:(n.geometry.index?.count??n.geometry.attributes.position.count)/3,material:n.material.uuid})),cycles,otherRouteUntouched,dataset:{...host.canvas.dataset},bounds:window.__THREE_GAME_DIAGNOSTICS__.contract};
 });
 assert.equal(proof.uniqueMaterials,3);assert.equal(proof.meshCount,4);
 for(const c of proof.cycles){assert.ok(c.unchanged&&c.uniformIdentity&&c.callbacksRestored&&c.restoredSnapshot);for(const s of c.compiled){assert.equal(s.cacheSuffixes,1);assert.equal(s.waterInsertions,s.water?1:0);assert.equal(s.bankInsertions,s.water?0:1);assert.ok(s.alphaRetained&&s.timeUniformIdentity)}}
 assert.ok(proof.otherRouteUntouched);assert.equal(proof.dataset.terrain3dPilotRenderSource,'painted');assert.equal(proof.dataset.terrain3dPilotLandmarkLoadState,'off');assert.deepEqual(errors,[]);
 proof.errors=errors;writeFileSync(`${out}/material-proof.json`,JSON.stringify(proof,null,2)+'\n');console.log('RIVER MATERIAL PROOF PASS',proof.meshCount,proof.uniqueMaterials,proof.cycles.length);
}finally{await browser.close()}
