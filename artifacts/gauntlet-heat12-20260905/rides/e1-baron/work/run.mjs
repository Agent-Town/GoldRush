// Runner: spawns gr-sim, drives the controller, logs every view, and satisfies the
// intermediate-results law by writing gauntlet-outcome.json on EVERY child exit.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DIR = '/private/tmp/heat12-038cc280/artifacts/heat12/opus/e1-baron';
const REPO = '/private/tmp/heat12-038cc280';
const OUT = path.join(DIR, 'gauntlet-outcome.json');
const STATE = path.join(DIR, 'runs.json');
const WORLD_MODEL = 'sim-import';

const tapeName = process.argv[2] || 'probe.json';
const scored = process.argv[3] === 'scored';
const tape = path.join(DIR, tapeName);

const { makeController } = await import(path.join(DIR, 'ctrl.mjs') + `?v=${Date.now()}`);
const decide = makeController();

const state = fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, 'utf8')) : { runs: 0, scored: 0, best: null };
state.runs += 1;
if (scored) state.scored += 1;

const child = spawn('node', ['scripts/gr-sim.mjs', '--contract', 'e1-baron', '--seed', 'e1-baron-01', '--tape', tape], { cwd: REPO });

let buf = '';
let outcome = null;
const log = [];
let submits = 0;
let blanks = 0;

child.stdout.on('data', (chunk) => {
  buf += chunk.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i).trim();
    buf = buf.slice(i + 1);
    if (!line) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg.schema === 'goldrush.view.v1') {
      const n = msg.now || {};
      log.push({
        t: +(n.timers?.runSeconds ?? 0).toFixed(1), w: n.wave, g: n.gold,
        pan: n.score?.goldPanned, hp: +(n.hero?.hp ?? 0).toFixed(1), mx: n.hero?.maxHp,
        lv: n.hero?.level, alive: n.threats?.alive, works: n.works?.standing,
        wrecked: n.works?.wrecked, kinds: JSON.stringify(n.works?.byKind || {}),
        ent: JSON.stringify((n.works?.entries || []).map((e) => [e.id, e.index, e.tier])),
      });
      let orders;
      try { orders = decide(msg); } catch (e) { orders = null; log.push({ err: String(e) }); }
      if (orders === null) { blanks += 1; child.stdin.write('\n'); }
      else { submits += 1; child.stdin.write(JSON.stringify(orders) + '\n'); }
    } else if (msg.secured !== undefined) {
      outcome = msg;
    }
  }
});

child.stderr.on('data', (d) => {
  const s = d.toString();
  if (/rejected/i.test(s)) log.push({ rejected: s.slice(0, 300) });
});

child.on('exit', (code) => {
  fs.writeFileSync(path.join(DIR, tapeName.replace(/\.json$/, '') + '-views.json'), JSON.stringify(log, null, 0));

  let env = null;
  try {
    const t = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const bytes = fs.statSync(tape).size;
    const entries = t.inputLog?.entries || [];
    env = {
      durationTicks: t.inputLog?.durationTicks ?? t.durationTicks ?? null,
      lastEntryTick: entries.length ? entries[entries.length - 1].tick : null,
      entries: entries.length, bytes,
    };
  } catch { /* tape may not exist on a crash */ }

  const row = outcome ? { ...outcome } : { secured: false, note: 'no outcome line', exitCode: code };
  const better = !state.best || (row.secured && !state.best.secured)
    || (row.secured === state.best.secured && (row.waves || 0) >= (state.best.waves || 0));
  if (better) state.best = { ...row, tape: `${DIR}/${tapeName}`, scored, envelope: env };
  fs.writeFileSync(STATE, JSON.stringify(state, null, 1));

  fs.writeFileSync(OUT, JSON.stringify({
    ...state.best,
    tape: state.best.tape,
    scored: state.best.scored,
    runsSoFar: state.runs,
    scoredAttempts: state.scored,
    worldModel: WORLD_MODEL,
  }, null, 1));

  const tail = log.slice(-6);
  console.log(JSON.stringify({ outcome: row, envelope: env, submits, blanks, views: log.length }));
  console.log('TAIL', JSON.stringify(tail));
  console.log('EVERY4', JSON.stringify(log.filter((_, i) => i % 4 === 0)));
});
