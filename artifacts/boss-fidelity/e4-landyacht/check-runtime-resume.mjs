// Actual-browser encounter check. Requires candidate adoption; does not edit game/test files.
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const base = process.env.GR_CAPTURE_BASE_URL ?? 'http://127.0.0.1:5246';
const root = 'artifacts/boss-fidelity/e4-landyacht';
const output = resolve(process.argv[2] ?? `${root}/runtime-resume`);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const sources = {};
for (const [production, candidate] of [
  ['src/systems/LandYachtBossSystem.ts', `${root}/candidate-runtime/LandYachtBossSystem.ts`],
  ['src/game/RunSuspend.ts', `${root}/candidate-runtime/RunSuspend.ts`],
  ['src/game/Game.ts', `${root}/candidate-runtime/Game.ts`],
  ['assets/pilots/land-yacht-3d/land-yacht.glb', `${root}/candidate-model/land-yacht.glb`],
]) {
  const bytes = await readFile(production);
  assert(bytes.equals(await readFile(candidate)), `${production}: candidate not adopted; browser not started`);
  sources[production] = sha(bytes);
}
await mkdir(output, { recursive: true });
const report = { base, sources, cases: [], errors: [], redirects: [], limitations: 'Checks use the full JSON save envelope through existing capture/restore hooks. Equality assertions cover boss state, boss actor state and model pose at explicit presentation alpha=1. No claim of whole-game future-state equality, arbitrary camera coverage, resource-count stability or real-device performance.' };
const browser = await chromium.launch({ channel: 'chromium', headless: true });
const ids = ['wheels', 'crane', 'wheelhouse'];
const orders = ids.flatMap(a => ids.filter(b => b !== a).map(b => [a, b, ids.find(c => c !== a && c !== b)]));

function closeEnough(a, b, path = 'state') {
  if (typeof a === 'number' && typeof b === 'number') {
    assert(Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= 1e-8, `${path}: ${a} != ${b}`);
  } else if (a !== null && b !== null && typeof a === 'object' && typeof b === 'object') {
    assert.deepEqual(Object.keys(a).sort(), Object.keys(b).sort(), path);
    for (const key of Object.keys(a)) closeEnough(a[key], b[key], `${path}.${key}`);
  } else assert.deepEqual(a, b, path);
}
assert.throws(() => closeEnough({ act: 1 }, { act: 2 }));

async function open(viewport, { tier = 'full', route } = {}) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  page.setDefaultTimeout(30000);
  let gameUrl;
  const served = {}, responses = [];
  page.on('request', request => { if (new URL(request.url()).pathname === '/src/game/Game.ts') gameUrl = request.url(); });
  page.on('response', response => {
    const path = new URL(response.url()).pathname.slice(1);
    if (!Object.hasOwn(sources, path)) return;
    if (response.status() >= 300 && response.status() < 400) { report.redirects.push({ url: response.url(), status: response.status() }); return; }
    responses.push(response.body().then(bytes => {
      served[path] = { status: response.status(), sha256: sha(bytes) };
    }).catch(error => report.errors.push(error.message)));
  });
  page.on('pageerror', error => report.errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') report.errors.push(message.text()); });
  if (route) await page.route('**/land-yacht.glb*', route);
  await page.addInitScript(tier => {
    localStorage.clear(); localStorage.setItem('gr.activeEpoch.v1', 'epoch-4-motor');
    localStorage.setItem('gr.performance.tier.v1', tier);
  }, tier);
  await page.goto(`${base}/?debug&epoch=epoch-4-motor&contract=e4-dust-flats&nolevel&nopause&tier=${tier}&seed=land-yacht`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 12);
  const briefing = page.getByTestId('contract-briefing-dismiss');
  if (await briefing.isVisible()) await briefing.evaluate(button => button.click());
  assert(gameUrl, 'observed Game module URL missing');
  await page.evaluate(async url => {
    const { Game } = await import(url), original = Game.prototype.warmCombatPools;
    Game.prototype.warmCombatPools = function (...args) {
      window.__landYachtResumeGame = this; Game.prototype.warmCombatPools = original;
      return original.apply(this, args);
    };
    const h = window.__GR_TEST__;
    h.setManualSim(true);
    for (const [key, value] of Object.entries({ 'waves.waveInterval': .35, 'waves.trickleInterval': 999, 'waves.pulseBase': 0, 'waves.pulsePerWave': 0, 'waves.aliveCap': 20, 'enemy.contactDamage': 0, 'sparkRig.range': 0, 'sparkRig.damage': 0, 'landYacht.lootIntervalSeconds': .3, 'landYacht.craneGrabCooldownSeconds': .1 })) h.setBalance(key, value);
    await h.warmVfx();
  }, gameUrl);
  return { page, async close() {
    await Promise.all(responses);
    const asset = 'assets/pilots/land-yacht-3d/land-yacht.glb';
    if (served[asset] && !route) assert.deepEqual(served[asset], { status: 200, sha256: sources[asset] });
    await page.close(); return served;
  } };
}

