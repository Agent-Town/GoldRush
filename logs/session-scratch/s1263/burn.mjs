// s1263 load generator: N busy CPU workers for a bounded duration, then exit.
// The load ARM of the measurement. Bounded by design so it can never outlive the fire.
// usage: node logs/session-scratch/s1263/burn.mjs <workers> <seconds>
import { Worker, isMainThread } from 'node:worker_threads';

if (isMainThread) {
  const workers = Number(process.argv[2] ?? 12);
  const seconds = Number(process.argv[3] ?? 120);
  const pool = Array.from({ length: workers }, () => new Worker(new URL(import.meta.url)));
  console.log(`[burn] ${workers} workers for ${seconds}s`);
  setTimeout(() => {
    for (const worker of pool) void worker.terminate();
    console.log('[burn] done');
    process.exit(0);
  }, seconds * 1000);
} else {
  let x = 0;
  for (;;) x = (x + Math.sqrt(x + 1)) % 1e9;
}
