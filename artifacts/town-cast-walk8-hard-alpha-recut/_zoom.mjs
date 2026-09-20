import fs from 'node:fs';
import { PNG } from 'pngjs';
import sharp from 'sharp';
const S='/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad';
const cell=process.argv[2], x0=+process.argv[3], y0=+process.argv[4], w=+process.argv[5], h=+process.argv[6], out=process.argv[7];
const G=110;
const crop=(file)=>{const p=PNG.sync.read(fs.readFileSync(file));const b=Buffer.alloc(w*h*3);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=((y0+y)*p.width+(x0+x))<<2,a=p.data[i+3]/255,d=(y*w+x)*3;
  for(let c=0;c<3;c++)b[d+c]=Math.round(p.data[i+c]*a+G*(1-a));}
 return b;};
const tiles=[crop('assets/processed/'+cell),crop(S+'/branchcells/'+cell),crop(S+'/recut/'+cell)];
const W=w*3+16, H=h;
const canvas=Buffer.alloc(W*H*3,30);
tiles.forEach((t,k)=>{for(let y=0;y<h;y++)for(let x=0;x<w;x++){const s=(y*w+x)*3,d=(y*W+k*(w+8)+x)*3;canvas[d]=t[s];canvas[d+1]=t[s+1];canvas[d+2]=t[s+2];}});
await sharp(canvas,{raw:{width:W,height:H,channels:3}}).resize(W*3,H*3,{kernel:'nearest'}).png().toFile(out);
console.log(out, W*3+'x'+H*3, 'main | branch | re-cut at 3x');
