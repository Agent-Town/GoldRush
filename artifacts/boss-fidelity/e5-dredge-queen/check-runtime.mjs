// Actual-game evidence. Candidate adoption is checked before any browser starts.
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { chromium, devices } from 'playwright';
const root='artifacts/boss-fidelity/e5-dredge-queen';
const output=resolve(process.argv.find(v=>v.startsWith('--out='))?.slice(6)??`${root}/runtime`);
const base=process.env.GR_CAPTURE_BASE_URL??'http://127.0.0.1:5246';
const sha=b=>createHash('sha256').update(b).digest('hex');
const asset='assets/pilots/dredge-queen-3d/dredge-queen-detail-opus5.glb';
const pairs=[[asset,`${root}/candidate-package/${asset}`],['src/systems/DredgeQueenBossSystem.ts',`${root}/candidate-runtime/DredgeQueenBossSystem.ts`],['vite.config.ts',`${root}/candidate-runtime/vite.config.ts`],['src/game/Game.ts',`${root}/candidate-runtime/Game.ts`]];
const source={},adoption=[];
for(const [production,candidate] of pairs){const a=await readFile(production),b=await readFile(candidate);source[production]=sha(a);adoption.push({production,equal:a.equals(b),candidateSha256:sha(b)});}
const contract=JSON.parse(await readFile(`${root}/candidate-package/assets/pilots/dredge-queen-3d/renders-fidelity-e5/contract.json`,'utf8'));
assert(contract.passed&&contract.assetSha256===adoption[0].candidateSha256,'Candidate export verification is stale');
if(process.argv.includes('--preflight')){console.log(JSON.stringify({ready:adoption.every(r=>r.equal),adoption,browserStarted:false},null,2));process.exit(0);}
assert(adoption.every(r=>r.equal),'Candidate is not adopted; browser not started');
await mkdir(output,{recursive:true});
const report={framing:process.argv.includes('--calibrated')?'Hero at ship center +1Z; mobile uses existing maximum zoom-out through wheel input; default HUD retained. Calibration framing, not arbitrary camera acceptance.':'Hero at ship center +9Z, default camera and HUD.',base,source,adoption,cases:[],errors:[],servedAssets:[],passed:false,scope:'Actual loaded meshes and game-camera screenshots through the unchanged debug harness. Health changes use existing save/restore and combat hooks. This is not full regression, a performance benchmark, or whole-game save-state equivalence.'};
const save=()=>writeFile(`${output}/report.json`,JSON.stringify(report,null,2)+'\n');
const browser=await chromium.launch({channel:'chromium',headless:true});
const offsets={claw:{x:-3.2,z:0},paddle_port:{x:-.3,z:-2.4},paddle_starboard:{x:-.3,z:2.4},hold:{x:1.8,z:0}};
async function initialise(page){
 await page.waitForFunction(()=>window.__GR_TEST__&&window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId==='e5-deepwater-claim');
 const brief=page.getByTestId('contract-briefing-dismiss');if(await brief.isVisible())await brief.evaluate(b=>b.click());
 const gameUrl=await page.evaluate(()=>performance.getEntriesByType('resource').map(e=>e.name).find(url=>new URL(url).pathname==='/src/game/Game.ts'));
 assert(gameUrl,'Loaded Game module URL missing');
 await page.evaluate(async url=>{
  const {Game}=await import(url),original=Game.prototype.warmCombatPools;
  Game.prototype.warmCombatPools=function(...args){window.__e5FidelityGame=this;Game.prototype.warmCombatPools=original;return original.apply(this,args);};
  const h=window.__GR_TEST__;h.setManualSim(true);
  for(const [key,value] of Object.entries({'dredgeQueen.approachSeconds':2,'dredgeQueen.clawCycleSeconds':1,'dredgeQueen.repositionEveryCycles':99,'enemy.contactDamage':0,'sparkRig.range':0,'sparkRig.damage':0}))h.setBalance(key,value);
  await h.warmVfx();
 },gameUrl);
 await page.waitForFunction(()=>window.__e5FidelityGame);
}
async function advance(page,seconds){await page.evaluate(t=>window.__GR_TEST__.advanceSim(t),seconds);}
async function mounted(page){await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.dredgeQueen3dState==='ready'&&document.querySelector('canvas')?.dataset.dredgeQueen3dMounted==='true',null,{timeout:30000});}
async function damage(page,id,lethal=false){
 const target=await page.evaluate(({id,lethal})=>{
  const h=window.__GR_TEST__,g=window.__e5FidelityGame,enemy=g.enemies.all.find(e=>e.isAlive&&e.variantId==='dredge_queen'&&e.bossComponentId===id);
  if(!enemy)throw new Error(`Missing target ${id}`);
  const save=structuredClone(h.captureSuspend());
  for(const row of save.enemies.active){if(row.variantId!=='dredge_queen')continue;const live=g.enemies.all.find(e=>e.isAlive&&e.variantId==='dredge_queen'&&e.bossComponentId===row.bossComponentId);row.hp=row.bossComponentId===id?(lethal ? .01 : live.maxHp*.4):live.maxHp;}
  if(!h.restoreSuspend(save))throw new Error('Target health restore failed');
  return {x:enemy.position.x,z:enemy.position.z};
 },{id,lethal});
 if(lethal)await page.evaluate(p=>{const h=window.__GR_TEST__;h.setBalance('blast.damage',1);h.launchBlastAt(p.x,p.z,.05);h.advanceSim(.3);},target);
 else await advance(page,1/30);
}
async function capture(page,viewport,label){
 const beat=page.getByTestId('story-beat-card');if(await beat.isVisible())await page.mouse.click(6,6);
 await page.evaluate(calibrated=>{const g=window.__e5FidelityGame,b=g.dredgeQueenBoss,p=b.dredgeQueen3dModel?.position??b.anchor;window.__GR_TEST__.teleport(p.x,p.z+(calibrated?1:9));},process.argv.includes('--calibrated'));
 if(process.argv.includes('--calibrated')&&viewport==='mobile')await page.locator('canvas').dispatchEvent('wheel',{deltaY:1000,deltaMode:0});
 await page.waitForTimeout(500);
 if(label==='hulk'||label==='persistent-wreck'){
  await page.getByTestId('story-beat-card').waitFor({state:'hidden',timeout:30000});
  await page.waitForFunction(()=>!document.querySelector('.hud--announcement-visible'),null,{timeout:30000});
 }
 const state=await page.evaluate(offsets=>{
  const g=window.__e5FidelityGame,b=g.dredgeQueenBoss,model=b.dredgeQueen3dModel;
  if(!model?.visible)throw new Error('Loaded boss model is not visible');
  g.scene.updateMatrixWorld(true);g.camera.updateMatrixWorld(true);
  const screen={minX:Infinity,minY:Infinity,maxX:-Infinity,maxY:-Infinity},world={minY:Infinity,maxY:-Infinity},meshes=[];
  for(const [id,mesh] of b.dredgeQueen3dMeshes){
   const point=mesh.position.clone(),position=mesh.geometry.getAttribute('position');let displaced=0,maxDisplacement=0;
   for(let i=0;i<position.count;i++){
    mesh.getVertexPosition(i,point);const distance=Math.hypot(point.x-position.getX(i),point.y-position.getY(i),point.z-position.getZ(i));if(distance>1e-6)displaced++;maxDisplacement=Math.max(maxDisplacement,distance);
    point.applyMatrix4(mesh.matrixWorld);world.minY=Math.min(world.minY,point.y);world.maxY=Math.max(world.maxY,point.y);point.project(g.camera);
    const x=(point.x+1)*innerWidth/2,y=(1-point.y)*innerHeight/2;screen.minX=Math.min(screen.minX,x);screen.maxX=Math.max(screen.maxX,x);screen.minY=Math.min(screen.minY,y);screen.maxY=Math.max(screen.maxY,y);
   }
   const m=mesh.material;meshes.push({id,visible:mesh.visible,triangles:(mesh.geometry.index?.count??position.count)/3,morph:mesh.morphTargetInfluences[0],displaced,maxDisplacement,map:m.map?.uuid,emission:m.emissiveIntensity,color:m.emissive.getHexString()});
  }
  const barPoint=g.enemies.bossHpGroup.position.clone().project(g.camera);
  const targets=g.enemies.all.filter(e=>e.isAlive&&e.variantId==='dredge_queen').map(e=>{const o=offsets[e.bossComponentId],rendered=g.enemies.renderPositionOf(e);return {id:e.bossComponentId,position:e.position.toArray(),renderPosition:rendered.toArray(),hitRadius:e.hitRadius,hp:e.currentHp,maxHp:e.maxHp,error:Math.hypot(rendered.x-model.position.x-o.x,rendered.z-model.position.z-o.z)};});
  return {barAnchorScreen:{x:(barPoint.x+1)*innerWidth/2,y:(1-barPoint.y)*innerHeight/2},boundsHeight:b.dredgeQueen3dBounds?.getSize(model.position.clone()).y,hullPointCount:b.dredgeQueen3dBarPoints?.length,diagnostics:b.diagnostics(),modelPosition:model.position.toArray(),meshes,targets,screen,world,viewport:{width:innerWidth,height:innerHeight,devicePixelRatio,userAgent:navigator.userAgent},camera:{position:g.camera.position.toArray(),quaternion:g.camera.quaternion.toArray(),zoom:g.camera.zoom},renderer:g.renderer.info.memory,bar:window.__THREE_GAME_DIAGNOSTICS__.readability.bossHpBar};
 },offsets);
 const file=`${viewport}-${label}.png`;await page.screenshot({path:`${output}/${file}`});
 report.cases.push({viewportName:viewport,label,file,sha256:sha(await readFile(`${output}/${file}`)),...state});await save();return state;
}
try{
 if(process.argv.includes('--motion')){
  await motion();
  assert.deepEqual(report.errors,[]);
  report.passed=true;
 }else if(process.argv.includes('--lifecycle')){
  await lifecycle();
  assert.deepEqual(report.errors,[]);
  report.passed=true;
 }else{
 for(const [name,viewport] of [['desktop',{width:1280,height:800}],['mobile',{width:390,height:844}]]){
  const page=await browser.newPage({...devices[name==='mobile'?'Pixel 5':'Desktop Chrome'],viewport});const pending=[];
  page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
  page.on('response',r=>{if(new URL(r.url()).pathname===`/${asset}`)pending.push(r.body().then(bytes=>report.servedAssets.push({viewport:name,url:r.url(),status:r.status(),sha256:sha(bytes)})).catch(e=>report.errors.push(e.message)));});
  await page.addInitScript(()=>{performance.setResourceTimingBufferSize(10000);if(!sessionStorage.getItem('e5-fidelity')){localStorage.clear();sessionStorage.setItem('e5-fidelity','1');}localStorage.setItem('gr.activeEpoch.v1','epoch-5-deepwater');});
  await page.goto(`${base}/?debug&epoch=epoch-5-deepwater&contract=e5-deepwater-claim&nolevel&nopause&tier=full&seed=dredge-queen`);
  await initialise(page);await page.evaluate(()=>window.__GR_TEST__.advanceSim(Math.max(0,8.05-window.__THREE_GAME_DIAGNOSTICS__.timeAlive)));await mounted(page);await capture(page,name,'approach');
  await advance(page,2.1);await capture(page,name,'intact');
  for(const id of ['claw','paddle_port','paddle_starboard']){await damage(page,id);await capture(page,name,`${id}-half`);}
  await damage(page,'claw',true);await damage(page,'paddle_port',true);await capture(page,name,'sole-starboard');
  await damage(page,'paddle_starboard',true);await capture(page,name,'act2-hold');
  await damage(page,'hold');await capture(page,name,'hold-half');
  await damage(page,'hold',true);await page.keyboard.press('Space');await page.waitForFunction(()=>!window.__THREE_GAME_DIAGNOSTICS__.baronCeremony.active);
  const secured=page.getByTestId('claim-secured');if(await secured.isVisible())await page.getByTestId('stay-for-rush').click();
  await advance(page,12);
  const wreck=await capture(page,name,'hulk');
  await page.reload();await initialise(page);await mounted(page);const restored=await capture(page,name,'persistent-wreck');
  assert(restored.diagnostics.persistentWreck);assert.deepEqual(restored.diagnostics.anchor,wreck.diagnostics.anchor);
  await Promise.all(pending);await page.close();
 }
 const broken={approach:[],intact:[],'claw-half':['claw'],'paddle_port-half':['paddle_port'],'paddle_starboard-half':['paddle_starboard'],'sole-starboard':['claw','paddle_port'],'act2-hold':['claw','paddle_port','paddle_starboard'],'hold-half':Object.keys(offsets),hulk:Object.keys(offsets),'persistent-wreck':Object.keys(offsets)};
 for(const row of report.cases){for(const mesh of row.meshes){const expected=broken[row.label].includes(mesh.id)?1:0;assert.equal(mesh.morph,expected,`${row.label}/${mesh.id}: actual morph disagrees`);assert.equal(mesh.displaced>0,Boolean(expected),`${row.label}/${mesh.id}: actual vertices do not match the damage state`);}assert.equal(row.meshes.length,4);assert.equal(row.meshes.reduce((sum,m)=>sum+m.triangles,0),contract.checked.triangles);assert.equal(new Set(row.meshes.map(m=>m.map)).size,1);assert(row.meshes.every(m=>m.visible&&Number.isFinite(m.maxDisplacement)));assert(row.targets.every(t=>t.error<.05),`${row.viewport}/${row.label}: targets drift from model`);}
 assert(report.servedAssets.length>=2);assert(report.servedAssets.every(r=>r.status===200&&r.sha256===source[asset]));assert.deepEqual(report.errors,[]);
 report.passed=true;
 }
}catch(error){report.failure=error.stack;throw error;}finally{await save();await browser.close();}

