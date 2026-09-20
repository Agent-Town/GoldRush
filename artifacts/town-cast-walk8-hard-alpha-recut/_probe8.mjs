import fs from 'node:fs';
import { PNG } from 'pngjs';
const SCR='/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/branchcells';
const bbox=(p,thr)=>{let x0=1e9,y0=1e9,x1=-1,y1=-1;for(let y=0;y<p.height;y++)for(let x=0;x<p.width;x++){const a=p.data[((y*p.width+x)<<2)+3]; if(a>=thr){if(x<x0)x0=x;if(y<y0)y0=y;if(x>x1)x1=x;if(y>y1)y1=y;}}return [x0,y0,x1,y1];};
for (const fam of ['char-elder-sheet-walk8','char-storekeeper-sheet-walk8','char-tavernkeeper-sheet-walk8']) {
  const j=JSON.parse(fs.readFileSync(`assets/processed/${fam}.frames.json`,'utf8'));
  let worst1=0,worst128=0,worstBr=0;
  for (const c of j.cells.slice(0,8)) {
    const mp=PNG.sync.read(fs.readFileSync('assets/processed/'+c.file));
    const b1=bbox(mp,1), b128=bbox(mp,128);
    const brf=SCR+'/'+c.file; const bb = fs.existsSync(brf)? bbox(PNG.sync.read(fs.readFileSync(brf)),128):null;
    const d=(a,b)=>Math.max(...a.map((v,i)=>Math.abs(v-b[i])));
    worst1=Math.max(worst1,d(c.bbox,b1)); worst128=Math.max(worst128,d(c.bbox,b128));
    if(bb) worstBr=Math.max(worstBr,d(c.bbox,bb));
  }
  console.log(fam,'sidecar vs main alpha>=1:',worst1,' vs main alpha>=128:',worst128,' vs branchBinary128:',worstBr);
}
