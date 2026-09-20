import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const browser = await chromium.launch({ channel: 'chromium' });
const reports = [];
try {
  for (const [label, port] of [['head',5296],['candidate',5189]]) {
    const page = await browser.newPage({ viewport: { width:1280,height:800 } });
    const held = [];
    await page.route(/the-claim-terrain(?:-[^/?]+)?\.glb/, route => held.push({route, type:route.request().resourceType(), url:route.request().url(), released:false}));
    await page.goto(`http://127.0.0.1:${port}/?debug&nowaves&nolevel&nokill&nopause&seed=terrain3d-claim&terrain3dPilot`);
    const begin = page.getByRole('button', {name:'Begin'}); if (await begin.isVisible()) await begin.click();
    await page.waitForFunction(() => Boolean(window.__GR_TEST__) && window.__THREE_GAME_DIAGNOSTICS__.frame > 10);
    await page.evaluate(async()=>{ for(let i=0;i<120;i++) await new Promise(requestAnimationFrame); });
    const selected = held.at(-1); assert(selected); selected.released=true; await selected.route.continue();
    await page.waitForTimeout(2000);
    const before = await page.locator('#game-canvas').evaluate(c=>c.dataset.terrain3dPilotState);
    const pending = held.filter(r=>!r.released);
    for(const entry of pending){entry.released=true;await entry.route.continue();}
    await page.waitForFunction(()=>document.querySelector('#game-canvas').dataset.terrain3dPilotState==='ready',null,{timeout:15000});
    const after = await page.locator('#game-canvas').evaluate(c=>c.dataset.terrain3dPilotState);
    reports.push({label,held:held.map(({type,url})=>({type,url})),releasedByOriginalTest:held.indexOf(selected),remainingBlocked:pending.length,before,after});
    assert(pending.length>0); assert.notEqual(before,'ready'); assert.equal(after,'ready');
    await page.close();
  }
  console.log(JSON.stringify(reports,null,2));
} finally {
  await writeFile('artifacts/lantern-true-world-2/readiness-probe.json',JSON.stringify(reports,null,2)+'\n');
  await browser.close();
}
