import {parseArgs} from 'node:util';
import {launch,pageFor,boot,sample,snapshot,summarize,profile,topFunctions,read,write,host} from './browser.mjs';
const {values}=parseArgs({options:{map:{type:'string'},rounds:{type:'string',default:'3'}}});
const census=await read('census.json'),inventory=await read('inventory.json');
const worst=census.rows.filter(r=>r.status==='measured'&&r.tier==='full'&&r.viewport.width===1280&&r.state==='stress').sort((a,b)=>b.metrics.calls.p95-a.metrics.calls.p95||b.metrics.renderMs.p95-a.metrics.renderMs.p95).slice(0,6).map(r=>r.map);
const ids=values.map?values.map.split(','):worst;
const env=await launch(),result={at:new Date().toISOString(),ranking:'six highest full desktop stress draw-call p95, render-submit CPU p95 breaks ties; draw count is robust to host frame-supply noise',maps:[]};
try{
 for(const id of ids){
  const map=inventory.maps.find(m=>m.id===id);const {page,context,errors}=await pageFor(env.browser,{width:1280,height:800});
  const record={id,errors,host:host(),arms:[]};
  try{
   await boot(page,env.base,map,'full','stress');
   const cpu=await profile(page,5000);record.profile=`profiles/${id}-chrome.cpuprofile`;await write(record.profile,cpu);record.top20=topFunctions(cpu);
   record.scene=await snapshot(page);
   await page.evaluate(()=>window.__GR_TEST__.setManualSim(true));
   const cdp=await context.newCDPSession(page);await cdp.send('Performance.enable');
   async function measure(){const a=await cdp.send('Performance.getMetrics');const s=await sample(page,1500);const b=await cdp.send('Performance.getMetrics');const get=(r,n)=>r.metrics.find(v=>v.name===n)?.value??0;return {metrics:summarize(s),elapsedMs:s.elapsedMs,mainThreadCpuMsPerFrame:(get(b,'TaskDuration')-get(a,'TaskDuration'))*1000/s.rows.length};}
   const modes=['scatter','water','shadows','vfx','sprites','hud',...record.scene.objects.filter(o=>o.visible&&o.name.startsWith('DetailScatter.')&&!o.name.includes('contact')).map(o=>`class:${o.name}`)];
   for(const mode of [...new Set(modes)])for(let round=0;round<Number(values.rounds);round++){
    const baseline=await measure();
    const changed=await page.evaluate(mode=>{
      const p=__PERF_SURVEY__;p.restore=[];const names=[];
      if(mode==='shadows'){const old=p.renderer.shadowMap.enabled;p.renderer.shadowMap.enabled=false;p.restore.push(()=>p.renderer.shadowMap.enabled=old);names.push('renderer.shadowMap.enabled');}
      else if(mode==='hud'){const elements=[...document.body.querySelectorAll('*')].filter(e=>!e.contains(p.renderer.domElement)&&e!==p.renderer.domElement&&e.parentElement?.contains(p.renderer.domElement));for(const e of elements){const old=e.style.visibility;e.style.visibility='hidden';p.restore.push(()=>e.style.visibility=old);}names.push(...elements.map(e=>e.id||e.className||e.tagName));}
      else p.scene.traverse(o=>{
        const label=o.name||'';
        const yes=mode==='scatter'?label==='DetailScatter':mode.startsWith('class:')?label===mode.slice(6):mode==='water'?(/Water|water|SpringPondLiveSurface/.test(label)&&!(/Depth|Damp|Reed|Collar/.test(label))):mode==='sprites'?o.isSprite:mode==='vfx'?(o.isPoints||o.renderOrder===3):false;
        if(yes&&o.visible){o.visible=false;p.restore.push(()=>o.visible=true);names.push(label||o.type);}
      });return names;
    },mode);
    await page.waitForTimeout(500);const off=await measure();
    await page.evaluate(()=>{for(const restore of __PERF_SURVEY__.restore)restore();delete __PERF_SURVEY__.restore;});await page.waitForTimeout(250);
    record.arms.push({mode,round,changed,baseline,off,renderCpuMedianSavingMs:baseline.metrics.renderMs.p50-off.metrics.renderMs.p50,mainThreadSavingMs:baseline.mainThreadCpuMsPerFrame-off.mainThreadCpuMsPerFrame,callsSaved:baseline.metrics.calls.p50-off.metrics.calls.p50});
   }
   // Existing terrain2d flag changes the complete terrain installation, so report separately.
   await cdp.detach();await context.close();
   for(const extra of ['','&terrain2d']){
    const arm=await pageFor(env.browser,{width:1280,height:800});await boot(arm.page,env.base,map,'full','stress',extra);
    const measured=await sample(arm.page,5000);record.arms.push({mode:extra?'terrain2d':'terrain3d',metrics:summarize(measured),errors:arm.errors});await arm.context.close();
   }
   record.status='measured';
  }catch(e){record.status='failed';record.failure=String(e);await context.close().catch(()=>{});}
  record.after=host();result.maps.push(record);await write('attribution.json',result);console.log(`${id}: ${record.status}, ${record.arms.length} arms`);
 }
}finally{await env.close();}
