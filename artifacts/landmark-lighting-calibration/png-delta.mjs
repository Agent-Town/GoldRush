import { PNG } from 'pngjs';
import { readFileSync } from 'node:fs';
const [a, b] = process.argv.slice(2);
const A = PNG.sync.read(readFileSync(a));
const B = PNG.sync.read(readFileSync(b));
if (A.width !== B.width || A.height !== B.height) { console.log('SIZE MISMATCH'); process.exit(1); }
let diff = 0, maxCh = 0, sum = 0;
for (let i = 0; i < A.data.length; i += 4) {
  const d = Math.max(Math.abs(A.data[i]-B.data[i]), Math.abs(A.data[i+1]-B.data[i+1]), Math.abs(A.data[i+2]-B.data[i+2]));
  if (d > 2) { diff += 1; sum += d; if (d > maxCh) maxCh = d; }
}
const px = A.width * A.height;
console.log(`${a.split('/').pop()} vs ${b.split('/').pop()}: ${diff} px differ (${(diff/px*100).toFixed(2)}%), max channel delta ${maxCh}, mean delta over differing px ${(diff?sum/diff:0).toFixed(1)}`);
