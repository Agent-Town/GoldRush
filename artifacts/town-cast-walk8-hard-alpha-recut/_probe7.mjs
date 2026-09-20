import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { PNG } from 'pngjs';
const SCR='/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/branchcells';
const TMP='/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/zt';
const Z='/opt/homebrew/anaconda3/bin/zopflipng';
let seq=0;
const encZ=(png)=>{const a=`${TMP}/e${seq}.png`,b=`${TMP}/f${seq}.png`;seq++;
  fs.writeFileSync(a,PNG.sync.write(png));try{fs.unlinkSync(b);}catch{}
  execFileSync(Z,['-y',a,b],{stdio:'pipe'});return fs.statSync(b).size;};
const cell='char-storekeeper-sheet-walk8-r0c0.png';
const br=PNG.sync.read(fs.readFileSync(SCR+'/'+cell));
const {width:w,height:h}=br,n=w*h;
const bin=new Uint8Array(n);for(let i=0;i<n;i++)bin[i]=br.data[(i<<2)+3]>=128?1:0;
const mk=(ring)=>{const q=new PNG({width:w,height:h});br.data.copy(q.data);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x,o=i<<2;
    if(bin[i]){let b2=false;
      for(let dy=-1;dy<=1&&!b2;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=w||ny>=h||!bin[ny*w+nx]){b2=true;break;}}
      q.data[o+3]=(ring&&b2)?Math.max(1,br.data[o+3]):255;
    } else {q.data[o]=0;q.data[o+1]=0;q.data[o+2]=0;q.data[o+3]=0;}}
  return q;};
const A=mk(false),B=mk(true);
let d=0,da=0;for(let i=0;i<n*4;i++) if(A.data[i]!==B.data[i]){d++; if(i%4===3)da++;}
console.log('byte diffs',d,'alpha diffs',da);
console.log('plain A',PNG.sync.write(A).length,'plain B',PNG.sync.write(B).length);
console.log('zopfli A',encZ(A),'zopfli B',encZ(B));
console.log('zopfli A again',encZ(A),'zopfli B again',encZ(B));
