// Bounded wait on ride progress files (operator convenience). usage: node wait-rides.mjs <label=file> [<label=file>...] [--max=570]
import { readFileSync } from 'node:fs';
const args = process.argv.slice(2);
const max = Number((args.find((a) => a.startsWith('--max=')) ?? '--max=570').slice(6)) * 1000;
const files = Object.fromEntries(args.filter((a) => !a.startsWith('--')).map((a) => { const i = a.indexOf('='); return [a.slice(0, i), a.slice(i + 1)]; }));
const seen = Object.fromEntries(Object.keys(files).map((k) => [k, 0]));
const start = Date.now();
(function tick() {
  let done = 0;
  for (const [rig, f] of Object.entries(files)) {
    let t = ''; try { t = readFileSync(f, 'utf8'); } catch {}
    const lines = t.split('\n').filter(Boolean);
    for (const l of lines.slice(seen[rig])) process.stdout.write(`${new Date().toISOString().slice(11, 19)} ${l}\n`);
    seen[rig] = lines.length;
    if (/^END /m.test(t)) done += 1;
  }
  if (done === Object.keys(files).length) { process.stdout.write('ALL ENDED\n'); process.exit(0); }
  if (Date.now() - start > max) { process.stdout.write('WAIT-WINDOW OVER (still running)\n'); process.exit(0); }
  setTimeout(tick, 10_000);
})();
