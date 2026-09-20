import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
const tape = JSON.parse(await readFile('artifacts/eh3-fixture/tape.json','utf8'));
const era = JSON.parse(await readFile('assets/engine-era.json','utf8'));
tape.meta = { ...tape.meta, engineHash: era.engineHash, era: era.era };
const browser = await chromium.launch({ channel: 'chromium' });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error') errors.push(m.text())});
await page.route('**/api/standings**',r=>r.fulfill({json:{ok:true,reel:tape}}));
await page.goto(`http://127.0.0.1:5189/?watch=${tape.id}&contract=${tape.contract}&epoch=epoch-1-frontier`);
try { await page.getByTestId('lantern-world-canvas').waitFor({timeout:60000}); await page.waitForFunction(()=>Number(document.querySelector('[data-testid="lantern-world-canvas"]')?.dataset.frame)>60,null,{timeout:60000}); } catch(e) {errors.push(e.message)}
console.log(JSON.stringify({errors,state:await page.locator('body').innerText(),canvas:await page.locator('canvas').evaluateAll(cs=>cs.map(c=>({id:c.id,...c.dataset})))},null,2));
await page.screenshot({path:'artifacts/lantern-true-world-2/probe.png'});
await browser.close();
