import { writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'chromium', headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
let gameUrl;
page.on('request', r => { if (new URL(r.url()).pathname === '/src/game/Game.ts') gameUrl=r.url(); });
try {
  await page.goto('http://127.0.0.1:5246/?debug&contract=e2-hill-mine&nolevel&nopause&nosteal&nowreck&tier=full&timescale=1&seed=railcar-facing-e2');
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame??0)>16);
  await page.getByTestId('contract-briefing-dismiss').click();
  await page.evaluate(async gameUrl=>{
    const {Game}=await import(gameUrl);
    const original=Game.prototype.syncBaronRocketCart;
    Game.prototype.syncBaronRocketCart=function(...args){window.__railcarProbeGame=this;Game.prototype.syncBaronRocketCart=original;return original.apply(this,args);};
    const h=window.__GR_TEST__;h.setManualSim(true);
    for(const [k,v] of Object.entries({'waves.waveInterval':.35,'waves.trickleInterval':999,'waves.pulseBase':0,'waves.pulsePerWave':0,'waves.aliveCap':0,'enemy.contactDamage':0,'sparkRig.range':0,'sparkRig.damage':0}))h.setBalance(k,v);
    h.setWave(11);h.advanceSim(.4);h.setBalance('waves.waveInterval',999);
    for(const seconds of [2,8,12])h.advanceSim(seconds);
  },gameUrl);
  await page.waitForFunction(()=>window.__railcarProbeGame && document.querySelector('canvas')?.dataset.railcar3dState==='ready');
  const poses={};
  for(const state of ['outbound','return']){
    if(state==='return')await page.evaluate(()=>{window.__GR_TEST__.advanceSim(26);window.__GR_TEST__.advanceSim(4);});
    await page.waitForTimeout(100);
    poses[state]=await page.evaluate(()=>{
      const g=window.__railcarProbeGame,model=g.enemies.railcar3dModel;
      model.updateWorldMatrix(true,true);
      const components=window.__GR_TEST__.enemyPositions().filter(e=>e.eliteKind==='railcar');
      const nose=model.position.clone().set(-1,0,0).transformDirection(model.matrixWorld);
      const speed=Math.hypot(components[0].vx,components[0].vz);
      const fitted=components.map(component=>{
        const mesh=model.getObjectByName(`Railcar_${component.bossComponentId[0].toUpperCase()+component.bossComponentId.slice(1)}`);
        const p=model.position.clone();
        const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
        for(let i=0;i<mesh.geometry.attributes.position.count;i++){
          mesh.getVertexPosition(i,p).applyMatrix4(mesh.matrixWorld);
          p.toArray().forEach((v,j)=>{min[j]=Math.min(min[j],v);max[j]=Math.max(max[j],v);});
        }
        const center=min.map((v,j)=>(v+max[j])/2);
        return {id:component.bossComponentId,proxy:[component.x,component.y,component.z],velocity:[component.vx,component.vz],hitRadius:component.hitRadius,meshBounds:{min,max},meshCenter:center,proxyToMeshCenterXZ:Math.hypot(component.x-center[0],component.z-center[2])};
      });
      return {modelPosition:model.position.toArray(),modelYaw:model.rotation.y,noseWorld:nose.toArray(),noseDotVelocity:(nose.x*components[0].vx+nose.z*components[0].vz)/speed,components:fitted};
    });
  }
  await writeFile(new URL('facing-probe.json',import.meta.url),JSON.stringify(poses,null,2));
  console.log(JSON.stringify(poses,null,2));
}finally{await browser.close();}
