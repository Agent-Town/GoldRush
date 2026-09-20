import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { PNG } from 'pngjs';

const BR = '92f6cc115';
const modFiles = fs.readFileSync('artifacts/sprites-split-land/modified-files.txt','utf8').trim().split('\n')
  .filter(f => f.startsWith('assets/processed/') && f.endsWith('.png'));
const stemOf = (f) => path.basename(f).replace(/-r\d+c\d+\.png$/,'').replace(/\.png$/,'');
const CAND = /^(char-bandit-|char-baron-|char-coalthief-|char-railtough-|char-steamwrecker-|char-e[6-9]-|char-jumper-|enemy-claim-jumper|char-prospector-(complainant|gilded)|char-prospector-sheet-hover4|boss-railcar-|char-hero-sheet-walk4)/;
const files = modFiles.filter(f => CAND.test(stemOf(f)));
const byStem = new Map();
for (const f of files) { const s = stemOf(f); if(!byStem.has(s)) byStem.set(s,[]); byStem.get(s).push(f); }

const isViolet = (r,g,b) => (r-g) >= 40 && (b-g) >= 40;
const out = [];
for (const [stem, fl] of [...byStem].sort()) {
  let cells=0, alphaDiff=0, maxAlphaDelta=0, opaqueRgbDiff=0, maxRgbDelta=0;
  let keyA=0, keyB=0, visKeyA=0, visKeyB=0, dimMismatch=[];
  let topA=1e9, botA=-1, topB=1e9, botB=-1;
  for (const f of fl) {
    let a, b;
    try { a = PNG.sync.read(execFileSync('git',['show',`main:${f}`],{maxBuffer:64*1024*1024})); } catch { continue; }
    try { b = PNG.sync.read(execFileSync('git',['show',`${BR}:${f}`],{maxBuffer:64*1024*1024})); } catch { continue; }
    cells++;
    if (a.width!==b.width||a.height!==b.height) { dimMismatch.push(`${path.basename(f)} ${a.width}x${a.height}->${b.width}x${b.height}`); continue; }
    const n = a.width*a.height;
    for (let i=0;i<n;i++){
      const o=i<<2;
      const aa=a.data[o+3], ab=b.data[o+3];
      const y = (i / a.width) | 0;
      if (aa>=128){ if(y<topA)topA=y; if(y>botA)botA=y; }
      if (ab>=128){ if(y<topB)topB=y; if(y>botB)botB=y; }
      if (aa!==0 && isViolet(a.data[o],a.data[o+1],a.data[o+2])) { keyA++; if(aa>=16) visKeyA++; }
      if (ab!==0 && isViolet(b.data[o],b.data[o+1],b.data[o+2])) { keyB++; if(ab>=16) visKeyB++; }
      const ad = Math.abs(aa-ab);
      if (ad) { alphaDiff++; if(ad>maxAlphaDelta) maxAlphaDelta=ad; }
      if (aa===255){
        const dr=Math.abs(a.data[o]-b.data[o]), dg=Math.abs(a.data[o+1]-b.data[o+1]), db=Math.abs(a.data[o+2]-b.data[o+2]);
        if (dr||dg||db){ opaqueRgbDiff++; const m=Math.max(dr,dg,db); if(m>maxRgbDelta) maxRgbDelta=m; }
      }
    }
  }
  out.push({stem, cells, alphaDiff, maxAlphaDelta, opaqueRgbDiff, maxRgbDelta, keyA, keyB, visKeyA, visKeyB,
            heightA: botA-topA+1, heightB: botB-topB+1, topA, botA, topB, botB, dimMismatch});
  console.log(`${stem}\tcells=${cells}\talphaDiff=${alphaDiff}(max ${maxAlphaDelta})\topaqueRGB=${opaqueRgbDiff}(max ${maxRgbDelta})\tkey ${keyA}->${keyB} (vis ${visKeyA}->${visKeyB})\th ${botA-topA+1}->${botB-topB+1} [${topA}-${botA} -> ${topB}-${botB}]${dimMismatch.length?' DIM:'+dimMismatch.join(','):''}`);
}
fs.writeFileSync('artifacts/sprites-split-land/family-pixel-census.json', JSON.stringify(out,null,1));
