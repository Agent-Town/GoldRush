// Runner: spawn gr-sim, drive a controller module, log every view, write outcome on exit.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DIR = '/private/tmp/heat13-569a41f9/artifacts/heat13/opus/e3-blackout-ridge';
const CONTRACT = 'e3-blackout-ridge';
const SEED = 'e3-blackout-ridge-01';

const tag = process.argv[2] || 'tune-1';
const ctrlPath = process.argv[3] || path.join(DIR, 'ctrl.mjs');
const tapePath = path.join(DIR, `${tag}-tape.json`);
const logPath = path.join(DIR, `${tag}-views.jsonl`);

const { makeController } = await import(ctrlPath + `?v=${Date.now()}`);
const ctrl = makeController();

const child = spawn('node', ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tapePath], {
  cwd: '/private/tmp/heat13-569a41f9',
  stdio: ['pipe', 'pipe', 'pipe'],
});

let buf = '';
let outcome = null;
const rows = [];
const logStream = fs.createWriteStream(logPath);
let viewCount = 0;

child.stdout.on('data', (d) => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i);
    buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let j;
    try { j = JSON.parse(line); } catch { continue; }
    if (j.schema) {
      viewCount++;
      logStream.write(JSON.stringify({ v: viewCount, now: j.now, pending: j.now.pendingOffer, ps: j.now.pendingSecure }) + '\n');
      const n = j.now;
      rows.push({
        v: viewCount, t: n.timers && n.timers.runSeconds, w: n.wave, hp: n.hero && n.hero.hp, mx: n.hero && n.hero.maxHp,
        lvl: n.hero && n.hero.level, hx: n.hero && Math.round(n.hero.x * 10) / 10, hz: n.hero && Math.round(n.hero.z * 10) / 10,
        gold: n.gold, pan: n.score && n.score.goldPanned, alive: n.threats && n.threats.alive,
        wk: n.works && n.works.byKind, wr: n.works && n.works.wrecked,
      });
      let orders;
      try { orders = ctrl(j); } catch (e) { console.error('CTRL ERROR', e); orders = null; }
      if (orders === null) child.stdin.write('\n');
      else child.stdin.write(JSON.stringify(orders) + '\n');
    } else {
      outcome = j;
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
    const entries = (tape.inputLog && tape.inputLog.entries) || [];
    const lastTick = entries.length ? Math.max(...entries.map((e) => e.t ?? e.tick ?? 0)) : 0;
    env = {
      durationTicks: tape.inputLog && tape.inputLog.durationTicks,
      entries: entries.length,
      lastEntryTick: lastTick,
      bytes: fs.statSync(tapePath).size,
      tapeHash: tape.eventLogHash || (tape.meta && tape.meta.eventLogHash),
    };
  } catch (e) { env = { err: String(e) }; }

  const summary = { tag, exit: code, outcome, envelope: env, views: viewCount, stderrTail: stderrTail.slice(-600) };
  fs.writeFileSync(path.join(DIR, `${tag}-summary.json`), JSON.stringify(summary, null, 1));

  console.log('=== ' + tag + ' ===');
  console.log('OUTCOME', JSON.stringify(outcome));
  console.log('ENVELOPE', JSON.stringify(env));
  const step = Math.max(1, Math.ceil(rows.length / 40));
  for (let i = 0; i < rows.length; i += step) console.log(JSON.stringify(rows[i]));
  if (rows.length) console.log('LAST', JSON.stringify(rows[rows.length - 1]));

  // intermediate-results law: promote if better than existing
  const outPath = path.join(DIR, 'gauntlet-outcome.json');
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(outPath, 'utf8')); } catch {}
  const better = !prev || (outcome && ((outcome.secured && !prev.secured) ||
    (!!outcome.secured === !!prev.secured && (outcome.waves > (prev.waves || 0) ||
      (outcome.waves === prev.waves && (outcome.gold || 0) > (prev.gold || 0))))));
  const runsSoFar = (prev && prev.runsSoFar ? prev.runsSoFar : 0) + 1;
  const scoredAttempts = (prev && prev.scoredAttempts ? prev.scoredAttempts : 0) + (/^attempt-/.test(tag) ? 1 : 0);
  if (better || !prev) {
    fs.writeFileSync(outPath, JSON.stringify({
      ...outcome, tape: tapePath, scored: /^attempt-/.test(tag), runsSoFar, scoredAttempts,
      worldModel: 'sim-import', envelope: env,
    }, null, 1));
  } else {
    fs.writeFileSync(outPath, JSON.stringify({ ...prev, runsSoFar, scoredAttempts }, null, 1));
  }
});
