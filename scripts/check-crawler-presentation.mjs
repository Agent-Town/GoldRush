// Run against scratch Vite: node scripts/check-crawler-presentation.mjs http://127.0.0.1:5246
// Inspect the game's drawn state before probing presentation purity; keep production diagnostics unchanged.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import { PNG } from 'pngjs';

const baseUrl = process.argv[2] ?? 'http://127.0.0.1:5246';
const sourceProvenance = {
  capturedAt: new Date().toISOString(),
  files: Object.fromEntries(await Promise.all([
    'src/systems/CrawlerBossSystem.ts', 'src/entities/pools.ts', 'src/game/Game.ts',
    'scripts/check-crawler-presentation.mjs', 'assets/pilots/crawler-3d/crawler.glb',
  ].map(async path => [path, { sha256: createHash('sha256').update(await readFile(resolve(path))).digest('hex') }]))),
};
assert.ok([undefined, 'desktop', 'mobile'].includes(process.env.GR_CHECK_VIEWPORT), 'GR_CHECK_VIEWPORT must be desktop or mobile');
let optimizedUrl = process.argv[3];
if (!optimizedUrl) {
  const candidates = (await readdir(resolve('dist/assets'))).filter(name => /^crawler-.*\.glb$/.test(name));
  assert.equal(candidates.length, 1, 'build first and keep one current crawler GLB, or pass its URL as the third argument');
  optimizedUrl = `${baseUrl}/dist/assets/${encodeURIComponent(candidates[0])}`;
}

