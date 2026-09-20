import fs from 'node:fs';
import { PNG } from 'pngjs';
const S='/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad';
const box=(p)=>{let x0=1e9,y0=1e9,x1=-1,y1=-1;for(let y=0;y<p.height;y++)for(let x=0;x<p.width;x++){if(p.data[((y*p.width+x)<<2)+3]>=128){if(x<x0)x0=x;if(y<y0)y0=y;if(x>x1)x1=x;if(y>y1)y1=y;}}return{x0,y0,x1,y1,h:y1-y0+1,w:x1-x0+1};};
const fams=process.argv.slice(2);
for (const fam of fams) {
  const re=new RegExp(`^${fam}-r\\d+c\\d+\\.png$`);
  const cells=fs.readdirSync('assets/processed').filter(f=>re.test(f)).sort();
  const rows=[];
  for(const c of cells){
    const m=box(PNG.sync.read(fs.readFileSync('assets/processed/'+c)));
    const r=box(PNG.sync.read(fs.readFileSync(S+'/recut/'+c)));
    rows.push({c,mh:m.h,rh:r.h,dh:r.h-m.h,mt:m.y0,rt:r.y0,mb:m.y1,rb:r.y1,mw:m.w,rw:r.w});
  }
  rows.sort((a,b)=>Math.abs(b.dh)-Math.abs(a.dh));
  console.log('### '+fam);
  for(const r of rows.slice(0,6)) console.log(`   ${r.c} h ${r.mh}->${r.rh} (${r.dh>=0?'+':''}${r.dh}) top ${r.mt}->${r.rt} bottom ${r.mb}->${r.rb} w ${r.mw}->${r.rw}`);
  const dh=rows.map(r=>r.dh); const mean=(dh.reduce((a,b)=>a+b,0)/dh.length).toFixed(2);
  console.log(`   cells=${rows.length} meanΔh=${mean} within±2: ${dh.filter(v=>Math.abs(v)<=2).length}`);
}
