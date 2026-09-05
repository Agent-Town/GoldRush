import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { preview } from 'vite';
import { chromium } from 'playwright';
export const root=path.resolve(import.meta.dirname,'../..');
export const out=path.join(root,'artifacts/perf-survey');
export const read=async name=>JSON.parse(await fs.readFile(path.join(out,name),'utf8'));
export const write=async(name,data)=>{await fs.mkdir(path.dirname(path.join(out,name)),{recursive:true});await fs.writeFile(path.join(out,name),JSON.stringify(data,null,2)+'\n');};
export const host=()=>({at:new Date().toISOString(),load:os.loadavg(),freeMemory:os.freemem()});
export const stats=values=>{const a=[...values].sort((a,b)=>a-b);return {n:a.length,min:a[0]??null,p50:a[Math.floor((a.length-1)*.5)]??null,p95:a[Math.floor((a.length-1)*.95)]??null,p99:a[Math.floor((a.length-1)*.99)]??null,max:a.at(-1)??null};};
export async function launch(){
  const server=await preview({root,logLevel:'silent',preview:{host:'127.0.0.1',port:5276,strictPort:true}});
  const browser=await chromium.launch({channel:'chromium',headless:true,args:['--enable-precise-memory-info']});
  return {browser,base:'http://127.0.0.1:5276',close:async()=>{await browser.close();await new Promise(r=>server.httpServer.close(r));}};
}
export function observeThree(){
  // three.js's existing devtools observation event; no application module is replaced.
  globalThis.__THREE_DEVTOOLS__=new EventTarget();
  const probe=globalThis.__PERF_SURVEY__={renderer:null,scene:null,camera:null,renderMs:0,firstFrameMs:null};
  __THREE_DEVTOOLS__.addEventListener('observe',({detail:r})=>{
    if(!r.isWebGLRenderer)return;
    const render=r.render;
    r.render=function(scene,camera){
      const start=performance.now();const result=render.call(this,scene,camera);
      if(scene.isScene&&camera.isPerspectiveCamera){
        probe.renderer=r;probe.scene=scene;probe.camera=camera;probe.renderMs=performance.now()-start;
        if(probe.firstFrameMs===null)probe.firstFrameMs=performance.now();
      }
      return result;
    };
  });
}
export async function pageFor(browser,viewport){
  const context=await browser.newContext({viewport,deviceScaleFactor:1});
  await context.addInitScript(observeThree);
  const page=await context.newPage();const errors={console:[],page:[],network:[]};
  page.on('console',m=>{if(m.type()==='error')errors.console.push(m.text());});
  page.on('pageerror',e=>errors.page.push(e.message));
  page.on('requestfailed',r=>errors.network.push({url:r.url(),error:r.failure()?.errorText}));
  return {context,page,errors};
}
export async function boot(page,base,map,tier='full',state='wave1',extra=''){
  if(map.id==='town')await page.addInitScript(()=>history.replaceState({goldRushScene:'town'},'',location.href));
  const params=new URLSearchParams({debug:'',profile:'',tier,seed:'perf-survey-20260905',nopause:'',nolevel:'',nokill:'',nowaves:'',...(map.id==='town'?{}:{contract:map.id,epoch:map.epochId}),...(state==='stress'?{stress:'120',timescale:'3'}:{})});
  await page.goto(`${base}/?${params}${extra}`,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>globalThis.__PERF_SURVEY__?.scene,{timeout:60000});
  if(map.id!=='town'){
    await page.waitForFunction(id=>window.__THREE_GAME_DIAGNOSTICS__?.contract?.activeId===id,map.id,{timeout:60000});
    await page.evaluate(()=>{document.querySelector('[data-testid="contract-briefing-dismiss"]')?.click();window.__GR_TEST__.setBalance('enemy.contactDamage',0);});
    if(state==='wave1')await page.evaluate(()=>window.__GR_TEST__.startWaveForTest(1));
  }
  await page.waitForFunction(()=>{
    const canvas=document.querySelector('#game-canvas');
    return !Object.entries(canvas?.dataset??{}).some(([k,v])=>/State$/.test(k)&&v==='loading');
  },null,{timeout:30000}).catch(()=>{});
  await page.waitForTimeout(2500);
}
export async function sample(page,duration=10000){
  return page.evaluate(duration=>new Promise(resolve=>{
    const rows=[];let previous;let started;
    function tick(now){
      if(started===undefined){started=now;previous=now;requestAnimationFrame(tick);return;}
      const p=__PERF_SURVEY__,r=p.renderer;const d=window.__THREE_GAME_DIAGNOSTICS__;
      rows.push({frameMs:now-previous,renderMs:p.renderMs,calls:r.info.render.calls,triangles:r.info.render.triangles,geometries:r.info.memory.geometries,textures:r.info.memory.textures,programs:r.info.programs?.length??0,heap:performance.memory?.usedJSHeapSize??null,tier:d?.performance?.tier??null,verdict:d?.performance?.runtimeVerdict??null,swaps:d?.spriteStats?.textureSwapsPerFrame??null,animators:d?.spriteStats?.activeAnimators??null});
      previous=now;if(now-started<duration)requestAnimationFrame(tick);else resolve({elapsedMs:now-started,rows});
    }requestAnimationFrame(tick);
  }),duration);
}
export function summarize(sample){return Object.fromEntries(Object.keys(sample.rows[0]).map(key=>[key,typeof sample.rows[0][key]==='number'?stats(sample.rows.map(r=>r[key])):[...new Set(sample.rows.map(r=>r[key]))]]));}
export async function snapshot(page){return page.evaluate(()=>{
  const {renderer:r,scene:s,camera:c,firstFrameMs}=__PERF_SURVEY__;
  s.updateMatrixWorld(true);c.updateMatrixWorld(true);
  const objects=[],textures=new Map(),buffers=new Set();let geometryBytes=0;
  const worldToClip=c.projectionMatrix.clone().multiply(c.matrixWorldInverse);
  const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
  function coverage(o){
    if(!o.isSprite||!visible(o))return null;
    const center=o.position.clone().setFromMatrixPosition(o.matrixWorld);
    const m=o.matrixWorld.elements,cam=c.matrixWorld.elements;
    const sx=Math.hypot(m[0],m[1],m[2]),sy=Math.hypot(m[4],m[5],m[6]);
    const coords=[];
    for(const x of [-.5,.5])for(const y of [-.5,.5])coords.push(center.clone().addScaledVector(center.clone().set(cam[0],cam[1],cam[2]),sx*x).addScaledVector(center.clone().set(cam[4],cam[5],cam[6]),sy*y).project(c));
    if(coords.every(v=>v.z>1||v.z< -1))return 0;
    const xs=coords.map(v=>v.x),ys=coords.map(v=>v.y);
    return Math.max(0,Math.min(1,Math.max(...xs))-Math.max(-1,Math.min(...xs)))*Math.max(0,Math.min(1,Math.max(...ys))-Math.max(-1,Math.min(...ys)))/4;
  }
  s.traverse(o=>{
    if(!o.geometry&&!o.material)return;
    const materials=Array.isArray(o.material)?o.material:[o.material].filter(Boolean);
    const g=o.geometry;
    for(const attribute of g?[...Object.values(g.attributes),g.index,o.instanceMatrix,o.instanceColor].filter(Boolean):[]){const b=attribute.array?.buffer??attribute.data?.array?.buffer;if(b&&!buffers.has(b)){buffers.add(b);geometryBytes+=b.byteLength;}}
    for(const mat of materials){
      for(const [slot,t] of Object.entries(mat))if(t?.isTexture){
        const im=t.source?.data??t.image;const width=im?.width??0,height=im?.height??0;
        const key=[t.source?.uuid??t.uuid,t.wrapS,t.wrapT,t.minFilter,t.magFilter,t.format,t.type,t.colorSpace].join(':');
        if(!textures.has(key))textures.set(key,{name:t.name||o.name||o.parent?.name||o.type,slot,width,height,mipmaps:t.generateMipmaps,estimateBytes:width*height*4*(t.generateMipmaps?4/3:1),source:im?.src??null});
      }
    }
    const row={name:o.name||o.parent?.name||o.type,parent:o.parent?.name,kind:o.isInstancedMesh?'instanced':o.type,visible:visible(o),frustumCulled:o.frustumCulled,instances:o.isInstancedMesh?o.count:1,capacity:o.instanceMatrix?.count??1,triangles:g?(g.index?.count??g.attributes.position?.count??0)/3:2,transparent:materials.some(m=>m.transparent),spriteCoverage:coverage(o),renderOrder:o.renderOrder,geometry:g?.uuid,materials:materials.map(m=>m.uuid)};
    // Clip-frustum intersection is conservative: it does not claim depth/occlusion visibility.
    if(g?.attributes.position&&/terrain/i.test(row.name+' '+row.parent)&&!o.isInstancedMesh){
      const p=g.attributes.position,idx=g.index;const matrix=worldToClip.clone().multiply(o.matrixWorld),e=matrix.elements;
      const clip=i=>{const x=p.getX(i),y=p.getY(i),z=p.getZ(i);return [e[0]*x+e[4]*y+e[8]*z+e[12],e[1]*x+e[5]*y+e[9]*z+e[13],e[2]*x+e[6]*y+e[10]*z+e[14],e[3]*x+e[7]*y+e[11]*z+e[15]];};
      let intersects=0;for(let i=0;i<(idx?.count??p.count);i+=3){const vs=[0,1,2].map(j=>clip(idx?idx.getX(i+j):i+j));let outside=false;for(let a=0;a<3;a++)for(const sign of [-1,1])if(vs.every(v=>sign*v[a]>v[3]))outside=true;if(!outside)intersects++;}
      row.trianglesIntersectingFrustum=intersects;
    }
    objects.push(row);
  });
  const raw=window.__THREE_GAME_DIAGNOSTICS__??window.__GR_TOWN_DIAGNOSTICS__;
  const d=Object.fromEntries(['frame','elapsed','timeAlive','wave','state','enemiesAlive','enemyPoolSize','boltsAlive','xpMotesAlive','stressCount','simulation','performance','renderer','vfx','harvest','harvestVisuals','build','budget','terrain','lighting','spriteStats','camera','contract'].filter(k=>raw?.[k]!==undefined).map(k=>[k,raw[k]]));
  const grouped=new Map();for(const object of objects){const {geometry,materials,spriteCoverage,...record}=object;const key=JSON.stringify(record);const group=grouped.get(key)??{...record,objects:0,spriteCoverage:0};group.objects++;group.spriteCoverage+=spriteCoverage??0;grouped.set(key,group);}

  return {firstFrameMs,renderer:{calls:r.info.render.calls,triangles:r.info.render.triangles,...r.info.memory,programs:r.info.programs.length},camera:{position:c.position.toArray(),fov:c.fov,near:c.near,far:c.far,zoom:c.zoom,projection:c.projectionMatrix.toArray(),world:c.matrixWorld.toArray()},canvas:{width:r.domElement.width,height:r.domElement.height,cssWidth:r.domElement.clientWidth,cssHeight:r.domElement.clientHeight,dpr:devicePixelRatio,dataset:{...r.domElement.dataset}},heap:performance.memory?.usedJSHeapSize??null,gpuEstimate:{textureRgba8MipBytes:[...textures.values()].reduce((s,t)=>s+t.estimateBytes,0),geometryBufferBytes:geometryBytes,formula:'reachable scene textures: width * height * 4 * (generateMipmaps ? 4/3 : 1), deduped by source + sampler; unique geometry ArrayBuffers. Excludes cached/unreachable textures, render targets, driver overhead and depth buffers.'},textures:[...textures.values()].sort((a,b)=>b.estimateBytes-a.estimateBytes),objects:[...grouped.values()],diagnostics:d};
});}
export async function profile(page,ms=5000){const cdp=await page.context().newCDPSession(page);await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:1000});await cdp.send('Profiler.start');await page.waitForTimeout(ms);const {profile}=await cdp.send('Profiler.stop');await cdp.detach();return profile;}
export function topFunctions(profile){
 const weights=new Map();for(let i=0;i<(profile.samples?.length??0);i++)weights.set(profile.samples[i],(weights.get(profile.samples[i])??0)+(profile.timeDeltas?.[i]??0));
 const functions=new Map();for(const n of profile.nodes){const f=n.callFrame,key=[f.functionName,f.url,f.lineNumber,f.columnNumber].join('\\0');const row=functions.get(key)??{name:f.functionName||'(anonymous)',url:f.url,line:f.lineNumber+1,column:f.columnNumber+1,selfMs:0};row.selfMs+=(weights.get(n.id)??0)/1000;functions.set(key,row);}
 return [...functions.values()].sort((a,b)=>b.selfMs-a.selfMs).slice(0,20);
}
