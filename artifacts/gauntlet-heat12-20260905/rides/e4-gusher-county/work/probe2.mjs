import fs from 'node:fs';
const WS='/tmp/heat12-038cc280/artifacts/heat12/opus/e4-gusher-county';
const views=fs.readFileSync(WS+'/probe-idle-views.jsonl','utf8').trim().split('\n').map(JSON.parse);
const v0=views[0];
console.log('== rules tail ==');
const rules=v0.stablePrefix.mechanics.rules;
for(const r of rules){ if(r.id!=='motor_fuel') console.log(r.id, JSON.stringify(r.data).slice(0,900)); }
console.log('== posting =='); console.log(JSON.stringify(v0.stablePrefix.mechanics.posting).slice(0,1500));
console.log('== interactables =='); console.log(JSON.stringify(v0.stablePrefix.mechanics.interactables).slice(0,600));
console.log('== SP keys ==', Object.keys(v0.stablePrefix));
console.log('== zones? ==', JSON.stringify(v0.stablePrefix.buildZones||v0.stablePrefix.map.buildZones||null));
console.log('== briefing ==', JSON.stringify(v0.stablePrefix.briefing).slice(0,1500));
console.log('== almanac0 ==', JSON.stringify(v0.almanac).slice(0,1200));
console.log('== per view ==');
for(const v of views){
  const n=v.now;
  console.log([v.now.wave, (n.timers?.simTimeSeconds ?? n.timers?.elapsedSeconds ?? '?'), 'hp='+n.hero.hp+'/'+n.hero.maxHp, 'lvl='+n.hero.level,
   'alive='+n.threats.alive, 'wr='+(n.threats.wreckers??'?'), 'th='+(n.threats.thieves??'?'),
   'gold='+n.gold, 'pan='+(n.score?.goldPanned??'?'),
   'wx='+n.motor.weather.phase+':'+n.motor.weather.cycle+'@'+n.motor.weather.simTime.toFixed(1)+' next='+n.motor.weather.nextPhaseInSeconds,
   'closed='+JSON.stringify(n.motor.roads.closed), 'next='+n.motor.roads.closesNext,
   'seams='+n.seams.filter(s=>s.active).map(s=>s.id+'@'+s.x+','+s.z).join('|')
  ].join(' '));
}
console.log('== last view now.timers ==', JSON.stringify(views[views.length-1].now.timers));
console.log('== appendLog tail ==', JSON.stringify(views[views.length-1].appendLog?.slice(-3)).slice(0,1500));
