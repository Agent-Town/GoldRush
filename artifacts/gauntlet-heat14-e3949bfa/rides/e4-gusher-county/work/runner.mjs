#!/usr/bin/env node
// Runner: spawns gr-sim, drives a controller module, logs every view, and writes
// gauntlet-outcome.json + all three envelope axes on EVERY child exit.
// (Intermediate-results law: the row on disk must be truthful from the first run onward.)
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DIR = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa';
const OUT = path.join(DIR, 'artifacts/heat14/opus/e4-gusher-county');
const CONTRACT = 'e4-gusher-county';
const SEED = 'e4-gusher-county-01';

const label = process.argv[2] || 'probe';
const ctrlPath = process.argv[3] || null;
const tape = path.join(OUT, `${label}-tape.json`);
const viewLog = path.join(OUT, `${label}-views.jsonl`);

let controller = null;
if (ctrlPath) controller = (await import(path.join(OUT, ctrlPath))).default;

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (!controller) args.push('--policy=idle');

const child = spawn('node', args, { cwd: DIR, stdio: ['pipe', 'pipe', 'pipe'] });
const views = [];
let outcome = null;
let buf = '';
let stderrBuf = '';
const rows = [];

child.stderr.on('data', (d) => { stderrBuf += d.toString(); });

child.stdout.on('data', (d) => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i); buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let msg; try { msg = JSON.parse(line); } catch { continue; }
    if (msg && msg.schema === 'goldrush.view.v1') {
      views.push(msg);
      fs.appendFileSync(viewLog, JSON.stringify(msg) + '\n');
      const n = msg.now || {};
      const mo = n.motor || {};
      rows.push([
        views.length,
        `t=${(n.timers?.runSeconds ?? 0).toFixed(1)}`,
        `w=${n.wave}`,
        `hp=${(n.hero?.hp ?? 0).toFixed(0)}/${n.hero?.maxHp ?? 0}`,
        `h=(${(n.hero?.x ?? 0).toFixed(0)},${(n.hero?.z ?? 0).toFixed(0)})`,
        `g=${n.gold}`,
        `pan=${n.score?.goldPanned ?? 0}`,
        `stl=${n.score?.goldStolen ?? 0}`,
        `wk=${n.works?.standing ?? 0}/${n.works?.wrecked ?? 0}`,
        `al=${n.threats?.alive ?? 0}`,
        `wr=${n.threats?.wreckers ?? 0}`,
        `th=${n.threats?.thieves ?? 0}`,
        mo.objective ? `dlv=${(mo.objective.delivered || []).length} arr=${mo.objective.arrived}` : '',
        mo.fuel ? `fuel=${(mo.fuel.stored ?? 0).toFixed(1)} tar=${mo.fuel.tar ?? 0} drawn=${(mo.fuel.drawn ?? 0).toFixed(1)}` : '',
        mo.roads ? `closed=${mo.roads.closed ?? '-'}` : '',
        mo.vehicle ? `veh=(${(mo.vehicle.x ?? 0).toFixed(0)},${(mo.vehicle.z ?? 0).toFixed(0)})${mo.vehicle.state ?? ''}` : '',
      ].filter(Boolean).join(' '));
      if (controller) {
        let orders;
        try { orders = controller(msg, views); } catch (e) {
          console.error('CONTROLLER THREW', e);
          orders = null;
        }
        // null / undefined => blank line (records no entry, cannot be rejected)
        child.stdin.write(orders == null ? '\n' : JSON.stringify(orders) + '\n');
      }
    } else if (msg && typeof msg.secured === 'boolean') {
      outcome = msg;
    }
  }
});

function envelope() {
  try {
    const t = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const il = t.inputLog || {};
    const entries = il.entries || [];
    const lastTick = entries.length ? Math.max(...entries.map(e => e.t ?? e.tick ?? 0)) : 0;
    return {
      durationTicks: il.durationTicks,
      lastEntryTick: lastTick,
      entries: entries.length,
      bytes: fs.statSync(tape).size,
      tapeHash: t.meta?.eventLogHash ?? t.eventLogHash ?? null,
    };
  } catch (e) { return { error: String(e) }; }
}

child.on('exit', (code) => {
  const env = envelope();
  console.log('\n' + rows.join('\n'));
  console.log('\nEXIT', code, 'views', views.length);
  console.log('OUTCOME', JSON.stringify(outcome));
  console.log('ENVELOPE', JSON.stringify(env));
  if (stderrBuf) console.log('STDERR(tail)', stderrBuf.slice(-1200));

  const summary = { label, outcome, envelope: env, views: views.length };
  fs.writeFileSync(path.join(OUT, `${label}-summary.json`), JSON.stringify(summary, null, 2));

  // Promote into gauntlet-outcome.json if this is the best so far.
  const gPath = path.join(OUT, 'gauntlet-outcome.json');
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(gPath, 'utf8')); } catch {}
  const better = (a, b) => {
    if (!b) return true;
    if ((a?.secured ? 1 : 0) !== (b?.secured ? 1 : 0)) return (a?.secured ? 1 : 0) > (b?.secured ? 1 : 0);
    if ((a?.waves ?? 0) !== (b?.waves ?? 0)) return (a?.waves ?? 0) > (b?.waves ?? 0);
    return (a?.gold ?? 0) >= (b?.gold ?? 0);
  };
  const runsSoFar = (prev?.runsSoFar ?? 0) + 1;
  const scored = /^attempt-/.test(label);
  const scoredAttempts = (prev?.scoredAttempts ?? 0) + (scored ? 1 : 0);
  if (outcome && better(outcome, prev?.outcomeLine)) {
    fs.writeFileSync(gPath, JSON.stringify({
      ...outcome,
      outcomeLine: outcome,
      tape,
      scored,
      runsSoFar,
      scoredAttempts,
      worldModel: 'sim-import',
      envelope: env,
      note: `promoted from run "${label}"`,
    }, null, 2));
  } else if (prev) {
    fs.writeFileSync(gPath, JSON.stringify({ ...prev, runsSoFar, scoredAttempts }, null, 2));
  } else {
    fs.writeFileSync(gPath, JSON.stringify({
      ...(outcome || {}), outcomeLine: outcome, tape, scored, runsSoFar, scoredAttempts,
      worldModel: 'sim-import', envelope: env,
    }, null, 2));
  }
  console.log('wrote gauntlet-outcome.json');
});
