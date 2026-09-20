import fs from 'node:fs';
import { PNG } from 'pngjs';
import sharp from 'sharp';
import zlib from 'node:zlib';
const cell='assets/processed/char-youngster-m-sheet-walk8-r0c0.png';
const buf=fs.readFileSync(cell);
// dump chunk structure
let off=8; const chunks=[];
while(off<buf.length){const len=buf.readUInt32BE(off); const type=buf.toString('ascii',off+4,off+8); chunks.push(`${type}:${len}`); off+=12+len;}
console.log('chunks', chunks.join(' '));
const p=PNG.sync.read(buf);
console.log('pngjs default   ', PNG.sync.write(p).length);
for (const lvl of [9]) for (const ft of [-1,0,1,2,3,4]) {
  console.log(`pngjs L${lvl} filter${ft} `, PNG.sync.write(p,{deflateLevel:lvl,filterType:ft}).length);
}
console.log('pngjs L9 strategy', [0,1,2,3].map(s=>PNG.sync.write(p,{deflateLevel:9,deflateStrategy:s}).length).join(' '));
const s = async (o) => (await sharp(Buffer.from(p.data),{raw:{width:p.width,height:p.height,channels:4}}).png(o).toBuffer()).length;
console.log('sharp L9 e10    ', await s({compressionLevel:9,effort:10}));
console.log('sharp L9 e10 af ', await s({compressionLevel:9,effort:10,adaptiveFiltering:true}));
console.log('sharp L9 e10 nf ', await s({compressionLevel:9,effort:10,adaptiveFiltering:false}));
