import {readFileSync,writeFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import assert from 'node:assert/strict';
import * as THREE from 'three';
const root='artifacts/sol/map-art-campaign-2';
function load(path){const s=readFileSync(path,'utf8'),part=s.slice(s.indexOf('function clarifyRedFieldsRoute('),s.indexOf('/** Picnic owns'));assert.ok(part);return new Function('THREE','isMapBeautyDisabled',stripTypeScriptTypes(part)+'\nreturn clarifyRedFieldsRoute;')(THREE,()=>false)}
const before=load(root+'/_raw/run-9/e9-old-canal-before/Terrain3dClaimPilot.ts'),after=load('src/world/Terrain3dClaimPilot.ts');
function shader(fn,points,zones=[],banks=false){const geometry=new THREE.PlaneGeometry(1,1),texture=new THREE.Texture(),material=new THREE.MeshStandardMaterial({map:texture}),model=new THREE.Mesh(geometry,material);fn(model,points,zones,banks);const s={uniforms:{},vertexShader:'#include <common>\n#include <begin_vertex>',fragmentShader:'#include <common>\n#include <map_fragment>'};material.onBeforeCompile(s,null);const value=JSON.parse(JSON.stringify({...s,cacheKey:material.customProgramCacheKey()}));geometry.dispose();texture.dispose();material.dispose();return value}
const contract=id=>JSON.parse(readFileSync(`assets/pilots/map-rebuild-spike/${id}-terrain-contract.json`,'utf8')).maskTruth;
const rows=[];
for(const id of ['dome-basin','seed-run','old-canal']){const c=contract(id),points=id==='seed-run'?c.caravanRoute:(c.canalRoute??c.inheritedCanalRoute).points,zones=id==='seed-run'?c.permanentGreenWaypointZones:[],a=shader(before,points,zones),b=shader(after,points,zones,id==='old-canal');if(id==='old-canal'){assert.equal(a.vertexShader,b.vertexShader);assert.deepEqual(a.uniforms,b.uniforms);assert.notEqual(a.fragmentShader,b.fragmentShader);assert.notEqual(a.cacheKey,b.cacheKey)}else assert.deepEqual(a,b);rows.push({id,vertexAndRouteUniformsExact:true,unchangedShaderAndCache:id!=='old-canal',before:a,after:b})}
writeFileSync(root+'/run-9/e9-old-canal/shader-proof.json',JSON.stringify({rows,bedTransitionMeters:{before:.8,after:.25},outerShoulderTransitionMeters:{before:1,after:.45},newTexturesOrGeometry:false},null,2)+'\n');console.log('SHADER ISOLATION PASS');
