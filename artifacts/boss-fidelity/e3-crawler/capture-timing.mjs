import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';
import ts from 'typescript';
const output = new URL('timing/',import.meta.url);
await mkdir(output,{recursive:true});
const sha256 = data => createHash('sha256').update(data).digest('hex');
const oldSource=await readFile(new URL('before/assets/CrawlerBossSystem.ts',import.meta.url),'utf8');
const oldAsset=await readFile(new URL('before/assets/crawler.glb',import.meta.url));
const currentSource=await readFile(new URL('../../../src/systems/CrawlerBossSystem.ts',import.meta.url),'utf8');
const sharedGameSha256=sha256(await readFile(new URL('../../../src/game/Game.ts',import.meta.url)));
const sharedPoolsSha256=sha256(await readFile(new URL('../../../src/entities/pools.ts',import.meta.url)));
const currentAsset=await readFile(new URL('../../../assets/pilots/crawler-3d/crawler.glb',import.meta.url));
const browser=await chromium.launch({channel:'chromium',headless:true});
const rows=[];
try {
 for(const [name,viewport] of [['desktop',{width:1280,height:800}],['mobile',{width:390,height:844}]]) {
  for(const arm of ['before','after']) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    page.setDefaultTimeout(60_000);
    const errors = [], failedRequests = [], servedAssets = [], responseReads = [], moduleUrls = [];
    if (arm === 'before') {
      await page.route('**/src/systems/CrawlerBossSystem.ts*', async route => {
        const current = await (await route.fetch()).text();
        const imports = new Map([...current.matchAll(/from \"([^\"]+)\"/g)].map(match => [match[1].split('/').at(-1).split('?')[0],match[1]]));
        let previous = ts.transpileModule(oldSource,{compilerOptions:{target:ts.ScriptTarget.ESNext,module:ts.ModuleKind.ESNext}}).outputText;
        previous = previous.replace(/from [\"']([^\"']+)[\"']/g,(whole,target) => {
          const resolved = target === 'three' ? imports.get('three.js') : imports.get(target.split('/').at(-1)+'.ts');
          if(!resolved) throw new Error(`No current module mapping for ${target}`);
          return `from ${JSON.stringify(resolved)}`;
        });
        previous = previous.replace(/import\(['"]\.\.\/assets\/AssetLoading['"]\)/g,'import("/src/assets/AssetLoading.ts")');
        previous += '\nCrawlerBossSystem.prototype.modelBounds = () => null;\n';
        await route.fulfill({status:200,contentType:'application/javascript',body:previous});
      });
      await page.route('**/assets/pilots/crawler-3d/crawler.glb', route => route.fulfill({status:200,contentType:'model/gltf-binary',body:oldAsset}));
    }
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
    console.log(`${name}/${arm}: boot`);
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

    await page.waitForTimeout(10_000);
    const frameStart=await page.evaluate(()=>window.__THREE_GAME_DIAGNOSTICS__.frame);
    await page.waitForFunction(start=>window.__THREE_GAME_DIAGNOSTICS__.frame>=start+180,frameStart);
    const measured=await page.evaluate(()=>{
      const g=window.__crawlerProbeGame,b=g.crawlerBoss,d=window.__THREE_GAME_DIAGNOSTICS__;
      return {parts:window.__GR_TEST__.enemyPositions().filter(e=>e.variantId==='dynamo_crawler').map(e=>({id:e.bossComponentId,x:e.x,y:e.y,z:e.z})),frame:d.frame,frameMs:d.frameMs,renderer:d.renderer,model:{position:b.crawler3dModel.position.toArray(),rotation:b.crawler3dModel.rotation.toArray(),scale:b.crawler3dModel.scale.toArray()},camera:{position:g.camera.position.toArray(),rotation:g.camera.rotation.toArray()},supportPointCount:b.crawler3dSupportPoints?.length??0,hullPointCounts:b.crawler3dHullPoints?Object.fromEntries([...b.crawler3dHullPoints].map(([id,points])=>[id,points.map(p=>p.length)])):null};
    });
    await Promise.all(responseReads);
    const expectedHash=sha256(arm==='before'?oldAsset:currentAsset);
    assert(servedAssets.length>0);for(const asset of servedAssets)assert.equal(asset.sha256,expectedHash);
    assert.deepEqual(errors,[]);assert.deepEqual(failedRequests,[]);
    const row={name,arm,viewport,gameUrl,moduleUrls,sourceSha256:sha256(arm==='before'?oldSource:currentSource),assetSha256:expectedHash,servedAssets,...measured,errors,failedRequests};
    assert.equal(row.frameMs.sampleCount,180);
    if(arm==='after'){
      const before=rows.find(r=>r.name===name&&r.arm==='before');
      assert.deepEqual(row.parts,before.parts,'same actual combat positions in both timing arms');
      for(const key of ['position','rotation']) for(let i=0;i<before.camera[key].length;i++) if(typeof before.camera[key][i]==='number') assert(Math.abs(before.camera[key][i]-row.camera[key][i])<1e-8,'matched gameplay camera');
      for(const key of ['calls','geometries','textures']) assert.equal(row.renderer[key],before.renderer[key],`matched ${key}`);
      assert.equal(row.renderer.triangles-before.renderer.triangles,-220);
    }
    rows.push(row);console.log(JSON.stringify(row));
    await page.close();
  }
 }
 await writeFile(new URL('report.json',output),JSON.stringify({capturedAt:new Date().toISOString(),sharedGameSha256,sharedPoolsSha256,method:'Small steady-state local headless Chromium comparison. Before uses banked pre-E3 Crawler source and GLB through request fulfillment, with only a no-op modelBounds callback shim. Both arms share current game, common bar pass, camera, hero placement and fixed simulation fixture. 10 s settling then 180 frames before reading the existing frameMs rolling window. Includes presentation/GPU footprint, excludes initial load and hull construction. Headless wall-frame telemetry is not real mobile GPU or release FPS.',rows},null,2)+'\n');
} finally {await browser.close();}
