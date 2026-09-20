// Optional diagnostic after the unchanged serial gate reproduces the cold +1.
// This instrumented run identifies resources; it is not an acceptance test.
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

const base = process.env.GR_CAPTURE_BASE_URL ?? 'http://127.0.0.1:5246';
const output = resolve(process.argv[2] ?? 'artifacts/boss-fidelity/e3-crawler/cold-texture-census');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium', headless: true });
const report = { base, instrumented: true, diagnosticSimStep: process.env.GR_CENSUS_STEP === '1', errors: [], crawlerRequests: [], samples: [] };
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  let gameUrl;
  const responseReads = [];
  page.on('request', request => {
    if (new URL(request.url()).pathname === '/src/game/Game.ts') gameUrl = request.url();
    if (/crawler\.glb/.test(request.url())) report.crawlerRequests.push(request.url());
  });
  page.on('response', response => {
    if (new URL(response.url()).pathname !== '/src/game/Game.ts') return;
    responseReads.push(response.body().then(bytes => {
      report.servedGame = { url: response.url(), sha256: createHash('sha256').update(bytes).digest('hex') };
    }).catch(error => report.errors.push(`Source receipt: ${error.message}`)));
  });
  page.on('pageerror', error => report.errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') report.errors.push(message.text()); });
  await page.addInitScript(() => {
    localStorage.clear();
    localStorage.setItem('gr.activeEpoch.v1', 'epoch-3-voltage');
    const ids = new WeakMap(), contexts = new WeakMap(), records = [];
    const describe = image => {
      if (!image) return null;
      const src = image.currentSrc || image.src;
      return { type: image.constructor?.name, width: image.width, height: image.height,
        src: typeof src === 'string' && src.startsWith('data:') ? `${src.slice(0, src.indexOf(','))};length=${src.length}` : src };
    };
    for (const Constructor of [window.WebGLRenderingContext, window.WebGL2RenderingContext]) {
      if (!Constructor) continue;
      const prototype = Constructor.prototype;
      for (const method of ['createTexture', 'deleteTexture', 'activeTexture', 'bindTexture', 'texImage2D', 'texSubImage2D']) {
        if (!Object.hasOwn(prototype, method)) continue;
        const original = prototype[method];
        prototype[method] = function (...args) {
          let state = contexts.get(this);
          if (!state) { state = { unit: this.TEXTURE0, bindings: new Map() }; contexts.set(this, state); }
          const result = original.apply(this, args);
          if (method === 'createTexture' && result) {
            const id = records.length; ids.set(result, id);
            records.push({ id, created: performance.now(), uploads: [] });
          } else if (method === 'deleteTexture' && ids.has(args[0])) records[ids.get(args[0])].deleted = performance.now();
          else if (method === 'activeTexture') state.unit = args[0];
          else if (method === 'bindTexture') state.bindings.set(`${state.unit}:${args[0]}`, args[1]);
          else if (method === 'texImage2D' || method === 'texSubImage2D') {
            const target = args[0] >= this.TEXTURE_CUBE_MAP_POSITIVE_X && args[0] <= this.TEXTURE_CUBE_MAP_NEGATIVE_Z ? this.TEXTURE_CUBE_MAP : args[0];
            const id = ids.get(state.bindings.get(`${state.unit}:${target}`));
            if (id !== undefined) records[id].uploads.push({ at: performance.now(), method, source: describe(args.find(value => value && typeof value === 'object' && 'width' in value)) });
          }
          return result;
        };
      }
    }
    window.__textureCensus = { ids, records, describe };
  });
  await page.goto(`${base}/?debug&epoch=epoch-3-voltage&contract=e3-canyon-works&nolevel&nopause&seed=wire-crawler-3d`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 12);
  const briefing = page.getByTestId('contract-briefing-dismiss');
  if (await briefing.isVisible()) await briefing.evaluate(button => button.click());
  if (!gameUrl) throw new Error('Observed Game module URL missing; requires the Vite development server.');
  await page.evaluate(async url => {
    const { Game } = await import(url);
    const original = Game.prototype.warmCombatPools;
    Game.prototype.warmCombatPools = function (...args) {
      window.__censusGame = this;
      Game.prototype.warmCombatPools = original;
      return original.apply(this, args);
    };
    const test = window.__GR_TEST__;
    test.setManualSim(true);
    for (const [key, value] of Object.entries({ 'waves.waveInterval': .35, 'waves.trickleInterval': 999, 'waves.pulseBase': 0, 'waves.pulsePerWave': 0, 'waves.aliveCap': 0, 'enemy.contactDamage': 0, 'sparkRig.range': 0 })) test.setBalance(key, value);
    await test.warmVfx();
  }, gameUrl);
  const samples = [['warm', 0], ['cold800ms', 800], ['later2s', 2000]];
  // Explicit diagnostic only: show resources first presented by a post-load sim tick.
  if (process.env.GR_CENSUS_STEP === '1') samples.push(['afterOneSimTick', 800]);
  for (const [label, wait] of samples) {
    if (label === 'afterOneSimTick') await page.evaluate(() => window.__GR_TEST__.advanceSim(1 / 30));
    if (wait) await page.waitForTimeout(wait);
    report.samples.push(await page.evaluate(label => {
      const game = window.__censusGame, census = window.__textureCensus, textures = new Map();
      if (!game) throw new Error('Warmup did not capture Game.');
      const collect = (texture, owner) => {
        if (!texture?.isTexture) return;
        let record = textures.get(texture.uuid);
        if (!record) {
          const gpu = game.renderer.properties.get(texture).__webglTexture;
          record = { uuid: texture.uuid, name: texture.name, sourceUuid: texture.source?.uuid,
            gpuId: gpu ? census.ids.get(gpu) : null, image: census.describe(texture.image), owners: [] };
          textures.set(texture.uuid, record);
        }
        record.owners.push(owner);
      };
      for (const [name, scene] of [['world', game.scene], ['post', game.lightRig?.post?.scene], ['heat', game.lightRig?.post?.heat?.scene]]) {
        if (!scene) continue;
        collect(scene.background, `${name}.background`); collect(scene.environment, `${name}.environment`);
        scene.traverse(object => {
          for (const material of [object.material].flat().filter(Boolean)) {
            const owner = `${name}/${object.name || object.type}/${material.name || material.type}`;
            for (const [key, value] of Object.entries(material)) collect(value, `${owner}.${key}`);
            for (const [key, uniform] of Object.entries(material.uniforms ?? {})) collect(uniform.value, `${owner}.uniforms.${key}`);
          }
        });
      }
      return { label, at: performance.now(), renderer: structuredClone(window.__THREE_GAME_DIAGNOSTICS__.renderer),
        actualRendererMemory: { ...game.renderer.info.memory }, textures: [...textures.values()], gpuRecords: census.records };
    }, label));
  }
  await Promise.all(responseReads);
  if (report.crawlerRequests.length) throw new Error('Cold-only probe unexpectedly requested the Crawler model.');
} catch (error) { report.failed = error.stack; process.exitCode = 1; }
finally {
  await browser.close();
  report.limitations = 'Instrumentation changes timing. Scene material ownership includes hidden objects and post/heat scenes; other off-scene resources may remain unmapped. Native GL allocations include internal renderer resources and must not be equated with renderer.info.memory.textures. UUIDs and GPU IDs are local to each run. No source file hashes are inferred from the local checkout.';
  await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ output, samples: report.samples.map(s => ({ label: s.label, memory: s.actualRendererMemory })), failed: report.failed, errors: report.errors }));
}
