#!/usr/bin/env node
// plate-tool.mjs — canon-calls-a8. Two jobs, both of them the row-60 recipe's second half
// and its measuring instrument, so nothing here is inherited from a previous review.
//
//   drop <rgba.png> <out3ch.png>   assert the alpha plane is a constant 255 and rewrite the
//                                  file as a 3-channel (colorType 2) PNG. Reports the max
//                                  per-channel RGB delta between input and output, which must
//                                  be 0 for the drop to be lossless.
//   stat <file.png> [corner]       dimensions, channels, transparent px, magenta px, the
//                                  ground-warmth statistic (mean R-B over the TL and TR
//                                  `corner`x`corner` squares; default 60, use 23 on a 384 plate)
//                                  and the luminance-weighted ink centroid
//                                  (weight = 255 - Rec.709 luma, summed over every px).
import fs from 'node:fs';
import { PNG } from 'pngjs';

function read(file) {
  return PNG.sync.read(fs.readFileSync(file));
}

function cornerStat(png, box) {
  const out = {};
  for (const [name, x0] of [['tl', 0], ['tr', png.width - box]]) {
    let sum = 0, n = 0;
    for (let y = 0; y < box; y++) {
      for (let x = x0; x < x0 + box; x++) {
        const i = (png.width * y + x) << 2;
        sum += png.data[i] - png.data[i + 2];
        n++;
      }
    }
    out[name] = sum / n;
  }
  out.mean = (out.tl + out.tr) / 2;
  return out;
}

function inkCentroid(png) {
  // luminance-weighted centroid of the DARKNESS, x only (the card crop scales a square
  // source by height, so only X can move it). weight = 255 - Rec.709 luma.
  let wsum = 0, xsum = 0;
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const i = (png.width * y + x) << 2;
      const luma = 0.2126 * png.data[i] + 0.7152 * png.data[i + 1] + 0.0722 * png.data[i + 2];
      const w = 255 - luma;
      wsum += w;
      xsum += w * x;
    }
  }
  return xsum / wsum;
}

function channels(file) {
  // pngjs normalises everything to RGBA in memory; read the IHDR colour type off the bytes.
  const buf = fs.readFileSync(file);
  const colorType = buf[25];
  return { colorType, channels: { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colorType] };
}

const [, , cmd, ...rest] = process.argv;

if (cmd === 'drop') {
  const [inFile, outFile] = rest;
  const png = read(inFile);
  let aMin = 255, aMax = 0;
  for (let i = 3; i < png.data.length; i += 4) {
    const a = png.data[i];
    if (a < aMin) aMin = a;
    if (a > aMax) aMax = a;
  }
  if (aMin !== 255 || aMax !== 255) {
    console.error(`REFUSED ${inFile}: alpha is not constant 255 (min ${aMin} max ${aMax}); the drop would not be lossless`);
    process.exit(1);
  }
  fs.writeFileSync(outFile, PNG.sync.write(png, { colorType: 2 }));
  const back = read(outFile);
  let maxDelta = 0;
  for (let i = 0; i < png.data.length; i += 4) {
    for (let c = 0; c < 3; c++) maxDelta = Math.max(maxDelta, Math.abs(png.data[i + c] - back.data[i + c]));
  }
  const ct = channels(outFile);
  console.log(JSON.stringify({ out: outFile, alphaMin: aMin, alphaMax: aMax, maxRgbDelta: maxDelta, colorType: ct.colorType, channels: ct.channels, bytes: fs.statSync(outFile).size }));
} else if (cmd === 'stat') {
  const [file, boxArg] = rest;
  const box = Number(boxArg || 60);
  const png = read(file);
  const ct = channels(file);
  let transparent = 0, magenta = 0;
  for (let i = 0; i < png.data.length; i += 4) {
    if (png.data[i + 3] < 255) transparent++;
    if (png.data[i] > 200 && png.data[i + 1] < 60 && png.data[i + 2] > 200) magenta++;
  }
  const c = cornerStat(png, box);
  console.log(JSON.stringify({
    file,
    width: png.width,
    height: png.height,
    colorType: ct.colorType,
    channels: ct.channels,
    bytes: fs.statSync(file).size,
    transparentPx: transparent,
    magentaPx: magenta,
    corner: box,
    tl: Number(c.tl.toFixed(1)),
    tr: Number(c.tr.toFixed(1)),
    mean: Number(c.mean.toFixed(1)),
    centroidX: Number(inkCentroid(png).toFixed(1)),
  }));
} else {
  console.error('usage: plate-tool.mjs drop <in> <out> | stat <file> [corner]');
  process.exit(2);
}
