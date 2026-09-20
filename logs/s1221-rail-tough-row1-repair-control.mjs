// s1221 CONTROL — s1190 verbatim through its `results` object, with TWO changes and no others:
//   (1) the diagonal sheet path is an argv parameter, so the same instrument can read the
//       pre-batch sheet (`git show f61843c0^:...`) and today's repaired sheet;
//   (2) s1190's five assertions and its artifact writes are truncated away, because the
//       question here is what the numbers ARE, not whether they still match s1190's pins.
// Everything above the results object -- keying, body centroid, IoU, masking, landmarks --
// is byte-identical to logs/s1190-rail-tough-wrench-probe.mjs. Usage:
//   node logs/s1221-rail-tough-row1-repair-control.mjs [<diagonal sheet path>]
import fs from 'node:fs';
import { PNG } from 'pngjs';

const CARDINAL = 'assets/raw/char-railtough-sheet-walk4-a.png';
const DIAGONAL = process.argv[2] ?? 'assets/raw/char-railtough-sheet-walkdiag4-a.png';
const FRAMES = 'assets/processed/char-railtough-sheet-walk4-a.frames.json';
const CONTRACT = 'assets/layer-contracts/characters.v2.json';
const OUT = 'artifacts/eight-winds-rail-tough';
const KEY_TOLERANCE = 54;
const SHAFT_RADIUS = 10;
const JAW_RADIUS = 20;

// Hand-checked interior landmarks: wrench grip/root then open-jaw centre, in raw
// 313 px cell coordinates. The overlay output is the validation surface.
const landmarks = {
  cardinal: {
    0: [[84, 185, 170, 250], [86, 184, 169, 247], [82, 180, 168, 250], [83, 180, 173, 242]],
    3: [[108, 175, 50, 229], [108, 174, 45, 235], [110, 174, 52, 224], [111, 174, 58, 232]],
  },
  diagonal: {
    0: [[100, 159, 61, 211], [103, 157, 62, 216], [147, 158, 99, 212], [106, 159, 61, 214]],
    1: [[102, 166, 68, 231], [94, 165, 170, 235], [140, 163, 209, 235], [96, 164, 167, 236]],
    2: [[189, 173, 240, 207], [203, 177, 244, 232], [228, 175, 274, 232], [185, 165, 232, 214]],
    3: [[178, 181, 229, 200], [179, 187, 231, 212], [235, 192, 291, 223], [174, 184, 225, 207]],
  },
};

function isKey(png, index) {
  return Math.max(
    Math.abs(png.data[index] - 255),
    Math.abs(png.data[index + 1]),
    Math.abs(png.data[index + 2] - 255),
  ) <= KEY_TOLERANCE;
}

// Blue-coat interior pixels provide a body anchor that excludes the wrench,
// boots, shadow, and magenta background.
function bodyCentroid(png, cell, row, col) {
  let sumX = 0;
  let count = 0;
  for (let y = 0; y < cell; y += 1) {
    for (let x = 0; x < cell; x += 1) {
      const index = ((row * cell + y) * png.width + col * cell + x) * 4;
      const [r, g, b, a] = png.data.subarray(index, index + 4);
      if (a >= 8 && !isKey(png, index) && b >= r + 8 && g >= r + 4 && b < 180 && g < 180) {
        sumX += x;
        count += 1;
      }
    }
  }
  if (!count) throw new Error(`No coat pixels at r${row}c${col}`);
  return sumX / count;
}

function distanceToSegment(x, y, [x1, y1, x2, y2]) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy));
}

function isWrenchPixel(x, y, line, shaftRadius = SHAFT_RADIUS, jawRadius = JAW_RADIUS) {
  return distanceToSegment(x, y, line) <= shaftRadius
    || Math.hypot(x - line[2], y - line[3]) <= jawRadius;
}

function frameMask(png, cell, row, col, line = null, shaftRadius, jawRadius) {
  const points = [];
  for (let y = 0; y < cell; y += 1) {
    for (let x = 0; x < cell; x += 1) {
      const index = ((row * cell + y) * png.width + col * cell + x) * 4;
      if (png.data[index + 3] < 8 || isKey(png, index)) continue;
      if (line && isWrenchPixel(x, y, line, shaftRadius, jawRadius)) continue;
      points.push([x, y]);
    }
  }
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const width = maxX - minX + 1;
  const height = maxY - minY + 1;
  const mask = new Uint8Array(width * height);
  for (const [x, y] of points) mask[(y - minY) * width + x - minX] = 1;
  return { width, height, mask };
}

function iou(a, b, mirrored = false) {
  const width = Math.max(a.width, b.width);
  const height = Math.max(a.height, b.height);
  const ax = Math.floor((width - a.width) / 2);
  const ay = Math.floor((height - a.height) / 2);
  const bx = Math.floor((width - b.width) / 2);
  const by = Math.floor((height - b.height) / 2);
  let intersection = 0;
  let union = 0;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const aOn = x >= ax && x < ax + a.width && y >= ay && y < ay + a.height
        ? a.mask[(y - ay) * a.width + x - ax]
        : 0;
      const bLocalX = mirrored ? b.width - 1 - (x - bx) : x - bx;
      const bOn = x >= bx && x < bx + b.width && y >= by && y < by + b.height
        ? b.mask[(y - by) * b.width + bLocalX]
        : 0;
      if (aOn && bOn) intersection += 1;
      if (aOn || bOn) union += 1;
    }
  }
  return intersection / union;
}

function pairScore(frames, rowA, rowB) {
  let direct = 0;
  let mirrored = 0;
  for (const a of frames[rowA]) {
    for (const b of frames[rowB]) {
      direct = Math.max(direct, iou(a, b));
      mirrored = Math.max(mirrored, iou(a, b, true));
    }
  }
  return { direct, mirrored, delta: direct - mirrored };
}

