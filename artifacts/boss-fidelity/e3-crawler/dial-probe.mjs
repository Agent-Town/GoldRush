// node artifacts/boss-fidelity/e3-crawler/dial-probe.mjs http://127.0.0.1:5246
// Frozen actual-game dial A/B. Only existing material transparency/depth-write flags change.
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { chromium } from 'playwright';
import sharp from 'sharp';

const baseUrl = process.argv[2] ?? 'http://127.0.0.1:5246';
const out = path.resolve('artifacts/boss-fidelity/e3-crawler/dial-probe');
await mkdir(out, { recursive: true });
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const report = { capturedAt: new Date().toISOString(), baseUrl, viewport: { width: 1280, height: 800 },
  sourceAssetSha256: hash(await readFile('assets/pilots/crawler-3d/crawler.glb')),
  setup: 'Lifecycle fixture: actual loader, manual simulation, west relays, outgoing live damage disabled with blast selected. Advance20s, explicitly kill mast, then enter dial window. Actual storycard dismissed; hero is live-survivor centroid X-.5/Z+1. Only existing dial material transparent/depthWrite flags differ between arms.',
  arms: {}, errors: [],
};
let browser, fixture;
const states = {};
try {
  browser = await chromium.launch({ channel: 'chromium', headless: true });
  fixture = await open();
  const { page } = fixture;
  await mounted(page);
  for (const seconds of [0, 10, 10]) {
    await page.evaluate(seconds => window.__GR_TEST__.advanceSim(seconds), seconds);
    await frame(page, 1.5);
  }
  await destroy(page, 'drain_mast');
  await mounted(page);
  await page.evaluate(() => window.__GR_TEST__.advanceSim(3.1));
  await frame(page, 1);
  const card = page.getByTestId('story-beat-card');
  if (await card.isVisible()) await card.click({ force: true });
  await page.waitForTimeout(6500);
  report.initial = await page.evaluate(() => {
    const g = window.__crawlerLifecycleGame, boss = g.crawlerBoss;
    const materials = [];
    boss.dial.traverse(mesh => { if (mesh.isMesh) for (const m of (Array.isArray(mesh.material) ? mesh.material : [mesh.material])) if (!materials.some(x => x.material === m)) materials.push({ material: m, transparent: m.transparent, depthWrite: m.depthWrite }); });
    window.__crawlerDialMaterials = materials;
    return { visible: boss.dial.visible, act: boss.act, position: boss.dial.position.toArray(), scale: boss.dial.scale.toArray(), source: document.querySelector('canvas').dataset.crawler3dSource,
      originalMaterials: materials.map(x => ({ type: x.material.type, color: x.material.color?.getHexString(), transparent: x.transparent, depthTest: x.material.depthTest, depthWrite: x.depthWrite })) };
  });
  assert.equal(report.initial.visible, true);
  assert.equal(report.initial.act, 2);
  assert.equal(report.initial.source, 'glb');
  for (const arm of ['original', 'transparent', 'restored']) {
    await page.evaluate(arm => {
      for (const x of window.__crawlerDialMaterials) {
        x.material.transparent = arm === 'transparent' ? true : x.transparent;
        x.material.depthWrite = arm === 'transparent' ? false : x.depthWrite;
        x.material.needsUpdate = true;
      }
    }, arm);
    await page.waitForTimeout(300);
    const pose = await page.evaluate(() => {
      const g = window.__crawlerLifecycleGame, boss = g.crawlerBoss, dial = boss.dial;
      dial.updateWorldMatrix(true, true);
      const rect = { x: Infinity, y: Infinity, right: -Infinity, bottom: -Infinity };
      const meshes = [];
      dial.traverse(mesh => {
        if (!mesh.isMesh) return;
        const point = dial.position.clone();
        for (let i = 0; i < mesh.geometry.attributes.position.count; i++) {
          mesh.getVertexPosition(i, point).applyMatrix4(mesh.matrixWorld).project(g.camera);
          const x = (point.x + 1) * innerWidth / 2, y = (1 - point.y) * innerHeight / 2;
          rect.x = Math.min(rect.x, x); rect.right = Math.max(rect.right, x);
          rect.y = Math.min(rect.y, y); rect.bottom = Math.max(rect.bottom, y);
        }
        meshes.push({ name: mesh.name, geometry: mesh.geometry.type, visible: mesh.visible, matrixWorld: mesh.matrixWorld.toArray(), materials: (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).map(m => ({ type: m.type, transparent: m.transparent, depthTest: m.depthTest, depthWrite: m.depthWrite, opacity: m.opacity, color: m.color?.getHexString() })) });
      });
      const state = window.__GR_TEST__.captureSuspend(); delete state.writtenAt;
      return { visible: dial.visible, rect, meshes, state: JSON.stringify(state), model: boss.crawler3dModel.matrixWorld.toArray(), camera: { matrixWorld: g.camera.matrixWorld.toArray(), projection: g.camera.projectionMatrix.toArray() } };
    });
    states[arm] = JSON.parse(pose.state);
    const full = await page.screenshot();
    const clip = { left: Math.max(0, Math.floor(pose.rect.x) - 3), top: Math.max(0, Math.floor(pose.rect.y) - 3),
      width: Math.ceil(pose.rect.right) - Math.floor(pose.rect.x) + 6, height: Math.ceil(pose.rect.bottom) - Math.floor(pose.rect.y) + 6 };
    clip.width = Math.min(clip.width, report.viewport.width - clip.left); clip.height = Math.min(clip.height, report.viewport.height - clip.top);
    const crop = await sharp(full).extract(clip).png().toBuffer();
    const { data, info } = await sharp(crop).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    let yellowPixels = 0;
    for (let i = 0; i < data.length; i += info.channels) if (data[i] > 100 && data[i + 1] > 65 && data[i] > data[i + 2] * 1.5 && data[i + 1] > data[i + 2] * 1.3) yellowPixels++;
    const fullPath = path.join(out, `${arm}.png`), cropPath = path.join(out, `${arm}-dial.png`);
    await writeFile(fullPath, full); await writeFile(cropPath, crop);
    report.arms[arm] = { ...pose, stateSha256: hash(pose.state), state: undefined, fullPath, cropPath, fullSha256: hash(full), cropSha256: hash(crop), clip, yellowPixels, pixelCount: info.width * info.height };
    if (arm !== 'original') {
      assert.deepEqual(pose.model, report.arms.original.model, 'model is frozen between material arms');
      assert.deepEqual(pose.camera, report.arms.original.camera, 'camera is frozen between material arms');
      assert.deepEqual(pose.rect, report.arms.original.rect, 'dial geometry stays fixed');
      report.arms[arm].snapshotDifferences = differences(states.original, states[arm]);
    }
  }
  const a = await sharp(report.arms.original.cropPath).raw().toBuffer();
  const b = await sharp(report.arms.transparent.cropPath).raw().toBuffer();
  const c = await sharp(report.arms.restored.cropPath).raw().toBuffer();
  let changedBytes = 0, absDelta = 0, restoredChangedBytes = 0;
  for (let i = 0; i < a.length; i++) { changedBytes += a[i] !== b[i]; absDelta += Math.abs(a[i] - b[i]); restoredChangedBytes += a[i] !== c[i]; }
  report.comparison = { changedBytes, meanAbsoluteChannelDelta: absDelta / a.length, restoredChangedBytes };
  report.errors = fixture.errors;
  assert.deepEqual(report.errors, []);
  report.passed = true;
} catch (error) { report.passed = false; report.failure = error.stack ?? String(error); process.exitCode = 1; }
finally {
  if (fixture && !fixture.page.isClosed()) await fixture.page.evaluate(() => { for (const x of window.__crawlerDialMaterials ?? []) { x.material.transparent = x.transparent; x.material.depthWrite = x.depthWrite; x.material.needsUpdate = true; } }).catch(() => {});
  await browser?.close();
  await writeFile(path.join(out, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
}
console.log(JSON.stringify({ passed: report.passed, output: out, initial: report.initial, comparison: report.comparison, arms: Object.fromEntries(Object.entries(report.arms).map(([arm, x]) => [arm, { rect: x.rect, yellowPixels: x.yellowPixels, pixelCount: x.pixelCount }])), failure: report.failure }));
async function frame(page, zOffset) {
  await page.evaluate(zOffset => {
    const h = window.__GR_TEST__, parts = h.enemyPositions().filter(e => e.variantId === 'dynamo_crawler');
    h.teleport(parts.reduce((sum, e) => sum + e.x, 0) / parts.length - .5, parts.reduce((sum, e) => sum + e.z, 0) / parts.length + zOffset);
  }, zOffset);
  await page.waitForTimeout(350);
}
async function open({ tier = 'full', route } = {}) {
  const page = await browser.newPage({ viewport: report.viewport, deviceScaleFactor: 1 });
  page.setDefaultTimeout(60_000);
  const fixture = { page, errors: [], terrainUrl: null, gameUrl: null };
  page.on('request', request => {
    const pathname = new URL(request.url()).pathname;
    if (pathname === '/src/game/Game.ts') fixture.gameUrl = request.url();
    if (pathname === '/src/world/Terrain.ts') fixture.terrainUrl = request.url();
  });
  page.on('pageerror', error => fixture.errors.push(error.message));
  page.on('requestfailed', request => fixture.errors.push(`${request.url()}: ${request.failure()?.errorText}`));
  page.on('console', message => { if (message.type() === 'error') fixture.errors.push(message.text()); });
  if (route) await page.route('**/crawler.glb*', route);
  await page.addInitScript(tier => {
    localStorage.clear();
    localStorage.setItem('gr.activeEpoch.v1', 'epoch-3-voltage');
    localStorage.setItem('gr.performance.tier.v1', tier);
  }, tier);
  await page.goto(`${baseUrl}/?debug&epoch=epoch-3-voltage&contract=e3-canyon-works&nolevel&nopause&tier=${tier}&seed=crawler-lifecycle`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 16);
  const dismiss = page.getByTestId('contract-briefing-dismiss');
  if (await dismiss.isVisible()) await dismiss.click();
  await page.evaluate(async gameUrl => {
    if (!gameUrl) throw new Error('actual Game module URL was not observed');
    const { Game } = await import(gameUrl), original = Game.prototype.syncBaronRocketCart;
    Game.prototype.syncBaronRocketCart = function (...args) {
      window.__crawlerLifecycleGame = this;
      Game.prototype.syncBaronRocketCart = original;
      return original.apply(this, args);
    };
    const h = window.__GR_TEST__;
    h.setManualSim(true);
    const advance = h.advanceSim;
    h.advanceSim = (seconds, onTick) => {
      let previous = h.enemyPositions();
      return advance(seconds, sample => {
        const current = h.enemyPositions();
        window.__crawlerLastStepTravel = Object.fromEntries(current.filter(e => e.variantId === 'dynamo_crawler').map(e => {
          const prior = previous.find(p => p.id === e.id);
          return [e.bossComponentId, prior ? Math.hypot(e.x - prior.x, e.z - prior.z) : 0];
        }));
        previous = current;
        onTick?.(sample);
      });
    };
    for (const [key, value] of Object.entries({ 'waves.waveInterval': .35, 'waves.trickleInterval': 999, 'waves.pulseBase': 0, 'waves.pulsePerWave': 0, 'waves.aliveCap': 0, 'enemy.contactDamage': 0, 'sparkRig.range': 0, 'sparkRig.damage': 0, 'turret.range': 0, 'turret.damage': 0, 'beacon.damage': 0, 'beacon.damagePerWave': 0 })) h.setBalance(key, value);
    h.setLocalWeaponForTest('blast');
    h.setBalance('blast.damage', 0);
    h.grantGold(1000);
    for (const [x, z] of [[-12, -36], [-24, -20], [-28, 8]]) h.placeFree('sentry_beacon', x, z);
    h.advanceSim(.2); h.setWave(13); h.advanceSim(.4);
    h.setBalance('waves.waveInterval', 999); h.setWave(14); h.advanceSim(.1);
  }, fixture.gameUrl);
  return fixture;
}
async function mounted(page) {
  await page.waitForFunction(() => document.querySelector('canvas')?.dataset.crawler3dState === 'ready');
  await page.evaluate(() => window.__GR_TEST__.advanceSim(.1));
  await page.waitForFunction(() => document.querySelector('canvas')?.dataset.crawler3dMounted === 'true');
}
async function destroy(page, id) {
  const position = await page.evaluate(id => {
    const h = window.__GR_TEST__, snapshot = structuredClone(h.captureSuspend());
    const part = snapshot.enemies.active.find(e => e.variantId === 'dynamo_crawler' && e.bossComponentId === id);
    if (!part) throw new Error(`missing live ${id}`);
    part.hp = .01;
    if (!h.restoreSuspend(snapshot)) throw new Error('restore rejected');
    return h.enemyPositions().find(e => e.variantId === 'dynamo_crawler' && e.bossComponentId === id);
  }, id);
  await page.evaluate(({ x, z }) => {
    const h = window.__GR_TEST__;
    h.setBalance('blast.damage', .02); h.launchBlastAt(x, z, .05); h.advanceSim(.25);
  }, position);
  await page.waitForFunction(id => !window.__GR_TEST__.enemyPositions().some(e => e.variantId === 'dynamo_crawler' && e.bossComponentId === id), id);
}

function differences(a, b, prefix = '') {
  if (Object.is(a, b)) return [];
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return [{ path: prefix, original: a, current: b }];
  return [...new Set([...Object.keys(a), ...Object.keys(b)])].flatMap(key => differences(a[key], b[key], prefix ? `${prefix}.${key}` : key));
}
