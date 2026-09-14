import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright';
const base=process.env.GOLD_RUSH_REVIEW_URL??'http://127.0.0.1:5319/';
const slots=JSON.parse(fs.readFileSync('assets/layer-contracts/characters.v2.json')).slots.map(s=>s.slot);
const browser=await chromium.launch({channel:'chromium'});const evidence=[];
try{
 for(const [epoch,age] of [['epoch-1-frontier','young'],['epoch-6-atomic','midlife'],['epoch-8-orbital','silver'],['epoch-10-deepsky','elder']]){
  const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  const url=new URL(base);url.search=new URLSearchParams({debug:'',nowaves:'',nolevel:'',epoch,seed:'idle-regression'}).toString();
  await page.goto(url.href);await page.getByRole('button',{name:'Begin',exact:true}).click();
  await page.waitForFunction(()=>window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.hero']?.loaded);
  for(const keys of [['KeyS','KeyD'],['KeyW','KeyD'],['KeyW','KeyA'],['KeyS','KeyA']]){
   for(const key of keys)await page.keyboard.down(key);
   await page.evaluate(async()=>{for(let i=0;i<30;i++)await new Promise(requestAnimationFrame)});
   const direction=await page.evaluate(()=>window.__THREE_GAME_DIAGNOSTICS__.spriteAnimations['char.hero'].direction);
   for(const key of keys)await page.keyboard.up(key);
   await page.waitForFunction(()=>window.__THREE_GAME_DIAGNOSTICS__.spriteAnimations['char.hero'].clip==='idle');
   const stopped=await page.evaluate(()=>{const d=window.__THREE_GAME_DIAGNOSTICS__.spriteAnimations['char.hero'];return{direction:d.direction,source:d.sourceFrameKey,frames:d.frameCount}});
   assert.equal(stopped.direction,direction,`${age}: stopping changed the heading`);assert.equal(stopped.frames,1);
   assert.ok(age==='young'?stopped.source.includes('char-hero-sheet-walk'):stopped.source.includes(`char-hero-${age}-sheet-walk`),`${age}: wrong idle identity ${stopped.source}`);
   evidence.push({age,keys,stopped});
  }
  await page.keyboard.press('KeyP');
  if(age==='young'){
   const rows=await page.evaluate(async slots=>{
    const THREE=await import('/node_modules/.vite/deps/three.js');
    const {SpriteAnimator,spriteAnimationDiagnostics}=await import('/src/assets/SpriteAnimator.ts');const result=[];
    for(const id of slots){
     const material=new THREE.SpriteMaterial(),animator=new SpriteAnimator(id,material);const start=performance.now();
     do{animator.update(1/60,'walk','s');await new Promise(requestAnimationFrame);if(performance.now()-start>45000)throw Error(`load timeout ${id}`)}while(!spriteAnimationDiagnostics()[id]?.loaded);
     for(const direction of ['s','sw','w','nw','n','ne','e','se']){
      const walk=new Set();for(let i=0;i<128;i++){animator.update(1/30,'walk',direction);const d=spriteAnimationDiagnostics()[id];walk.add(d.sourceFrameKey??d.frameKey)}
      animator.update(0,'idle',direction);const idle=[];for(let i=0;i<32;i++){animator.update(1/30,'idle',direction);const d=spriteAnimationDiagnostics()[id];idle.push({source:d.sourceFrameKey??d.frameKey,count:d.frameCount})}
      result.push({id,direction,walk:[...walk],idle});
     }
     animator.dispose();material.dispose();
    }
    return result;
   },slots);
   for(const row of rows){assert.equal(new Set(row.idle.map(f=>f.source)).size,1,`${row.id}: idle cycles`);assert.equal(row.idle[0].count,1);assert.ok(row.walk.includes(row.idle[0].source),`${row.id}/${row.direction}: idle switches sprite family`)}
   evidence.push({roster:rows.length,slots:slots.length});
  }
  assert.deepEqual(errors,[],`${age}: browser errors`);await page.close();
 }
 console.log(JSON.stringify(evidence,null,2));
}finally{await browser.close()}
