#!/usr/bin/env node
// Heat 13 runner — spawns gr-sim, drives a controller module, logs every view,
// writes gauntlet-outcome.json on every child exit (intermediate-results law).
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DIR = '/private/tmp/heat13-569a41f9/artifacts/heat13/opus/e4-dust-flats';
const REPO = '/private/tmp/heat13-569a41f9';
const CONTRACT = 'e4-dust-flats';
const SEED = 'e4-dust-flats-01';
const WORLD_MODEL = 'sim-import';

const args = process.argv.slice(2);
const label = args[0] || 'probe';           // tape name stem
const ctrlPath = args[1] || null;           // controller module, or null => idle
const tape = path.join(DIR, `${label}-tape.json`);
const viewLog = path.join(DIR, `${label}-views.jsonl`);

const simArgs = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (!ctrlPath) simArgs.push('--policy=idle');

let controller = null;
if (ctrlPath) controller = (await import(ctrlPath)).default;

const child = spawn('node', simArgs, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
const views = [];
let outcome = null;
let buf = '';
let stderrTail = [];
const table = [];

child.stderr.on('data', (d) => {
  const s = String(d);
  stderrTail.push(s);
  if (stderrTail.length > 60) stderrTail.shift();
});

child.stdout.on('data', (d) => {
  buf += String(d);
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i).trim();
    buf = buf.slice(i + 1);
    if (!line) continue;
    let obj;
    try { obj = JSON.parse(line); } catch { continue; }
    if (obj.schema === 'goldrush.view.v1') {
      views.push(obj);
      handleView(obj);
    } else if (typeof obj.secured === 'boolean') {
      outcome = obj;
    }
  }
});

function handleView(v) {
  const now = v.now || {};
  const m = now.motor || {};
  const row = {
    i: views.length - 1,
    t: round(now.timers?.simTime ?? now.simTime ?? 0),
    w: now.wave,
    hp: round(now.hero?.hp), mx: round(now.hero?.maxHp),
    hx: round(now.hero?.x), hz: round(now.hero?.z),
    g: now.gold, pan: now.score?.goldPanned,
    alive: now.threats?.alive,
    works: now.works?.standing ?? (now.works?.entries || []).length,
    wr: now.works?.wrecked,
    arr: m.objective?.arrived, veh: m.vehicle?.state,
    vx: round(m.vehicle?.x), vz: round(m.vehicle?.z),
    fuel: round(m.fuel?.stored), tar: m.fuel?.tar, drawn: round(m.fuel?.drawn),
    graded: (m.roads?.corridors || []).filter(c => c.graded).map(c => c.id).join(','),
    boss: now.threats?.bossAlive,
    ps: !!now.pendingSecure, po: !!now.pendingOffer,
  };
  table.push(row);
  if (!controller) return;
  let orders;
  try { orders = controller(v, { views, table }); }
  catch (e) { console.error('CTRL ERROR', e.stack); orders = null; }
  if (orders === null || orders === undefined) { child.stdin.write('\n'); return; }
  child.stdin.write(JSON.stringify(orders) + '\n');
}

function round(x) { return typeof x === 'number' ? Math.round(x * 100) / 100 : x; }

child.on('exit', (code) => {
  try { fs.writeFileSync(viewLog, views.map(v => JSON.stringify(v)).join('\n')); } catch {}
  try { fs.writeFileSync(path.join(DIR, `${label}-table.json`), JSON.stringify(table, null, 0)); } catch {}
  // envelope
  let env = {};
  try {
    const t = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const entries = t.inputLog?.entries || [];
    const ticks = t.inputLog?.durationTicks;
    const lastTick = entries.length ? entries[entries.length - 1].t ?? entries[entries.length - 1].tick : null;
    env = {
      durationTicks: ticks, lastEntryTick: lastTick, entries: entries.length,
      bytes: fs.statSync(tape).size, tapeHash: t.eventLogHash ?? t.meta?.eventLogHash,
    };
  } catch (e) { env = { error: String(e) }; }
  console.log('OUTCOME', JSON.stringify(outcome));
  console.log('ENVELOPE', JSON.stringify(env));
  console.log('TABLE_TAIL', JSON.stringify(table.slice(-14)));
  if (!outcome) console.log('STDERR_TAIL', stderrTail.join('').slice(-2000));

  // intermediate-results law: best-so-far
  const outPath = path.join(DIR, 'gauntlet-outcome.json');
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(outPath, 'utf8')); } catch {}
  const runsSoFar = (prev?.runsSoFar || 0) + 1;
  const scored = label.startsWith('attempt');
  const scoredAttempts = (prev?.scoredAttempts || 0) + (scored ? 1 : 0);
  const better = (a, b) => {
    if (!b) return true;
    if ((a?.secured ? 1 : 0) !== (b.secured ? 1 : 0)) return (a?.secured ? 1 : 0) > (b.secured ? 1 : 0);
    if ((a?.waves || 0) !== (b.waves || 0)) return (a?.waves || 0) > (b.waves || 0);
    return (a?.gold || 0) >= (b.gold || 0);
  };
  const prevOutcome = prev ? { secured: prev.secured, waves: prev.waves, gold: prev.gold } : null;
  const take = outcome && better(outcome, prevOutcome);
  const row = take
    ? { ...outcome, tape, scored, runsSoFar, scoredAttempts, worldModel: WORLD_MODEL, envelope: env }
    : { ...prev, runsSoFar, scoredAttempts };
  fs.writeFileSync(outPath, JSON.stringify(row, null, 2));
  console.log('WROTE outcome, best tape =', row.tape);
});
