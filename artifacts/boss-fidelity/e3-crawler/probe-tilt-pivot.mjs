import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
const sha256=data=>createHash('sha256').update(data).digest('hex');
const route=JSON.parse(await readFile(new URL('lifecycle/lifecycle-report.json',import.meta.url),'utf8')).route;
const browser=await chromium.launch({channel:'chromium',headless:true});
const name='numeric-pivot',viewport={width:1280,height:800};
try{
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    page.setDefaultTimeout(60_000);
    const errors = [], failedRequests = [], servedAssets = [], responseReads = [], moduleUrls = [];
    let gameUrl, terrainUrl;
    page.on('request', request => {
      if (new URL(request.url()).pathname === '/src/world/Terrain.ts') terrainUrl=request.url();
      if (new URL(request.url()).pathname === '/src/game/Game.ts') {
        gameUrl = request.url();
        moduleUrls.push(gameUrl);
      }
    });
    page.on('response', response => {
      if (new URL(response.url()).pathname !== '/assets/pilots/crawler-3d/crawler.glb') return;
      responseReads.push(response.body().then(bytes => {
        if (bytes.subarray(0, 4).toString() !== 'glTF') return;
        servedAssets.push({ url: response.url(), status: response.status(), contentType: response.headers()['content-type'], bytes: bytes.length, sha256: sha256(bytes) });
      }).catch(error => errors.push({ type: 'response-read', message: error.message })));
    });
    page.on('pageerror', error => errors.push({ type: 'page', message: error.message }));
    page.on('console', message => { if (message.type() === 'error') errors.push({ type: 'console', message: message.text() }); });
    page.on('requestfailed', request => failedRequests.push({ url: request.url(), error: request.failure()?.errorText }));
    await page.addInitScript(() => {
      localStorage.clear();
      localStorage.setItem('gr.activeEpoch.v1', 'epoch-3-voltage');
      localStorage.setItem('gr.performance.tier.v1', 'full');
    });
    console.log(`${name}: boot`);
    await page.goto('http://127.0.0.1:5246/?debug&epoch=epoch-3-voltage&contract=e3-canyon-works&nolevel&nopause&tier=full&seed=crawler-lifecycle');
    await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 16);
    const dismiss = page.getByTestId('contract-briefing-dismiss');
    if (await dismiss.isVisible()) await dismiss.click();
    await page.evaluate(async gameUrl => {
      if (!gameUrl) throw new Error('running Game module URL was not observed');
      const { Game } = await import(gameUrl);
      const original = Game.prototype.syncBaronRocketCart;
      Game.prototype.syncBaronRocketCart = function (...args) {
        window.__crawlerProbeGame = this;
        Game.prototype.syncBaronRocketCart = original;
        return original.apply(this, args);
      };
      const h = window.__GR_TEST__;
      h.setManualSim(true);
      h.setBalance('waves.waveInterval', .35);
      h.setBalance('waves.trickleInterval', 999);
      h.setBalance('waves.pulseBase', 0);
      h.setBalance('waves.pulsePerWave', 0);
      h.setBalance('waves.aliveCap', 0);
      h.setBalance('enemy.contactDamage', 0);
      h.setBalance('sparkRig.range', 0);
      h.setBalance('sparkRig.damage', 0);
      h.setWave(13);
      h.advanceSim(.4);
      h.setBalance('waves.waveInterval', 999);
      h.setWave(14);
      h.advanceSim(.1);
    }, gameUrl);
    await page.waitForFunction(() => window.__crawlerProbeGame && document.querySelector('canvas')?.dataset.crawler3dState === 'ready');
    await page.evaluate(() => window.__GR_TEST__.advanceSim(.1));
    await page.waitForFunction(() => document.querySelector('canvas')?.dataset.crawler3dMounted === 'true');
    await page.evaluate(() => {
      const h = window.__GR_TEST__;
      const parts = h.enemyPositions().filter(e => e.variantId === 'dynamo_crawler');
      if (parts.length !== 3) throw new Error('Crawler component count is not 3');
      h.teleport(parts.reduce((sum,e)=>sum+e.x,0)/parts.length, parts.reduce((sum,e)=>sum+e.z,0)/parts.length + 2);
      window.__crawlerBaseline = structuredClone(h.captureSuspend());
    });

const rows=await page.evaluate(async({route,terrainUrl})=>{
 const terrain=await import(terrainUrl),boss=window.__crawlerProbeGame.crawlerBoss;
 const yaw=Math.atan2(80,34),cos=Math.cos(yaw),sin=Math.sin(yaw),up=boss.crawler3dPoint.clone().set(0,1,0);
 const halfX=boss.crawler3dSupportHalfSize.x*3.1,halfZ=boss.crawler3dSupportHalfSize.y*3.1;
 return route.map((pose,i)=>{
  const model=boss.crawler3dModel.clone(false);model.position.fromArray(pose.model.position);model.position.x+=cos*.15;model.position.z-=sin*.15;
  model.rotation.set(0,yaw,0);model.scale.setScalar(3.1);
  const height=(x,z)=>terrain.visualY(model.position.x+cos*x+sin*z,model.position.z-sin*x+cos*z,0);
  const h00=height(-halfX,-halfZ),h10=height(halfX,-halfZ),h01=height(-halfX,halfZ),h11=height(halfX,halfZ);
  const sx=(h10+h11-h00-h01)/(4*halfX),sz=(h01+h11-h00-h10)/(4*halfZ);
  const normal=up.clone().set(-sx,1,-sz).normalize(),tilt=model.quaternion.clone().setFromUnitVectors(up,normal);
  model.quaternion.multiply(tilt);
  const tiltedUp=up.clone().applyQuaternion(model.quaternion);
  model.position.x-=tiltedUp.x*3.1*1.1;model.position.z-=tiltedUp.z*3.1*1.1;
  model.position.y=0;model.updateWorldMatrix(false,false);
  let lift=-Infinity;
  for(const p of boss.crawler3dSupportPoints){const w=p.clone().applyMatrix4(model.matrixWorld);lift=Math.max(lift,terrain.visualY(w.x,w.z,0)-w.y);}
  model.position.y=lift+.025;model.updateWorldMatrix(false,false);
  const gaps=boss.crawler3dSupportPoints.map(p=>{const w=p.clone().applyMatrix4(model.matrixWorld);return w.y-terrain.visualY(w.x,w.z,0);}).sort((a,b)=>a-b);
  return {route:i,model:{position:model.position.toArray(),rotation:model.rotation.toArray(),scale:model.scale.toArray()},support:{minGap:gaps[0],medianGap:gaps[Math.floor(gaps.length/2)],maxGap:gaps.at(-1),within10cm:gaps.filter(x=>x<.1).length},tiltRadians:Math.acos(tiltedUp.y)};
 });
},{route,terrainUrl});
await Promise.all(responseReads);assert.deepEqual(errors,[]);assert.deepEqual(failedRequests,[]);
await writeFile(new URL('runtime-fit/tilt-pivot-regrounded.json',import.meta.url),JSON.stringify({method:'Numerical same-pose candidate through actual initialized Terrain.visualY. Original recorded actor body coordinates, fixed3.1scale; five-point footprint fit at new-.45base shift, localY1.1tilt pivot, then exact support-vertex vertical contact. Does not modify production or simulation and does not claim livecoherentformation until clockcorrection.',rows,errors,failedRequests},null,2)+'\n');console.log(JSON.stringify(rows));
}finally{await browser.close();}
