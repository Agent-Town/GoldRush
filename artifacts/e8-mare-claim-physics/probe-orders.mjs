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
  sim.submitOrders([
    {verb:'BUILD',what:'sluice',where:{x:0,z:2},when:{goldGte:0}},
    {verb:'HARVEST',seam:'gold-seam-1'},
    {verb:'HOLD',pos:{x:0,z:12}},
  ]);
  let turn=sim.currentTurn();
  for(let i=0;i<6 && !turn.terminal;i+=1){
    turn=sim.advanceToTurn();
    const now=turn.view.now;
    process.stdout.write(`t=${now.timers.runSeconds} gold=${now.gold} orders=${JSON.stringify(now.orders)}\n`);
    process.stdout.write(`  works=${JSON.stringify(now.works?.entries)}\n`);
  }
  const costs = turn.view.stablePrefix.mechanics.buildables;
  process.stdout.write(`buildables=${JSON.stringify(costs)}\n`);
} finally { await vite.close(); }
