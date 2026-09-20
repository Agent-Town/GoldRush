import { createServer } from 'vite';
const location=new URL('http://gr-sim.local/?debug&contract=e8-mare-claim&seed=e8-mare-claim-01');
globalThis.location=location; globalThis.window={location};
console.log=()=>undefined; console.info=()=>undefined;
const vite=await createServer({root:process.cwd(),appType:'custom',logLevel:'silent',server:{middlewareMode:true}});
try{
  const {HeadlessContractSim}=await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
  const T=await vite.ssrLoadModule('/src/world/Terrain.ts');
  const sim=new HeadlessContractSim({contractId:'e8-mare-claim',seed:'e8-mare-claim-01'});
  const probe=[[0,0],[10,10],[-20,20],[30,30],[0,12]].map(([x,z])=>{const s=T.sample(x,z);return [x,z,Math.round((s.height??0)*1000)/1000,Math.round((s.speedMul??1)*1000)/1000,s.walkable];});
  let turn=sim.currentTurn();
  for(let d=0;d<400&&!turn.terminal;d+=1) turn=sim.advanceToTurn();
  process.stdout.write('bounds='+JSON.stringify(T.bounds)+'\n');
  process.stdout.write('probe='+JSON.stringify(probe)+'\n');
  process.stdout.write('hash='+sim.outcome().eventLogHash+'\n');
  process.stdout.write('first events='+JSON.stringify(sim.replayEvents.slice(0,6))+'\n');
} finally { await vite.close(); }
