import {chromium} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const out='artifacts/sol/map-art-campaign-2/run-11/braid/e1-twin-banks';
// Rebase only Vite's optimized-dependency cache URL after a server restart; baseline source stays intact.
const dependencyVersion=(await(await fetch('http://127.0.0.1:5188/src/world/Terrain.ts')).text()).match(/three\.js(\?v=[^"]+)/)[1];
const transport=source=>source.replace(/(\/node_modules\/\.vite\/deps\/[^"\s?]+)\?v=[a-f0-9]+/g,'$1'+dependencyVersion);
const browser=await chromium.launch({channel:'chromium'}),rows=[];
try{for(const width of [1280,390])for(const arm of ['before','after']){
 const page=await browser.newPage({viewport:{width,height:width===390?844:800},deviceScaleFactor:1});
 if(arm==='before')for(const name of ['Terrain','Terrain3dClaimPilot'])await page.route(`**/src/world/${name}.ts*`,route=>route.fulfill({body:transport(readFileSync(`${out}/baseline-${name}.js`,'utf8')),contentType:'application/javascript'}));
 const errors=[];page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5188/?debug&contract=e1-twin-banks&seed=hm06-pool&nowaves&nolevel&nokill&nopause&tier=full');
 await page.waitForFunction(()=>window.__GR_TEST__&&document.querySelector('canvas')?.dataset.terrain3dPilotLandmarkLoadState==='mounted',undefined,{timeout:20000}).catch(async e=>{console.log(JSON.stringify({arm,width,errors,state:await page.evaluate(()=>({text:document.body.innerText,dataset:{...document.querySelector('canvas')?.dataset}}))}));throw e});
 const begin=page.getByTestId('contract-briefing-dismiss');if(await begin.isVisible())await begin.click();
 await page.waitForFunction(()=>window.__THREE_GAME_DIAGNOSTICS__.timeAlive>=6);
 await page.evaluate(()=>{window.__GR_TEST__.setBalance('camera.lag',0.012);window.__GR_TEST__.teleport(-29,6);window.__GR_GUI__?.hide()});await page.waitForTimeout(1800);
 await page.screenshot({path:`${out}/${arm}-source-pool-${width}.png`});
 const state=await page.evaluate(()=>({dataset:{...document.querySelector('canvas').dataset},renderer:window.__GR_TEST__.renderCensus().renderer,points:[[-29,1.6],[-29,-1.6],[-28,0]].map(([x,z])=>({x,z,screen:window.__GR_TEST__.screenPoint(x,z,.038),sample:window.__GR_TEST__.terrainSample(x,z),height:window.__GR_TEST__.terrainVisualY(x,z)}))}));
 rows.push({arm,width,errors,state});writeFileSync(`${out}/source-pool-proof.json`,JSON.stringify(rows,null,2));assert.deepEqual(errors,[]);assert.ok(state.points.every(p=>p.screen.inView));await page.close();
}}finally{await browser.close()}
