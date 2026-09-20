import { createServer } from 'vite';
const CONTRACT='e8-mare-claim', SEED='e8-mare-claim-01';
const location=new URL(`http://gr-sim.local/?debug&contract=${CONTRACT}&seed=${SEED}`);
globalThis.location=location; globalThis.window={location};
console.log=()=>undefined; console.info=()=>undefined;
const vite=await createServer({root:process.cwd(),appType:'custom',logLevel:'silent',server:{middlewareMode:true}});
try{
  const {HeadlessContractSim}=await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
  const sim=new HeadlessContractSim({contractId:CONTRACT,seed:SEED});
  sim.hero.applyStats(10000,1); sim.hero.heal(10000);
  // 40m east of the hero start (0,12): outside the 24m ungravitied reach, inside 24*2.4=57.6m.
  for (const d of [24, 40, 57, 58, 60]) {
    const r = sim.submitOrders([{verb:'BLAST_AT',pos:{x:d,z:12}},{verb:'HOLD',pos:{x:0,z:12}}]);
    let turn=sim.advanceToTurn();
    const rec=turn.view.now.orders.find(o=>o.order.verb==='BLAST_AT');
    process.stdout.write(`dist=${d} submit=${r.outcome.ok} status=${rec?.status} reason=${rec?.reason ?? ''}\n`);
  }
  const blasts=(sim.replayEvents??[]).filter(e=>e.type==='blast_at');
  process.stdout.write(`blast events=${JSON.stringify(blasts)}\n`);
} finally { await vite.close(); }
