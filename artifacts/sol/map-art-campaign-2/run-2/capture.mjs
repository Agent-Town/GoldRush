// Plain boots use the existing preview launch seam; diagnostic stations are labelled separately.
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const baselineDome=process.env.BASELINE_DOME ? readFileSync(process.env.BASELINE_DOME) : undefined;
const baselineDomeHash=baselineDome ? createHash('sha256').update(baselineDome).digest('hex') : undefined;

const base = 'http://127.0.0.1:5303';
const phase = process.env.PHASE ?? 'before';
const maps = (process.env.MAPS ?? 'e5-deepwater-claim').split(',');
const browser = await chromium.launch({ channel: 'chromium' });
try {
  for (const id of maps) {
    const out = `artifacts/sol/map-art-campaign-2/run-2/${id}`;
    mkdirSync(out, { recursive: true });
    const rows = [];
    for (const width of [1280, 390]) {
      const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 800 }, isMobile: width === 390, hasTouch: width === 390, deviceScaleFactor: 1 });
      page.setDefaultNavigationTimeout(120000);
      if(baselineDome) await page.route('**/air-pad-dome.glb*',route=>new URL(route.request().url()).searchParams.has('import') ? route.continue() : route.fulfill({body:baselineDome,contentType:'model/gltf-binary'}));
      const errors = [];
      page.on('pageerror', e => { errors.push(e.message); console.log('PAGEERROR',e.message); });
      page.on('console', m => { if (m.type() === 'error') { errors.push(m.text()); console.log('CONSOLEERROR',m.text()); } });
      console.log('OPEN', id, width, phase);
      await page.goto(base, { waitUntil: 'load' });
      console.log('TOWN',id,width);
      await page.evaluate(async contract => {
        const unlock = await import('/src/meta/ContractUnlock.ts');
        const families = await import('/src/meta/ContractFamilies.ts');
        unlock.setPreviewUnlockAll(true);
        families.stagePlayerContractLaunch(contract);
      }, id);
      console.log('STAGED',id,width);
      await page.goto(`${base}/?contract=${id}&seed=map-art-campaign-2`, { waitUntil: 'domcontentloaded' });
      console.log('ENTERED',id,width);
      try {
        await page.waitForFunction(() => document.querySelector('#game-canvas')?.dataset.terrain3dPilotState === 'ready', null, { timeout: 120000 });
      } catch (error) {
        console.log('FAILED STATE', await page.evaluate(() => ({dataset: {...document.querySelector('#game-canvas')?.dataset}, diagnostics: window.__THREE_GAME_DIAGNOSTICS__?.contract, body:document.body.innerText.slice(0,1000)})));
        await page.screenshot({path:`${rootPath()}/_raw/failed-${id}-${width}.png`,timeout:10000}).catch(()=>{});
        throw error;
      }
      console.log('TERRAIN',id,width);
      await page.waitForFunction(() => document.querySelector('#game-canvas')?.dataset.terrain3dPilotLandmarkLoadState === 'mounted', null, { timeout: 120000 });
      if (await page.getByTestId('contract-briefing-dismiss').isVisible()) await page.getByTestId('contract-briefing-dismiss').click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `${out}/${phase}-plain-${width}.png` });
      const plain = await page.evaluate(() => ({ diagnostics: window.__THREE_GAME_DIAGNOSTICS__, dataset: {...document.querySelector('#game-canvas').dataset}, testHook: typeof window.__GR_TEST__ }));
      assert.equal(plain.diagnostics.contract.activeId, id);
      assert.equal(plain.testHook, 'undefined');
      const row = { width, plain, errors, baselineDomeHash, stations: [], performance: [] };
      rows.push(row);
      writeFileSync(`${out}/${phase}.json`, JSON.stringify(rows, null, 2));
      if (process.env.PLAIN_ONLY !== '1') {
        await page.goto(`${base}/?debug&contract=${id}&seed=map-art-campaign-2&nowaves&nolevel&nokill&nopause&tier=full`);
        await page.waitForFunction(() => document.querySelector('#game-canvas')?.dataset.terrain3dPilotLandmarkLoadState === 'mounted' && window.__GR_TEST__, null, { timeout: 120000 });
        if (await page.getByTestId('contract-briefing-dismiss').isVisible()) await page.getByTestId('contract-briefing-dismiss').click();
        await page.evaluate(() => { window.__GR_GUI__?.hide(); window.__GR_TEST__.setManualSim(true); });
        await page.waitForTimeout(2000);
        for (let run = 0; run < 4; run++) {
          const perf = await page.evaluate(async () => {
            const values = [];
            let last = performance.now();
            await new Promise(resolve => { const sample = now => { values.push(now-last); last=now; if(values.length<180) requestAnimationFrame(sample); else resolve(); }; requestAnimationFrame(sample); });
            values.sort((a,b)=>a-b);
            return { p95: values[Math.floor(values.length*.95)], census: window.__GR_TEST__.renderCensus?.().renderer, frameMs: window.__THREE_GAME_DIAGNOSTICS__.frameMs };
          });
          row.performance.push(perf);
        }
        const mounts = JSON.parse(plain.dataset.terrain3dPilotLandmarkMounts ?? '[]');
        const stations = id.startsWith('e5-')
          ? [{ id: 'reef', x: 0, z: -6 }, ...mounts.filter(m => ['drowned-claim-office','start-line-rig'].includes(m.id))]
          : mounts;
        for (const m of stations) {
          const back = m.id === 'reef' ? 0 : 10;
          await page.evaluate(({x,z,back}) => window.__GR_TEST__.teleport(x,z+back), {...m, back});
          await page.waitForTimeout(1000);
          await page.screenshot({ path: `${out}/${phase}-station-${m.id}-${width}.png` });
          row.stations.push({ ...m, back });
        }
      }
      writeFileSync(`${out}/${phase}.json`, JSON.stringify(rows,null,2));
      console.log(id,width,phase,'errors',errors.length,'p95',row.performance.map(p=>p.p95));
      assert.deepEqual(errors, []);
      await page.close();
    }
  }
} finally { await browser.close(); }

function rootPath() { return 'artifacts/sol/map-art-campaign-2/run-2'; }
