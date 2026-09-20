import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const out='artifacts/boss-fidelity/e10-quiet/lifecycle-v4';await mkdir(out,{recursive:true});
const report={cases:[],errors:[]};const browser=await chromium.launch({headless:true});
try{for(const mode of ['reset','dispose-active','dispose-receded']){
 const page=await browser.newPage();page.on('pageerror',e=>report.errors.push(e.message));
 await page.addInitScript(()=>{performance.setResourceTimingBufferSize(10000);localStorage.clear();});
 await page.goto('http://127.0.0.1:5246/?debug&contract=e10-last-claim&nowaves&nopause&nolevel&tier=full');
 await page.waitForFunction(()=>window.__GR_TEST__);
 const result=await page.evaluate(async mode=>{
  const url=performance.getEntriesByType('resource').map(e=>e.name).find(u=>new URL(u).pathname==='/src/game/Game.ts');
  const {Game}=await import(url),old=Game.prototype.warmCombatPools;
  Game.prototype.warmCombatPools=function(...args){window.__quietGame=this;Game.prototype.warmCombatPools=old;return old.apply(this,args);};
  const h=window.__GR_TEST__;h.setManualSim(true);await h.warmVfx();
  const b=window.__quietGame.e10StaticBoss,c=document.querySelector('canvas');b.reset();c.style.filter='sepia(0.2)';c.style.transition='opacity 2s';
  b.update(.1,1,[{x:0,z:48}]);b.update(4.1,5.1,[{x:0,z:48}]);
  const resources=[];b.group.traverse(m=>{for(const r of [m.geometry,m.material])if(r){const row={events:0};r.addEventListener('dispose',()=>row.events++);resources.push(row);}});
  const active={act:b.diagnostics().act,heart:b.heart.material.uniforms.strength.value,aura:b.auraRing.material.uniforms.strength.value};
  if(mode==='dispose-receded'){for(const x of [-10,0,10])b.tryPreserve({x,z:50},5.1);b.update(3.1,8.2,[]);}
  const before=b.diagnostics();if(mode==='reset')b.reset();else b.dispose();
  return {mode,active,before,after:b.diagnostics(),filter:c.style.filter,transition:c.style.transition,attached:!!b.group.parent,heartVisible:b.heart.visible,resources};
 },mode);
 assert.equal(result.active.act,2);assert.equal(result.active.heart,1);assert.equal(result.active.aura,1);
 if(mode==='reset'){assert.equal(result.after.act,0);assert.equal(result.heartVisible,false);assert.equal(result.filter,'sepia(0.2)');assert(result.resources.every(r=>r.events===0));}
 else {assert.equal(result.attached,false);assert(result.resources.every(r=>r.events===1));assert.equal(result.filter,mode==='dispose-receded'?'grayscale(0)':'sepia(0.2)');}
 if(mode==='dispose-receded')assert.equal(result.before.victory,'receded');else assert.equal(result.transition,'opacity 2s');
 report.cases.push(result);await page.close();
}assert.deepEqual(report.errors,[]);report.completed=true;}catch(e){report.failure=e.stack;throw e;}finally{await writeFile(`${out}/report.json`,JSON.stringify(report,null,2));await browser.close();}
