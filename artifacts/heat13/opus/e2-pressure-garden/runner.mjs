// Gauntlet runner: spawns gr-sim, drives a controller module, logs every view,
// writes gauntlet-outcome.json on every child exit (intermediate-results law).
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WS = '/private/tmp/heat13-569a41f9/artifacts/heat13/opus/e2-pressure-garden';
const REPO = '/private/tmp/heat13-569a41f9';
const CONTRACT = 'e2-pressure-garden';
const SEED = 'e2-pressure-garden-01';
const WORLD_MODEL = 'sim-import';

const label = process.argv[2] || 'probe';
const ctrlPath = process.argv[3] || null; // null => --policy idle

const tape = path.join(WS, `${label}-tape.json`);
const viewLog = path.join(WS, `${label}-views.jsonl`);
const summaryPath = path.join(WS, `${label}-summary.json`);

let controller = null;
if (ctrlPath) {
  const mod = await import(`file://${path.resolve(ctrlPath)}?t=${Date.now()}`);
  controller = mod.default ?? mod.controller;
}

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (!controller) args.push('--policy', 'idle');

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });

const viewFd = fs.openSync(viewLog, 'w');
let buf = '';
let lastOutcome = null;
let viewCount = 0;
let submits = 0;
const rows = [];
let stderrTail = '';

child.stderr.on('data', (d) => { stderrTail = (stderrTail + d.toString()).slice(-4000); });

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
      fs.writeSync(viewFd, line + '\n');
      const n = msg.now || {};
      rows.push({
        v: viewCount,
        t: +(n.timers?.runSeconds ?? n.timers?.simTimeSeconds ?? 0).toFixed(1),
        w: n.wave,
        gold: n.gold,
        pan: n.score?.goldPanned,
        hp: n.hero ? +Number(n.hero.hp).toFixed(1) : null,
        mx: n.hero?.maxHp,
        hx: n.hero ? +Number(n.hero.x).toFixed(1) : null,
        hz: n.hero ? +Number(n.hero.z).toFixed(1) : null,
        alive: n.threats?.alive,
        wr: n.threats?.wreckers,
        th: n.threats?.thieves,
        works: n.works?.standing ?? (n.works?.entries || []).length,
        wrecked: n.works?.wrecked,
        byKind: n.works?.byKind,
        sec: n.pendingSecure ? 1 : 0,
      });
      if (controller) {
        let out;
        try { out = controller(msg, { viewCount }); }
        catch (e) { console.error('CTRL ERROR', e); out = []; }
        if (out === null || out === undefined) {
          child.stdin.write('\n');           // blank line: no entry recorded
        } else {
          submits++;
          child.stdin.write(JSON.stringify(out) + '\n');
        }
      }
    } else if (msg.secured !== undefined || msg.endReason !== undefined) {
      lastOutcome = msg;
    }
  }
});

child.on('exit', (code) => {
  fs.closeSync(viewFd);
  const summary = { label, code, viewCount, submits, outcome: lastOutcome, rows, stderrTail: stderrTail.slice(-1200) };
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 1));

  // envelope check
  let env = null;
  try {
    const tp = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const entries = tp.inputLog?.entries || [];
    const lastTick = entries.length ? Math.max(...entries.map(e => e.t ?? e.tick ?? 0)) : 0;
    env = {
      durationTicks: tp.inputLog?.durationTicks,
      lastEntryTick: lastTick,
      entries: entries.length,
      bytes: fs.statSync(tape).size,
      tapeHash: tp.meta?.eventLogHash ?? tp.eventLogHash ?? null,
    };
  } catch (e) { env = { error: String(e) }; }
  fs.writeFileSync(path.join(WS, `${label}-envelope.json`), JSON.stringify(env, null, 1));

  console.log(JSON.stringify({ label, code, viewCount, submits, outcome: lastOutcome, env }, null, 1));
  console.log('TAIL', JSON.stringify(rows.slice(-6)));

  // intermediate-results law: promote best-so-far
  const outFile = path.join(WS, 'gauntlet-outcome.json');
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(outFile, 'utf8')); } catch {}
  const runsSoFar = (prev?.runsSoFar ?? 0) + 1;
  const scored = /^attempt-/.test(label);
  const scoredAttempts = (prev?.scoredAttempts ?? 0) + (scored ? 1 : 0);
  const better = (a, b) => {
    if (!b) return true;
    if ((a?.secured ? 1 : 0) !== (b?.secured ? 1 : 0)) return (a?.secured ? 1 : 0) > (b?.secured ? 1 : 0);
    if ((a?.waves ?? 0) !== (b?.waves ?? 0)) return (a?.waves ?? 0) > (b?.waves ?? 0);
    return (a?.gold ?? 0) >= (b?.gold ?? 0);
  };
  const prevOutcome = prev ? { secured: prev.secured, waves: prev.waves, gold: prev.gold } : null;
  let row;
  if (lastOutcome && better(lastOutcome, prevOutcome)) {
    row = { ...lastOutcome, tape, scored, runsSoFar, scoredAttempts, worldModel: WORLD_MODEL, envelope: env };
  } else {
    row = { ...prev, runsSoFar, scoredAttempts };
  }
  fs.writeFileSync(outFile, JSON.stringify(row, null, 1));
});
