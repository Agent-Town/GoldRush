#!/usr/bin/env node
// Is a held family byte-different but PIXEL-IDENTICAL — i.e. re-encoded larger for no visual change?
// (reviews/drain-review-sprites-roster.md: "Free bytes on the table: 3,277,125 B for zero visual change".)
// Compares every RGBA byte, main vs the branch. Full-RGBA equality is a stronger test than the
// alpha/opaque-RGB pair, because it also catches a change under fully transparent pixels — which is
// invisible to the eye but NOT to GPU bilinear filtering, and is the whole subject of the halo work.
import fs from 'node:fs'; import path from 'node:path';
import { execFileSync } from 'node:child_process'; import { PNG } from 'pngjs';
const BR = '92f6cc115';
const re = new RegExp(process.argv[2] || '^(townsfolk-|boss-railcar-|enemy-claim-jumper)');
const files = fs.readFileSync('artifacts/sprites-split-land/modified-files.txt','utf8').trim().split('\n')
  .filter(f => f.startsWith('assets/processed/') && f.endsWith('.png'))
  .filter(f => re.test(path.basename(f)));
let identical = 0; const differs = [];
for (const f of files) {
  const a = PNG.sync.read(execFileSync('git',['show',`main:${f}`],{maxBuffer:64*1024*1024}));
  const b = PNG.sync.read(execFileSync('git',['show',`${BR}:${f}`],{maxBuffer:64*1024*1024}));
  if (a.width===b.width && a.height===b.height && Buffer.compare(Buffer.from(a.data), Buffer.from(b.data))===0) identical++;
  else differs.push(f);
}
console.log(`${files.length} files compared: ${identical} PIXEL-IDENTICAL, ${differs.length} differ`);
differs.forEach((d) => console.log('  DIFFERS ' + d));
