// Real EnemyPool movement plus adversarial per-body cursor/material checks.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
const out=process.env.GOLD_RUSH_SPRITE_EVIDENCE??'artifacts/sol/sprite-roster-fixes-20260908/enemy-regression';
fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch();const reports=[];
try{
 for(const [width,instancing]of [[1280,false],[390,true]]){
  const page=await browser.newPage({viewport:{width,height:width===390?844:800},deviceScaleFactor:2});const errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  const url=new URL(process.env.GOLD_RUSH_REVIEW_URL??'http://127.0.0.1:5319/');url.search=`?debug&nowaves&nolevel${instancing?'&spriteinstancing':''}`;
  await page.goto(url.href);await page.waitForFunction(()=>window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.hero']?.loaded);await page.keyboard.press('KeyP');
  const results=await page.evaluate(async({width})=>{
   const THREE=await import('/node_modules/.vite/deps/three.js');const {EnemyPool}=await import('/src/entities/pools.ts');
   const check=(value,message)=>{if(!value)throw Error(message)};
   const renderer=new THREE.WebGLRenderer({preserveDrawingBuffer:true});const height=Math.round(width*.5);renderer.setSize(width,height);renderer.setClearColor('#ded5b9');
   const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-4,4,2,-2,.1,100);camera.position.set(0,4,9);camera.lookAt(0,.7,0);
   const host=document.createElement('div');host.id='enemy-regression';Object.assign(host.style,{position:'absolute',top:'0',left:'0',zIndex:'999999',background:'#ded5b9',color:'#222'});document.body.append(host);
   const pool=new EnemyPool(camera);scene.add(pool.group);
   // A fallback may draw under tint before its per-body animator is ready.
   const tinted=pool.spawn(new THREE.Vector3());const batch=pool.generatedSprites;
   const tintStart=performance.now();
   while(!batch.isLoaded){await new Promise(requestAnimationFrame);if(performance.now()-tintStart>45000)throw Error('tint fixture load timeout')}
   const sprite=batch.group.children[tinted.id],base=batch.material.color.toArray();
   batch.setTintScalar(tinted.id,.5);sprite.onBeforeRender();const expected=batch.material.color.toArray();
   pool.ensureSpriteAnimation(tinted);sprite.onBeforeRender();
   check(sprite.material.color.toArray().every((v,i)=>Math.abs(v-expected[i])<1e-6),'cloned material applied fallback tint twice');
   batch.setTintScalar(tinted.id,1);sprite.onBeforeRender();
   check(sprite.material.color.toArray().every((v,i)=>Math.abs(v-base[i])<1e-6),'cloned material retained old tint after light restored');
   pool.recycleAll();const cases=[
    ['base',{},'char.bandit_base',true],['thief',{thief:true},'char.bandit_thief',true],
    ['rail_tough',{variantId:'rail_tough'},'char.e2.rail_tough',true],
    ['steam_wrecker',{variantId:'steam_wrecker',wrecker:true},'char.e2.steam_wrecker',true],
    ['coal_thief',{variantId:'coal_thief',thief:true},'char.e2.coal_thief',true],
    ['baron',{eliteKind:'baron'},'char.baron',true],
    ...[['e6','feral_toaster'],['e6','lawn_shepherd'],['e6','glowjack'],['e7','rogue_automaton'],['e7','data_rustler'],['e8','scrap_corsair'],['e8','sun_glare_shambler'],['e9','feral_terraformer'],['e9','claim_jump_prospect_drone']].map(([epoch,id])=>[id,{variantId:id},`char.${epoch}.${id}`,['feral_toaster','lawn_shepherd','glowjack','rogue_automaton','data_rustler','scrap_corsair','sun_glare_shambler','feral_terraformer','claim_jump_prospect_drone'].includes(id)])
   ];const results=[];
   for(const [name,params,slot,directional]of cases){
    pool.recycleAll();const a=pool.spawn(new THREE.Vector3(-2,0,0),{...params,carriedLantern:false}),b=pool.spawn(new THREE.Vector3(2,0,0),{...params,carriedLantern:false});
    const tick=()=>{pool.update(1/60,e=>new THREE.Vector3(e.id===a.id?8:-8,0,0),()=>false);a.group.position.set(-2,0,0);b.group.position.set(2,0,0);pool.applyRenderInterpolation(1)};
    const start=performance.now();
    do{tick();await new Promise(requestAnimationFrame);if(performance.now()-start>45000)throw Error(`load timeout ${name}`)}while([a,b].some(e=>{const s=pool.spriteAnimations.get(e.id);return s?.slotId!==slot||!s.animator.currentFrame}));
    for(let i=0;i<30;i++)tick();
    const sa=pool.spriteAnimations.get(a.id),sb=pool.spriteAnimations.get(b.id);
    check(sa.sprite.isSprite&&sb.sprite.isSprite,`${name}: animated body entered unsupported instanced path`);
    check(sa.animator!==sb.animator&&sa.sprite.material!==sb.sprite.material,`${name}: shared body state`);
    check(a.animationOrientation==='e'&&b.animationOrientation==='w',`${name}: bad movement fixture`);
    if(directional)check(sa.animator.currentDirection==='e'&&sb.animator.currentDirection==='w',`${name}: heading copied from sibling`);
    renderer.render(scene,camera);
    const title=document.createElement('div');title.textContent=`${name}: east / west${directional?'':' (directional art still missing)'}`;title.style.font='14px sans-serif';host.append(title);
    const img=new Image();img.src=renderer.domElement.toDataURL();img.style.width=width+'px';host.append(img);
    const snapshot=s=>({direction:s.animator.currentDirection,clip:s.animator.clipName,source:s.animator.currentFrame.key,frame:s.animator.frameIndex,material:s.sprite.material.uuid,atlas:s.sprite.material.map.source.uuid});
    const opposing=[snapshot(sa),snapshot(sb)];const drawCalls=renderer.info.render.calls;
    // Same atlas, different time: updating B must not alter A's selected pixels.
    sa.animator.reset('walk');sb.animator.reset('walk');
    sa.animator.update(0,'walk','e',false,3,3);sb.animator.update(0,'walk','e',false,3,3);
    const first=sa.sprite.material.map;const before=[...first.offset.toArray(),...first.repeat.toArray()];
    for(let i=0;i<20&&sb.sprite.material.map===first;i++)sb.animator.update(.08,'walk','e',false,3,3);
    const second=sb.sprite.material.map;
    check(first.source===second.source,`${name}: duplicated atlas source`);
    check(JSON.stringify(before)===JSON.stringify([...first.offset.toArray(),...first.repeat.toArray()]),`${name}: B changed A's UV`);
    check(first!==second,`${name}: no independent frame reached`);
    const immutable=JSON.stringify(before)===JSON.stringify([...first.offset.toArray(),...first.repeat.toArray()]);
    // A stop and an action on B must not alter either actor's sibling state.
    sa.animator.update(0,'idle','e');const held=sa.animator.currentFrame;
    sb.animator.update(.05,'grab','w');check(sa.animator.clipName==='idle'&&sb.animator.clipName==='grab',`${name}: shared clip`);
    sb.animator.update(.05,'walk','e');check(sa.animator.currentFrame===held,`${name}: sibling changed held idle`);
    const oldMaterial=sa.sprite.material;let disposed=false;oldMaterial.addEventListener('dispose',()=>disposed=true);
    pool.recycle(a);check(!pool.spriteAnimations.has(a.id)&&disposed,`${name}: recycled state leaked`);
    const replacement=pool.spawn(new THREE.Vector3(-2,0,0),params,a.id);check(replacement===a,`${name}: slot not reused`);
    tick();const replaced=pool.spriteAnimations.get(a.id);check(replaced&&replaced.animator!==sa.animator&&replaced.sprite.material!==oldMaterial,`${name}: reused stale cursor/material`);
    results.push({name,slot,opposing,drawCalls,immutableUv:immutable,independentClip:true,recycled:true,directionalArt:directional});
   }
   // Warm the same scene through repeated cycles, then ensure GPU allocations stay bounded.
   pool.recycleAll();const a=pool.spawn(new THREE.Vector3(-2,0,0),{carriedLantern:false}),b=pool.spawn(new THREE.Vector3(2,0,0),{carriedLantern:false});
   for(let i=0;i<8;i++){pool.update(1/60,new THREE.Vector3(10,0,0),()=>false);await new Promise(requestAnimationFrame)}
   const advance=()=>{for(let i=0;i<240;i++){pool.update(1/60,new THREE.Vector3(10,0,0),()=>false);a.group.position.set(-2,0,0);b.group.position.set(2,0,0);pool.applyRenderInterpolation(1);renderer.render(scene,camera)}};
   advance();const warm=renderer.info.memory.textures;advance();const final=renderer.info.memory.textures;check(final===warm,`GPU textures grow after warm-up ${warm}->${final}`);
   pool.recycleAll();check(pool.spriteAnimations.size===0,'empty pool retains animation owners');pool.dispose();renderer.dispose();
   await Promise.all([...host.querySelectorAll('img')].map(i=>i.decode()));return{cases:results,textures:{warm,final},emptyPoolOwners:0};
  },{width});
  await page.locator('#enemy-regression').screenshot({path:path.join(out,`families-${width}.png`)});
  assert.deepEqual(errors,[]);assert.equal(results.cases.length,15);reports.push({width,instancing,errors,...results});console.log(JSON.stringify({width,cases:results.cases.length,textures:results.textures}));await page.close();
 }
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(reports,null,2)+'\n');
}finally{await browser.close()}
