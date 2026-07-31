// The command clock's inbox. Blocks until the harness writes the next view-NN.json, then prints it
// whole. WHOLE MATTERS: the economy axis measures what a rider must actually carry in its context,
// so the rider reads the same bytes the harness metered — no digest, no summary.
//
//   node rehearsal/r2-wait-view.mjs <runDir> [seq] [timeoutSeconds]
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const dir = process.argv[2];
const wanted = process.argv[3] && process.argv[3] !== 'next' ? Number(process.argv[3]) : null;
const timeoutS = Number(process.argv[4] ?? 900);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pending = () =>
  readdirSync(dir)
    .filter((f) => /^view-\d+\.json$/.test(f))
    .map((f) => ({ f, seq: Number(f.match(/\d+/)[0]) }))
    .filter(({ seq }) => !existsSync(path.join(dir, `orders-${String(seq).padStart(2, '0')}.json`))
      && !existsSync(path.join(dir, `orders-${String(seq).padStart(2, '0')}.consumed.json`)))
    .sort((a, b) => a.seq - b.seq);

const deadline = Date.now() + timeoutS * 1000;
while (Date.now() < deadline) {
  if (!existsSync(dir)) { await sleep(500); continue; }
  const list = pending();
  const hit = wanted === null ? list[0] : list.find((e) => e.seq === wanted);
  if (hit) {
    console.log(readFileSync(path.join(dir, hit.f), 'utf8'));
    process.exit(0);
  }
  if (existsSync(path.join(dir, 'result.json'))) {
    console.log(JSON.stringify({ done: true, note: 'the run is over — result.json exists and no call is pending' }));
    process.exit(0);
  }
  await sleep(400);
}
console.log(JSON.stringify({ timeout: true, waitedSeconds: timeoutS }));
