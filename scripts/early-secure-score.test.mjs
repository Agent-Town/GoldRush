import assert from 'node:assert/strict';
import test from 'node:test';
import {createServer} from 'vite';
const vite=await createServer({appType:'custom',logLevel:'silent',server:{middlewareMode:true,watch:null}});
let RunManager;
try {({RunManager}=await vite.ssrLoadModule('/src/game/RunManager.ts'));} finally {await vite.close();}
for (const [label,wave,securedAt,expected] of [['early boss',8,8,8],['later banking',16,12,16],['missing live wave',undefined,8,8],['storm counter uses secured wave',0,12,12]]) {
 test(`${label} banks reached waves, not the configured wave12 target`,()=>{
  const manager=Object.create(RunManager.prototype);let ended;
  Object.assign(manager,{runId:1,securedRunId:1,endedRunId:0,securedAtWave:securedAt,storage:null,
   options:{onRunEnded:event=>{ended=event;}},
   host:{wave:()=>wave,secureWave:()=>12,at:()=>250,economy:{log:[]},contract:()=>null,events:{emit:()=>{}}},
   awardSecuredClaim(){},hideSecureOverlay(){},hideSecuredChip(){},
  });
  assert.equal(manager.endSecuredRun(),true);
  assert.equal(ended.summary.wavesSurvived,expected);
  assert.equal(ended.summary.deepestWave,expected);
  assert.equal(ended.summary.secureWaveReached,securedAt);
 });
}
