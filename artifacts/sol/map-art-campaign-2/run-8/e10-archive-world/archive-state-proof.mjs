import {chromium} from '@playwright/test';
import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const out='artifacts/sol/map-art-campaign-2/run-8/e10-archive-world',browser=await chromium.launch({channel:'chromium'});
try{
 const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.route('**/src/world/Terrain3dClaimPilot.ts*',async route=>{
  const response=await route.fetch();let body=await response.text();
  assert.equal(body.split('const zones = readState?.()?.zones ?? [];').length,2);
  body=body.replace('const zones = readState?.()?.zones ?? [];','const originalRead = readState; window.__ARCHIVE_READ__ = originalRead; readState = () => { const state = window.__ARCHIVE_VISUAL_STATE__ ?? originalRead?.(); return window.__ARCHIVE_POOLS_DISABLED__ ? { ...state, restoredWingIds: [] } : state; }; const zones = readState?.()?.zones ?? [];');
  body=body.replaceAll('installArchiveRestoration(nextTerrain, host.archiveRestoration)', 'installArchiveRestoration(nextTerrain, () => window.__ARCHIVE_VISUAL_STATE__ ?? host.archiveRestoration())').replaceAll('installArchiveRestoration(model, host.archiveRestoration)', 'installArchiveRestoration(model, () => window.__ARCHIVE_VISUAL_STATE__ ?? host.archiveRestoration())');
  body=body.replace('lightArchiveFacade(model, host.archiveRestoration)', 'lightArchiveFacade(model, () => window.__ARCHIVE_POOLS_DISABLED__ ? {...(window.__ARCHIVE_VISUAL_STATE__ ?? host.archiveRestoration()), restoredWingIds:[]} : window.__ARCHIVE_VISUAL_STATE__ ?? host.archiveRestoration())');
  body+='\nwindow.__ARCHIVE_TEST__={apply:clarifyArchiveTerraces,facade:lightArchiveFacade,T:THREE};';
  body=body.replace('skirt = nextSkirt;','skirt = nextSkirt;window.__ARCHIVE_SURFACES__={terrain:nextTerrain,skirt:nextSkirt};');await route.fulfill({response,body});
 });
 await page.goto('http://127.0.0.1:5303/?debug&epoch=epoch-10-deepsky&contract=e10-archive-world&nowaves&nolevel&nopause&tier=full&seed=map-art-campaign-2');
 await page.waitForFunction(()=>document.querySelector('#game-canvas')?.dataset.terrain3dPilotLandmarkLoadState==='mounted');
 const begin=page.getByTestId('contract-briefing-dismiss');if(await begin.isVisible())await begin.click();
 await page.evaluate(()=>{window.__GR_TEST__.setManualSim(true);window.__GR_GUI__?.hide();window.__GR_TEST__.teleport(-28,-1)});await page.waitForTimeout(1000);
 const proof=await page.evaluate(async()=>{
  const {T,apply,facade}=window.__ARCHIVE_TEST__,source=structuredClone(window.__ARCHIVE_READ__()),original=JSON.stringify(source);let state=source;
  const mesh=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshStandardMaterial());let callbackCount=0;mesh.onBeforeRender=()=>callbackCount++;apply(mesh,()=>state);
  const shader={vertexShader:T.ShaderLib.standard.vertexShader,fragmentShader:T.ShaderLib.standard.fragmentShader,uniforms:T.UniformsUtils.clone(T.ShaderLib.standard.uniforms)};mesh.material.onBeforeCompile(shader,{});
  const facadeMesh=new T.Mesh(new T.BoxGeometry(1,4,1),new T.MeshStandardMaterial());const zone=source.zones[0];facadeMesh.position.set((zone.minX+zone.maxX)/2,2,(zone.minZ+zone.maxZ)/2);facadeMesh.updateMatrixWorld();let facadeCallbackCount=0;facadeMesh.onBeforeRender=()=>facadeCallbackCount++;facade(facadeMesh,()=>state);
  const facadeShader={vertexShader:T.ShaderLib.standard.vertexShader,fragmentShader:T.ShaderLib.standard.fragmentShader,uniforms:T.UniformsUtils.clone(T.ShaderLib.standard.uniforms)};facadeMesh.material.onBeforeCompile(facadeShader,{});const facadeSamples=[];
  const samples=[];for(const ids of [[],[source.zones[0].id],source.zones.map(z=>z.id),[]]){state={zones:source.zones,restoredWingIds:ids};mesh.onBeforeRender();facadeMesh.onBeforeRender();facadeSamples.push(facadeShader.uniforms.archiveFacadeRestored.value);samples.push({ids,values:[...shader.uniforms.archiveFloorRestored.value]})}
  let disposed=0;mesh.geometry.addEventListener('dispose',()=>disposed++);mesh.material.addEventListener('dispose',()=>disposed++);mesh.geometry.dispose();mesh.material.dispose();
  facadeMesh.geometry.dispose();facadeMesh.material.dispose();
  const {terrain,skirt}=window.__ARCHIVE_SURFACES__,pos=skirt.geometry.attributes.position,t=await import('/src/world/Terrain.ts'),gaps=[];for(let i=0;i<128;i++)gaps.push(Math.abs(pos.getY(i)-t.visualY(pos.getX(i),pos.getZ(i))));
  return {facadeSamples,facadeCallbackCount,facadeHasEarnedMultiplier:facadeShader.fragmentShader.includes('archiveFacadeWash * archiveFacadeRestored'),sourceState:source,inputUnchanged:original===JSON.stringify(source),samples,callbackCount,disposed,shaderHasEarnedMultiplier:shader.fragmentShader.includes('archivePool * archiveFloorRestored[i]'),shaderHasNoConstantPool:!shader.fragmentShader.includes('archivePool +'),continuationTriangles:skirt.geometry.index.count/3,maximumJoinGap:Math.max(...gaps),sceneFog:skirt.material.fog,depthWrite:skirt.material.depthWrite,actualArchive:window.__THREE_GAME_DIAGNOSTICS__.archive};
 });
 assert.deepEqual(proof.facadeSamples,[0,1,1,0]);assert.equal(proof.facadeCallbackCount,4);assert.equal(proof.facadeHasEarnedMultiplier,true);
 assert.deepEqual(proof.samples.map(s=>s.values),[[0,0,0],[1,0,0],[1,1,1],[0,0,0]]);assert.ok(proof.inputUnchanged&&proof.shaderHasEarnedMultiplier&&proof.shaderHasNoConstantPool);assert.equal(proof.callbackCount,4);assert.equal(proof.disposed,2);assert.ok(proof.maximumJoinGap<1e-5);assert.equal(proof.sceneFog,true);
 for(const [name,count,disabled] of [['unrestored',0,false],['west-restored',1,false],['all-restored',3,false],['restored-without-pool',1,true]]){
  await page.evaluate(({count,disabled})=>{const s=structuredClone(window.__ARCHIVE_READ__());s.restoredWingIds=s.zones.slice(0,count).map(z=>z.id);window.__ARCHIVE_VISUAL_STATE__=s;window.__ARCHIVE_POOLS_DISABLED__=disabled},{count,disabled});await page.waitForTimeout(300);await page.screenshot({path:`${out}/staged-paint-${name}-1280.png`});
 }
 assert.deepEqual(errors,[]);proof.errors=errors;proof.stagedPaintOnly=true;writeFileSync(`${out}/archive-state-proof.json`,JSON.stringify(proof,null,2)+'\n');console.log('ARCHIVE PAINT PROOF PASS',proof.continuationTriangles,proof.maximumJoinGap);
}finally{await browser.close()}
