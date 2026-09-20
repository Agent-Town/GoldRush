// Runner: spawns gr-sim, drives a controller module, logs every view, writes
// gauntlet-outcome.json + envelope axes on EVERY child exit.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WS = '/tmp/heat13-569a41f9/artifacts/heat13/opus/e7-relay-valley';
const REPO = '/private/tmp/heat13-569a41f9';
const CONTRACT = 'e7-relay-valley';
const SEED = 'e7-relay-valley-01';

const label = process.argv[2] || 'probe';
const ctrlPath = process.argv[3] || null; // null = idle
const tape = path.join(WS, `${label}-tape.json`);
const viewLog = path.join(WS, `${label}-views.jsonl`);

let controller = null;
if (ctrlPath) {
  const mod = await import(ctrlPath + '?v=' + Date.now());
  controller = mod.default;
}

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (!controller) args.push('--policy=idle');

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });

const vlog = fs.createWriteStream(viewLog);
let buf = '';
let lastView = null;
let outcomeLine = null;
let nViews = 0;
const table = [];

child.stdout.on('data', (d) => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i);
    buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let obj;
    try { obj = JSON.parse(line); } catch { continue; }
    if (obj.schema === 'goldrush.view.v1') {
      nViews++;
      lastView = obj;
      vlog.write(line + '\n');
      const n = obj.now || {};
      table.push({
        v: nViews, t: +(n.timers?.runSeconds ?? 0).toFixed(1), w: n.wave,
        hp: +(n.hero?.hp ?? 0).toFixed(1), mx: n.hero?.maxHp,
        hx: +(n.hero?.x ?? 0).toFixed(1), hz: +(n.hero?.z ?? 0).toFixed(1),
        g: n.gold, pan: n.score?.goldPanned, alive: n.threats?.alive,
        wk: JSON.stringify(n.works?.byKind || {}), wr: n.works?.wrecked,
        pb: n.playbookUse ? `${n.playbookUse.objectiveMet}/${n.playbookUse.uses}/${JSON.stringify(n.playbookUse.relaysLitByProgram||[])}` : '-',
      });
      if (controller) {
        let out;
        try { out = controller(obj, nViews); } catch (e) {
          console.error('CTRL ERROR', e.stack);
          out = null;
        }
        if (out === null || out === undefined) child.stdin.write('\n');
        else child.stdin.write(JSON.stringify(out) + '\n');
      }
    } else if (obj.secured !== undefined) {
      outcomeLine = obj;
    }
  }
});

let stderrTail = [];
child.stderr.on('data', (d) => {
  const s = d.toString();
  for (const l of s.split('\n')) if (l.trim()) stderrTail.push(l);
  if (stderrTail.length > 60) stderrTail = stderrTail.slice(-60);
});

child.on('exit', (code) => {
  vlog.end();
  fs.writeFileSync(path.join(WS, `${label}-table.json`), JSON.stringify(table, null, 0));
  fs.writeFileSync(path.join(WS, `${label}-stderr.txt`), stderrTail.join('\n'));
  const summary = { label, code, outcome: outcomeLine, views: nViews, tape };
  // envelope axes
  try {
    const t = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const il = t.inputLog || {};
    const entries = il.entries || [];
    const last = entries.length ? entries[entries.length - 1] : null;
    summary.envelope = {
      durationTicks: il.durationTicks,
      lastEntryTick: last ? (last.t ?? last.tick) : null,
      entries: entries.length,
      bytes: fs.statSync(tape).size,
    };
  } catch (e) { summary.envelope = { error: String(e) }; }
  fs.writeFileSync(path.join(WS, `${label}-summary.json`), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
  console.log('TABLE_TAIL', JSON.stringify(table.slice(-6)));
  console.log('STDERR_TAIL', stderrTail.slice(-8).join(' | '));
});
