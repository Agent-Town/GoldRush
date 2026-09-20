// Characterization of the task's firewall blocker, not a shipping acceptance gate.
// Run with a Vite dev server: node artifacts/lantern-true-world/probe-boot-coupling.mjs http://127.0.0.1:5194
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium, devices } from '@playwright/test';

const base = process.argv[2] ?? 'http://127.0.0.1:5194';
const output = new URL('./', import.meta.url);
const tape = JSON.parse(await readFile('artifacts/eh3-fixture/tape.json', 'utf8'));
const era = JSON.parse(await readFile('assets/engine-era.json', 'utf8'));
// Same current-engine stamp used by reel-deep-links.spec.ts; recorded actions/hash are unchanged.
tape.meta = { ...tape.meta, engineHash: era.engineHash, era: era.era };
const browser = await chromium.launch({ channel: 'chromium' });
const results = [];
await mkdir(output, { recursive: true });
try {
  for (const mobile of [false, true]) {
    for (const noWebGL of [false, true]) {
      const name = `${mobile ? 'mobile' : 'desktop'}-${noWebGL ? 'no-webgl' : 'control'}`;
      const context = await browser.newContext(mobile
        ? { ...devices['Pixel 5'], viewport: { width: 390, height: 844 } }
        : { viewport: { width: 1280, height: 800 } });
      try {
        const page = await context.newPage();
        const pageErrors = [];
        const consoleErrors = [];
        page.on('pageerror', (error) => pageErrors.push(error.message));
        page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
        await page.addInitScript((disabled) => {
          localStorage.clear();
          window.__lanternWebGLRequests = [];
          if (!disabled) return;
          const getContext = HTMLCanvasElement.prototype.getContext;
          HTMLCanvasElement.prototype.getContext = function (type, ...args) {
            if (/webgl/i.test(type)) {
              window.__lanternWebGLRequests.push({ canvas: this.id, type });
              return null;
            }
            return getContext.call(this, type, ...args);
          };
        }, noWebGL);
        await page.route('**/api/standings**', (route) => route.fulfill({
          status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, reel: tape }),
        }));
        const inputUrl = `${base}/?watch=${encodeURIComponent(tape.id)}&contract=${tape.contract}&epoch=epoch-1-frontier`;
        await page.goto(inputUrl);
        if (noWebGL) {
          await page.waitForFunction(() => window.__lanternWebGLRequests.some(({ canvas }) => canvas === 'game-canvas'), null, { timeout: 30_000 });
          await page.getByTestId('start-menu').waitFor({ state: 'visible', timeout: 20_000 });
        } else {
          await page.getByTestId('lantern-true-world').waitFor({ state: 'visible', timeout: 30_000 });
          await page.getByTestId('lantern-show').filter({ has: page.locator('[data-replay-entity="hero"]') }).waitFor({ timeout: 30_000 });
        }
        const result = { name, inputUrl, pageErrors, consoleErrors, ...await page.evaluate(() => ({
          url: location.href,
          viewport: { width: innerWidth, height: innerHeight },
          webglRequests: window.__lanternWebGLRequests,
          lanternShows: document.querySelectorAll('[data-testid="lantern-show"]').length,
          worlds: document.querySelectorAll('[data-testid="lantern-true-world"]').length,
          worldTag: document.querySelector('[data-testid="lantern-true-world"]')?.tagName ?? null,
          menu: !!document.querySelector('[data-testid="start-menu"]'),
        })) };
        results.push(result);
        await page.screenshot({ path: fileURLToPath(new URL(`${name}.png`, output)), fullPage: true });
        await writeFile(new URL('boot-coupling.json', output), JSON.stringify(results, null, 2) + '\n');
        if (noWebGL) {
          assert(pageErrors.some((error) => error.includes('Error creating WebGL context')));
          assert.equal(result.lanternShows, 0);
          assert.equal(result.worlds, 0);
          assert.equal(new URL(result.url).search, '');
        } else {
          assert.equal(result.lanternShows, 1);
          assert.equal(result.worldTag, 'svg');
          assert.equal(pageErrors.length, 0);
        }
        console.log(JSON.stringify(result));
      } finally { await context.close(); }
    }
  }
} finally { await browser.close(); }
