// runner.mjs — spawn gr-sim, drive a controller module, log every view, write outcome on exit.
// Usage: node runner.mjs <label> <controllerPath|idle>
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WS = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa/artifacts/heat14/opus/e1-night-shift';
const REPO = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa';
const CONTRACT = 'e1-night-shift';
const SEED = 'e1-night-shift-01';

const label = process.argv[2] || 'probe';
const ctrlPath = process.argv[3] || 'idle';
const tape = path.join(WS, `${label}-tape.json`);
const logPath = path.join(WS, `${label}-views.jsonl`);
const tablePath = path.join(WS, `${label}-table.txt`);

let controller = null;
if (ctrlPath !== 'idle') {
  const mod = await import(ctrlPath.startsWith('/') ? ctrlPath : path.join(WS, ctrlPath));
  controller = mod.default ?? mod.controller;
}

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (ctrlPath === 'idle') args.push('--policy=idle');

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
const logFd = fs.openSync(logPath, 'w');
const rows = [];
let buf = '';
let outcome = null;
let views = 0;
let state = {};

child.stdout.on('data', (chunk) => {
  buf += chunk.toString();
  let nl;
  while ((nl = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, nl);
    buf = buf.slice(nl + 1);
    if (!line.trim()) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg.schema === 'goldrush.view.v1') {
      views++;
      fs.writeSync(logFd, JSON.stringify(msg) + '\n');
      const n = msg.now || {};
      const w = n.works || {};
      rows.push({
        v: views, t: +((n.timers?.runSeconds ?? n.timers?.simTimeSeconds ?? 0)).toFixed(1),
        wave: n.wave, gold: n.gold, pan: n.score?.goldPanned, stolen: n.score?.goldStolen,
        hp: n.hero?.hp != null ? +n.hero.hp.toFixed(1) : null, maxHp: n.hero?.maxHp,
        hx: n.hero?.x != null ? +n.hero.x.toFixed(1) : null, hz: n.hero?.z != null ? +n.hero.z.toFixed(1) : null,
        alive: n.threats?.alive, wr: n.threats?.wreckers, th: n.threats?.thieves,
        stand: w.standing, wrecked: w.wrecked, kinds: JSON.stringify(w.byKind || {}),
        offer: n.pendingOffer ? n.pendingOffer.length : 0, sec: n.pendingSecure ? 1 : 0,
      });
      if (controller) {
        let orders;
        try { orders = controller(msg, state); } catch (e) { console.error('CTRL ERR', e.stack); orders = null; }
        if (orders === null || orders === undefined) child.stdin.write('\n');
        else child.stdin.write(JSON.stringify(orders) + '\n');
      }
    } else if (msg.secured !== undefined || msg.waves !== undefined) {
      outcome = msg;
    }
  }
});
child.stderr.on('data', (d) => { const s = d.toString(); if (/rejected/.test(s)) process.stderr.write('[SIM] ' + s); });

child.on('exit', (code) => {
  fs.closeSync(logFd);
  // compact table
  const hdr = Object.keys(rows[0] || { v: 0 }).join('\t');
  fs.writeFileSync(tablePath, hdr + '\n' + rows.map(r => Object.values(r).join('\t')).join('\n') + '\n');
  // envelope
  let env = {};
  try {
    const tp = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const entries = tp.inputLog?.entries || [];
    const lastTick = entries.length ? Math.max(...entries.map(e => e.t ?? e.tick ?? 0)) : 0;
    env = {
      durationTicks: tp.inputLog?.durationTicks,
      lastEntryTick: lastTick,
      entries: entries.length,
      bytes: fs.statSync(tape).size,
      tapeHash: tp.eventLogHash ?? tp.meta?.eventLogHash,
    };
  } catch (e) { env = { error: e.message }; }
  const summary = { label, code, outcome, views, envelope: env, tape };
  fs.writeFileSync(path.join(WS, `${label}-summary.json`), JSON.stringify(summary, null, 1));
  // promote best-so-far into gauntlet-outcome.json
  try {
    const outFile = path.join(WS, 'gauntlet-outcome.json');
    let prev = null;
    try { prev = JSON.parse(fs.readFileSync(outFile, 'utf8')); } catch {}
    const better = (a, b) => {
      if (!b) return true;
      if ((a.secured ? 1 : 0) !== (b.secured ? 1 : 0)) return (a.secured ? 1 : 0) > (b.secured ? 1 : 0);
      if ((a.waves || 0) !== (b.waves || 0)) return (a.waves || 0) > (b.waves || 0);
      if ((a.gold || 0) !== (b.gold || 0)) return (a.gold || 0) > (b.gold || 0);
      return (a.timeMs || 0) >= (b.timeMs || 0);
    };
    const prevScore = prev ? { secured: prev.secured, waves: prev.waves, gold: prev.gold, timeMs: prev.timeMs } : null;
    if (outcome && better(outcome, prevScore)) {
      const runs = (prev?.runsSoFar || 0) + 1;
      fs.writeFileSync(outFile, JSON.stringify({
        ...outcome,
        tape, scored: /^attempt/.test(label), runsSoFar: runs,
        scoredAttempts: (prev?.scoredAttempts || 0) + (/^attempt/.test(label) ? 1 : 0),
        worldModel: 'sim-import', envelope: env,
      }, null, 1));
    } else if (prev) {
      prev.runsSoFar = (prev.runsSoFar || 0) + 1;
      prev.scoredAttempts = (prev.scoredAttempts || 0) + (/^attempt/.test(label) ? 1 : 0);
      fs.writeFileSync(outFile, JSON.stringify(prev, null, 1));
    }
  } catch (e) { console.error('outcome write err', e.message); }
  console.log(JSON.stringify(summary));
  console.log('ROWS', rows.length, 'last', JSON.stringify(rows[rows.length - 1] || {}));
});
