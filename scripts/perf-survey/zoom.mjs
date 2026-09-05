import {parseArgs} from 'node:util';
import {launch,pageFor,boot,snapshot,read,write,host} from './browser.mjs';
const {values}=parseArgs({options:{map:{type:'string'}}});const inventory=await read('inventory.json');const env=await launch(),rows=[];
try{
 for(const map of inventory.maps.filter(m=>values.map?m.id===values.map:['the-claim','e2-incline','e6-showroom'].includes(m.id))){
  const {page,context,errors}=await pageFor(env.browser,{width:1280,height:800});await boot(page,env.base,map,'full','stress');await page.evaluate(()=>window.__GR_TEST__.setManualSim(true));
  for(const zoom of [1,2,3]){
   const probe=await page.evaluate(zoom=>{
    const {renderer:r,scene:s,camera:c}=__PERF_SURVEY__;c.zoom=zoom;c.updateProjectionMatrix();c.updateMatrixWorld(true);s.updateMatrixWorld(true);
    const e=c.projectionMatrix.clone().multiply(c.matrixWorldInverse).elements;
    const planes=[];for(const a of [0,1,2])for(const sign of [-1,1]){const p=[e[3]+sign*e[a],e[7]+sign*e[4+a],e[11]+sign*e[8+a],e[15]+sign*e[12+a]],length=Math.hypot(...p.slice(0,3));planes.push(p.map(x=>x/length));}
    const instances=[];s.traverseVisible(o=>{if(!o.isInstancedMesh||o.count===0)return;o.geometry.computeBoundingSphere();const sphere=o.geometry.boundingSphere,mat=o.matrix.clone();let inFrustum=0;for(let i=0;i<o.count;i++){o.getMatrixAt(i,mat);mat.premultiply(o.matrixWorld);const center=sphere.center.clone().applyMatrix4(mat),a=mat.elements,radius=sphere.radius*Math.max(Math.hypot(a[0],a[1],a[2]),Math.hypot(a[4],a[5],a[6]),Math.hypot(a[8],a[9],a[10]));if(radius>0&&planes.every(p=>p[0]*center.x+p[1]*center.y+p[2]*center.z+p[3]>=-radius))inFrustum++;}instances.push({name:o.name||o.parent?.name||o.type,frustumCulled:o.frustumCulled,count:o.count,inFrustum,outside:o.count-inFrustum,trianglesPerInstance:(o.geometry.index?.count??o.geometry.attributes.position?.count??0)/3});});
    r.info.reset();r.render(s,c);return {zoom,sceneOnlyCalls:r.info.render.calls,sceneOnlyTriangles:r.info.render.triangles,instances};
   },zoom);
   const scene=await snapshot(page);rows.push({map:map.id,host:host(),...probe,terrain:scene.objects.filter(o=>o.trianglesIntersectingFrustum!==undefined),errors});await write('zoom.json',{at:new Date().toISOString(),method:'Renderer camera.zoom 1/2/3, same frozen stress scene. Instance bounding spheres tested against six clip planes. Conservative frustum visibility, not depth visibility. Render counts are scene-only, not post. Matrix zero-scale hidden slots excluded from visible count.',rows});
  }
  await context.close();console.log(`${map.id}: three camera zooms`);
 }
}finally{await env.close();}
