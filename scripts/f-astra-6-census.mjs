import { chromium, devices } from 'playwright';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { observeThree, sample, summarize } from './perf-survey/browser.mjs';

const { values } = parseArgs({ options: {
  stage: { type: 'string', default: 'before' },
  maps: { type: 'string', default: 'the-claim,town,e1-dry-gulch,e1-twin-banks' },
  rounds: { type: 'string', default: '4' },
  width: { type: 'string', default: '1280' },
  duration: { type: 'string', default: '3000' },
  baseline: { type: 'boolean', default: false },
  paired: { type: 'boolean', default: false },
  toggle: { type: 'boolean', default: false },
  freeze: { type: 'boolean', default: false },
} });
const out = 'artifacts/sol/open-findings';
const base = process.env.GR_CAPTURE_BASE_URL ?? 'http://127.0.0.1:5301';

// Actual buffer submissions, including shadow passes. The observer wraps only this browser's
// renderer; it never edits an application module or changes the scene's composition.
export async function census(page) {
  return page.evaluate(() => {
    const { renderer, scene, camera } = globalThis.__PERF_SURVEY__;
    const rows = new Map();
    const original = renderer.renderBufferDirect;
    scene.updateMatrixWorld(true);
    const clip = camera.projectionMatrix.clone().multiply(camera.matrixWorldInverse);
    const outside = (geometry, matrix) => {
      geometry.computeBoundingBox();
      const box = geometry.boundingBox;
      const points = [];
      const m = clip.clone().multiply(matrix).elements;
      for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) {
        points.push([m[0]*x+m[4]*y+m[8]*z+m[12], m[1]*x+m[5]*y+m[9]*z+m[13], m[2]*x+m[6]*y+m[10]*z+m[14], m[3]*x+m[7]*y+m[11]*z+m[15]]);
      }
      return [0,1,2].some(axis => [-1,1].some(sign => points.every(p => sign*p[axis] > p[3])));
    };
    const inventory = [];
    scene.traverseVisible(object => {
      if (!object.geometry || !object.material) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      const ancestors = [];
      for (let p = object; p; p = p.parent) if (p.name) ancestors.push(p.name);
      const row = { id: object.id, label: object.name || object.parent?.name || object.type, ancestors,
        kind: object.isInstancedMesh ? 'instanced' : object.type, count: object.count ?? 1,
        frustumCulled: object.frustumCulled, geometry: object.geometry.id,
        materialIds: materials.map(m => m.id), transparent: materials.some(m => m.transparent),
        alphaTest: materials.some(m => m.alphaTest > 0), renderOrder: object.renderOrder,
        opaqueProps: object.userData.opaqueProps ?? null,
        opaquePropsVisible: object.userData.opaquePropsVisible ?? null,
        offCameraInstances: 0, trianglesEach: (object.geometry.index?.count ?? object.geometry.attributes.position?.count ?? 6)/3,
      };
      if (object.isInstancedMesh) {
        const matrix = object.matrix.clone();
        for (let i = 0; i < object.count; i++) {
          object.getMatrixAt(i, matrix);
          if (outside(object.geometry, matrix.clone().premultiply(object.matrixWorld))) row.offCameraInstances++;
        }
      }
      inventory.push(row);
    });
    renderer.renderBufferDirect = function(cam, sc, geometry, material, object, group) {
      const calls = this.info.render.calls, triangles = this.info.render.triangles;
      const result = original.call(this, cam, sc, geometry, material, object, group);
      const key = `${object.id}:${material.id}:${cam === camera ? 'color' : 'shadow'}`;
      const row = rows.get(key) ?? { id: object.id, label: object.name || object.parent?.name || object.type,
        material: material.name || material.type, pass: cam === camera ? 'color' : 'shadow', calls: 0, triangles: 0 };
      row.calls += this.info.render.calls - calls;
      row.triangles += this.info.render.triangles - triangles;
      rows.set(key, row);
      return result;
    };
    try {
      renderer.info.reset();
      renderer.render(scene, camera);
      return { total: { ...renderer.info.render }, inventory, draws: [...rows.values()].filter(r => r.calls),
        camera: { position: camera.position.toArray(), zoom: camera.zoom },
        dataset: { ...renderer.domElement.dataset } };
    } finally { renderer.renderBufferDirect = original; }
  });
}

