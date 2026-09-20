import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';

const output = new URL('after/', import.meta.url);
await mkdir(output, { recursive: true });
const sha256 = data => createHash('sha256').update(data).digest('hex');
const asset = new URL('../../../assets/pilots/crawler-3d/crawler.glb', import.meta.url);
const assetHash = sha256(await readFile(asset));
assert.equal(assetHash, '26112eaa095aa891d57c209e224e81a3a9fc89bc6f56614eb98ee6d5d5016eb6');
const requested = process.argv.find(arg => arg.startsWith('--viewport='))?.split('=')[1];
const startupDelay = Number(process.env.E3_CAPTURE_START_DELAY_MS ?? 30_000);
console.log(`Waiting ${startupDelay} ms before browser capture`);
await new Promise(resolve => setTimeout(resolve, startupDelay));
const browser = await chromium.launch({ channel: 'chromium', headless: true });
try {
  for (const [name, viewport] of [['desktop', { width: 1280, height: 800 }], ['mobile', { width: 390, height: 844 }]]) {
    if (requested && requested !== name) continue;
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    page.setDefaultTimeout(60_000);
    const errors = [], failedRequests = [], servedAssets = [], responseReads = [], moduleUrls = [];
    let gameUrl;
    page.on('request', request => {
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
    await page.goto('http://127.0.0.1:5246/?debug&epoch=epoch-3-voltage&contract=e3-canyon-works&nolevel&nopause&tier=full&seed=crawler-fidelity-e3');
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
    // Let existing UI settle naturally while simulation is frozen; do not hide DOM or world objects.
    await page.waitForTimeout(Number(process.env.E3_CAPTURE_UI_DELAY_MS ?? 31_000));
    console.log(`${name}: mounted, capturing four states`);
    const poses = {};
    for (const state of ['intact', 'drain_mast-broken', 'tracks-broken', 'capacitor_bank-broken']) {
      const brokenId = state === 'intact' ? null : state.replace('-broken', '');
      assert.equal(await page.evaluate(brokenId => {
        const h = window.__GR_TEST__;
        const snapshot = structuredClone(window.__crawlerBaseline);
        for (const e of snapshot.enemies.active) if (e.variantId === 'dynamo_crawler') e.hp = e.maxHp * (e.bossComponentId === brokenId ? .49 : 1);
        const restored = h.restoreSuspend(snapshot);
        if (restored) h.advanceSim(.1);
        return restored;
      }, brokenId), true, `${state}: suspend restore`);
      // Crawler's async loader only publishes ready. A post-load sim tick mounts it.
      await page.waitForFunction(() => document.querySelector('canvas')?.dataset.crawler3dState === 'ready');
      await page.evaluate(() => window.__GR_TEST__.advanceSim(.1));
      await page.waitForFunction(brokenId => {
        const d = document.querySelector('canvas')?.dataset;
        if (d?.crawler3dState !== 'ready' || d?.crawler3dMounted !== 'true') return false;
        const states = JSON.parse(d.crawler3dDamageStates);
        return Object.entries(states).every(([id,value])=>value === (id === brokenId ? 'broken' : 'intact'));
      }, brokenId).catch(async error => {
        const diagnostic = await page.evaluate(() => { const g=window.__crawlerProbeGame,c=g?.crawlerBoss;return {dataset:{...document.querySelector('canvas').dataset},components:window.__GR_TEST__.enemyPositions().filter(e=>e.variantId==='dynamo_crawler'),boss:window.__THREE_GAME_DIAGNOSTICS__.crawlerBoss,seenBoss:c?.seenBoss,modelState:c?.crawler3dState,groupId:c?.crawler3dGroupId,modelVisible:c?.crawler3dModel?.visible,activeContract:window.__THREE_GAME_DIAGNOSTICS__.contract.activeId};});
        await writeFile(new URL(`${name}-${state}-failed.json`,output),JSON.stringify({error:error.message,diagnostic,errors,failedRequests,moduleUrls},null,2));
        await page.screenshot({path:fileURLToPath(new URL(`${name}-${state}-failed.png`,output))});
        console.log(JSON.stringify(diagnostic));throw error;
      });
      await page.waitForTimeout(6500);
      const pose = await page.evaluate(() => {
        const g = window.__crawlerProbeGame, model = g.crawlerBoss.crawler3dModel;
        if (!model?.visible) throw new Error('mounted Crawler not visible');
        model.updateWorldMatrix(true, true);
        const meshes = [], screen = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
        model.traverse(mesh => {
          if (!mesh.isMesh) return;
          const bounds = { min: [Infinity,Infinity,Infinity], max: [-Infinity,-Infinity,-Infinity] };
          const p = model.position.clone();
          for (let i=0; i<mesh.geometry.attributes.position.count; i++) {
            mesh.getVertexPosition(i,p).applyMatrix4(mesh.matrixWorld);
            p.toArray().forEach((v,j) => { bounds.min[j] = Math.min(bounds.min[j],v); bounds.max[j] = Math.max(bounds.max[j],v); });
            p.project(g.camera);
            const x=(p.x+1)*innerWidth/2, y=(1-p.y)*innerHeight/2;
            screen.minX=Math.min(screen.minX,x);screen.maxX=Math.max(screen.maxX,x);screen.minY=Math.min(screen.minY,y);screen.maxY=Math.max(screen.maxY,y);
          }
          const m=mesh.material;
          meshes.push({ name:mesh.name,triangles:(mesh.geometry.index?.count??mesh.geometry.attributes.position.count)/3,bounds,morphs:mesh.morphTargetDictionary,influence:[...mesh.morphTargetInfluences],material:{name:m.name,emissive:m.emissive.getHexString(),intensity:m.emissiveIntensity,map:!!m.map,emissiveMap:!!m.emissiveMap,emissiveUsesBase:m.emissiveMap===m.map,metalness:m.metalness,roughness:m.roughness} });
        });
        const d=window.__THREE_GAME_DIAGNOSTICS__;
        return {model:{position:model.position.toArray(),rotation:model.rotation.toArray(),scale:model.scale.toArray(),visible:model.visible},camera:{position:g.camera.position.toArray(),rotation:g.camera.rotation.toArray(),fov:g.camera.fov,aspect:g.camera.aspect},meshes,screen,components:window.__GR_TEST__.enemyPositions().filter(e=>e.variantId==='dynamo_crawler'),dataset:Object.fromEntries(Object.entries(document.querySelector('canvas').dataset).filter(([key])=>/crawler|tier/i.test(key))),boss:d.crawlerBoss,bossBar:{position:g.enemies.bossHpGroup.position.toArray(),visible:g.enemies.bossHpGroup.visible,fillMaterial:{transparent:g.enemies.bossHpFillMaterial.transparent,depthWrite:g.enemies.bossHpFillMaterial.depthWrite}},supportPointCount:g.crawlerBoss.crawler3dSupportPoints.length,hullPointCounts:Object.fromEntries([...g.crawlerBoss.crawler3dHullPoints].map(([id,points])=>[id,points.map(p=>p.length)])),renderer:d.renderer,timeAlive:d.timeAlive};
      });
      const left=Math.max(0,Math.floor(pose.screen.minX)-50),top=Math.max(0,Math.floor(pose.screen.minY)-50);
      const right=Math.min(viewport.width,Math.ceil(pose.screen.maxX)+50),bottom=Math.min(viewport.height,Math.ceil(pose.screen.maxY)+50);
      const rectangle={left,top,width:right-left,height:bottom-top};
      assert(rectangle.width>0&&rectangle.height>0,`${state}: model is completely offscreen`);
      const full=fileURLToPath(new URL(`${name}-${state}.png`,output));
      const crop=fileURLToPath(new URL(`${name}-${state}-crawler.png`,output));
      await page.screenshot({path:full});
      await sharp(full).extract(rectangle).toFile(crop);
      assert.deepEqual(await sharp(crop).raw().toBuffer(),await sharp(full).extract(rectangle).raw().toBuffer());
      assert.equal(pose.meshes.reduce((sum,m)=>sum+m.triangles,0),11760);
      for(const mesh of pose.meshes)assert.equal(mesh.influence[0],mesh.name===brokenId?1:0);
      poses[state]={...pose,crop:rectangle,modelClippedByViewport:pose.screen.minX<0||pose.screen.maxX>viewport.width||pose.screen.minY<0||pose.screen.maxY>viewport.height,fullSha256:sha256(await readFile(full)),cropSha256:sha256(await readFile(crop)),cropPixelEquality:true};
      console.log(`${name}: ${state}`);
    }
    await Promise.all(responseReads);
    assert(servedAssets.length>0,'No served GLB binary response captured');
    for(const served of servedAssets)assert.equal(served.sha256,assetHash,'served GLB differs from local banked baseline');
    await writeFile(new URL(`${name}.json`,output),JSON.stringify({capturedAt:new Date().toISOString(),viewport,deviceScaleFactor:1,assetHash,servedAssets,gameUrl,moduleUrls,setup:'Existing e2e spawn + HP/suspend hooks; all four states restore the same frozen snapshot then advance 0.1s to load plus 0.1s after ready to mount. Production camera retained; final source supplies the model transform, terrain support, material, beam, dial and bar. Hero teleported to component centroid +2 Z; manual sim; full tier; no source/material overrides.',poses,errors,failedRequests},null,2)+'\n');
    assert.deepEqual(errors,[]);
    assert.deepEqual(failedRequests,[]);
    await page.close();
    console.log(`${name}: complete`);
  }
  assert.equal(sha256(await readFile(asset)),assetHash,'GLB changed during capture');
} finally {await browser.close();}