const browser = await chromium.launch({ channel: 'chromium', headless: true });
try {
  for (const viewport of [{ width: 1280, height: 800 }, { width: 390, height: 844 }].filter(viewport => !process.env.GR_CHECK_VIEWPORT || process.env.GR_CHECK_VIEWPORT === (viewport.width === 1280 ? 'desktop' : 'mobile'))) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    page.setDefaultTimeout(60_000);
    const errors = [], warnings = [];
    let gameUrl, loaderUrl, terrainUrl;
    page.on('request', request => {
      const pathname = new URL(request.url()).pathname;
      if (pathname === '/src/game/Game.ts') gameUrl = request.url();
      if (pathname === '/src/assets/AssetLoading.ts') loaderUrl = request.url();
      if (pathname === '/src/world/Terrain.ts') terrainUrl = request.url();
    });
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
    await page.goto(`${baseUrl}/?debug&epoch=epoch-3-voltage&contract=e3-canyon-works&nolevel&nopause&tier=full&seed=crawler-presentation`);
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
      const centroid = { x: parts.reduce((sum, e) => sum + e.x, 0) / parts.length, z: parts.reduce((sum, e) => sum + e.z, 0) / parts.length };
      // Fixed inspection framing for every viewport/state. The source camera
      // remains unchanged; this is not a guarantee for arbitrary hero positions.
      h.teleport(centroid.x - .5, centroid.z + 1);
      window.__crawlerPresentationFixture = { centroid, heroOffset: { x: -.5, z: 1 }, heroPosition: window.__crawlerPresentationProbe.primaryActor.group.position.toArray() };
      window.__crawlerPresentationSnapshot = structuredClone(h.captureSuspend());
    });
    // Let real-time briefing/claim notices finish before judging fixed HUD overlap.
    await page.waitForTimeout(31_000);
    const admission = viewport.width === 1280 ? await checkAdmission(page, { loaderUrl, optimizedUrl, rawUrl: `${baseUrl}/assets/pilots/crawler-3d/crawler.glb` }) : null;
    const poses = {}, presentationFailures = [];
    for (const damagedId of [null, 'drain_mast', 'tracks', 'capacitor_bank']) {
      assert.equal(await page.evaluate(id => {
        const h = window.__GR_TEST__, snapshot = structuredClone(window.__crawlerPresentationSnapshot);
        for (const e of snapshot.enemies.active) if (e.variantId === 'dynamo_crawler') e.hp = e.maxHp * (e.bossComponentId === id ? .49 : 1);
        const restored = h.restoreSuspend(snapshot);
        if (restored) h.advanceSim(.1);
        return restored;
      }, damagedId), true);
      await mounted(page);
      await page.waitForTimeout(6500);
      const dismissedStoryBeats = await dismissStoryCards(page);
      const pose = await page.evaluate(async terrainUrl => {
        if (!terrainUrl) throw new Error('running Terrain module URL was not observed');
        const terrain = await import(terrainUrl);
        const g = window.__crawlerPresentationProbe, h = window.__GR_TEST__, boss = g.crawlerBoss;
        const model = boss.crawler3dModel, mast = boss.crawler3dMeshes.get('drain_mast');
        model.updateWorldMatrix(true, true);
        boss.beamAmber.updateWorldMatrix(true, false);
        const end = model.position.clone().set(0, .5, 0).applyMatrix4(boss.beamAmber.matrixWorld);
        const anchor = mast.userData.collectorAnchor;
        const expected = model.position.clone().fromArray(anchor.intact).lerp(model.position.clone().fromArray(anchor.damaged), mast.morphTargetInfluences[0]).applyMatrix4(model.matrixWorld);
        const parts = h.enemyPositions().filter(e => e.variantId === 'dynamo_crawler');
        let nearestMastVertex = Infinity;
        const rect = points => {
          const result = { x: Infinity, y: Infinity, right: -Infinity, bottom: -Infinity };
          for (const point of points) {
            const p = point.clone().project(g.camera), x = (p.x + 1) * innerWidth / 2, y = (1 - p.y) * innerHeight / 2;
            result.x = Math.min(result.x, x); result.y = Math.min(result.y, y);
            result.right = Math.max(result.right, x); result.bottom = Math.max(result.bottom, y);
          }
          return { ...result, width: result.right - result.x, height: result.bottom - result.y };
        };
        const modelPoints = [];
        const components = [...boss.crawler3dMeshes].map(([id, mesh]) => {
          const bounds = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
          const point = model.position.clone();
          for (let i = 0; i < mesh.geometry.attributes.position.count; i++) {
            mesh.getVertexPosition(i, point).applyMatrix4(mesh.matrixWorld);
            modelPoints.push(point.clone());
            point.toArray().forEach((value, axis) => { bounds.min[axis] = Math.min(bounds.min[axis], value); bounds.max[axis] = Math.max(bounds.max[axis], value); });
            if (id === 'drain_mast') nearestMastVertex = Math.min(nearestMastVertex, point.distanceTo(end));
          }
          const enemy = parts.find(e => e.bossComponentId === id), material = mesh.material;
          return { id, bounds, proxy: [enemy.x, enemy.y, enemy.z], hitRadius: enemy.hitRadius,
            proxyGap: Math.hypot(Math.max(bounds.min[0] - enemy.x, 0, enemy.x - bounds.max[0]), Math.max(bounds.min[2] - enemy.z, 0, enemy.z - bounds.max[2])),
            morph: mesh.morphTargetInfluences[0], texturedFill: !!material.map && material.emissiveMap === material.map,
            intensity: material.emissiveIntensity, emissive: material.emissive.getHexString(), triangles: (mesh.geometry.index?.count ?? mesh.geometry.attributes.position.count) / 3 };
        });
        const bar = g.enemies.bossHpGroup;
        bar.updateWorldMatrix(true, true);
        const meshRect = mesh => rect(Array.from({ length: mesh.geometry.attributes.position.count }, (_, i) => model.position.clone().fromBufferAttribute(mesh.geometry.attributes.position, i).applyMatrix4(mesh.matrixWorld)));
        const hud = ['hud-vitals', 'hud-gold', 'hud-power', 'hud-weapon'].flatMap(id => {
          const el = document.querySelector(`[data-testid="${id}"]`);
          if (!el || !el.checkVisibility()) return [];
          const r = el.getBoundingClientRect();
          return [{ id, x: r.x, y: r.y, right: r.right, bottom: r.bottom }];
        });
        const supportGaps = boss.crawler3dSupportPoints.map(point => {
          const p = point.clone().applyMatrix4(model.matrixWorld);
          return p.y - terrain.visualY(p.x, p.z, 0);
        });
        const materials = [...boss.crawler3dMeshes.values()].map(mesh => mesh.material);
        const observed = { components, materialCount: new Set(materials).size, atlasCount: new Set(materials.map(material => material.map)).size,
          model: { position: model.position.toArray(), rotation: model.rotation.toArray(), scale: model.scale.toArray(), visible: model.visible },
          camera: { position: g.camera.position.toArray(), rotation: g.camera.rotation.toArray(), fov: g.camera.fov, aspect: g.camera.aspect },
          beam: { visible: boss.beam.visible, end: end.toArray(), expected: expected.toArray(), anchorError: end.distanceTo(expected), nearestMastVertex },
          collectorAnchor: anchor, renderer: window.__THREE_GAME_DIAGNOSTICS__.renderer,
          support: { count: supportGaps.length, minGap: Math.min(...supportGaps), maxGap: Math.max(...supportGaps), halfSize: boss.crawler3dSupportHalfSize.toArray() },
          hullPointCounts: Object.fromEntries([...boss.crawler3dHullPoints].map(([id, states]) => [id, states.map(points => points.length)])),
          modelRect: rect(modelPoints), hullRect: rect(boss.crawler3dBarPoints), hud,
          bar: { visible: bar.visible, rect: meshRect(g.enemies.bossHpBack), fillRect: meshRect(g.enemies.bossHpFill),
            transparent: g.enemies.bossHpFill.material.transparent, depthWrite: g.enemies.bossHpFill.material.depthWrite } };
        const savedState = () => { const snapshot = h.captureSuspend(); delete snapshot.writtenAt; return JSON.stringify(snapshot); };
        const snapshotBefore = savedState();
        for (let i = 0; i < 5; i++) boss.syncPresentation(boss.lastAt);
        return { ...observed, snapshotUnchanged: snapshotBefore === savedState() };
      }, terrainUrl);
      pose.dismissedStoryBeats = dismissedStoryBeats;
      pose.capture = await saveDrainShot(page, viewport, damagedId, pose);
      assert.equal(pose.snapshotUnchanged, true, 'render updates preserve suspend state apart from its wall-clock writtenAt envelope');
      assert.equal(pose.model.visible, true);
      assert.equal(pose.materialCount, 3, 'damage materials remain component-local');
      assert.equal(pose.atlasCount, 1, 'materials share the existing authored atlas');
      assert.equal(pose.beam.visible, true, 'fixture exercises a live drain attachment');
      assert.ok(pose.beam.anchorError < 1e-5, 'drawn beam ends at the morphed collector anchor');
      assert.ok(pose.beam.nearestMastVertex < .25 * 3.1, 'collector attachment remains within the scaled visible lens and cage');
      assert.equal(pose.components.reduce((sum, component) => sum + component.triangles, 0), 11_760);
      assert.deepEqual(pose.model.scale, [3.1, 3.1, 3.1]);
      assert.ok(pose.support.count > 0 && pose.support.count < 1000, 'terrain support uses a bounded admitted footprint');
      assert.ok(pose.support.minGap >= .024 && pose.support.minGap < .03, 'a track support touches the terrain without penetration');
      for (const counts of Object.values(pose.hullPointCounts)) for (const count of counts) assert.ok(count >= 4 && count < 1000, 'bar uses a bounded cached hull');
      for (const edge of ['x', 'y', 'right', 'bottom']) assert.ok(Math.abs(pose.modelRect[edge] - pose.hullRect[edge]) < .05, 'cached hull matches the actual projected model envelope');
      assert.equal(pose.bar.visible, true);
      assert.equal(pose.bar.transparent, true);
      assert.equal(pose.bar.depthWrite, false);
      pose.bar.modelGap = pose.modelRect.y - pose.bar.rect.bottom;
      if (pose.bar.modelGap <= 2) presentationFailures.push(`${damagedId ?? 'intact'} bar/model clearance ${pose.bar.modelGap}px is below 2px`);
      pose.viewportOverflow = {};
      for (const [label, r] of [['model', pose.modelRect], ['bar', pose.bar.rect]]) {
        pose.viewportOverflow[label] = { left: Math.max(0, -r.x), top: Math.max(0, -r.y), right: Math.max(0, r.right - viewport.width), bottom: Math.max(0, r.bottom - viewport.height) };
        if (Object.values(pose.viewportOverflow[label]).some(value => value > 0)) presentationFailures.push(`${damagedId ?? 'intact'} ${label} exceeds viewport: ${JSON.stringify(pose.viewportOverflow[label])}`);
      }
      pose.bar.hudOverlaps = pose.hud.filter(hud => overlaps(pose.bar.rect, hud)).map(hud => hud.id);
      for (const id of pose.bar.hudOverlaps) presentationFailures.push(`${damagedId ?? 'intact'} bar overlaps fixed ${id}`);
      const r = pose.bar.fillRect;
      const clip = { x: Math.ceil(r.x + 1), y: Math.ceil(r.y), width: Math.max(1, Math.floor(r.right - 1) - Math.ceil(r.x + 1)), height: Math.max(1, Math.floor(r.bottom) - Math.ceil(r.y)) };
      const png = PNG.sync.read(await page.screenshot({ clip }));
      let greenPixels = 0;
      for (let i = 0; i < png.data.length; i += 4) if (png.data[i + 1] > png.data[i] * 1.25 && png.data[i + 1] > png.data[i + 2] * 1.25 && png.data[i + 1] > 70) greenPixels++;
      pose.bar.fillPixels = { clip, greenPixels, fraction: greenPixels / (png.width * png.height) };
      assert.ok(pose.bar.fillPixels.fraction > .25, 'at least a quarter of the actual fill crop contains visible green health pixels');
      for (const point of Object.values(pose.collectorAnchor)) assert.ok(Array.isArray(point) && point.length === 3 && point.every(Number.isFinite));
      for (const component of pose.components) {
        assert.equal(component.morph, component.id === damagedId ? 1 : 0);
        assert.equal(component.texturedFill, true, 'fill preserves the authored surface texture');
        assert.equal(component.intensity, component.id === damagedId ? 2.2 : 2, 'mapped fill uses the selected intact/damaged exposure');
        if (damagedId) {
          const intact = poses.intact.components.find(c => c.id === component.id);
          assert.ok(component.id === damagedId ? component.intensity > intact.intensity : component.intensity === intact.intensity, 'damage changes only its own material');
          assert.deepEqual(component.proxy, intact.proxy, 'presentation damage leaves target positions unchanged');
        }
      }
      if (damagedId) {
        assert.deepEqual(pose.model, poses.intact.model, 'damage retains the mounted model transform');
        assert.deepEqual(pose.camera, poses.intact.camera, 'damage retains the gameplay camera');
      }
      poses[damagedId ?? 'intact'] = pose;
    }
    assert.deepEqual(errors, []);
    assert.deepEqual(warnings.filter(message => /validation|shader error|WebGL.*error|WebGPU.*error/i.test(message)), []);
    const fixture = await page.evaluate(() => window.__crawlerPresentationFixture);
    console.log(JSON.stringify({ viewport, fixture, sourceProvenance, gameUrl, admission, poses, presentationFailures, errors, warnings }));
    assert.deepEqual(presentationFailures, [], 'every damage state clears the viewport, model, and fixed HUD');
    await page.close();
  }
} finally { await browser.close(); }

