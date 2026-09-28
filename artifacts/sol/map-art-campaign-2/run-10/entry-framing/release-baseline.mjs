// Attribution only: build with the two pre-task TS modules, then run the unchanged
// release assertion in an isolated dist root. Shared contracts differ only in entry metadata.
import { build, loadConfigFromFile } from 'vite';
import { readFileSync, writeFileSync, mkdirSync, symlinkSync, readdirSync, rmSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const root=resolve('artifacts/sol/map-art-campaign-2/run-10/entry-framing');
const control=join(root,'release-baseline-control');
const replacements=new Map([
 ['src/systems/CameraRig.ts','CameraRig'],['src/agent/MechanicsManifest.ts','MechanicsManifest'],
].map(([path,name])=>[resolve(path),readFileSync(join(root,`baseline-${name}.ts`),'utf8')]));
const override=()=>({name:'entry-pre-task-build-source',enforce:'pre',transform(code,id){return replacements.get(id.split('?')[0]);}});
const base=(await loadConfigFromFile({command:'build',mode:'production'},resolve('vite.config.ts'))).config;
const receipt={sourceBaseline:JSON.parse(readFileSync(join(root,'preflight.json'))).lane,
 overriddenFiles:[...replacements.keys()],contractMetadata:'Current paired entry metadata; all other contract and binary data verified unchanged.',
 buildExit:null,assertionExit:null};
mkdirSync(control);symlinkSync(resolve('assets'),join(control,'assets'),'dir');
symlinkSync(resolve('src'),join(control,'src'),'dir');
try{
 await build({...base,configFile:false,plugins:[override(),...base.plugins],
  worker:{...base.worker,plugins:()=>[override(),...base.worker.plugins()]},
  build:{...base.build,outDir:join(control,'dist'),emptyOutDir:true},
 });
 receipt.buildExit=0;
 const emitted=readdirSync(join(control,'dist/assets')).filter(name=>name.startsWith('motor-hauler-'));
 receipt.motorHaulerAssets=emitted.map(name=>({name,sha256:createHash('sha256').update(readFileSync(join(control,'dist/assets',name))).digest('hex')}));
 if(process.argv.includes('--browser')){
  const diet=spawnSync(process.execPath,[resolve('scripts/asset-diet.mjs')],{cwd:control,encoding:'utf8',env:process.env,maxBuffer:10_000_000});
  writeFileSync(join(root,'release-baseline-diet.log'),diet.stdout+diet.stderr);
  receipt.dietExit=diet.status;
  if(diet.status!==0)throw new Error('Control asset diet failed');
 }
 const check=spawnSync(process.execPath,[resolve('scripts/assert-release-build.mjs')],{cwd:control,encoding:'utf8',env:process.env});
 receipt.assertionExit=check.status;receipt.assertionOutput=check.stdout+check.stderr;
 console.log(receipt.assertionOutput);
 receipt.matchesCandidateFailure=check.status===1&&receipt.assertionOutput.includes('later plate/GLB assets emitted: motor-hauler-');
 if(!receipt.matchesCandidateFailure)throw new Error('Release blocker was not reproduced at the pre-task source');
 console.log('ATTRIBUTED: unchanged release assertion finds the same motor-hauler leak with pre-task source.');
 if(process.argv.includes('--browser')){
  const command=['playwright','test','--workers=1','--project=desktop-chrome','--project=mobile-chrome',
   '--trace=off','--reporter=line',`--config=${root}/release.config.ts`,
   `--output=${root}/e7-relay-rush/release-base-results`,'e2e/release-build.spec.ts:24'];
  const test=spawnSync('npx',command,{encoding:'utf8',env:{...process.env,GR_ENTRY_RELEASE_BASELINE:'1',
   GR_CAPTURE_EXTERNAL_SERVER:'1',GR_CAPTURE_BASE_URL:'http://127.0.0.1:5303'},maxBuffer:10_000_000});
  writeFileSync(join(root,'release-baseline-browser.log'),test.stdout+test.stderr);
  receipt.browser={command,exit:test.status,log:'release-baseline-browser.log'};
  console.log('First-player release control exit',test.status);
 }
}finally{
 writeFileSync(join(root,'release-baseline.json'),JSON.stringify(receipt,null,2)+'\n');
 rmSync(control,{recursive:true,force:true});
}
