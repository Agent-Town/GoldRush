// Derives every table in docs/reviews/2026-09-05-perf-survey.md from the raw evidence.
// Structural columns (calls, triangles, textures, GPU bytes, instance slots) are host-load
// independent. Frame timings are annotated with the 1-minute load at which they were taken and
// are NEVER presented as a budget: see the load regression this script also computes.
import fs from 'node:fs/promises';
import path from 'node:path';
import {read,write,out,stats} from './browser.mjs';
const census=await read('census.json');
const inventory=await read('inventory.json');
const LOAD_CEILING=12;
const measured=census.rows.filter(r=>r.status==='measured');
const sceneCache=new Map();
async function scene(row){
  if(!row.scenePath)return null;
  if(!sceneCache.has(row.scenePath)){
    try{sceneCache.set(row.scenePath,JSON.parse(await fs.readFile(path.join(out,row.scenePath),'utf8')));}
    catch{sceneCache.set(row.scenePath,null);}
  }
  return sceneCache.get(row.scenePath);
}
const perMap=new Map();
for(const row of measured){
  const s=await scene(row);
  const visible=(s?.objects??[]).filter(o=>o.visible);
  const tri=o=>o.triangles*o.instances*o.objects;
  const record={
    key:row.key,map:row.map,tier:row.tier,view:row.viewport.width===1280?'desktop':'mobile',state:row.state,
    load1:row.before.load[0],loadAfter:row.after.load[0],overCeiling:Math.max(row.before.load[0],row.after.load[0])>LOAD_CEILING,
    callsP95:row.metrics.calls.p95,trianglesP95:row.metrics.triangles.p95,
    geometries:row.metrics.geometries.p95,textures:row.metrics.textures.p95,programs:row.metrics.programs.p95,
    frameP50:row.metrics.frameMs.p50,frameP95:row.metrics.frameMs.p95,frameP99:row.metrics.frameMs.p99,
    framesDelivered:row.metrics.frameMs.n,fpsDelivered:row.metrics.frameMs.n/(row.elapsedMs/1000),
    renderP95:row.metrics.renderMs.p95,heapP95:row.metrics.heap.p95,
    swapsP95:row.metrics.swaps?.p95??null,
    gpuTexMB:s?(s.gpuEstimate.textureRgba8MipBytes/1e6):null,
    gpuGeomMB:s?(s.gpuEstimate.geometryBufferBytes/1e6):null,
    uniqueTextures:s?s.textures.length:null,
    visibleTriangles:s?visible.reduce((a,o)=>a+tri(o),0):null,
    unculledTriangles:s?visible.filter(o=>!o.frustumCulled).reduce((a,o)=>a+tri(o),0):null,
    instanceSlots:s?visible.filter(o=>o.kind==='instanced').reduce((a,o)=>a+o.instances*o.objects,0):null,
    sprites:s?visible.filter(o=>o.kind==='Sprite').reduce((a,o)=>a+o.objects,0):null,
    spriteCoverage:s?visible.filter(o=>o.kind==='Sprite').reduce((a,o)=>a+(o.spriteCoverage??0),0):null,
    consoleErrors:row.errors.console.length,pageErrors:row.errors.page.length,networkErrors:row.errors.network.length,
    dpr:s?.canvas?.dpr??null,canvas:s?`${s.canvas.width}x${s.canvas.height}`:null,
  };
  if(!perMap.has(row.map))perMap.set(row.map,[]);
  perMap.get(row.map).push(record);
}
// Load regression: does host load explain the frame p95 spread?
// frameMs p50 is 8.3 ms in nearly every row: that is the headless rAF pace (120 Hz), not the game.
// The frame-supply signal that survives is DELIVERED FRAMES in the fixed 10 s window.
const points=measured.map(r=>({load:Math.max(r.before.load[0],r.after.load[0]),p95:r.metrics.frameMs.p95,fps:r.metrics.frameMs.n/(r.elapsedMs/1000),render:r.metrics.renderMs.p95,key:r.key}));
const n=points.length,mx=points.reduce((a,p)=>a+p.load,0)/n,my=points.reduce((a,p)=>a+p.p95,0)/n;
const sxy=points.reduce((a,p)=>a+(p.load-mx)*(p.p95-my),0),sxx=points.reduce((a,p)=>a+(p.load-mx)**2,0),syy=points.reduce((a,p)=>a+(p.p95-my)**2,0);
const slope=sxy/sxx,r2=(sxy*sxy)/(sxx*syy);
// Same key measured under different load? Compare identical maps across load bands.
const bands=[[0,12],[12,30],[30,60],[60,200]].map(([lo,hi])=>{
  const inBand=points.filter(p=>p.load>=lo&&p.load<hi);
  return {band:`${lo}-${hi}`,n:inBand.length,frameP95:inBand.length?stats(inBand.map(p=>p.p95)):null,fpsDelivered:inBand.length?stats(inBand.map(p=>p.fps)):null,renderMsP95:inBand.length?stats(inBand.map(p=>p.render)):null};
});
const report={
  at:new Date().toISOString(),loadCeiling:LOAD_CEILING,
  coverage:{expectedMaps:census.expectedMaps.length,mapsMeasured:perMap.size,rows:census.rows.length,measuredRows:measured.length,
    failedRows:census.rows.filter(r=>r.status!=='measured').map(r=>({key:r.key,failure:r.failure})),
    missingMaps:census.expectedMaps.filter(m=>!perMap.has(m))},
  loadRegression:{n,slopeMsPerLoadPoint:slope,r2,meanLoad:mx,meanFrameP95:my,bands,
    note:'Every row is the SAME 10 s window instrument on the SAME build. A positive slope with meaningful r2 means the frame numbers describe the host, not the game.'},
  rowsOverCeiling:measured.filter(r=>Math.max(r.before.load[0],r.after.load[0])>LOAD_CEILING).length,
  frameSupplyCaveat:'frameMs p50 is 8.3 ms in nearly every row = the headless rAF pace. Only delivered-frame count and render-submit CPU carry information, and both moved with host load between 3 and 114 during this survey. No frame number here is a budget.',
  structuralRanking:[...perMap].map(([m,rows])=>{const r=rows.find(x=>x.tier==='full'&&x.view==='desktop'&&x.state==='stress')??rows.find(x=>x.tier==='full'&&x.view==='desktop')??rows[0];return {map:m,callsP95:r.callsP95,trianglesP95:r.trianglesP95,unculledTriangles:r.unculledTriangles,unculledShare:r.visibleTriangles?r.unculledTriangles/r.visibleTriangles:null,instanceSlots:r.instanceSlots,gpuTexMB:r.gpuTexMB,uniqueTextures:r.uniqueTextures,arm:r.key};}).sort((a,b)=>(b.gpuTexMB??0)-(a.gpuTexMB??0)),
  maps:Object.fromEntries([...perMap].map(([m,rows])=>[m,rows])),
};
await write('report.json',report);
const fmt=(v,d=0)=>v===null||v===undefined?'—':Number(v).toFixed(d);
const lines=[];
lines.push('## Per-map render census — structural columns (host-load independent)','',
'| map | epoch | terrain | arm | draw calls p95 | triangles p95 | of which unculled | instance slots | in-frustum-only? | unique tex | GPU tex MB | geom MB | sprites | heap p95 MB | load@sample |',
'|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|');
const epochOf=new Map(inventory.maps.map(m=>[m.id,m.epochId.replace(/^epoch-\d+-/,'')]));
const policyOf=new Map(inventory.maps.map(m=>[m.id,m.terrainPolicy]));
for(const [m,rows] of [...perMap].sort((a,b)=>a[0].localeCompare(b[0])))
 for(const r of rows.filter(r=>r.tier==='full'&&r.view==='desktop').sort((a,b)=>a.state.localeCompare(b.state)))
  lines.push(`| ${m} | ${epochOf.get(m)??'town'} | ${policyOf.get(m)??'—'} | ${r.state} | ${fmt(r.callsP95)} | ${fmt(r.trianglesP95)} | ${fmt(r.unculledTriangles)} | ${fmt(r.instanceSlots)} | — | ${fmt(r.uniqueTextures)} | ${fmt(r.gpuTexMB,1)} | ${fmt(r.gpuGeomMB,1)} | ${fmt(r.sprites)} | ${fmt(r.heapP95/1e6,1)} | ${fmt(r.load1,1)} |`);
await fs.writeFile(path.join(out,'census-table.md'),lines.join('\n')+'\n');
console.log(JSON.stringify({coverage:report.coverage.mapsMeasured+'/'+report.coverage.expectedMaps,rows:report.coverage.measuredRows,
 rowsOverCeiling:report.rowsOverCeiling,
 bands:bands.map(b=>`load ${b.band}: n=${b.n} fps p50=${b.fpsDelivered?b.fpsDelivered.p50.toFixed(0):'—'} renderMs p95 p50=${b.renderMsP95?b.renderMsP95.p50.toFixed(2):'—'}`)},null,1));
console.log('--- structural ranking (full/desktop, worst arm) ---');
for(const r of report.structuralRanking) console.log(String(r.map).padEnd(22),'calls='+String(r.callsP95).padStart(4),'tri='+String(r.trianglesP95).padStart(7),'unculled='+String(Math.round(r.unculledTriangles??0)).padStart(6),(r.unculledShare!==null?(100*r.unculledShare).toFixed(0)+'%':'—').padStart(4),'slots='+String(r.instanceSlots).padStart(5),'tex='+String(r.uniqueTextures).padStart(3),'gpuTexMB='+(r.gpuTexMB??0).toFixed(1).padStart(6));
