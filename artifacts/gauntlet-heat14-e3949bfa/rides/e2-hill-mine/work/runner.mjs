#!/usr/bin/env node
// Heat-14 e2-hill-mine runner. Spawns gr-sim, drives a controller module,
// logs every view to JSONL, writes gauntlet-outcome.json + all three envelope
// axes on EVERY child exit (the intermediate-results law, made automatic).
// This arena refuses shell redirection and compound `cd`; `timeout` is not on macOS.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DIR = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa';
const WS = path.join(DIR, 'artifacts/heat14/opus/e2-hill-mine');
const CONTRACT = 'e2-hill-mine';
const SEED = 'e2-hill-mine-01';

const label = process.argv[2] || 'probe';
const ctrlPath = process.argv[3] || null; // null => --policy idle
const tape = path.join(WS, `${label}-tape.json`);
const logPath = path.join(WS, `${label}-views.jsonl`);

let controller = null;
if (ctrlPath) {
  const mod = await import(path.join(WS, ctrlPath) + `?v=${Date.now()}`);
  controller = mod.default ?? mod.controller;
}

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (!controller) args.push('--policy', 'idle');

const child = spawn('node', args, { cwd: DIR, stdio: ['pipe', 'pipe', 'pipe'] });
const logFd = fs.openSync(logPath, 'w');

let buf = '';
let outcome = null;
let views = 0;
const table = [];
let lastView = null;

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
      lastView = msg;
      fs.writeSync(logFd, JSON.stringify(msg) + '\n');
      const n = msg.now || {};
      const sc = n.score || {};
      const w = n.works || {};
      const row = {
        v: views,
        t: +(((n.timers || {}).runSeconds ?? (n.timers || {}).simTimeSeconds ?? 0)).toFixed(1),
        wave: n.wave,
        gold: n.gold,
        pan: sc.goldPanned,
        stolen: sc.goldStolen,
        hp: n.hero ? +(n.hero.hp).toFixed(1) : null,
        mx: n.hero ? n.hero.maxHp : null,
        hx: n.hero ? +(n.hero.x ?? 0).toFixed(1) : null,
        hz: n.hero ? +(n.hero.z ?? 0).toFixed(1) : null,
        alive: (n.threats || {}).alive,
        wrk: (n.threats || {}).wreckers,
        thf: (n.threats || {}).thieves,
        stand: w.standing,
        wrecked: w.wrecked,
        kinds: JSON.stringify(w.byKind || {}),
        tiers: (w.entries || []).filter((e) => (e.tier ?? 1) > 1).length,
      };
      table.push(row);
      if (controller) {
        let orders;
        try { orders = controller(msg, { views }); } catch (e) {
          process.stderr.write(`CONTROLLER THREW: ${e.stack}\n`);
          orders = null;
        }
        if (orders === null || orders === undefined) child.stdin.write('\n');
        else child.stdin.write(JSON.stringify(orders) + '\n');
      }
    } else if (msg.secured !== undefined || msg.endReason !== undefined) {
      outcome = msg;
    }
  }
});

let stderrBuf = '';
child.stderr.on('data', (c) => { stderrBuf += c.toString(); });

child.on('close', () => {
  fs.closeSync(logFd);
  fs.writeFileSync(path.join(WS, `${label}-table.json`), JSON.stringify(table, null, 0));
  // ---- envelope, all three axes, measured from the tape that exists ----
  let env = null;
  try {
    const t = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const il = t.inputLog || {};
    const entries = il.entries || [];
    const ticks = entries.map((e) => e.t ?? e.tick).filter((x) => Number.isFinite(x));
    env = {
      durationTicks: il.durationTicks,
      lastEntryTick: ticks.length ? Math.max(...ticks) : null,
      entries: entries.length,
      bytes: fs.statSync(tape).size,
    };
    if (!Number.isFinite(env.durationTicks)) env.durationTicksMISSING = true;
    if (env.lastEntryTick === null) env.lastEntryTickMISSING = true;
  } catch (e) { env = { error: e.message }; }

  const summary = { label, outcome, env, views, tape, stderrTail: stderrBuf.slice(-600) };
  fs.writeFileSync(path.join(WS, `${label}-summary.json`), JSON.stringify(summary, null, 1));

  // ---- intermediate-results law: promote best-so-far into gauntlet-outcome.json ----
  const outPath = path.join(WS, 'gauntlet-outcome.json');
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(outPath, 'utf8')); } catch {}
  const runsSoFar = (prev?.runsSoFar ?? 0) + 1;
  const scored = /^attempt-/.test(label);
  const scoredAttempts = (prev?.scoredAttempts ?? 0) + (scored ? 1 : 0);
  const better = (a, b) => {
    if (!b) return true;
    if ((a?.secured ? 1 : 0) !== (b?.secured ? 1 : 0)) return (a?.secured ? 1 : 0) > (b?.secured ? 1 : 0);
    if ((a?.waves ?? 0) !== (b?.waves ?? 0)) return (a?.waves ?? 0) > (b?.waves ?? 0);
    if ((a?.gold ?? 0) !== (b?.gold ?? 0)) return (a?.gold ?? 0) > (b?.gold ?? 0);
    return (a?.timeMs ?? 0) > (b?.timeMs ?? 0);
  };
  const prevBest = prev?.__best ?? null;
  const takeNew = better(outcome, prevBest);
  const best = takeNew ? outcome : prevBest;
  const bestTape = takeNew ? tape : (prev?.tape ?? tape);
  const bestScored = takeNew ? scored : (prev?.scored ?? false);
  fs.writeFileSync(outPath, JSON.stringify({
    ...(best || {}),
    tape: bestTape,
    scored: bestScored,
    runsSoFar,
    scoredAttempts,
    worldModel: 'sim-import',
    envelope: takeNew ? env : (prev?.envelope ?? env),
    __best: best,
  }, null, 1));

  console.log(JSON.stringify({ label, outcome, env, views }));
  console.log('TABLE(last 14):');
  for (const r of table.slice(-14)) console.log(JSON.stringify(r));
  if (stderrBuf.trim()) console.log('STDERR tail:', stderrBuf.slice(-500));
});