async function mounted(page) {
  await page.waitForFunction(() => document.querySelector('canvas')?.dataset.landYacht3dMounted === 'true');
}

async function read(page) {
  return page.evaluate(() => {
    const h = window.__GR_TEST__, game = window.__landYachtResumeGame, boss = game.landYachtBoss;
    const before = JSON.stringify(h.captureSuspend().landYachtBoss);
    game.applyRenderInterpolation(1);
    const save = JSON.parse(JSON.stringify(h.captureSuspend()));
    if (before !== JSON.stringify(save.landYachtBoss)) throw new Error('Presentation changed saved boss state');
    const model = boss.model;
    if (!model?.visible) throw new Error('Model is not visible');
    model.updateWorldMatrix(true, true);
    return { save, diagnostics: boss.diagnostics(), matrix: model.matrixWorld.toArray(), scale: model.scale.toArray(),
      meshVisible: Object.fromEntries([...boss.modelMeshes].map(([id, mesh]) => [id, mesh.visible])),
      morphs: Object.fromEntries([...boss.modelMeshes].map(([id, mesh]) => [id, mesh.morphTargetInfluences[0]])),
      actors: save.enemies.active.filter(e => e.variantId === 'land_yacht').sort((a, b) => a.bossComponentId.localeCompare(b.bossComponentId)) };
  });
}

async function restore(page, snapshot) {
  assert.equal(await page.evaluate(save => window.__GR_TEST__.restoreSuspend(save), snapshot), true);
  await mounted(page);
}

async function freshResume(state, viewport, label) {
  const fresh = await open(viewport);
  try {
    await restore(fresh.page, state.save);
    const restored = await read(fresh.page);
    closeEnough(restored.save.landYachtBoss, state.save.landYachtBoss, `${label}.boss`);
    closeEnough(restored.actors, state.actors, `${label}.actors`);
    closeEnough(restored.matrix, state.matrix, `${label}.matrix`);
    assert.deepEqual(restored.morphs, state.morphs);
    await writeFile(`${output}/${label}-save.json`, JSON.stringify(state.save, null, 2));
    return restored;
  } finally { await fresh.close(); }
}

async function kill(page, id, waitForModel = true) {
  const target = await page.evaluate(id => {
    const h = window.__GR_TEST__, save = JSON.parse(JSON.stringify(h.captureSuspend()));
    const enemy = save.enemies.active.find(e => e.variantId === 'land_yacht' && e.bossComponentId === id);
    if (!enemy) throw new Error(`Missing target ${id}`);
    enemy.hp = .01;
    if (!h.restoreSuspend(save)) throw new Error('Damage setup restore rejected');
    return h.enemyPositions().find(e => e.variantId === 'land_yacht' && e.bossComponentId === id);
  }, id);
  await page.evaluate(({ x, z }) => {
    const h = window.__GR_TEST__; h.setBalance('blast.damage', .02);
    h.launchBlastAt(x, z, .05); h.advanceSim(.25);
  }, target);
  await page.waitForFunction(id => !window.__GR_TEST__.enemyPositions().some(e => e.variantId === 'land_yacht' && e.bossComponentId === id), id);
  if (waitForModel) await mounted(page);
}

