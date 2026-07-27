import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const root = process.cwd();
const baseUrl = process.env.GR_BOSS_BENCH_URL ?? 'http://127.0.0.1:5237';
const samples = 180;
const bosses = {
  dredgeQueen: {
    query: '/?debug&profile&epoch=epoch-5-deepwater&contract=e5-deepwater-claim&nolevel&nopause&seed=detail-duel-boot',
    contract: 'e5-deepwater-claim',
    module: 'DredgeQueenBossSystem.ts',
    substitutions: [
      ['dredge-queen.glb', 'dredge-queen-detail-sol.glb'],
      ['DREDGE_QUEEN_3D_TRIANGLES = 11832', 'DREDGE_QUEEN_3D_TRIANGLES = 42976'],
    ],
    output: 'assets/pilots/dredge-queen-3d/renders/dredge-queen-detail-sol-performance.json',
    prepare: () => {
      const test = window.__GR_TEST__;
      test.setManualSim(true);
      test.setBalance('dredgeQueen.approachSeconds', 0.2);
      test.setBalance('enemy.contactDamage', 0);
      test.advanceSim(11.4);
    },
    ready: () => document.querySelector('canvas')?.dataset.dredgeQueen3dMounted === 'true',
    triangles: { original: 11_832, detailSol: 42_976 },
  },
  salvageClaw: {
    query: '/?debug&profile&epoch=epoch-8-orbital&contract=e8-mare-claim&nowaves&nolevel&nopause&seed=detail-duel-boot',
    contract: 'e8-mare-claim',
    module: 'SalvageClawBossSystem.ts',
    substitutions: [
      ['salvage-claw.glb', 'salvage-claw-detail-sol.glb'],
      ['MODEL_TRIANGLES = 10164', 'MODEL_TRIANGLES = 34540'],
    ],
    output: 'assets/pilots/salvage-claw-3d/renders/salvage-claw-detail-sol-performance.json',
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
    triangles: { original: 10_164, detailSol: 34_540 },
  },
};

async function measure(browser, boss, detail) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  if (detail) {
    await page.route(`**/src/systems/${boss.module}*`, async (route) => {
      const response = await route.fetch();
      let body = await response.text();
      for (const [from, to] of boss.substitutions) {
        if (!body.includes(from)) throw new Error(`missing boot-rig substitution: ${from}`);
        body = body.replace(from, to);
      }
      await route.fulfill({ response, body });
    });
  }
  await page.goto(`${baseUrl}${boss.query}`);
  await page.waitForFunction((contract) =>
    window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === contract, boss.contract, { timeout: 30_000 });
  const dismiss = page.getByTestId('contract-briefing-dismiss');
  if (await dismiss.isVisible()) await dismiss.evaluate((button) => button.click());
  await page.evaluate(boss.prepare);
  await page.waitForFunction(boss.ready, null, { timeout: 30_000 });

  const result = await page.evaluate((sampleCount) => new Promise((resolve) => {
    const rows = [];
    let previous = performance.now();
    const tick = (now) => {
      const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
      rows.push({ frameMs: now - previous, ...diagnostics.renderer });
      previous = now;
      if (rows.length < sampleCount) return requestAnimationFrame(tick);
      const p95 = (values) => [...values].sort((a, b) => a - b)[Math.floor((values.length - 1) * 0.95)];
      resolve({
        frameMsP95: Number(p95(rows.map((row) => row.frameMs)).toFixed(2)),
        callsP95: p95(rows.map((row) => row.calls)),
        trianglesP95: p95(rows.map((row) => row.triangles)),
        geometriesMax: Math.max(...rows.map((row) => row.geometries)),
        texturesMax: Math.max(...rows.map((row) => row.textures)),
        camera: diagnostics.camera,
      });
    };
    requestAnimationFrame(tick);
  }), samples);
  await context.close();
  if (errors.length) throw new Error(errors.join('\n'));
  return result;
}

const browser = await chromium.launch({ headless: true });
try {
  for (const [name, boss] of Object.entries(bosses)) {
    const original = await measure(browser, boss, false);
    const detailSol = await measure(browser, boss, true);
    const evidence = {
      harness: 'Gold Rush game boot rig, production contract scene and gameplay camera, renderer.info sampled after the boss model mounted',
      route: boss.query,
      samples,
      viewport: [1280, 800],
      assetTriangles: boss.triangles,
      original,
      detailSol,
      interpretation: 'Calls and GPU resource counts are the stable comparison. Headless frame p95 is backend- and scheduler-sensitive and is not a desktop or mobile guarantee.',
    };
    await writeFile(path.join(root, boss.output), `${JSON.stringify(evidence, null, 2)}\n`);
    console.log(`${name}: ${JSON.stringify(evidence)}`);
  }
} finally {
  await browser.close();
}
