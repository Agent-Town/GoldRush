import { createServer } from 'vite';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root='artifacts/sol/map-art-campaign-2/run-10/entry-framing';
const preflight=JSON.parse(readFileSync(`${root}/preflight.json`));
const base=process.argv.includes('--baseline'), overrides=new Map();
if(base){
  for(const [path,name] of [['src/systems/CameraRig.ts','CameraRig'],['src/agent/MechanicsManifest.ts','MechanicsManifest']])
    overrides.set(resolve(path),readFileSync(`${root}/baseline-${name}.ts`,'utf8'));

}
const server=await createServer({server:{port:5303,strictPort:true},plugins:[{
  name:'entry-evidence-baseline',enforce:'pre',transform(code,id){return overrides.get(id.split('?')[0])},
}]});
await server.listen();
writeFileSync(`${root}/server-${base?'baseline':'current'}-receipt.json`,JSON.stringify({baseline:base,laneBase:preflight.lane,storeBase:preflight.store,overriddenFiles:[...overrides.keys()]},null,2)+'\n');
server.printUrls();
