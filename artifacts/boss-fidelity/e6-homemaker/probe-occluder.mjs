import {chromium,devices} from 'playwright';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root='artifacts/boss-fidelity/e6-homemaker',out=`${root}/runtime-before-occluder`,base='http://127.0.0.1:5246';
const sha=b=>createHash('sha256').update(b).digest('hex');
const source={};for(const p of ['src/systems/HomemakerBossSystem.ts','src/game/Game.ts','assets/pilots/homemaker-9000-3d/homemaker-9000.glb'])source[p]=sha(await readFile(p));
const report={source,scope:'Actual unchanged Homemaker presentation, accelerated waves/manual simulation, fixed hero framing. Read-only baseline for model/camera/terrain alignment; not natural progression or a performance benchmark.',cases:[],errors:[],completed:false};
await mkdir(out,{recursive:true});const save=()=>writeFile(`${out}/report.json`,JSON.stringify(report,null,2)+'\n');const browser=await chromium.launch({channel:'chromium',headless:true});
try{
 for(const name of ['desktop']){
  const page=await browser.newPage({...devices[name==='mobile'?'Pixel 5':'Desktop Chrome'],viewport:name==='mobile'?{width:390,height:844}:{width:1280,height:800}});
  page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
  await page.addInitScript(()=>{performance.setResourceTimingBufferSize(10000);localStorage.clear();localStorage.setItem('gr.activeEpoch.v1','epoch-6-atomic');});
  await page.goto(`${base}/?debug&epoch=epoch-6-atomic&contract=e6-glow-mesa&nolevel&nopause&tier=full&seed=homemaker-9000`);
  await page.waitForFunction(()=>window.__GR_TEST__&&window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId==='e6-glow-mesa');
  const brief=page.getByTestId('contract-briefing-dismiss');if(await brief.isVisible())await brief.click();
  const urls=await page.evaluate(()=>Object.fromEntries(['Game','Terrain'].map(n=>[n,performance.getEntriesByType('resource').map(e=>e.name).find(u=>new URL(u).pathname===`/src/${n==='Game'?'game':'world'}/${n}.ts`)])));
  assert(urls.Game&&urls.Terrain);
  await page.evaluate(async urls=>{
   const {Game}=await import(urls.Game),original=Game.prototype.warmCombatPools;window.__e6Terrain=await import(urls.Terrain);
   Game.prototype.warmCombatPools=function(...args){window.__e6=this;Game.prototype.warmCombatPools=original;return original.apply(this,args);};
   const h=window.__GR_TEST__;h.setManualSim(true);for(const [k,v] of Object.entries({'waves.waveInterval':.35,'waves.trickleInterval':999,'waves.pulseBase':0,'waves.pulsePerWave':0,'waves.aliveCap':20,'enemy.contactDamage':0,'sparkRig.range':0,'homemaker.arrivalSpeed':40,'homemaker.unbuildIntervalSeconds':999,'homemaker.rackIntervalSeconds':999}))h.setBalance(k,v);await h.warmVfx();
   const w=window.__THREE_GAME_DIAGNOSTICS__.contract.baron.wave;h.setWave(w-1);h.advanceSim(.4);h.setBalance('waves.waveInterval',999);h.setWave(w);h.advanceSim(.35);
  },urls);
  await page.waitForFunction(()=>document.querySelector('canvas').dataset.homemaker3dState==='ready');
  const capture=async(label,near=true)=>{
   await page.evaluate(near=>{const p=window.__e6.homemakerBoss.machine.position;window.__GR_TEST__.teleport(p.x,p.z+(near?1:9));},near);
   if(name==='mobile'&&near)await page.locator('canvas').dispatchEvent('wheel',{deltaY:1000,deltaMode:0});
   await page.waitForTimeout(500);
   const s=await page.evaluate(()=>{
    const g=window.__e6,b=g.homemakerBoss,model=b.homemaker3dModel;g.scene.updateMatrixWorld(true);let below=0,count=0,worst=0;const parts=[];
    for(const [id,m] of b.homemaker3dMeshes){const point=m.position.clone();for(let i=0;i<m.geometry.getAttribute('position').count;i++){m.getVertexPosition(i,point).applyMatrix4(m.matrixWorld);const gap=point.y-window.__e6Terrain.visualY(point.x,point.z);count++;if(gap<-.03)below++;worst=Math.min(worst,gap);}parts.push({id,morph:m.morphTargetInfluences[0]});}
    const pointer=g.aimPointerNdc.clone().set(2*665/innerWidth-1,1-2*435/innerHeight);g.aimRaycaster.setFromCamera(pointer,g.camera);
    const hits=g.aimRaycaster.intersectObjects(g.scene.children,true).filter(hit=>{let p=hit.object;while(p){if(!p.visible)return false;p=p.parent;}return true;}).slice(0,12).map(hit=>({name:hit.object.name,material:hit.object.material?.name,distance:hit.distance,point:hit.point.toArray(),parents:[hit.object.parent?.name,hit.object.parent?.parent?.name,hit.object.parent?.parent?.parent?.name]}));
    return {hits,diagnostics:b.diagnostics(),machine:b.machine.position.toArray(),parts,terrain:{below,count,worst},targets:g.enemies.all.filter(e=>e.isAlive&&e.variantId==='homemaker_9000').map(e=>({id:e.bossComponentId,position:e.position.toArray()})),camera:g.camera.position.toArray()};
   });const file=`${name}-${label}.png`;await page.screenshot({path:`${out}/${file}`});report.cases.push({name,label,file,...s});await save();
  };
  await page.evaluate(()=>window.__GR_TEST__.advanceSim(3));await capture('default',false);await capture('arrived');await page.close();continue;
  for(const id of ['rack','vac','core']){
   await page.evaluate(id=>{const h=window.__GR_TEST__,s=structuredClone(h.captureSuspend()),e=s.enemies.active.find(e=>e.variantId==='homemaker_9000'&&e.bossComponentId===id);if(!e)throw Error(`Missing ${id}`);e.hp=.01;if(!h.restoreSuspend(s))throw Error('restore failed');const p=h.enemyPositions().find(e=>e.variantId==='homemaker_9000'&&e.bossComponentId===id);h.setBalance('blast.damage',1);h.launchBlastAt(p.x,p.z,.05);h.advanceSim(.4);},id);
   if(id==='core'){await page.keyboard.press('Space');await page.waitForFunction(()=>!window.__THREE_GAME_DIAGNOSTICS__.baronCeremony.active);const secure=page.getByTestId('claim-secured');if(await secure.isVisible())await page.getByTestId('stay-for-rush').click();await page.waitForFunction(()=>!document.querySelector('.hud--announcement-visible'),null,{timeout:30000});}
   await capture(`${id}-destroyed`);
  }
  await page.close();
 }
 assert.deepEqual(report.errors,[]);report.completed=true;
}catch(e){report.failure=e.stack;throw e;}finally{await save();await browser.close();}
