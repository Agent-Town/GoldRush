import {chromium,devices} from 'playwright';
import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root='artifacts/boss-fidelity/e6-homemaker/bundle-preview-v12',out=`${root}/runtime-clean`,base='http://127.0.0.1:5247';
const sha=b=>createHash('sha256').update(b).digest('hex');
const assets=await readdir(`${root}/project/dist/assets`),names=assets.filter(n=>/^homemaker-9000-.*\.glb$/.test(n));assert.equal(names.length,1);
const asset=names[0],expected=await readFile(`${root}/project/dist/assets/${asset}`);
const report={scope:'Actual isolated production bundle, unchanged bundled source and assets, public debug hooks only. No request routing, module substitution or Game prototype patching. Accelerated encounter; not a performance benchmark or production adoption.',asset,assetSha256:sha(expected),assetBytes:expected.length,cases:[],network:[],errors:[],completed:false};
await mkdir(out,{recursive:true});const save=()=>writeFile(`${out}/report.json`,JSON.stringify(report,null,2)+'\n');
const browser=await chromium.launch({channel:'chromium',headless:true});
try{
 for(const name of ['desktop','mobile']){
  const page=await browser.newPage({...devices[name==='mobile'?'Pixel 5':'Desktop Chrome'],viewport:name==='mobile'?{width:390,height:844}:{width:1280,height:800}}),downloads=[];
  page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
  page.on('response',r=>{if(r.url().endsWith(asset))downloads.push(r.body().then(b=>{assert.equal(r.status(),200);assert.equal(sha(b),sha(expected));report.network.push({name,url:r.url(),sha256:sha(b),bytes:b.length});}));});
  await page.addInitScript(()=>{performance.setResourceTimingBufferSize(10000);localStorage.clear();localStorage.setItem('gr.activeEpoch.v1','epoch-6-atomic');});
  await page.goto(`${base}/?debug&epoch=epoch-6-atomic&contract=e6-glow-mesa&nolevel&nopause&tier=full&seed=homemaker-9000`);
  await page.waitForFunction(()=>window.__GR_TEST__&&window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId==='e6-glow-mesa');
  await page.getByTestId('contract-briefing-dismiss').evaluate(el=>{if(el.getClientRects().length)el.click();});
  await page.evaluate(async()=>{
   const h=window.__GR_TEST__;h.setManualSim(true);await h.warmVfx();
   for(const [k,v] of Object.entries({'waves.waveInterval':.35,'waves.trickleInterval':999,'waves.pulseBase':0,'waves.pulsePerWave':0,'waves.aliveCap':20,'enemy.contactDamage':0,'sparkRig.range':0,'homemaker.arrivalSpeed':40,'homemaker.unbuildIntervalSeconds':999,'homemaker.rackIntervalSeconds':999}))h.setBalance(k,v);
   const w=window.__THREE_GAME_DIAGNOSTICS__.contract.baron.wave;h.setWave(w-1);h.advanceSim(.4);h.setBalance('waves.waveInterval',999);h.setWave(w);h.advanceSim(3.35);
  });
  await page.waitForFunction(()=>document.querySelector('canvas').dataset.homemaker3dState==='ready');
  async function capture(label,near=true){
   await page.evaluate(near=>{const p=window.__THREE_GAME_DIAGNOSTICS__.homemakerBoss.position;window.__GR_TEST__.teleport(p.x,p.z+(near?4:9));},near);
   if(name==='mobile'&&near)await page.locator('canvas').dispatchEvent('wheel',{deltaY:1000,deltaMode:0});
   const story=page.getByTestId('story-beat-card');for(let i=0;i<12&&await story.isVisible();i++){await page.mouse.click(6,6);await page.waitForTimeout(100);}
   await page.waitForFunction(()=>!document.querySelector('.hud--announcement-visible'),null,{timeout:30000});await page.waitForTimeout(500);
   let hiddenSince=0;const until=Date.now()+6000;
   while(Date.now()<until){
    if(await story.isVisible()){await page.mouse.click(6,6);hiddenSince=0;}else{hiddenSince ||= Date.now();if(Date.now()-hiddenSince>=750)break;}
    await page.waitForTimeout(100);
   }
   assert.equal(await story.isVisible(),false,'Capture after normal story-card dismissal');
   const data=await page.evaluate(()=>({diagnostics:window.__THREE_GAME_DIAGNOSTICS__.homemakerBoss,canvas:Object.fromEntries(Object.entries(document.querySelector('canvas').dataset).filter(([k])=>k.startsWith('homemaker3d'))),actors:window.__GR_TEST__.enemyPositions().filter(e=>e.variantId==='homemaker_9000'),resources:performance.getEntriesByType('resource').map(r=>r.name)}));
   assert.equal(data.canvas.homemaker3dState,'ready');assert.equal(data.canvas.homemaker3dSource,'glb');assert.equal(data.canvas.homemaker3dMounted,'true');assert.deepEqual(data.diagnostics.position,{x:8,z:4});assert(!data.resources.some(u=>new URL(u).pathname.startsWith('/src/')||u.includes('/@vite/')),'Must exercise bundle rather than development modules');
   const file=`${name}-${label}.png`;await page.screenshot({path:`${out}/${file}`});report.cases.push({name,label,file,...data});await save();
  }
  await capture('default',false);await capture('arrived');
  for(const id of name==='desktop'?['rack','vac','core']:['vac','rack','core']){
   await page.evaluate(id=>{const h=window.__GR_TEST__,s=JSON.parse(JSON.stringify(h.captureSuspend())),e=s.enemies.active.find(e=>e.variantId==='homemaker_9000'&&e.bossComponentId===id);if(!e)throw Error(`Missing ${id}`);e.hp=.01;if(!h.restoreSuspend(s))throw Error('Restore failed');const target=h.enemyPositions().find(e=>e.variantId==='homemaker_9000'&&e.bossComponentId===id);h.setBalance('blast.damage',1);h.launchBlastAt(target.x,target.z,.05);h.advanceSim(.4);},id);
   await page.waitForFunction(()=>document.querySelector('canvas').dataset.homemaker3dState==='ready');
   if(id==='core'){await page.keyboard.press('Space');await page.waitForFunction(()=>!window.__THREE_GAME_DIAGNOSTICS__.baronCeremony.active);const secure=page.getByTestId('claim-secured');if(await secure.isVisible())await page.getByTestId('stay-for-rush').click();}
   await capture(`${id}-destroyed`);
  }
  const final=report.cases.at(-1);assert.equal(final.diagnostics.poweredDown,true);assert.equal(final.diagnostics.chairPlaced,true);assert.equal(final.actors.length,0);assert.equal(final.canvas.homemaker3dPresentation,'chair');
  await Promise.all(downloads);assert(downloads.length>0);await page.close();
 }
 assert.deepEqual(report.errors,[]);assert.equal(report.cases.length,10);report.completed=true;
}catch(e){report.failure=e.stack;throw e;}finally{await save();await browser.close();}
