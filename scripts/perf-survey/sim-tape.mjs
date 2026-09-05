import fs from 'node:fs/promises';
import path from 'node:path';
import {Session} from 'node:inspector/promises';
import {createServer} from 'vite';
import {read,write,root,stats,topFunctions,host} from './browser.mjs';
const tapePath=process.argv[2],key=process.argv[3];if(!tapePath||!key)throw new Error('Usage: sim-tape.mjs <artifact-relative tape> <key>');
const tape=await read(tapePath),before=host();
const location=new URL(`http://gr-sim.local/?debug&contract=${tape.contract}&seed=${tape.seed}`);globalThis.location=location;globalThis.window={location};
const vite=await createServer({root,appType:'custom',logLevel:'silent',server:{middlewareMode:true,watch:null}});
try{
 const {AgentTapeReplaySession}=await vite.ssrLoadModule('/src/replay/AgentTapeReplay.ts');
 const start=performance.now();const replay=new AgentTapeReplaySession(tape);const bootMs=performance.now()-start;
 const inspector=new Session();inspector.connect();await inspector.post('Profiler.enable');await inspector.post('Profiler.setSamplingInterval',{interval:1000});await inspector.post('Profiler.start');
 const tickMs=[];const begun=performance.now();
 while(!replay.complete&&tickMs.length<tape.inputLog.durationTicks+18000){const t=performance.now();replay.advanceOneTick();tickMs.push(performance.now()-t);}
 const replayMs=performance.now()-begun;const {profile}=await inspector.post('Profiler.stop');inspector.disconnect();
 const result=replay.result();const tickPath=`sim/${key}-ticks.json`;await write(tickPath,tickMs);await write(`profiles/${key}-ticks.cpuprofile`,profile);
 const measured={key,tapePath,contract:tape.contract,kind:key.startsWith('idle-')?'null-floor':'county-played',node:process.version,before,after:host(),declaredDurationTicks:tape.inputLog.durationTicks,simulatedSeconds:result.ticks/30,bootMs,replayMs,ticksPerSecond:result.ticks/(replayMs/1000),realtimeMultiple:result.ticks/30/(replayMs/1000),estimateTenMinuteSeconds:600/(result.ticks/30/(replayMs/1000)),estimateFormula:'600 seconds / measured realtimeMultiple; extrapolation, not an actual 10-minute tape when duration differs',tickMs:stats(tickMs),tickPath,result,expectedHash:tape.eventLogHash,hashMatches:result.eventLogHash===tape.eventLogHash,top20:topFunctions(profile)};
 await write(`sim/${key}.json`,measured);console.log(JSON.stringify({key,replayMs,ticks:result.ticks,p95:measured.tickMs.p95,hashMatches:measured.hashMatches}));
}finally{await vite.close();}
