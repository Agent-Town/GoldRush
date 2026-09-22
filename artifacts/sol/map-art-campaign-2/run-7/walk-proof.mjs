// Diagnostic movement and reachability evidence; ordinary boots are captured separately.
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const id=process.argv[2],out=`artifacts/sol/map-art-campaign-2/run-7/${id}`;
const config=JSON.parse(readFileSync(`${out}/capture-config.json`));
const root='assets/pilots/map-rebuild-spike';
const variant=JSON.parse(readFileSync(`${root}/${config.variant}-terrain-contract.json`));
const parent=JSON.parse(readFileSync(`${root}/${config.parent}-terrain-contract.json`));
const solids=JSON.parse(readFileSync(`${out}/selected-solids.json`));
const browser=await chromium.launch({channel:'chromium'}),rows=[];
try{for(const width of [1280,390]){
 const page=await browser.newPage({viewport:{width,height:width===390?844:800},isMobile:width===390,hasTouch:width===390});const errors=[];
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:5303/?debug&epoch=${config.epoch}&contract=${id}&nowaves&nolevel&nokill&nopause&nosteal&nowreck&tier=full&seed=variant-footprints`);
 await page.waitForFunction(()=>window.__GR_TEST__&&document.querySelector('#game-canvas')?.dataset.terrain3dPilotLandmarkLoadState==='mounted');
 const begin=page.getByTestId('contract-briefing-dismiss');if(await begin.isVisible())await begin.click();
 await page.evaluate(()=>window.__GR_TEST__.setManualSim(true));
 const navigation=await page.evaluate(async({solids,variant,parent})=>{
  const t=await import('/src/world/Terrain.ts'),api=window.__GR_TEST__,contract=api.activeContract(),spawn={...window.__THREE_GAME_DIAGNOSTICS__.heroPos};
  const blockers=t.landmarkBlockers(),own=blockers.filter(b=>solids.some(s=>b.id.endsWith(':'+s.id)));
  const step=.5,minX=t.bounds.minX+1,minZ=t.bounds.minZ+1,nx=Math.floor((t.bounds.maxX-minX-1)/step)+1,nz=Math.floor((t.bounds.maxZ-minZ-1)/step)+1;
  const point=i=>({x:minX+(i%nx)*step,z:minZ+Math.floor(i/nx)*step});
  const index=(x,z)=>Math.round((z-minZ)/step)*nx+Math.round((x-minX)/step);
  const visited=new Uint8Array(nx*nz),queue=[index(spawn.x,spawn.z)];visited[queue[0]]=1;
  for(let k=0;k<queue.length;k++){const i=queue[k],x=i%nx,z=Math.floor(i/nx);for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,zz=z+dz,j=zz*nx+xx;if(xx<0||zz<0||xx>=nx||zz>=nz||visited[j])continue;const p=point(j);if(!t.sample(p.x,p.z).walkable)continue;visited[j]=1;queue.push(j)}}
  const reachable=(x,z)=>t.sample(x,z).walkable&&!!visited[index(x,z)];
  const targets=[];const tile=contract.tileParams;
  for(const [kind,list]of [['stake',tile.stakeMarkers??[]],['harvest',tile.harvestAnchors??[]]])for(const [i,p]of list.entries())targets.push({kind,id:p.id??String(i),x:p.x,z:p.z,reachable:reachable(p.x,p.z)});
  const stations=new Map([...(parent.landmarkAcceptanceStations??[]),...(variant.landmarkAcceptanceStations??[])].map(s=>[s.id,s]));
  for(const s of stations.values()){const [x,z]=s.heroPositionXZ;targets.push({kind:'station',id:s.id,x,z,reachable:reachable(x,z)})}
  for(const [kind,list]of [['site',tile.buildZones??[]],['probe-zone',tile.probeRecoveryZones??[]]])for(const area of list){const center={x:(area.minX+area.maxX)/2,z:(area.minZ+area.maxZ)/2};const choices=queue.map(point).filter(p=>p.x>=area.minX&&p.x<=area.maxX&&p.z>=area.minZ&&p.z<=area.maxZ).sort((a,b)=>Math.hypot(a.x-center.x,a.z-center.z)-Math.hypot(b.x-center.x,b.z-center.z));targets.push({kind,id:area.id,center,approach:choices[0]??null,reachable:choices.length>0})}
  for(const [i,route]of (tile.lanes?.patrolRoutes??[]).entries())for(const [j,p]of (route.points??route).entries()){const x=p.x??p[0],z=p.z??p[1];targets.push({kind:'route',id:`${i}:${j}`,x,z,reachable:reachable(x,z)})}
  return {spawn,spawnWalkable:t.sample(spawn.x,spawn.z).walkable,own,blockers,targets,reachableCells:queue.length,step};
 },{solids,variant,parent});
 assert.ok(navigation.spawnWalkable,'spawn is walkable');assert.equal(navigation.own.length,solids.length);
 const probes=[];
 for(const b of navigation.own){
  const faces=[],group=[b];
  for(let i=0;i<group.length;i++)for(const other of navigation.blockers)if(!group.includes(other)&&Math.abs(other.x-group[i].x)<=other.halfX+group[i].halfX+1.16&&Math.abs(other.z-group[i].z)<=other.halfZ+group[i].halfZ+1.16)group.push(other);
  for(const [axis,sign,key]of [['x',-1,'KeyD'],['x',1,'KeyA'],['z',-1,'KeyS'],['z',1,'KeyW']]){
   const half=o=>axis==='x'?o.halfX:o.halfZ;const faceBody=group.reduce((a,c)=>sign*(c[axis]+sign*half(c))>sign*(a[axis]+sign*half(a))?c:a);
   const start={x:faceBody.x,z:faceBody.z};start[axis]+=sign*(half(faceBody)+.58+.6);
   await page.evaluate(p=>window.__GR_TEST__.teleport(p.x,p.z),start);await page.keyboard.down(key);
   await page.evaluate(()=>window.__GR_TEST__.advanceSim(1.5));await page.keyboard.up(key);await page.waitForTimeout(40);
   const hero=await page.evaluate(()=>({...window.__THREE_GAME_DIAGNOSTICS__.heroPos}));
   const blocked=!navigation.blockers.some(a=>Math.abs(hero.x-a.x)<=a.halfX+.58&&Math.abs(hero.z-a.z)<=a.halfZ+.58);
   const boundary=faceBody[axis]+sign*(half(faceBody)+.58);const boundaryDistance=Math.abs(hero[axis]-boundary);
   faces.push({axis,sign,key,faceBody:faceBody.id,start,hero,boundaryDistance,outsideAllBlockers:blocked});assert.ok(blocked,`${b.id} ${key}`);assert.ok(boundaryDistance<.12,`${b.id} ${key} boundary: ${boundaryDistance}`);
  }
  await page.evaluate(b=>window.__GR_TEST__.teleport(b.x,b.z),b);await page.keyboard.down('KeyD');await page.evaluate(()=>window.__GR_TEST__.advanceSim(3));await page.keyboard.up('KeyD');await page.waitForTimeout(40);
  const hero=await page.evaluate(()=>({...window.__THREE_GAME_DIAGNOSTICS__.heroPos}));const released=!navigation.blockers.some(a=>Math.abs(hero.x-a.x)<=a.halfX+.58&&Math.abs(hero.z-a.z)<=a.halfZ+.58);
  probes.push({id:b.id,overlappingBlockerGroup:group.map(o=>o.id),faces,depenetrated:released,releasePosition:hero});assert.ok(released,`${b.id} depenetration`);
  await page.evaluate(b=>window.__GR_TEST__.teleport(b.x,b.z+b.halfZ+3),b);await page.waitForTimeout(400);
  await page.screenshot({path:`${out}/walk-${b.id.split(':')[1]}-${width}.png`});
 }
 const cycles=await page.evaluate(async({id,tileId,solids})=>{
  const T=await import('/@id/three'),{installTerrain3dClaimPilot}=await import('/src/world/Terrain3dClaimPilot.ts'),rows=[];
  for(let cycle=0;cycle<3;cycle++){const scene=new T.Scene(),canvas=document.createElement('canvas'),dispose=installTerrain3dClaimPilot({scene,canvas,contractId:id,tileId});await new Promise((resolve,reject)=>{const until=performance.now()+30000;function poll(){if(canvas.dataset.terrain3dPilotLandmarkLoadState==='mounted')resolve();else if(performance.now()>until)reject(Error(JSON.stringify(canvas.dataset)));else requestAnimationFrame(poll)}poll()});const bodies=solids.map(s=>{const model=scene.getObjectByName(s.id);if(!model)throw Error('missing '+s.id);return {id:s.id,position:model.position.toArray(),rotation:model.rotation.toArray().slice(0,3),scale:model.scale.toArray(),bounds:new T.Box3().setFromObject(model)}});const dataset={...canvas.dataset};dispose();rows.push({cycle,bodies,dataset,remainingSceneChildren:scene.children.length})}return rows;
 },{id,tileId:`${id.slice(0,2)}-${config.parent}`,solids});
 for(const cycle of cycles){assert.equal(cycle.remainingSceneChildren,0);assert.equal(cycle.dataset.terrain3dPilotLandmarkSkipped,'0');assert.equal(cycle.dataset.terrain3dPilotLandmarks,'10');for(const b of cycle.bodies){const s=solids.find(s=>s.id===b.id);assert.deepEqual([b.position[0],b.position[2]],s.position);assert.deepEqual(b.rotation,[0,s.rotation,0]);assert.deepEqual([b.scale[0],b.scale[2]],s.scale)}}
 rows.push({width,navigation,probes,cycles,errors});writeFileSync(`${out}/walk-proof.json`,JSON.stringify(rows,null,2)+'\n');
 assert.deepEqual(errors,[]);assert.ok(navigation.targets.every(t=>t.reachable),JSON.stringify(navigation.targets.filter(t=>!t.reachable)));console.log(id,width,'PASS',probes.length,'bodies',navigation.targets.length,'destinations');await page.close();
}}finally{await browser.close()}
