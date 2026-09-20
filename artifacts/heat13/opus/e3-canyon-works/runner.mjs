#!/usr/bin/env node
// Runner: spawns gr-sim, drives a controller module, logs every view, writes
// gauntlet-outcome.json + envelope axes on every child exit (intermediate-results law).
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WS = '/private/tmp/heat13-569a41f9/artifacts/heat13/opus/e3-canyon-works';
const REPO = '/private/tmp/heat13-569a41f9';
const CONTRACT = 'e3-canyon-works';
const SEED = 'e3-canyon-works-01';

const label = process.argv[2] || 'probe';
const ctrlPath = process.argv[3] || null;   // controller module path, or 'idle'
const tapePath = path.join(WS, `${label}-tape.json`);
const logPath = path.join(WS, `${label}-views.jsonl`);

let controller = null;
if (ctrlPath && ctrlPath !== 'idle') {
  controller = (await import(ctrlPath + `?v=${Date.now()}`)).default;
}

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tapePath];
if (ctrlPath === 'idle') args.push('--policy=idle');

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });

const logStream = fs.createWriteStream(logPath);
let buf = '';
let viewCount = 0;
let outcome = null;
let lastView = null;
const rows = [];

child.stdout.on('data', (d) => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i);
    buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg.schema === 'goldrush.view.v1') {
      viewCount++;
      lastView = msg;
      logStream.write(JSON.stringify(msg) + '\n');
      const n = msg.now || {};
      rows.push({
        v: viewCount,
        t: +(n.timers?.runSeconds ?? 0).toFixed(1),
        w: n.wave,
        gold: n.gold,
        pan: n.score?.goldPanned,
        hp: n.hero?.hp != null ? +n.hero.hp.toFixed(1) : null,
        hx: n.hero?.x != null ? +n.hero.x.toFixed(1) : null,
        hz: n.hero?.z != null ? +n.hero.z.toFixed(1) : null,
        px: n.prospector?.x != null ? +n.prospector.x.toFixed(1) : null,
        pz: n.prospector?.z != null ? +n.prospector.z.toFixed(1) : null,
        alive: n.threats?.alive,
        wk: n.works?.byKind ? JSON.stringify(n.works.byKind) : null,
        wrecked: n.works?.wrecked,
        cc: n.canyonConnect ? JSON.stringify(n.canyonConnect) : null,
        off: n.pendingOffer ? n.pendingOffer.map(o => o.id).join(',') : null,
        sec: n.pendingSecure ? JSON.stringify(n.pendingSecure) : null,
      });
      if (controller) {
        let orders;
        try { orders = controller(msg, viewCount); }
        catch (e) { console.error('CTRL ERROR', e); orders = null; }
        if (orders === null || orders === undefined) child.stdin.write('\n');
        else child.stdin.write(JSON.stringify(orders) + '\n');
      }
    } else if (msg.secured !== undefined || msg.waves !== undefined) {
      outcome = msg;
    }
  }
});

let stderrTail = '';
child.stderr.on('data', (d) => { stderrTail = (stderrTail + d.toString()).slice(-4000); });

child.on('exit', (code) => {
  logStream.end();
  // envelope
  let env = {};
  try {
    const tape = JSON.parse(fs.readFileSync(tapePath, 'utf8'));
    const entries = tape.inputLog?.entries || [];
    const ticks = tape.inputLog?.durationTicks;
    const lastTick = entries.length ? Math.max(...entries.map(e => e.t ?? e.tick ?? 0)) : null;
    env = {
      durationTicks: ticks,
      lastEntryTick: lastTick,
      entries: entries.length,
      bytes: fs.statSync(tapePath).size,
    };
  } catch (e) { env = { error: String(e) }; }

  const summary = { label, code, outcome, envelope: env, views: viewCount, tape: tapePath };
  fs.writeFileSync(path.join(WS, `${label}-summary.json`), JSON.stringify(summary, null, 2));
  fs.writeFileSync(path.join(WS, `${label}-rows.json`), JSON.stringify(rows, null, 1));

  // print compact table
  console.log('=== ' + label + ' exit=' + code + ' views=' + viewCount);
  const step = Math.max(1, Math.floor(rows.length / 40));
  for (let i = 0; i < rows.length; i += step) console.log(JSON.stringify(rows[i]));
  if (rows.length) console.log('LAST', JSON.stringify(rows[rows.length - 1]));
  console.log('OUTCOME', JSON.stringify(outcome));
  console.log('ENVELOPE', JSON.stringify(env));
  if (code !== 0) console.log('STDERR', stderrTail.slice(-1500));

  // intermediate-results law: promote if better than existing
  const outPath = path.join(WS, 'gauntlet-outcome.json');
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(outPath, 'utf8')); } catch {}
  const runsSoFar = (prev?.runsSoFar || 0) + 1;
  const scored = /^attempt-/.test(label);
  const scoredAttempts = (prev?.scoredAttempts || 0) + (scored ? 1 : 0);
  const better = !prev || !prev.secured && (outcome?.secured ||
    (outcome?.waves || 0) > (prev.waves || 0) ||
    ((outcome?.waves || 0) === (prev.waves || 0) && (outcome?.timeMs || 0) > (prev.timeMs || 0)));
  const body = better && outcome
    ? { ...outcome, tape: tapePath, scored, runsSoFar, scoredAttempts, worldModel: 'sim-import' }
    : { ...prev, runsSoFar, scoredAttempts };
  fs.writeFileSync(outPath, JSON.stringify(body, null, 2));
  console.log('WROTE gauntlet-outcome.json:', JSON.stringify(body).slice(0, 300));
});
