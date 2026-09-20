// Runner: spawns gr-sim, drives a controller module, logs every view, writes
// gauntlet-outcome.json on every child exit (intermediate-results law).
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DIR = '/tmp/heat12-038cc280/artifacts/heat12/opus/e9-dome-basin';
const REPO = '/private/tmp/heat12-038cc280';
const CONTRACT = 'e9-dome-basin';
const SEED = 'e9-dome-basin-01';
const WORLD_MODEL = 'sim-import';

const args = process.argv.slice(2);
const label = args[0];                 // e.g. probe-idle, tune-1, attempt-1
const ctrlPath = args[1] || null;      // controller module or null => --policy idle
const scored = args.includes('--scored');

const tape = path.join(DIR, `${label}-tape.json`);
const viewLog = path.join(DIR, `${label}-views.jsonl`);
fs.writeFileSync(viewLog, '');

const simArgs = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (!ctrlPath) simArgs.push('--policy=idle');

const child = spawn('node', simArgs, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });

let ctrl = null;
if (ctrlPath) ctrl = await import(ctrlPath);

let buf = '';
let lastOutcome = null;
let views = 0;
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
      views++;
      fs.appendFileSync(viewLog, line + '\n');
      const n = msg.now;
      rows.push({
        t: +(n.timers?.runSeconds ?? 0).toFixed(1), w: n.wave,
        hp: +(n.hero?.hp ?? 0).toFixed(1), mx: n.hero?.maxHp, lv: n.hero?.level,
        g: n.gold, pan: n.score?.goldPanned, st: n.score?.goldStolen,
        alive: n.threats?.alive, wr: n.threats?.wreckers, th: n.threats?.thieves,
        works: n.works?.standing, wrk: n.works?.wrecked,
      });
      if (ctrl) {
        let out;
        try { out = ctrl.decide(msg, views); } catch (e) { out = null; console.error('CTRL ERR', e.message); }
        // out === null  => blank line (free: gr-sim records no entry)
        child.stdin.write(out === null || out === undefined ? '\n' : JSON.stringify(out) + '\n');
      }
    } else if (msg.secured !== undefined || msg.endReason !== undefined) {
      lastOutcome = msg;
    }
  }
});

let stderrTail = '';
child.stderr.on('data', (d) => { stderrTail = (stderrTail + d.toString()).slice(-4000); });

child.on('exit', (code) => {
  fs.writeFileSync(path.join(DIR, `${label}-rows.json`), JSON.stringify(rows, null, 0));
  let env = { ticks: null, entries: null, bytes: null };
  try {
    const raw = fs.readFileSync(tape, 'utf8');
    const t = JSON.parse(raw);
    const ent = t.inputLog?.entries ?? [];
    env = {
      ticks: t.inputLog?.durationTicks ?? null,
      lastEntryTick: ent.length ? ent[ent.length - 1].tick : null,
      entries: ent.length,
      bytes: Buffer.byteLength(raw),
      capTicks: 18002, capEntries: 3601, capBytes: 576176,
    };
  } catch {}
  const rec = {
    ...(lastOutcome || { secured: false, note: 'no outcome line', stderrTail: stderrTail.slice(-600) }),
    tape, scored, label, envelope: env, views, worldModel: WORLD_MODEL, exitCode: code,
  };
  fs.writeFileSync(path.join(DIR, `${label}-outcome.json`), JSON.stringify(rec, null, 1));
  console.log(JSON.stringify({ label, secured: rec.secured, waves: rec.waves, timeMs: rec.timeMs,
    gold: rec.gold, kills: rec.kills, calls: rec.calls, endReason: rec.endReason,
    hash: rec.eventLogHash, env, views }));
  // merge into gauntlet-outcome.json (best-so-far, but respect explicit scored promotion)
  const gpath = path.join(DIR, 'gauntlet-outcome.json');
  let best = null;
  try { best = JSON.parse(fs.readFileSync(gpath, 'utf8')); } catch {}
  const rank = (r) => [r.secured ? 1 : 0, r.waves || 0, (r.timeMs || 0) / 1000, r.gold || 0];
  const better = !best || rank(rec).join(',') > rank(best).join(',') ||
    (JSON.stringify(rank(rec)) === JSON.stringify(rank(best)) && scored);
  if (better) {
    const runsSoFar = (best?.runsSoFar || 0) + 1;
    const scoredAttempts = (best?.scoredAttempts || 0) + (scored ? 1 : 0);
    fs.writeFileSync(gpath, JSON.stringify({
      ...rec, runsSoFar, scoredAttempts, worldModel: WORLD_MODEL,
    }, null, 1));
  } else if (best) {
    best.runsSoFar = (best.runsSoFar || 0) + 1;
    best.scoredAttempts = (best.scoredAttempts || 0) + (scored ? 1 : 0);
    fs.writeFileSync(gpath, JSON.stringify(best, null, 1));
  }
});
