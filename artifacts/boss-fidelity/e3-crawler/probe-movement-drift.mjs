import { writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
const browser=await chromium.launch({channel:'chromium',headless:true});
const report={note:'Read-only source audit with isolated browser instrumentation. cached-tracks arm changes only its page-local callback; no production files are changed.',arms:{}};
try {
 for(const mode of ['actual','cached-tracks']) {
  const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];let gameUrl;
  page.on('request',r=>{if(new URL(r.url()).pathname==='/src/game/Game.ts')gameUrl=r.url()});
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await page.addInitScript(()=>{localStorage.clear();localStorage.setItem('gr.activeEpoch.v1','epoch-3-voltage')});
  await page.goto('http://127.0.0.1:5246/?debug&epoch=epoch-3-voltage&contract=e3-canyon-works&nolevel&nopause&tier=full&seed=crawler-lifecycle');
  await page.waitForFunction(()=>window.__GR_TEST__&&(window.__THREE_GAME_DIAGNOSTICS__?.frame??0)>16,null,{timeout:60000});
  const dismiss=page.getByTestId('contract-briefing-dismiss');if(await dismiss.isVisible())await dismiss.evaluate(b=>b.click());
  await page.evaluate(async url=>{
   const {Game}=await import(url),original=Game.prototype.syncBaronRocketCart;
   Game.prototype.syncBaronRocketCart=function(...args){window.__crawlerDriftGame=this;Game.prototype.syncBaronRocketCart=original;return original.apply(this,args)};
   const h=window.__GR_TEST__;h.setManualSim(true);h.advanceSim(.1);
  },gameUrl);
  await page.waitForFunction(()=>window.__crawlerDriftGame);
  await page.evaluate(mode=>{
   const g=window.__crawlerDriftGame,h=window.__GR_TEST__,night=g.nightSpeedMultiplier.bind(g),update=g.enemies.update.bind(g.enemies);
   const state=window.__crawlerDrift={mode,ticks:0,splitTicks:0,commonTicks:0,samples:[],scalars:new Set(),hpSamples:[]};
   g.enemies.update=function(...args){
    const parts=this.all.filter(e=>e.isAlive&&e.variantId==='dynamo_crawler');
    const anchor=parts.find(e=>e.bossComponentId==='tracks')??parts[0];
    const scalar=anchor?night(anchor):null;
    const scalarById=Object.fromEntries(parts.map(e=>[e.bossComponentId,night(e)]));
    const distinct=new Set(Object.values(scalarById));
    const rows=[];
    const callback=args[6];
    args[6]=e=>{const m=callback(e);if(e.variantId==='dynamo_crawler')rows.push({id:e.bossComponentId,m});return m};
    if(mode==='cached-tracks'&&anchor)g.nightSpeedMultiplier=e=>e.variantId==='dynamo_crawler'&&e.bossGroupId===anchor.bossGroupId?scalar:night(e);
    if(parts.length){state.ticks++;if(distinct.size>1){state.splitTicks++;if(state.samples.length<10)state.samples.push({at:g.timeAlive,scalarById,positions:parts.map(e=>({id:e.bossComponentId,x:e.position.x,z:e.position.z,light:g.lightField.coverageAt(e.position.x,e.position.z)}))})}else state.commonTicks++}
    const result=update(...args);
    if(parts.length){rows.forEach(r=>state.scalars.add(r.m));state.maxAppliedSpread=Math.max(state.maxAppliedSpread??0,Math.max(...rows.map(r=>r.m))-Math.min(...rows.map(r=>r.m)))}
    g.nightSpeedMultiplier=night;
    return result;
   };
   for(const [key,value]of Object.entries({'waves.waveInterval':.35,'waves.trickleInterval':999,'waves.pulseBase':0,'waves.pulsePerWave':0,'waves.aliveCap':0,'enemy.contactDamage':0,'sparkRig.range':0,'sparkRig.damage':0,'turret.range':0,'turret.damage':0,'beacon.damage':0,'beacon.damagePerWave':0}))h.setBalance(key,value);
   h.setLocalWeaponForTest('blast');h.setBalance('blast.damage',0);h.grantGold(1000);
   for(const [x,z]of[[-12,-36],[-24,-20],[-28,8]])h.placeFree('sentry_beacon',x,z);
   h.advanceSim(.2);h.setWave(13);h.advanceSim(.4);h.setBalance('waves.waveInterval',999);h.setWave(14);h.advanceSim(.2);
  },mode);
  const poses=[];
  for(const seconds of[0,10,10]) { poses.push(await page.evaluate(seconds=>{
   const h=window.__GR_TEST__,g=window.__crawlerDriftGame;h.advanceSim(seconds);
   const parts=g.enemies.all.filter(e=>e.isAlive&&e.variantId==='dynamo_crawler').map(e=>({id:e.bossComponentId,x:e.position.x,z:e.position.z,hp:e.currentHp,speed:e.captureSuspend().scriptedSpeed}));
   const a=parts.find(e=>e.id==='drain_mast'),b=parts.find(e=>e.id==='capacitor_bank');
   return{at:g.timeAlive,parts,span:Math.hypot(a.x-b.x,a.z-b.z)};
  },seconds));
   await page.evaluate(()=>{const h=window.__GR_TEST__,p=h.enemyPositions().filter(e=>e.variantId==='dynamo_crawler');h.teleport(p.reduce((v,e)=>v+e.x,0)/p.length-.5,p.reduce((v,e)=>v+e.z,0)/p.length+1.5)});
   await page.waitForTimeout(350);
  }
  report.arms[mode]={poses,...await page.evaluate(()=>({...window.__crawlerDrift,scalars:[...window.__crawlerDrift.scalars]})),errors,gameUrl};
  console.log(JSON.stringify({mode,spans:poses.map(p=>p.span),splitTicks:report.arms[mode].splitTicks,maxAppliedSpread:report.arms[mode].maxAppliedSpread,errors}));
  await page.close();
 }
}finally{await browser.close()}
await writeFile(new URL('./movement-drift.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
