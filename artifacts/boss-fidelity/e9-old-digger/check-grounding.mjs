import {chromium,devices} from 'playwright';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const out=process.env.DIGGER_OUT??'artifacts/boss-fidelity/e9-old-digger/grounding-baseline';await mkdir(out,{recursive:true});
const report={cases:[],downloads:[],errors:[],override:process.env.DIGGER_MODEL??null};
const browser=await chromium.launch({headless:true});
try{for(const device of ['desktop']){
const page=await browser.newPage({...devices[device==='desktop'?'Desktop Chrome':'Pixel 5'],viewport:device==='desktop'?{width:1440,height:1000}:{width:390,height:844}});
if(process.env.DIGGER_MODEL){const body=await readFile(process.env.DIGGER_MODEL);await page.route('**/old-digger.glb',r=>r.fulfill({body,contentType:'model/gltf-binary'}));await page.route(/\/src\/systems\/OldDiggerBossSystem\.ts(?:\?|$)/,async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace(/const OLD_DIGGER_3D_TRIANGLES = [\d_]+;/,`const OLD_DIGGER_3D_TRIANGLES = ${Number(process.env.DIGGER_TRIANGLES)};`)});});}
const downloads=[];page.on('response',r=>{if(new URL(r.url()).pathname.endsWith('/old-digger.glb'))downloads.push((async()=>{const bytes=await r.body();report.downloads.push({device,sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length});})());});
page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
await page.addInitScript(()=>{performance.setResourceTimingBufferSize(10000);if(!sessionStorage.getItem('digger-review')){localStorage.clear();sessionStorage.setItem('digger-review','1');}});
await page.goto('http://127.0.0.1:5246/?debug&epoch=epoch-9-redfields&contract=e9-dome-basin&nolevel&nopause&nowaves&tier=full&seed=old-digger');
await page.waitForFunction(()=>window.__GR_TEST__&&window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId==='e9-dome-basin');
await page.evaluate(async()=>{const u=performance.getEntriesByType('resource').map(e=>e.name).find(u=>new URL(u).pathname==='/src/game/Game.ts');const {Game}=await import(u),old=Game.prototype.warmCombatPools;Game.prototype.warmCombatPools=function(...a){window.__diggerGame=this;Game.prototype.warmCombatPools=old;return old.apply(this,a);};await window.__GR_TEST__.warmVfx();});
await page.evaluate(()=>{document.querySelector('[data-testid=contract-briefing-dismiss]')?.click();const h=window.__GR_TEST__;h.setManualSim(true);h.setBalance('enemy.contactDamage',0);h.setBalance('sparkRig.range',0);h.setBalance('oldDigger.deckClimbSeconds',.2);h.setBalance('oldDigger.hazardDamage',0);h.setBalance('oldDigger.readSeconds',.1);h.setBalance('oldDigger.reDigSpeed',80);h.startWaveForTest(2);h.advanceSim(.1);});
await page.waitForFunction(()=>document.querySelector('canvas').dataset.oldDigger3dState==='ready');
const shot=async state=>{await page.evaluate(()=>{const h=window.__GR_TEST__,p=window.__THREE_GAME_DIAGNOSTICS__.oldDiggerBoss.position;h.teleport(p.x,p.z);h.advanceSim(.05);});await page.locator('canvas').dispatchEvent('wheel',{deltaY:2500,deltaMode:0,bubbles:true});await page.evaluate(()=>window.__GR_TEST__.advanceSim(.3));await page.waitForTimeout(900);await page.screenshot({path:`${out}/${device}-${state}.png`});report.cases.push({device,state,...await page.evaluate(()=>({boss:window.__THREE_GAME_DIAGNOSTICS__.oldDiggerBoss,canvas:{...document.querySelector('canvas').dataset}}))});};
report.grounding=await page.evaluate(async()=>{const b=window.__diggerGame.oldDiggerBoss,{visualY}=await import('/src/world/Terrain.ts');b.machine.updateWorldMatrix(true,true);const rows=[];for(const [name,m] of b.oldDigger3dMeshes){const v=m.position.clone();let minY=Infinity,minGap=Infinity;for(let i=0;i<m.geometry.attributes.position.count;i++){m.getVertexPosition(i,v);v.applyMatrix4(m.matrixWorld);minY=Math.min(minY,v.y);minGap=Math.min(minGap,v.y-visualY(v.x,v.z,0));}rows.push({name,minY,minGap});}return {rootY:b.machine.position.y,centerGround:visualY(b.machine.position.x,b.machine.position.z,0),rows};});
assert(report.grounding.rows.every(r=>r.minGap>=-.05),JSON.stringify(report.grounding));await shot('working');
await page.evaluate(()=>{const h=window.__GR_TEST__,p=window.__THREE_GAME_DIAGNOSTICS__.oldDiggerBoss.position;h.teleport(p.x,p.z);if(!h.oldDigger.interact())throw Error('board failed');h.advanceSim(.25);if(!h.oldDigger.interact())throw Error('swap failed');});
for(let i=0;i<80;i++){if(await page.evaluate(()=>window.__THREE_GAME_DIAGNOSTICS__.oldDiggerBoss.gentle))break;await page.evaluate(()=>window.__GR_TEST__.advanceSim(.1));}
assert(await page.evaluate(()=>window.__THREE_GAME_DIAGNOSTICS__.oldDiggerBoss.gentle));await shot('gentle');
await Promise.all(downloads);await page.close();
}assert.deepEqual(report.errors,[]);report.completed=true;}catch(e){report.failure=e.stack;throw e;}finally{await writeFile(`${out}/report.json`,JSON.stringify(report,null,2));await browser.close();}
