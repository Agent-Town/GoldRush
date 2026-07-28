import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';

const baseUrl = process.env.GR_BOSS_BENCH_URL ?? 'http://127.0.0.1:5243';
const samples = 60;
const bosses = {
  claw: {
    query: '/?debug&profile&epoch=epoch-8-orbital&contract=e8-mare-claim&nowaves&nolevel&nopause&seed=s1195',
    contract: 'e8-mare-claim',
    modelName: 'SalvageClaw3d',
    module: 'SalvageClawBossSystem.ts',
    substitutions: [
      ['salvage-claw-detail-opus5.glb', 'salvage-claw-detail-sol.glb'],
      ['MODEL_TRIANGLES = 30100', 'MODEL_TRIANGLES = 34540'],
    ],
    assetTriangles: { shipped: 30_100, detail: 34_540 },
    prepare: () => {
      const test = window.__GR_TEST__;
      test.setManualSim(true);
      test.setBalance('salvageClaw.arriveWave', 4);
      test.setBalance('salvageClaw.descentSeconds', 0.2);
      test.setBalance('enemy.contactDamage', 0);
      test.startWaveForTest(4);
      test.advanceSim(0.2);
    },
    ready: () => document.querySelector('canvas')?.dataset.salvageClaw3dMounted === 'true',
  },
  queen: {
    query: '/?debug&profile&epoch=epoch-5-deepwater&contract=e5-deepwater-claim&nolevel&nopause&seed=s1195',
    contract: 'e5-deepwater-claim',
    modelName: 'DredgeQueen3d',
    module: 'DredgeQueenBossSystem.ts',
    substitutions: [
      ['dredge-queen-detail-opus5.glb', 'dredge-queen-detail-sol.glb'],
      ['DREDGE_QUEEN_3D_TRIANGLES = 33124', 'DREDGE_QUEEN_3D_TRIANGLES = 42976'],
    ],
    assetTriangles: { shipped: 33_124, detail: 42_976 },
    prepare: () => {
      const test = window.__GR_TEST__;
      test.setManualSim(true);
      test.setBalance('dredgeQueen.approachSeconds', 0.2);
      test.setBalance('enemy.contactDamage', 0);
      test.advanceSim(11.4);
    },
    ready: () => document.querySelector('canvas')?.dataset.dredgeQueen3dMounted === 'true',
  },
};

const sceneProbe = `
        __s1195SceneProbe: (modelName) => {
          this.scene.updateMatrixWorld(true);
          const roots = [];
          this.scene.traverse((node) => {
            if (node.name === modelName) roots.push(node);
          });
          const meshes = new Set();
          let triangles = 0;
          for (const root of roots) root.traverse((node) => {
            if (!node.isMesh || meshes.has(node)) return;
            meshes.add(node);
            triangles += Math.floor((node.geometry.index?.count ?? node.geometry.getAttribute('position')?.count ?? 0) / 3);
          });
          const root = roots[0];
          const sun = this.scene.getObjectByName('LedgerLowSun');
          const camera = sun?.shadow?.camera;
          const box = root ? new THREE.Box3().setFromObject(root) : null;
          this.camera.updateMatrixWorld(true);
          this.camera.updateProjectionMatrix();
          const mainCameraIntersects = box ? new THREE.Frustum().setFromProjectionMatrix(
            new THREE.Matrix4().multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse),
          ).intersectsBox(box) : false;
          let shadow = null;
          if (box && camera) {
            camera.updateMatrixWorld(true);
            camera.updateProjectionMatrix();
            const frustum = new THREE.Frustum().setFromProjectionMatrix(
              new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse),
            );
            const corners = [];
            for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) {
              for (const z of [box.min.z, box.max.z]) corners.push(new THREE.Vector3(x, y, z).applyMatrix4(camera.matrixWorldInverse));
            }
            shadow = {
              intersects: frustum.intersectsBox(box),
              camera: {
                near: camera.near, far: camera.far, left: camera.left, right: camera.right,
                top: camera.top, bottom: camera.bottom,
              },
              cameraSpaceBox: {
                min: {
                  x: Math.min(...corners.map((point) => point.x)),
                  y: Math.min(...corners.map((point) => point.y)),
                  z: Math.min(...corners.map((point) => point.z)),
                },
                max: {
                  x: Math.max(...corners.map((point) => point.x)),
                  y: Math.max(...corners.map((point) => point.y)),
                  z: Math.max(...corners.map((point) => point.z)),
                },
              },
            };
          }
          return {
            namedObjects: roots.length,
            distinctMeshes: meshes.size,
            triangles,
            worldPosition: root ? root.getWorldPosition(new THREE.Vector3()).toArray() : null,
            worldBox: box ? { min: box.min.toArray(), max: box.max.toArray() } : null,
            mainCameraIntersects,
            rendererShadowEnabled: this.renderer.shadowMap.enabled,
            sunCastShadow: Boolean(sun?.castShadow),
            shadow,
          };
        },
`;

