import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const output = new URL('./movement-check.json', import.meta.url);
const report = { note: 'Actual production 30 Hz movement; legacy arm overrides only the isolated instance night callback as a negative control. No actor/route resnap.', arms: {} };
const browser = await chromium.launch({ channel: 'chromium', headless: true });

// The same instrumentation is installed in the browser and Vite SSR instances.
function instrument(g, legacy) {
  const contract = g.activeContract ?? g.manifest;
  const raw = e => {
    const c = contract.twist.mothSeason;
    if (e.variantId === 'moth_swarm') return 1;
    return g.lightField.coverageAt(e.position.x, e.position.z) < c.litThreshold ? c.nightSpeedOutsideLight : 1;
  };
  const night = g.nightSpeedMultiplier.bind(g);
  for (const bossGroupId of [undefined, null]) {
    const ungrouped = { variantId: 'dynamo_crawler', bossGroupId, isWrecker: true, position: { x: 0, z: 0 } };
    if (night(ungrouped) !== raw(ungrouped)) throw new Error('Ungrouped Crawler must use raw light sampling');
  }
  if (legacy) g.nightSpeedMultiplier = e => e.variantId === 'dynamo_crawler' ? raw(e) : night(e);
  const update = g.enemies.update.bind(g.enemies);
  const state = { ticks: 0, splitTicks: 0, maxSpread: 0, maxError: 0, deltas: [], scalars: [], anchorIds: [], diagnosticErrors: 0, ordinaryErrors: 0, ungroupedPassed: true };
  g.enemies.update = function (...args) {
    const parts = this.all.filter(e => e.isAlive && e.variantId === 'dynamo_crawler');
    const anchor = parts.find(e => e.bossComponentId === 'tracks') ?? parts.find(e => e.bossComponentId === 'drain_mast') ?? parts.find(e => e.bossComponentId === 'capacitor_bank');
    const expected = anchor ? raw(anchor) : 1;
    const rows = [], callback = args[6];
    args[6] = e => {
      const scalar = callback(e);
      if (e.variantId === 'dynamo_crawler') rows.push(scalar);
      else if (scalar !== raw(e)) state.ordinaryErrors++;
      return scalar;
    };
    if (parts.length) {
      state.ticks++;
      if (new Set(parts.map(raw)).size > 1) state.splitTicks++;
      if (!state.deltas.includes(args[0])) state.deltas.push(args[0]);
      if (!state.anchorIds.includes(anchor.bossComponentId)) state.anchorIds.push(anchor.bossComponentId);
    }
    const result = update(...args);
    if (rows.length) {
      state.maxSpread = Math.max(state.maxSpread, Math.max(...rows) - Math.min(...rows));
      state.maxError = Math.max(state.maxError, ...rows.map(v => Math.abs(v - expected)));
      for (const v of rows) if (!state.scalars.includes(v)) state.scalars.push(v);
      if (!legacy && parts.some(e => e.isAlive && g.nightSpeedMultiplier(e) !== expected)) state.diagnosticErrors++;
    }
    return result;
  };
  return state;
}
function pose(g) {
  const parts = g.enemies.all.filter(e => e.isAlive && e.variantId === 'dynamo_crawler').map(e => ({ id: e.bossComponentId, x: e.position.x, z: e.position.z, speed: e.captureSuspend().scriptedSpeed }));
  const first = parts[0], last = parts.at(-1);
  return { at: g.timeAlive, parts, span: first && last ? Math.hypot(first.x - last.x, first.z - last.z) : 0 };
}
function checkArm(arm, legacy) {
  assert.deepEqual(arm.errors, []);
  assert.deepEqual(arm.instrument.deltas, [1 / 30]);
  assert.ok(arm.instrument.splitTicks > 50, 'fixture must cross real light boundaries');
  assert.ok(arm.instrument.scalars.includes(1) && arm.instrument.scalars.includes(1.08), 'night rule must remain active');
  if (legacy) {
    assert.ok(arm.poses[2].span - arm.poses[0].span > .5, 'negative control must expose drift');
    assert.ok(arm.instrument.maxSpread > .07);
  } else {
    assert.equal(arm.instrument.maxSpread, 0);
    assert.equal(arm.instrument.maxError, 0);
    assert.equal(arm.instrument.diagnosticErrors, 0);
    assert.equal(arm.instrument.ordinaryErrors, 0);
    for (const p of arm.poses) assert.ok(Math.abs(p.span - 8) < 1e-9, 'rigid span');
    assert.equal(arm.fallback.act, 1);
    assert.equal(arm.fallback.tracksPinned, false);
    assert.ok(arm.fallback.travel > .1, 'tracks-first must not pin surviving mast');
    assert.ok(arm.fallback.spanError < 1e-9);
    assert.ok(arm.instrument.anchorIds.includes('drain_mast'));
    assert.equal(arm.pinned.tracksPinned, true);
    assert.equal(arm.pinned.travel, 0);
    assert.ok(arm.instrument.anchorIds.includes('capacitor_bank'));
  }
}

