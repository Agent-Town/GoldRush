import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
const browser=await chromium.launch({channel:'chromium'}),page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];
page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('pageerror',e=>errors.push(e.message));
try{
 await page.route('**/src/world/Terrain3dClaimPilot.ts*',async route=>{const response=await route.fetch();let body=await response.text();assert.ok(body.includes('preparePanoramaRocks'));body=body.replace('preparePanorama(nextPanorama);','preparePanorama(nextPanorama); window.__CANYON_SCENERY__=nextPanorama;');await route.fulfill({response,body})});
 await page.goto('http://127.0.0.1:5303/?debug&epoch=epoch-3-voltage&contract=e3-canyon-works&nowaves&nolevel&seed=map-art-campaign-2');
 await page.waitForFunction(()=>document.querySelector('#game-canvas')?.dataset.terrain3dPilotLandmarkLoadState==='mounted');
 const rows=await page.evaluate(()=>{const r=[];window.__CANYON_SCENERY__.traverse(mesh=>{if(!mesh.isMesh)return;const m=mesh.material;const shader={uniforms:{},vertexShader:'#include <common>\n#include <begin_vertex>\n#include <project_vertex>',fragmentShader:'#include <common>\n#include <emissivemap_fragment>\n#include <map_fragment>'};m.onBeforeCompile(shader,{});r.push({mesh:mesh.name,material:m.name,depthWrite:m.depthWrite,depthTest:m.depthTest,transparent:m.transparent,farPlaneOverride:shader.vertexShader.includes('gl_Position.z = gl_Position.w * 0.999999'),fog:m.fog,renderOrder:mesh.renderOrder,vertexColors:m.vertexColors,triangles:mesh.geometry.index.count/3})});return r});
 assert.equal(rows.length,3);
 for(const r of rows){assert.equal(r.depthTest,true);if(['CanyonCliffStone','CanyonApronEarth'].includes(r.material)){assert.equal(r.depthWrite,true);assert.equal(r.farPlaneOverride,false);assert.equal(r.transparent,false);assert.equal(r.renderOrder,0)}else {assert.equal(r.depthWrite,false);assert.equal(r.farPlaneOverride,true)}}
 assert.equal(rows.find(r=>r.material==='CanyonCliffStone').vertexColors,true);assert.deepEqual(errors,[]);
 writeFileSync('artifacts/sol/map-art-campaign-2/run-9/e3-canyon-works/runtime-depth.json',JSON.stringify({rows,errors,method:'Runtime-loaded meshes and material compilation callbacks; only the retained sky uses far-plane projection. The ordinary screenshots independently show geometry contact and layering.'},null,2)+'\n');console.log('CANYON DEPTH PASS');
}finally{await browser.close()}
