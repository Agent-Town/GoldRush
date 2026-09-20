// runner.mjs — spawn gr-sim, drive a controller, log every view, write outcome on exit.
// usage: node runner.mjs <label> <controllerPath|idle>
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const REPO = '/private/tmp/heat13-569a41f9';
const WS = path.join(REPO, 'artifacts/heat13/opus/e2-incline');
const CONTRACT = 'e2-incline';
const SEED = 'e2-incline-01';

const label = process.argv[2] || 'probe-1';
const ctrlPath = process.argv[3] || 'idle';

const tape = path.join(WS, `${label}-tape.json`);
const viewLog = path.join(WS, `${label}-views.jsonl`);
const summaryPath = path.join(WS, `${label}-summary.json`);

let controller = null;
if (ctrlPath !== 'idle') {
  const mod = await import(path.isAbsolute(ctrlPath) ? ctrlPath : path.join(WS, ctrlPath));
  controller = mod.default ?? mod.controller ?? mod;
}

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (ctrlPath === 'idle') args.push('--policy=idle');

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });

fs.writeFileSync(viewLog, '');
let buf = '';
let outcome = null;
let views = 0;
const rows = [];
const state = { };

child.stdout.setEncoding('utf8');
child.stdout.on('data', (chunk) => {
  buf += chunk;
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i);
    buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let obj;
    try { obj = JSON.parse(line); } catch { continue; }
    if (obj.schema === 'goldrush.view.v1') {
      views++;
      fs.appendFileSync(viewLog, JSON.stringify(obj) + '\n');
      const n = obj.now || {};
      const row = {
        v: views,
        t: +(n.timers?.runSeconds ?? n.timers?.simTimeSeconds ?? 0).toFixed(2),
        w: n.wave,
        gold: n.gold,
        pan: n.score?.goldPanned,
        hp: n.hero?.hp == null ? null : +Number(n.hero.hp).toFixed(1),
        mx: n.hero?.maxHp,
        hx: n.hero?.x == null ? null : +Number(n.hero.x).toFixed(1),
        hz: n.hero?.z == null ? null : +Number(n.hero.z).toFixed(1),
        alive: n.threats?.alive,
        wk: n.works?.wrecked,
        st: n.works?.standing,
        byKind: n.works?.byKind ? JSON.stringify(n.works.byKind) : null,
      };
      rows.push(row);
      if (controller) {
        let out;
        try { out = controller(obj, state); }
        catch (e) { console.error('CONTROLLER THREW', e); out = []; }
        if (out === null || out === undefined) { child.stdin.write('\n'); }
        else {
          const s = JSON.stringify(out);
          if (!/^\[.*\]$/.test(s)) { console.error('BAD ORDERS', s); child.stdin.write('\n'); }
          else child.stdin.write(s + '\n');
        }
      }
    } else if (obj.secured !== undefined || obj.endReason !== undefined) {
      outcome = obj;
    }
  }
});

let stderrTail = '';
child.stderr.setEncoding('utf8');
child.stderr.on('data', (d) => { stderrTail = (stderrTail + d).slice(-4000); });

child.on('exit', (code) => {
  // envelope
  let env = null;
  try {
    const tp = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const entries = tp.inputLog?.entries ?? [];
    const ticks = tp.inputLog?.durationTicks ?? null;
    const lastTick = entries.length ? Math.max(...entries.map(e => e.t ?? e.tick ?? 0)) : null;
    env = {
      durationTicks: ticks,
      lastEntryTick: lastTick,
      entries: entries.length,
      bytes: fs.statSync(tape).size,
      orderEntries: entries.filter(e => Array.isArray(e.orders) && e.orders.length).length,
      tapeHash: tp.eventLogHash ?? tp.meta?.eventLogHash ?? null,
    };
  } catch (e) { env = { error: String(e) }; }

  const summary = { label, code, outcome, views, envelope: env, stderrTail: stderrTail.slice(-1200) };
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  fs.writeFileSync(path.join(WS, `${label}-table.json`), JSON.stringify(rows, null, 1));

  // table print
  console.log('== ' + label + ' ==');
  const step = Math.max(1, Math.ceil(rows.length / 40));
  for (let i = 0; i < rows.length; i += step) {
    const r = rows[i];
    console.log(`v${r.v} t=${r.t} w=${r.w} gold=${r.gold} pan=${r.pan} hp=${r.hp}/${r.mx} hero=(${r.hx},${r.hz}) alive=${r.alive} wk=${r.wk} st=${r.st} ${r.byKind ?? ''}`);
  }
  if (rows.length) { const r = rows[rows.length-1]; console.log(`LAST v${r.v} t=${r.t} w=${r.w} gold=${r.gold} pan=${r.pan} hp=${r.hp}/${r.mx} hero=(${r.hx},${r.hz}) alive=${r.alive} wk=${r.wk} st=${r.st} ${r.byKind ?? ''}`); }
  console.log('OUTCOME', JSON.stringify(outcome));
  console.log('ENVELOPE', JSON.stringify(env));
  if (stderrTail) console.log('STDERR-TAIL', stderrTail.slice(-800));

  // intermediate results law: write/update gauntlet-outcome.json with best so far
  const gp = path.join(WS, 'gauntlet-outcome.json');
  let best = null;
  try { best = JSON.parse(fs.readFileSync(gp, 'utf8')); } catch {}
  const runsSoFar = (best?.runsSoFar ?? 0) + 1;
  const scored = /^attempt-/.test(label);
  const scoredAttempts = (best?.scoredAttempts ?? 0) + (scored ? 1 : 0);
  const cur = outcome || { secured: false };
  const better = (a, b) => {
    if (!b) return true;
    if ((a.secured ? 1 : 0) !== (b.secured ? 1 : 0)) return (a.secured ? 1 : 0) > (b.secured ? 1 : 0);
    if ((a.waves ?? 0) !== (b.waves ?? 0)) return (a.waves ?? 0) > (b.waves ?? 0);
    if ((a.gold ?? 0) !== (b.gold ?? 0)) return (a.gold ?? 0) > (b.gold ?? 0);
    return (a.timeMs ?? 0) >= (b.timeMs ?? 0);
  };
  const prevScore = best ? { secured: best.secured, waves: best.waves, gold: best.gold, timeMs: best.timeMs } : null;
  const out = better(cur, prevScore)
    ? { ...cur, tape, scored, worldModel: 'sim-import' }
    : { ...best };
  out.runsSoFar = runsSoFar;
  out.scoredAttempts = scoredAttempts;
  out.worldModel = 'sim-import';
  out.envelope = better(cur, prevScore) ? env : out.envelope;
  fs.writeFileSync(gp, JSON.stringify(out, null, 2));
  console.log('WROTE gauntlet-outcome.json');
});
