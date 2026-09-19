import assert from 'node:assert/strict';
import test from 'node:test';
import {createServer} from 'vite';

test('passive and explicit headless harvest credit each paid tick once', async () => {
  const vite=await createServer({appType:'custom',logLevel:'silent',server:{middlewareMode:true,watch:null}});
  try {
    const {HeadlessContractSim}=await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const THREE=await vite.ssrLoadModule('three');
    for(const id of ['e8-mare-claim','e8-eclipse']) {
      const sim=new HeadlessContractSim({contractId:id,seed:'air-credit',admissionProbe:true});
      const node=sim.harvest.snapshot.activeNodes.find(n=>n.active);
      const position=new THREE.Vector3(node.position.x,0,node.position.z);
      sim.hero.resetRun(position);sim.prospector.reset(position);
      sim.prospector.group.position.copy(position);
      sim.harvest.update(3,sim.timeAlive,sim.harvestTargets());
      const consumer=sim.atmosphere.isDeclared?sim.atmosphere:sim.suitAir;
      const passive=consumer.diagnostics.regolith;
      assert.ok(passive.runsOnAir>0,`${id}: ordinary harvest updates must credit objective`);
      assert.deepEqual(passive.worked,[node.anchorIndex]);
      const before=passive.runsOnAir;
      assert.equal(sim.panAt(node.id),true);
      assert.equal(consumer.diagnostics.regolith.runsOnAir,before+1,`${id}: explicit pan must not double-credit`);
    }
  }finally{await vite.close();}
});
