import {chromium,devices} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const out=process.env.QUIET_OUT??'artifacts/boss-fidelity/e10-quiet/baseline';await mkdir(out,{recursive:true});
const report={cases:[],errors:[]};const browser=await chromium.launch({headless:true});
try{for(const device of ['desktop','mobile']){
const page=await browser.newPage({...devices[device==='desktop'?'Desktop Chrome':'Pixel 5'],viewport:device==='desktop'?{width:1440,height:1000}:{width:390,height:844}});
page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
await page.addInitScript(()=>localStorage.clear());
await page.goto(`${process.env.QUIET_URL??'http://127.0.0.1:5246'}/?debug&contract=e10-last-claim&nowaves&nolevel&nokill&nopause&tier=full&seed=quiet-fidelity`);
await page.waitForFunction(()=>window.__GR_TEST__&&window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId==='e10-last-claim');
await page.evaluate(()=>{document.querySelector('[data-testid=contract-briefing-dismiss]')?.click();window.__GR_TEST__.setManualSim(true);});
await page.waitForFunction(()=>window.__THREE_GAME_DIAGNOSTICS__.e10Finale.ark.loadState==='ready');
await page.waitForFunction(()=>document.querySelector('canvas').dataset.terrain3dPilotState!=='loading');
await page.evaluate(()=>{const h=window.__GR_TEST__;h.setBalance('enemy.contactDamage',0);h.setBalance('sparkRig.range',0);h.setBalance('e10Static.preserveWindowSeconds',20);h.teleport(0,48);h.advanceSim(.5);});
const shot=async state=>{await page.waitForTimeout(100);await page.screenshot({path:`${out}/${device}-${state}.png`});report.cases.push({device,state,...await page.evaluate(()=>({boss:window.__GR_TEST__.e10Static.diagnostics(),finale:window.__THREE_GAME_DIAGNOSTICS__.e10Finale,filter:document.querySelector('canvas').style.filter}))});};
await shot('approach');await page.evaluate(()=>window.__GR_TEST__.advanceSim(4));await shot('pressure');
await page.evaluate(()=>{const h=window.__GR_TEST__;for(const x of [-10,0,10]){h.teleport(x,50);if(!h.e10Static.interact())throw Error('preserve failed '+x);}h.teleport(0,48);h.advanceSim(1.5);});await shot('recession');
await page.evaluate(()=>window.__GR_TEST__.advanceSim(1.6));await shot('receded');assert.equal(report.cases.at(-1).boss.victory,'receded');
await page.close();
}assert.deepEqual(report.errors,[]);report.completed=true;}catch(e){report.failure=e.stack;throw e;}finally{await writeFile(`${out}/report.json`,JSON.stringify(report,null,2));await browser.close();}
