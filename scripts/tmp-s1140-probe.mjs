// s1140 diagnostic probe for F-m503-1 / F-902-2 (task-037 reds).
// Reproduces debugPlaceAssayOffice() step by step against the live dev server on 5251
// and RECORDS the state at each step — including confirmBuild()'s return value, which
// the e2e helper discards. Read-only: no src/ or e2e/ change.
import { chromium } from '@playwright/test';

const BASE = 'http://127.0.0.1:5251';
const URLS = {
  hidden: '/?debug&timescale=6&nowaves&nolevel&nokill&seed=task037-hidden',
  normal: '/?debug&timescale=4&nowaves&nolevel&nokill&seed=task037-normal',
};

const snap = (page) =>
  page.evaluate(() => {
    const d = window.__THREE_GAME_DIAGNOSTICS__;
    return {
      frame: d?.frame ?? null,
      gold: d?.economy?.gold ?? d?.gold ?? null,
      deepwaterClaim: d?.deepwaterClaim === null ? 'null' : typeof d?.deepwaterClaim,
      heroPos: d?.heroPos ?? null,
      build: d?.build
        ? {
            mode: d.build.mode,
            selectedBuildable: d.build.selectedBuildable,
            ghostValid: d.build.ghostValid,
            assayOffices: d.build.assayOffices,
          }
        : null,
    };
  });

const run = async (label, url) => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const consoleErrors = [];
  page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
  page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`));

  await page.goto(BASE + url);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);

  const steps = [];
  steps.push(['00 after-boot', await snap(page)]);

  // Exactly debugPlaceAssayOffice's sequence, but capturing each hook's return value.
  const hookResults = await page.evaluate(() => {
    const t = window.__GR_TEST__;
    const out = {};
    out.hooksPresent = {
      grantGold: typeof t?.grantGold,
      teleport: typeof t?.teleport,
      selectBuildable: typeof t?.selectBuildable,
      confirmBuild: typeof t?.confirmBuild,
      setBuildMode: typeof t?.setBuildMode,
    };
    out.grantGold = t?.grantGold?.(120) ?? null;
    out.teleport1 = t?.teleport?.(0, 9) ?? null;
    out.selectBuildable = t?.selectBuildable?.('assay_office') ?? null;
    return out;
  });
  steps.push(['01 after-select', await snap(page)]);

  // Let a frame or two pass so the ghost can validate, then read ghostValid before confirming.
  await page.waitForTimeout(300);
  steps.push(['02 after-settle', await snap(page)]);

  const confirmReturn = await page.evaluate(() => window.__GR_TEST__?.confirmBuild?.() ?? null);
  steps.push(['03 after-confirm', await snap(page)]);

  await page.evaluate(() => {
    window.__GR_TEST__?.setBuildMode(false);
    window.__GR_TEST__?.teleport(0, 7);
  });
  await page.waitForTimeout(300);
  steps.push(['04 after-teleport', await snap(page)]);

  // Cost probe: what does the assay office actually cost, and what is affordable?
  const costs = await page.evaluate(() => {
    const d = window.__THREE_GAME_DIAGNOSTICS__;
    return { buildKeys: d?.build ? Object.keys(d.build) : null, costs: d?.build?.costs ?? null };
  });

  await browser.close();
  return { label, url, hookResults, confirmReturn, steps, costs, consoleErrors: consoleErrors.slice(0, 5) };
};

const results = [];
results.push(await run('hidden(:171)', URLS.hidden));
results.push(await run('normal(:142)', URLS.normal));

for (const r of results) {
  console.log(`\n===== ${r.label}  ${r.url}`);
  console.log('hooksPresent      :', JSON.stringify(r.hookResults.hooksPresent));
  console.log('grantGold ret     :', JSON.stringify(r.hookResults.grantGold));
  console.log('selectBuildable   :', JSON.stringify(r.hookResults.selectBuildable));
  console.log('confirmBuild ret  :', JSON.stringify(r.confirmReturn), '   <-- the value the e2e helper throws away');
  console.log('build keys        :', JSON.stringify(r.costs.buildKeys));
  for (const [name, s] of r.steps) {
    console.log(`  ${name}: gold=${s.gold} deepwater=${s.deepwaterClaim} hero=${JSON.stringify(s.heroPos)} build=${JSON.stringify(s.build)}`);
  }
  if (r.consoleErrors.length) console.log('consoleErrors    :', JSON.stringify(r.consoleErrors));
}