async function openPage(tier = 'full') {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = []; let gameUrl;
  page.on('request', r => { if (new URL(r.url()).pathname === '/src/game/Game.ts') gameUrl = r.url(); });
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.addInitScript(() => { localStorage.clear(); localStorage.setItem('gr.activeEpoch.v1', 'epoch-3-voltage'); });
  await page.goto(`http://127.0.0.1:5246/?debug&epoch=epoch-3-voltage&contract=e3-canyon-works&nolevel&nopause&tier=${tier}&seed=crawler-lifecycle`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 16, null, { timeout: 60000 });
  const dismiss = page.getByTestId('contract-briefing-dismiss');
  if (await dismiss.isVisible()) await dismiss.evaluate(b => b.click());
  await page.evaluate(async url => {
    const { Game } = await import(url), original = Game.prototype.syncBaronRocketCart;
    Game.prototype.syncBaronRocketCart = function (...args) { window.__movementGame = this; Game.prototype.syncBaronRocketCart = original; return original.apply(this, args); };
    window.__GR_TEST__.setManualSim(true); window.__GR_TEST__.advanceSim(.1);
  }, gameUrl);
  await page.waitForFunction(() => window.__movementGame);
  await page.evaluate(() => {
    const h = window.__GR_TEST__;
    for (const [key, value] of Object.entries({ 'waves.waveInterval': .35, 'waves.trickleInterval': 999, 'waves.pulseBase': 0, 'waves.pulsePerWave': 0, 'waves.aliveCap': 0, 'enemy.contactDamage': 0, 'sparkRig.range': 0, 'sparkRig.damage': 0, 'turret.range': 0, 'turret.damage': 0, 'beacon.damage': 0, 'beacon.damagePerWave': 0 })) h.setBalance(key, value);
    h.setLocalWeaponForTest('blast'); h.setBalance('blast.damage', 0); h.grantGold(1000);
    for (const [x, z] of [[-12, -36], [-24, -20], [-28, 8]]) h.placeFree('sentry_beacon', x, z);
  });
  return { page, errors, gameUrl };
}
async function browserArm(legacy, tier = 'full') {
  const fixture = await openPage(tier), { page } = fixture;
  await page.evaluate(({ source, legacy, poseSource }) => {
    window.__movementStats = (0, eval)(`(${source})`)(window.__movementGame, legacy);
    window.__movementPose = (0, eval)(`(${poseSource})`);
    const h = window.__GR_TEST__; h.advanceSim(.2); h.setWave(13); h.advanceSim(.4); h.setBalance('waves.waveInterval', 999); h.setWave(14); h.advanceSim(.2);
  }, { source: instrument.toString(), legacy, poseSource: pose.toString() });
  const poses = [];
  for (const seconds of [0, 10, 10]) {
    poses.push(await page.evaluate(seconds => { window.__GR_TEST__.advanceSim(seconds); return window.__movementPose(window.__movementGame); }, seconds));
    await page.evaluate(() => {
      const h = window.__GR_TEST__, p = h.enemyPositions().filter(e => e.variantId === 'dynamo_crawler');
      h.teleport(p.reduce((v, e) => v + e.x, 0) / p.length - .5, p.reduce((v, e) => v + e.z, 0) / p.length + 1.5);
    });
    await page.waitForTimeout(350);
  }
  let fallback, pinned, snapshot, replay;
  if (!legacy) {
    snapshot = await page.evaluate(() => JSON.parse(JSON.stringify(window.__GR_TEST__.captureSuspend())));
    replay = await page.evaluate(() => { window.__GR_TEST__.advanceSim(1); return window.__movementPose(window.__movementGame); });
    assert.equal(await page.evaluate(s => window.__GR_TEST__.restoreSuspend(s), snapshot), true);
    assert.equal(await page.evaluate(() => window.__movementGame.crawlerNightSpeed), null, 'restore clears derived sample');
    await page.waitForTimeout(350);
    const repeated = await page.evaluate(() => { window.__GR_TEST__.advanceSim(1); return window.__movementPose(window.__movementGame); });
    assert.deepEqual(repeated, replay, 'same-instance JSON restore preserves future motion');
    ({ fallback, pinned } = await page.evaluate(() => {
      const g = window.__movementGame, h = window.__GR_TEST__, read = () => window.__movementPose(g);
      const kill = id => g.combat.killEnemy(g.enemies.all.find(e => e.isAlive && e.variantId === 'dynamo_crawler' && e.bossComponentId === id), g.timeAlive, 'hero');
      kill('tracks'); h.advanceSim(1 / 30); const a = read(); h.advanceSim(1); const b = read();
      const fallback = { ...g.crawlerBoss.diagnostics(), travel: Math.hypot(b.parts[0].x - a.parts[0].x, b.parts[0].z - a.parts[0].z), spanError: Math.abs(b.span - a.span) };
      kill('drain_mast'); h.advanceSim(1 / 30); const c = read(); h.advanceSim(1); const d = read();
      const pinned = { ...g.crawlerBoss.diagnostics(), travel: Math.hypot(d.parts[0].x - c.parts[0].x, d.parts[0].z - c.parts[0].z) };
      return { fallback, pinned };
    }));
    const restored = await openPage(tier);
    assert.equal(await restored.page.evaluate(s => window.__GR_TEST__.restoreSuspend(s), snapshot), true);
    await restored.page.waitForTimeout(350);
    const freshReplay = await restored.page.evaluate(poseSource => { window.__GR_TEST__.advanceSim(1); return (0, eval)(`(${poseSource})`)(window.__movementGame); }, pose.toString());
    assert.deepEqual(freshReplay, replay, 'fresh-page JSON restore preserves future motion');
    assert.deepEqual(restored.errors, []); await restored.page.close();
  }
  const result = { poses, instrument: await page.evaluate(() => window.__movementStats), fallback, pinned, restored: !legacy, errors: fixture.errors, gameUrl: fixture.gameUrl };
  await page.close(); return result;
}

