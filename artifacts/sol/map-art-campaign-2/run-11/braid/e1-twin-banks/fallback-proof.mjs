import {chromium} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const out='artifacts/sol/map-art-campaign-2/run-11/braid/e1-twin-banks';
const before=readFileSync(`${out}/baseline-Terrain.js`,'utf8');
let threeUrl=before.match(/from "([^"]+three.js[^\"]*)"/)[1];
// Rebase only Vite's optimized-dependency cache URL after a server restart; baseline source stays intact.
const dependencyVersion=(await(await fetch('http://127.0.0.1:5188/src/world/Terrain.ts')).text()).match(/three\.js(\?v=[^"]+)/)[1];
const transport=source=>source.replace(/(\/node_modules\/\.vite\/deps\/[^"\s?]+)\?v=[a-f0-9]+/g,'$1'+dependencyVersion);
threeUrl=threeUrl.replace(/\?v=[a-f0-9]+/,dependencyVersion);
const browser=await chromium.launch({channel:'chromium'}),rows=process.argv[2]?JSON.parse(readFileSync(`${out}/fallback-proof.json`,'utf8')).filter(r=>r.id!==process.argv[2]):[];
try{for(const id of ['e1-twin-banks'])for(const width of [1280,390]){
 if(process.argv[2]&&id!==process.argv[2])continue;
 const hashes=[];
 for(const arm of ['before','after']){
  const page=await browser.newPage({viewport:{width,height:width===390?844:800},deviceScaleFactor:1});
  let routed=0;
  if(arm==='before')await page.route('**/src/world/Terrain.ts*',route=>{routed++;return route.fulfill({body:transport(before),contentType:'application/javascript'})});
  await page.goto(`http://127.0.0.1:5188/?debug&contract=${id}&nowaves&nolevel&nokill&tier=full`);
  await page.waitForFunction(()=>window.__GR_TEST__);
  const geometry=await page.evaluate(async ({threeUrl,width})=>{
   const THREE=await import(threeUrl), T=await import('/src/world/Terrain.ts');
   window.__GR_TEST__.setManualSim(true);
   const meshes=T.hasRiverWater()?[T.createRiverPlaceholder(),...T.fordRanges().map(r=>T.createFordPlaceholder(r))]:[];
   const geometry=meshes.map(m=>({position:Array.from(m.geometry.attributes.position.array),uv:Array.from(m.geometry.attributes.uv.array),index:Array.from(m.geometry.index.array),key:m.material.customProgramCacheKey(),transform:m.position.toArray()}));
   const scene=new THREE.Scene();scene.background=new THREE.Color('#b9a078');scene.add(new THREE.AmbientLight(0xffffff,2));for(const mesh of meshes)scene.add(mesh);
   const height=width===390?844:800, camera=new THREE.OrthographicCamera(-36,36,36*height/width,-36*height/width,.1,200);camera.position.set(0,80,0);camera.up.set(0,0,-1);camera.lookAt(0,0,0);
   const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(width,height);renderer.domElement.id='hm-proof';renderer.domElement.style.cssText='position:fixed;inset:0;z-index:999999';document.body.appendChild(renderer.domElement);
   window.__HM_PROOF__={renderer,scene,camera,meshes};return geometry;
  },{threeUrl,width});
  await page.waitForTimeout(1000);
  await page.evaluate(()=>{const {renderer,scene,camera}=window.__HM_PROOF__;renderer.render(scene,camera)});
  const png=await page.locator('#hm-proof').screenshot({path:`${out}/fallback-${id}-${width}-${arm}.png`});
  hashes.push({arm,pixels:createHash('sha256').update(png).digest('hex'),geometry:createHash('sha256').update(JSON.stringify(geometry)).digest('hex'),routed});
  if(arm==='before')assert.ok(routed>0);
  await page.close();
 }
 const row={id,width,hashes,identical:hashes[0].pixels===hashes[1].pixels&&hashes[0].geometry===hashes[1].geometry};rows.push(row);writeFileSync(`${out}/fallback-proof.json`,JSON.stringify(rows,null,2));console.log(JSON.stringify(row));assert.ok(!row.identical);
}}finally{await browser.close()}
