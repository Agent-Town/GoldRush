// Isolated candidate routing; production files remain frozen during E5 regression.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium,devices} from 'playwright';
const root='artifacts/boss-fidelity/e6-homemaker',out=`${root}/runtime-v8-motion`,base='http://127.0.0.1:5246';
const sha=b=>createHash('sha256').update(b).digest('hex');
const bytes=await readFile(`${root}/candidate-model/homemaker-9000.glb`),old=await readFile(`${root}/before/homemaker-9000.glb`);
const report={scope:'Actual Game with isolated candidate source/asset routing. Moving approach, sole VAC, Act2 CORE at interpolation alpha 0/.5/1; render calls must preserve encounter state. Not production acceptance or full regression.',assetSha256:sha(bytes),sourceSha256:sha(await readFile(`${root}/candidate-runtime/HomemakerBossSystem.ts`)),cases:[],errors:[],passed:false};
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
  for(const [key,value] of Object.entries({'waves.waveInterval':.35,'waves.trickleInterval':999,'waves.pulseBase':0,'waves.pulsePerWave':0,'waves.aliveCap':20,'enemy.contactDamage':0,'sparkRig.range':0,'homemaker.arrivalSpeed':1,'homemaker.unbuildIntervalSeconds':999,'homemaker.rackIntervalSeconds':999}))h.setBalance(key,value);
  const w=window.__THREE_GAME_DIAGNOSTICS__.contract.baron.wave;h.setWave(w-1);h.advanceSim(.4);h.setBalance('waves.waveInterval',999);h.setWave(w);h.advanceSim(.4);
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
 const page=await browser.newPage({...devices['Desktop Chrome'],viewport:{width:1280,height:800}});
 page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
  await page.route('**/src/systems/HomemakerBossSystem.ts*',async route=>{const response=await page.request.get(`${base}/${root}/candidate-runtime/HomemakerBossSystem.browser.ts`);assert.equal(response.status(),200);await route.fulfill({response});});
  await page.route('**/src/game/Game.ts*',async route=>{const response=await route.fetch();let body=await response.text();const sync='this.dredgeQueenBoss.syncRenderPresentation();',bounds='this.dredgeQueenBoss.modelBounds(groupId)';assert.equal(body.split(sync).length,2);assert.equal(body.split(bounds).length,2);body=body.replace(sync,sync+' this.homemakerBoss.syncRenderPresentation();').replace(bounds,bounds+' ?? this.homemakerBoss.modelBounds(groupId)');await route.fulfill({response,body});});

 await page.route('**/homemaker-9000.glb*',route=>route.fulfill({status:200,contentType:'model/gltf-binary',body:bytes}));
 await page.addInitScript(()=>{performance.setResourceTimingBufferSize(10000);localStorage.clear();localStorage.setItem('gr.activeEpoch.v1','epoch-6-atomic');});
 await page.goto(`${base}/?debug&epoch=epoch-6-atomic&contract=e6-glow-mesa&nolevel&nopause&tier=full&seed=homemaker-9000`);await initialize(page);await page.waitForFunction(()=>window.__e6.homemakerBoss.homemaker3dState==='ready');
 async function sample(label,seconds){
  const result=await page.evaluate(({label,seconds})=>{
   const g=window.__e6,b=g.homemakerBoss,h=window.__GR_TEST__,rows=[];
   for(let tick=0;tick<seconds*30;tick++){
    h.advanceSim(1/30);const before=JSON.stringify(b.captureSuspend());
    for(const alpha of [0,.5,1]){
     g.applyRenderInterpolation(alpha);const live=g.enemies.all.filter(e=>e.isAlive&&e.variantId==='homemaker_9000');
     const errors=live.map(e=>{const p=g.enemies.renderPositionOf(e),offset=e.bossComponentId==='vac'?-2.2:e.bossComponentId==='rack'?2.2:0;return{id:e.bossComponentId,error:Math.hypot(p.x-b.machine.position.x-offset,p.z-b.machine.position.z)};});
     if(JSON.stringify(b.captureSuspend())!==before)throw Error('Render interpolation changed encounter state');
     rows.push({tick,alpha,position:b.machine.position.toArray(),errors});
    }
   }
   return{label,rows,diagnostics:b.diagnostics()};
  },{label,seconds});result.maxError=Math.max(...result.rows.flatMap(r=>r.errors.map(e=>e.error)));report.cases.push(result);await save();assert(result.maxError<.05,label+' target alignment');
 }
 await sample('two-component-approach',3);await damage(page,'rack',true);await sample('sole-vac-approach',2);await damage(page,'vac',true);await sample('act2-core',1);
 assert(report.cases[0].rows.some(r=>Math.abs(r.position[0])>5),'Approach must actually be moving before arrival');assert(report.cases[2].rows.every(r=>r.errors.length===1&&r.errors[0].id==='core'));
 assert.deepEqual(report.errors,[]);report.passed=true;await page.close();
}catch(e){report.failure=e.stack;throw e;}finally{await save();await browser.close();}
