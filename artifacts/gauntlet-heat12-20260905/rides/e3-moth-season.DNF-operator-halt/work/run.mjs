// Runner: spawns gr-sim, drives it with a controller module, logs everything,
// and (over)writes gauntlet-outcome.json with the best outcome so far.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DIR = '/private/tmp/heat12-038cc280/artifacts/heat12/opus/e3-moth-season';
const REPO = '/private/tmp/heat12-038cc280';
const CONTRACT = 'e3-moth-season';
const SEED = 'e3-moth-season-01';
const WORLD_MODEL = 'sim-import';

const label = process.argv[2];            // e.g. "probe-idle", "tune-1", "attempt-1"
const controllerPath = process.argv[3];   // module exporting decide(view, state) -> array|null ; or "idle"
const scored = process.argv[4] === 'scored';

const tapePath = path.join(DIR, `${label}-tape.json`);
const logPath = path.join(DIR, `${label}.viewlog.jsonl`);
const outPath = path.join(DIR, 'gauntlet-outcome.json');
const statePath = path.join(DIR, 'runs.json');

let controller = null;
if (controllerPath && controllerPath !== 'idle') {
  controller = await import(controllerPath + `?v=${Date.now()}`);
}

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tapePath];
if (!controller) args.push('--policy', 'idle');

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });

const logStream = fs.createWriteStream(logPath);
let stderr = '';
child.stderr.on('data', d => { stderr += d.toString(); });

let buf = '';
let lastLine = null;
const cstate = { views: 0 };
child.stdout.on('data', chunk => {
  buf += chunk.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i);
    buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    lastLine = line;
    logStream.write(line + '\n');
    let v;
    try { v = JSON.parse(line); } catch { continue; }
    if (v.schema === 'goldrush.view.v1') {
      cstate.views++;
      if (controller) {
        let orders;
        try { orders = controller.decide(v, cstate); }
        catch (e) { orders = null; fs.appendFileSync(path.join(DIR, `${label}.err.txt`), String(e.stack) + '\n'); }
        if (orders === null || orders === undefined) child.stdin.write('\n');
        else child.stdin.write(JSON.stringify(orders) + '\n');
      }
    }
  }
});

child.on('exit', (code) => {
  logStream.end();
  fs.writeFileSync(path.join(DIR, `${label}.stderr.txt`), stderr.slice(-20000));
  let outcome = null;
  try { outcome = JSON.parse(lastLine); } catch {}
  if (outcome && outcome.schema === 'goldrush.view.v1') outcome = null;

  // envelope measurement
  let env = {};
  try {
    const t = JSON.parse(fs.readFileSync(tapePath, 'utf8'));
    const entries = t.inputLog?.entries || [];
    env = {
      durationTicks: t.inputLog?.durationTicks,
      entryCount: entries.length,
      lastEntryTick: entries.length ? entries[entries.length - 1].tick : null,
      bytes: fs.statSync(tapePath).size,
      eventLogHash: t.outcome?.eventLogHash ?? t.eventLogHash,
    };
  } catch {}

  const runs = fs.existsSync(statePath) ? JSON.parse(fs.readFileSync(statePath, 'utf8')) : { runs: [], scoredAttempts: 0 };
  runs.runs.push({ label, scored, outcome, env, code, views: cstate.views });
  if (scored) runs.scoredAttempts++;
  fs.writeFileSync(statePath, JSON.stringify(runs, null, 1));

  // best-so-far: secured wins; then waves; then gold
  const rank = r => {
    const o = r.outcome || {};
    return [o.secured ? 1 : 0, o.waves || 0, o.gold || 0];
  };
  let best = runs.runs[0];
  for (const r of runs.runs) {
    const a = rank(r), b = rank(best);
    if (a[0] > b[0] || (a[0] === b[0] && (a[1] > b[1] || (a[1] === b[1] && a[2] > b[2])))) best = r;
  }
  const bestOut = { ...(best.outcome || {}) };
  fs.writeFileSync(outPath, JSON.stringify({
    ...bestOut,
    tape: path.join(DIR, `${best.label}-tape.json`),
    scored: !!best.scored,
    runsSoFar: runs.runs.length,
    scoredAttempts: runs.scoredAttempts,
    worldModel: WORLD_MODEL,
    envelope: best.env,
  }, null, 1) + '\n');

  console.log(JSON.stringify({ label, code, views: cstate.views, outcome, env }));
});
