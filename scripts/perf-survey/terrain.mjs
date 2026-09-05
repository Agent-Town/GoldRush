import fs from 'node:fs/promises';
import path from 'node:path';
import {NodeIO} from '@gltf-transform/core';
import {read,write,root,stats} from './browser.mjs';
const inventory=await read('inventory.json'),io=new NodeIO();const rows=[];
for(const source of [...new Set(inventory.maps.map(m=>m.terrainSource).filter(Boolean))]){
 const doc=await io.read(path.join(root,source));const primitive=doc.getRoot().listMeshes()[0].listPrimitives()[0];const p=primitive.getAttribute('POSITION');const idx=primitive.getIndices();const n=Math.sqrt(p.getCount()),segments=n-1;
 const coords=[];for(let i=0;i<p.getCount();i++)coords.push(p.getElement(i,[]));
 // In source GLB glTF coordinates, Y is height. Sort by X/Z to avoid exporter vertex ordering assumptions.
 const xs=[...new Set(coords.map(v=>v[0]))].sort((a,b)=>a-b),zs=[...new Set(coords.map(v=>v[2]))].sort((a,b)=>a-b);
 const row={source,maps:inventory.maps.filter(m=>m.terrainSource===source).map(m=>m.id),vertices:p.getCount(),triangles:idx.getCount()/3,segments};
 if(n!==Math.round(n)||xs.length!==n||zs.length!==n||segments%2){row.error='not an axis-aligned even square grid';rows.push(row);continue;}
 const grid=new Map(coords.map(v=>[`${v[0]},${v[2]}`,v[1]]));const height=(x,z)=>grid.get(`${xs[x]},${zs[z]}`);
 // Measure the actual exported triangle diagonal once, rather than imposing bilinear interpolation.
 const triangles=[];for(let i=0;i<idx.getCount();i+=3)triangles.push([0,1,2].map(j=>coords[idx.getScalar(i+j)]));
 const first=triangles[0],minX=Math.min(...first.map(v=>v[0])),minZ=Math.min(...first.map(v=>v[2]));
 const diagonal=first.some(v=>v[0]===minX&&v[2]===minZ)&&first.some(v=>v[0]>minX&&v[2]>minZ)?'00-11':'10-01';
 const coarse=(x,z)=>{let xi=Math.floor((x-xs[0])/(xs.at(-1)-xs[0])*segments/2)*2,zi=Math.floor((z-zs[0])/(zs.at(-1)-zs[0])*segments/2)*2;xi=Math.max(0,Math.min(segments-2,xi));zi=Math.max(0,Math.min(segments-2,zi));const u=(x-xs[xi])/(xs[xi+2]-xs[xi]),v=(z-zs[zi])/(zs[zi+2]-zs[zi]);const a=height(xi,zi),b=height(xi+2,zi),c=height(xi,zi+2),d=height(xi+2,zi+2);return diagonal==='00-11'?(u>=v?a+(b-a)*u+(d-b)*v:a+(d-c)*u+(c-a)*v):(u+v<=1?a+(b-a)*u+(c-a)*v:d+(c-d)*(1-u)+(b-d)*(1-v));};
 const errors=coords.map(([x,y,z])=>Math.abs(y-coarse(x,z)));
 const centroidErrors=triangles.map(t=>{const x=t.reduce((s,v)=>s+v[0],0)/3,y=t.reduce((s,v)=>s+v[1],0)/3,z=t.reduce((s,v)=>s+v[2],0)/3;return Math.abs(y-coarse(x,z));});
 const steepErrors=triangles.filter(t=>Math.max(...t.map(v=>v[1]))-Math.min(...t.map(v=>v[1]))>.25).map(t=>Math.abs(t.reduce((s,v)=>s+v[1],0)/3-coarse(t.reduce((s,v)=>s+v[0],0)/3,t.reduce((s,v)=>s+v[2],0)/3)));
 Object.assign(row,{diagonal,coarseSegments:segments/2,coarseTriangles:2*(segments/2)**2,vertexHeightError:stats(errors),triangleCentroidHeightError:stats(centroidErrors),steepTriangleCentroidError:stats(steepErrors),above005:errors.filter(v=>v>.05).length,above025:errors.filter(v=>v>.25).length,method:'every second X/Z vertex retained; exported diagonal retained; compare coarse triangle interpolation against every original vertex and original triangle centroid. Steep = original triangle height span > 0.25 world units. No mesh or runtime contract changed.'});rows.push(row);
}
const sourceFiles=(await fs.readdir(path.join(root,'src'),{recursive:true})).filter(f=>f.endsWith('.ts'));const culling=[];
for(const file of sourceFiles){const lines=(await fs.readFile(path.join(root,'src',file),'utf8')).split('\n');lines.forEach((line,i)=>{if(/frustumCulled\s*=\s*false/.test(line))culling.push({file:`src/${file}`,line:i+1,code:line.trim(),context:lines.slice(Math.max(0,i-4),i+3).join('\n')});});}
await write('terrain.json',{at:new Date().toISOString(),rows,culling});console.log(`${rows.length} unique source grids; ${culling.length} frustum-culling disable sites`);
