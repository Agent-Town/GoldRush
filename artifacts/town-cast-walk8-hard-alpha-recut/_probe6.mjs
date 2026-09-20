import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { PNG } from 'pngjs';
const SCR='/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/branchcells';
const TMP='/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/zt';
const Z='/opt/homebrew/anaconda3/bin/zopflipng';
const encZ = (png) => { const a=`${TMP}/c.png`, b=`${TMP}/d.png`;
  fs.writeFileSync(a, PNG.sync.write(png)); try{fs.unlinkSync(b);}catch{}
  execFileSync(Z,['-y',a,b],{stdio:'pipe'}); return fs.statSync(b).size; };
const clone=(p)=>{const q=new PNG({width:p.width,height:p.height}); p.data.copy(q.data); return q;};

// 1. What colour is main's transparent field NEXT TO the figure?
for (const cell of ['char-youngster-m-sheet-walk8-r0c0.png','char-storekeeper-sheet-walk8-r0c0.png','char-hero-sheet-walk8-r0c0.png','char-elder-sheet-walk8-r0c0.png']) {
  const p = PNG.sync.read(fs.readFileSync('assets/processed/'+cell));
  const {width:w,height:h,data}=p;
  const A=(x,y)=>(x<0||y<0||x>=w||y>=h)?0:data[((y*w+x)<<2)+3];
  const counts=new Map(); let ring=0;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){ const i=y*w+x,o=i<<2;
    if(data[o+3]!==0) continue;
    let touches=false;
    for(let dy=-1;dy<=1&&!touches;dy++)for(let dx=-1;dx<=1;dx++){ if(!dx&&!dy)continue; if(A(x+dx,y+dy)>0){touches=true;break;} }
    if(!touches) continue; ring++;
    const k=(data[o]<<16)|(data[o+1]<<8)|data[o+2]; counts.set(k,(counts.get(k)||0)+1);
  }
  const top=[...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,v])=>`#${k.toString(16).padStart(6,'0')}:${v}`);
  console.log(`MAIN 1px-outside-ring ${cell}: ring=${ring} colours=${counts.size} top=${top.join(' ')}`);
}

// 2. variant: keep a ONE-PIXEL PARTIAL RING from the branch alpha, black field
console.log('--- variants (zopfli bytes) ---');
for (const cell of ['char-youngster-m-sheet-walk8-r0c0.png','char-storekeeper-sheet-walk8-r0c0.png','char-hero-sheet-walk8-r0c0.png']) {
  const mainSz = fs.statSync('assets/processed/'+cell).size;
  const br = PNG.sync.read(fs.readFileSync(SCR+'/'+cell));
  const n=br.width*br.height, w=br.width,h=br.height;
  const mk = (mode, quant=0) => {
    const q=clone(br);
    const bin=new Uint8Array(n); for(let i=0;i<n;i++) bin[i]= br.data[(i<<2)+3]>=128?1:0;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){ const i=y*w+x,o=i<<2;
      const isIn=bin[i];
      let boundary=false;
      if(isIn){ for(let dy=-1;dy<=1&&!boundary;dy++)for(let dx=-1;dx<=1;dx++){ if(!dx&&!dy)continue; const nx=x+dx,ny=y+dy; if(nx<0||ny<0||nx>=w||ny>=h||!bin[ny*w+nx]){boundary=true;break;} } }
      if(isIn){ q.data[o+3] = (mode==='ring' && boundary) ? Math.max(1, br.data[o+3]) : 255; }
      else { q.data[o+3]=0; q.data[o]=0;q.data[o+1]=0;q.data[o+2]=0; }
    }
    return q;
  };
  const hard0 = mk('hard');
  const ring = mk('ring');
  let partialRing=0; for(let i=0;i<n;i++){const a=ring.data[(i<<2)+3]; if(a>0&&a<255) partialRing++;}
  let mainPartial=0; { const mp=PNG.sync.read(fs.readFileSync('assets/processed/'+cell)); for(let i=0;i<n;i++){const a=mp.data[(i<<2)+3]; if(a>0&&a<255) mainPartial++;} }
  console.log(`${cell}: main=${mainSz} hardBlack=${encZ(hard0)} ringPartialBlack=${encZ(ring)} (ringPartialPx=${partialRing}, mainPartialPx=${mainPartial})`);
}
