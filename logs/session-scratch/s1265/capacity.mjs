// s1265 — measure the FIRE SHELL's concurrent CPU capacity.
// F-1264-3 signature: serial identical across shells, 6-concurrent 5x worse in the fire shell.
// That is the signature of a scheduling cap, not of a slow machine. This measures the cap.
// No arguments, no network, no writes outside stdout.
import os from 'node:os';
import { Worker, isMainThread, parentPort } from 'node:worker_threads';

const BURN_MS = 1500;

function burn(ms) {
  const t0 = Date.now();
  let x = 0;
  while (Date.now() - t0 < ms) {
    for (let i = 0; i < 200000; i += 1) x += Math.sqrt(i) % 7;
  }
  return x;
}

if (!isMainThread) {
  // Count how many fixed-size work units we complete in BURN_MS.
  const t0 = Date.now();
  let units = 0;
  while (Date.now() - t0 < BURN_MS) {
    let x = 0;
    for (let i = 0; i < 2000000; i += 1) x += Math.sqrt(i) % 7;
    units += 1;
    if (x === -1) throw new Error('unreachable');
  }
  parentPort.postMessage(units);
} else {
  const run = (n) =>
    new Promise((resolve) => {
      const results = [];
      const t0 = Date.now();
      for (let i = 0; i < n; i += 1) {
        const w = new Worker(new URL(import.meta.url));
        w.on('message', (units) => {
          results.push(units);
          if (results.length === n) {
            resolve({ n, wall: Date.now() - t0, total: results.reduce((a, b) => a + b, 0), each: results });
          }
        });
      }
    });

  const cpus = os.cpus();
  console.log('node                : ' + process.version);
  console.log('os.cpus().length    : ' + cpus.length);
  console.log('cpu model           : ' + (cpus[0] && cpus[0].model));
  console.log('loadavg at start    : ' + os.loadavg().map((v) => v.toFixed(2)).join(' '));
  console.log('');

  const one = await run(1);
  const six = await run(6);

  console.log('1 worker  : ' + one.total + ' units in ' + one.wall + ' ms   (per-worker: ' + one.each.join(',') + ')');
  console.log('6 workers : ' + six.total + ' units in ' + six.wall + ' ms   (per-worker: ' + six.each.join(',') + ')');
  console.log('');
  const speedup = six.total / one.total;
  console.log('PARALLEL SPEEDUP (6 workers vs 1) : ' + speedup.toFixed(2) + 'x');
  console.log('  ~6.0x  = full parallelism, six real cores available to this shell');
  console.log('  ~1-2x  = this shell is capped to about that many cores of throughput');
  console.log('loadavg at end      : ' + os.loadavg().map((v) => v.toFixed(2)).join(' '));
  process.exit(0);
}
