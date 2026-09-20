import { createServer } from 'vite';
const CONTRACT='e8-mare-claim', SEED='e8-mare-claim-01';
const location=new URL(`http://gr-sim.local/?debug&contract=${CONTRACT}&seed=${SEED}`);
globalThis.location=location; globalThis.window={location};
console.log=()=>undefined; console.info=()=>undefined;
const vite=await createServer({root:process.cwd(),appType:'custom',logLevel:'silent',server:{middlewareMode:true}});
try{
  const {HeadlessContractSim}=await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
  const sim=new HeadlessContractSim({contractId:CONTRACT,seed:SEED});
  let turn=sim.currentTurn();
  turn=sim.advanceToTurn();
  const now=turn.view.now;
  process.stdout.write('threats='+JSON.stringify(now.threats)+'\n');
  process.stdout.write('blastReadyInMs='+now.blastReadyInMs+' weapon='+now.weapon+'\n');
  process.stdout.write('hero='+JSON.stringify(now.hero)+'\n');
  process.stdout.write('orders keys='+JSON.stringify(Object.keys(now))+'\n');
  process.stdout.write('surprises='+JSON.stringify(now.surprises)+'\n');
} finally { await vite.close(); }
