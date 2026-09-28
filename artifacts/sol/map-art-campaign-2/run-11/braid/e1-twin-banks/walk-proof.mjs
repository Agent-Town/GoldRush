import {chromium} from '@playwright/test';
import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const out='artifacts/sol/map-art-campaign-2/run-11/braid/e1-twin-banks';
const browser=await chromium.launch({channel:'chromium'}),rows=[];
try{for(const width of [1280,390]){
 const page=await browser.newPage({viewport:{width,height:width===390?844:800},isMobile:width===390,hasTouch:width===390});
 const errors=[];page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5188/?debug&contract=e1-twin-banks&seed=hm06-walk&nowaves&nokill&nolevel&nopause');
 await page.waitForFunction(()=>window.__GR_TEST__&&document.querySelector('canvas')?.dataset.terrain3dPilotState==='ready');
 const begin=page.getByTestId('contract-briefing-dismiss');if(await begin.isVisible())await begin.click();
 for(const [label,x,z,key] of [['south-channel',0,-6,'ArrowDown'],['north-channel',0,6,'ArrowUp'],['west-ford',-16,-6,'ArrowDown'],['east-ford',16,-6,'ArrowDown']]){
  await page.evaluate(({x,z})=>{window.__GR_TEST__.teleport(x,z);const current={active:true,samples:[]};window.__HM_WALK__=current;const tick=()=>{const w=window.__HM_WALK__;if(w!==current||!w.active)return;const p=window.__THREE_GAME_DIAGNOSTICS__.heroPos;w.samples.push({...p,zone:window.__GR_TEST__.terrainSample(p.x,p.z).zone});requestAnimationFrame(tick)};requestAnimationFrame(tick)},{x,z});
  await page.waitForFunction(z=>Math.abs(window.__THREE_GAME_DIAGNOSTICS__.heroPos.z-z)<0.5,z);
  await page.keyboard.down(key);
  if(label.endsWith('ford'))await page.waitForFunction(()=>window.__THREE_GAME_DIAGNOSTICS__.heroPos.z>6,undefined,{timeout:15000});
  else await page.waitForTimeout(3500);
  await page.keyboard.up(key);
  const samples=await page.evaluate(()=>{window.__HM_WALK__.active=false;return window.__HM_WALK__.samples});
  const row={width,label,start:{x,z},last:samples.at(-1),river:samples.filter(p=>p.zone==='river').length,ford:samples.filter(p=>p.zone==='ford').length,samples,errors};rows.push(row);writeFileSync(`${out}/walk-proof.json`,JSON.stringify(rows,null,2));
  console.log(JSON.stringify({...row,samples:samples.length}));assert.equal(row.river,0);assert.deepEqual(errors,[]);
  if(label.endsWith('ford')){assert.ok(row.ford>0);assert.ok(row.last.z>6)}else assert.ok(Math.sign(row.last.z)===Math.sign(z)&&Math.abs(row.last.z)>3);
 }
 await page.close();
}}finally{await browser.close()}
