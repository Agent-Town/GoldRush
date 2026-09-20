import fs from 'node:fs';
import { PNG } from 'pngjs';
import sharp from 'sharp';
const p = PNG.sync.read(fs.readFileSync('assets/processed/char-youngster-m-sheet-walk8-r0c0.png'));
const s = async (o) => (await sharp(Buffer.from(p.data),{raw:{width:p.width,height:p.height,channels:4}}).png(o).toBuffer()).length;
console.log('no palette key      ', await s({compressionLevel:9,effort:10}));
console.log('palette:false       ', await s({compressionLevel:9,effort:10,palette:false}));
console.log('palette:true        ', await s({compressionLevel:9,effort:10,palette:true}));
// round trip check
const out = await sharp(Buffer.from(p.data),{raw:{width:p.width,height:p.height,channels:4}}).png({compressionLevel:9,effort:10}).toBuffer();
const q = PNG.sync.read(out);
let diff=0; for(let i=0;i<p.data.length;i++) if(p.data[i]!==q.data[i]) diff++;
console.log('roundtrip byte diffs', diff, 'size', out.length, q.width+'x'+q.height);
