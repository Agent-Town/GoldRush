// node artifacts/boss-fidelity/e3-crawler/check-lifecycle.mjs http://127.0.0.1:5246
// Focused actual-loader/gameplay lifecycle proof. No production state is patched.
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { chromium } from 'playwright';
import sharp from 'sharp';

const baseUrl = process.argv[2] ?? 'http://127.0.0.1:5246';
const out = path.resolve('artifacts/boss-fidelity/e3-crawler/lifecycle-final');
const ids = ['drain_mast', 'tracks', 'capacitor_bank'];
await mkdir(out, { recursive: true });
const report = {
  capturedAt: new Date().toISOString(), baseUrl, viewport: { width: 1280, height: 800 },
  sourceSha256: Object.fromEntries(await Promise.all(['src/systems/CrawlerBossSystem.ts', 'src/game/Game.ts', 'src/sim/HeadlessContractSim.ts'].map(async file => [file, createHash('sha256').update(await readFile(file)).digest('hex')]))),
  presentationLag: 'Game.ts calls crawlerBoss.update before enemies.update. Observed model pose may trail current proxies by one 1/30s simulation step; The existing advanceSim onTick callback records actual last-step travel; pose error must remain within that observed movement and below 10% of each surviving target radius.',
  sourceAssetSha256: createHash('sha256').update(await readFile('assets/pilots/crawler-3d/crawler.glb')).digest('hex'),
  setup: 'Actual Game test hook, manual simulation; ordinary waves/contact/turret/sentry damage disabled; existing weapon hook selects blast with live damage zero, explicit deaths use .02; sentry relays remain powered; three west relays; actual GLB loader held only in late-load arms. Screenshots document lifecycle poses, with transient UI allowed.',
  route: [], lateLoads: {}, fallback: {}, errors: [],
};
let browser;
try {
  browser = await chromium.launch({ channel: 'chromium', headless: true });
  const live = await open();
  await mounted(live.page);
  for (const seconds of [0, 10, 10, 10, 10]) {
    await live.page.evaluate(seconds => window.__GR_TEST__.advanceSim(seconds), seconds);
    const pose = await inspect(live, `route-${report.route.length}`);
    report.route.push(pose);
    assert.equal(pose.parts.length, 3);
    assert.ok(Math.abs(pose.formationSpan - 8) < .001, 'whole formation retains its authored eight-unit span');
    assertPose(pose);
  }
  for (let i = 1; i < report.route.length; i++) {
    const a = report.route[i - 1].model.position, b = report.route[i].model.position;
    assert.ok(Math.hypot(a[0] - b[0], a[2] - b[2]) > .5, 'chassis follows actual route motion');
  }
  await destroy(live.page, 'drain_mast');
  await mounted(live.page);
  await live.page.evaluate(() => window.__GR_TEST__.advanceSim(3.1));
  const storycard = live.page.getByTestId('story-beat-card');
  if (await storycard.isVisible()) await storycard.click({ force: true });
  await live.page.waitForTimeout(650);
  report.act2 = await inspect(live, 'act-2-dial');
  assertPose(report.act2);
  assert.equal(report.act2.diagnostics.act, 2);
  assert.equal(report.act2.dial.visible, true);
  assert.ok(report.act2.dial.anchorError < 1e-5, 'dial follows enlarged capacitor bound');
  report.act2.dial.pixels = await checkDialPixels(report.act2);
  assert.ok(report.act2.dial.pixels.brightYellowSamples >= 8, 'at least 8 of 64 projected torus-center samples contain visible bright yellow dial pixels');
  assert.deepEqual(report.act2.dial.materials.map(material => material.transparent), [true, true]);
  assert.deepEqual(report.act2.dial.materials.map(material => material.depthTest), [true, true]);
  assert.deepEqual(report.act2.dial.materials.map(material => material.depthWrite), [false, true]);
  await destroy(live.page, 'tracks');
  await mounted(live.page);
  const pinned = await inspect(live);
  await live.page.evaluate(() => window.__GR_TEST__.advanceSim(1));
  report.pinned = await inspect(live, 'capacitor-only-pinned');
  assertPose(report.pinned);
  assert.equal(report.pinned.diagnostics.tracksPinned, true);
  assert.ok(Math.hypot(...[0, 2].map(i => report.pinned.model.position[i] - pinned.model.position[i])) < .01);
  await destroy(live.page, 'capacitor_bank');
  report.disposed = await inspect(live, 'disposed-wreck');
  assert.equal(report.disposed.state, 'disposed');
  assert.equal(report.disposed.boundsAvailable, false);
  assert.equal(report.disposed.model, null);
  assert.equal(report.disposed.supportCount, 0);
  assert.equal(report.disposed.hullPointCount, 0);
  assert.equal(report.disposed.diagnostics.wreckRemains, true);
  await finish(live);

  for (const survivor of ids) {
    let release;
    const held = new Promise(resolve => { release = resolve; });
    let requests = 0;
    const delayed = await open({ route: async route => { requests++; await held; await route.continue(); } });
    try {
      await delayed.page.waitForFunction(() => document.querySelector('canvas')?.dataset.crawler3dState === 'loading');
      for (const id of ids.filter(id => id !== survivor)) await destroy(delayed.page, id);
      await delayed.page.evaluate(() => window.__GR_TEST__.advanceSim(1));
      const beforeRelease = await inspect(delayed);
      assert.deepEqual(beforeRelease.parts.map(part => part.id), [survivor]);
      assert.equal(beforeRelease.state, 'loading');
      assert.equal(beforeRelease.boundsAvailable, false);
      assert.equal(beforeRelease.model, null);
      release();
      await mounted(delayed.page);
      const afterRelease = await inspect(delayed, `late-load-${survivor}`);
      assertPose(afterRelease);
      assert.deepEqual(afterRelease.parts.map(part => part.id), [survivor]);
      assert.equal(afterRelease.offsetCount, 3, 'late admission retains all authored component offsets');
      for (const [id, morph] of Object.entries(afterRelease.morphs)) assert.equal(morph, id === survivor ? 0 : 1);
      report.lateLoads[survivor] = { requests, beforeRelease, afterRelease };
    } finally { release(); await finish(delayed); }
  }
  for (const mode of ['lite', 'invalid']) {
    let requests = 0;
    const fixture = await open({ tier: mode === 'lite' ? 'lite' : 'full', route: async route => {
      requests++;
      await route.fulfill({ status: 200, contentType: 'model/gltf-binary', body: 'invalid' });
    } });
    await fixture.page.waitForFunction(state => document.querySelector('canvas')?.dataset.crawler3dState === state, mode === 'lite' ? 'lite' : 'failed');
    const pose = await inspect(fixture, `fallback-${mode}`);
    assert.equal(pose.boundsAvailable, false);
    assert.equal(pose.model, null);
    assert.equal(pose.placeholderVisible, 3);
    assert.equal(pose.parts.length, 3);
    if (mode === 'lite') assert.equal(requests, 0);
    else assert.ok(requests > 0);
    report.fallback[mode] = { requests, pose };
    await finish(fixture);
  }
  assert.deepEqual(report.errors, []);
  report.passed = true;
} catch (error) {
  report.passed = false;
  report.failure = error.stack ?? String(error);
  process.exitCode = 1;
} finally {
  await browser?.close();
  await writeFile(path.join(out, 'lifecycle-report.json'), `${JSON.stringify(report, null, 2)}\n`);
}
console.log(JSON.stringify({ passed: report.passed, output: out, routeSamples: report.route.length, lateLoads: Object.keys(report.lateLoads), fallback: Object.keys(report.fallback), failure: report.failure }));

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
async function finish(fixture) {
  report.errors.push(...fixture.errors);
  await fixture.page.close();
  assert.deepEqual(fixture.errors, []);
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
async function inspect(fixture, shot) {
  const { page, terrainUrl } = fixture;
  await page.evaluate(() => {
    const h = window.__GR_TEST__, parts = h.enemyPositions().filter(e => e.variantId === 'dynamo_crawler');
    if (parts.length) h.teleport(parts.reduce((sum, p) => sum + p.x, 0) / parts.length - .5, parts.reduce((sum, p) => sum + p.z, 0) / parts.length + 1);
  });
  await page.waitForTimeout(350);
  const pose = await page.evaluate(async terrainUrl => {
    if (!terrainUrl) throw new Error('actual Terrain module URL was not observed');
    const terrain = await import(terrainUrl), g = window.__crawlerLifecycleGame, boss = g.crawlerBoss;
    const parts = window.__GR_TEST__.enemyPositions().filter(e => e.variantId === 'dynamo_crawler').map(e => ({ id: e.bossComponentId, position: [e.x, e.y, e.z], hitRadius: e.hitRadius }));
    const model = boss.crawler3dModel;
    const pose = {
      parts, state: boss.crawler3dState, model: null, boundsAvailable: !!boss.modelBounds(parts.length ? boss.liveComponents().values().next().value.bossGroupId : 'finished'),
      wrongGroupBounds: !!boss.modelBounds('not-the-live-group'),
      placeholderVisible: [...boss.componentMeshes.values()].filter(mesh => mesh.visible).length,
      offsetCount: boss.crawler3dOffsets.size, supportCount: boss.crawler3dSupportPoints.length, hullPointCount: boss.crawler3dBarPoints.length,
      diagnostics: window.__THREE_GAME_DIAGNOSTICS__.crawlerBoss,
    };
    if (!model) return pose;
    model.updateWorldMatrix(true, true);
    pose.model = { position: model.position.toArray(), rotation: model.rotation.toArray(), scale: model.scale.toArray(), visible: model.visible };
    // Canonical authored formation is ±4 world units on the start-to-end chord [34,-80].
    const length = Math.hypot(34, -80), along = [34 / length, -80 / length], offsets = { drain_mast: -4, tracks: 0, capacitor_bank: 4 };
    const expected = [0, 0];
    for (const part of parts) for (let axis = 0; axis < 2; axis++) expected[axis] += (part.position[axis * 2] - along[axis] * offsets[part.id]) / parts.length;
    const up = model.position.clone().set(0, 1, 0).applyQuaternion(model.quaternion);
    pose.pivotCorrection = [-3.41 * up.x, -3.41 * up.z];
    pose.semanticCenter = [model.position.x + .45 * along[0] + 3.41 * up.x, model.position.z + .45 * along[1] + 3.41 * up.z];
    pose.expectedCenter = expected;
    pose.centerError = Math.hypot(pose.semanticCenter[0] - expected[0], pose.semanticCenter[1] - expected[1]);
    const mastProxy = parts.find(part => part.id === 'drain_mast'), capProxy = parts.find(part => part.id === 'capacitor_bank');
    pose.formationSpan = mastProxy && capProxy ? Math.hypot(mastProxy.position[0] - capProxy.position[0], mastProxy.position[2] - capProxy.position[2]) : null;
    pose.lastStepTravelById = window.__crawlerLastStepTravel;
    pose.maxOneStepTravel = Math.max(0, ...parts.map(part => pose.lastStepTravelById?.[part.id] ?? 0));
    pose.centerErrorRadiusFraction = Math.max(...parts.map(part => pose.centerError / part.hitRadius));
    pose.morphs = Object.fromEntries([...boss.crawler3dMeshes].map(([id, mesh]) => [id, mesh.morphTargetInfluences[0]]));
    const gaps = boss.crawler3dSupportPoints.map(point => {
      const world = point.clone().applyMatrix4(model.matrixWorld);
      return world.y - terrain.visualY(world.x, world.z, 0);
    }).sort((a, b) => a - b);
    pose.support = { minGap: gaps[0], medianGap: gaps[Math.floor(gaps.length / 2)], maxGap: gaps.at(-1), within10cm: gaps.filter(gap => gap < .1).length };
    pose.tiltRadians = Math.acos(Math.min(1, Math.max(-1, model.position.clone().set(0, 1, 0).applyQuaternion(model.quaternion).y)));
    const cap = boss.crawler3dComponentBounds.get('capacitor_bank'), expectedDial = cap.getCenter(model.position.clone()); expectedDial.y = cap.max.y + .3;
    boss.dial.updateWorldMatrix(true, true);
    const ring = boss.dial.children.find(mesh => mesh.geometry?.type === 'TorusGeometry');
    const rect = { x: Infinity, y: Infinity, right: -Infinity, bottom: -Infinity };
    const point = model.position.clone();
    const project = point => { const p = point.project(g.camera); return { x: (p.x + 1) * innerWidth / 2, y: (1 - p.y) * innerHeight / 2 }; };
    for (let i = 0; i < ring.geometry.attributes.position.count; i++) {
      const p = project(ring.getVertexPosition(i, point).applyMatrix4(ring.matrixWorld));
      rect.x = Math.min(rect.x, p.x); rect.y = Math.min(rect.y, p.y); rect.right = Math.max(rect.right, p.x); rect.bottom = Math.max(rect.bottom, p.y);
    }
    const samples = Array.from({ length: 64 }, (_, i) => project(point.set(.82 * Math.cos(i * Math.PI / 32), .82 * Math.sin(i * Math.PI / 32), 0).applyMatrix4(ring.matrixWorld)));
    pose.dial = { visible: boss.dial.visible, position: boss.dial.position.toArray(), expected: expectedDial.toArray(), anchorError: boss.dial.position.distanceTo(expectedDial), rect, samples,
      materials: boss.dial.children.filter(mesh => mesh.isMesh).map(mesh => ({ transparent: mesh.material.transparent, depthTest: mesh.material.depthTest, depthWrite: mesh.material.depthWrite })) };
    return pose;
  }, terrainUrl);
  if (shot) {
    pose.screenshot = path.join(out, `${shot}.png`);
    await page.screenshot({ path: pose.screenshot });
  }
  return pose;
}
function assertPose(pose) {
  assert.equal(pose.state, 'ready');
  assert.equal(pose.model.visible, true);
  assert.deepEqual(pose.model.scale, [3.1, 3.1, 3.1]);
  assert.equal(pose.boundsAvailable, true);
  assert.equal(pose.wrongGroupBounds, false);
  assert.ok(pose.centerError <= pose.maxOneStepTravel + 1e-5, 'pose stays within one fixed-step travel of the full authored formation center');
  assert.ok(pose.centerErrorRadiusFraction < .1, 'presentation lag remains below 10% of every surviving target radius');
  assert.ok(pose.support.minGap >= .024 && pose.support.minGap < .1, 'at least one tread support remains close to terrain without penetration');
  assert.ok(Number.isFinite(pose.tiltRadians), 'terrain alignment is finite; measured tilt and opposite-edge gap require visual judgment');
  assert.ok(pose.supportCount > 0 && pose.supportCount < 1000);
}

async function checkDialPixels(pose) {
  const { data, info } = await sharp(pose.screenshot).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const samples = pose.dial.samples.map(point => {
    const x = Math.round(point.x), y = Math.round(point.y), at = (y * info.width + x) * info.channels;
    const rgb = x >= 0 && x < info.width && y >= 0 && y < info.height ? Array.from(data.slice(at, at + 3)) : [0, 0, 0];
    const [r, g, b] = rgb;
    return { x, y, rgb, brightYellow: r > 150 && g > 130 && g / r > .8 && b / g < .75 };
  });
  const rect = pose.dial.rect;
  const clip = { left: Math.max(0, Math.floor(rect.x) - 3), top: Math.max(0, Math.floor(rect.y) - 3), width: Math.ceil(rect.right) - Math.floor(rect.x) + 6, height: Math.ceil(rect.bottom) - Math.floor(rect.y) + 6 };
  clip.width = Math.min(clip.width, info.width - clip.left); clip.height = Math.min(clip.height, info.height - clip.top);
  const crop = path.join(out, 'act-2-dial-crop.png');
  await sharp(pose.screenshot).extract(clip).png().toFile(crop);
  return { crop, clip, samples, brightYellowSamples: samples.filter(sample => sample.brightYellow).length,
    criterion: 'r>150, g>130, g/r>.8, b/g<.75 at64 projected centerline samples. The prior opaque A/B reference had0 qualifying samples; transparent had28.' };
}
