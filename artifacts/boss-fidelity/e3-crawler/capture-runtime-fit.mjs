import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';

const output = new URL('runtime-fit/', import.meta.url);
await mkdir(output, { recursive: true });
const sha256 = data => createHash('sha256').update(data).digest('hex');
const asset = new URL('../../../assets/pilots/crawler-3d/crawler.glb', import.meta.url);
const assetHash = sha256(await readFile(asset));
assert.equal(assetHash, '26112eaa095aa891d57c209e224e81a3a9fc89bc6f56614eb98ee6d5d5016eb6');
const requested = process.argv.find(arg => arg.startsWith('--viewport='))?.split('=')[1];
const startupDelay = Number(process.env.E3_CAPTURE_START_DELAY_MS ?? 30_000);
console.log(`Waiting ${startupDelay} ms for E2 verification before browser capture`);
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
    for (const state of ['scale-3.1-fill-1.6', 'scale-3.1-fill-2.0']) {
      const brokenId = null;
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
      await page.evaluate(state => {
        const g=window.__crawlerProbeGame,h=window.__GR_TEST__,boss=g.crawlerBoss;
        const savedState=()=>{const snapshot=h.captureSuspend();delete snapshot.writtenAt;return JSON.stringify(snapshot);};
        const before=savedState();
        const original=boss.updateCrawler3d;
        boss.updateCrawler3d=function(components){
          original.call(this,components);
          const model=this.crawler3dModel;
          if(state.startsWith('scale-')) {
            const mast=components.get('drain_mast').position,cap=components.get('capacitor_bank').position;
            const yaw=Math.atan2(-(cap.z-mast.z),cap.x-mast.x),shift=state.startsWith('scale-2.8')?-.4:-.6;
            const x=(mast.x+cap.x)/2+Math.cos(yaw)*shift,z=(mast.z+cap.z)/2-Math.sin(yaw)*shift;
            model.position.set(x,h.terrainVisualY(x,z,0),z);
            model.rotation.y=Math.atan2(-(cap.z-mast.z),cap.x-mast.x);
            model.scale.setScalar(Number(state.split('-')[1]));
          }
          const support=this.crawler3dMeshes.get('tracks').geometry.attributes.position;
          let hx=0,hz=0;for(let i=0;i<support.count;i++)if(support.getY(i)<.06){hx=Math.max(hx,Math.abs(support.getX(i)));hz=Math.max(hz,Math.abs(support.getZ(i)));}
          hx*=model.scale.x;hz*=model.scale.x;const yaw=model.rotation.y,c=Math.cos(yaw),sn=Math.sin(yaw),cx=model.position.x,cz=model.position.z;
          const height=(x,z)=>h.terrainVisualY(cx+c*x+sn*z,cz-sn*x+c*z,0);
          const h00=height(-hx,-hz),h10=height(hx,-hz),h01=height(-hx,hz),h11=height(hx,hz);
          const slopeX=(h10+h11-h00-h01)/(4*hx),slopeZ=(h01+h11-h00-h10)/(4*hz);
          const normal=model.position.clone().set(-slopeX,1,-slopeZ).normalize(),up=model.position.clone().set(0,1,0);
          model.quaternion.multiply(model.quaternion.clone().setFromUnitVectors(up,normal));
          model.position.y=(h00+h10+h01+h11+height(0,0))/5;
          model.updateWorldMatrix(true,true);
          const tracks=this.crawler3dMeshes.get('tracks'),point=model.position.clone();let lift=0;
          for(let i=0;i<tracks.geometry.attributes.position.count;i++){tracks.getVertexPosition(i,point);if(point.y>.06)continue;point.applyMatrix4(tracks.matrixWorld);lift=Math.max(lift,h.terrainVisualY(point.x,point.z,0)-point.y);}
          model.position.y+=lift+.025;
          if(state!=='unit-original-fill') for(const mesh of this.crawler3dMeshes.values()) {
            mesh.material.emissive.set('#ffffff');mesh.material.emissiveIntensity=Number(state.split('-')[3]);
          }
        };
        boss.syncPresentation(boss.lastAt);
        boss.updateCrawler3d=original;
        let maxY=-Infinity,maxScreenY=-Infinity;const point=boss.crawler3dModel.position.clone();boss.crawler3dModel.updateWorldMatrix(true,true);
        for(const mesh of boss.crawler3dMeshes.values())for(let i=0;i<mesh.geometry.attributes.position.count;i++){mesh.getVertexPosition(i,point).applyMatrix4(mesh.matrixWorld);maxY=Math.max(maxY,point.y);point.project(g.camera);maxScreenY=Math.max(maxScreenY,point.y);}
        g.enemies.__fitBarPosition=boss.crawler3dModel.position.clone();g.enemies.__fitBarPosition.y=maxY+.35;g.enemies.__fitBarPosition.project(g.camera);g.enemies.__fitBarPosition.y=Math.max(g.enemies.__fitBarPosition.y,maxScreenY+.035);g.enemies.__fitBarPosition.unproject(g.camera);
        if(!g.enemies.__originalFitBar){g.enemies.__originalFitBar=g.enemies.syncBossHpBar;g.enemies.syncBossHpBar=function(){this.__originalFitBar();if(this.__fitBarPosition)this.bossHpGroup.position.copy(this.__fitBarPosition);};}
        g.enemies.syncBossHpBar();
        if(before!==savedState())throw new Error('diagnostic render pose changed suspend snapshot');
      },state);
      await page.waitForTimeout(6500);
      const pose = await page.evaluate(() => {
        const g = window.__crawlerProbeGame, model = g.crawlerBoss.crawler3dModel;
        if (!model?.visible) throw new Error('mounted Crawler not visible');
        model.updateWorldMatrix(true, true);
        const meshes = [], screen = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
        model.traverse(mesh => {
          if (!mesh.isMesh) return;
          const bounds = { min: [Infinity,Infinity,Infinity], max: [-Infinity,-Infinity,-Infinity] }; const groundGaps=[];
          const p = model.position.clone();
          for (let i=0; i<mesh.geometry.attributes.position.count; i++) {
            mesh.getVertexPosition(i,p); const localY=p.y; p.applyMatrix4(mesh.matrixWorld); if(mesh.name==='tracks'&&localY<.06)groundGaps.push(p.y-window.__GR_TEST__.terrainVisualY(p.x,p.z,0));
            p.toArray().forEach((v,j) => { bounds.min[j] = Math.min(bounds.min[j],v); bounds.max[j] = Math.max(bounds.max[j],v); });
            p.project(g.camera);
            const x=(p.x+1)*innerWidth/2, y=(1-p.y)*innerHeight/2;
            screen.minX=Math.min(screen.minX,x);screen.maxX=Math.max(screen.maxX,x);screen.minY=Math.min(screen.minY,y);screen.maxY=Math.max(screen.maxY,y);
          }
          const m=mesh.material;
          meshes.push({ name:mesh.name,triangles:(mesh.geometry.index?.count??mesh.geometry.attributes.position.count)/3,bounds,groundGap:groundGaps.length?{min:Math.min(...groundGaps),max:Math.max(...groundGaps)}:null,morphs:mesh.morphTargetDictionary,influence:[...mesh.morphTargetInfluences],material:{name:m.name,emissive:m.emissive.getHexString(),intensity:m.emissiveIntensity,map:!!m.map,emissiveMap:!!m.emissiveMap,emissiveUsesBase:m.emissiveMap===m.map,metalness:m.metalness,roughness:m.roughness} });
        });
        const d=window.__THREE_GAME_DIAGNOSTICS__;
        return {model:{position:model.position.toArray(),rotation:model.rotation.toArray(),scale:model.scale.toArray(),visible:model.visible},camera:{position:g.camera.position.toArray(),rotation:g.camera.rotation.toArray(),fov:g.camera.fov,aspect:g.camera.aspect},meshes,screen,components:window.__GR_TEST__.enemyPositions().filter(e=>e.variantId==='dynamo_crawler'),dataset:Object.fromEntries(Object.entries(document.querySelector('canvas').dataset).filter(([key])=>/crawler|tier/i.test(key))),boss:d.crawlerBoss,bossBar:{position:g.enemies.bossHpGroup.position.toArray(),visible:g.enemies.bossHpGroup.visible},renderer:d.renderer,timeAlive:d.timeAlive};
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
    await writeFile(new URL(`${name}.json`,output),JSON.stringify({capturedAt:new Date().toISOString(),viewport,deviceScaleFactor:1,assetHash,servedAssets,gameUrl,moduleUrls,setup:'Diagnostic presentation-only trials on actual admitted candidate. Same frozen snapshot and gameplay camera; hero centroid +2 Z. Uniform scales2.8/3.1/3.28, white mapped fill1.6/2.0; rigid local-X shifts−0.4 for2.8 and−0.6 otherwise, yaw from mast-to-capacitor arrangement, midpoint with a five-point terrain plane and shallow rigid tilt, then lifted just enough to clear all track support vertices by0.025. Existing HP bar owner temporarily wrapped to keep bar positioned above actual deformed mesh screen bounds+0.035 NDC (and world maxY+0.35 minimum). Wait6.5seconds after restore for temporary overlays. Suspend state unchanged excluding wall-clock writtenAt. No production scale/material/bar edit.',poses,errors,failedRequests},null,2)+'\n');
    assert.deepEqual(errors,[]);
    assert.deepEqual(failedRequests,[]);
    await page.close();
    console.log(`${name}: complete`);
  }
  assert.equal(sha256(await readFile(asset)),assetHash,'GLB changed during capture');
} finally {await browser.close();}
