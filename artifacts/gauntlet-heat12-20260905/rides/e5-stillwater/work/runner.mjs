// Runner: spawns gr-sim, drives a controller module, logs every view,
// writes gauntlet-outcome.json on every child exit (intermediate-results law).
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DIR = '/tmp/heat12-038cc280/artifacts/heat12/opus/e5-stillwater';
const SIM = '/tmp/heat12-038cc280/scripts/gr-sim.mjs';
const CONTRACT = 'e5-stillwater';
const SEED = 'e5-stillwater-01';
const WORLD_MODEL = 'sim-import';

const args = process.argv.slice(2);
const label = args[0];                 // e.g. probe-idle, tune-1, attempt-1
const ctrlPath = args[1] || null;      // controller module or 'idle'
const scored = args.includes('--scored');

const tape = path.join(DIR, `${label}-tape.json`);
const viewLog = path.join(DIR, `${label}-views.jsonl`);

const simArgs = ['--contract', CONTRACT, '--seed', SEED, '--difficulty', 'trail', '--tape', tape];
if (ctrlPath === 'idle') simArgs.push('--policy', 'idle');

let controller = null;
if (ctrlPath && ctrlPath !== 'idle') {
  const mod = await import(path.resolve(ctrlPath) + `?v=${Date.now()}`);
  controller = mod.default ?? mod.controller;
}

const child = spawn('node', [SIM, ...simArgs], { cwd: '/tmp/heat12-038cc280', stdio: ['pipe', 'pipe', 'pipe'] });

const vlog = fs.createWriteStream(viewLog);
let buf = '';
let outcome = null;
const views = [];
let stderr = '';
child.stderr.on('data', (d) => { stderr += d.toString(); });

const state = {};

child.stdout.on('data', (d) => {
  buf += d.toString();
  let idx;
  while ((idx = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, idx).trim();
    buf = buf.slice(idx + 1);
    if (!line) continue;
    let obj;
    try { obj = JSON.parse(line); } catch { continue; }
    if (obj.schema === 'goldrush.view.v1') {
      views.push(obj);
      vlog.write(JSON.stringify({
        t: obj.now?.timers?.runSeconds, wave: obj.now?.wave, gold: obj.now?.gold,
        panned: obj.now?.score?.goldPanned, hp: obj.now?.hero?.hp, maxHp: obj.now?.hero?.maxHp,
        lvl: obj.now?.hero?.level, alive: obj.now?.threats?.alive,
        works: obj.now?.works?.byKind, wrecked: obj.now?.works?.wrecked,
        prospector: obj.now?.prospector,
        deepwater: obj.now?.deepwater,
        pendingSecure: obj.now?.pendingSecure ? true : undefined,
        offers: obj.now?.pendingOffer?.map(o => o.id),
        orderFails: obj.now?.orders?.filter?.(r => r.status === 'failed').map(r => ({ v: r.order?.verb, r: r.reason })),
      }) + '\n');
      if (controller) {
        let arr;
        try { arr = controller(obj, state); } catch (e) { console.error('CTRL ERR', e); arr = null; }
        if (arr === null || arr === undefined) child.stdin.write('\n');
        else child.stdin.write(JSON.stringify(arr) + '\n');
      }
    } else if (obj.secured !== undefined) {
      outcome = obj;
    }
  }
});

child.on('exit', (code) => {
  vlog.end();
  fs.writeFileSync(path.join(DIR, `${label}-stderr.txt`), stderr.slice(-20000));
  const summary = { label, code, views: views.length, outcome };
  fs.writeFileSync(path.join(DIR, `${label}-summary.json`), JSON.stringify(summary, null, 1));
  // tape envelope
  let env = null;
  try {
    const t = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const entries = t.inputLog?.entries ?? [];
    env = {
      durationTicks: t.inputLog?.durationTicks,
      entries: entries.length,
      lastEntryTick: entries.length ? entries[entries.length - 1].tick : null,
      bytes: fs.statSync(tape).size,
    };
  } catch { }
  console.log(JSON.stringify({ label, code, views: views.length, outcome, env }, null, 1));
  if (stderr) console.error('--- stderr tail ---\n' + stderr.slice(-2000));

  // intermediate-results law: write best-so-far
  const outPath = path.join(DIR, 'gauntlet-outcome.json');
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(outPath, 'utf8')); } catch { }
  const runsSoFar = (prev?.runsSoFar ?? 0) + 1;
  const scoredAttempts = (prev?.scoredAttempts ?? 0) + (scored ? 1 : 0);
  const better = (a, b) => {
    if (!b) return true;
    if ((a?.secured ? 1 : 0) !== (b.secured ? 1 : 0)) return (a?.secured ? 1 : 0) > (b.secured ? 1 : 0);
    if ((a?.waves ?? 0) !== (b.waves ?? 0)) return (a?.waves ?? 0) > (b.waves ?? 0);
    return (a?.gold ?? 0) >= (b.gold ?? 0);
  };
  const prevScore = prev ? { secured: prev.secured, waves: prev.waves, gold: prev.gold } : null;
  let row;
  if (outcome && better(outcome, prevScore)) {
    row = { ...outcome, tape, scored, runsSoFar, scoredAttempts, worldModel: WORLD_MODEL, env };
  } else {
    row = { ...prev, runsSoFar, scoredAttempts };
  }
  fs.writeFileSync(outPath, JSON.stringify(row, null, 1));
});
