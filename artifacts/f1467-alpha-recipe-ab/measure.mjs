#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const ROOT = process.cwd();
const WORK = path.join(ROOT, 'artifacts/f1467-alpha-recipe-ab');
const SIZE = 384;
const THIN_RADIUS = 4;
const TIERS = [0.35, 0.04];
const SUBJECTS = [
  { id: 'baron-banner', file: 'prop-baron-banner.png' },
  { id: 'assay-table', file: 'prop-drill-faucet-station.png' },
  { id: 'signal-turret', file: 'bld-signal-turret.png' },
];

function read(file) {
  return PNG.sync.read(fs.readFileSync(file));
}

function sha256(file) {
  return createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

// Same centre-sampled bilinear resize used by scripts/extract-alpha.mjs and the
// provenance-proving F-1450-4 control. Keeping the recipe identical is the test.
function resizeTo(srcFile, dstFile, size) {
  const png = read(srcFile);
  const out = new PNG({ width: size, height: size });
  const sx = png.width / size;
  const sy = png.height / size;
  for (let y = 0; y < size; y += 1) {
    const fy = Math.min((y + 0.5) * sy - 0.5, png.height - 1);
    const y0 = Math.max(Math.floor(fy), 0);
    const y1 = Math.min(y0 + 1, png.height - 1);
    const wy = fy - y0;
    for (let x = 0; x < size; x += 1) {
      const fx = Math.min((x + 0.5) * sx - 0.5, png.width - 1);
      const x0 = Math.max(Math.floor(fx), 0);
      const x1 = Math.min(x0 + 1, png.width - 1);
      const wx = fx - x0;
      const offset = (size * y + x) << 2;
      for (let channel = 0; channel < 4; channel += 1) {
        const p00 = png.data[((png.width * y0 + x0) << 2) + channel];
        const p10 = png.data[((png.width * y0 + x1) << 2) + channel];
        const p01 = png.data[((png.width * y1 + x0) << 2) + channel];
        const p11 = png.data[((png.width * y1 + x1) << 2) + channel];
        out.data[offset + channel] = Math.round(
          p00 * (1 - wx) * (1 - wy)
          + p10 * wx * (1 - wy)
          + p01 * (1 - wx) * wy
          + p11 * wx * wy,
        );
      }
    }
  }
  fs.mkdirSync(path.dirname(dstFile), { recursive: true });
  fs.writeFileSync(dstFile, PNG.sync.write(out));
}

function survives(alpha, tier) {
  return alpha / 255 >= tier;
}

function hasBackground(mask, width, height, x, y, dx, dy) {
  for (let distance = 1; distance <= THIN_RADIUS; distance += 1) {
    const px = x + dx * distance;
    const py = y + dy * distance;
    if (px < 0 || py < 0 || px >= width || py >= height) return true;
    if (!mask[py * width + px]) return true;
  }
  return false;
}

function isThin(mask, width, height, x, y) {
  return [
    [[-1, 0], [1, 0]],
    [[0, -1], [0, 1]],
    [[-1, -1], [1, 1]],
    [[1, -1], [-1, 1]],
  ].some(([a, b]) => hasBackground(mask, width, height, x, y, ...a)
    && hasBackground(mask, width, height, x, y, ...b));
}

function measure(master, arm, tier) {
  if (master.width !== 1024 || master.height !== 1024) throw new Error('master must be 1024x1024');
  if (arm.width !== SIZE || arm.height !== SIZE) throw new Error(`arm must be ${SIZE}x${SIZE}`);
  const ground = new Uint8Array(master.width * master.height);
  for (let index = 0; index < ground.length; index += 1) {
    ground[index] = survives(master.data[(index << 2) + 3], tier) ? 1 : 0;
  }

  let survivingTexels = 0;
  let partialTexels = 0;
  const candidate = new Uint8Array(arm.width * arm.height);
  for (let index = 0; index < candidate.length; index += 1) {
    const alpha = arm.data[(index << 2) + 3];
    if (alpha > 0 && alpha < 255) partialTexels += 1;
    if (survives(alpha, tier)) {
      survivingTexels += 1;
      candidate[index] = 1;
    }
  }

  let thinGroundTruthTexels = 0;
  let retainedThinTexels = 0;
  for (let y = 0; y < master.height; y += 1) {
    for (let x = 0; x < master.width; x += 1) {
      if (!ground[y * master.width + x] || !isThin(ground, master.width, master.height, x, y)) continue;
      thinGroundTruthTexels += 1;
      const outputX = Math.min(SIZE - 1, Math.floor((x + 0.5) * SIZE / master.width));
      const outputY = Math.min(SIZE - 1, Math.floor((y + 0.5) * SIZE / master.height));
      if (candidate[outputY * SIZE + outputX]) retainedThinTexels += 1;
    }
  }

  return {
    survivingTexels,
    partialTexels,
    thinGroundTruthTexels,
    retainedThinTexels,
    thinFeatureRetention: retainedThinTexels / thinGroundTruthTexels,
  };
}

function analyze() {
  const rows = [];
  const probeArgs = [];
  for (const subject of SUBJECTS) {
    const dir = path.join(WORK, 'arms', subject.id);
    const masterFile = path.join(dir, 'master-1024', subject.file);
    const master = read(masterFile);
    for (const armName of ['one-step', 'two-step']) {
      const armFile = armName === 'one-step'
        ? path.join(dir, armName, subject.file)
        : path.join(dir, `${armName}.png`);
      const arm = read(armFile);
      probeArgs.push(`${subject.id} ${armName}`, armFile);
      for (const tier of TIERS) {
        rows.push({
          subject: subject.id,
          arm: armName,
          tier,
          ...measure(master, arm, tier),
          sha256: sha256(armFile),
        });
      }
    }
  }
  const alphaProbe = execFileSync('node', [
    path.join(ROOT, 'artifacts/f1450-4/alpha-probe.mjs'),
    ...probeArgs,
  ], { cwd: ROOT, encoding: 'utf8' });
  const output = {
    metric: {
      groundTruth: '1024 keyed master at the same alphaTest tier',
      thinTexel: `foreground with background within ${THIN_RADIUS} master texels on both sides of at least one horizontal, vertical, or diagonal axis`,
      retention: 'share of thin ground-truth texels whose mapped 384 texel survives the same alphaTest',
      survivorPredicate: 'alpha / 255 >= alphaTest',
    },
    rows,
    alphaProbe,
  };
  fs.writeFileSync(path.join(WORK, 'measurements.json'), `${JSON.stringify(output, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
}

const [command, src, dst, rawSize] = process.argv.slice(2);
if (command === 'downsample' && src && dst) resizeTo(src, dst, Number(rawSize ?? SIZE));
else if (command === 'analyze') analyze();
else {
  console.error('usage: measure.mjs downsample <src> <dst> [size] | analyze');
  process.exitCode = 2;
}
