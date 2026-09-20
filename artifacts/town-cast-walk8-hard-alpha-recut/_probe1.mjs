import fs from 'node:fs';
import { PNG } from 'pngjs';
const SCR='/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/branchcells';
for (const cell of ['char-youngster-m-sheet-walk8-r0c0.png','char-storekeeper-sheet-walk8-r0c0.png']) {
  for (const [label, buf] of [['main', fs.readFileSync('assets/processed/'+cell)], ['branch', fs.readFileSync(SCR+'/'+cell)]]) {
    const p = PNG.sync.read(buf);
    const n = p.width*p.height;
    // alpha histogram buckets
    const hist = new Array(9).fill(0);
    let partial=0, opaque=0, transp=0;
    const fieldColors = new Map();
    for (let i=0;i<n;i++){ const o=i<<2, a=p.data[o+3];
      if(a===0){transp++; const k=(p.data[o]<<16)|(p.data[o+1]<<8)|p.data[o+2]; fieldColors.set(k,(fieldColors.get(k)||0)+1);}
      else if(a===255)opaque++; else {partial++; hist[Math.min(8,(a>>5))]++;}
    }
    // perimeter of binarized mask (a>=128): opaque px with a 4-neighbour <128
    let perim=0;
    const A=(x,y)=> (x<0||y<0||x>=p.width||y>=p.height)?0:p.data[((y*p.width+x)<<2)+3];
    for(let y=0;y<p.height;y++)for(let x=0;x<p.width;x++){ if(A(x,y)>=128 && (A(x-1,y)<128||A(x+1,y)<128||A(x,y-1)<128||A(x,y+1)<128)) perim++; }
    const top = [...fieldColors.entries()].sort((a,b)=>b[1]-a[1]).slice(0,4).map(([k,v])=>`#${k.toString(16).padStart(6,'0')}:${v}`);
    console.log(`${cell} ${label} ${p.width}x${p.height} bytes=${buf.length} opaque=${opaque} partial=${partial} transp=${transp} perim(bin)=${perim} distinctField=${fieldColors.size} topField=${top.join(' ')} alphaHist=${hist.join(',')}`);
  }
}
