// Unmodified plain boot, then explicitly labelled frozen diagnostics with the real HUD.
import {chromium} from '@playwright/test';
import {mkdirSync, writeFileSync, readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const id=process.env.MAP, phase=process.env.PHASE ?? 'before';
assert.ok(id);
const out=`artifacts/sol/map-art-campaign-2/run-4/${id}`;
mkdirSync(out,{recursive:true});
const base='http://127.0.0.1:5303', rows=[];
const browser=await chromium.launch({channel:'chromium'});
try { for(const width of [1280,390]) {
  const page=await browser.newPage({viewport:{width,height:width===390?844:800},isMobile:width===390,hasTouch:width===390,deviceScaleFactor:1});
  page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
  const errors=[];page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base);
  await page.evaluate(async id=>{(await import('/src/meta/ContractUnlock.ts')).setPreviewUnlockAll(true);(await import('/src/meta/ContractFamilies.ts')).stagePlayerContractLaunch(id)},id);
  async function ready() {
    await page.waitForFunction(()=>document.querySelector('#game-canvas')?.dataset.terrain3dPilotLandmarkLoadState==='mounted');
    const begin=page.getByTestId('contract-briefing-dismiss');
    if(await begin.isVisible())await begin.click({timeout:2000}).catch(async error=>{if(await begin.isVisible())throw error});
    assert.equal(await page.evaluate(()=>window.__THREE_GAME_DIAGNOSTICS__.contract.activeId),id);
  }
  await page.goto(`${base}/?contract=${id}&seed=map-art-campaign-2`);await ready();await page.waitForTimeout(3000);
  await page.screenshot({path:`${out}/${phase}-plain-${width}.png`});
  const plain=await page.evaluate(()=>({diagnostics:window.__THREE_GAME_DIAGNOSTICS__,dataset:{...document.querySelector('#game-canvas').dataset},testHook:typeof window.__GR_TEST__}));
  assert.equal(plain.testHook,'undefined');
  const row={width,plain,errors,performance:[],stations:[]};rows.push(row);
  writeFileSync(`${out}/${phase}.json`,JSON.stringify(rows,null,2)+'\n');
  if(process.env.PLAIN_ONLY==='1'){await page.close();continue;}
  // These diagnostic handles exist in the routed response only, never production source.
  await page.route('**/src/world/Terrain3dClaimPilot.ts*',async route=>{
    const response=await route.fetch();let body=await response.text();
    assert.equal(body.split('model.name = mount.id;').length,2);
    body=body.replace('model.name = mount.id;',`model.name = mount.id;
      (window.__ART_MODELS__ ??= new Map()).set(mount.id,model);
      window.__ART_THREE__=THREE;`);
    await route.fulfill({response,body});
  });
  // The plain boot may legitimately auto-shed lighting. Its session verdict
  // must not contaminate the explicitly full-tier diagnostic that follows.
  await page.evaluate(()=>sessionStorage.removeItem('gr.performance.verdicts.v1'));
  await page.goto(`${base}/?debug&epoch=${plain.diagnostics.contract.epochId}&contract=${id}&seed=map-art-campaign-2&nowaves&nolevel&nokill&nopause&tier=full`);
  await ready();await page.evaluate(()=>{window.__GR_TEST__.setManualSim(true);window.__GR_GUI__?.hide()});await page.waitForTimeout(1500);
  row.frozen=await page.evaluate(()=>({performance:window.__THREE_GAME_DIAGNOSTICS__.performance,renderer:window.__THREE_GAME_DIAGNOSTICS__.renderer}));
  assert.equal(row.frozen.performance.runtimeVerdict,0);
  await page.screenshot({path:`${out}/${phase}-frozen-${width}.png`});
  for(let run=0;run<Number(process.env.RUNS??4);run++) {
    row.performance.push(await page.evaluate(async()=>{
      const frames=[];let last=performance.now();await new Promise(resolve=>{const next=now=>{frames.push(now-last);last=now;if(frames.length<180)requestAnimationFrame(next);else resolve()};requestAnimationFrame(next)});
      const s=[...frames].sort((a,b)=>a-b);return {frames,p95:s[Math.floor(s.length*.95)],renderer:window.__GR_TEST__.renderCensus().renderer};
    }));
  }
  const focus=process.env.FOCUS;
  if(focus) {
    const mount=JSON.parse(plain.dataset.terrain3dPilotLandmarkMounts).find(m=>m.id===focus);assert.ok(mount);
    // Entry is never repositioned. The other two shots declare their diagnostic stand-off.
    for(const back of (process.env.STATIONS?process.env.STATIONS.split(',').map(value=>value==='entry'?'entry':Number(value)):['entry',20,14,9,5])) {
      if(back!=='entry'){await page.evaluate(({m,back})=>window.__GR_TEST__.teleport(m.x,m.z+back),{m:mount,back});await page.waitForTimeout(800);}
      const frame=await page.evaluate(id=>{
        const model=window.__ART_MODELS__.get(id),THREE=window.__ART_THREE__;
        const bounds=new THREE.Box3().setFromObject(model),corners=[];
        for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z])corners.push(window.__GR_TEST__.screenPoint(x,z,y));
        return {bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()},corners,hero:window.__THREE_GAME_DIAGNOSTICS__.heroPos,materials:JSON.parse(document.querySelector('#game-canvas').dataset.terrain3dPilotLandmarkMaterials)};
      },focus);
      const prefix=`${out}/${phase}-${back}-${width}`;
      await page.screenshot({path:prefix+'.png'});
      const style=await page.addStyleTag({content:'body * {visibility:hidden !important} #game-canvas {visibility:visible !important}'});
      await page.screenshot({path:prefix+'-body.png'});
      await page.evaluate(id=>window.__ART_MODELS__.get(id).traverse(n=>{if(n.isMesh){n.userData.oldMaterial=n.material;n.material=new window.__ART_THREE__.MeshBasicMaterial({color:0xff00ff,side:2})}}),focus);
      await page.screenshot({path:prefix+'-mask.png'});
      await style.evaluate(n=>n.remove());
      await page.screenshot({path:prefix+'-hud-mask.png'});
      await page.evaluate(id=>window.__ART_MODELS__.get(id).traverse(n=>{if(n.isMesh&&n.userData.oldMaterial){n.material.dispose();n.material=n.userData.oldMaterial;delete n.userData.oldMaterial}}),focus);
      row.stations.push({back,focus,...frame});
    }
  }
  writeFileSync(`${out}/${phase}.json`,JSON.stringify(rows,null,2)+'\n');
  console.log(id,phase,width,'p95',row.performance.map(p=>p.p95.toFixed(2)),'calls',row.performance.map(p=>p.renderer.calls),'errors',errors.length);
  assert.deepEqual(errors,[]);await page.close();
}} finally {await browser.close()}
