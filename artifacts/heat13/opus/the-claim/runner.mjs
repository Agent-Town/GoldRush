#!/usr/bin/env node
// Gauntlet runner: spawns gr-sim, drives a controller module, logs every view,
// writes gauntlet-outcome.json + envelope axes on EVERY child exit.
// Usage: node runner.mjs <controllerPath|idle> <tapeName>
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WS = '/private/tmp/heat13-569a41f9/artifacts/heat13/opus/the-claim';
const REPO = '/private/tmp/heat13-569a41f9';
const CONTRACT = 'the-claim';
const SEED = 'e1-the-claim-01';
const WORLD_MODEL = 'sim-import';

const ctrlArg = process.argv[2];
const tapeName = process.argv[3] || 'probe';
const tapePath = path.join(WS, `${tapeName}.json`);
const logPath = path.join(WS, `${tapeName}-views.jsonl`);

let controller = null;
if (ctrlArg && ctrlArg !== 'idle') {
  const mod = await import(ctrlArg.startsWith('/') ? ctrlArg : path.join(WS, ctrlArg));
  controller = mod.default || mod.controller;
}

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tapePath];
if (!controller) args.push('--policy=idle');

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });

const logStream = fs.createWriteStream(logPath);
let buf = '';
let outcome = null;
let viewCount = 0;
const state = { rows: [] };
const stderrTail = [];

child.stderr.on('data', (d) => {
  const s = d.toString();
  for (const l of s.split('\n')) if (l.trim()) { stderrTail.push(l); if (stderrTail.length > 60) stderrTail.shift(); }
});

child.stdout.on('data', (chunk) => {
  buf += chunk.toString();
  let idx;
  while ((idx = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, idx);
    buf = buf.slice(idx + 1);
    if (!line.trim()) continue;
    let obj;
    try { obj = JSON.parse(line); } catch { continue; }
    if (obj && obj.schema === 'goldrush.view.v1') {
      viewCount++;
      logStream.write(JSON.stringify(obj) + '\n');
      const n = obj.now || {};
      state.rows.push({
        v: viewCount,
        t: +(n.timers?.runSeconds ?? 0).toFixed(2),
        w: n.wave,
        gold: n.gold,
        pan: n.score?.goldPanned,
        hp: n.hero?.hp, mx: n.hero?.maxHp,
        hx: n.hero?.x != null ? +n.hero.x.toFixed(1) : null,
        hz: n.hero?.z != null ? +n.hero.z.toFixed(1) : null,
        alive: n.threats?.alive,
        wreck: n.works?.wrecked,
        stand: n.works?.standing,
        kinds: n.works?.byKind ? JSON.stringify(n.works.byKind) : null,
        sec: n.pendingSecure ? 1 : 0,
        off: n.pendingOffer ? n.pendingOffer.length : 0,
      });
      if (controller) {
        let orders;
        try { orders = controller(obj, state); }
        catch (e) { console.error('CONTROLLER THREW', e); orders = []; }
        if (orders === null || orders === undefined) child.stdin.write('\n');
        else child.stdin.write(JSON.stringify(orders) + '\n');
      }
    } else if (obj && (obj.secured !== undefined)) {
      outcome = obj;
    }
  }
});

function envelope() {
  try {
    const tape = JSON.parse(fs.readFileSync(tapePath, 'utf8'));
    const il = tape.inputLog || {};
    const entries = il.entries || [];
    const ticks = entries.map(e => (e.t ?? e.tick ?? e.atTick));
    const lastEntryTick = ticks.length ? Math.max(...ticks.filter(Number.isFinite)) : null;
    return {
      durationTicks: il.durationTicks ?? null,
      lastEntryTick,
      entries: entries.length,
      bytes: fs.statSync(tapePath).size,
      tapeHash: tape.eventLogHash || tape.meta?.eventLogHash || null,
    };
  } catch (e) { return { error: String(e) }; }
}

function finish(code) {
  logStream.end();
  const env = envelope();
  const summary = { tape: tapePath, code, outcome, views: viewCount, envelope: env, rows: state.rows };
  fs.writeFileSync(path.join(WS, `${tapeName}-summary.json`), JSON.stringify(summary, null, 1));

  // INTERMEDIATE-RESULTS LAW: (over)write gauntlet-outcome.json with the BEST so far.
  const outPath = path.join(WS, 'gauntlet-outcome.json');
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(outPath, 'utf8')); } catch {}
  const runsSoFar = (prev?.runsSoFar || 0) + 1;
  const scored = /^attempt-/.test(tapeName);
  const scoredAttempts = (prev?.scoredAttempts || 0) + (scored ? 1 : 0);
  const better = (a, b) => {
    if (!b) return true;
    if (!!a?.secured !== !!b.secured) return !!a?.secured;
    if ((a?.waves || 0) !== (b.waves || 0)) return (a?.waves || 0) > (b.waves || 0);
    if ((a?.gold || 0) !== (b.gold || 0)) return (a?.gold || 0) > (b.gold || 0);
    return (a?.timeMs || 0) > (b.timeMs || 0);
  };
  let row;
  if (outcome && better(outcome, prev?.outcome ? { ...prev.outcome } : null)) {
    row = { ...outcome, outcome, tape: tapePath, scored, envelope: env };
  } else if (prev) {
    row = { ...prev };
  } else {
    row = { ...(outcome || { secured: false }), outcome, tape: tapePath, scored, envelope: env };
  }
  row.runsSoFar = runsSoFar;
  row.scoredAttempts = scoredAttempts;
  row.worldModel = WORLD_MODEL;
  fs.writeFileSync(outPath, JSON.stringify(row, null, 1));

  // compact table
  const R = state.rows;
  const step = Math.max(1, Math.floor(R.length / 40));
  console.log('v    t      w  gold pan   hp/mx    hero        alive wr st kinds');
  for (let i = 0; i < R.length; i += step) {
    const r = R[i];
    console.log(`${String(r.v).padEnd(4)} ${String(r.t).padEnd(6)} ${String(r.w).padEnd(2)} ${String(r.gold).padEnd(4)} ${String(r.pan).padEnd(5)} ${String(r.hp)}/${r.mx}`.padEnd(46) + ` (${r.hx},${r.hz})`.padEnd(14) + ` ${String(r.alive).padEnd(5)} ${String(r.wreck).padEnd(2)} ${String(r.stand).padEnd(2)} ${r.kinds || ''}`);
  }
  const last = R[R.length - 1];
  if (last) console.log('LAST', JSON.stringify(last));
  console.log('OUTCOME', JSON.stringify(outcome));
  console.log('ENVELOPE', JSON.stringify(env));
  if (!outcome) console.log('STDERR TAIL', stderrTail.slice(-12).join(' | '));
}

child.on('close', (code) => { finish(code); });
