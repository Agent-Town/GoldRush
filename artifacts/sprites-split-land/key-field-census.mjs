#!/usr/bin/env node
// The other half of "key pixels after vs before": the sweep's own subject — KEY COLOUR UNDER FULLY
// TRANSPARENT PIXELS. Invisible to a naive eye, but GPU bilinear filtering pulls it into the visible
// rim, which is the entire reason bleedEdges and scripts/halo-reextraction-check.mjs exist.
import fs from 'node:fs'; import path from 'node:path';
import { execFileSync } from 'node:child_process'; import { PNG } from 'pngjs';
const BR = '92f6cc115';
const stems = fs.readFileSync('artifacts/sprites-split-land/landed-stems.txt','utf8').trim().split('\n');
const all = fs.readFileSync('artifacts/sprites-split-land/modified-files.txt','utf8').trim().split('\n')
  .filter(f => f.startsWith('assets/processed/') && f.endsWith('.png'));
const stemOf = f => path.basename(f).replace(/-r\d+c\d+\.png$/,'').replace(/\.png$/,'');
const out = [];
for (const stem of stems) {
  const fl = all.filter(f => stemOf(f) === stem);
  let ka=0, kb=0, ta=0, tb=0;
  for (const f of fl) {
    const a = PNG.sync.read(execFileSync('git',['show',`main:${f}`],{maxBuffer:64*1024*1024}));
    const b = PNG.sync.read(execFileSync('git',['show',`${BR}:${f}`],{maxBuffer:64*1024*1024}));
    for (let i=0;i<a.width*a.height;i++){ const o=i<<2;
      if (a.data[o+3]===0){ ta++; const h=(a.data[o]<<16)|(a.data[o+1]<<8)|a.data[o+2]; if(h===0xff00ff||h===0x8a8a8a) ka++; }
      if (b.data[o+3]===0){ tb++; const h=(b.data[o]<<16)|(b.data[o+1]<<8)|b.data[o+2]; if(h===0xff00ff||h===0x8a8a8a) kb++; }
    }
  }
  out.push({stem, cells: fl.length, transparentMain: ta, keyUnderTransparentMain: ka, transparentLanded: tb, keyUnderTransparentLanded: kb});
  console.log(`${stem}\tcells=${fl.length}\tkeyUnderTransparent ${ka} -> ${kb}\t(of ${ta} -> ${tb} transparent px)`);
}
fs.writeFileSync('artifacts/sprites-split-land/key-field-census.json', JSON.stringify(out,null,1));
