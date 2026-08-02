#!/usr/bin/env node
/**
 * BEAUTY BOARD TOOLING — recompress capture PNGs and build before/after pair boards.
 *
 * The beauty shifts judge by render, so every upgrade produces a pair; pairs are what the review
 * shows and what a reader can check without booting anything. Full-res captures are ~1.5 MB each
 * straight out of playwright, and a branch that pushes tens of megabytes of them dies on the remote
 * (verified failure mode: large packs report exit 0 and land nothing). So:
 *
 *   optimize <label>            recompress in place at max PNG effort — same pixels, ~55% the bytes
 *   pair <before> <after> <dir> write <shot>.png = before | after, side by side, halved
 *
 * Pixels are never resampled by `optimize` — a tiling fingerprint or a banding artefact must survive
 * the trip to the review intact, which is the whole reason these boards exist.
 */
import { mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const ROOT = path.resolve('artifacts/beauty-dry-gulch');
const PROJECTS = ['desktop-chrome', 'mobile-chrome'];

const [command, ...args] = process.argv.slice(2);

if (command === 'optimize') await optimize(args[0]);
else if (command === 'pair') await pair(args[0], args[1], args[2]);
else {
  console.error('usage: beauty-board.mjs optimize <label> | pair <beforeLabel> <afterLabel> <outDir>');
  process.exit(2);
}

async function optimize(label) {
  if (!label) throw new Error('optimize needs a label');
  let saved = 0;
  let total = 0;
  for (const file of pngsUnder(path.join(ROOT, label))) {
    const before = statSync(file).size;
    const buffer = await sharp(file).png({ compressionLevel: 9, effort: 10 }).toBuffer();
    if (buffer.length < before) writeFileSync(file, buffer);
    saved += Math.max(0, before - buffer.length);
    total += Math.min(before, buffer.length);
  }
  console.log(`optimize ${label}: ${kb(total)} kept, ${kb(saved)} saved`);
}

async function pair(beforeLabel, afterLabel, outDir) {
  if (!beforeLabel || !afterLabel || !outDir) throw new Error('pair needs <before> <after> <outDir>');
  mkdirSync(outDir, { recursive: true });
  const written = [];
  for (const project of PROJECTS) {
    const beforeDir = path.join(ROOT, beforeLabel, project);
    const afterDir = path.join(ROOT, afterLabel, project);
    let shots = [];
    try {
      shots = readdirSync(afterDir).filter((name) => name.endsWith('.png')).sort();
    } catch {
      continue; // this label never captured this project — say so rather than inventing a pair
    }
    for (const shot of shots) {
      const left = path.join(beforeDir, shot);
      const right = path.join(afterDir, shot);
      if (!exists(left)) {
        console.log(`  skip ${project}/${shot}: no ${beforeLabel} side`);
        continue;
      }
      const meta = await sharp(left).metadata();
      const width = Math.round(meta.width / 2);
      const height = Math.round(meta.height / 2);
      const [a, b] = await Promise.all([
        sharp(left).resize(width, height).toBuffer(),
        sharp(right).resize(width, height).toBuffer(),
      ]);
      const out = path.join(outDir, `${project}-${shot}`);
      await sharp({
        create: { width: width * 2 + 8, height, channels: 3, background: '#2e1b0e' },
      })
        .composite([{ input: a, left: 0, top: 0 }, { input: b, left: width + 8, top: 0 }])
        .png({ compressionLevel: 9, effort: 10 })
        .toFile(out);
      written.push(out);
    }
  }
  console.log(`pair ${beforeLabel} -> ${afterLabel}: ${written.length} boards in ${outDir}`);
}

function pngsUnder(dir) {
  const found = [];
  const walk = (current) => {
    let entries = [];
    try {
      entries = readdirSync(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.png')) found.push(full);
    }
  };
  walk(dir);
  return found;
}

function exists(file) {
  try {
    statSync(file);
    return true;
  } catch {
    return false;
  }
}

function kb(bytes) {
  return `${Math.round(bytes / 1024)} KB`;
}
