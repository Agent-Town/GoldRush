// Run against scratch Vite: node scripts/check-crawler-presentation.mjs http://127.0.0.1:5246
// Inspect the game's drawn state before probing presentation purity; keep production diagnostics unchanged.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'chromium', headless: true });
try {
  for (const viewport of [{ width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    page.setDefaultTimeout(60_000);
    const errors = [], warnings = [];
    let gameUrl;
    page.on('request', request => { if (new URL(request.url()).pathname === '/src/game/Game.ts') gameUrl = request.url(); });
    page.on('pageerror', error => errors.push(error.message));
    page.on('requestfailed', request => errors.push(`${request.url()}: ${request.failure()?.errorText}`));
    page.on('console', message => {
      if (message.type() === 'error') errors.push(message.text());
      if (message.type() === 'warning') warnings.push(message.text());
    });
    await page.addInitScript(() => {
      localStorage.clear();
      localStorage.setItem('gr.activeEpoch.v1', 'epoch-3-voltage');
      localStorage.setItem('gr.performance.tier.v1', 'full');
    });
    await page.goto(`${process.argv[2] ?? 'http://127.0.0.1:5246'}/?debug&epoch=epoch-3-voltage&contract=e3-canyon-works&nolevel&nopause&tier=full&seed=crawler-presentation`);
    await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 16);
    const dismiss = page.getByTestId('contract-briefing-dismiss');
    if (await dismiss.isVisible()) await dismiss.click();
    await page.evaluate(async gameUrl => {
      if (!gameUrl) throw new Error('running Game module URL was not observed');
      const { Game } = await import(gameUrl);
      const original = Game.prototype.syncBaronRocketCart;
      Game.prototype.syncBaronRocketCart = function (...args) {
        window.__crawlerPresentationProbe = this;
        Game.prototype.syncBaronRocketCart = original;
        return original.apply(this, args);
      };
      const h = window.__GR_TEST__;
      h.setManualSim(true);
      for (const [key, value] of Object.entries({ 'waves.waveInterval': .35, 'waves.trickleInterval': 999, 'waves.pulseBase': 0, 'waves.pulsePerWave': 0, 'waves.aliveCap': 0, 'enemy.contactDamage': 0, 'sparkRig.range': 0, 'sparkRig.damage': 0 })) h.setBalance(key, value);
      h.grantGold(1000);
      for (const [x, z] of [[-12, -36], [-24, -20], [-28, 8]]) h.placeFree('sentry_beacon', x, z);
      h.advanceSim(.2);
      h.setWave(13); h.advanceSim(.4); h.setBalance('waves.waveInterval', 999); h.setWave(14); h.advanceSim(.1);
    }, gameUrl);
    await mounted(page);
    await page.evaluate(() => {
      const h = window.__GR_TEST__, parts = h.enemyPositions().filter(e => e.variantId === 'dynamo_crawler');
      h.teleport(parts.reduce((sum, e) => sum + e.x, 0) / parts.length, parts.reduce((sum, e) => sum + e.z, 0) / parts.length + 2);
      window.__crawlerPresentationSnapshot = structuredClone(h.captureSuspend());
    });

    await page.waitForTimeout(31000);
    for(const transparent of [false,true]) {
      await page.evaluate(transparent=>{
        const e=window.__crawlerPresentationProbe.enemies;
        for(const m of [e.bossHpBackMaterial,e.bossHpFillMaterial]){m.transparent=transparent;m.needsUpdate=true;}
      },transparent);
      await page.waitForTimeout(300);
      const data=await page.evaluate(()=>{const g=window.__crawlerPresentationProbe,e=g.enemies,m=e.bossHpBack; m.updateWorldMatrix(true,false);const screen={minX:Infinity,minY:Infinity,maxX:-Infinity,maxY:-Infinity},point=m.position.clone();for(let i=0;i<m.geometry.attributes.position.count;i++){m.getVertexPosition(i,point).applyMatrix4(m.matrixWorld).project(g.camera);const x=(point.x+1)*innerWidth/2,y=(1-point.y)*innerHeight/2;screen.minX=Math.min(screen.minX,x);screen.maxX=Math.max(screen.maxX,x);screen.minY=Math.min(screen.minY,y);screen.maxY=Math.max(screen.maxY,y);}return{screen,position:e.bossHpGroup.position.toArray(),materials:[e.bossHpBackMaterial,e.bossHpFillMaterial].map(m=>({color:m.color.getHexString(),transparent:m.transparent,depthTest:m.depthTest,depthWrite:m.depthWrite})),visible:e.bossHpGroup.visible};});
      await page.screenshot({path:`artifacts/boss-fidelity/e3-crawler/runtime-fit/bar-${transparent?'transparent':'opaque'}.png`});
      console.log(JSON.stringify({transparent,...data,errors}));
    }
    await page.close();
  }
} finally { await browser.close(); }

async function mounted(page) {
  await page.waitForFunction(() => document.querySelector('canvas')?.dataset.crawler3dState === 'ready');
  await page.evaluate(() => window.__GR_TEST__.advanceSim(.1));
  await page.waitForFunction(() => document.querySelector('canvas')?.dataset.crawler3dMounted === 'true');
}
