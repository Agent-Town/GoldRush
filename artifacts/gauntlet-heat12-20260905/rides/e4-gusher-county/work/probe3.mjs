import fs from 'node:fs';
const REPO='/tmp/heat12-038cc280';
const WS=REPO+'/artifacts/heat12/opus/e4-gusher-county';
// contract manifest
const dirs=fs.readdirSync(REPO+'/assets/contracts');
let found=null;
for(const d of dirs){
  const p=REPO+'/assets/contracts/'+d+'/contracts.json';
  if(!fs.existsSync(p)) continue;
  const j=JSON.parse(fs.readFileSync(p,'utf8'));
  const arr=Array.isArray(j)?j:(j.contracts||[]);
  const c=arr.find(x=>x.id==='e4-gusher-county');
  if(c) found=c;
}
if(found){
  console.log('twist', JSON.stringify(found.twist).slice(0,1500));
  console.log('enemyRoster', JSON.stringify(found.enemyRoster||found.twist?.enemyRoster).slice(0,1500));
  console.log('buildZones', JSON.stringify(found.tileParams?.buildZones));
  console.log('stakeMarkers', JSON.stringify(found.tileParams?.stakeMarkers));
  console.log('harvestAnchors', JSON.stringify(found.tileParams?.harvestAnchors));
  console.log('engineDeps', JSON.stringify(found.engineDependencies));
  console.log('tileId', found.tileId, 'secureWave', found.twist?.secureWave, 'clockTicks', found.twist?.clockTicks);
  console.log('tileParamKeys', Object.keys(found.tileParams||{}));
} else console.log('NOT FOUND');
// per-view table
const views=fs.readFileSync(WS+'/probe-idle-views.jsonl','utf8').trim().split('\n').map(JSON.parse);
console.log('== views ==');
for(const v of views){
  const n=v.now;
  console.log([ 'w'+n.wave, 't='+JSON.stringify(n.timers).slice(0,80),
   'hp='+n.hero.hp+'/'+n.hero.maxHp, 'alive='+n.threats.alive,
   'thr='+JSON.stringify(n.threats).slice(0,160),
   'gold='+n.gold,
   'wx='+n.motor.weather.phase+':'+n.motor.weather.cycle+'@'+n.motor.weather.simTime.toFixed(1),
   'closed='+JSON.stringify(n.motor.roads.closed),
   'seams='+n.seams.filter(s=>s.active).map(s=>s.id+'@'+s.x+','+s.z).join('|')
  ].join(' '));
}
console.log('hero0', JSON.stringify(views[0].now.hero), 'prosp0', JSON.stringify(views[0].now.prospector));
