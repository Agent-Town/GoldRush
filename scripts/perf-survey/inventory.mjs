import fs from 'node:fs/promises';
import path from 'node:path';
import { createServer } from 'vite';
import { gzipSync } from 'node:zlib';
const root = path.resolve(import.meta.dirname, '../..');
const out = path.join(root, 'artifacts/perf-survey');
await fs.mkdir(out, {recursive:true});
const location = new URL('http://gr-sim.local/?debug&contract=the-claim');
globalThis.location = location; globalThis.window = {location};
const vite = await createServer({root,appType:'custom',logLevel:'silent',server:{middlewareMode:true,watch:null}});
try {
  const {listBoardContracts, listEpochs, listContracts} = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
  const contracts = listBoardContracts();
  const epochById = new Map(listEpochs().flatMap(e=>listContracts(e.id).map(c=>[c.id,e.id])));
  const source = await fs.readFile(path.join(root,'src/world/Terrain3dClaimPilot.ts'),'utf8');
  const models = Object.fromEntries([...source.matchAll(/'([^']+)': entry\(new URL\('\.\.\/\.\.\/([^']+)'/g)].map(m=>[m[1],m[2]]));
  async function filesUnder(dir) { const entries=await fs.readdir(dir,{withFileTypes:true}); return (await Promise.all(entries.map(e=>e.isDirectory()?filesUnder(path.join(dir,e.name)):path.join(dir,e.name)))).flat(); }
  const files=await Promise.all((await filesUnder(path.join(root,'dist'))).map(async file=>({path:path.relative(root,file),bytes:(await fs.stat(file)).size,...(/\.js$/.test(file)?{gzipBytes:gzipSync(await fs.readFile(file)).length}:{})})));
  const maps=await Promise.all(contracts.map(async c=>{
    const model=models[c.id];
    const terrainStem=model?path.basename(model,'-terrain.glb'):null;
    const terrainContract=model?JSON.parse(await fs.readFile(path.join(root,model.replace('.glb','-contract.json')),'utf8')):null;
    const landmarkSources=(terrainContract?.landmarkMounts??[]).map(m=>m.asset).filter(Boolean);
    const stems=[...(terrainStem?[terrainStem+'-terrain',terrainStem+'-panorama']:[]),...landmarkSources.map(s=>path.basename(s,'.glb'))];
    const assets=files.filter(f=>f.path.endsWith('.glb')&&stems.some(stem=>path.basename(f.path).replace(/-[\w-]{8}(?:-diet-[a-f0-9]{8})?\.glb$/, '')===stem));
    return {id:c.id,epochId:epochById.get(c.id),tileId:c.tileParams.tileId,terrainPolicy:c.tileParams.render?.terrainMesh??'default',terrainSource:model??null,landmarkSources,landmarkMounts:terrainContract?.landmarkMounts?.length??0,mapModelBytes:assets.reduce((s,f)=>s+f.bytes,0),assets,manifest:c};
  }));
  const e1=maps.filter(m=>m.epochId==='epoch-1-frontier');
  const priority=[...new Set([...maps.filter(m=>['required','preferred'].includes(m.terrainPolicy)).sort((a,b)=>b.mapModelBytes-a.mapModelBytes).slice(0,14).map(m=>m.id),...e1.map(m=>m.id),'town'])];
  const result={at:new Date().toISOString(),maps,priority,dist:{files:files.length,bytes:files.reduce((s,f)=>s+f.bytes,0),top20Chunks:files.filter(f=>f.gzipBytes).sort((a,b)=>b.bytes-a.bytes).slice(0,20),all:files}};
  await fs.writeFile(path.join(out,'inventory.json'),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify({maps:maps.length,priority,distBytes:result.dist.bytes,distFiles:files.length}));
} finally {await vite.close();}
