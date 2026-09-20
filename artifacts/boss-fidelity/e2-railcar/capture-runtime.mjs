import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';

const stage = process.argv[2] ?? 'before';
const materialVariants = process.argv.includes('--fill-sweep') ? ['textured', 'fill55', 'fill90'] : process.argv.includes('--compare-materials') ? ['legacy', 'textured'] : null;
const compareMaterials = materialVariants !== null;
const output = new URL(`${stage}/`, import.meta.url);
await mkdir(output, { recursive: true });
const sha256 = data => createHash('sha256').update(data).digest('hex');
const asset = new URL('../../../assets/pilots/railcar-3d/railcar.glb', import.meta.url);
const assetHash = sha256(await readFile(asset));
const browser = await chromium.launch({ channel: 'chromium', headless: true });
try {
  for (const [name, viewport] of [['desktop', { width: 1280, height: 800 }], ['mobile', { width: 390, height: 844 }]]) {
    if (process.argv.includes('--desktop-only') && name !== 'desktop') continue;
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    const errors = [];
    let gameUrl;
    page.on('request', request => { if (new URL(request.url()).pathname === '/src/game/Game.ts') gameUrl = request.url(); });
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error' && !message.text().includes('WebSocket connection')) errors.push(message.text()); });
    await page.goto('http://127.0.0.1:5246/?debug&contract=e2-hill-mine&nolevel&nopause&nosteal&nowreck&tier=full&timescale=1&seed=railcar-fidelity-e2');
    await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 16, null, { timeout: 60000 });
    await page.getByTestId('contract-briefing-dismiss').click();
    await page.evaluate(async gameUrl => {
      if (!gameUrl) throw new Error('running Game module URL missing');
      const { Game } = await import(gameUrl);
      const original = Game.prototype.syncBaronRocketCart;
      Game.prototype.syncBaronRocketCart = function (...args) { window.__railcarProbeGame = this; Game.prototype.syncBaronRocketCart = original; return original.apply(this, args); };
      const h = window.__GR_TEST__;
      h.setManualSim(true);
      h.setBalance('waves.waveInterval', .35);
      h.setBalance('waves.trickleInterval', 999);
      h.setBalance('waves.pulseBase', 0);
      h.setBalance('waves.pulsePerWave', 0);
      h.setBalance('waves.aliveCap', 0);
      h.setBalance('enemy.contactDamage', 0);
      h.setBalance('sparkRig.range', 0);
      h.setBalance('sparkRig.damage', 0);
      h.setWave(11);
      h.advanceSim(.4);
      h.setBalance('waves.waveInterval', 999);
      for (const seconds of [2, 8, 5]) h.advanceSim(seconds);
    }, gameUrl);
    await page.waitForFunction(() => window.__railcarProbeGame && document.querySelector('canvas')?.dataset.railcar3dState === 'ready' && document.querySelector('canvas')?.dataset.railcar3dMounted === 'true');
    await page.evaluate(() => {
      const active = window.__GR_TEST__.enemyPositions().filter(e => e.eliteKind === 'railcar');
      window.__GR_TEST__.teleport(active.reduce((v,e)=>v+e.x,0)/active.length, active.reduce((v,e)=>v+e.z,0)/active.length + 8);
    });
    // Let claim and tutorial UI expire naturally; all sim movement is frozen.
    await page.waitForTimeout(31000);
    if (compareMaterials) await page.evaluate(() => {
      const pool = window.__railcarProbeGame.enemies;
      const update = pool.updateRailcar3d;
      pool.updateRailcar3d = function (...args) {
        update.apply(this, args);
        for (const [id, mesh] of this.railcar3dMeshes) {
          const m = mesh.material;
          const variant = window.__railcarMaterialVariant;
          const map = variant === 'legacy' ? null : m.map;
          if (m.emissiveMap !== map) { m.emissiveMap = map; m.needsUpdate = true; }
          if (variant === 'legacy') {
            const damaged = this.railcar3dDamaged.has(id);
            m.emissive.set(damaged ? { wheels: '#d95f32', boiler: '#5b8a8a', cabin: '#c4883a' }[id] : '#000000');
            m.emissiveIntensity = damaged ? (id === 'wheels' ? 2.4 : .9) : 0;
          } else if (variant === 'fill55' || variant === 'fill90') {
            m.emissiveIntensity = this.railcar3dDamaged.has(id) ? (variant === 'fill55' ? .65 : 1) : (variant === 'fill55' ? .55 : .9);
          }
        }
      };
    });
    const poses = {};
    const states = compareMaterials ? ['intact', 'wheels-broken', 'boiler-broken'] : ['intact', 'wheels-broken', 'boiler-broken', 'cabin-broken'];
    let previousState;
    for (const captureState of states.flatMap(state => compareMaterials ? materialVariants.map(variant => `${state}-${variant}`) : [state])) {
      const state = captureState.replace(/-(legacy|textured|fill55|fill90)$/, '');
      if (state !== 'intact' && state !== previousState) {
        assert.equal(await page.evaluate(state => {
          const h = window.__GR_TEST__;
          const snapshot = structuredClone(h.captureSuspend());
          for (const e of snapshot.enemies.active) if (e.eliteKind === 'railcar') e.hp = e.maxHp * (e.bossComponentId === state.split('-')[0] ? .49 : 1);
          return h.restoreSuspend(snapshot);
        }, state), true);
        await page.waitForFunction(state => document.querySelector('canvas')?.dataset.railcar3dState === 'ready' && JSON.parse(document.querySelector('canvas').dataset.railcar3dDamageStates)[state.split('-')[0]] === 'broken', state);
        await page.waitForTimeout(1200);
      }
      previousState = state;
      if (compareMaterials) {
        await page.evaluate(variant => { window.__railcarMaterialVariant = variant; }, captureState.slice(state.length + 1));
        await page.waitForTimeout(250);
      }
      const pose = await page.evaluate(() => {
        const g = window.__railcarProbeGame;
        const model = g.enemies.railcar3dModel;
        model.updateWorldMatrix(true, true);
        const meshes = [];
        const screen = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
        model.traverse(mesh => {
          if (!mesh.isMesh) return;
          const bounds = { min: [Infinity,Infinity,Infinity], max: [-Infinity,-Infinity,-Infinity] };
          const p = model.position.clone();
          for (let i=0; i<mesh.geometry.attributes.position.count; i++) {
            mesh.getVertexPosition(i,p).applyMatrix4(mesh.matrixWorld);
            p.toArray().forEach((v,j) => { bounds.min[j] = Math.min(bounds.min[j],v); bounds.max[j] = Math.max(bounds.max[j],v); });
            p.project(g.camera);
            const x = (p.x+1)*innerWidth/2, y = (1-p.y)*innerHeight/2;
            screen.minX = Math.min(screen.minX,x); screen.maxX = Math.max(screen.maxX,x);
            screen.minY = Math.min(screen.minY,y); screen.maxY = Math.max(screen.maxY,y);
          }
          meshes.push({ name: mesh.name, triangles: (mesh.geometry.index?.count ?? mesh.geometry.attributes.position.count)/3, bounds, morphs: mesh.morphTargetDictionary, influence: mesh.morphTargetInfluences, material: { name: mesh.material.name, emissive: mesh.material.emissive.getHexString(), intensity: mesh.material.emissiveIntensity, map: !!mesh.material.map, emissiveMap: !!mesh.material.emissiveMap, emissiveUsesBase: mesh.material.emissiveMap === mesh.material.map, metalness: mesh.material.metalness, roughness: mesh.material.roughness } });
        });
        return { model: { position: model.position.toArray(), rotation: model.rotation.toArray(), scale: model.scale.toArray(), visible: model.visible }, meshes, screen, components: window.__GR_TEST__.enemyPositions().filter(e=>e.eliteKind==='railcar'), bar: window.__THREE_GAME_DIAGNOSTICS__.readability.bossHpBar, renderer: window.__THREE_GAME_DIAGNOSTICS__.renderer };
      });
      const width = Math.min(viewport.width, Math.max(300, Math.ceil(pose.screen.maxX-pose.screen.minX)+100));
      const height = Math.max(220, Math.ceil(pose.screen.maxY-pose.screen.minY)+130);
      const rectangle = { left: Math.round(Math.max(0,Math.min(viewport.width-width,(pose.screen.minX+pose.screen.maxX-width)/2))), top: Math.round(Math.max(0,Math.min(viewport.height-height,(pose.screen.minY+pose.screen.maxY-height)/2))), width, height };
      const full = fileURLToPath(new URL(`${name}-${captureState}.png`, output));
      const crop = fileURLToPath(new URL(`${name}-${captureState}-props.png`, output));
      await page.screenshot({ path: full });
      await sharp(full).extract(rectangle).toFile(crop);
      assert.deepEqual(await sharp(crop).raw().toBuffer(), await sharp(full).extract(rectangle).raw().toBuffer());
      poses[captureState] = { ...pose, crop: rectangle, fullSha256: sha256(await readFile(full)), cropSha256: sha256(await readFile(crop)), cropPixelEquality: true };
    }
    await writeFile(new URL(`${name}.json`, output), JSON.stringify({ stage, viewport, assetHash, gameUrl, poses, errors }, null, 2));
    assert.deepEqual(errors, []);
    console.log(`${stage} ${name}: ${Object.keys(poses).length} poses and exact crops captured`);
    await page.close();
  }
  assert.equal(sha256(await readFile(asset)),assetHash,'GLB changed during capture');
} finally { await browser.close(); }
