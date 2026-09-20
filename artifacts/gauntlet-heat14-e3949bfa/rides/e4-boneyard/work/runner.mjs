#!/usr/bin/env node
// Gold Rush heat-14 runner — spawns gr-sim, drives a controller, logs every view,
// writes gauntlet-outcome.json + all three envelope axes on every child exit.
// (Arena refuses shell redirection / compound cd; timeout(1) is not on macOS.)
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WS = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa';
const OUT = path.join(WS, 'artifacts/heat14/opus/e4-boneyard');

const label = process.argv[2];                       // e.g. "tune-1"
const ctrlPath = process.argv[3];                    // absolute or OUT-relative
const CONTRACT = 'e4-boneyard';
const SEED = 'e4-boneyard-01';

const tape = path.join(OUT, `${label}-tape.json`);
const logPath = path.join(OUT, `${label}-views.jsonl`);
const sumPath = path.join(OUT, `${label}-summary.json`);

let controller = null;
if (ctrlPath && ctrlPath !== 'idle') {
  const p = path.isAbsolute(ctrlPath) ? ctrlPath : path.join(OUT, ctrlPath);
  controller = (await import('file://' + p)).default;
}

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (!controller) args.push('--policy=idle');

const child = spawn('node', args, { cwd: WS, stdio: ['pipe', 'pipe', 'pipe'] });

const logFd = fs.openSync(logPath, 'w');
let buf = '';
let outcome = null;
let views = 0;
const rows = [];

function compact(now, sp) {
  const w = now.works ?? {};
  const m = now.motor ?? {};
  return {
    v: views, t: +((now.timers?.runSeconds ?? now.timers?.simTimeSeconds ?? 0)).toFixed(2),
    wave: now.wave,
    hp: now.hero ? +now.hero.hp.toFixed(1) : null,
    maxHp: now.hero?.maxHp ?? null,
    hx: now.hero ? +now.hero.x.toFixed(1) : null,
    hz: now.hero ? +now.hero.z.toFixed(1) : null,
    px: now.prospector ? +now.prospector.x.toFixed(1) : null,
    pz: now.prospector ? +now.prospector.z.toFixed(1) : null,
    gold: now.gold,
    pan: now.score?.goldPanned ?? null,
    stolen: now.score?.goldStolen ?? null,
    standing: w.standing ?? null, wrecked: w.wrecked ?? null,
    byKind: w.byKind ?? null,
    alive: now.threats?.alive ?? null,
    wreckers: now.threats?.wreckers ?? null,
    thieves: now.threats?.thieves ?? null,
    // motor
    mk: m.objective?.kind ?? null,
    hitched: m.objective?.hitched ?? null,
    arrived: m.objective?.arrived ?? null,
    stop: m.objective?.stop ?? null,
    vst: m.vehicle?.state ?? null,
    vx: m.vehicle ? +m.vehicle.x.toFixed(1) : null,
    vz: m.vehicle ? +m.vehicle.z.toFixed(1) : null,
    tar: m.fuel?.tar ?? null, stored: m.fuel?.stored ?? null, drawn: m.fuel?.drawn ?? null,
    nodes: m.fuel?.nodes?.map(n => (n.harvested ? 1 : 0)).join('') ?? null,
    wx: m.weather?.phase ?? null,
    seams: (now.seams ?? []).filter(s => s.active !== false && Number.isFinite(s.x))
      .map(s => `${s.id}@${s.anchorIndex}`).join(','),
    offer: now.pendingOffer ? now.pendingOffer.map(o => o.id).join('|') : null,
    sec: !!now.pendingSecure,
    orderFails: (now.orders ?? []).filter(o => o.status === 'failed')
      .map(o => `${o.order?.verb}:${(o.reason || '').slice(0, 44)}`).slice(0, 4),
  };
}

child.stdout.on('data', (chunk) => {
  buf += chunk.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i); buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg.schema === 'goldrush.view.v1') {
      views++;
      const row = compact(msg.now, msg.stablePrefix);
      rows.push(row);
      fs.writeSync(logFd, JSON.stringify({ kind: 'view', row, now: msg.now }) + '\n');
      if (controller) {
        let orders;
        try { orders = controller(msg, rows); } catch (e) {
          fs.writeSync(logFd, JSON.stringify({ kind: 'ctrl-error', err: String(e && e.stack) }) + '\n');
          orders = null;
        }
        if (orders === null || orders === undefined) child.stdin.write('\n');
        else child.stdin.write(JSON.stringify(orders) + '\n');
      }
    } else if (msg.secured !== undefined || msg.eventLogHash) {
      outcome = msg;
      fs.writeSync(logFd, JSON.stringify({ kind: 'outcome', outcome }) + '\n');
    }
  }
});

let stderrTail = '';
child.stderr.on('data', d => { stderrTail = (stderrTail + d.toString()).slice(-4000); });

child.on('close', (code) => {
  fs.closeSync(logFd);
  // envelope: all three axes, read from the tape + the source function's shape
  let env = null;
  try {
    const t = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const entries = t.inputLog?.entries ?? [];
    const lastTick = entries.length ? Math.max(...entries.map(e => e.t ?? e.tick ?? 0)) : 0;
    env = {
      durationTicks: t.inputLog?.durationTicks ?? null,
      lastEntryTick: lastTick,
      entries: entries.length,
      bytes: fs.statSync(tape).size,
    };
  } catch (e) { env = { error: String(e.message) }; }

  const summary = { label, code, outcome, views, envelope: env, stderrTail: stderrTail.slice(-1200), rows };
  fs.writeFileSync(sumPath, JSON.stringify(summary, null, 1));

  // intermediate-results law: promote best-so-far into gauntlet-outcome.json
  try {
    const gpath = path.join(OUT, 'gauntlet-outcome.json');
    let prev = null;
    try { prev = JSON.parse(fs.readFileSync(gpath, 'utf8')); } catch {}
    const runs = (prev?.runsSoFar ?? 0) + 1;
    const scored = /^attempt-/.test(label);
    const scoredAttempts = (prev?.scoredAttempts ?? 0) + (scored ? 1 : 0);
    const better = (a, b) => {
      if (!b) return true;
      if ((a?.secured ? 1 : 0) !== (b.secured ? 1 : 0)) return !!a?.secured;
      if ((a?.waves ?? 0) !== (b.waves ?? 0)) return (a?.waves ?? 0) > (b.waves ?? 0);
      if ((a?.gold ?? 0) !== (b.gold ?? 0)) return (a?.gold ?? 0) > (b.gold ?? 0);
      return (a?.timeMs ?? 0) >= (b.timeMs ?? 0);
    };
    const prevOutcome = prev && prev.secured !== undefined ? {
      secured: prev.secured, waves: prev.waves, timeMs: prev.timeMs, gold: prev.gold,
    } : null;
    const take = better(outcome, prevOutcome);
    const body = take
      ? { ...outcome, tape, scored, runsSoFar: runs, scoredAttempts, worldModel: 'sim-import', envelope: env }
      : { ...prev, runsSoFar: runs, scoredAttempts };
    fs.writeFileSync(gpath, JSON.stringify(body, null, 1));
  } catch (e) { /* never let bookkeeping kill the run */ }

  console.log(JSON.stringify({ label, code, outcome, views, envelope: env }));
  if (stderrTail.trim()) console.log('STDERR-TAIL:', stderrTail.slice(-600));
});
