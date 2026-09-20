import fs from 'node:fs';
import { PNG } from 'pngjs';
import sharp from 'sharp';
const S='/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad';
const G=110,T=150;
const tile=(f)=>{const p=PNG.sync.read(fs.readFileSync(f));const b=Buffer.alloc(p.width*p.height*3);
 for(let i=0;i<p.width*p.height;i++){const o=i<<2,a=p.data[o+3]/255;for(let c=0;c<3;c++)b[i*3+c]=Math.round(p.data[o+c]*a+G*(1-a));}
 return sharp(b,{raw:{width:p.width,height:p.height,channels:3}}).resize(T,T,{kernel:'lanczos3'}).raw().toBuffer();};
const specs=process.argv.slice(3); // fam:row
const rowsOut=[];
for(const spec of specs){const [fam,row]=spec.split(':');
 const re=new RegExp(`^${fam}-r${row}c(\\d+)\\.png$`);
 const cells=fs.readdirSync('assets/processed').filter(f=>re.test(f)).sort((a,b)=>+a.match(re)[1]-+b.match(re)[1]);
 rowsOut.push({label:spec,cells});}
const cols=Math.max(...rowsOut.map(r=>r.cells.length));
const W=cols*T, H=rowsOut.length*2*T;
const canvas=Buffer.alloc(W*H*3,25);
let rr=0;
for(const r of rowsOut){
 for(const [src,dir] of [['assets/processed/',0],[S+'/recut/',1]]){
  for(let i=0;i<r.cells.length;i++){const t=await tile(src+r.cells[i]);
   for(let y=0;y<T;y++)for(let x=0;x<T;x++){const s=(y*T+x)*3,d=(((rr*2+dir)*T+y)*W+i*T+x)*3;canvas[d]=t[s];canvas[d+1]=t[s+1];canvas[d+2]=t[s+2];}}}
 rr++;}
await sharp(canvas,{raw:{width:W,height:H,channels:3}}).png().toFile(process.argv[2]);
console.log(process.argv[2],W+'x'+H,'pairs: main row then re-cut row for', specs.join(' '));
