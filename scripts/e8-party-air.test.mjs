import assert from 'node:assert/strict';
import test from 'node:test';
import {createServer} from 'vite';

test('party air has per-actor suits, one shared window, and deterministic peer state', async () => {
  const vite=await createServer({appType:'custom',logLevel:'silent',server:{middlewareMode:true}});
  try {
    const {loadContract}=await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
    const {E8AtmosphereSystem}=await vite.ssrLoadModule('/src/systems/E8PhysicsSystem.ts');
    const {E8SuitAirSystem}=await vite.ssrLoadModule('/src/systems/E8SuitAirSystem.ts');
    for(const id of ['e8-mare-claim','e8-far-side','e8-low-orbit','e8-eclipse']) {
      const contract=loadContract(id),create=()=>{const c=E8AtmosphereSystem.create(contract);return c.isDeclared?c:E8SuitAirSystem.create(contract);};
      const left=create(),right=create();
      const zone=contract.tileParams.buildZones.find(z=>contract.twist.atmosphere.pressurisedZoneIds.includes(z.id));
      const shelter={x:(zone.minX+zone.maxX)/2,z:(zone.minZ+zone.maxZ)/2};
      const actors=[{id:0,position:shelter},{id:1,position:{x:500,z:500}}];
      const step=(delta,people=actors)=>{
        const a=left.updateActors(delta,people,[],0),b=right.updateActors(delta,[...people].reverse(),[],0);
        assert.deepEqual([...a],[...b]);assert.deepEqual(left.captureSuspend(),right.captureSuspend(),id+' peer state');
      };
      for(let i=0;i<61;i++)step(1);
      assert.equal(left.suitDiagnostics(0).empty,false);assert.equal(left.suitDiagnostics(1).empty,true);
      assert.equal(left.diagnostics.regolith.window,0,'two players must not advance the clock twice');
      assert.equal(left.notePan(0,1),false);assert.equal(right.notePan(0,1),false);
      assert.equal(left.notePan(0,0),true);assert.equal(right.notePan(0,0),true);
      assert.deepEqual(left.captureSuspend(),right.captureSuspend());
      if(left.crossings?.length) {
        const c=left.crossings[0],crossing={x:(c.minX+c.maxX)/2,z:(c.minZ+c.maxZ)/2};
        step(.1,[actors[0],{id:1,position:crossing}]);
        assert.equal(left.diagnostics.crossing.credited,0,'empty secondary suit cannot earn a crossing');
        step(1,[actors[0],{id:1,position:shelter}]);
        step(.1,[actors[0],{id:1,position:crossing}]);
        assert.equal(left.diagnostics.crossing.credited,1,'refilled secondary player can earn shared crossing');
      }
      const resumed=create();assert.equal(resumed.restoreSuspend(JSON.parse(JSON.stringify(left.captureSuspend()))),true);
      assert.deepEqual(resumed.captureSuspend(),left.captureSuspend(),id+' party resume');
    }
  }finally{await vite.close();}
});
