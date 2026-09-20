import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const phase = process.argv[2] ?? 'before';
const baseURL = process.env.GR_CAPTURE_BASE_URL ?? `http://127.0.0.1:${phase === 'before' ? 5198 : 5197}`;
const browser = await chromium.launch({ channel: 'chromium' });
const rows = [];
try {
  for (const width of [1280, 390]) for (const contract of ['the-claim', 'e2-hill-mine', 'e8-mare-claim']) {
    console.log('boot', contract, width);
    const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 800 }, deviceScaleFactor: width === 390 ? 2.75 : 1, isMobile: width === 390, hasTouch: width === 390 });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.route('**/src/game/Game.ts*', async route => {
      const response = await route.fetch();
      const body = (await response.text()).replace('window.__GR_TEST__ = {', `window.__GR_TEST__ = { atlasRuntime: () => ({ scene: this.scene, renderer: this.renderer, dispose: () => this.dispose() }),`);
      await route.fulfill({ response, body });
    });
    await page.goto(`${baseURL}/?debug&autotier&contract=${contract}&nowaves&nolevel&nokill&nopause&tier=full&seed=shared-atlas`);
    await page.waitForFunction(() => window.__GR_TEST__ && document.querySelector('#game-canvas')?.dataset.terrain3dPilotLandmarkLoadState === 'mounted', null, { timeout: 60000 }).catch(async error => {
      console.log('FAILED BOOT', errors, await page.evaluate(() => ({ body: document.body.innerText.slice(0, 1500), data: { ...document.querySelector('canvas')?.dataset }, seam: Boolean(window.__GR_TEST__) })));
      await page.screenshot({ path: 'artifacts/shared-atlas-dedupe/boot-failure.png' });
      throw error;
    });
    const begin = page.getByRole('button', { name: 'Begin', exact: true });
    if (await begin.isVisible()) await begin.click();
    if (await page.getByTestId('contract-briefing').isVisible()) await page.getByTestId('contract-briefing-dismiss').click();
    await page.evaluate(() => { window.__GR_TEST__.teleport(8, 12); window.__GR_TEST__.setManualSim(true); });
    await page.waitForTimeout(2500);
    const snapshot = await page.evaluate(() => {
      const { scene, renderer } = window.__GR_TEST__.atlasRuntime();
      const sources = new Set(), landmarkSources = new Set();
      function images(root, result) {
        root?.traverse(node => {
          for (const mat of Array.isArray(node.material) ? node.material : node.material ? [node.material] : []) {
            for (const value of Object.values(mat)) if (value?.isTexture && value.image?.width) result.add(value.image);
          }
        });
      }
      images(scene, sources); images(scene.getObjectByName('Terrain3dLandmarks'), landmarkSources);
      const estimate = set => [...set].reduce((sum, im) => sum + im.width * im.height * 4 * 4 / 3, 0);
      return { textures: renderer.info.memory.textures, sceneImages: sources.size, sceneEstimatedBytes: estimate(sources), landmarkImages: landmarkSources.size, landmarkEstimatedBytes: estimate(landmarkSources) };
    });
    await page.screenshot({ path: `artifacts/shared-atlas-dedupe/${phase}-${contract}-${width}.png` });
    rows.push({ phase, contract, width, ...snapshot, errors });
    console.log(JSON.stringify(rows.at(-1)));
    await writeFile(`artifacts/shared-atlas-dedupe/${phase}.json`, JSON.stringify(rows, null, 2) + '\n');
    await page.close();
  }
} finally { await browser.close(); }
