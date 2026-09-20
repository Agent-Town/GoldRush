// Heat 12 runner — spawns gr-sim, drives a controller module, logs every view,
// writes gauntlet-outcome.json on every child exit, prints the three envelope axes.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DIR = '/private/tmp/heat12-038cc280/artifacts/heat12/opus/e4-long-road';
const REPO = '/private/tmp/heat12-038cc280';
const CONTRACT = 'e4-long-road';
const SEED = 'e4-long-road-01';
const WORLD_MODEL = 'sim-import';

const label = process.argv[2] || 'probe';
const ctrlPath = process.argv[3] || null; // null => idle
const tape = path.join(DIR, `${label}-tape.json`);
const viewLog = path.join(DIR, `${label}-views.jsonl`);

let controller = null;
if (ctrlPath) controller = (await import(ctrlPath)).default;

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (!controller) args.push('--policy=idle');

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
const vlog = fs.createWriteStream(viewLog);
let buf = '';
let lastOutcome = null;
let views = 0;
const state = {};
let stderrTail = '';

child.stderr.on('data', d => { stderrTail = (stderrTail + d.toString()).slice(-4000); });

child.stdout.on('data', d => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i); buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let msg; try { msg = JSON.parse(line); } catch { continue; }
    if (msg.schema === 'goldrush.view.v1') {
      views++;
      const now = msg.now || {};
      vlog.write(JSON.stringify({ v: views, t: now.timers?.runSeconds, wave: now.wave, gold: now.gold,
        panned: now.score?.goldPanned, hp: now.hero?.hp, maxHp: now.hero?.maxHp, alive: now.threats?.alive,
        works: now.works?.byKind, wrecked: now.works?.wrecked,
        motor: now.motor ? { obj: now.motor.objective, fuel: { stored: now.motor.fuel?.stored, tar: now.motor.fuel?.tar, drawn: now.motor.fuel?.drawn, nodes: now.motor.fuel?.nodes?.map(n => ({ x: n.x, z: n.z, h: n.harvested, p: n.progress })) },
          veh: now.motor.vehicle, convoy: now.motor.convoy ? { d: now.motor.convoy.leaderDistance, total: now.motor.convoy.total } : null,
          roads: now.motor.roads?.corridors?.map(c => ({ id: c.id, g: c.graded })), weather: now.motor.weather?.phase } : null,
        pros: now.prospector, pendingOffer: now.pendingOffer?.map(o => o.id), pendingSecure: !!now.pendingSecure,
        orderFails: (now.orders || []).filter(o => o.status === 'failed').map(o => (o.order?.verb || '?') + ':' + (o.reason || '')).slice(0, 6),
      }) + '\n');
      if (controller) {
        const out = controller(msg, state, views);
        child.stdin.write(out === null ? '\n' : JSON.stringify(out) + '\n');
      }
    } else if (msg.secured !== undefined) {
      lastOutcome = msg;
    }
  }
});

child.on('close', () => {
  vlog.end();
  let env = {};
  try {
    const t = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const entries = t.inputLog?.entries || [];
    env = { durationTicks: t.inputLog?.durationTicks, lastEntryTick: entries.length ? entries[entries.length - 1].tick : null,
      entries: entries.length, bytes: fs.statSync(tape).size };
  } catch (e) { env = { err: e.message }; }
  const res = { label, outcome: lastOutcome, envelope: env, views, stderrTail: stderrTail.slice(-600) };
  fs.writeFileSync(path.join(DIR, `${label}-result.json`), JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res));

  // intermediate-results law: best-so-far
  const outPath = path.join(DIR, 'gauntlet-outcome.json');
  let best = null;
  try { best = JSON.parse(fs.readFileSync(outPath, 'utf8')); } catch { }
  const runsSoFar = (best?.runsSoFar || 0) + 1;
  const scored = /^attempt-/.test(label);
  const scoredAttempts = (best?.scoredAttempts || 0) + (scored ? 1 : 0);
  const rank = o => o ? [o.secured ? 1 : 0, o.waves || 0, o.gold || 0] : [0, 0, 0];
  const a = rank(lastOutcome), b = rank(best?.__outcome);
  const better = !best?.__outcome || a[0] > b[0] || (a[0] === b[0] && (a[1] > b[1] || (a[1] === b[1] && a[2] >= b[2])));
  const row = better
    ? { ...lastOutcome, __outcome: lastOutcome, tape, scored, worldModel: WORLD_MODEL, envelope: env }
    : { ...best };
  row.runsSoFar = runsSoFar; row.scoredAttempts = scoredAttempts; row.worldModel = WORLD_MODEL;
  fs.writeFileSync(outPath, JSON.stringify(row, null, 1));
});
