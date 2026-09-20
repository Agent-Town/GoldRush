#!/usr/bin/env node
// Item 5 eyes-on: for one family, compose MAIN (row 1) / LANDED (row 2) / 8x amplified abs-diff (row 3)
// over a mid-grey ground so alpha reads. usage: node contact-sheet.mjs <stem> [out.png] [maxCells]
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { PNG } from 'pngjs';

const stem = process.argv[2];
const out = process.argv[3] || `artifacts/sprites-split-land/contact-${stem}.png`;
const maxCells = Number(process.argv[4] || 8);
const BR = '92f6cc115';
const all = fs.readFileSync('artifacts/sprites-split-land/modified-files.txt','utf8').trim().split('\n')
  .filter(f => f.startsWith('assets/processed/') && f.endsWith('.png'))
  .filter(f => path.basename(f).replace(/-r\d+c\d+\.png$/,'').replace(/\.png$/,'') === stem);
if (!all.length) { console.error('no cells for ' + stem); process.exit(1); }
const step = Math.max(1, Math.floor(all.length / maxCells));
const cells = all.filter((_, i) => i % step === 0).slice(0, maxCells);
const TH = 128;
const W = TH * cells.length, H = TH * 3;
const sheet = new PNG({ width: W, height: H });
for (let i = 0; i < W*H; i++) { const o=i<<2; sheet.data[o]=90; sheet.data[o+1]=90; sheet.data[o+2]=96; sheet.data[o+3]=255; }
const put = (src, col, row, mode) => {
  const sx = src.width / TH, sy = src.height / TH;
  for (let y=0;y<TH;y++) for (let x=0;x<TH;x++){
    const so = ((Math.floor(y*sy)*src.width + Math.floor(x*sx))<<2);
    const doff = (((row*TH + y)*W) + col*TH + x) << 2;
    const a = src.data[so+3]/255;
    if (mode === 'diff') {
      for (let c=0;c<3;c++) sheet.data[doff+c] = Math.min(255, src.data[so+c]*8);
      sheet.data[doff+3] = 255;
    } else {
      for (let c=0;c<3;c++) sheet.data[doff+c] = Math.round(src.data[so+c]*a + [90,90,96][c]*(1-a));
      sheet.data[doff+3] = 255;
    }
  }
};
cells.forEach((f, i) => {
  const a = PNG.sync.read(execFileSync('git',['show',`main:${f}`],{maxBuffer:64*1024*1024}));
  const b = PNG.sync.read(execFileSync('git',['show',`${BR}:${f}`],{maxBuffer:64*1024*1024}));
  put(a, i, 0); put(b, i, 1);
  const d = new PNG({ width: a.width, height: a.height });
  for (let p=0;p<a.width*a.height;p++){ const o=p<<2;
    for (let c=0;c<3;c++) d.data[o+c] = Math.abs(a.data[o+c]-b.data[o+c]);
    d.data[o+3] = 255; }
  put(d, i, 2, 'diff');
});
fs.writeFileSync(out, PNG.sync.write(sheet));
console.log(`${out}  ${cells.length} cells of ${all.length}  (row1 main / row2 landed / row3 8x abs-diff)`);
