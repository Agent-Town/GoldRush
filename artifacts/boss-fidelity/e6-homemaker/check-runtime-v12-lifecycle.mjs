// Isolated candidate routing; production files remain frozen during E5 regression.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium,devices} from 'playwright';
const root='artifacts/boss-fidelity/e6-homemaker',out=`${root}/runtime-v12-lifecycle`,base='http://127.0.0.1:5246';
const sha=b=>createHash('sha256').update(b).digest('hex');
const bytes=await readFile(`${root}/candidate-model/homemaker-9000.glb`),old=await readFile(`${root}/before/homemaker-9000.glb`);
const report={scope:'Actual Game with isolated candidate source/asset routing. Loader/reset/disposal checks, not production acceptance or full regression.',assetSha256:sha(bytes),sourceSha256:sha(await readFile(`${root}/candidate-runtime/HomemakerBossSystem.ts`)),cases:[],errors:[],passed:false};
await mkdir(out,{recursive:true});const save=()=>writeFile(`${out}/report.json`,JSON.stringify(report,null,2)+'\n');
const browser=await chromium.launch({channel:'chromium',headless:true});
async function initialize(page){
 await page.waitForFunction(()=>window.__GR_TEST__&&window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId==='e6-glow-mesa');
 await page.getByTestId('contract-briefing-dismiss').evaluate(el=>{if(el.getClientRects().length)el.click();});
 const url=await page.evaluate(()=>performance.getEntriesByType('resource').map(e=>e.name).find(u=>new URL(u).pathname==='/src/game/Game.ts'));assert(url);
 await page.evaluate(async url=>{
  const {Game}=await import(url),original=Game.prototype.warmCombatPools;
  Game.prototype.warmCombatPools=function(...args){window.__e6=this;Game.prototype.warmCombatPools=original;return original.apply(this,args);};
  const h=window.__GR_TEST__;h.setManualSim(true);await h.warmVfx();
  for(const [key,value] of Object.entries({'waves.waveInterval':.35,'waves.trickleInterval':999,'waves.pulseBase':0,'waves.pulsePerWave':0,'waves.aliveCap':20,'enemy.contactDamage':0,'sparkRig.range':0,'homemaker.arrivalSpeed':40,'homemaker.unbuildIntervalSeconds':999,'homemaker.rackIntervalSeconds':999}))h.setBalance(key,value);
  const w=window.__THREE_GAME_DIAGNOSTICS__.contract.baron.wave;h.setWave(w-1);h.advanceSim(.4);h.setBalance('waves.waveInterval',999);h.setWave(w);h.advanceSim(3.35);
 },url);
}
async function damage(page,id,lethal=false){
 await page.evaluate(({id,lethal})=>{
  const h=window.__GR_TEST__,g=window.__e6,live=g.enemies.all.find(e=>e.isAlive&&e.variantId==='homemaker_9000'&&e.bossComponentId===id);if(!live)throw Error(`Missing ${id}`);
  const snapshot=structuredClone(h.captureSuspend()),row=snapshot.enemies.active.find(e=>e.variantId==='homemaker_9000'&&e.bossComponentId===id);row.hp=lethal?.01:live.maxHp*.4;
  if(!h.restoreSuspend(snapshot))throw Error('Restore failed');
  if(lethal){const p=h.enemyPositions().find(e=>e.variantId==='homemaker_9000'&&e.bossComponentId===id);h.setBalance('blast.damage',1);h.launchBlastAt(p.x,p.z,.05);}h.advanceSim(.4);
 },{id,lethal});
}
async function inspect(page){return page.evaluate(()=>{
 const b=window.__e6.homemakerBoss;
 return {state:b.homemaker3dState,model:Boolean(b.homemaker3dModel),meshes:b.homemaker3dMeshes.size,hulls:b.modelHulls.size,supports:b.modelSupports.size,
  modelChildren:b.machine.children.filter(c=>c.name==='Homemaker9000.3d').length,primitive:b.machine.visible&&(b.machinePrimitive.visible||b.chairPrimitive.visible),
  morphs:Object.fromEntries([...b.homemaker3dMeshes].map(([id,m])=>[id,m.morphTargetInfluences[0]])),diagnostics:b.diagnostics()};
});}
try{
 for(const mode of ['lite','invalid','wrong-contract','late-vac','late-rack','late-core','late-chair','reset','loaded-reset']){
  let release,requests=0;const held=new Promise(r=>release=r),item={mode};report.cases.push(item);
  const page=await browser.newPage({...devices['Desktop Chrome'],viewport:{width:1280,height:800}});
  page.on('pageerror',e=>report.errors.push({mode,error:e.message}));page.on('console',m=>{if(m.type()==='error')report.errors.push({mode,error:m.text()});});
  await page.route('**/src/systems/HomemakerBossSystem.ts*',async route=>{const response=await page.request.get(`${base}/${root}/candidate-runtime/HomemakerBossSystem.browser.ts`);assert.equal(response.status(),200);await route.fulfill({response});});
  await page.route('**/src/game/Game.ts*',async route=>{const response=await route.fetch();let body=await response.text();const sync='this.dredgeQueenBoss.syncRenderPresentation();',bounds='this.dredgeQueenBoss.modelBounds(groupId)';assert.equal(body.split(sync).length,2);assert.equal(body.split(bounds).length,2);body=body.replace(sync,sync+' this.homemakerBoss.syncRenderPresentation();').replace(bounds,bounds+' ?? this.homemakerBoss.modelBounds(groupId)');await route.fulfill({response,body});});
  await page.route('**/homemaker-9000.glb*',async route=>{requests++;if(!['lite','invalid','wrong-contract','loaded-reset'].includes(mode))await held;await route.fulfill({status:200,contentType:'model/gltf-binary',body:mode==='invalid'?'invalid':mode==='wrong-contract'?old:bytes});});
  try{
   const tier=mode==='lite'?'lite':'full';await page.addInitScript(tier=>{performance.setResourceTimingBufferSize(10000);localStorage.clear();localStorage.setItem('gr.activeEpoch.v1','epoch-6-atomic');localStorage.setItem('gr.performance.tier.v1',tier);},tier);
   await page.goto(`${base}/?debug&epoch=epoch-6-atomic&contract=e6-glow-mesa&nolevel&nopause&tier=${tier}&seed=homemaker-9000`);await initialize(page);
   const expected=mode==='lite'?'lite':['invalid','wrong-contract'].includes(mode)?'failed':mode==='loaded-reset'?'ready':'loading';await page.waitForFunction(state=>window.__e6.homemakerBoss.homemaker3dState===state,expected);
   item.before=await inspect(page);if(mode!=='loaded-reset'){assert.equal(item.before.model,false);assert.equal(item.before.primitive,true);}
   if(mode.startsWith('late-')){
    if(mode==='late-core'||mode==='late-chair')await damage(page,'vac',true);
    if(mode==='late-chair')await damage(page,'core',true);else await damage(page,mode.slice(5));
    release();await page.waitForFunction(()=>window.__e6.homemakerBoss.homemaker3dState==='ready');item.after=await inspect(page);
    assert.equal(item.after.modelChildren,1);assert.equal(item.after.meshes,3);assert.equal(item.after.primitive,false);
    const expected=mode==='late-chair'?{vac:1,rack:1,core:1}:mode==='late-core'?{vac:1,rack:0,core:1}:{vac:mode==='late-vac'?1:0,rack:mode==='late-rack'?1:0,core:0};assert.deepEqual(item.after.morphs,expected);
   }else if(mode==='reset'||mode==='loaded-reset'){
    if(mode==='loaded-reset')await page.evaluate(()=>{const resources=new Set();window.__e6.homemakerBoss.homemaker3dModel.traverse(m=>{if(m.isMesh){resources.add(m.geometry);resources.add(m.material);resources.add(m.material.map);}});window.__e6Disposals=[...resources].map(r=>{const row={type:r.isTexture?'texture':r.isMaterial?'material':'geometry',count:0};r.addEventListener('dispose',()=>row.count++);return row;});});
    await page.evaluate(()=>{window.__GR_TEST__.resetRun();window.__GR_TEST__.setManualSim(true);});release();await page.waitForTimeout(1200);item.after=await inspect(page);
    assert.equal(item.after.state,'off');assert.equal(item.after.model,false);assert.equal(item.after.meshes,0);assert.equal(item.after.hulls,0);assert.equal(item.after.supports,0);assert.equal(item.after.modelChildren,0);
    assert.equal(await page.evaluate(()=>window.__e6.homemakerBoss.modelBounds('old-e6-group')),null);
    if(mode==='loaded-reset'){item.disposals=await page.evaluate(()=>window.__e6Disposals);assert.equal(item.disposals.length,7);assert(item.disposals.every(r=>r.count>=1));}
   }
   item.requests=requests;assert.equal(requests,mode==='lite'?0:1);
  }finally{release();await save();await page.close();}
 }
 assert.deepEqual(report.errors,[]);report.passed=true;
}catch(e){report.failure=e.stack;throw e;}finally{await save();await browser.close();}