function uptime() {
  return execFileSync('uptime', { encoding: 'utf8' }).trim();
}

async function measure(browser, boss, detail, shadowPass) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/src/game/Game.ts*', async (route) => {
    const response = await route.fetch();
    const body = await response.text();
    const marker = 'window.__GR_TEST__ = {';
    if (!body.includes(marker)) throw new Error(`missing Game probe marker: ${marker}`);
    await route.fulfill({ response, body: body.replace(marker, `${marker}${sceneProbe}`) });
  });
  if (detail) {
    await page.route(`**/src/systems/${boss.module}*`, async (route) => {
      const response = await route.fetch();
      let body = await response.text();
      for (const [from, to] of boss.substitutions) {
        if (!body.includes(from)) throw new Error(`missing detail substitution: ${from}`);
        body = body.replace(from, to);
      }
      await route.fulfill({ response, body });
    });
  }
  await page.goto(`${baseUrl}${boss.query}`);
  await page.waitForFunction(
    (contract) => window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === contract,
    boss.contract,
    { timeout: 30_000 },
  );
  const dismiss = page.getByTestId('contract-briefing-dismiss');
  if (await dismiss.isVisible()) await dismiss.evaluate((button) => button.click());
  await page.evaluate(boss.prepare);
  await page.waitForFunction(boss.ready, null, { timeout: 30_000 });
  await page.evaluate((enabled) => {
    window.__GR_TEST__.setBalance('world.shadowsQuality', enabled ? 'soft' : 'blob');
  }, shadowPass);
  await page.evaluate(() => new Promise((resolve) => {
    let frames = 0;
    const tick = () => (++frames === 8 ? resolve() : requestAnimationFrame(tick));
    requestAnimationFrame(tick);
  }));

  const uptimeBefore = uptime();
  const result = await page.evaluate(({ sampleCount, modelName }) => new Promise((resolve) => {
    const rows = [];
    const tick = () => {
      rows.push({ ...window.__THREE_GAME_DIAGNOSTICS__.renderer });
      if (rows.length < sampleCount) return requestAnimationFrame(tick);
      const p95 = (values) => [...values].sort((a, b) => a - b)[Math.floor((values.length - 1) * 0.95)];
      resolve({
        calls: p95(rows.map((row) => row.calls)),
        triangles: p95(rows.map((row) => row.triangles)),
        sceneGraph: window.__GR_TEST__.__s1195SceneProbe(modelName),
      });
    };
    requestAnimationFrame(tick);
  }), { sampleCount: samples, modelName: boss.modelName });
  const uptimeAfter = uptime();
  await context.close();
  if (errors.length) throw new Error(errors.join('\n'));
  return { ...result, uptimeBefore, uptimeAfter };
}

const browser = await chromium.launch({ headless: true });
const evidence = { baseUrl, samples, viewport: [1280, 800], bosses: {} };
try {
  for (const [name, boss] of Object.entries(bosses)) {
    const arms = {};
    for (const shadowPass of [true, false]) {
      const key = shadowPass ? 'on' : 'off';
      const shipped = await measure(browser, boss, false, shadowPass);
      const detail = await measure(browser, boss, true, shadowPass);
      const assetDelta = boss.assetTriangles.detail - boss.assetTriangles.shipped;
      const sceneDelta = detail.triangles - shipped.triangles;
      arms[key] = {
        shadowPass,
        assetTriangles: boss.assetTriangles,
        shipped,
        detail,
        assetDelta,
        sceneDelta,
        callsDelta: detail.calls - shipped.calls,
        ratio: sceneDelta / assetDelta,
      };
    }
    evidence.bosses[name] = arms;
  }
  console.log(JSON.stringify(evidence, null, 2));
} finally {
  await browser.close();
}
