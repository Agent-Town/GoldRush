import { execFileSync } from 'node:child_process';
import path from 'node:path';
const BASE='89bfc10cda7e208589c7ad6304eb4c6aeae727bf';
const baseline=JSON.parse(execFileSync('git',['show',`${BASE}:artifacts/f1450-4/halo-class-sweep.json`],{maxBuffer:20*1024*1024}));
const stem=(f)=>path.basename(f).replace(/-r\d+c\d+\.png$/,'').replace(/\.png$/,'');
const HELD=new Set(['char-bandit-thief-sheet-walk8','char-baron-sheet-walk8','char-e9-feral_terraformer-sheet-walk8','char-elder-sheet-walk8','char-hero-sheet-walk8','char-newsie-mei-sheet-walk8','char-storekeeper-sheet-walk8','char-youngster-f-sheet-walk8','char-youngster-m-sheet-walk8']);
const REG=new Set(['char-elder-sheet-walk8','char-bandit-base-sheet-walk8','char-bandit-base-sheet-walkdiag8','char-bandit-thief-sheet-walk8','char-bandit-thief-sheet-walkdiag8','char-baron-sheet-walk4-a','char-baron-sheet-walk4-b','char-baron-sheet-walk8','char-baron-sheet-walkdiag8','char-coalthief-sheet-walk4-a','char-e6-feral_toaster-sheet-walk8','char-e6-glowjack-sheet-walk8','char-e6-lawn_shepherd-sheet-walk8','char-e7-data_rustler-sheet-walk8','char-e7-rogue_automaton-sheet-walk8','char-e8-scrap_corsair-sheet-walk8','char-e8-sun_glare_shambler-sheet-walk8','char-e9-claim_jump_prospect_drone-sheet-walk8','char-e9-feral_terraformer-sheet-walk8','char-jumper-sheet-walk4-a','char-jumper-sheet-walk4-b','char-jumper-sheet-walk8','char-railtough-sheet-walk4-a','char-railtough-sheet-walkdiag4-a','char-steamwrecker-sheet-walk4-a']);
const NEW=['char-youngster-m-sheet-walk8','char-youngster-f-sheet-walk8','char-storekeeper-sheet-walk8','char-tavernkeeper-sheet-walk8','char-newsie-mei-sheet-walk8','char-assay-clerk-sheet-walk8-a','char-preacher-sheet-walk8-a','char-hero-sheet-walk8'];
const before={er:baseline.suspects.filter(s=>HELD.has(stem(s.file))&&!REG.has(stem(s.file))).length,
  reg:baseline.suspects.filter(s=>REG.has(stem(s.file))).length,
  cur:baseline.suspects.filter(s=>!HELD.has(stem(s.file))&&!REG.has(stem(s.file))).length};
for(const s of NEW) REG.add(s);
const after={er:baseline.suspects.filter(s=>HELD.has(stem(s.file))&&!REG.has(stem(s.file))).length,
  reg:baseline.suspects.filter(s=>REG.has(stem(s.file))).length,
  cur:baseline.suspects.filter(s=>!HELD.has(stem(s.file))&&!REG.has(stem(s.file))).length};
console.log('BEFORE', before, 'sum', before.er+before.reg+before.cur);
console.log('AFTER ', after, 'sum', after.er+after.reg+after.cur, 'total', baseline.suspects.length);
// per new stem: how many BASE suspects it contributes and whether it was HELD or CURED
for(const s of NEW){const n=baseline.suspects.filter(x=>stem(x.file)===s).length; console.log('  ',s, 'baseSuspects='+n, HELD.has(s)?'(was HELD)':'(was CURED)');}
const stCells=baseline.suspects.filter(x=>stem(x.file)==='char-schoolteacher-sheet-walk8-a').length;
console.log('  char-schoolteacher-sheet-walk8-a baseSuspects='+stCells+' (HELD OUT of this land, stays in `cured`)');
