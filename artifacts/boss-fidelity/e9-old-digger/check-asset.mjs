import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const path=process.argv[2];assert(path,'Pass candidate GLB path');const b=await readFile(path);
assert.equal(b.toString('utf8',0,4),'glTF');assert.equal(b.readUInt32LE(4),2);
const n=b.readUInt32LE(12),j=JSON.parse(b.toString('utf8',20,20+n)),binStart=28+n;
const contract={bucket_wheels:'Redemption_GentleBuckets',gantry:'Redemption_SafeGantry',tape_deck:'Redemption_TealTapeDeck'};
assert.equal(j.meshes.length,3);assert.equal(j.materials.length,1);assert.equal(j.images.length,1);assert.equal(j.animations?.length??0,0);assert.equal(j.cameras?.length??0,0);assert(!j.extensions?.KHR_lights_punctual);
const rows=[];let triangles=0;
for(const node of j.nodes.filter(n=>n.mesh!==undefined)){
assert(contract[node.name],node.name);assert.deepEqual(node.translation??[0,0,0],[0,0,0]);assert.deepEqual(node.rotation??[0,0,0,1],[0,0,0,1]);assert.deepEqual(node.scale??[1,1,1],[1,1,1]);assert(!node.matrix);
const m=j.meshes[node.mesh];assert.equal(m.primitives.length,1);assert.deepEqual(m.extras.targetNames,[contract[node.name]]);assert.deepEqual(m.weights,[0]);const p=m.primitives[0];assert.equal(p.targets.length,1);assert.equal(p.material,0);const count=j.accessors[p.indices].count/3;assert(Number.isInteger(count));triangles+=count;rows.push({name:node.name,triangles:count,morph:m.extras.targetNames[0]});}
assert.equal(rows.length,3);assert(triangles<=24000);const image=j.images[0];assert(!image.uri);const v=j.bufferViews[image.bufferView],png=b.subarray(binStart+(v.byteOffset??0),binStart+(v.byteOffset??0)+v.byteLength);assert.equal(png.readUInt32BE(16),1024);assert.equal(png.readUInt32BE(20),1024);
const result={path,sha256:createHash('sha256').update(b).digest('hex'),triangles,rows,texture:[1024,1024],passed:true};await writeFile(path.replace(/\.glb$/,'.check.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
