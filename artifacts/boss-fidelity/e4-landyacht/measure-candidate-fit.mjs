/** Offline fit of proposed rigid formation against actual component triangles. */
import {NodeIO} from '@gltf-transform/core';
import {createHash} from 'node:crypto';
import {readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';

const here = new URL('./', import.meta.url);
const asset = new URL(process.argv[2] ?? 'candidate-model/land-yacht.glb', here);
const report = new URL(process.argv[3] ?? 'candidate-validation/formation-fit-search.json', here);
const doc = await new NodeIO().read(fileURLToPath(asset));
const geometries = new Map();
for (const node of doc.getRoot().listNodes()) {
  assert.deepEqual(node.getMatrix(), [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
  const mesh = node.getMesh(); if (!mesh) continue;
  assert.equal(mesh.listPrimitives().length, 1);
  const primitive = mesh.listPrimitives()[0];
  const vertices = primitive.getAttribute('POSITION').getArray();
  const morph = primitive.listTargets()[0].getAttribute('POSITION').getArray();
  const indices = primitive.getIndices().getArray();
  geometries.set(node.getName(), [0, 1].map(state => {
    const triangles = [];
    for (let i = 0; i < indices.length; i += 3) {
      const p = [0,1,2].map(corner => {
        const at = indices[i + corner] * 3;
        return [vertices[at] + morph[at] * state, vertices[at+2] + morph[at+2] * state];
      });
      const area = cross(p[1][0]-p[0][0], p[1][1]-p[0][1], p[2][0]-p[0][0], p[2][1]-p[0][1]);
      if (Math.abs(area) < 1e-10) continue;
      triangles.push({p, lo: [Math.min(...p.map(v=>v[0])), Math.min(...p.map(v=>v[1]))],
        hi: [Math.max(...p.map(v=>v[0])), Math.max(...p.map(v=>v[1]))]});
    }
    return triangles;
  }));
}
assert.deepEqual([...geometries.keys()], ['wheels','crane','wheelhouse']);
const samples=[];
for(let x=-20;x<=20;x++) for(let z=-20;z<=20;z++) if(x*x+z*z<=400) samples.push([x/20,z/20]);
const checkTriangle=[{p:[[-3,-3],[3,-3],[0,3]],lo:[-3,-3],hi:[3,3]}];
assert.equal(cover(checkTriangle,[0,0],1,[0,0]),100);
assert.equal(cover(checkTriangle,[20,20],1,[0,0]),0);
const radius=24, phase=3.5/radius;
// Body X follows the chord from wheels to wheelhouse. The middle target lies
// outside that chord by this sagitta. Polygon edges shorten both slightly.
const halfSpan=radius*Math.sin(phase), sag=radius*(1-Math.cos(phase));
const targets={wheels:[-halfSpan,0], crane:[0,sag], wheelhouse:[halfSpan,0]};
const orbit=[[ -radius,0],[-radius*Math.cos(phase),radius*Math.sin(phase)],
  [-radius*Math.cos(2*phase),radius*Math.sin(2*phase)]];
const center=orbit[0].map((v,i)=>(v+orbit[2][i])/2);
const direction=orbit[0].map((v,i)=>(orbit[2][i]-v)/(2*halfSpan));
assert.ok(Math.abs((orbit[1][0]-center[0])*(-direction[1])+(orbit[1][1]-center[1])*direction[0]-sag)<1e-10);
const candidates=[];
for(let step=0;step<=10;step++) {
  const scale=1.1+step*.1;
  for(let x=0;x<=12;x++) for(let z=-2;z<=2;z++) {
    const offset=[x*.25,z*.15];
    const coverage={};
    for(const [name, point] of Object.entries(targets))
      coverage[name]=cover(geometries.get(name)[0],point,scale,offset);
    candidates.push({scale,offset,coverage,minimum:Math.min(...Object.values(coverage))});
  }
}
candidates.sort((a,b)=>b.minimum-a.minimum || a.scale-b.scale);
const finalists=candidates.slice(0,12).map(row=>({...row,
  damagedCoverage:Object.fromEntries(Object.entries(targets).map(([name,point])=>
    [name,cover(geometries.get(name)[1],point,row.scale,row.offset)])),
  oneStepTranslationCoverage:[-1,1].map(sign=>Object.fromEntries(Object.entries(targets).map(([name,point])=>
    [name,cover(geometries.get(name)[0],[point[0]+sign*radius*Math.PI/6/30,point[1]],row.scale,row.offset)])))}));
const result={assetSha256:createHash('sha256').update(await readFile(asset)).digest('hex'),
  method:'41x41 deterministic disk samples covered by union of own-component XZ triangles. Candidate formation and rigid flat-ground pose only; not observed runtime.',
  hitRadius:.9,samplesPerDisk:samples.length,coverageSelfChecksPassed:true,targets,candidateCount:candidates.length,finalists,
  limits:['A component footprint includes all geometry in that named node, not only its title feature.',
    'One-step translation is a sensitivity check at 12.5664 units/second and 30 Hz, not a replay of curved route timing.',
    'No terrain tilt, camera visibility, timing, old-save formation, death-order or browser proof.']};
await writeFile(report,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({candidateCount:candidates.length,targets,finalists:finalists.slice(0,4)},null,2));

function cross(ax,az,bx,bz){return ax*bz-az*bx;}
function cover(triangles,point,scale,offset){
  const center=[(point[0]-offset[0])/scale,(point[1]-offset[1])/scale], r=.9/scale;
  const nearby=triangles.filter(t=>t.lo[0]<=center[0]+r&&t.hi[0]>=center[0]-r&&t.lo[1]<=center[1]+r&&t.hi[1]>=center[1]-r);
  let covered=0;
  for(const sample of samples){
    const x=center[0]+sample[0]*r,z=center[1]+sample[1]*r;
    if(nearby.some(({p,lo,hi})=>{
      if(x<lo[0]-1e-9||x>hi[0]+1e-9||z<lo[1]-1e-9||z>hi[1]+1e-9)return false;
      const signs=p.map((a,i)=>{const b=p[(i+1)%3];return cross(b[0]-a[0],b[1]-a[1],x-a[0],z-a[1]);});
      return signs.every(v=>v>=-1e-9)||signs.every(v=>v<=1e-9);
    }))covered++;
  }
  return Math.round(covered/samples.length*10000)/100;
}
