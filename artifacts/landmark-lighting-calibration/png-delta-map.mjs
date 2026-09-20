import { PNG } from 'pngjs';
import { readFileSync, writeFileSync } from 'node:fs';
const [a, b, out] = process.argv.slice(2);
const A = PNG.sync.read(readFileSync(a));
const B = PNG.sync.read(readFileSync(b));
let minX = 1e9, minY = 1e9, maxX = -1, maxY = -1, n = 0;
const mask = new PNG({ width: A.width, height: A.height });
for (let y = 0; y < A.height; y += 1) for (let x = 0; x < A.width; x += 1) {
  const i = (y * A.width + x) * 4;
  const d = Math.max(Math.abs(A.data[i]-B.data[i]), Math.abs(A.data[i+1]-B.data[i+1]), Math.abs(A.data[i+2]-B.data[i+2]));
  const on = d > 2;
  if (on) { n += 1; if (x<minX)minX=x; if(x>maxX)maxX=x; if(y<minY)minY=y; if(y>maxY)maxY=y; }
  mask.data[i] = on ? 255 : Math.round(A.data[i] * 0.35);
  mask.data[i+1] = on ? Math.min(255, d * 4) : Math.round(A.data[i+1] * 0.35);
  mask.data[i+2] = on ? 0 : Math.round(A.data[i+2] * 0.35);
  mask.data[i+3] = 255;
}
writeFileSync(out, PNG.sync.write(mask));
console.log(`${n} px, bbox x[${minX}..${maxX}] y[${minY}..${maxY}] of ${A.width}x${A.height} -> ${out}`);
