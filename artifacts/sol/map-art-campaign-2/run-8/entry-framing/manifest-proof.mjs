import { createServer } from 'vite';
import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const root='artifacts/sol/map-art-campaign-2/run-8/entry-framing', virtual=process.cwd()+'/src/agent/EntryBaselineManifest.ts';
const vite=await createServer({appType:'custom',logLevel:'silent',server:{middlewareMode:true,watch:null},plugins:[{
 name:'entry-baseline-evidence',resolveId(id){if(id==='/src/agent/EntryBaselineManifest.ts')return virtual},load(id){if(id===virtual)return readFileSync(`${root}/baseline-MechanicsManifest.ts`,'utf8')},
}]});
try {
 const {deriveMechanicsManifest:current}=await vite.ssrLoadModule('/src/agent/MechanicsManifest.ts');
 const {deriveMechanicsManifest:baseline}=await vite.ssrLoadModule('/src/agent/EntryBaselineManifest.ts');
 const {listContracts,listEpochs}=await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
 const plans=JSON.parse(readFileSync(`${root}/map-plan.json`)), rows=[];
 for(const contract of listEpochs().flatMap(({id})=>listContracts(id))){
  const before=baseline(contract), after=current(contract), declarations=[];
  for(const rule of after.rules)if('entryLandmark' in rule.data){declarations.push({rule:rule.id,sentence:rule.data.entryLandmark});delete rule.data.entryLandmark;}
  assert.deepEqual(after,before,contract.id+' changes only landmark prose, with all existing rule IDs/data preserved');
  const plan=plans.find(p=>p[0]===contract.id);
  const entry=plan?JSON.parse(readFileSync(`assets/pilots/map-rebuild-spike/${contract.id.split('-').slice(1).join('-')}-terrain-contract.json`)).entryLandmark:undefined;
  assert.equal(declarations.length,entry?1:0,contract.id);
  if(entry)assert.equal(declarations[0].sentence,`This map leads with the ${entry.mountId} landmark.`);
  rows.push({contract:contract.id,declarations,allOtherMechanicsByteIdentical:JSON.stringify(after)===JSON.stringify(before)});
 }
 writeFileSync(`${root}/manifest-proof.json`,JSON.stringify(rows,null,2)+'\n');
} finally {await vite.close()}
