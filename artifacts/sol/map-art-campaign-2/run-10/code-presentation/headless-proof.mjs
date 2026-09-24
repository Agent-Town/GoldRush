import { createServer } from 'vite';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
const root='artifacts/sol/map-art-campaign-2/run-10/code-presentation';
const hash=value=>createHash('sha256').update(typeof value==='string'?value:JSON.stringify(value)).digest('hex');
const quiet=console.log;console.log=()=>{};console.info=()=>{};
const canvas=()=>({width:0,height:0,getContext:()=>new Proxy({createRadialGradient:()=>({addColorStop(){}})}, {get:(o,p)=>o[p]??(()=>{})})});
const documentStub={querySelector:()=>null,createElement:canvas,createElementNS:()=>({addEventListener(){},removeEventListener(){},set src(value){}})};
const rows=[];
const vite0=await createServer({appType:'custom',logLevel:'silent',server:{middlewareMode:true,watch:null}});
const {supportedContractIds}=await vite0.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
const supported=new Set(supportedContractIds());
const {listEpochs,loadEpoch}=await vite0.ssrLoadModule('/src/meta/ContractFamilies.ts');
const ids=listEpochs().flatMap(epoch=>loadEpoch(epoch.id).contracts.map(c=>c.id)).sort();await vite0.close();
for(const id of ids){
 const row={id,arms:{}};
 for(const arm of ['before','after']){
  delete globalThis.document;
  globalThis.location=new URL(`http://gr.local/?debug&contract=${id}&seed=code-presentation&tier=full`);
  globalThis.window={location:globalThis.location,innerWidth:1280,matchMedia:()=>({matches:false}),addEventListener(){},removeEventListener(){}};
  const before=new Map(['Scatter','RailPath'].map(n=>[resolve(`src/world/${n}.ts`),readFileSync(`${root}/baseline-${n}.ts`,'utf8')]));
  const vite=await createServer({appType:'custom',logLevel:'silent',server:{middlewareMode:true,watch:null},plugins:arm==='before'?[{name:'baseline-presentation',enforce:'pre',transform(code,id){return before.get(id.split('?')[0])}}]:[]});
  try{
   const {HeadlessContractSim}=await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
   const {activeContract}=await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
   // The sim resolves the authored manifest independently of URL debug admission.
   const views=[];
   if(supported.has(id)){const sim=new HeadlessContractSim({contractId:id,seed:'code-presentation'});for(let tick=0;tick<=180;tick++){if([0,30,180].includes(tick))views.push(sim.currentTurn().view);if(tick<180)sim.advanceOneTick()}}
   globalThis.document=documentStub;
   const {DetailScatter}=await vite.ssrLoadModule('/src/world/Scatter.ts');
   const {RailPathView}=await vite.ssrLoadModule('/src/world/RailPath.ts');
   const scatter=new DetailScatter(),rails=new RailPathView(activeContract().tileParams.rails??[]);
   const serialize=group=>{const nodes=[];group.traverse(n=>{if(!n.isMesh)return;const m=n.material;nodes.push({name:n.name,count:n.count,visible:n.visible,attributes:Object.fromEntries(Object.entries(n.geometry.attributes).map(([k,a])=>[k,Array.from(a.array)])),index:n.geometry.index?Array.from(n.geometry.index.array):null,matrices:n.instanceMatrix?Array.from(n.instanceMatrix.array):null,colors:n.instanceColor?Array.from(n.instanceColor.array):null,material:{type:m.type,color:m.color?.toArray(),roughness:m.roughness,metalness:m.metalness,side:m.side,transparent:m.transparent,opacity:m.opacity,depthWrite:m.depthWrite},matrix:n.matrix.elements})});return nodes};
   row.arms[arm]={resolved:activeContract().id,view:supported.has(id)?hash(views):null,scatter:hash(serialize(scatter.group)),counts:scatter.diagnostics().classes.map(c=>[c.id,c.instances]),rails:hash(serialize(rails.group)),railPaths:activeContract().tileParams.rails??[],finishing:rails.group.userData.railFinishing??null};
   assert.equal(activeContract().id,id);scatter.dispose();rails.dispose();
  }finally{await vite.close()}
 }
 row.viewIdentical=supported.has(id)?row.arms.before.view===row.arms.after.view:null;
 row.scatterIdentical=row.arms.before.scatter===row.arms.after.scatter;
 row.railsIdentical=row.arms.before.rails===row.arms.after.rails;
 if(supported.has(id))assert.ok(row.viewIdentical,`${id} view drift`);if(id!=='e1-twin-banks')assert.ok(row.scatterIdentical,`${id} scatter drift`);
 assert.deepEqual(row.arms.before.railPaths,row.arms.after.railPaths);
 rows.push(row);writeFileSync(`${root}/headless-proof.json`,JSON.stringify(rows,null,2)+'\n');quiet(id,row.viewIdentical,row.scatterIdentical,row.railsIdentical);
}
