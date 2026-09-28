import { createServer } from 'vite';
const root = process.cwd();
for (const contractId of ['e5-regatta','e5-deepwater-claim']) {
 globalThis.location = new URL(`http://probe.local/?debug&contract=${contractId}`); globalThis.window = {location};
 const vite = await createServer({root,appType:'custom',logLevel:'silent',server:{middlewareMode:true,watch:null}});
 try {
  const {HeadlessContractSim} = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
  const Terrain = await vite.ssrLoadModule('/src/world/Terrain.ts');
  const sim = new HeadlessContractSim({contractId,seed:`${contractId}-01`});
  const tile=sim.deepwater.tile;
  if(contractId==='e5-regatta') {tile.boat.board(-40,0);tile.boat.board(-49,6);console.log(JSON.stringify({contractId,directStepAshore:tile.boat.stepAshore({x:-55,z:0},(x,z)=>sim.heroWalkable(x,z)),point:{x:-55,z:0},atHeatPoint:sim.heroWalkable(-50.41,0),at55:Terrain.sample(-55,0)}));}
  console.log(JSON.stringify({contractId,shore:Array.from({length:16},(_,i)=>{const x=tile.boat.position.x+Math.cos(i*Math.PI/8)*6.4,z=tile.boat.position.z+Math.sin(i*Math.PI/8)*6.4;return {x,z,walkable:sim.heroWalkable(x,z),outside:!tile.boat.navigable(x,z),offDeck:!tile.boat.contains(x,z)};})}));
  console.log(JSON.stringify({contractId, boat:tile.boat.snapshot(), bounds:Terrain.bounds, water:tile.boat.water, flag:tile.canStepAshore({walkable:(x,z)=>sim.heroWalkable(x,z)}), samples:[0,8,16,24,30,38,46,49.75].map(z=>({z,walkable:Terrain.sample(0,z).walkable})), stakes:sim.manifest.tileParams.stakeMarkers}));
 }finally{await vite.close();}
}
