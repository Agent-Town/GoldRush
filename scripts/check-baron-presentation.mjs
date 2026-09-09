// Run against scratch Vite: node scripts/check-baron-presentation.mjs http://127.0.0.1:5246
// Inspect the live meshes through a test-local wrapper; production needs no extra debug API.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const browser = await chromium.launch({ channel: 'chromium', headless: true });
try {
  for (const viewport of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    const errors = [];
    let gameUrl;
    page.on('request', request => { if (new URL(request.url()).pathname === '/src/game/Game.ts') gameUrl = request.url(); });
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error' && !message.text().includes('WebSocket connection')) errors.push(message.text()); });
    await page.goto(`${process.argv[2] ?? 'http://127.0.0.1:5246'}/?debug&contract=e1-baron&timescale=1&nolevel&nowaves&nosteal&nowreck&tier=full&seed=baron-props-detail`);
    await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10, null, { timeout: 60000 });
    const dismiss = page.getByTestId('contract-briefing-dismiss');
    if (await dismiss.isVisible().catch(() => false)) await dismiss.click();
    await page.evaluate(async gameUrl => {
      if (!gameUrl) throw new Error('running Game module URL missing');
      const { Game } = await import(gameUrl);
      const original = Game.prototype.syncBaronRocketCart;
      Game.prototype.syncBaronRocketCart = function (...args) {
        window.__baronProbe = this;
        Game.prototype.syncBaronRocketCart = original;
        return original.apply(this, args);
      };
      const h = window.__GR_TEST__;
      h.setManualSim(true);
      Object.assign(h.activeContract().twist.baron.rocketVolley, { damage: 0, cadenceSeconds: 2, telegraphSeconds: 0.5, airTime: 1.1, spreadRadius: 0.9 });
      h.setBalance('sparkRig.damage', 0); h.setBalance('sparkRig.range', 0);
      h.teleport(0, 12);
      h.spawnPack(1, 12, { eliteKind: 'baron', hpScale: 240, speedScale: 0.001, visualScale: 4, banner: true, wrecker: true, heroPursuitRange: 45 });
   }, gameUrl);
    await page.waitForFunction(() => window.__baronProbe && window.__THREE_GAME_DIAGNOSTICS__?.baronRocket.props.state === 'ready');
    const idle = await page.evaluate(() => {
      const g = window.__baronProbe;
      const launcher = g.baronProps3dModel.getObjectByName('BaronShoulderLauncher');
      const keg = g.baronProps3dModel.getObjectByName('BaronPowderKeg');
      window.__baronLaunches = [];
      const launch = g.combat.launchLob;
      g.combat.launchLob = function (origin, ...args) {
        window.__baronLaunches.push({ origin: origin.toArray(), boss: g.activeBaronEnemy().position.toArray(), target: args[0].toArray() });
        return launch.call(this, origin, ...args);
      };
      const tracer = g.baronVolleyVfx.tracer;
      g.baronVolleyVfx.tracer = function (...args) {
        tracer.apply(this, args);
        const at = this.tracerFrom[this.tracerAge.findIndex(age => age === 0)];
        window.__baronLaunches.at(-1).visualOrigin = at.toArray();
        window.__baronLaunches.at(-1).launcherPosition = launcher.getWorldPosition(at.clone()).toArray();
      };
      return { emission: launcher.material.emissiveIntensity, kegEmission: keg.material.emissiveIntensity,
        materialsSeparate: launcher.material !== keg.material,
        emissiveMapPreserved: !!launcher.material.emissiveMap && launcher.material.emissiveMap !== launcher.material.map,
        rocketUsesKegMaterial: g.baronVolleyVfx.rocketMaterial === keg.material };
    });
    assert.equal(idle.materialsSeparate, true, 'only launcher pulses');
    assert.equal(idle.emissiveMapPreserved, true, 'authored selective emission survives loading');
    assert.equal(idle.rocketUsesKegMaterial, true, 'flight material stays independent of launcher pulse');
    await page.evaluate(x => window.__GR_TEST__.teleport(x, 12), viewport.width > 400 ? 5 : 1.6);
    let tell;
    for (let i = 0; i < 150; i++) {
      tell = await page.evaluate(() => {
        window.__GR_TEST__.advanceSim(1 / 30);
        const g = window.__baronProbe;
        g.syncBaronRocketCart();
        return { active: window.__THREE_GAME_DIAGNOSTICS__.baronRocket.telegraphActive,
          launcher: g.baronShoulderLauncher.material.emissiveIntensity,
          keg: g.baronProps3dModel.getObjectByName('BaronPowderKeg').material.emissiveIntensity };
      });
      if (tell.active) break;
    }
    assert.equal(tell.active, true);
    assert.ok(tell.launcher >= idle.emission * 1.59, 'loaded fuse brightens during warning');
    assert.equal(tell.keg, idle.kegEmission, 'keg does not flash with the launcher');
    let launched;
    for (let i = 0; i < 60; i++) {
      launched = await page.evaluate(() => { window.__GR_TEST__.advanceSim(1 / 30); return window.__baronLaunches; });
      if (launched.length) break;
    }
    assert.equal(launched.length, 3, 'volley size preserved');
    for (const shot of launched) {
      assert.deepEqual(shot.origin, shot.boss, 'combat origin remains the planar boss position');
      assert.ok(Math.hypot(...shot.visualOrigin.map((v, i) => v - shot.launcherPosition[i])) < 1.1, 'VFX leaves visible launcher');
      assert.ok(shot.visualOrigin[1] - shot.origin[1] > 2, 'VFX is shoulder-height, not ground-center');
      const forwardDot = [0, 2].reduce((sum, i) => sum + (shot.visualOrigin[i] - shot.launcherPosition[i]) * (shot.target[i] - shot.launcherPosition[i]), 0);
      assert.ok(forwardDot > 0, 'launcher noses face the volley target rather than away');
    }
    const settled = await page.evaluate(() => {
      const g = window.__baronProbe;
      g.enemies.baronSpriteAnimator.update(0.071, 'walk', 's', false, 3, 3);
      g.syncBaronRocketCart();
      const baron = g.activeBaronEnemy();
      return { emission: g.baronShoulderLauncher.material.emissiveIntensity, bobOffset: g.enemies.baronSpriteBobOffset,
        bobDifference: g.baronRocketCartGroup.position.y - g.enemies.renderPositionOf(baron).y - baron.visualScale * 0.42 - g.enemies.baronSpriteBobOffset,
        rockets: g.baronVolleyVfx.diagnostics().rockets };
    });
    assert.equal(settled.emission, idle.emission, 'warning resets after launch');
    assert.ok(settled.bobOffset > 0.0001, 'shared motion check samples a nonzero stride');
    assert.ok(Math.abs(settled.bobDifference) < 1e-9, 'props share existing sprite bob');
    assert.ok(settled.rockets.active <= settled.rockets.capacity);
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ viewport, idle, tell, launched, settled, errors }));
    await page.close();
  }
} finally { await browser.close(); }
