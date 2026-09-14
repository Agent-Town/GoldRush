// Real town captures with a test-only reference to its scene for sprite crops.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import sharp from 'sharp';
import { chromium } from 'playwright';
const phase=process.argv[2]??'after';
assert.ok(/^[a-z-]+$/.test(phase));
const tier=process.argv[3]??'full';assert.ok(['full','lite'].includes(tier));
const historical=phase==='old-posts';
const out=`artifacts/sol/sprite-roster-fixes-20260908/town-placement/${phase}-${tier}`;
fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'chromium'}),results=[];
try { for(const width of [390,1280]) {
  const page=await browser.newPage({viewport:{width,height:844},deviceScaleFactor:2}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await page.route('**/src/town/TownScene.ts*',async route=>{
    const response=await route.fetch();let body=await response.text();
    assert.ok(body.includes('publishDiagnostics() {'));
    if(historical){const old=body;body=body.replace('(actor.fullBody ? undefined : actor.portraitPost?.offset)','actor.portraitPost?.offset');assert.notEqual(body,old);}
    await route.fulfill({response,body:body.replace('publishDiagnostics() {','publishDiagnostics() { window.__townPlacementReview = this; window.__townPlacementFunction = townActorPlazaPlacement;')});
  });
  if(historical)await page.route('**/src/town/townLayout.ts*',async route=>{
    const response=await route.fetch(),body=await response.text();
    let patched=body.replace(/tavernkeeper:\s*{\s*x: 1\.6,\s*z: 2\.6\s*}/,'tavernkeeper: { x: 0.6, z: 2.25 }');
    assert.notEqual(patched,body);const tavernOnly=patched;
    patched=patched.replace(/storekeeper:\s*{\s*x: 1\.15,\s*z: 2\.7\s*}/,'storekeeper: { x: 1.15, z: 2 }');
    assert.notEqual(patched,tavernOnly);await route.fulfill({response,body:patched});
  });
  await page.addInitScript(tier=>{
    localStorage.clear();sessionStorage.clear();history.replaceState({goldRushScene:'menu'},'',location.href);
    localStorage.setItem('gr.performance.tier.v1',tier);
    localStorage.setItem('gr.profile.v2',JSON.stringify({version:2,activeId:'audit',profiles:[{id:'audit',name:'Audit',createdAt:1,updatedAt:1,difficultyPreset:'trail',hintsSeen:[]}]}));
    for(const [key,value] of Object.entries({'gr.meta.v1':JSON.stringify({version:1,tracks:{territory:10,science:10,hero:10,agent:10}}),'gr.town.name.v1':'Quartz Hill','gr.firstClaim.done.v1':'1','gr.townWelcome.seen.v1':'1'}))localStorage.setItem('gr.profile.v2.audit.'+key,value);
  },tier);
  await page.goto('http://127.0.0.1:5319/?debug');
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(()=>window.__GR_TOWN_DIAGNOSTICS__?.actors.filter(a=>a.visible&&a.loaded).length===10,null,{timeout:60000});
  if(tier==='full')await page.waitForFunction(()=>{
    const loaded=document.querySelector('canvas')?.dataset.town3dPilotLoadedIds?.split(',')??[];
    return ['tavern','general_store','schoolhouse','assay_office','claim_office','chapel','plate'].every(id=>loaded.includes(id));
  },null,{timeout:60000});
  const semantics=await page.evaluate(async()=>{
    const {TOWN_ACTORS}=await import('/src/town/townsfolk.ts'),place=window.__townPlacementFunction;
    const assayer=TOWN_ACTORS.find(a=>a.id==='assay_clerk'),offset={x:99,z:77};
    const normal=place(assayer),changed=place({...assayer,portraitPost:{offset}}),legacy=place({...assayer,fullBody:undefined,portraitPost:{offset}});
    const anchor=window.__GR_TOWN_DIAGNOSTICS__.buildings.find(b=>b.id===assayer.anchor).position;
    return {fullBodyIgnoresPortrait:JSON.stringify(normal.position)===JSON.stringify(changed.position),
      legacyPortraitRetained:legacy.position.x===anchor.x+offset.x&&legacy.position.z===anchor.z+offset.z,
      authoredLoopsRetained:TOWN_ACTORS.filter(a=>a.loop).every(a=>place(a)===a)};
  });
  assert.deepEqual(semantics,{fullBodyIgnoresPortrait:!historical,legacyPortraitRetained:true,authoredLoopsRetained:true});
  const actors=[];
  for(const id of ['tavernkeeper','storekeeper','elder','schoolteacher','preacher','assay_clerk']) {
    await page.evaluate(async id=>{
      const town=window.__townPlacementReview;town.loop.start();
      const d=window.__GR_TOWN_DIAGNOSTICS__,actor=d.actors.find(a=>a.id===id),building=d.buildings.find(b=>b.id===actor.anchor);
      // Frame each authored post from the same relative distance on narrow screens.
      const post=town.townActors.find(a=>a.definition.id===id).definition.position;
      d.teleport(post.x+.9,post.z+2);
      for(let i=0;i<100;i++)await new Promise(requestAnimationFrame);
      town.loop.stop();
      const runtime=town.townActors.find(a=>a.definition.id===id),loop=runtime.definition.loop;
      // Use the real patrol resolver at its first pause, independent of loading time.
      const cycle=loop?loop.seconds+Object.values(loop.pauses??{}).reduce((a,b)=>a+b,0):0;
      const elapsed=loop?(1-loop.phase)*cycle+.5:0;
      runtime.update(0,elapsed);runtime.update(.2,elapsed);
      const deadline=performance.now()+15000;
      while(runtime.frameKey!==runtime.requestedFrameKey){if(performance.now()>deadline)throw Error('post frame timeout');await new Promise(requestAnimationFrame)}
      runtime.update(0,elapsed);town.syncBlobShadows();town.publishDiagnostics();town.renderer.render(town.scene,town.camera);
      if(Math.hypot(runtime.position.x-runtime.definition.position.x,runtime.position.z-runtime.definition.position.z)>1e-6)throw Error(`${id}: capture missed standing post`);
    },id);
    const sample=await page.evaluate(id=>{
      const town=window.__townPlacementReview,actor=town.townActors.find(a=>a.definition.id===id),sprite=actor.group.getObjectByName(`TownActorSprite:${id}`);
      const center=sprite.getWorldPosition(sprite.position.clone()),scale=sprite.getWorldScale(sprite.scale.clone());
      const right=center.clone().setFromMatrixColumn(town.camera.matrixWorld,0),up=center.clone().setFromMatrixColumn(town.camera.matrixWorld,1);
      const corners=[];
      for(const x of [0,1])for(const y of [0,1]){
        const p=center.clone().addScaledVector(right,(x-sprite.center.x)*scale.x).addScaledVector(up,(y-sprite.center.y)*scale.y).project(town.camera);
        corners.push({x:(p.x+1)*innerWidth/2,y:(1-p.y)*innerHeight/2});
      }
      return {...window.__GR_TOWN_DIAGNOSTICS__.actors.find(a=>a.id===id),corners};
    },id);
    const renders=await page.evaluate(id=>{
      const town=window.__townPlacementReview,sprite=town.scene.getObjectByName(`TownActorSprite:${id}`);
      const render=()=>{town.renderer.render(town.scene,town.camera);return town.canvas.toDataURL('image/png').split(',')[1]};
      const normal=render(),depthTest=sprite.material.depthTest,order=sprite.renderOrder;
      sprite.visible=false;const background=render();sprite.visible=true;
      sprite.material.depthTest=false;sprite.renderOrder=1e6;const unobstructed=render();
      sprite.material.depthTest=depthTest;sprite.renderOrder=order;render();
      return {normal,background,unobstructed};
    },id);
    const pixels={};
    for(const [key,base64] of Object.entries(renders)) {
      const bytes=Buffer.from(base64,'base64');fs.writeFileSync(`${out}/${width}-${id}-${key}.png`,bytes);
      pixels[key]=await sharp(bytes).ensureAlpha().raw().toBuffer();
    }
    let fullPixels=0,visible=0;
    for(let p=0;p<pixels.normal.length;p+=4) {
      const changed=(a,b)=>Math.max(...[0,1,2].map(c=>Math.abs(a[p+c]-b[p+c])))>8;
      if(changed(pixels.unobstructed,pixels.background)){fullPixels++;if(changed(pixels.normal,pixels.background))visible++;}
    }
    sample.visibility={visible,full:fullPixels,ratio:fullPixels?visible/fullPixels:0};
    assert.ok(fullPixels>100,`${id} has no measurable sprite`);
    if(!historical)assert.ok(sample.visibility.ratio>=.98,`${id}: ${sample.visibility.ratio} visible in ${tier}`);
    const ui=`${out}/${width}-${id}-ui.png`;
    await page.screenshot({path:ui});
    const style=await page.addStyleTag({content:'body * { visibility:hidden !important; } canvas { visibility:visible !important; }'});
    const full=`${out}/${width}-${id}.png`;
    await page.screenshot({path:full});await style.evaluate(el=>el.remove());
    const left=Math.max(0,Math.floor(Math.min(...sample.corners.map(p=>p.x))*2)-35),top=Math.max(0,Math.floor(Math.min(...sample.corners.map(p=>p.y))*2)-35);
    const right=Math.min(width*2,Math.ceil(Math.max(...sample.corners.map(p=>p.x))*2)+35),bottom=Math.min(844*2,Math.ceil(Math.max(...sample.corners.map(p=>p.y))*2)+35);
    assert.ok(right>left&&bottom>top,`${id} off screen`);
    await sharp(full).extract({left,top,width:right-left,height:bottom-top}).resize({height:600}).toFile(`${out}/${width}-${id}-crop.png`);
    assert.ok(sample.loaded);actors.push(sample);
  }
  assert.deepEqual(errors,[]);results.push({width,tier,historical,semantics,actors,errors});console.log(width,`${actors.length} adult posts captured, ten actors loaded, zero errors`);
  await page.close();
} } finally {await browser.close()}
fs.writeFileSync(`${out}/results.json`,JSON.stringify(results,null,2)+'\n');
