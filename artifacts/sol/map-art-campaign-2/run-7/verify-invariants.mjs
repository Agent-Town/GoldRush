import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createServer} from 'vite';
import {createHash} from 'node:crypto';
const id=process.argv[2],out=`artifacts/sol/map-art-campaign-2/run-7/${id}`,base=JSON.parse(fs.readFileSync(`${out}/base.json`)),config=JSON.parse(fs.readFileSync(`${out}/capture-config.json`));
const root='assets/pilots/map-rebuild-spike',store='/Users/robin/Claude/Projects/GoldRush-assets';
const old=rel=>execFileSync('git',['-C',store,'show',`${base.store}:pilots/map-rebuild-spike/${rel}`],{maxBuffer:64*1024*1024});
const read=rel=>fs.readFileSync(`${root}/${rel}`),hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const unchanged={};
for(const rel of ['landmark-collision-contract.json',`${config.parent}-terrain-contract.json`,`${config.parent}-panorama-contract.json`,`${config.parent}-terrain.glb`,`${config.parent}-panorama.glb`,`landmarks/${config.parent}/${config.parent}-landmark-pack-contract.json`]){assert.deepEqual(read(rel),old(rel));unchanged[rel]=hash(read(rel))}
const terrain=JSON.parse(read(`${config.variant}-terrain-contract.json`)),pack=JSON.parse(read(`landmarks/${config.variant}/${config.variant}-landmark-pack-contract.json`));
assert.deepEqual(terrain.landmarkMounts,pack.mounts);
const own=JSON.parse(read('landmark-collision-contract.json')).maps[config.variant];
for(const [rel,key]of [[`${config.variant}-terrain-contract.json`,'landmarkMounts'],[`landmarks/${config.variant}/${config.variant}-landmark-pack-contract.json`,'mounts']]){
 const before=JSON.parse(old(rel)),after=JSON.parse(read(rel));
 for(const mount of after[key]){const previous=before[key].find(m=>m.id===mount.id),record=own.find(r=>r.id===mount.id);if(record){assert.deepEqual(mount.contractIds,[id]);assert.deepEqual([mount.position[0],mount.position[2]],record.position);assert.deepEqual(mount.rotation,[0,record.rotation,0]);assert.deepEqual([mount.scale[0],mount.scale[2]],record.scale);assert.deepEqual(pack.assets[mount.id].footprint,record.footprint)}assert.deepEqual({...mount,contractIds:previous.contractIds},previous)}
 delete before.mountInterlock;delete after.mountInterlock;after[key]=before[key];assert.deepEqual(after,before);
}
for(const asset of Object.values(pack.assets)){assert.deepEqual(read(asset.asset),old(asset.asset));unchanged[asset.asset]=hash(read(asset.asset))}
assert.ok(fs.existsSync(`${root}/${terrain.landmarkPack.atlas}`));
const vite=await createServer({server:{middlewareMode:true,watch:null},appType:'custom',logLevel:'silent'});
try{const {landmarkBlockersFor}=await vite.ssrLoadModule('/src/world/LandmarkCollision.ts');const unaffected=JSON.parse(fs.readFileSync('artifacts/sol/map-art-campaign-2/run-7/unaffected-blockers-before.json'));for(const [contract,blockers]of Object.entries(unaffected))assert.deepEqual(landmarkBlockersFor(contract),blockers,contract)}finally{await vite.close()}
fs.writeFileSync(`${out}/invariants.json`,JSON.stringify({registryUnchanged:true,parentUnchanged:true,transformsUnchanged:true,mirroredMounts:true,onlySelectionAndInterlockChanged:true,allOtherBlockerResultsUnchanged:true,atlasExists:true,unchangedSha256:unchanged},null,2)+'\n');console.log(id,'PASS: exact transforms, unchanged parent/registry/assets, mirrored selection, unaffected map results');
