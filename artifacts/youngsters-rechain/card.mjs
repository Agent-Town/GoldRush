#!/usr/bin/env node
// card.mjs — youngsters-rechain. The TRUE card crop, reproduced from the CSS rather than eyeballed,
// so the eyes-on look at what a player looks at.
//
// The story card renders a portrait with `object-fit: cover` + `object-position: <x>% <y>%` into a
// box that is TALLER THAN WIDE (74x90 desktop, 58x76 mobile - src/story/story.css:186-187, :253-254).
// A SQUARE 384 source therefore scales by HEIGHT (scale = boxH/384), overflows horizontally by
// (384*scale - boxW), and the X term of object-position slides that overflow. The Y term is inert.
//
//   card <out.png> <boxW>x<boxH> <zoom> <xPercent> <file>[::label] ...
//     zoom = integer nearest-neighbour magnification of the finished card (1 = true size).
//
// Nearest-neighbour on purpose at zoom > 1: it magnifies the ACTUAL card pixels rather than
// inventing smoother ones, so a face that is mush at 74 px reads as mush here too.
import fs from 'node:fs';
import { PNG } from 'pngjs';

const [, , outFile, geom, zoomArg, xArg, ...specs] = process.argv;
if (!outFile || !geom || specs.length === 0) {
  console.error('usage: card.mjs <out.png> <boxW>x<boxH> <zoom> <xPercent> <file>[::label] ...');
  process.exit(2);
}
const [boxW, boxH] = geom.split('x').map(Number);
const zoom = Math.max(1, Number(zoomArg) || 1);
const xPct = Number(xArg) / 100;
const pad = 10;
const cw = boxW * zoom;
const chh = boxH * zoom;
const W = specs.length * (cw + pad) + pad;
const H = chh + pad * 2;
const out = new PNG({ width: W, height: H });
out.data.fill(0xff);

for (let i = 0; i < specs.length; i++) {
  const [file, label] = specs[i].split('::');
  const src = PNG.sync.read(fs.readFileSync(file));
  // cover: the scale that makes the source fill both axes
  const scale = Math.max(boxW / src.width, boxH / src.height);
  const scaledW = src.width * scale;
  const scaledH = src.height * scale;
  const overflowX = scaledW - boxW;
  const overflowY = scaledH - boxH;
  const originX = overflowX * xPct; // dest x=0 maps to this x in the SCALED image
  const originY = overflowY * 0.42; // the sibling Y term; inert whenever overflowY === 0
  const ox = pad + i * (cw + pad);
  for (let y = 0; y < chh; y++) {
    for (let x = 0; x < cw; x++) {
      const cardX = Math.floor(x / zoom);
      const cardY = Math.floor(y / zoom);
      const sx = Math.min(src.width - 1, Math.floor((cardX + originX) / scale));
      const sy = Math.min(src.height - 1, Math.floor((cardY + originY) / scale));
      const si = (src.width * sy + sx) << 2;
      const di = (W * (pad + y) + (ox + x)) << 2;
      const a = src.data[si + 3] / 255;
      for (let c = 0; c < 3; c++) out.data[di + c] = Math.round(src.data[si + c] * a + 255 * (1 - a));
      out.data[di + 3] = 255;
    }
  }
  process.stdout.write(
    `cell ${i}: ${label ?? file} src ${src.width}x${src.height} scale ${scale.toFixed(4)} ` +
      `overflow ${overflowX.toFixed(1)}x${overflowY.toFixed(1)} -> card ${boxW}x${boxH} at zoom ${zoom}\n`,
  );
}
fs.writeFileSync(outFile, PNG.sync.write(out));
process.stdout.write(`wrote ${outFile} ${W}x${H}\n`);
