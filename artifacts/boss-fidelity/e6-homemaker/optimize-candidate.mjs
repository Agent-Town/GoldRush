// Same boss transforms as scripts/asset-diet.mjs, restricted to one isolated candidate.
import {Logger,NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {meshopt,textureCompress} from '@gltf-transform/functions';
import {MeshoptDecoder,MeshoptEncoder} from 'meshoptimizer';
import sharp from 'sharp';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root='artifacts/boss-fidelity/e6-homemaker',out=`${root}/candidate-optimized`;
await mkdir(out,{recursive:true});await MeshoptEncoder.ready;await MeshoptDecoder.ready;
const io=new NodeIO().setLogger(new Logger(Logger.Verbosity.WARN)).registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});
const input=`${root}/candidate-model/homemaker-9000.glb`,output=`${out}/homemaker-9000.glb`,doc=await io.read(input);
await doc.transform(meshopt({encoder:MeshoptEncoder,level:'medium'}),textureCompress({encoder:sharp,targetFormat:'webp',quality:80,effort:6}));await io.write(output,doc);
const sha=b=>createHash('sha256').update(b).digest('hex'),before=await readFile(input),after=await readFile(output);
await writeFile(`${out}/receipt.json`,JSON.stringify({input,inputSha256:sha(before),output,outputSha256:sha(after),inputBytes:before.length,outputBytes:after.length,scope:'Standalone exact boss compression transforms; not a production build.',pipelineSha256:sha(await readFile('scripts/asset-diet.mjs'))},null,2)+'\n');
