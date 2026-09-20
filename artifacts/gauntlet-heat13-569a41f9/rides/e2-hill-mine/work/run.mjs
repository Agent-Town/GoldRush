// Runner: spawn gr-sim, drive a controller module, log every view, write outcome.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WS = path.dirname(new URL(import.meta.url).pathname);
const REPO = path.resolve(WS, '../../../..');

const ctrlPath = process.argv[2];
const label = process.argv[3];
const CONTRACT = 'e2-hill-mine';
const SEED = 'e2-hill-mine-01';

const tape = path.join(WS, `${label}-tape.json`);
const viewLog = path.join(WS, `${label}-views.jsonl`);
fs.writeFileSync(viewLog, '');

const mod = await import(ctrlPath + `?v=${Date.now()}`);
const makeController = mod.default;
const ctrl = makeController();

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (process.argv.includes('--idle')) args.push('--policy', 'idle');

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });

let buf = '';
let outcome = null;
let views = 0;
const rows = [];

child.stderr.on('data', (d) => {
  const s = String(d);
  if (s.includes('rejected')) process.stdout.write('STDERR: ' + s);
});

child.stdout.on('data', (d) => {
  buf += String(d);
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i);
    buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg.schema === 'goldrush.view.v1') {
      views++;
      fs.appendFileSync(viewLog, line + '\n');
      let reply;
      try { reply = ctrl.onView(msg, rows); }
      catch (e) { console.log('CTRL ERROR', e.message, e.stack); reply = null; }
      if (msg.now && msg.now.needsRider !== undefined) { /* noop */ }
      if (reply === null || reply === undefined) child.stdin.write('\n');
      else child.stdin.write(JSON.stringify(reply) + '\n');
    } else if (msg.secured !== undefined) {
      outcome = msg;
    }
  }
});

child.on('exit', (code) => {
  const summary = { label, code, views, outcome };
  // envelope
  try {
    const t = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const il = t.inputLog || {};
    const entries = il.entries || [];
    const lastTick = entries.length ? Math.max(...entries.map(e => e.t ?? e.tick ?? 0)) : 0;
    summary.envelope = {
      durationTicks: il.durationTicks,
      lastEntryTick: lastTick,
      entries: entries.length,
      bytes: fs.statSync(tape).size,
    };
  } catch (e) { summary.envelope = { error: e.message }; }
  console.log(JSON.stringify(summary, null, 1));
  console.log('ROWS');
  for (const r of rows) console.log(r);

  // intermediate results law
  const outPath = path.join(WS, 'gauntlet-outcome.json');
  let best = null;
  try { best = JSON.parse(fs.readFileSync(outPath, 'utf8')); } catch {}
  const runsSoFar = (best?.runsSoFar || 0) + 1;
  const scoredAttempts = (best?.scoredAttempts || 0) + (label.startsWith('attempt') ? 1 : 0);
  const cand = outcome || {};
  const better = !best || (!!cand.secured && !best.secured) ||
    (!!cand.secured === !!best.secured && ((cand.waves || 0) > (best.waves || 0) ||
      ((cand.waves || 0) === (best.waves || 0) && (cand.timeMs || 0) > (best.timeMs || 0))));
  const row = better ? {
    ...cand,
    tape: tape,
    scored: label.startsWith('attempt'),
    runsSoFar, scoredAttempts,
    worldModel: 'sim-import',
  } : { ...best, runsSoFar, scoredAttempts };
  fs.writeFileSync(outPath, JSON.stringify(row, null, 1));
});
