// Reproduce only the resolver's treatment of inherited Object.prototype names.
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import ts from 'typescript';
const source='src/world/LandmarkCollision.ts';
const registry=readFileSync('assets/pilots/map-rebuild-spike/landmark-collision-contract.json','utf8');
async function resolver(text){
 text=text.replace(/^import registryText from .*;$/m,`const registryText = ${JSON.stringify(registry)};`).replace(/^export \{.*\} from '\.\/depenetrate';$/m,'');
 const js=ts.transpileModule(text,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
 return (await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'))).landmarkBlockersFor;
}
const rows=[];
const ids=[...Object.keys(JSON.parse(readFileSync('artifacts/sol/map-art-campaign-2/run-7/unaffected-blockers-before.json','utf8'))),'e6-picnic','e7-dead-band','e7-relay-rush','e8-far-side'];
for(const [arm,text] of [['base',execFileSync('git',['show','823b06b1dce4b861be2fccf646245fc4cc864588:'+source],{encoding:'utf8'})],['candidate',readFileSync(source,'utf8')]]){
 const run=await resolver(text);
 if(arm==='candidate')writeFileSync('artifacts/sol/map-art-campaign-2/run-7/registered-results-'+process.argv[2]+'.json',JSON.stringify(Object.fromEntries(ids.map(id=>[id,run(id)])),null,2)+'\n');
 for(const id of ['constructor','__proto__','toString']){
  try{rows.push({arm,id,result:run(id)})}catch(e){rows.push({arm,id,error:e.message})}
 }
}
writeFileSync('artifacts/sol/map-art-campaign-2/run-7/prototype-compatibility-'+process.argv[2]+'.json',JSON.stringify(rows,null,2)+'\n');
console.log(JSON.stringify(rows));
