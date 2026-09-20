// Same-page A/B alternation isolates host drift. Only the measured rendering is switched.
import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chromium'});
const root='artifacts/sol/map-art-campaign-2';
try {
 for(const id of (process.env.MAPS??'e5-deepwater-claim').split(',')) {
  const rows=[];
  for(const width of [1280,390]) {
   const page=await browser.newPage({viewport:{width,height:width===390?844:800},deviceScaleFactor:1,isMobile:width===390,hasTouch:width===390});
   page.setDefaultNavigationTimeout(120000);
   const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   await page.route('**/src/world/Water.ts*',async route=>{
    const response=await route.fetch();let body=await response.text();
    for(const prefix of ['// Cross-fade','// Sparse moving']) {
     const needle='${config.openSea ? `  '+prefix;
     assert.equal(body.split(needle).length,2);
     body=body.replace(needle,'${config.openSea && !window.__SEA_BASELINE__ ? `  '+prefix);
    }
    const needle='if (config.openSea) {';assert.equal(body.split(needle).length,2);
    body=body.replace(needle,`if (config.openSea) {
      const still = config.rippleStrength === 0.04;
      window.__SEA_CONTROL__ = before => {
        window.__SEA_BASELINE__ = before;
        config.textureBlend = before ? (still ? .25 : .35) : (still ? .06 : .10);
        material.opacity = before ? (still ? .78 : .72) : (still ? .62 : .56);
        material.needsUpdate = true;
        window.__SEA_APRON_CONTROL__?.(before);
      };`);
    await route.fulfill({response,body});
   });
   await page.route('**/src/world/Terrain3dClaimPilot.ts*',async route=>{
    const response=await route.fetch();let body=await response.text();
    const from=body.indexOf('function routeSeaApron('), to=body.indexOf('function preparePanorama(',from);
    assert.ok(from>=0&&to>from);
    let apron=body.slice(from,to);
    assert.equal(apron.split('mesh.geometry = routed;').length,2);
    apron=apron.replace('mesh.geometry = routed;',`mesh.userData.seaApronProbe = { beforeGeometry: geometry, afterGeometry: routed, beforeMaterial: mesh.material[0], afterMaterial: mesh.material }; mesh.geometry = routed;`)
      .replace('geometry.dispose();','');
    body=body.slice(0,from)+apron+body.slice(to);
    const needle='water.advance(delta);';assert.equal(body.split(needle).length,2);
    body=body.replace(needle,`${needle}
      if (!window.__SEA_APRON_CONTROL__) window.__SEA_APRON_CONTROL__ = before => host.scene.traverse(mesh => {
        const p = mesh.userData.seaApronProbe;
        if (p) { mesh.geometry = before ? p.beforeGeometry : p.afterGeometry; mesh.material = before ? p.beforeMaterial : p.afterMaterial; }
      });
      for (const contact of hullContacts) contact.visible = !window.__SEA_BASELINE__;`);
    await route.fulfill({response,body});
   });
   await page.goto(`http://127.0.0.1:5303/?debug&contract=${id}&seed=map-art-campaign-2&nowaves&nolevel&nokill&nopause&tier=full`);
   await page.waitForFunction(()=>window.__GR_TEST__,null,{timeout:60000});
   await page.evaluate(()=>window.__GR_TEST__.setManualSim(true));
   await page.waitForFunction(()=>window.__SEA_CONTROL__ && document.querySelector('#game-canvas')?.dataset.terrain3dPilotLandmarkLoadState==='mounted',null,{timeout:120000});
   if (await page.getByTestId('contract-briefing-dismiss').isVisible()) await page.getByTestId('contract-briefing-dismiss').click();
   await page.evaluate(()=>window.__GR_GUI__?.hide());
   for(const before of [true,false]) { await page.evaluate(b=>window.__SEA_CONTROL__(b),before);await page.waitForTimeout(1500); }
   const runs=[];
   for(let cycle=0;cycle<4;cycle++) for(const before of [true,false]) {
    await page.evaluate(b=>window.__SEA_CONTROL__(b),before);await page.waitForTimeout(500);
    const stats=await page.evaluate(async()=>{
     const samples=[];let last=performance.now();
     await new Promise(resolve=>{const tick=now=>{samples.push(now-last);last=now;if(samples.length<180)requestAnimationFrame(tick);else resolve();};requestAnimationFrame(tick);});
     samples.sort((a,b)=>a-b);
     return {p95:samples[Math.floor(samples.length*.95)],median:samples[90],renderer:window.__GR_TEST__.renderCensus().renderer};
    });
    runs.push({cycle,arm:before?'before':'after',...stats});
    if(cycle===0) await page.screenshot({path:`${root}/${id}/${before?'before':'after'}-controlled-${width}.png`});
   }
   rows.push({width,runs,errors});writeFileSync(`${root}/${id}/performance-interleaved.json`,JSON.stringify(rows,null,2));
   console.log(id,width,runs.map(r=>`${r.arm}:${r.p95.toFixed(1)}/${r.renderer.calls}`).join(' '));
   assert.deepEqual(errors,[]);
   if (id === 'e5-deepwater-claim') {
    for (const station of [{id:'reef',x:0,z:-6},{id:'drowned-office',x:-32,z:-14}]) {
     await page.evaluate(({x,z})=>window.__GR_TEST__.teleport(x,z),station);
     for (const before of [true,false]) {
      await page.evaluate(b=>window.__SEA_CONTROL__(b),before);await page.waitForTimeout(800);
      await page.screenshot({path:`${root}/${id}/${before?'before':'after'}-final-station-${station.id}-${width}.png`});
     }
    }
   }
   await page.close();
  }
 }
}finally{await browser.close();}
