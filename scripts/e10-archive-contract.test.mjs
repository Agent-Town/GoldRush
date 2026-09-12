import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createServer} from 'vite';
const server=await createServer({server:{middlewareMode:true},appType:'custom'});
try {
 const {validateContractsBundle}=await server.ssrLoadModule('/src/meta/ContractFamilies.ts');
 const source=JSON.parse(readFileSync('assets/contracts/epoch-10-deepsky/contracts.json','utf8'));
 const production=source.contracts.find(c=>c.id==='e10-archive-world');
 assert.equal(production.twist.secureWave,12);
 assert.equal(production.twist.harvestFreeObjective,undefined);
 assert.equal(production.tileParams.harvestAnchors.length,4);
 assert.deepEqual(production.tileParams.stakeMarkers.filter(s=>s.heroStart),[{id:'archive-entry',x:0,z:-52,heroStart:true}]);
 const mask=JSON.parse(readFileSync('assets/contracts/epoch-10-deepsky/mask-tables/e10-archive-world.json','utf8')).maskTruth;
 for(const key of ['harvestAnchors','stakeMarkers']) assert.deepEqual(mask[key],production.tileParams[key]);
 const terrain=JSON.parse(readFileSync('assets/pilots/map-rebuild-spike/archive-world-terrain-contract.json','utf8'));
 assert.deepEqual(terrain.maskTruth,mask,'terrain factory snapshot must follow the gameplay mask');
 const {deriveMechanicsManifest}=await server.ssrLoadModule('/src/agent/MechanicsManifest.ts');
 const rules=deriveMechanicsManifest(production.id).rules;
 assert.equal(rules.find(r=>r.id==='archive_restoration').data.wings.length,3);
 assert.equal(rules.find(r=>r.id==='static_squall').data.motePressureMultiplier,undefined);
 assert.equal(deriveMechanicsManifest('e10-ember-shore').rules.some(r=>r.id==='archive_restoration'),false);
 const bundle=structuredClone(source), c=bundle.contracts.find(c=>c.id==='e10-archive-world');
 c.twist.archiveWorld={squall:{calmSeconds:60,telegraphSeconds:8,squallSeconds:25,recoverSeconds:8},lightHold:c.tileParams.archiveWingZones.map((w,i)=>({wingId:w.id,siteId:c.tileParams.lightHoldSites[i].id}))};
 validateContractsBundle(bundle,bundle.epochId);
 for(const corrupt of [
  c=>c.twist.archiveWorld={},
  c=>c.twist.archiveWorld.squall.calmSeconds=0,
  c=>c.twist.archiveWorld.squall.squallSeconds=Infinity,
  c=>c.twist.archiveWorld.squall.extra=1,
  c=>c.twist.emberShore={},
  c=>c.twist.archiveWorld.lightHold[0].siteId='missing',
  c=>c.twist.archiveWorld.lightHold[0].extra=true,
  c=>c.twist.archiveWorld.lightHold.pop(),
  c=>c.twist.archiveWorld.lightHold[1]=c.twist.archiveWorld.lightHold[0],
  c=>c.tileParams.archiveWingZones[1].order=1,
  c=>c.tileParams.lightHoldSites[0].radius=-1,
  c=>c.tileParams.lightHoldSites[0].x=NaN,
  c=>c.tileParams.lightHoldSites.push({...c.tileParams.lightHoldSites[0],id:'unbound'}),
  c=>c.tileParams.lightHoldSites.push({...c.tileParams.lightHoldSites[0],x:8}),
 ]) {
  const bad=structuredClone(bundle);corrupt(bad.contracts.find(c=>c.id==='e10-archive-world'));
  assert.throws(()=>validateContractsBundle(bad,bad.epochId),/twist.archiveWorld/);
 }
 const defaults=structuredClone(bundle);defaults.contracts.find(c=>c.id==='e10-archive-world').twist.archiveWorld.squall={};
 validateContractsBundle(defaults,defaults.epochId);
 validateContractsBundle(source,source.epochId);
 console.log('PASS: authored Archive bindings and cadence accepted; malformed references, duplicates and clocks rejected; omitted cadence uses scheduler defaults; production bundle unchanged');
} finally {await server.close();}
