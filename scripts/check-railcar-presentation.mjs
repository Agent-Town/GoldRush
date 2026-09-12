// Run against scratch Vite: node scripts/check-railcar-presentation.mjs http://127.0.0.1:5246
// Uses test-local access to live meshes; production diagnostics stay unchanged.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'chromium', headless: true });
try {
  for (const viewport of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
    for (const contract of ['e2-hill-mine', 'e2-trestle', 'e2-incline']) {
      const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
      const errors = [];
      let gameUrl;
      page.on('request', request => { if (new URL(request.url()).pathname === '/src/game/Game.ts') gameUrl = request.url(); });
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => { if (message.type() === 'error' && !message.text().includes('WebSocket connection')) errors.push(message.text()); });
      await page.goto(`${process.argv[2] ?? 'http://127.0.0.1:5246'}/?debug&contract=${contract}&nolevel&nopause&nosteal&nowreck&tier=full&timescale=1&seed=railcar-presentation`);
      await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 16, null, { timeout: 60000 });
      await page.getByTestId('contract-briefing-dismiss').click();
      await page.evaluate(async gameUrl => {
        if (!gameUrl) throw new Error('running Game module URL missing');
        const { Game } = await import(gameUrl);
        const original = Game.prototype.syncBaronRocketCart;
        Game.prototype.syncBaronRocketCart = function (...args) {
          window.__railcarProbe = this;
          Game.prototype.syncBaronRocketCart = original;
          return original.apply(this, args);
        };
        const h = window.__GR_TEST__;
        h.setManualSim(true);
        for (const [key, value] of Object.entries({ 'waves.waveInterval': .35, 'waves.trickleInterval': 999, 'waves.pulseBase': 0, 'waves.pulsePerWave': 0, 'waves.aliveCap': 0, 'enemy.contactDamage': 0, 'sparkRig.range': 0, 'sparkRig.damage': 0 })) h.setBalance(key, value);
        h.setWave(11); h.advanceSim(.4); h.setBalance('waves.waveInterval', 999);
        for (const seconds of [2, 8, 12]) h.advanceSim(seconds);
      }, gameUrl);
      await page.waitForFunction(() => window.__railcarProbe && document.querySelector('canvas')?.dataset.railcar3dState === 'ready');
      const poses = {};
      for (const direction of ['outbound', 'return']) {
        if (direction === 'return') {
          const reversal = await page.evaluate(() => {
            const h = window.__GR_TEST__, pool = window.__railcarProbe.enemies;
            h.advanceSim(26);
            const outward = h.enemyPositions().find(e => e.eliteKind === 'railcar');
            let reversed = false;
            for (let i = 0; i < 240; i++) {
              h.advanceSim(1 / 60);
              const current = h.enemyPositions().find(e => e.eliteKind === 'railcar');
              if (outward.vx * current.vx + outward.vz * current.vz < 0) { reversed = true; break; }
            }
            const axes = [];
            for (const alpha of [0, .25, .5, .75, 1]) {
              pool.applyRenderInterpolation(alpha);
              pool.railcar3dModel.updateWorldMatrix(true, false);
              axes.push(pool.railcar3dModel.position.clone().set(1, 0, 0).transformDirection(pool.railcar3dModel.matrixWorld).toArray());
            }
            h.advanceSim(4);
            return { reversed, axes };
          });
          assert.equal(reversal.reversed, true, 'fixture crosses the actual route reversal');
          const inward = contract === 'e2-hill-mine' ? [1, 0, 0] : [0, 0, 1];
          for (const axis of reversal.axes) assert.ok(axis.reduce((sum, v, i) => sum + v * inward[i], 0) > .99, 'chassis remains rail-aligned throughout reversal interpolation');
        }
        await page.waitForTimeout(100);
        const pose = await page.evaluate(() => {
          const g = window.__railcarProbe, h = window.__GR_TEST__;
          const model = g.enemies.railcar3dModel;
          model.updateWorldMatrix(true, true);
          const enemies = h.enemyPositions().filter(e => e.eliteKind === 'railcar');
          const cabinAxis = model.position.clone().set(1, 0, 0).transformDirection(model.matrixWorld);
          const speed = Math.hypot(enemies[0].vx, enemies[0].vz);
          const components = enemies.map(enemy => {
            const mesh = g.enemies.railcar3dMeshes.get(enemy.bossComponentId);
            const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
            const point = model.position.clone();
            for (let i = 0; i < mesh.geometry.attributes.position.count; i++) {
              mesh.getVertexPosition(i, point).applyMatrix4(mesh.matrixWorld);
              point.toArray().forEach((v, j) => { min[j] = Math.min(min[j], v); max[j] = Math.max(max[j], v); });
            }
            const center = min.map((v, j) => (v + max[j]) / 2);
            return { id: enemy.bossComponentId, position: [enemy.x, enemy.y, enemy.z], offset: [enemy.x - model.position.x, enemy.z - model.position.z], hitRadius: enemy.hitRadius,
              proxyDistance: Math.hypot(enemy.x - center[0], enemy.z - center[2]), maxY: max[1], velocity: [enemy.vx, enemy.vz], presentation: enemy.presentation,
              texturedFill: !!mesh.material.map && mesh.material.emissiveMap === mesh.material.map, fillIntensity: mesh.material.emissiveIntensity };
          });
          const observed = { modelVisible: model.visible, cabinAxis: cabinAxis.toArray(), noseDotVelocity: -(cabinAxis.x * enemies[0].vx + cabinAxis.z * enemies[0].vz) / speed,
            modelPosition: model.position.toArray(), components, barY: g.enemies.bossHpGroup.position.y, renderer: window.__THREE_GAME_DIAGNOSTICS__.renderer };
          // Observe the game's actual draw state before calling the presentation
          // method directly, otherwise the probe could repair a broken update loop.
          const before = JSON.stringify(h.captureSuspend().enemies);
          for (let i = 0; i < 5; i++) g.enemies.updateRailcar3d();
          return { ...observed, simUnchanged: before === JSON.stringify(h.captureSuspend().enemies) };
        });
        assert.equal(pose.simUnchanged, true, 'presentation updates preserve saved enemy state');
        assert.equal(pose.modelVisible, true);
        assert.equal(pose.components.length, 3);
        const inward = contract === 'e2-hill-mine' ? [1, 0, 0] : [0, 0, 1];
        assert.ok(pose.cabinAxis.reduce((sum, v, i) => sum + v * inward[i], 0) > .99, `${contract} keeps cabin at the inward end on ${direction}`);
        assert.ok(direction === 'outbound' ? pose.noseDotVelocity < -.99 : pose.noseDotVelocity > .99, 'stock backs out cab-first and returns cowcatcher-first without spinning');
        for (const component of pose.components) {
          assert.ok(component.proxyDistance < component.hitRadius, `${contract} ${direction}: visible ${component.id} center remains within its damage proxy`);
          assert.equal(component.presentation.source, 'glb');
          assert.equal(component.presentation.morphInfluence, 0);
          assert.equal(component.texturedFill, true, 'shadow fill reuses the authored plate texture');
          assert.ok(component.fillIntensity > 0 && component.fillIntensity <= 1, 'mapped intact fill stays within the authored texture range');
          assert.ok(pose.barY > component.maxY + .25, 'boss bar clears the authored geometry');
          if (direction === 'return') {
            const before = poses.outbound.components.find(c => c.id === component.id);
            component.offset.forEach((value, i) => assert.ok(Math.abs(value - before.offset[i]) < 1e-7, 'component route offsets are unchanged on return'));
          }
        }
        poses[direction] = pose;
      }
      const damageMaterials = {};
      if (contract === 'e2-hill-mine') for (const id of ['wheels', 'boiler', 'cabin']) {
        assert.equal(await page.evaluate(id => {
          const h = window.__GR_TEST__, snapshot = structuredClone(h.captureSuspend());
          for (const enemy of snapshot.enemies.active) if (enemy.eliteKind === 'railcar') enemy.hp = enemy.maxHp * (enemy.bossComponentId === id ? .49 : 1);
          return h.restoreSuspend(snapshot);
        }, id), true);
        await page.waitForFunction(id => document.querySelector('canvas')?.dataset.railcar3dState === 'ready' && window.__railcarProbe.enemies.railcar3dDamaged.has(id), id);
        const materials = await page.evaluate(() => {
          const meshes = [...window.__railcarProbe.enemies.railcar3dMeshes];
          return { mapCount: new Set(meshes.map(([,m])=>m.material.map)).size, materialCount: new Set(meshes.map(([,m])=>m.material)).size,
            components: meshes.map(([id,m])=>({ id, texturedFill: !!m.material.map && m.material.emissiveMap === m.material.map, intensity: m.material.emissiveIntensity, morph: m.morphTargetInfluences[0] })) };
        });
        assert.equal(materials.mapCount, 1, 'all fills share the existing single atlas');
        assert.equal(materials.materialCount, 3, 'damage accents remain component-local');
        for (const component of materials.components) {
          assert.equal(component.texturedFill, true, 'damage keeps the authored metal texture');
          assert.equal(component.morph, component.id === id ? 1 : 0);
          assert.ok(component.intensity > 0 && component.intensity <= 1, 'mapped damage fill cannot exceed the authored texture range');
          if (component.id === id) assert.ok(component.intensity > poses.return.components.find(c=>c.id===id).fillIntensity);
        }
        damageMaterials[id] = materials;
      }
      assert.deepEqual(errors, []);
      console.log(JSON.stringify({ viewport, contract, poses, damageMaterials, errors }));
      await page.close();
    }
  }
} finally { await browser.close(); }
