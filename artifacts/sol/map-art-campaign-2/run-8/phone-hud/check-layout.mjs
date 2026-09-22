import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
const out='artifacts/sol/map-art-campaign-2/run-8/phone-hud';
const browser=await chromium.launch({channel:'chromium'}), rows=[];
try {
 for (const [width,height,contract,epoch] of [[390,844,'e7-dead-band','epoch-7-signal'],[430,932,'e8-low-orbit','epoch-8-orbital'],[390,844,'e10-archive-world','epoch-10-deepsky']]) {
  const page=await browser.newPage({viewport:{width,height},hasTouch:true,isMobile:true,deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await page.goto(`http://127.0.0.1:5312/?debug&nowaves&nokill&nolevel&epoch=${epoch}&contract=${contract}&seed=phone-hud-fit`);
  await page.waitForFunction(()=>window.__GR_TEST__ && document.querySelector('#game-canvas')?.dataset.terrain3dPilotLandmarkLoadState==='mounted');
  assert.equal(await page.evaluate(()=>window.__THREE_GAME_DIAGNOSTICS__.contract.activeId),contract);
  const begin=page.getByTestId('contract-briefing-dismiss');if(await begin.isVisible())await begin.click();
  await page.evaluate(()=>window.__GR_TEST__.setManualSim(true));
  // Dismiss narrative through its existing click affordance before checking control hit targets.
  if(await page.getByTestId('story-beat-card').isVisible().catch(()=>false))await page.mouse.click(6,350);
  // Keep the debug dock visible for this check: it used to intercept the new top-right Pause.
  await page.getByTestId('hud-pause').tap();await page.waitForFunction(()=>document.querySelector('#hud').dataset.paused==='true');
  await page.getByTestId('hud-pause').tap();await page.waitForFunction(()=>document.querySelector('#hud').dataset.paused==='false');
  await page.evaluate(()=>window.__GR_GUI__?.hide());
  const targets=await page.evaluate(()=>[...document.querySelectorAll('#hud button,#hud summary,#touch-controls button,#touch-stick')].flatMap(el=>{
   const b=el.getBoundingClientRect(),s=getComputedStyle(el);if(!el.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})||!b.width||!b.height||s.visibility==='hidden'||s.display==='none')return [];
   const hit=document.elementFromPoint(b.x+b.width/2,b.y+b.height/2);
   return [{id:el.dataset.testid||el.id||el.className||el.textContent.trim(),box:{x:b.x,y:b.y,width:b.width,height:b.height},reachable:!!hit&&(hit===el||el.contains(hit))}];
  }));
  for(const t of targets){assert.ok(t.box.width>=44&&t.box.height>=44,`${t.id} target ${JSON.stringify(t.box)}`);assert.ok(t.reachable,`${t.id} occluded`);assert.ok(t.box.x>=0&&t.box.y>=0&&t.box.x+t.box.width<=width+.5&&t.box.y+t.box.height<=height+.5,`${t.id} outside viewport`)}
  const resourceFit=await page.evaluate(()=>[...document.querySelectorAll('.hud-panel--resource')].flatMap(panel=>{
   const p=panel.getBoundingClientRect();if(!p.width||!p.height)return [];
   const text=[...panel.querySelectorAll('.hud-label,.hud-value,.hud-pressure-uses')].flatMap(el=>{
    const b=el.getBoundingClientRect();if(!b.width||!b.height||!el.textContent.trim())return [];
    const range=document.createRange();range.selectNodeContents(el);const r=range.getBoundingClientRect();
    return [{text:el.textContent.trim(),x:r.x,y:r.y,right:r.right,bottom:r.bottom}];
   });
   return [{id:panel.dataset.testid,text,inside:text.every(r=>r.x>=p.x&&r.right<=p.right+.5&&r.y>=p.y&&r.bottom<=p.bottom+.5),overlap:text.some((a,i)=>text.slice(i+1).some(b=>Math.min(a.right,b.right)-Math.max(a.x,b.x)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y)>1))}];
  }));
  for(const r of resourceFit){assert.ok(r.inside,`${r.id} text outside panel`);assert.ok(!r.overlap,`${r.id} resource text overlaps: ${JSON.stringify(r.text)}`)}
  await page.getByTestId('hud-build').tap();await page.getByTestId('hud-build-menu').waitFor({state:'visible'});await page.getByTestId('hud-build').tap();
  await page.getByTestId('hud-agent').tap();await page.getByTestId('prospector-panel').waitFor({state:'visible'});await page.getByLabel('Close Prospector ledger').tap();
  if(contract==='e7-dead-band'){
   await page.getByTestId('e7-jack-board').locator('summary').tap();await page.getByTestId('e7-board-close').waitFor({state:'visible'});await page.getByTestId('e7-board-close').tap();
  }
  await page.screenshot({path:`${out}/controls-${contract}-${width}.png`});
  // Diagnostic DOM clone: stress text fit without changing a game's values or value sources.
  const fit=await page.evaluate(()=>{
   const hud=document.querySelector('#hud');hud.replaceWith(hud.cloneNode(true));
   const values={'data-hud-hp':'999 / 999','data-hud-gold':'9999/9999','data-hud-xp':'9999 / 9999 XP','data-hud-level':'99','data-hud-wave-number':'99','data-hud-time':'99:59','data-hud-suit-air':'999s','data-hud-agent-name':'the Prospector','data-hud-agent-level':'L3','data-hud-agent-label':'approval-required'};
   const rows=[];
   for(const [attribute,text] of Object.entries(values)){
    const el=document.querySelector(`#hud [${attribute}]`);if(!el)continue;el.textContent=text;const b=el.getBoundingClientRect();if(!b.width||!b.height)continue;
    const range=document.createRange();range.selectNodeContents(el);const glyph=range.getBoundingClientRect();const panel=el.closest('.hud-agent-chip,.hud-panel').getBoundingClientRect();
    rows.push({attribute,text,insidePanel:glyph.x>=panel.x&&glyph.right<=panel.right+.5&&glyph.y>=panel.y&&glyph.bottom<=panel.bottom+.5});
   }
   return rows;
  });
  for(const f of fit)assert.ok(f.insidePanel,`${f.attribute} clips ${f.text}`);
  await page.screenshot({path:`${out}/diagnostic-high-values-${contract}-${width}.png`});
  assert.deepEqual(errors,[]);rows.push({width,height,contract,targets,resourceFit,fit,errors});await page.close();
 }
}finally{await browser.close();writeFileSync(`${out}/layout-check.json`,JSON.stringify(rows,null,2)+'\n')}
console.log('PASS: 390/430 touch reachability, existing panels, pause/resume and high values');
