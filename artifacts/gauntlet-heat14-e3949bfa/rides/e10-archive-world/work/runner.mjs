#!/usr/bin/env node
// Runner: spawn gr-sim, drive a controller, log every view, write gauntlet-outcome.json
// and all three envelope axes on every child exit. (Notebook: runner before the probe.)
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../../../..');
const CONTRACT = 'e10-archive-world';
const SEED = 'e10-archive-world-01';

const label = process.argv[2] || 'probe';
const ctrlPath = process.argv[3] || null; // null => --policy idle

const tape = path.join(HERE, `${label}-tape.json`);
const logPath = path.join(HERE, `${label}-views.jsonl`);
const sumPath = path.join(HERE, `${label}-summary.json`);

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (!ctrlPath) args.push('--policy', 'idle');

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });

let ctrl = null;
if (ctrlPath) {
  const mod = await import(path.isAbsolute(ctrlPath) ? ctrlPath : path.join(HERE, ctrlPath));
  ctrl = mod.default ?? mod.controller;
}

const logStream = fs.createWriteStream(logPath);
const rows = [];
let buf = '';
let outcome = null;
let viewN = 0;
let stderrTail = [];

function num(v, d = 3) { return (typeof v === 'number' && Number.isFinite(v)) ? +v.toFixed(d) : v; }

child.stderr.on('data', (d) => {
  const s = String(d);
  stderrTail.push(s);
  if (stderrTail.length > 40) stderrTail.shift();
});

child.stdout.on('data', (chunk) => {
  buf += chunk;
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i).trim();
    buf = buf.slice(i + 1);
    if (!line) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg && msg.schema === 'goldrush.view.v1') {
      viewN++;
      logStream.write(JSON.stringify(msg) + '\n');
      const n = msg.now || {};
      const row = {
        v: viewN,
        t: num(n.timers?.runSeconds ?? n.timers?.simTimeSeconds ?? 0),
        w: n.wave,
        hp: num(n.hero?.hp, 1), mx: n.hero?.maxHp, lv: n.hero?.level,
        hx: num(n.hero?.x, 1), hz: num(n.hero?.z, 1),
        px: num(n.prospector?.x, 1), pz: num(n.prospector?.z, 1),
        g: n.gold, pan: n.score?.goldPanned, stol: n.score?.goldStolen,
        al: n.threats?.alive, wr: n.threats?.wreckers, th: n.threats?.thieves,
        st: n.works?.standing, wk: n.works?.wrecked,
        kinds: n.works?.byKind ? JSON.stringify(n.works.byKind) : undefined,
        sq: n.squall ? `${n.squall.phase}/c${n.squall.cycle}/nx${num(n.squall.secondsToNextPhase,1)}/st${n.squall.squallsStarted}/cp${n.squall.squallsCompleted}` : undefined,
        ar: n.archive ? `hold=${n.archive.holdingWingId}/done=${n.archive.completedHolds}/ok=${n.archive.objectiveAllowsSecure}/rest=${(n.archive.restoredWingIds||[]).join(',')}` : undefined,
        off: n.pendingOffer ? n.pendingOffer.map(o => o.id).join('|') : undefined,
        sec: n.pendingSecure ? JSON.stringify(n.pendingSecure) : undefined,
        ordf: (n.orders || []).filter(o => o.status === 'failed').map(o => `${o.order?.verb}:${o.reason || ''}`).slice(0, 4).join(' ; ') || undefined,
      };
      rows.push(row);
      const compact = Object.entries(row).filter(([, v]) => v !== undefined && v !== null).map(([k, v]) => `${k}=${v}`).join(' ');
      console.log(compact);
      let reply = '\n';
      try { reply = ctrl ? ctrl(msg) : '\n'; } catch (e) { console.error('CTRL ERR', e.stack); reply = '\n'; }
      child.stdin.write(reply);
    } else if (msg && (msg.secured !== undefined || msg.endReason !== undefined)) {
      outcome = msg;
      console.log('OUTCOME', JSON.stringify(msg));
    }
  }
});

child.on('exit', (code) => {
  logStream.end();
  let env = null;
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
      defaultedSecure: tp.outcome?.defaultedSecure,
      defaultedPicks: tp.outcome?.defaultedPicks,
      eventLogHash: tp.eventLogHash ?? tp.meta?.eventLogHash ?? tp.outcome?.eventLogHash,
    };
  } catch (e) { env = { err: e.message }; }
  const summary = { label, code, outcome, envelope: env, views: viewN, rows: rows.slice(-8), stderrTail: stderrTail.slice(-6) };
  fs.writeFileSync(sumPath, JSON.stringify(summary, null, 1));
  console.log('ENVELOPE', JSON.stringify(env));
  console.log('SUMMARY ->', sumPath);
  // intermediate-results law: write/refresh gauntlet-outcome.json with best-so-far
  try {
    const gp = path.join(HERE, 'gauntlet-outcome.json');
    let prev = null;
    try { prev = JSON.parse(fs.readFileSync(gp, 'utf8')); } catch {}
    const cand = { ...(outcome || {}), tape, scored: false, worldModel: 'sim-import' };
    const better = !prev || (!prev.secured && (cand.secured || (cand.waves ?? 0) > (prev.waves ?? 0)))
      || (cand.secured && !prev.secured);
    const runsSoFar = (prev?.runsSoFar ?? 0) + 1;
    const out = better ? { ...cand, runsSoFar, scoredAttempts: prev?.scoredAttempts ?? 0 }
      : { ...prev, runsSoFar };
    fs.writeFileSync(gp, JSON.stringify(out, null, 1));
  } catch (e) { console.error('outcome write failed', e.message); }
  process.exit(0);
});