let vite;
try {
  for (const [name, legacy, tier] of [['browser-legacy', true, 'full'], ['browser', false, 'full'], ['browser-lite', false, 'lite']]) {
    report.arms[name] = await browserArm(legacy, tier); checkArm(report.arms[name], legacy);
    console.log(name, report.arms[name].poses.map(p => p.span));
    await writeFile(output, JSON.stringify(report, null, 2) + '\n');
  }
  globalThis.location = new URL('http://gr-sim.local/?debug&contract=e3-canyon-works');
  globalThis.window = { location: globalThis.location };
  vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
  const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
  const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');
  for (const legacy of [true, false]) {
    Object.assign(Balance.waves, { waveInterval: .35, trickleInterval: 999, pulseBase: 0, pulsePerWave: 0, aliveCap: 0 });
    Object.assign(Balance.enemy, { contactDamage: 0 });
    for (const category of ['sparkRig', 'turret', 'beacon', 'blast']) Object.assign(Balance[category], { damage: 0, range: 0, damagePerWave: 0 });
    const g = new HeadlessContractSim({ contractId: 'e3-canyon-works', seed: 'crawler-lifecycle' });
    g.hero.applyStats(100000, 1); g.hero.heal(100000);
    for (const [x, z] of [[-12, -36], [-24, -20], [-28, 8]]) g.build.placeFree('sentry_beacon', { x, z }, 0);
    const stats = instrument(g, legacy), step = seconds => { for (let i = 0; i < Math.round(seconds * 30); i++) g.step(); };
    step(.2); g.waves.setWaveForTest(13); step(.4); Balance.waves.waveInterval = 999; g.waves.setWaveForTest(14); step(.2);
    const poses = [];
    for (const seconds of [0, 10, 10]) {
      step(seconds); const p = pose(g); poses.push(p);
      g.hero.group.position.x = p.parts.reduce((v, e) => v + e.x, 0) / p.parts.length - .5;
      g.hero.group.position.z = p.parts.reduce((v, e) => v + e.z, 0) / p.parts.length + 1.5;
      g.syncLightState();
    }
    let fallback, pinned;
    if (!legacy) {
      const kill = id => g.combat.killEnemy(g.enemies.all.find(e => e.isAlive && e.variantId === 'dynamo_crawler' && e.bossComponentId === id), g.timeAlive, 'hero');
      kill('tracks'); step(1 / 30); const a = pose(g); step(1); const b = pose(g);
      fallback = { ...g.crawler.diagnostics(), travel: Math.hypot(b.parts[0].x - a.parts[0].x, b.parts[0].z - a.parts[0].z), spanError: Math.abs(b.span - a.span) };
      kill('drain_mast'); step(1 / 30); const c = pose(g); step(1); const d = pose(g);
      pinned = { ...g.crawler.diagnostics(), travel: Math.hypot(d.parts[0].x - c.parts[0].x, d.parts[0].z - c.parts[0].z) };
    }
    const name = legacy ? 'headless-legacy' : 'headless';
    report.arms[name] = { poses, instrument: stats, fallback, pinned, errors: [] }; checkArm(report.arms[name], legacy);
    console.log(name, poses.map(p => p.span));
    await writeFile(output, JSON.stringify(report, null, 2) + '\n');
  }
  report.prepatchEvidence = JSON.parse(await readFile(new URL('./movement-drift.json', import.meta.url), 'utf8')).arms.actual.poses.map(p => p.span);
  report.passed = true;
  await writeFile(output, JSON.stringify(report, null, 2) + '\n');
} finally { await browser.close(); await vite?.close(); }
