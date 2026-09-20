// The self-check's plain-boot sweep: `e3-blackout-ridge`, `e3-fairground`, `e4-long-road` and
// `e5-deepwater-claim` at 1280x800 and 390x844, NO `?debug`, entered the way the town board enters
// them (ContractUnlock.setPreviewUnlockAll + ContractFamilies.stagePlayerContractLaunch), counting
// every console error and page error. The Long Road also captures its BRIEFING CARD before
// dismissal, which is where F-OMA-3's re-voiced goals are read.
//
//   PROBE_BASE=http://127.0.0.1:5312 PHASE=after node artifacts/post-open-maps-correctives/plain-boots.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const base = process.env.PROBE_BASE ?? 'http://127.0.0.1:5312';
const phase = process.env.PHASE ?? 'after';
const out = `artifacts/post-open-maps-correctives/${phase}/plain-boots`;
mkdirSync(out, { recursive: true });

const MAPS = ['e3-blackout-ridge', 'e3-fairground', 'e4-long-road', 'e5-deepwater-claim'];
const VIEWPORTS = [
  { name: '1280', viewport: { width: 1280, height: 800 }, isMobile: false },
  { name: '390', viewport: { width: 390, height: 844 }, isMobile: true },
];

const browser = await chromium.launch({ channel: 'chromium' });
const rows = [];
try {
  for (const id of MAPS) {
    for (const vp of VIEWPORTS) {
      const page = await browser.newPage({ viewport: vp.viewport, isMobile: vp.isMobile, hasTouch: vp.isMobile, deviceScaleFactor: 1 });
      const errors = [];
      page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
      page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
      await page.goto(`${base}/`);
      await page.waitForFunction(() => document.readyState === 'complete', null, { timeout: 60000 });
      await page.evaluate(async (contract) => {
        const unlock = await import('/src/meta/ContractUnlock.ts');
        const families = await import('/src/meta/ContractFamilies.ts');
        unlock.setPreviewUnlockAll(true);
        families.stagePlayerContractLaunch(contract);
      }, id);
      await page.goto(`${base}/?contract=${id}&seed=poc-plain-${phase}`);
      await page.waitForFunction(() => document.querySelector('#game-canvas')?.dataset.terrain3dPilotState === 'ready', null, { timeout: 120000 });
      const briefing = page.getByTestId('contract-briefing');
      let goals = null;
      if (await briefing.isVisible().catch(() => false)) {
        await page.screenshot({ path: `${out}/${id}-briefing-${vp.name}.png` });
        goals = await page.evaluate(() => Array.from(document.querySelectorAll('[data-testid="contract-briefing"] li')).map((li) => li.textContent?.trim()));
        await page.getByTestId('contract-briefing-dismiss').click();
      }
      await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 60, null, { timeout: 60000 });
      await page.waitForTimeout(2000);
      const shot = `${id}-plain-${vp.name}.png`;
      await page.screenshot({ path: `${out}/${shot}` });
      const info = await page.evaluate(() => ({
        activeId: window.__THREE_GAME_DIAGNOSTICS__?.contract?.activeId ?? null,
        fallback: window.__THREE_GAME_DIAGNOSTICS__?.contract?.fallbackReason ?? null,
        testHook: typeof window.__GR_TEST__,
      }));
      rows.push({ contract: id, viewport: vp.name, shot, goals, info, errors });
      console.log('PLAIN', id.padEnd(20), vp.name.padEnd(5), 'active=', info.activeId, 'testHook=', info.testHook, 'errors=', errors.length, errors.slice(0, 2).join(' | '));
      await page.close();
    }
  }
} finally {
  writeFileSync(`${out}/plain-boots.json`, JSON.stringify(rows, null, 2));
  await browser.close();
}
