#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
const child=spawn(process.execPath,['scripts/gr-sim.mjs','--contract','e1-twin-banks','--seed','e1-twin-banks-01'],{cwd:new URL('.',import.meta.url),stdio:['pipe','pipe','inherit']});
const rl=createInterface({input:child.stdout,crlfDelay:Infinity});
const upgradePriority=['tinkers_plating','field_dressing','wide_ring','powder_charge','quick_fuse','beacon_dynamo','pan_legend','prospectors_luck','split_spark','heavy_spark','double_tap_coil','long_resonator','spring_heels','assay_bonus','sharpen'];
let seamLocations=null;
const goals=[
 {what:'sentry_beacon',pos:{x:0,z:-8},cost:25,rot:0},
 {what:'palisade',pos:{x:-2,z:-10},cost:10,rot:1},{what:'palisade',pos:{x:2,z:-10},cost:10,rot:1},
 {what:'palisade',pos:{x:-2,z:-14},cost:10,rot:1},{what:'palisade',pos:{x:2,z:-14},cost:10,rot:1},
 {what:'palisade',pos:{x:-4,z:-12},cost:10,rot:0},{what:'palisade',pos:{x:4,z:-12},cost:10,rot:0},
 {what:'sluice',pos:{x:-1.5,z:-7},cost:40,rot:0},
 {what:'turret',pos:{x:-8,z:-12},cost:50,rot:0},{what:'turret',pos:{x:8,z:-12},cost:70,rot:0},
 {what:'turret',pos:{x:0,z:-18},cost:95,rot:0},{what:'turret',pos:{x:-8,z:-20},cost:125,rot:0},
 {what:'sentry_beacon',pos:{x:-6,z:-16},cost:35,rot:0},{what:'sentry_beacon',pos:{x:6,z:-16},cost:45,rot:0},
 {what:'sentry_beacon',pos:{x:0,z:-22},cost:55,rot:0},{what:'sentry_beacon',pos:{x:-5,z:-8},cost:75,rot:0},{what:'sentry_beacon',pos:{x:5,z:-8},cost:95,rot:0},
];
function choose(v){const ids=v.now.pendingOffer.map(x=>x.id); if(v.now.hero.hp<=55&&ids.includes('field_dressing'))return'field_dressing'; if(v.now.hero.hp<=82&&ids.includes('tinkers_plating'))return'tinkers_plating'; return ids.slice().sort((a,b)=>(upgradePriority.indexOf(a)<0?999:upgradePriority.indexOf(a))-(upgradePriority.indexOf(b)<0?999:upgradePriority.indexOf(b)))[0];}
function present(v,g){return v.now.works.entries.some(e=>e.id===g.what&&Math.hypot(e.position.x-g.pos.x,e.position.z-g.pos.z)<1.6);}
function plan(v){
 seamLocations??=Object.fromEntries(v.stablePrefix.map.seams.map(s=>[s.id,s]));
 const weapon=v.now.wave>=3?'blast':'rig'; const out=[{verb:'SET_WEAPON',weapon}];
 const local=v.now.seams.filter(s=>s.active&&s.remaining>0).map(s=>({...s,...seamLocations[s.id]})).sort((a,b)=>Math.hypot(a.x,a.z+12)-Math.hypot(b.x,b.z+12))[0];
 if(local&&Math.hypot(local.x,local.z+12)<=8){for(let i=0;i<Math.ceil(local.remaining/5)&&out.length<22;i++)out.push({verb:'HARVEST',seam:local.id});}
 for(const g of goals){if(present(v,g))continue;out.push({verb:'MOVE_TO',pos:g.pos});out.push({verb:'BUILD',what:g.what,where:g.pos,when:{goldGte:g.cost},rotationSteps:g.rot});}
 out.push({verb:'HOLD',pos:{x:0,z:-12}}); return out.slice(0,32);
}
let outcome=null;
for await(const line of rl){const m=JSON.parse(line);if(m.schema==='goldrush.view.v1'){const o=m.now.pendingSecure?[{verb:'SECURE_CHOICE',choice:'bank'}]:m.now.pendingOffer?[{verb:'PICK_UPGRADE',id:choose(m)}]:plan(m);child.stdin.write(JSON.stringify(o)+'\n');}else outcome=m;}
if(outcome)console.log(JSON.stringify(outcome));process.exitCode=await new Promise(r=>child.on('close',c=>r(c??1)));
