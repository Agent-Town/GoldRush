#!/usr/bin/env node
// F-SAR-7 — WHAT the crawler map's cold baseline draws, not just how many triangles.
//
// Boots exactly as `e2e/wire-crawler-3d.spec.ts`'s `open()` does (same query, same waits, same
// balance pokes, then `warmVfx()` + 800 ms, which is the moment the spec samples `coldBaseline`),
// then reads BOTH `__THREE_GAME_DIAGNOSTICS__.renderer` and the test-only `drawCallCensus()`, which
// charges every draw call and its triangles to the object that issued it. Run against two trees,
// the diff names the geometry rather than guessing at it.
//
// Usage: node .../crawler-cold-census.mjs <label> [runs] [project]
//   project: desktop | mobile | both (default both), runs default 3.
import { writeFileSync, mkdirSync } from 'node:fs';
import { chromium, devices } from 'playwright';

const BASE = process.env.GR_CAPTURE_BASE_URL ?? 'http://127.0.0.1:5430';
const QUERY = '/?debug&epoch=epoch-3-voltage&contract=e3-canyon-works&nolevel&nopause&seed=wire-crawler-3d';
const ACTIVE_EPOCH_KEY = 'gr.activeEpoch.v1'; // src/meta/ContractFamilies.ts:849
const label = process.argv[2] ?? 'unlabelled';
const runs = Number(process.argv[3] ?? 3);
const which = process.argv[4] ?? 'both';
const OUT = 'artifacts/hygiene-battery-lossless-triangles';
mkdirSync(OUT, { recursive: true });

const PROJECTS = {
  desktop: { name: 'desktop-chrome', context: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
  mobile: { name: 'mobile-chrome', context: { ...devices['Pixel 5'], viewport: { width: 390, height: 844 } } },
};

const browser = await chromium.launch({ channel: 'chromium' });
const results = [];
try {
  for (const key of which === 'both' ? ['desktop', 'mobile'] : [which]) {
    const project = PROJECTS[key];
    for (let run = 0; run < runs; run += 1) {
      const context = await browser.newContext(project.context);
      const page = await context.newPage();
      const errors = [];
      page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
      page.on('pageerror', (e) => errors.push(e.message));
      await page.addInitScript(({ key: storageKey }) => {
        localStorage.clear();
        localStorage.setItem(storageKey, 'epoch-3-voltage');
      }, { key: ACTIVE_EPOCH_KEY });
      await page.goto(BASE + QUERY);
      await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 12);
      const briefing = page.getByTestId('contract-briefing-dismiss');
      if (await briefing.isVisible()) await briefing.evaluate((button) => button.click());
      await page.evaluate(() => {
        const t = window.__GR_TEST__;
        t.setManualSim(true);
        t.setBalance('waves.waveInterval', 0.35);
        t.setBalance('waves.trickleInterval', 999);
        t.setBalance('waves.pulseBase', 0);
        t.setBalance('waves.pulsePerWave', 0);
        t.setBalance('waves.aliveCap', 0);
        t.setBalance('enemy.contactDamage', 0);
        t.setBalance('sparkRig.range', 0);
      });
      await page.evaluate(() => window.__GR_TEST__.warmVfx());
      await page.waitForTimeout(800);
      const renderer = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__.renderer);
      const scene = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__.scene);
      const census = await page.evaluate(() => window.__GR_TEST__.drawCallCensus());
      results.push({ label, project: project.name, run, renderer, scene, errors, census });
      console.log(`${label} ${project.name} run${run}: triangles=${renderer.triangles} calls=${renderer.calls} geometries=${renderer.geometries} textures=${renderer.textures} censusRows=${census.byObject.length} errors=${errors.length}`);
      await context.close();
    }
  }
} finally {
  await browser.close();
}
writeFileSync(`${OUT}/crawler-cold-census-${label}.json`, `${JSON.stringify(results, null, 1)}\n`);
console.log(`wrote ${OUT}/crawler-cold-census-${label}.json`);