async function mounted(page) {
  await page.waitForFunction(() => document.querySelector('canvas')?.dataset.crawler3dState === 'ready');
  await page.evaluate(() => window.__GR_TEST__.advanceSim(.1));
  await page.waitForFunction(() => document.querySelector('canvas')?.dataset.crawler3dMounted === 'true');
}

function overlaps(a, b) { return a.x < b.right && a.right > b.x && a.y < b.bottom && a.bottom > b.y; }

async function dismissStoryCards(page) {
  const dismissed = [], card = page.getByTestId('story-beat-card');
  for (let i = 0; i < 8; i++) {
    if (await card.isVisible()) {
      dismissed.push(await card.getAttribute('data-beat-id'));
      const proceed = card.locator('[data-story-ceremony-continue]');
      if (await proceed.isVisible()) await proceed.click();
      else {
        const rect = await card.boundingBox();
        // Ordinary cards are pointer-events:none; the existing document
        // pointerdown handler dismisses a real click at the visible card.
        await page.mouse.click(rect.x + rect.width / 2, rect.y + rect.height / 2);
      }
    }
    await page.waitForTimeout(3100); // Existing story queue has a three-second gap.
    if (!(await card.isVisible())) return dismissed;
  }
  assert.equal(await card.isVisible(), false, 'story queue must finish before an unobscured capture');
  return dismissed;
}