try {
  if (process.env.GR_LANDYACHT_LIFECYCLE === '1') await lifecycle();
  else for (const [name, viewport] of [['desktop', { width: 1280, height: 800 }], ['mobile', { width: 390, height: 844 }]]) {
    const live = await open(viewport);
    try {
      await live.page.evaluate(() => {
        const h = window.__GR_TEST__, wave = window.__THREE_GAME_DIAGNOSTICS__.contract.baron.wave;
        h.setWave(wave - 1); h.advanceSim(.4); h.setBalance('waves.waveInterval', 999); h.setWave(wave); h.advanceSim(1);
      });
      await mounted(live.page);
      const initial = await read(live.page);
      assert(initial.save.landYachtBoss.stolenHeads > 0);
      assert.equal(initial.save.landYachtBoss.escortsFunded, initial.save.landYachtBoss.stolenHeads);
      await freshResume(initial, viewport, `${name}-orbit`);
      // Desktop covers all six orders; mobile repeats wheels-first and wheels-last.
      for (const order of name === 'desktop' ? orders : [orders[0], orders[5]]) {
        await restore(live.page, initial.save);
        const result = { viewport: name, order, checkpoints: [] };
        report.cases.push(result);
        for (const [index, id] of order.entries()) {
          await kill(live.page, id);
          const state = await read(live.page), destroyed = order.slice(0, index + 1);
          const beached = destroyed.includes('wheels'), complete = destroyed.length === 3;
          assert.equal(state.diagnostics.act, complete ? 3 : beached ? 2 : 1);
          assert.equal(state.diagnostics.beached, beached);
          for (const flag of ['salvageReady', 'wreckRemains', 'bellTaken', 'gangDeparted']) assert.equal(state.diagnostics[flag], complete);
          assert.deepEqual(state.scale, [1.4, 1.4, 1.4]);
          assert.deepEqual(state.meshVisible, { wheels: true, crane: true, wheelhouse: true });
          for (const component of ids) assert.equal(state.morphs[component], destroyed.includes(component) ? 1 : 0);
          assert.deepEqual(state.actors.map(e => e.bossComponentId).sort(), ids.filter(id => !destroyed.includes(id)).sort());
          const { save, ...receipt } = state;
          result.checkpoints.push({ ...receipt, boss: save.landYachtBoss });
          if (index === 1 || complete && (order === orders[0] || order === orders[5])) {
            const resumed = await freshResume(state, viewport, `${name}-${order.join('-')}-${index + 1}`);
            // Continue this order from the actual fresh-page recaptured envelope.
            await restore(live.page, resumed.save);
          }
        }
        await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2));
      }
      report.cases.push({ viewport: name, served: await live.close() });
    } catch (error) { await live.close(); throw error; }
  }
  assert.deepEqual(report.errors, []);
  report.passed = true;
} catch (error) { report.failed = error.stack; process.exitCode = 1; }
finally {
  await browser.close();
  await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ output, passed: report.passed, failed: report.failed, cases: report.cases.length }));
}

