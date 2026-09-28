import {chromium} from '@playwright/test';
import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chromium'});
try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.route('**/src/world/Terrain3dClaimPilot.ts*',async route=>{
  const response=await route.fetch();let body=await response.text();
  assert.equal(body.split('skirt = nextSkirt;').length,2);
  body=body.replace('skirt = nextSkirt;','skirt = nextSkirt; window.__EMBER_SURFACES__={terrain:nextTerrain,skirt:nextSkirt,T:THREE};');
  await route.fulfill({response,body});
 });
 await page.goto('http://127.0.0.1:5303/?debug&epoch=epoch-10-deepsky&contract=e10-ember-shore&nowaves&nolevel&nopause&seed=map-art-campaign-2');
 await page.waitForFunction(()=>document.querySelector('#game-canvas')?.dataset.terrain3dPilotLandmarkLoadState==='mounted');
 const proof=await page.evaluate(async()=>{
  const {terrain,skirt,T}=window.__EMBER_SURFACES__,t=await import('/src/world/Terrain.ts');
  const material=o=>{let found;o.traverse(n=>{if(n.isMesh)found??=n.material});return found};
  const shaders=[terrain,skirt].map(o=>{const m=material(o),s={vertexShader:T.ShaderLib.standard.vertexShader,fragmentShader:T.ShaderLib.standard.fragmentShader,uniforms:T.UniformsUtils.clone(T.ShaderLib.standard.uniforms)};m.onBeforeCompile(s,{});return s});
  const blocks=shaders.map(s=>s.fragmentShader.slice(s.fragmentShader.indexOf('float emberWarm ='),s.fragmentShader.indexOf('float emberVein =')));
  const pos=skirt.geometry.getAttribute('position'),gaps=[];
  const tm=terrain.getObjectByProperty('isMesh',true),tp=tm.geometry.getAttribute('position'),tn=tm.geometry.getAttribute('normal'),sn=skirt.geometry.getAttribute('normal'),normals=new Map(),normalGaps=[];
  for(let i=0;i<tp.count;i++)normals.set(`${tp.getX(i).toFixed(3)},${tp.getZ(i).toFixed(3)}`,new T.Vector3().fromBufferAttribute(tn,i));
  for(let i=0;i<128;i++){const n=normals.get(`${pos.getX(i).toFixed(3)},${pos.getZ(i).toFixed(3)}`);if(!n)throw Error('missing source edge normal');normalGaps.push(n.distanceTo(new T.Vector3().fromBufferAttribute(sn,i)))}
  for(let i=0;i<128;i++){const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);gaps.push(Math.abs(y-t.visualY(x,z)))}
  return {sameWorldPigment:blocks[0]===blocks[1],bothWorldCoordinates:shaders.every(s=>s.vertexShader.includes('vEmberBasalt = (modelMatrix * vec4(position, 1.0)).xyz')),bothVeinRestriction:shaders.every(s=>s.fragmentShader.includes('emberWarm * emberPlayfield')),continuationKeepsBackdropDepth:shaders[1].vertexShader.includes('gl_Position.z = gl_Position.w * 0.99999;')&&material(skirt).depthWrite===false,continuationKeepsSceneFog:material(skirt).fog===true&&shaders[1].fragmentShader.includes('#include <fog_fragment>'),boundarySamples:gaps.length,maximumNormalVectorGap:Math.max(...normalGaps),maximumHeightGap:Math.max(...gaps),shaderPigment:blocks[0],dataset:{...document.querySelector('#game-canvas').dataset}};
 });
 for(const k of ['sameWorldPigment','bothWorldCoordinates','bothVeinRestriction','continuationKeepsBackdropDepth','continuationKeepsSceneFog'])assert.equal(proof[k],true,k);
 assert.ok(proof.maximumHeightGap<1e-5);assert.ok(proof.maximumNormalVectorGap<1e-5);assert.deepEqual(errors,[]);proof.errors=errors;
 writeFileSync('artifacts/sol/map-art-campaign-2/run-8/e10-ember-shore/continuity-proof.json',JSON.stringify(proof,null,2)+'\n');console.log('CONTINUITY PASS',proof.maximumHeightGap);
}finally{await browser.close()}
