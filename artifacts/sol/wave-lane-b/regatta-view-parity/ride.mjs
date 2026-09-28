import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { createServer } from 'vite';
const out = new URL('./', import.meta.url);
const save = (name, value) => writeFileSync(new URL(name, out), JSON.stringify(value, null, 2)+'\n');
const originalLog = console.log;
console.log = () => {};
async function withMap(contractId, run) {
 globalThis.location = new URL(`http://regatta-proof.local/?debug&contract=${contractId}`);
 globalThis.window = {location};
 const vite = await createServer({appType:'custom',logLevel:'silent',server:{middlewareMode:true,watch:null}});
 try {const {HeadlessContractSim}=await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts'); return await run(HeadlessContractSim,vite);}
 finally {await vite.close();}
}
await withMap('e5-regatta', async (Sim) => {
 const ride = () => {
  const sim = new Sim({contractId:'e5-regatta',seed:'e5-regatta-01'});
  const samples=[],orders=[];
  const submit = list => {assert.equal(sim.submitOrders(list).outcome.ok,true);orders.push({at:sim.currentTurn().view.now.timers.runSeconds,orders:list});};
  const boot=sim.currentTurn().view.now;
  submit(boot.deepwater.pads.map((p,i)=>({verb:'BOAT_BUILD',padId:p.id,buildingId:i===0?'sentry_beacon':'turret'})));
  let offDeck=false,ordered=null;
  for(let tick=0;tick<10000&&!sim.isTerminal;tick++) {
   const now=sim.currentTurn().view.now, v=now.regatta;
   if(now.pendingSecure) {submit([{verb:'SECURE_CHOICE',choice:'bank'}]);}
   else if(!v.boat.aboard) {
    if(now.hero.x>-44) offDeck=true;
    const id=offDeck?'board':'off-deck';
    if(ordered!==id) {submit([{verb:'MOVE_HERO',pos:offDeck?{x:-49,z:6}:{x:-40,z:0}}]);ordered=id;}
   } else if(v.nextBuoy && ordered!==v.nextBuoy.id) {
    submit([{verb:'MOVE_HERO',pos:{x:v.nextBuoy.x,z:v.nextBuoy.z+2}}]);ordered=v.nextBuoy.id;
   }
   sim.advanceOneTick();
   if(tick%30===0) {
    const v=sim.currentTurn().view.now.regatta;
    const p=sim.deepwater.tile.boat.position,w=sim.deepwater.tile.boat.water;
    assert.ok(p.x>=w.minX&&p.x<=w.maxX&&p.z>=w.minZ&&p.z<=w.maxZ);
    assert.equal(v.canStepAshore,sim.deepwater.tile.canStepAshore({walkable:(x,z)=>sim.heroWalkable(x,z)}));
    samples.push({tick:tick+1,...v});
   }
  }
  const final=sim.currentTurn().view.now.regatta;
  assert.equal(final.finished,true);assert.equal(final.forfeitedAt,null);
  assert.equal(final.finishedAt,final.buoysPassed.at(-1).atSeconds);
  assert.equal(final.buoysPassed.at(-1).id,'claim-boat');
  assert.equal(sim.outcome().secured,true);
  return {orders,samples,final,outcome:sim.outcome()};
 };
 const first=ride();assert.deepEqual(ride(),first);save('ride-transcript.json',first);
 originalLog(JSON.stringify({finish:first.final.finishedAt,lastBuoy:first.final.buoysPassed.at(-1),samples:first.samples.length,shoreTrue:first.samples.filter(s=>s.canStepAshore).length,outcome:first.outcome}));
 // Geometry-only position sweep, no movement or terrain rules changed.
 const sim=new Sim({contractId:'e5-regatta',seed:'e5-regatta-01'}),tile=sim.deepwater.tile;
 const hull=tile.boat,points=[];
 for(const x of [-49.75,-49,-45.21,-40,0,40,45.21,49,49.75]) for(const z of [-49.75,-40,0,40,49.75]) {
  hull.hullX=x;hull.hullZ=z;
  points.push({x,z,canStepAshore:tile.canStepAshore({walkable:(x,z)=>sim.heroWalkable(x,z)})});
 }
 hull.hullX=-49;hull.hullZ=0;hull.board(-40,0);hull.board(-49,6);
 assert.equal(hull.stepAshore({x:-55,z:0},(x,z)=>sim.heroWalkable(x,z)),true);
 assert.equal(sim.heroWalkable(-50.41,0),false);
 save('regatta-shore-samples.json',{note:'Geometry probes inside the real clamp; task universal-false assumption is disproved by the unchanged stepAshore.',points,counterexample:{hull:{x:-49,z:0},target:{x:-55,z:0},stepAshore:true,heat15TargetWalkable:false}});
});
await withMap('e5-deepwater-claim', async (Sim) => {
 const sim=new Sim({contractId:'e5-deepwater-claim',seed:'e5-deepwater-claim-01'}),tile=sim.deepwater.tile;
 const sample=()=>({ ...tile.boat.position,canStepAshore:tile.canStepAshore({walkable:(x,z)=>sim.heroWalkable(x,z)}) });
 const boot=sample();assert.equal(boot.canStepAshore,false);
 // The authored home boat only moors; there is no jetty anchor or sailing physics on this map.
 // Move ONLY this test fixture's hull to the actual terrain boundary to test the positive query.
 tile.boat.hullX=49.75;
 const shore=sample();assert.equal(shore.canStepAshore,true);
 assert.equal(sim.currentTurn().view.now.regatta,undefined,'Regatta view remains race-course scoped');
 save('deepwater-shore-samples.json',{boot,shore,note:'Boot uses the real lagoon anchor. Shore is a hull-position fixture on real walkable terrain, not a playable trip to an authored jetty; this map has no jetty anchor and no boat physics.',anchors:tile.boat.config.anchors,steerable:tile.boat.steerable});
 originalLog(JSON.stringify({deepwater:{boot,shore}}));
});
