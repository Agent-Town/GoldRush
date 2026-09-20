import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const out='artifacts/boss-fidelity/e8-salvage-claw/lifecycle';await mkdir(out,{recursive:true});
const report={scope:'Actual development Game via temporary warmCombatPools introspection; reset/dispose and cancelled load; no source edits.',cases:[],errors:[]};
const browser=await chromium.launch({headless:true});
try{for(const mode of ['full','lite','cancelled-load']){
 const page=await browser.newPage();let release;const hold=new Promise(r=>release=r);let requests=0;
 if(mode==='cancelled-load')await page.route('**/salvage-claw-detail-opus5.glb',async route=>{requests++;if(requests===1)await hold;await route.continue();});
 page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
 await page.addInitScript(()=>{performance.setResourceTimingBufferSize(10000);localStorage.clear();});
 await page.goto(`http://127.0.0.1:5246/?debug&epoch=epoch-8-orbital&contract=e8-mare-claim&nowaves&nolevel&nopause&tier=${mode==='lite'?'lite':'full'}&seed=claw-lifetime`);
 await page.waitForFunction(()=>window.__GR_TEST__&&window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId==='e8-mare-claim');
 await page.evaluate(()=>document.querySelector('[data-testid=contract-briefing-dismiss]')?.click());
 await page.evaluate(async()=>{const url=performance.getEntriesByType('resource').map(e=>e.name).find(u=>new URL(u).pathname==='/src/game/Game.ts');if(!url)throw Error('Game URL unavailable');const {Game}=await import(url),old=Game.prototype.warmCombatPools;Game.prototype.warmCombatPools=function(...args){window.__clawGame=this;Game.prototype.warmCombatPools=old;return old.apply(this,args);};const h=window.__GR_TEST__;h.setManualSim(true);await h.warmVfx();h.setBalance('salvageClaw.arriveWave',4);h.setBalance('enemy.contactDamage',0);h.setBalance('sparkRig.range',0);h.startWaveForTest(4);h.advanceSim(.1);});
 if(mode==='cancelled-load'){
  await page.waitForFunction(()=>document.querySelector('canvas').dataset.salvageClaw3dState==='loading');
  await page.evaluate(()=>window.__clawGame.salvageClawBoss.reset());release();
  await page.waitForTimeout(500);const state=await page.evaluate(()=>({state:window.__clawGame.salvageClawBoss.modelState,model:!!window.__clawGame.salvageClawBoss.model}));assert.equal(state.model,false);assert.equal(state.state,'off');
  await page.evaluate(()=>{window.__GR_TEST__.startWaveForTest(4);window.__GR_TEST__.advanceSim(.1);});
 }
 if(mode!=='lite')await page.waitForFunction(()=>document.querySelector('canvas').dataset.salvageClaw3dState==='ready');
 const result=await page.evaluate(async mode=>{const b=window.__clawGame.salvageClawBoss,model=b.model,tracked=[],seen=new Set();
  if(model)model.traverse(m=>{if(!m.isMesh)return;for(const r of [m.geometry,m.material,m.material.map]){if(!r||seen.has(r))continue;seen.add(r);const row={kind:r.isTexture?'texture':r.isMaterial?'material':'geometry',events:0};r.addEventListener('dispose',()=>row.events++);tracked.push(row);}});
  const meshes=model?[...b.modelMeshes.values()]:[];const old=model;
  b.reset();const reset={state:b.modelState,model:!!b.model,attached:old?b.group.children.includes(old):false,tracked};
  b.dispose();return {mode,meshCount:meshes.length,reset,afterDisposeChildren:b.group.children.length};
 },mode);
 assert.equal(result.meshCount,mode==='lite'?0:3);assert.equal(result.reset.model,false);assert.equal(result.reset.attached,false);assert.equal(result.afterDisposeChildren,0);
 for(const r of result.reset.tracked)assert(r.kind==='texture'?r.events>=1:r.events===1);
 report.cases.push({...result,requests});await page.close();
}assert.deepEqual(report.errors,[]);report.completed=true;}catch(e){report.failure=e.stack;throw e;}finally{await writeFile(`${out}/report.json`,JSON.stringify(report,null,2));await browser.close();}
