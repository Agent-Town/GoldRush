import { readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { ENGINE_SOURCE_INPUTS, computeEngineHash } from '../../../../../scripts/assay-replay-agent.mjs';
const root='artifacts/sol/map-art-campaign-2/run-10/code-presentation',files=[];
async function collect(dir){for(const e of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())await collect(p);else if(e.isFile()&&/\.(json|mjs|ts)$/.test(e.name))files.push(p)}}
for(const input of ENGINE_SOURCE_INPUTS){if(path.extname(input))files.push(input);else await collect(input)}files.sort();
const sourceMap={'src/world/Scatter.ts':'Scatter.ts','src/world/RailPath.ts':'RailPath.ts','src/game/Game.ts':'Game.ts'};
const before=createHash('sha256'),after=createHash('sha256'),unchanged=createHash('sha256');
const stages=[createHash('sha256'),createHash('sha256')];
const storeBefore=execFileSync('git',['-C','assets/pilots','rev-parse','HEAD'],{encoding:'utf8'}).trim();
for(const file of files){const bytes=await readFile(file);after.update(`${file}\0${bytes.length}\0`).update(bytes);
 if(file==='src/systems/RelaySignalPresentation.ts')continue;
 const old=sourceMap[file]?await readFile(`${root}/baseline-${sourceMap[file]}`):bytes;
 before.update(`${file}\0${old.length}\0`).update(old);
 for(const [i,stage] of stages.entries()){const staged=(file==='src/world/Scatter.ts'||(i===1&&file==='src/world/RailPath.ts'))?bytes:old;stage.update(`${file}\0${staged.length}\0`).update(staged)}
 if(!sourceMap[file])unchanged.update(`${file}\0${bytes.length}\0`).update(bytes);
}
const data={method:'Same immutable bytes per shared corpus entry; before substitutes saved preflight sources and omits the new presentation owner. No file is restored in the worktree.',storeBefore,storeAfter:execFileSync('git',['-C','assets/pilots','rev-parse','HEAD'],{encoding:'utf8'}).trim(),before:before.digest('hex'),after:after.digest('hex'),untouchedCorpus:unchanged.digest('hex'),files:files.length,computedAfter:await computeEngineHash(process.cwd())};
const stageHashes=stages.map(stage=>stage.digest('hex'));
data.maps=[{id:'e1-twin-banks',before:data.before,after:stageHashes[0]},{id:'e2-trestle',before:stageHashes[0],after:stageHashes[1]},{id:'e7-relay-rush',before:stageHashes[1],after:data.after}];
await writeFile(`${root}/hash-pair.json`,JSON.stringify(data,null,2)+'\n');console.log(data);
