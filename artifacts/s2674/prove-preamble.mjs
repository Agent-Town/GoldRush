// F-2673-1 evidence: the unbounded walk states its price BEFORE it spends it.
// Spawn the tool BARE against the live board and kill it 25 s in. If the cure works, the
// preamble is already on stdout and the walk has not finished -- which is the whole claim:
// a reader learns the price without paying it. Control: the same run pre-cure printed NOTHING
// for ~9.7 min (that is what s2670 saw and reported as "cannot run").
import { spawn } from 'node:child_process';

const t0 = Date.now();
const p = spawn(process.execPath, ['scripts/status-archive-audit.mjs'], { encoding: 'utf8' });
let out = '';
let firstByteMs = null;
p.stdout.on('data', (d) => {
  if (firstByteMs === null) firstByteMs = Date.now() - t0;
  out += d;
});
setTimeout(() => {
  p.kill('SIGKILL');
  console.log(`first stdout byte at : ${firstByteMs} ms`);
  console.log(`killed at            : ${Date.now() - t0} ms (walk deliberately never finished)`);
  console.log(`--- what the reader sees before paying anything ---`);
  console.log(out);
  console.log(`--- verdict line present? ${/^(CLEAN|LOST):/m.test(out)} (expected false: we killed it) ---`);
}, 25_000);