function blend(png, x, y, rgb, alpha) {
  if (x < 0 || y < 0 || x >= png.width || y >= png.height) return;
  const index = (y * png.width + x) * 4;
  for (let channel = 0; channel < 3; channel += 1) {
    png.data[index + channel] = Math.round(png.data[index + channel] * (1 - alpha) + rgb[channel] * alpha);
  }
}

function markCircle(png, cx, cy, radius, color) {
  for (let y = cy - radius; y <= cy + radius; y += 1) {
    for (let x = cx - radius; x <= cx + radius; x += 1) {
      if (Math.hypot(x - cx, y - cy) <= radius) blend(png, x, y, color, 0.9);
    }
  }
}

function writeOverlay(name, sourceFile, sheetLandmarks) {
  const png = PNG.sync.read(fs.readFileSync(sourceFile));
  const cell = Math.floor(png.width / 4);
  for (const [rowText, rowLandmarks] of Object.entries(sheetLandmarks)) {
    const row = Number(rowText);
    for (const [col, line] of rowLandmarks.entries()) {
      const centroid = bodyCentroid(png, cell, row, col);
      for (let y = 0; y < cell; y += 1) {
        for (let x = 0; x < cell; x += 1) {
          const globalX = col * cell + x;
          const globalY = row * cell + y;
          if (isWrenchPixel(x, y, line)) blend(png, globalX, globalY, [255, 130, 30], 0.35);
          if (Math.abs(x - centroid) < 1 && y >= 30 && y <= 260) blend(png, globalX, globalY, [0, 220, 255], 0.8);
        }
      }
      markCircle(png, col * cell + line[0], row * cell + line[1], 4, [0, 255, 120]);
      markCircle(png, col * cell + line[2], row * cell + line[3], 4, [255, 235, 0]);
    }
  }
  fs.writeFileSync(`${OUT}/${name}`, PNG.sync.write(png));
}

function offsets(png, sheetLandmarks) {
  const cell = Math.floor(png.width / 4);
  return Object.fromEntries(Object.entries(sheetLandmarks).map(([rowText, rowLandmarks]) => {
    const row = Number(rowText);
    return [rowText, rowLandmarks.map((line, col) => {
      const bodyX = bodyCentroid(png, cell, row, col);
      return {
        frame: `c${col}`,
        bodyX: Number(bodyX.toFixed(1)),
        wrenchRootX: line[0],
        signedOffset: Number((line[0] - bodyX).toFixed(1)),
      };
    })];
  }));
}

fs.mkdirSync(OUT, { recursive: true });
const cardinalPng = PNG.sync.read(fs.readFileSync(CARDINAL));
const diagonalPng = PNG.sync.read(fs.readFileSync(DIAGONAL));
const frameData = JSON.parse(fs.readFileSync(FRAMES, 'utf8'));
const contract = JSON.parse(fs.readFileSync(CONTRACT, 'utf8'));
const rail = contract.slots.find(({ slot }) => slot === 'char.e2.rail_tough')?.walk4;
if (!rail) throw new Error('Rail Tough contract slot not found');

for (const [direction, row] of [['s', 0], ['n', 3]]) {
  const expected = Array.from({ length: 4 }, (_, col) => `char-railtough-sheet-walk4-a-r${row}c${col}.png`);
  const actual = rail.directions[direction].frames.files;
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`${direction} is not cardinal row ${row}`);
  if (!expected.every((file) => frameData.cells.some((cell) => cell.row === row && cell.file === file))) {
    throw new Error(`frames.json does not contain cardinal row ${row}`);
  }
}

const unmasked = Array.from({ length: 4 }, (_, row) => Array.from(
  { length: 4 },
  (_, col) => frameMask(diagonalPng, 313, row, col),
));
const masked = Array.from({ length: 4 }, (_, row) => Array.from(
  { length: 4 },
  (_, col) => frameMask(diagonalPng, 313, row, col, landmarks.diagonal[row][col]),
));
const mirrorFloor = unmasked.flat().reduce((sum, frame) => sum + iou(frame, frame, true), 0) / 16;
const before = pairScore(unmasked, 2, 3);
const after = pairScore(masked, 2, 3);
const sensitivity = [];
for (const shaftRadius of [10, 12, 14]) {
  for (const jawRadius of [20, 22, 24]) {
    const frames = Array.from({ length: 4 }, (_, row) => Array.from(
      { length: 4 },
      (_, col) => frameMask(
        diagonalPng,
        313,
        row,
        col,
        landmarks.diagonal[row][col],
        shaftRadius,
        jawRadius,
      ),
    ));
    sensitivity.push({ shaftRadius, jawRadius, ...pairScore(frames, 2, 3) });
  }
}

const results = {
  cardinalMapping: { s: 0, n: 3 },
  cardinalOffsets: offsets(cardinalPng, landmarks.cardinal),
  diagonalOffsets: offsets(diagonalPng, landmarks.diagonal),
  mirrorFloor,
  before,
  after,
  sensitivity,
};
console.log(JSON.stringify({
  sheet: DIAGONAL,
  mirrorFloor: results.mirrorFloor,
  row0WrenchOffsets: results.diagonalOffsets[0].map((o) => o.signedOffset),
  row1WrenchOffsets: results.diagonalOffsets[1].map((o) => o.signedOffset),
  row2WrenchOffsets: results.diagonalOffsets[2].map((o) => o.signedOffset),
  row3WrenchOffsets: results.diagonalOffsets[3].map((o) => o.signedOffset),
}, null, 2));