async function run() {
  await mkdir(out, { recursive: true });
  if (values.freeze) {
    await mkdir(`${out}/_raw`, { recursive: true });
    for (const [path, name] of [['world/Scatter', 'Scatter'], ['town/TownTavernPilot', 'TownTavernPilot']]) {
      const response = await fetch(`${base}/src/${path}.ts`);
      if (!response.ok) throw new Error(`Cannot freeze ${path}: ${response.status}`);
      const body = await response.text();
      if (body.includes('OpaquePropBatchPilot')) throw new Error('Freeze must run against the pre-edit base checkout');
      await writeFile(`${out}/_raw/${name}-before.js`, body);
    }
    return;
  }
  const browser = await chromium.launch({ channel: 'chromium' });
  const report = { stage: values.stage, width: Number(values.width), device: Number(values.width) === 390 ? 'Pixel 5' : 'Desktop Chrome', rows: [] };
  try {
    for (let round = 1; round <= (values.toggle ? 1 : Number(values.rounds)); round++) for (const map of values.maps.split(',')) for (const baseline of values.paired && !values.toggle ? (round % 2 ? [true, false] : [false, true]) : [values.baseline]) {
      const arm = baseline ? 'before' : 'after';
      const context = await browser.newContext({ ...(report.width === 390 ? devices['Pixel 5'] : devices['Desktop Chrome']), viewport: { width: report.width, height: report.width === 390 ? 844 : 800 } });
      await context.addInitScript(observeThree);
      if (map === 'town') await context.addInitScript(() => history.replaceState({ goldRushScene: 'town' }, '', location.href));
      const page = await context.newPage();
      if (baseline) {
        for (const [path, file] of [['world/Scatter', 'Scatter'], ['town/TownTavernPilot', 'TownTavernPilot']]) {
          const body = await readFile(`${out}/_raw/${file}-before.js`, 'utf8');
          await page.route(new RegExp(`/src/${path}\\.ts(?:\\?|$)`), async route => {
            const current = await (await route.fetch()).text();
            const imports = new Map([...current.matchAll(/(\/node_modules\/\.vite\/deps\/[^"?]+)\?v=[^"\s]+/g)].map(match => [match[1], match[0]]));
            const normalized = body.replace(/(\/node_modules\/\.vite\/deps\/[^"?]+)\?v=[^"\s]+/g, (_url, name) => imports.get(name) ?? name);
            await route.fulfill({ body: normalized, contentType: 'application/javascript' });
          });
        }
      }
      const errors = { console: [], page: [] };
      page.on('console', m => { if (m.type() === 'error') errors.console.push(m.text()); });
      page.on('pageerror', e => errors.page.push(e.message));
      try {
        await page.goto(`${base}/?debug&tier=full&seed=e1-perf-${map}&nowaves&nolevel&nopause&nokill${map === 'town' ? '' : `&contract=${map}`}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForFunction(() => globalThis.__PERF_SURVEY__?.scene, null, { timeout: 60000 });
        await page.getByTestId('contract-briefing-dismiss').click({ timeout: 1500 }).catch(() => {});
        await page.waitForFunction(() => !Object.entries(document.querySelector('#game-canvas').dataset).some(([k,v]) => k.endsWith('State') && v === 'loading'), null, { timeout: 60000 });
        await page.waitForTimeout(2000);
        if (values.toggle) {
          // Same boot, same cameras/materials/assets. ABBA order separates treatment from
          // the host's large between-boot scheduling swings. The frozen-source arm above
          // remains the independent structural control.
          for (let trial = 1; trial <= Number(values.rounds); trial++) for (const batched of trial % 2 ? [false, true] : [true, false]) {
            await page.evaluate(enabled => {
              const scene = globalThis.__PERF_SURVEY__.scene;
              scene.traverse(object => {
                if (!object.userData.opaqueSourceIds) return;
                object.visible = enabled;
                for (const id of object.userData.opaqueSourceIds) scene.getObjectById(id).visible = !enabled;
              });
            }, batched);
            await page.waitForTimeout(500);
            const frames = await sample(page, Number(values.duration));
            const row = { map, round: trial, arm: batched ? 'after' : 'before', errors: structuredClone(errors), metrics: summarize(frames), frames: frames.rows, census: await census(page) };
            report.rows.push(row);
            console.log(`${values.stage}/${row.arm} ${report.width} ${map} r${trial}: ${row.census.total.calls} calls ${row.census.total.triangles} tris, p95 ${row.metrics.frameMs.p95.toFixed(2)}ms; errors ${errors.console.length}/${errors.page.length}`);
            await writeFile(`${out}/census-${values.stage}-${report.width}.json`, JSON.stringify(report, null, 2) + '\n');
          }
          continue;
        }
        const frames = await sample(page, Number(values.duration));
        const row = { map, round, arm, errors, metrics: summarize(frames), frames: frames.rows, census: await census(page) };
        if (baseline && row.census.inventory.some(item => item.label.startsWith('DetailScatter.opaque.') || item.label.startsWith('TownOpaqueProps:'))) throw new Error('Control boot did not use the frozen pre-edit modules');
        report.rows.push(row);
        if (round === 1) await page.locator('#game-canvas').screenshot({ path: `${out}/_raw/${values.stage}-${arm}-${report.width}-${map}.png` });
        console.log(`${values.stage}/${arm} ${report.width} ${map} r${round}: ${row.census.total.calls} calls ${row.census.total.triangles} tris, p95 ${row.metrics.frameMs.p95.toFixed(2)}ms; errors ${errors.console.length}/${errors.page.length}`);
      } catch (error) {
        report.rows.push({ map, round, arm, errors, failure: String(error) });
        console.error(map, String(error));
      } finally {
        await context.close();
        await writeFile(`${out}/census-${values.stage}-${report.width}.json`, JSON.stringify(report, null, 2) + '\n');
      }
    }
  } finally { await browser.close(); }
  if (report.rows.some(r => r.failure || r.errors.console.length || r.errors.page.length)) process.exitCode = 1;
}
if (process.argv[1]?.endsWith('/f-astra-6-census.mjs')) await run();
