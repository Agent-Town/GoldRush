import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const out='artifacts/boss-fidelity/e9-old-digger/lifecycle-v6';await mkdir(out,{recursive:true});
const report={scope:'Actual development Game via temporary warmCombatPools introspection; reset/dispose and cancelled load; no source edits.',cases:[],errors:[]};
const browser=await chromium.launch({headless:true});
try{for(const mode of ['full','lite','cancelled-load']){
 const page=await browser.newPage();let release;const hold=new Promise(r=>release=r);let requests=0;
 if(mode==='cancelled-load')await page.route('**/old-digger.glb',async route=>{requests++;if(requests===1)await hold;await route.continue();});
 page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
 await page.addInitScript(()=>{performance.setResourceTimingBufferSize(10000);localStorage.clear();});
 await page.goto(`http://127.0.0.1:5246/?debug&epoch=epoch-9-redfields&contract=e9-dome-basin&nowaves&nolevel&nopause&tier=${mode==='lite'?'lite':'full'}&seed=digger-lifetime`);
 await page.waitForFunction(()=>window.__GR_TEST__&&window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId==='e9-dome-basin');
 await page.evaluate(()=>document.querySelector('[data-testid=contract-briefing-dismiss]')?.click());
 await page.evaluate(async()=>{const url=performance.getEntriesByType('resource').map(e=>e.name).find(u=>new URL(u).pathname==='/src/game/Game.ts');if(!url)throw Error('Game URL unavailable');const {Game}=await import(url),old=Game.prototype.warmCombatPools;Game.prototype.warmCombatPools=function(...args){window.__diggerGame=this;Game.prototype.warmCombatPools=old;return old.apply(this,args);};const h=window.__GR_TEST__;h.setManualSim(true);await h.warmVfx();h.setBalance('oldDigger.arriveWave',2);h.setBalance('enemy.contactDamage',0);h.setBalance('sparkRig.range',0);h.startWaveForTest(2);h.advanceSim(.1);});
 if(mode==='cancelled-load'){
  await page.waitForFunction(()=>document.querySelector('canvas').dataset.oldDigger3dState==='loading');
  await page.evaluate(()=>window.__diggerGame.oldDiggerBoss.reset());release();
  await page.waitForTimeout(500);const state=await page.evaluate(()=>({state:window.__diggerGame.oldDiggerBoss.oldDigger3dState,model:!!window.__diggerGame.oldDiggerBoss.oldDigger3dModel}));assert.equal(state.model,false);assert.equal(state.state,'off');
  await page.evaluate(()=>{window.__GR_TEST__.startWaveForTest(2);window.__GR_TEST__.advanceSim(.1);});
 }
 if(mode!=='lite')await page.waitForFunction(()=>document.querySelector('canvas').dataset.oldDigger3dState==='ready');
 const result=await page.evaluate(async mode=>{const b=window.__diggerGame.oldDiggerBoss,model=b.oldDigger3dModel,tracked=[],seen=new Set();
  if(model)model.traverse(m=>{if(!m.isMesh)return;for(const r of [m.geometry,m.material,m.material.map]){if(!r||seen.has(r))continue;seen.add(r);const row={kind:r.isTexture?'texture':r.isMaterial?'material':'geometry',events:0};r.addEventListener('dispose',()=>row.events++);tracked.push(row);}});
  const meshes=model?[...b.oldDigger3dMeshes.values()]:[];const old=model;
  b.reset();const reset={state:b.oldDigger3dState,model:!!b.oldDigger3dModel,attached:old?b.machine.children.includes(old):false,tracked};
  b.dispose();return {mode,meshCount:meshes.length,reset,afterDisposeChildren:b.group.children.length,supportsAfterDispose:b.modelSupports.map(a=>a.length)};
 },mode);
 assert.equal(result.meshCount,mode==='lite'?0:3);assert.equal(result.reset.model,false);assert.equal(result.reset.attached,false);assert.equal(result.afterDisposeChildren,0);assert.deepEqual(result.supportsAfterDispose,[0,0]);
 for(const r of result.reset.tracked)assert(r.kind==='texture'?r.events>=1:r.events===1);
 report.cases.push({...result,requests});await page.close();
}assert.deepEqual(report.errors,[]);report.completed=true;}catch(e){report.failure=e.stack;throw e;}finally{await writeFile(`${out}/report.json`,JSON.stringify(report,null,2));await browser.close();}
