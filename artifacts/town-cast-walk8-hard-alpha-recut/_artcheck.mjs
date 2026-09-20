import fs from 'node:fs';
import { PNG } from 'pngjs';
import sharp from 'sharp';
const S='/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad';
const G=110, T=200;
const tile=(file)=>{const p=PNG.sync.read(fs.readFileSync(file));const b=Buffer.alloc(p.width*p.height*3);
 for(let i=0;i<p.width*p.height;i++){const o=i<<2,a=p.data[o+3]/255;for(let c=0;c<3;c++)b[i*3+c]=Math.round(p.data[o+c]*a+G*(1-a));}
 return sharp(b,{raw:{width:p.width,height:p.height,channels:3}}).resize(T,T,{kernel:'lanczos3'}).raw().toBuffer();};
const cells=process.argv.slice(2);
const W=T*3+8, H=T*cells.length;
const canvas=Buffer.alloc(W*H*3,25);
for(let k=0;k<cells.length;k++){
  const c=cells[k];
  const ts=[await tile('assets/processed/'+c), await tile(S+'/branchcells/'+c), await tile(S+'/recut/'+c)];
  ts.forEach((t,j)=>{for(let y=0;y<T;y++)for(let x=0;x<T;x++){const s=(y*T+x)*3,d=((k*T+y)*W+j*(T+4)+x)*3;canvas[d]=t[s];canvas[d+1]=t[s+1];canvas[d+2]=t[s+2];}});
}
await sharp(canvas,{raw:{width:W,height:H,channels:3}}).png().toFile(process.env.OUT||'/tmp/artcheck.png');
console.log(process.env.OUT||'/tmp/artcheck.png', W+'x'+H, cells.join(' '));