async function saveDrainShot(page, viewport, damagedId, pose) {
  const directory = resolve(process.env.GR_CHECK_CAPTURE_DIR ?? 'artifacts/boss-fidelity/e3-crawler/final-route-framed');
  await mkdir(directory, { recursive: true });
  const name = `${viewport.width === 1280 ? 'desktop' : 'mobile'}-${damagedId ? `${damagedId}-broken` : 'intact'}`;
  const screenshot = await page.screenshot(), full = PNG.sync.read(screenshot);
  const x = Math.max(0, Math.floor(Math.min(pose.modelRect.x, pose.bar.rect.x) - 12));
  const y = Math.max(0, Math.floor(Math.min(pose.modelRect.y, pose.bar.rect.y) - 12));
  const right = Math.min(full.width, Math.ceil(Math.max(pose.modelRect.right, pose.bar.rect.right) + 12));
  const bottom = Math.min(full.height, Math.ceil(Math.max(pose.modelRect.bottom, pose.bar.rect.bottom) + 12));
  const crop = new PNG({ width: right - x, height: bottom - y });
  PNG.bitblt(full, crop, x, y, crop.width, crop.height, 0, 0);
  const cropped = PNG.sync.write(crop), path = resolve(directory, `${name}.png`), cropPath = resolve(directory, `${name}-crawler.png`);
  await writeFile(path, screenshot); await writeFile(cropPath, cropped);
  await writeFile(resolve(directory, `${name}.json`), JSON.stringify({ viewport, damagedId, pose }, null, 2));
  return { path, cropPath, crop: { x, y, width: crop.width, height: crop.height },
    fullSha256: createHash('sha256').update(screenshot).digest('hex'), cropSha256: createHash('sha256').update(cropped).digest('hex'), exactCrop: true };
}