async function spawn(page) {
  await page.evaluate(() => {
    const h = window.__GR_TEST__, wave = window.__THREE_GAME_DIAGNOSTICS__.contract.baron.wave;
    h.setWave(wave - 1); h.advanceSim(.4); h.setBalance('waves.waveInterval', 999); h.setWave(wave);
  });
}
async function inspectFallback(page) {
  return page.evaluate(() => {
    const boss = window.__landYachtResumeGame.landYachtBoss;
    return { state: boss.modelState, canvasState: document.querySelector('canvas')?.dataset.landYacht3dState, tier: window.__THREE_GAME_DIAGNOSTICS__?.performance?.tier, model: !!boss.model, children: boss.group.children.filter(x => x.name === 'LandYacht3d').length,
      visibleSprites: [...boss.componentSprites.values()].filter(p => p.healthy.visible || p.damaged.visible).length,
      meshes: boss.modelMeshes.size, supports: boss.modelSupports.map(x => x.length), hulls: boss.modelHulls.size,
      parts: window.__GR_TEST__.enemyPositions().filter(e => e.variantId === 'land_yacht').map(e => e.bossComponentId) };
  });
}
async function lifecycle() {
  const viewport = { width: 1280, height: 800 };
  for (const mode of ['lite', 'invalid', ...ids, 'reset']) {
    let release, requests = 0;
    const held = new Promise(resolve => { release = resolve; });
    const fixture = await open(viewport, { tier: mode === 'lite' ? 'lite' : 'full', route: async route => {
      requests++;
      if (mode === 'invalid' || mode === 'lite') return route.fulfill({ status: 200, contentType: 'model/gltf-binary', body: 'invalid' });
      await held; await route.continue();
    } });
    const item = { mode }; report.cases.push(item);
    try {
      await spawn(fixture.page);
      const expected = mode === 'lite' ? 'lite' : mode === 'invalid' ? 'failed' : 'loading';
      item.initial = await inspectFallback(fixture.page);
      await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2));
      await fixture.page.waitForFunction(state => window.__landYachtResumeGame.landYachtBoss.modelState === state, expected);
      item.before = await inspectFallback(fixture.page);
      assert.equal(item.before.model, false); assert.equal(item.before.visibleSprites, 3);
      if (ids.includes(mode)) {
        for (const id of ids.filter(id => id !== mode)) await kill(fixture.page, id, false);
        release(); await mounted(fixture.page);
        const state = await read(fixture.page);
        assert.deepEqual(state.actors.map(e => e.bossComponentId), [mode]);
        for (const id of ids) assert.equal(state.morphs[id], id === mode ? 0 : 1);
        item.after = await inspectFallback(fixture.page);
        assert.equal(item.after.children, 1); assert.equal(item.after.visibleSprites, 0);
      } else if (mode === 'reset') {
        await fixture.page.evaluate(() => { window.__GR_TEST__.resetRun(); window.__GR_TEST__.setManualSim(true); });
        release(); await fixture.page.waitForTimeout(1500);
        item.after = await inspectFallback(fixture.page);
        assert.equal(item.after.state, 'off'); assert.equal(item.after.model, false); assert.equal(item.after.children, 0);
        assert.equal(item.after.meshes, 0); assert.deepEqual(item.after.supports, [0, 0]);
      }
      item.requests = requests;
      if (mode === 'lite') assert.equal(requests, 0); else assert(requests > 0);
    } finally { release(); await fixture.close(); }
    await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2));
  }
  const fixture = await open(viewport);
  try {
    await spawn(fixture.page); await mounted(fixture.page);
    await fixture.page.evaluate(() => {
      const boss = window.__landYachtResumeGame.landYachtBoss, resources = new Set();
      boss.model.traverse(mesh => {
        if (!mesh.isMesh) return;
        resources.add(mesh.geometry); resources.add(mesh.material); resources.add(mesh.material.map);
      });
      window.__landYachtDisposals = [...resources].map(resource => {
        const item = { type: resource.isTexture ? 'texture' : resource.isMaterial ? 'material' : 'geometry', count: 0 };
        resource.addEventListener('dispose', () => item.count++); return item;
      });
      window.__GR_TEST__.resetRun(); window.__GR_TEST__.setManualSim(true);
    });
    const disposals = await fixture.page.evaluate(() => window.__landYachtDisposals);
    assert.equal(disposals.length, 7);
    // Existing disposeObject3D traverses both map aliases on each of three materials.
    assert(disposals.every(item => item.count === (item.type === 'texture' ? 6 : 1)));
    const state = await inspectFallback(fixture.page);
    assert.equal(state.model, false); assert.equal(state.meshes, 0); assert.equal(state.hulls, 0); assert.deepEqual(state.supports, [0, 0]);
    report.cases.push({ mode: 'loaded-reset-disposal', disposals, state });
  } finally { await fixture.close(); }
}
