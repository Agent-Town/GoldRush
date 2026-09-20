#!/usr/bin/env node
// Heat 13 runner: spawn gr-sim, drive a controller module, log every view,
// write gauntlet-outcome.json + envelope axes on every child exit.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DIR = '/private/tmp/heat13-569a41f9/artifacts/heat13/opus/e8-far-side';
const REPO = '/private/tmp/heat13-569a41f9';
const CONTRACT = 'e8-far-side';
const SEED = 'e8-far-side-01';
const WORLD_MODEL = 'sim-import';

const label = process.argv[2] || 'probe';
const ctrlPath = process.argv[3] || null; // null => --policy idle
const tape = path.join(DIR, `${label}-tape.json`);
const viewLog = path.join(DIR, `${label}-views.jsonl`);

let makeOrders = null;
if (ctrlPath) {
  const mod = await import(path.resolve(ctrlPath) + `?v=${Date.now()}`);
  makeOrders = mod.default || mod.makeOrders;
}

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (!ctrlPath) args.push('--policy', 'idle');

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
const vlog = fs.createWriteStream(viewLog);
let buf = '';
let outcome = null;
let viewN = 0;
const rows = [];
let state = {};

child.stderr.on('data', d => { const s = String(d); if (/reject/i.test(s)) console.error('STDERR:', s.trim().slice(0, 400)); });

child.stdout.on('data', chunk => {
  buf += chunk;
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i); buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let msg; try { msg = JSON.parse(line); } catch { continue; }
    if (msg.schema === 'goldrush.view.v1') {
      viewN++;
      vlog.write(JSON.stringify(msg) + '\n');
      const n = msg.now || {};
      rows.push({
        v: viewN, t: +(((n.timers && n.timers.runSeconds) ?? 0)).toFixed(1),
        w: n.wave, hp: n.hero && +Number(n.hero.hp).toFixed(1), mx: n.hero && n.hero.maxHp,
        hx: n.hero && +Number(n.hero.x).toFixed(1), hz: n.hero && +Number(n.hero.z).toFixed(1),
        px: n.prospector && +Number(n.prospector.x).toFixed(1), pz: n.prospector && +Number(n.prospector.z).toFixed(1),
        g: n.gold, pan: n.score && n.score.goldPanned,
        wk: n.works && n.works.standing, wr: n.works && n.works.wrecked,
        al: n.threats && n.threats.alive,
        air: n.air && n.air.suit && +Number(n.air.suit.seconds).toFixed(1),
        dome: n.air && n.air.suit && n.air.suit.inDome,
        cross: n.air && n.air.crossing && `${(n.air.crossing.reached||[]).length}/${n.air.crossing.required}`,
        rego: n.air && n.air.regolith && `${(n.air.regolith.worked||[]).length}/${n.air.regolith.required}`,
        probe: n.probeRecovery && n.probeRecovery.recovered,
        off: n.pendingOffer ? n.pendingOffer.length : 0, sec: !!n.pendingSecure,
      });
      if (!makeOrders) continue;
      let out;
      try { out = makeOrders(msg, state); } catch (e) { console.error('CTRL ERROR', e.stack); out = null; }
      if (out === null || out === undefined) { child.stdin.write('\n'); continue; }
      // finiteness guard: refuse to ship an array with any non-finite number
      const bad = JSON.stringify(out).match(/null|NaN|Infinity/);
      if (bad) { console.error('CTRL EMITTED NON-FINITE, sending blank', JSON.stringify(out).slice(0, 300)); child.stdin.write('\n'); continue; }
      child.stdin.write(JSON.stringify(out) + '\n');
    } else if (msg.secured !== undefined || msg.endReason !== undefined) {
      outcome = msg;
    }
  }
});

child.on('exit', code => {
  vlog.end();
  fs.writeFileSync(path.join(DIR, `${label}-rows.json`), JSON.stringify(rows, null, 1));
  // envelope
  let env = {};
  try {
    const tp = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const il = tp.inputLog || {};
    const entries = il.entries || [];
    const lastTick = entries.length ? Math.max(...entries.map(e => e.t ?? e.tick ?? 0)) : 0;
    env = {
      durationTicks: il.durationTicks,
      lastEntryTick: lastTick,
      entries: entries.length,
      bytes: fs.statSync(tape).size,
      tapeHash: tp.eventLogHash || (tp.meta && tp.meta.eventLogHash),
    };
  } catch (e) { env = { error: String(e.message) }; }
  const summary = { label, rc: code, outcome, envelope: env, views: viewN };
  fs.writeFileSync(path.join(DIR, `${label}-summary.json`), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
  console.log('LAST ROWS:', JSON.stringify(rows.slice(-6)));

  // intermediate-results law: best-so-far
  const OUT = path.join(DIR, 'gauntlet-outcome.json');
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(OUT, 'utf8')); } catch {}
  const runs = (prev && prev.runsSoFar || 0) + 1;
  const scored = /^attempt-/.test(label);
  const scoredN = (prev && prev.scoredAttempts || 0) + (scored ? 1 : 0);
  const better = (a, b) => {
    if (!b) return true;
    if ((a.secured ? 1 : 0) !== (b.secured ? 1 : 0)) return a.secured;
    if ((a.waves || 0) !== (b.waves || 0)) return (a.waves || 0) > (b.waves || 0);
    return (a.timeMs || 0) > (b.timeMs || 0);
  };
  const prevOutcome = prev && prev.waves !== undefined ? prev : null;
  const take = outcome && better(outcome, prevOutcome);
  const row = take
    ? { ...outcome, tape, scored, runsSoFar: runs, scoredAttempts: scoredN, worldModel: WORLD_MODEL }
    : { ...prev, runsSoFar: runs, scoredAttempts: scoredN, worldModel: WORLD_MODEL };
  fs.writeFileSync(OUT, JSON.stringify(row, null, 2));
});
