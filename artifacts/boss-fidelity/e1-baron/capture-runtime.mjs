import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
const stage = process.argv[2] ?? 'before';
const output = new URL(`${stage}/`, import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium', headless: true });
try {
  for (const [name, viewport] of [['desktop', { width: 1280, height: 800 }], ['mobile', { width: 390, height: 844 }]]) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    const errors = [];
    let gameUrl;
    page.on('request', request => { if (new URL(request.url()).pathname === '/src/game/Game.ts') gameUrl = request.url(); });
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error' && !message.text().includes('WebSocket connection')) errors.push(message.text()); });
    await page.goto('http://127.0.0.1:5246/?debug&contract=e1-baron&timescale=1&nolevel&nowaves&nosteal&nowreck&tier=full&seed=baron-props-detail');
    await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10, null, { timeout: 60000 });
    const dismiss = page.getByTestId('contract-briefing-dismiss');
    if (await dismiss.isVisible().catch(() => false)) await dismiss.click();
    await page.evaluate(async gameUrl => {
      if (!gameUrl) throw new Error('running Game module URL missing');
      const { Game } = await import(gameUrl);
      const original = Game.prototype.syncBaronRocketCart;
      Game.prototype.syncBaronRocketCart = function (...args) { window.__baronProbeGame = this; Game.prototype.syncBaronRocketCart = original; return original.apply(this, args); };
      const h = window.__GR_TEST__;
      h.setManualSim(true);
      Object.assign(h.activeContract().twist.baron.rocketVolley, { damage: 0, cadenceSeconds: 2, telegraphSeconds: 0.5, airTime: 1.1, spreadRadius: 0.9 });
      h.setBalance('sparkRig.damage', 0); h.setBalance('sparkRig.range', 0);
      h.teleport(0, 12);
      h.spawnPack(1, 12, { eliteKind: 'baron', hpScale: 240, speedScale: 0.001, visualScale: 4, banner: true, wrecker: true, heroPursuitRange: 45, buildingDamageScale: 12, supportBuildingDamageScale: 8 });
   }, gameUrl);
    await page.waitForFunction(() => window.__baronProbeGame && window.__THREE_GAME_DIAGNOSTICS__?.baronRocket.props.state === 'ready');
    await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations?.['char.baron']?.loaded ?? false).catch(() => {});
    // Match the original baseline's settled UI; do not hide or alter game UI.
    await page.waitForTimeout(31000);
    const crops = {};
    const shot = async state => {
      const fullPath = fileURLToPath(new URL(`${name}-${state}.png`, output));
      await page.screenshot({ path: fullPath });
      const clip = await page.evaluate(() => {
        const g = window.__baronProbeGame;
        const centre = g.activeBaronEnemy().position.clone();
        centre.y += 3.4;
        centre.project(g.camera);
        return { x: Math.max(0, Math.min(innerWidth - 280, (centre.x + 1) * innerWidth / 2 - 140)),
          y: Math.max(0, Math.min(innerHeight - 280, (1 - centre.y) * innerHeight / 2 - 140)), width: 280, height: 280 };
      });
      const rectangle = { left: Math.round(clip.x), top: Math.round(clip.y), width: clip.width, height: clip.height };
      await sharp(fullPath).extract(rectangle).toFile(fileURLToPath(new URL(`${name}-${state}-props.png`, output)));
      crops[state] = rectangle;
    };
    await shot('carried');
    await page.evaluate(x => window.__GR_TEST__.teleport(x, 12), name === 'desktop' ? 5 : 1.6);
    for (let i=0;i<150;i++) {
      await page.evaluate(() => window.__GR_TEST__.advanceSim(1/30));
      if (await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__.baronRocket.telegraphActive)) break;
    }
    const capture = () => page.evaluate(() => {
      const g = window.__baronProbeGame;
      const launcher = g.baronProps3dModel.getObjectByName('BaronShoulderLauncher');
      const keg = g.baronProps3dModel.getObjectByName('BaronPowderKeg');
      return { rocket: window.__THREE_GAME_DIAGNOSTICS__.baronRocket, vfx: window.__THREE_GAME_DIAGNOSTICS__.vfx.baronVolley, launcherEmission: launcher.material.emissiveIntensity, kegEmission: keg.material.emissiveIntensity, launcherEmissiveIsAlbedo: launcher.material.emissiveMap === launcher.material.map, render: window.__THREE_GAME_DIAGNOSTICS__.renderer };
    });
    const telegraph = await capture();
    await shot('telegraph');
    for (let i=0;i<60;i++) {
      await page.evaluate(() => window.__GR_TEST__.advanceSim(1/30));
      if (await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__.vfx.baronVolley.rockets.active > 0)) break;
    }
    await page.evaluate(seconds => window.__GR_TEST__.advanceSim(seconds), name === 'desktop' ? 0.2 : 0.1);
    const flight = await capture();
    await shot('flight');
    await writeFile(new URL(`${name}.json`, output), JSON.stringify({ stage, viewport, telegraph, flight, crops, errors }, null, 2));
    assert.deepEqual(errors, []);
    console.log(`${stage} ${name} captured`);
    await page.close();
  }
} finally { await browser.close(); }
