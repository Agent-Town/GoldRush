import {chromium,devices} from 'playwright';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const out=process.env.ECHO_PRODUCTION_OUT??'artifacts/boss-fidelity/e7-echo/production';await mkdir(out,{recursive:true});
const report={scope:'Actual production bundle at 5248; public debug hooks only, no module imports or request substitution. Manual simulation; not natural progression.',cases:[],downloads:[],errors:[]};
const browser=await chromium.launch({headless:true});
try{for(const name of ['desktop','mobile']){
 const page=await browser.newPage({...devices[name==='mobile'?'Pixel 5':'Desktop Chrome'],viewport:name==='mobile'?{width:390,height:844}:{width:1280,height:800}}),downloads=[];
 page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
 page.on('response',r=>{if(/\/(assay-bench|boiler-house|lantern-post|palisade|sluice|turret|stockpile|sentry-beacon)-[^/]+\.glb$/.test(r.url()))downloads.push((async()=>{const bytes=await r.body(),file=new URL(r.url()).pathname.split('/').at(-1),local=await readFile('dist/assets/'+file),sha=b=>createHash('sha256').update(b).digest('hex');assert.equal(sha(bytes),sha(local));report.downloads.push({name,file,sha256:sha(bytes),bytes:bytes.length});})());});
 await page.addInitScript(()=>{performance.setResourceTimingBufferSize(10000);if(!sessionStorage.getItem('echo-production')){localStorage.clear();sessionStorage.setItem('echo-production','1');}});
 await page.goto('http://127.0.0.1:5248/?debug&e7boss&epoch=epoch-7-signal&contract=the-claim&nowaves&nolevel&nopause&tier=full&seed=echo-production');
 const ready=()=>page.waitForFunction(()=>window.__GR_TEST__&&window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId==='the-claim');await ready();
 await page.getByTestId('contract-briefing-dismiss').evaluate(el=>{if(el.getClientRects().length)el.click();});
 await page.evaluate(async()=>{const h=window.__GR_TEST__;h.setManualSim(true);await h.warmVfx();h.grantGold(10000);for(const [id,x,z]of [['turret',-3,8],['palisade',3,8],['stockpile',0,11]]){if(!h.placeFree(id,x,z))throw Error('Placement failed '+id);}});
 await page.waitForFunction(()=>document.querySelector('canvas').dataset.run3dPilotState==='ready');
 const capture=async(label,x,z)=>{await page.evaluate(({x,z})=>window.__GR_TEST__.teleport(x,z),{x,z});await page.waitForTimeout(350);const data=await page.evaluate(()=>({echo:window.__THREE_GAME_DIAGNOSTICS__.echoBoss,canvas:{...document.querySelector('canvas').dataset},resources:performance.getEntriesByType('resource').map(r=>r.name)}));assert(!data.resources.some(u=>new URL(u).pathname.startsWith('/src/')||u.includes('/@vite/')));await page.screenshot({path:`${out}/${name}-${label}.png`});report.cases.push({name,label,...data});return data;};
 await page.evaluate(()=>{window.__GR_TEST__.startWaveForTest(12);window.__GR_TEST__.advanceSim(.02);});
 let state=await capture('mirror-start',0,28);assert.equal(state.echo.copiedBuildings,3);
 await page.evaluate(()=>window.__GR_TEST__.advanceSim(7));state=await capture('mirror-arrived',0,16);assert.equal(state.echo.act,2);
 for(const key of ['KeyW','KeyA','KeyS','KeyD']){await page.keyboard.down(key);await page.evaluate(()=>window.__GR_TEST__.advanceSim(.05));await page.keyboard.up(key);}
 await page.waitForFunction(()=>window.__THREE_GAME_DIAGNOSTICS__.echoBoss.captured);
 state=await capture('jar',0,9);assert.equal(state.echo.killPath,false);assert.equal(state.echo.persistentJar,true);
 await page.reload();await ready();await page.waitForFunction(()=>document.querySelector('canvas').dataset.run3dPilotState==='ready'&&document.querySelector('canvas').dataset.terrain3dPilotState==='ready');await page.evaluate(()=>window.__GR_TEST__.setManualSim(true));state=await capture('fresh-kept',0,9);assert.equal(state.echo.captured,true);assert.equal(state.echo.persistentJar,true);assert.equal(state.echo.copiedBuildings,0);
 await Promise.all(downloads);assert(downloads.length>0);await page.close();
}assert.deepEqual(report.errors,[]);report.completed=true;}catch(e){report.failure=e.stack;throw e;}finally{await writeFile(`${out}/report.json`,JSON.stringify(report,null,2)+'\n');await browser.close();}
