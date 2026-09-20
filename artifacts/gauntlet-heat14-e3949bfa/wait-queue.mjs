// HEAT 13 QUEUE WAITER — operator convenience, read-only. Waits until the queue log has completed
// at least <n> rides (counting "########## END " markers) or the window closes, then prints the
// interesting lines only (queue markers, START/OUTCOME/WALL/END, the LANDED slip, matrix rows).
// usage: node wait-queue.mjs <completedRidesTarget> [--max=1700]
import { readFileSync } from 'node:fs';
const args = process.argv.slice(2);
const target = Number(args.find((a) => !a.startsWith('--')) ?? 1);
const max = Number((args.find((a) => a.startsWith('--max=')) ?? '--max=1700').slice(6)) * 1000;
const LOG = new URL('./queue2.log', import.meta.url).pathname;
const KEEP = /^(=== QUEUE|START |OUTCOME |FIRST-OUTPUT |WALL |END |land rc=|ride-wall rc=|tape chosen:|⚠|NOTEBOOK FAILED|MATRIX FAILED|FAILED:|=== NOT SECURED|########## (RIDE|END)|\| \d+ \|)/;
let seen = 0;
const start = Date.now();
(function tick() {
  let t = ''; try { t = readFileSync(LOG, 'utf8'); } catch {}
  const lines = t.split('\n');
  for (const l of lines.slice(seen)) if (KEEP.test(l) || /"assay"/.test(l)) process.stdout.write(`${new Date().toISOString().slice(11, 19)} ${l.slice(0, 700)}\n`);
  seen = lines.length;
  const done = (t.match(/^########## END /gm) ?? []).length;
  const drained = /QUEUE .* DRAINED|QUEUE HALTED/.test(t);
  if (done >= target || drained) { process.stdout.write(`DONE-RIDES ${done}${drained ? ' (QUEUE ENDED)' : ''}\n`); process.exit(0); }
  if (Date.now() - start > max) { process.stdout.write(`WINDOW OVER — ${done} rides complete, still running\n`); process.exit(0); }
  setTimeout(tick, 10_000);
})();