async function lifecycle(){
 report.scope='Actual-game loader failure, delayed-load damage, reset cancellation and disposal checks. Not a performance benchmark or full save/resume equivalence.';
 const oldAsset=await readFile(`${root}/lifecycle-fixtures/original-production.glb`);
 for(const mode of ['lite','invalid','wrong-contract','late-claw','late-port','late-starboard','late-hold','reset','loaded-reset']){
  let release,requests=0;const held=new Promise(resolve=>{release=resolve;});
  const page=await browser.newPage({...devices['Desktop Chrome'],viewport:{width:1280,height:800}});
  page.on('pageerror',e=>report.errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
  await page.route('**/dredge-queen-detail-opus5.glb*',async route=>{
   requests++;
   if(mode==='invalid'||mode==='lite')return route.fulfill({status:200,contentType:'model/gltf-binary',body:'invalid'});
   if(mode==='wrong-contract')return route.fulfill({status:200,contentType:'model/gltf-binary',body:oldAsset});
   if(mode!=='loaded-reset')await held;
   await route.continue();
  });
  const item={mode};report.cases.push(item);
  const inspect=()=>page.evaluate(()=>{
   const b=window.__e5FidelityGame.dredgeQueenBoss;
   return {state:b.dredgeQueen3dState,model:Boolean(b.dredgeQueen3dModel),meshes:b.dredgeQueen3dMeshes.size,
    modelChildren:b.group.children.filter(child=>child.name==='DredgeQueen3d').length,
    primitiveVisible:b.barge.visible&&b.bargePrimitive.visible,
    morphs:Object.fromEntries([...b.dredgeQueen3dMeshes].map(([id,m])=>[id,m.morphTargetInfluences[0]]))};
  });
  try{
   const tier=mode==='lite'?'lite':'full';
   await page.addInitScript(tier=>{performance.setResourceTimingBufferSize(10000);localStorage.clear();localStorage.setItem('gr.activeEpoch.v1','epoch-5-deepwater');localStorage.setItem('gr.performance.tier.v1',tier);},tier);
   await page.goto(`${base}/?debug&epoch=epoch-5-deepwater&contract=e5-deepwater-claim&nolevel&nopause&tier=${tier}&seed=dredge-queen`);
   await initialise(page);await page.evaluate(()=>window.__GR_TEST__.advanceSim(Math.max(0,10.2-window.__THREE_GAME_DIAGNOSTICS__.timeAlive)));
   const expected=mode==='lite'?'lite':['invalid','wrong-contract'].includes(mode)?'failed':mode==='loaded-reset'?'ready':'loading';
   await page.waitForFunction(state=>window.__e5FidelityGame.dredgeQueenBoss.dredgeQueen3dState===state,expected);
   item.before=await inspect();
   if(mode!=='loaded-reset'){assert.equal(item.before.model,false);assert(item.before.primitiveVisible);}
   if(mode.startsWith('late-')){
    if(mode==='late-hold'){await damage(page,'paddle_port',true);await damage(page,'paddle_starboard',true);}
    else await damage(page,{'late-claw':'claw','late-port':'paddle_port','late-starboard':'paddle_starboard'}[mode]);
    release();await mounted(page);item.after=await inspect();
    assert.equal(item.after.modelChildren,1);assert.equal(item.after.meshes,4);assert.equal(item.after.primitiveVisible,false);
    const damaged=mode==='late-hold'?['paddle_port','paddle_starboard']:[{'late-claw':'claw','late-port':'paddle_port','late-starboard':'paddle_starboard'}[mode]];
    for(const id of damaged)assert.equal(item.after.morphs[id],1);
   }else if(mode==='reset'||mode==='loaded-reset'){
    if(mode==='loaded-reset')await page.evaluate(()=>{
     const model=window.__e5FidelityGame.dredgeQueenBoss.dredgeQueen3dModel,resources=new Set();
     model.traverse(m=>{if(m.isMesh){resources.add(m.geometry);resources.add(m.material);resources.add(m.material.map);}});
     window.__e5Disposals=[...resources].map(r=>{const item={type:r.isTexture?'texture':r.isMaterial?'material':'geometry',count:0};r.addEventListener('dispose',()=>item.count++);return item;});
    });
    await page.evaluate(()=>{window.__GR_TEST__.resetRun();window.__GR_TEST__.setManualSim(true);});
    release();await page.waitForTimeout(1500);item.after=await inspect();
    assert.equal(item.after.state,'off');assert.equal(item.after.model,false);assert.equal(item.after.meshes,0);assert.equal(item.after.modelChildren,0);
    if(mode==='loaded-reset'){item.disposals=await page.evaluate(()=>window.__e5Disposals);assert.equal(item.disposals.length,9);assert(item.disposals.every(r=>r.count>=1));}
   }
   item.requests=requests;if(mode==='lite')assert.equal(requests,0);else assert(requests>0);
  }finally{release();await save();await page.close();}
 }
}

async function motion(){
 report.scope='Actual Game simulation, pool movement and post-interpolation presentation at alpha 0, 0.5 and 1. Covers approach, automatic reposition, a missing paddle and a sole survivor. Explicitly calls the existing reposition method for the sole survivor because dredging stops without a claw. Not a full save-envelope equivalence check.';
 const page=await browser.newPage({...devices['Desktop Chrome'],viewport:{width:1280,height:800}});
 page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
 await page.addInitScript(()=>{performance.setResourceTimingBufferSize(10000);localStorage.clear();localStorage.setItem('gr.activeEpoch.v1','epoch-5-deepwater');});
 await page.goto(`${base}/?debug&epoch=epoch-5-deepwater&contract=e5-deepwater-claim&nolevel&nopause&tier=full&seed=dredge-queen`);
 await initialise(page);await page.evaluate(()=>{const h=window.__GR_TEST__;h.setBalance('dredgeQueen.repositionEveryCycles',2);h.advanceSim(Math.max(0,8.05-window.__THREE_GAME_DIAGNOSTICS__.timeAlive));});await mounted(page);
 async function sample(label,seconds){
  const result=await page.evaluate(({offsets,seconds})=>{
   const g=window.__e5FidelityGame,b=g.dredgeQueenBoss,h=window.__GR_TEST__,rows=[],start=b.diagnostics();
   for(let tick=0;tick<seconds*30;tick++){
    h.advanceSim(1/30);const before=JSON.stringify(b.diagnostics());
    for(const alpha of [0,.5,1]){
     g.applyRenderInterpolation(alpha);
     const targets=g.enemies.all.filter(e=>e.isAlive&&e.variantId==='dredge_queen').map(e=>{const p=g.enemies.renderPositionOf(e),o=offsets[e.bossComponentId],m=b.dredgeQueen3dModel.position;return {id:e.bossComponentId,error:Math.hypot(p.x-m.x-o.x,p.z-m.z-o.z)};});
     rows.push({tick,alpha,act:b.diagnostics().act,position:b.dredgeQueen3dModel.position.toArray(),targets});
     if(JSON.stringify(b.diagnostics())!==before)throw new Error('Render interpolation advanced encounter state');
    }
   }
   return {start,end:b.diagnostics(),rows};
  },{offsets,seconds});
  result.label=label;result.maxError=Math.max(...result.rows.flatMap(r=>r.targets.map(t=>t.error)));assert(result.maxError<.05,label+' moving target alignment');report.cases.push(result);await save();
 }
 await sample('approach-and-automatic-reposition',14);
 assert(report.cases[0].end.repositions>=3);
 await damage(page,'paddle_port',true);await sample('port-destroyed',6);
 await damage(page,'claw',true);await page.evaluate(()=>window.__e5FidelityGame.dredgeQueenBoss.reposition());await sample('sole-starboard',4);
 assert(report.cases.at(-1).rows.every(r=>r.targets.length===1&&r.targets[0].id==='paddle_starboard'));
 await capture(page,'desktop','motion-final');await page.close();
}