async function checkAdmission(page, urls) {
  const result = await page.evaluate(async ({ loaderUrl, rawUrl, optimizedUrl }) => {
    if (!loaderUrl) throw new Error('running AssetLoading module URL was not observed');
    const { createGltfLoader } = await import(loaderUrl);
    const live = window.__crawlerPresentationProbe.crawlerBoss;
    const raw = (await createGltfLoader().loadAsync(rawUrl)).scene;
    const invalid = {};
    // Each malformed clone has independent geometry/materials; leave the shared
    // loaded texture alive until its source probe has finished.
    for (const fault of ['missing-collector-anchor', 'nonfinite-collector-anchor', 'empty-support', 'zero-width-support']) {
      const clone = raw.clone(true), meshes = [];
      clone.traverse(mesh => {
        if (!mesh.isMesh) return;
        mesh.geometry = mesh.geometry.clone();
        meshes.push(mesh);
      });
      const material = meshes[0].material.clone();
      meshes.forEach(mesh => { mesh.material = material; });
      const mast = meshes.find(mesh => mesh.name === 'drain_mast'), tracks = meshes.find(mesh => mesh.name === 'tracks');
      if (fault === 'missing-collector-anchor') delete mast.userData.collectorAnchor;
      else if (fault === 'nonfinite-collector-anchor') mast.userData.collectorAnchor.intact[0] = Infinity;
      else {
        const positions = tracks.geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          if (fault === 'empty-support') positions.setY(i, positions.getY(i) + 10);
          else positions.setX(i, 0);
        }
      }
      const examiner = new live.constructor(() => [], () => [], () => false, () => false);
      invalid[fault] = examiner.inspectCrawler3d(clone) === null;
      examiner.dispose();
      meshes.forEach(mesh => mesh.geometry.dispose());
      material.dispose();
    }
    const models = {};
    for (const [label, scene] of [['raw', raw], ['optimized', (await createGltfLoader().loadAsync(optimizedUrl)).scene]]) {
      let damagedId = null;
      const examiner = new live.constructor(
        () => live.enemies().map(enemy => new Proxy(enemy, { get(target, key) { return key === 'currentHp' && target.bossComponentId === damagedId ? target.maxHp * .49 : Reflect.get(target, key); } })),
        live.powerNodes, () => false, () => false,
      );
      examiner.restoreSuspend(live.captureSuspend(live.lastAt), live.lastAt);
      const meshes = examiner.inspectCrawler3d(scene);
      if (!meshes) throw new Error(`${label} production-loader asset failed crawler admission`);
      examiner.crawler3dModel = scene;
      examiner.crawler3dState = 'ready';
      for (const [id, mesh] of meshes) examiner.crawler3dMeshes.set(id, mesh);
      examiner.group.add(scene);
      const box = bounds => ({ min: bounds.min.toArray(), max: bounds.max.toArray() });
      const worldBounds = points => {
        const bounds = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
        for (const point of points) point.toArray().forEach((v, axis) => {
          bounds.min[axis] = Math.min(bounds.min[axis], v); bounds.max[axis] = Math.max(bounds.max[axis], v);
        });
        return bounds;
      };
      const boundError = (a, b) => Math.max(...a.min.map((v, i) => Math.abs(v - b.min[i])), ...a.max.map((v, i) => Math.abs(v - b.max[i])));
      const drawnCollector = [], runtimeStates = {};
      for (damagedId of [null, 'drain_mast', 'tracks', 'capacitor_bank']) {
        examiner.syncPresentation(live.lastAt);
        scene.updateWorldMatrix(true, true);
        // Read the actual public callback after the real update. Reconstructing
        // world points from the root cache would miss a wrong runtime transform.
        const callback = examiner.modelBounds(examiner.crawler3dGroupId);
        if (!callback) throw new Error(`${label} runtime modelBounds callback missing`);
        const renderedPoints = [];
        for (const mesh of meshes.values()) for (let i = 0; i < mesh.geometry.attributes.position.count; i++) {
          renderedPoints.push(mesh.getVertexPosition(i, scene.position.clone()).applyMatrix4(mesh.matrixWorld));
        }
        const renderedBounds = worldBounds(renderedPoints), callbackBounds = worldBounds(callback.points);
        const project = point => {
          const p = point.clone().project(window.__crawlerPresentationProbe.camera);
          return p.set((p.x + 1) * innerWidth / 2, (1 - p.y) * innerHeight / 2, 0);
        };
        const renderedScreenBounds = worldBounds(renderedPoints.map(project)), callbackScreenBounds = worldBounds(callback.points.map(project));
        runtimeStates[damagedId ?? 'intact'] = { renderedBounds, callbackBounds, callbackBox: box(callback.bounds),
          renderedScreenBounds, callbackScreenBounds, callbackPointCount: callback.points.length,
          worldBoundsError: boundError(renderedBounds, callbackBounds), screenBoundsError: boundError(renderedScreenBounds, callbackScreenBounds),
          callbackVertexError: Math.sqrt(Math.max(...callback.points.map(point => Math.min(...renderedPoints.map(vertex => point.distanceToSquared(vertex)))))),
        };
        examiner.beamAmber.updateWorldMatrix(true, false);
        const end = scene.position.clone().set(0, .5, 0).applyMatrix4(examiner.beamAmber.matrixWorld);
        const expected = (damagedId === 'drain_mast' ? examiner.crawler3dDamagedCollectorAnchor : examiner.crawler3dCollectorAnchor).clone().applyMatrix4(scene.matrixWorld);
        drawnCollector.push({ damagedId, visible: examiner.beam.visible, end: end.toArray(), anchorError: end.distanceTo(expected) });
      }
      scene.updateWorldMatrix(true, true);
      models[label] = {
        loader: 'createGltfLoader().loadAsync → inspectCrawler3d',
        rootBounds: Object.fromEntries([...examiner.crawler3dLocalBounds].map(([id, states]) => [id, states.map(box)])),
        runtimeStates,
        hullCounts: Object.fromEntries([...examiner.crawler3dHullPoints].map(([id, states]) => [id, states.map(points => points.length)])),
        rootSupports: examiner.crawler3dSupportPoints.map(point => point.toArray()),
        worldSupports: examiner.crawler3dSupportPoints.map(point => point.clone().applyMatrix4(scene.matrixWorld).toArray()),
        supportHalfSize: examiner.crawler3dSupportHalfSize.toArray(),
        worldCollector: [examiner.crawler3dCollectorAnchor, examiner.crawler3dDamagedCollectorAnchor].map(point => point.clone().applyMatrix4(scene.matrixWorld).toArray()),
        drawnCollector,
        model: { position: scene.position.toArray(), rotation: scene.rotation.toArray(), scale: scene.scale.toArray() },
        meshTransforms: [...meshes].map(([id, mesh]) => ({ id, position: mesh.position.toArray(), scale: mesh.scale.toArray() })),
      };
      examiner.dispose();
    }
    // Isolated constructors publish their state; restore the live presentation.
    live.syncPresentation(live.lastAt);
    return { urls: { rawUrl, optimizedUrl }, invalid, models };
  }, urls);
  for (const [fault, rejected] of Object.entries(result.invalid)) assert.equal(rejected, true, `admission rejects ${fault}`);
  const delta = (a, b) => Math.max(...a.flat(Infinity).map((v, i) => Math.abs(v - b.flat(Infinity)[i])));
  const boundsDelta = (a, b) => Math.max(...Object.keys(a).flatMap(id => a[id].map((state, i) => delta([state.min, state.max], [b[id][i].min, b[id][i].max]))));
  const distance = (a, b) => Math.hypot(...a.map((v, i) => v - b[i]));
  const hausdorff = (a, b) => Math.max(...a.map(point => Math.min(...b.map(other => distance(point, other)))), ...b.map(point => Math.min(...a.map(other => distance(point, other)))));
  const { raw, optimized } = result.models;
  for (const [label, model] of Object.entries(result.models)) for (const state of model.drawnCollector) {
    assert.equal(state.visible, true, `${label} isolated real presentation exercises the drain`);
    assert.ok(state.anchorError < 1e-5, `${label} drawn beam uses asset-root anchors in intact and damaged states`);
  }
  for (const [label, model] of Object.entries(result.models)) for (const [id, state] of Object.entries(model.runtimeStates)) {
    assert.ok(state.worldBoundsError < 1e-5, `${label} ${id} actual callback hull matches rendered world bounds: ${state.worldBoundsError}`);
    assert.ok(state.screenBoundsError < .01, `${label} ${id} actual callback hull matches rendered screen bounds: ${state.screenBoundsError}`);
    assert.ok(state.callbackVertexError < 1e-5, `${label} ${id} every actual callback point belongs to the drawn geometry: ${state.callbackVertexError}`);
  }
  const parity = {
    rootMorphBounds: boundsDelta(raw.rootBounds, optimized.rootBounds),
    worldMorphBounds: Math.max(...Object.keys(raw.runtimeStates).map(id => delta([raw.runtimeStates[id].callbackBounds.min, raw.runtimeStates[id].callbackBounds.max], [optimized.runtimeStates[id].callbackBounds.min, optimized.runtimeStates[id].callbackBounds.max]))),
    supportHalfSize: delta(raw.supportHalfSize, optimized.supportHalfSize),
    rootSupportHausdorff: hausdorff(raw.rootSupports, optimized.rootSupports),
    worldSupportHausdorff: hausdorff(raw.worldSupports, optimized.worldSupports),
    worldCollector: delta(raw.worldCollector, optimized.worldCollector),
    modelPosition: delta(raw.model.position, optimized.model.position),
  };
  for (const key of ['rootMorphBounds', 'supportHalfSize', 'rootSupportHausdorff']) assert.ok(parity[key] < .003, `${key} survives production quantization within 0.003 authored units: ${parity[key]}`);
  for (const key of ['worldMorphBounds', 'worldSupportHausdorff', 'worldCollector', 'modelPosition']) assert.ok(parity[key] < .02, `${key} survives production quantization within 0.02 world units: ${parity[key]}`);
  // Keep receipts compact; the maximum bidirectional error proves both sets.
  for (const model of Object.values(result.models)) {
    model.supportCount = model.rootSupports.length;
    delete model.rootSupports; delete model.worldSupports;
  }
  return { ...result, parity };
}
