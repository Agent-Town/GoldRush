import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
const tape = JSON.parse(await readFile('artifacts/gauntlet-heat11-20260903/rides/e7-relay-rush/opus/work/attempt-1-tape.json', 'utf8'));
const era = JSON.parse(await readFile('assets/engine-era.json', 'utf8'));
tape.meta = { ...tape.meta, engineHash: era.engineHash, era: era.era };
const browser = await chromium.launch({ channel: 'chromium' });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors=[]; const requests=[];
page.on('pageerror',e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error')errors.push(m.text())}); page.on('request',r=>requests.push(r.url()));
try {
  await page.route('**/api/standings**',r=>r.fulfill({json:{ok:true,reel:tape}}));
  await page.goto(`http://127.0.0.1:5294/?watch=${tape.id}&contract=${tape.contract}&epoch=epoch-7-signal`);
  const canvas=page.getByTestId('lantern-world-canvas');
  await canvas.waitFor({timeout:60000});
  await page.waitForFunction(()=>document.querySelector('[data-testid="lantern-world-canvas"]')?.dataset.terrain3dPilotState==='ready',null,{timeout:60000});
  await page.waitForFunction(()=>Number(document.querySelector('[data-testid="lantern-world-canvas"]')?.dataset.renderedSprites)>1,null,{timeout:60000});
  const state=await canvas.evaluate(c=>({...c.dataset}));
  const snapshot=JSON.parse(await page.getByTestId('lantern-show').getAttribute('data-true-reel-probe'));
  assert.equal(state.contract,tape.contract);assert.equal(snapshot.contract.id,tape.contract);assert.equal(state.tile,snapshot.contract.tileId);
  assert.equal(state.terrain3dPilotRenderSource,'glb');assert(requests.some(u=>/terrain[^/]*\.glb/.test(u)));assert(!requests.some(u=>/\/Game-[^/]*\.js/.test(u)));assert.deepEqual(errors,[]);
  await page.screenshot({path:'artifacts/lantern-true-world-2/production-signal.png'});
  await writeFile('artifacts/lantern-true-world-2/production.json',JSON.stringify({state,snapshotContract:snapshot.contract,errors,terrainRequests:requests.filter(u=>/terrain[^/]*\.glb/.test(u))},null,2));
  console.log('Production Signal world passed; independent boot, matching contract and tile, mounted GLB, sprites, zero errors.');
} finally {await browser.close()}
