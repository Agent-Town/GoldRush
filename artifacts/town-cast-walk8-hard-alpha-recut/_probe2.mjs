import fs from 'node:fs';
import { PNG } from 'pngjs';
import sharp from 'sharp';
const SCR='/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/branchcells';
const enc = async (png) => (await sharp(Buffer.from(png.data), { raw: { width: png.width, height: png.height, channels: 4 } })
  .png({ compressionLevel: 9, effort: 10, palette: false }).toBuffer()).length;
const encPngjs = (png) => PNG.sync.write(png, { deflateLevel: 9 }).length;
const clone = (p) => { const q = new PNG({ width: p.width, height: p.height }); p.data.copy(q.data); return q; };

function bleed(png, mask /* Uint8Array valid */, limit = Infinity) {
  const { width: w, height: h, data } = png;
  const valid = Uint8Array.from(mask);
  let rounds = 0;
  for (;;) {
    if (rounds++ >= limit) break;
    const added = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y*w+x; if (valid[i]) continue;
      let r=0,g=0,b=0,n=0;
      for (let dy=-1;dy<=1;dy++){const ny=y+dy; if(ny<0||ny>=h)continue;
        for(let dx=-1;dx<=1;dx++){const nx=x+dx; if(nx<0||nx>=w||(!dx&&!dy))continue;
          const ni=ny*w+nx; if(!valid[ni])continue; const o=ni<<2; r+=data[o];g+=data[o+1];b+=data[o+2];n++; }}
      if(!n)continue; added.push([i,Math.round(r/n),Math.round(g/n),Math.round(b/n)]);
    }
    if(!added.length)break;
    for(const [i,r,g,b] of added){const o=i<<2; data[o]=r;data[o+1]=g;data[o+2]=b; valid[i]=1;}
  }
  return valid;
}

for (const cell of ['char-youngster-m-sheet-walk8-r0c0.png','char-storekeeper-sheet-walk8-r0c0.png','char-elder-sheet-walk8-r0c0.png']) {
  const mainBuf = fs.readFileSync('assets/processed/'+cell);
  const brBuf = fs.readFileSync(SCR+'/'+cell);
  const mainP = PNG.sync.read(mainBuf), brP = PNG.sync.read(brBuf);
  const n = brP.width*brP.height;
  const rows = [];
  rows.push(['main as shipped', mainBuf.length]);
  rows.push(['main re-enc sharp9/10', await enc(mainP)]);
  rows.push(['branch as shipped', brBuf.length]);
  rows.push(['branch re-enc sharp9/10', await enc(brP)]);

  // V1: branch RGB, hard binary alpha at 128, field = branch's existing bled RGB
  const v1 = clone(brP);
  for (let i=0;i<n;i++){const o=(i<<2)+3; v1.data[o] = brP.data[o] >= 128 ? 255 : 0;}
  rows.push(['V1 hard alpha, branch field', await enc(v1)]);

  // V2: hard alpha + fresh full bleed from the hard mask
  const v2 = clone(brP);
  for (let i=0;i<n;i++){const o=(i<<2)+3; v2.data[o] = brP.data[o] >= 128 ? 255 : 0;}
  { const valid = new Uint8Array(n); for(let i=0;i<n;i++) valid[i] = v2.data[(i<<2)+3] ? 1 : 0; bleed(v2, valid); }
  rows.push(['V2 hard alpha + fresh full bleed', await enc(v2)]);

  // V3: hard alpha + field flat black
  const v3 = clone(brP);
  for (let i=0;i<n;i++){const o=i<<2; if(brP.data[o+3] >= 128){v3.data[o+3]=255;} else {v3.data[o]=0;v3.data[o+1]=0;v3.data[o+2]=0;v3.data[o+3]=0;}}
  rows.push(['V3 hard alpha + flat black field', await enc(v3)]);

  // V4: hard alpha + 8px bleed then flat black
  const v4 = clone(brP);
  for (let i=0;i<n;i++){const o=(i<<2)+3; v4.data[o] = brP.data[o] >= 128 ? 255 : 0;}
  { const valid = new Uint8Array(n); for(let i=0;i<n;i++) valid[i] = v4.data[(i<<2)+3] ? 1 : 0;
    const after = bleed(v4, valid, 8);
    for(let i=0;i<n;i++) if(!after[i]){const o=i<<2; v4.data[o]=0;v4.data[o+1]=0;v4.data[o+2]=0;} }
  rows.push(['V4 hard alpha + 8px bleed + black', await enc(v4)]);

  // V5: branch alpha unchanged + fresh bleed (isolate: is it the field or the alpha?)
  const v5 = clone(brP);
  { const valid = new Uint8Array(n); for(let i=0;i<n;i++) valid[i] = v5.data[(i<<2)+3] ? 1 : 0; bleed(v5, valid); }
  rows.push(['V5 branch alpha + fresh full bleed', await enc(v5)]);

  // V6: branch alpha + flat black field (isolates the field cost alone)
  const v6 = clone(brP);
  for (let i=0;i<n;i++){const o=i<<2; if(!brP.data[o+3]){v6.data[o]=0;v6.data[o+1]=0;v6.data[o+2]=0;}}
  rows.push(['V6 branch alpha + flat black field', await enc(v6)]);

  console.log('--- '+cell);
  for (const [k,v] of rows) console.log('   '+String(v).padStart(8)+'  '+k);
}
