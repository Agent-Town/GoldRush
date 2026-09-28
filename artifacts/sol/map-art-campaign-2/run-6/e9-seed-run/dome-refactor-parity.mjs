// Compile both real paint functions against the same Three material and route.
import { readFileSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import ts from 'typescript';
import * as THREE from 'three';
const out='artifacts/sol/map-art-campaign-2/run-6/e9-seed-run';
const before=readFileSync('artifacts/sol/map-art-campaign-2/_raw/run-6/e9-seed-run-before/Terrain3dClaimPilot.ts','utf8');
const after=readFileSync('src/world/Terrain3dClaimPilot.ts','utf8');
const route=JSON.parse(readFileSync('assets/pilots/map-rebuild-spike/dome-basin-terrain-contract.json','utf8')).maskTruth.canalRoute;
function compile(source,name,arg){
 const start=source.indexOf(`function ${name}(`),end=source.indexOf('/** Separate existing shelves',start);
 assert.ok(start>=0&&end>start);
 const js=ts.transpile(source.slice(start,end),{target:ts.ScriptTarget.ES2022});
 const context={THREE,isMapBeautyDisabled:()=>false};vm.createContext(context);vm.runInContext(js,context);
 const material=new THREE.MeshStandardMaterial({map:new THREE.Texture()});
 context[name]({traverse:fn=>fn({isMesh:true,material})},arg);
 const shader={uniforms:{},vertexShader:'#include <common>\n#include <begin_vertex>',fragmentShader:'#include <common>\n#include <map_fragment>'};
 material.onBeforeCompile(shader,{});return shader;
}
const a=compile(before,'clarifyDomeCanal',route),b=compile(after,'clarifyRedFieldsRoute',route.points);
for(const k of ['vertexShader','fragmentShader'])assert.equal(a[k].replace(/\s+/g,''),b[k].replace(/\s+/g,''),k);
for(const k of Object.keys(a.uniforms))assert.equal(JSON.stringify(a.uniforms[k]),JSON.stringify(b.uniforms[k]),k);
writeFileSync(`${out}/dome-refactor-parity.json`,JSON.stringify({realSourceFunctions:true,samePublishedRoute:true,vertexShaderIdenticalIgnoringWhitespace:true,fragmentShaderIdenticalIgnoringWhitespace:true,allUsedUniformsIdentical:true,unusedAddedUniforms:Object.keys(b.uniforms).filter(k=>!(k in a.uniforms)),result:'Dome Basin appearance unchanged by shared route-paint refactor'},null,2)+'\n');
console.log('Dome Basin generated shader and used uniforms are unchanged');
