#!/usr/bin/env node
// Item 5 instrument: is a family's opaque-RGB change CONFINED TO THE EDGE (a despill)
// or does it reach the interior (a repaint)? For every changed opaque pixel, measure the
// Chebyshev distance to the nearest pixel that is not fully opaque in MAIN's own alpha.
// Also censuses the pale/grey halo on semi-transparent pixels (the 8a8a8a cutout key),
// which the violet census does not see.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { PNG } from 'pngjs';

const BR = '92f6cc115';
const files = fs.readFileSync('artifacts/sprites-split-land/modified-files.txt','utf8').trim().split('\n')
  .filter(f => f.startsWith('assets/processed/') && f.endsWith('.png'));
const stemOf = (f) => path.basename(f).replace(/-r\d+c\d+\.png$/,'').replace(/\.png$/,'');
const CAND = new RegExp(process.env.CAND || '^(char-bandit-|char-baron-|char-coalthief-|char-railtough-|char-steamwrecker-|char-e[6-9]-|char-jumper-|char-prospector-sheet-hover4)');
const byStem = new Map();
for (const f of files) { const s = stemOf(f); if (CAND.test(s)) { if(!byStem.has(s)) byStem.set(s,[]); byStem.get(s).push(f); } }

const isGrey = (r,g,b) => Math.max(Math.abs(r-138),Math.abs(g-138),Math.abs(b-138)) <= 28
  && (Math.max(r,g,b)-Math.min(r,g,b)) <= 14;
const out = [];
for (const [stem, fl] of [...byStem].sort()) {
  let beyond1=0, beyond3=0, maxDist=0, changed=0;
  let greyA=0, greyB=0, semiA=0;
  for (const f of fl) {
    const a = PNG.sync.read(execFileSync('git',['show',`main:${f}`],{maxBuffer:64*1024*1024}));
    const b = PNG.sync.read(execFileSync('git',['show',`${BR}:${f}`],{maxBuffer:64*1024*1024}));
    if (a.width!==b.width||a.height!==b.height) continue;
    const W=a.width, H=a.height;
    for (let y=0;y<H;y++) for (let x=0;x<W;x++){
      const o=(y*W+x)<<2;
      const aa=a.data[o+3];
      if (aa>0 && aa<255) { semiA++;
        if (isGrey(a.data[o],a.data[o+1],a.data[o+2])) greyA++;
        if (isGrey(b.data[o],b.data[o+1],b.data[o+2])) greyB++; }
      if (aa!==255) continue;
      if (a.data[o]===b.data[o] && a.data[o+1]===b.data[o+1] && a.data[o+2]===b.data[o+2]) continue;
      changed++;
      let d=99;
      for (let r=1;r<=6 && d===99;r++){
        outer: for (let dy=-r;dy<=r;dy++) for (let dx=-r;dx<=r;dx++){
          if (Math.max(Math.abs(dx),Math.abs(dy))!==r) continue;
          const nx=x+dx, ny=y+dy;
          if (nx<0||ny<0||nx>=W||ny>=H) { d=r; break outer; }
          if (a.data[((ny*W+nx)<<2)+3]!==255) { d=r; break outer; }
        }
      }
      if (d>maxDist) maxDist=d;
      if (d>1) beyond1++;
      if (d>3) beyond3++;
    }
  }
  out.push({stem, changed, beyond1, beyond3, maxDist, greyA, greyB, semiA});
  console.log(`${stem}\tchangedOpaque=${changed}\t>1px=${beyond1}\t>3px=${beyond3}\tmaxDist=${maxDist===99?'>6':maxDist}\tgreyFringe ${greyA}->${greyB} of ${semiA} semi`);
}
fs.writeFileSync('artifacts/sprites-split-land/edge-confinement-census.json', JSON.stringify(out,null,1));
