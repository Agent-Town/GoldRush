// Run only after the candidate is promoted and the prior regression releases the server.
// This captures calibration evidence; image review and broader gameplay gates remain required.
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import sharp from 'sharp';

const base = process.env.GR_CAPTURE_BASE_URL ?? 'http://127.0.0.1:5246';
const root = 'artifacts/boss-fidelity/e4-landyacht';
const output = resolve(process.argv[2] ?? `${root}/candidate-runtime-visual`);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const sourceSha256 = {};
for (const [production, candidate] of [
  ['src/systems/LandYachtBossSystem.ts', `${root}/candidate-runtime/LandYachtBossSystem.ts`],
  ['src/game/RunSuspend.ts', `${root}/candidate-runtime/RunSuspend.ts`],
  ['src/game/Game.ts', `${root}/candidate-runtime/Game.ts`],
  ['assets/pilots/land-yacht-3d/land-yacht.glb', `${root}/candidate-model/land-yacht.glb`],
]) {
  const bytes = await readFile(production);
  assert(bytes.equals(await readFile(candidate)), `${production} has not adopted the inspected candidate; no browser started`);
  sourceSha256[production] = sha(bytes);
}
const replacementAsset = process.env.GR_CAPTURE_GLB ? await readFile(process.env.GR_CAPTURE_GLB) : null;
const servedAssetSha256 = replacementAsset ? sha(replacementAsset) : sourceSha256['assets/pilots/land-yacht-3d/land-yacht.glb'];
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium', headless: true });
try {
  for (const [name, viewport] of [['desktop', { width: 1280, height: 800 }], ['mobile', { width: 390, height: 844 }]]) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    page.setDefaultTimeout(60000);
    if (replacementAsset) await page.route('**/land-yacht.glb*', route => route.fulfill({ status: 200, contentType: 'model/gltf-binary', body: replacementAsset }));
    const errors = [], receiptFailures = [], requests = [], redirects = [], receipts = [], servedModules = {}, responseTasks = [];
    let gameUrl, terrainUrl, settingsUrl;
    page.on('request', request => {
      const path = new URL(request.url()).pathname;
      if (path === '/src/game/Game.ts') gameUrl = request.url();
      if (path === '/src/world/Terrain.ts') terrainUrl = request.url();
      if (path === '/src/story/settings.ts') settingsUrl = request.url();
      if (/land.yacht.*\.glb/i.test(path)) requests.push({ url: request.url() });
    });
    page.on('response', response => {
      const path = new URL(response.url()).pathname;
      if (['/src/game/Game.ts', '/src/game/RunSuspend.ts', '/src/systems/LandYachtBossSystem.ts', '/assets/pilots/land-yacht-3d/land-yacht.glb'].includes(path)) {
        if (response.status() >= 300 && response.status() < 400) { redirects.push({ url: response.url(), status: response.status() }); return; }
        responseTasks.push(response.body().then(bytes => { servedModules[path] = { url: response.url(), status: response.status(), sha256: sha(bytes) }; }).catch(error => receiptFailures.push({ url: response.url(), status: response.status(), error: error.message })));
      }
    });
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.addInitScript(() => {
      localStorage.clear(); localStorage.setItem('gr.activeEpoch.v1', 'epoch-4-motor');
      localStorage.setItem('gr.performance.tier.v1', 'full');
    });
    await page.goto(`${base}/?debug&epoch=epoch-4-motor&contract=e4-dust-flats&nolevel&nopause&tier=full&seed=land-yacht`);
    await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 12);
    const briefing = page.getByTestId('contract-briefing-dismiss');
    if (await briefing.isVisible()) await briefing.evaluate(button => button.click());
    assert(gameUrl && terrainUrl && settingsUrl, 'observed source module URLs required');
    await page.evaluate(async url => (await import(url)).setStoryTalesEnabled(false), settingsUrl);
    await page.evaluate(async url => {
      const { Game } = await import(url), original = Game.prototype.warmCombatPools;
      Game.prototype.warmCombatPools = function (...args) {
        window.__landYachtProbeGame = this; Game.prototype.warmCombatPools = original;
        return original.apply(this, args);
      };
      const h = window.__GR_TEST__;
      h.setManualSim(true);
      for (const [key, value] of Object.entries({ 'waves.waveInterval': .35, 'waves.trickleInterval': 999, 'waves.pulseBase': 0, 'waves.pulsePerWave': 0, 'waves.aliveCap': 20, 'enemy.contactDamage': 0, 'sparkRig.range': 0, 'sparkRig.damage': 0 })) h.setBalance(key, value);
      await h.warmVfx();
      const wave = window.__THREE_GAME_DIAGNOSTICS__.contract.baron.wave;
      h.setWave(wave - 1); h.advanceSim(.4); h.setBalance('waves.waveInterval', 999); h.setWave(wave);
      window.__landYachtInitialSave = structuredClone(h.captureSuspend());
    }, gameUrl);
    await page.waitForFunction(() => document.querySelector('canvas')?.dataset.landYacht3dMounted === 'true');
    if (name === 'mobile') await page.locator('canvas').dispatchEvent('wheel', { deltaY: 1000, deltaMode: 0 });
    await page.waitForTimeout(800);
    async function capture(label) {
      await page.evaluate(() => {
        const h = window.__GR_TEST__, parts = h.enemyPositions().filter(enemy => enemy.variantId === 'land_yacht');
        const model = window.__landYachtProbeGame.landYachtBoss.model;
        const center = parts.length ? { x: parts.reduce((sum, e) => sum + e.x, 0) / parts.length, z: parts.reduce((sum, e) => sum + e.z, 0) / parts.length } : model.position;
        h.teleport(center.x, center.z + 1);
      });
      await page.waitForTimeout(800);
      const pose = await page.evaluate(async terrainUrl => {
        const terrain = await import(terrainUrl), game = window.__landYachtProbeGame, boss = game.landYachtBoss;
        const model = boss.model;
        if (!model?.visible) throw new Error('Candidate model not mounted');
        model.updateWorldMatrix(true, true);
        const rect = { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity };
        for (const point of boss.modelBarPoints) {
          const p = point.clone().project(game.camera), x = (p.x + 1) * innerWidth / 2, y = (1 - p.y) * innerHeight / 2;
          rect.left = Math.min(rect.left, x); rect.top = Math.min(rect.top, y); rect.right = Math.max(rect.right, x); rect.bottom = Math.max(rect.bottom, y);
        }
        const damagedWheels = boss.modelMeshes.get('wheels').morphTargetInfluences[0] === 1 ? 1 : 0;
        const supportGaps = boss.modelSupports[damagedWheels].map(point => {
          const world = point.clone().applyMatrix4(model.matrixWorld);
          return world.y - terrain.visualY(world.x, world.z, 0);
        });
        return { at: game.timeAlive, diagnostics: boss.diagnostics(), rect, matrix: model.matrixWorld.toArray(), scale: model.scale.toArray(),
          camera: { zoom: game.cameraZoom.diagnostics(), position: game.camera.position.toArray(), quaternion: game.camera.quaternion.toArray() },
          parts: game.enemies.all.filter(e => e.isAlive && e.variantId === 'land_yacht').map(e => ({ id: e.bossComponentId, simulation: e.position.toArray(), rendered: game.enemies.renderPositionOf(e).toArray(), hitRadius: e.hitRadius })),
          morphs: Object.fromEntries([...boss.modelMeshes].map(([id, mesh]) => [id, mesh.morphTargetInfluences[0]])),
          supportGap: { min: Math.min(...supportGaps), max: Math.max(...supportGaps) },
          bar: window.__THREE_GAME_DIAGNOSTICS__.readability.bossHpBar, renderer: { ...game.renderer.info.memory },
          savedBoss: window.__GR_TEST__.captureSuspend().landYachtBoss };
      }, terrainUrl);
      assert.deepEqual(pose.scale, [1.4, 1.4, 1.4]);
      assert(Math.abs(pose.supportGap.min - .025) < .002, 'support grounding mismatch');
      const full = `${output}/${name}-${label}.png`, cropFile = `${output}/${name}-${label}-crop.png`;
      await page.screenshot({ path: full });
      const left = Math.max(0, Math.min(viewport.width - 1, Math.floor(pose.rect.left - 20)));
      const top = Math.max(0, Math.min(viewport.height - 1, Math.floor(pose.rect.top - 40)));
      const crop = { left, top, width: Math.max(1, Math.min(viewport.width - left, Math.ceil(pose.rect.right + 20) - left)), height: Math.max(1, Math.min(viewport.height - top, Math.ceil(pose.rect.bottom + 20) - top)) };
      await sharp(full).extract(crop).toFile(cropFile);
      assert((await sharp(full).extract(crop).raw().toBuffer()).equals(await sharp(cropFile).raw().toBuffer()));
      receipts.push({ label, ...pose, crop, fullSha256: sha(await readFile(full)), cropSha256: sha(await readFile(cropFile)) });
      await writeFile(`${output}/${name}.json`, JSON.stringify({ viewport, sourceSha256, servedAssetSha256, replacementAssetPath: process.env.GR_CAPTURE_GLB ?? null, servedModules, requests, redirects, receiptFailures, errors, receipts, framing: 'Hero at current component centroid +1Z; Tales disabled via existing setting; mobile uses existing maximum zoom-out (1.6) through wheel input; calibration framing, not arbitrary-play camera acceptance.' }, null, 2));
    }
    for (const seconds of [0, 8, 16, 24, 32, 40]) {
      if (seconds) await page.evaluate(() => { for (let i = 0; i < 8; i++) window.__GR_TEST__.advanceSim(1); });
      await capture(`orbit-${seconds}`);
      if (seconds === 8) await page.evaluate(() => { window.__landYachtDamageSave = structuredClone(window.__GR_TEST__.captureSuspend()); });
    }
    for (const id of ['wheels', 'crane', 'wheelhouse']) {
      const restored = await page.evaluate(id => {
        const h = window.__GR_TEST__, snapshot = structuredClone(window.__landYachtDamageSave);
        snapshot.enemies.active.find(e => e.variantId === 'land_yacht' && e.bossComponentId === id).hp *= .49;
        return h.restoreSuspend(snapshot);
      }, id);
      assert.equal(restored, true);
      await page.waitForFunction(() => document.querySelector('canvas')?.dataset.landYacht3dMounted === 'true');
      await capture(`damage-${id}`);
    }
    await Promise.all(responseTasks);
    assert.deepEqual(errors, []);
    for (const path of ['/src/game/Game.ts', '/src/game/RunSuspend.ts', '/src/systems/LandYachtBossSystem.ts']) assert.equal(servedModules[path]?.status, 200, `Missing captured final module response: ${path}`);
    assert.equal(servedModules['/assets/pilots/land-yacht-3d/land-yacht.glb']?.sha256, servedAssetSha256);
    await writeFile(`${output}/${name}.json`, JSON.stringify({ viewport, sourceSha256, servedAssetSha256, replacementAssetPath: process.env.GR_CAPTURE_GLB ?? null, servedModules, requests, redirects, receiptFailures, errors, receipts, framing: 'Hero at current component centroid +1Z; Tales disabled via existing setting; mobile uses existing maximum zoom-out (1.6) through wheel input; calibration framing, not arbitrary-play camera acceptance.' }, null, 2));
    await page.close();
  }
} finally { await browser.close(); }
