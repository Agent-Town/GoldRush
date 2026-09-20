// Seeds a kept-Homemaker tile-state entry into the live profile, reloads, and reports every
// page/console error plus the Homemaker diagnostics. Proves the AD2-B1 boot crash directly.
import { chromium } from '@playwright/test'; // run from the repo root so this resolves

const BASE = process.env.BASE ?? 'http://127.0.0.1:5301';
const QUERY = '/?debug&epoch=epoch-6-atomic&contract=e6-glow-mesa&nolevel&nopause&seed=homemaker-9000';
const LABEL = process.argv[2] ?? 'probe';

const browser = await chromium.launch({ channel: 'chromium' });
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await context.newPage();
await page.addInitScript(() => localStorage.setItem('gr.activeEpoch', 'epoch-6-atomic'));

const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(`console: ${m.text()}`));
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

await page.goto(BASE + QUERY);
await page.waitForFunction(
  () => window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e6-glow-mesa',
  undefined, { timeout: 60_000 },
);
const seeded = await page.evaluate(() => {
  const match = Object.keys(localStorage).map((k) => /^gr\.profile\.v2\.([^.]+)\./.exec(k)).find(Boolean);
  if (!match) return null;
  const key = `gr.profile.v2.${match[1]}.tilestate.e6-glow-mesa`;
  localStorage.setItem(key, JSON.stringify({
    schemaVersion: 1,
    entries: [{ kind: 'render', id: 'homemaker-9000-kept', payload: { x: 3, z: -8 }, schemaVersion: 1 }],
  }));
  return key;
});
errors.length = 0; // only the reload's errors matter

await page.reload();
let booted = false;
try {
  await page.waitForFunction(
    () => window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e6-glow-mesa',
    undefined, { timeout: 25_000 },
  );
  booted = true;
} catch { booted = false; }

const homemaker = booted
  ? await page.evaluate(() => {
      const d = window.__THREE_GAME_DIAGNOSTICS__.homemakerBoss;
      return d && { persistentKept: d.persistentKept, chairPlaced: d.chairPlaced, act: d.act, poweredDown: d.poweredDown, position: d.position };
    })
  : null;

console.log(JSON.stringify({ label: LABEL, seededKey: seeded, bootedAfterReload: booted, errors, homemaker }, null, 2));
await browser.close();
process.exit(0);
