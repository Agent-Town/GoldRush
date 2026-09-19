import assert from 'node:assert/strict';
import test from 'node:test';
import {createServer} from 'vite';

test('E8 save state preserves exact continuation and rejects malformed state atomically', async () => {
  const vite=await createServer({appType:'custom',logLevel:'silent',server:{middlewareMode:true,watch:null}});
  try {
    const {loadContract}=await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
    const {E8AtmosphereSystem,E8HumanSuit}=await vite.ssrLoadModule('/src/systems/E8PhysicsSystem.ts');
    const {E8SuitAirSystem}=await vite.ssrLoadModule('/src/systems/E8SuitAirSystem.ts');
    for(const id of ['e8-mare-claim','e8-far-side','e8-low-orbit','e8-eclipse']) {
      const contract=loadContract(id);
      const create=()=>{const air=E8AtmosphereSystem.create(contract);return air.isDeclared?air:E8SuitAirSystem.create(contract);};
      const original=create();original.update(7.125,{x:500,z:500},[],3);original.notePan(0);
      const saved=JSON.parse(JSON.stringify(original.captureSuspend()));
      const resumed=create();assert.equal(resumed.restoreSuspend(saved),true,id);
      assert.deepEqual(resumed.captureSuspend(),original.captureSuspend(),id);
      for(const delta of [.025,60,52.9,.1]) {
        assert.equal(resumed.update(delta,{x:500,z:500},[],14),original.update(delta,{x:500,z:500},[],14));
        assert.equal(resumed.notePan(1),original.notePan(1));
        assert.deepEqual(resumed.captureSuspend(),original.captureSuspend(),id+' continuation');
      }
      const before=resumed.captureSuspend(),bad=structuredClone(before);bad.worked=[-1];
      assert.equal(resumed.restoreSuspend(bad),false);assert.deepEqual(resumed.captureSuspend(),before);
      bad.worked=[];bad.suit.harmCarry=NaN;assert.equal(resumed.restoreSuspend(bad),false);assert.deepEqual(resumed.captureSuspend(),before);
    }
    const original=new E8HumanSuit(1,5);original.update(1.625,null);
    const resumed=new E8HumanSuit(1,5);assert.equal(resumed.restoreSuspend(original.captureSuspend()),true);
    assert.equal(resumed.update(.375,null),original.update(.375,null));
    assert.deepEqual(resumed.captureSuspend(),original.captureSuspend());
  }finally{await vite.close();}
});
