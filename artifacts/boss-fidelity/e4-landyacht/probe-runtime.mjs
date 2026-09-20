import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const output = new URL('./before/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium', headless: true });
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const sources = ['src/systems/LandYachtBossSystem.ts', 'assets/pilots/land-yacht-3d/land-yacht.glb', 'assets/raw/boss-land-yacht.png', 'assets/raw/boss-land-yacht-damage.png', 'assets/contracts/epoch-4-motor/contracts.json'];
const sourceSha256 = Object.fromEntries(await Promise.all(sources.map(async source => [source, sha256(await readFile(source))])));
try {
  for (const [name, viewport] of [['desktop', { width: 1280, height: 800 }], ['mobile', { width: 390, height: 844 }]]) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    const errors = [], requests = [];
    let gameUrl;
    page.on('request', request => {
      const url = request.url();
      if (new URL(url).pathname === '/src/game/Game.ts') gameUrl = url;
      if (/land.yacht/i.test(url)) requests.push(url);
    });
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.addInitScript(() => { localStorage.clear(); localStorage.setItem('gr.activeEpoch.v1', 'epoch-4-motor'); });
    await page.goto('http://127.0.0.1:5246/?debug&epoch=epoch-4-motor&contract=e4-dust-flats&nolevel&nopause&tier=full&seed=land-yacht');
    await page.waitForFunction(() => window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e4-dust-flats', null, { timeout: 60000 });
    const briefing = page.getByTestId('contract-briefing-dismiss');
    if (await briefing.isVisible()) await briefing.evaluate(button => button.click());
    await page.evaluate(async url => {
      const { Game } = await import(url);
      const original = Game.prototype.syncBaronRocketCart;
      Game.prototype.syncBaronRocketCart = function (...args) { window.__e4PreflightGame = this; Game.prototype.syncBaronRocketCart = original; return original.apply(this, args); };
      const h = window.__GR_TEST__;
      h.setManualSim(true);
      for (const [key, value] of Object.entries({ 'waves.waveInterval': .35, 'waves.trickleInterval': 999, 'waves.pulseBase': 0, 'waves.pulsePerWave': 0, 'waves.aliveCap': 20, 'enemy.contactDamage': 0, 'sparkRig.range': 0, 'sparkRig.damage': 0 })) h.setBalance(key, value);
      h.advanceSim(.2);
      const wave = window.__THREE_GAME_DIAGNOSTICS__.contract.baron.wave;
      h.setWave(wave - 1); h.advanceSim(.4); h.setBalance('waves.waveInterval', 999); h.setWave(wave); h.advanceSim(.2);
    }, gameUrl);
    await page.waitForFunction(() => window.__e4PreflightGame && window.__GR_TEST__.enemyPositions().filter(e => e.variantId === 'land_yacht').length === 3);
    const samples = [];
    for (const delta of [0, .6, 2.4, 3, 6]) {
      const sample = await page.evaluate(delta => {
        const h = window.__GR_TEST__, g = window.__e4PreflightGame;
        if (delta) h.advanceSim(delta);
        const enemies = g.enemies.all.filter(e => e.isAlive && e.variantId === 'land_yacht');
        const componentStates = h.captureSuspend().enemies.active.filter(e => e.variantId === 'land_yacht');
        return {
          delta, diagnostics: g.landYachtBoss.diagnostics(),
          components: enemies.map(e => ({ id: e.bossComponentId, position: e.position.toArray(), velocity: e.velocity?.toArray(), hitRadius: e.hitRadius, visualScale: e.visualScale })),
          componentStates,
        };
      }, delta);
      samples.push(sample);
    }
    await page.evaluate(() => {
      const h = window.__GR_TEST__, parts = h.enemyPositions().filter(e => e.variantId === 'land_yacht');
      h.teleport(parts.reduce((v,e)=>v+e.x,0)/parts.length, parts.reduce((v,e)=>v+e.z,0)/parts.length+8);
    });
    await page.waitForTimeout(31000);
    const pose = await page.evaluate(() => {
      const g = window.__e4PreflightGame, nodes = [];
      const screen = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
      g.landYachtBoss.group.updateWorldMatrix(true, true);
      g.landYachtBoss.group.traverse(o => {
        if (!o.isSprite) return;
        nodes.push({ name: o.name, visible: o.visible, position: o.position.toArray(), scale: o.scale.toArray(), map: o.material.map?.image?.src, transparent: o.material.transparent, alphaTest: o.material.alphaTest });
        if (!o.visible) return;
        const p = o.position.clone(), cameraRotation = g.camera.quaternion;
        for (const x of [-.5,.5]) for (const y of [-.5,.5]) {
          p.set(x*o.scale.x,y*o.scale.y,0).applyQuaternion(cameraRotation).add(o.position).project(g.camera);
          const sx = (p.x+1)*innerWidth/2, sy = (1-p.y)*innerHeight/2;
          screen.minX = Math.min(screen.minX,sx); screen.maxX = Math.max(screen.maxX,sx);
          screen.minY = Math.min(screen.minY,sy); screen.maxY = Math.max(screen.maxY,sy);
        }
      });
      return { nodes, screen, camera: { position: g.camera.position.toArray(), rotation: g.camera.rotation.toArray(), target: g.primaryActor.group.position.toArray() }, bossBar: window.__THREE_GAME_DIAGNOSTICS__.readability.bossHpBar };
    });
    const width = Math.min(viewport.width, Math.max(260, Math.ceil(pose.screen.maxX-pose.screen.minX)+60));
    const height = Math.min(viewport.height, Math.max(220, Math.ceil(pose.screen.maxY-pose.screen.minY)+80));
    const crop = { left: Math.round(Math.max(0, Math.min(viewport.width-width,(pose.screen.minX+pose.screen.maxX-width)/2))), top: Math.round(Math.max(0, Math.min(viewport.height-height,(pose.screen.minY+pose.screen.maxY-height)/2))), width, height };
    const full = new URL(`${name}-act-1.png`, output), tight = new URL(`${name}-act-1-props.png`, output);
    await page.screenshot({ path: fileURLToPath(full) });
    await sharp(fileURLToPath(full)).extract(crop).toFile(fileURLToPath(tight));
    const cropPixelEquality = (await sharp(fileURLToPath(full)).extract(crop).raw().toBuffer()).equals(await sharp(fileURLToPath(tight)).raw().toBuffer());
    await writeFile(new URL(`${name}.json`, output), JSON.stringify({ viewport, gameUrl, requests, samples, sampleTimesAfterSpawnSeconds: [0, .6, 3, 6, 12], pose, crop, cropPixelEquality, fullSha256: sha256(await readFile(full)), cropSha256: sha256(await readFile(tight)), sourceSha256, errors }, null, 2));
    console.log(JSON.stringify({ name, errors, landYachtGlbRequests: requests.filter(url=>url.endsWith('.glb')), samples: samples.map(s => ({delta:s.delta,parts:s.components})), cropPixelEquality }));
    await page.close();
  }
} finally { await browser.close(); }
