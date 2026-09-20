import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { PNG } from 'pngjs';
const SCR='/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/branchcells';
const TMP='/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/zt';
const Z='/opt/homebrew/anaconda3/bin/zopflipng';
fs.mkdirSync(TMP,{recursive:true});
const encZ = (png) => { const a = `${TMP}/a.png`, b = `${TMP}/b.png`;
  fs.writeFileSync(a, PNG.sync.write(png)); try{fs.unlinkSync(b);}catch{}
  execFileSync(Z, ['-y', a, b], { stdio: 'pipe' });
  return { plain: fs.statSync(a).size, zopfli: fs.statSync(b).size };
};
const clone = (p) => { const q = new PNG({ width: p.width, height: p.height }); p.data.copy(q.data); return q; };
function bleedBand(png, limit) {
  const { width: w, height: h, data } = png;
  const valid = new Uint8Array(w*h); for(let i=0;i<w*h;i++) valid[i] = data[(i<<2)+3] ? 1 : 0;
  for (let round=0; round<limit; round++) {
    const added=[];
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x; if(valid[i])continue;
      let r=0,g=0,b=0,n=0;
      for(let dy=-1;dy<=1;dy++){const ny=y+dy; if(ny<0||ny>=h)continue;
        for(let dx=-1;dx<=1;dx++){const nx=x+dx; if(nx<0||nx>=w||(!dx&&!dy))continue;
          const ni=ny*w+nx; if(!valid[ni])continue; const o=ni<<2; r+=data[o];g+=data[o+1];b+=data[o+2];n++; }}
      if(!n)continue; added.push([i,Math.round(r/n),Math.round(g/n),Math.round(b/n)]); }
    if(!added.length) break;
    for(const [i,r,g,b] of added){const o=i<<2; data[o]=r;data[o+1]=g;data[o+2]=b; valid[i]=1;}
  }
  return valid;
}
const hard = (src, thr=128) => { const q = clone(src); const n=q.width*q.height;
  for(let i=0;i<n;i++){const o=(i<<2)+3; q.data[o] = src.data[o] >= thr ? 255 : 0;} return q; };
const flattenOutside = (png, valid, v=0) => { const n=png.width*png.height;
  for(let i=0;i<n;i++) if(!valid[i]){const o=i<<2; png.data[o]=v;png.data[o+1]=v;png.data[o+2]=v;} };
const quantOutside = (png, valid, step) => { const n=png.width*png.height;
  for(let i=0;i<n;i++) if(!valid[i]){const o=i<<2;
    for(let c=0;c<3;c++) png.data[o+c] = Math.min(255, Math.round(png.data[o+c]/step)*step); } };

for (const cell of ['char-youngster-m-sheet-walk8-r0c0.png','char-storekeeper-sheet-walk8-r0c0.png','char-elder-sheet-walk8-r0c0.png','char-hero-sheet-walk8-r0c0.png']) {
  const mainP = PNG.sync.read(fs.readFileSync('assets/processed/'+cell));
  const brP = PNG.sync.read(fs.readFileSync(SCR+'/'+cell));
  const res=[];
  res.push(['main shipped', fs.statSync('assets/processed/'+cell).size, encZ(mainP).zopfli]);
  res.push(['branch shipped', fs.statSync(SCR+'/'+cell).size, encZ(brP).zopfli]);
  for (const band of [0,1,2,3,4,8]) {
    const v = hard(brP); const valid = bleedBand(v, band); flattenOutside(v, valid, 0);
    const e = encZ(v); res.push([`hard + ${band}px bleed + black`, e.plain, e.zopfli]);
  }
  for (const step of [16,32,64]) {
    const v = hard(brP); const valid = bleedBand(v, 2);
    // quantize everything outside the 2px band, keep band exact
    const v2 = clone(v); const validAll = bleedBand(v2, 1e9);
    for (let i=0;i<v.width*v.height;i++) if(!valid[i]) { const o=i<<2; v.data[o]=v2.data[o];v.data[o+1]=v2.data[o+1];v.data[o+2]=v2.data[o+2]; }
    quantOutside(v, valid, step);
    const e = encZ(v); res.push([`hard + 2px exact + full bleed quant${step}`, e.plain, e.zopfli]);
  }
  console.log('--- '+cell);
  for (const [k,a,b] of res) console.log('   plain '+String(a).padStart(7)+'  zopfli '+String(b).padStart(7)+'  '+k);
}
