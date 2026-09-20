// runner.mjs — spawn gr-sim, drive a controller, log every view, write gauntlet-outcome.json on every exit.
// usage: node runner.mjs <label> [controllerPath]
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DIR = '/private/tmp/heat12-038cc280/artifacts/heat12/opus/e4-dust-flats';
const REPO = '/private/tmp/heat12-038cc280';
const CONTRACT = 'e4-dust-flats';
const SEED = 'e4-dust-flats-01';
const WORLD_MODEL = 'sim-import';

const label = process.argv[2] || 'probe-idle';
const ctrlPath = process.argv[3] || null;

const tapePath = path.join(DIR, `${label}-tape.json`);
const viewLog = path.join(DIR, `${label}-views.jsonl`);
try { fs.unlinkSync(viewLog); } catch {}

let controller = null;
if (ctrlPath) controller = (await import(ctrlPath + `?t=${Date.now()}`)).default;

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tapePath];
if (!controller) args.push('--policy=idle');

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });

let buf = '';
let outcome = null;
let viewCount = 0;
const state = {};
let stderrTail = '';

child.stderr.on('data', d => { stderrTail = (stderrTail + d.toString()).slice(-4000); });

child.stdout.on('data', chunk => {
  buf += chunk.toString();
  let idx;
  while ((idx = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, idx).trim();
    buf = buf.slice(idx + 1);
    if (!line) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg.schema === 'goldrush.view.v1') {
      viewCount++;
      fs.appendFileSync(viewLog, JSON.stringify({ i: viewCount, view: msg }) + '\n');
      if (controller) {
        let reply;
        try { reply = controller(msg, state, viewCount); }
        catch (e) { fs.appendFileSync(viewLog, JSON.stringify({ i: viewCount, ctrlError: String(e && e.stack) }) + '\n'); reply = null; }
        if (reply === null || reply === undefined) child.stdin.write('\n');
        else child.stdin.write(JSON.stringify(reply) + '\n');
      }
    } else if (msg.secured !== undefined) {
      outcome = msg;
    }
  }
});

child.on('exit', code => {
  const res = { label, exitCode: code, views: viewCount, outcome, stderrTail: stderrTail.slice(-1200) };
  fs.writeFileSync(path.join(DIR, `${label}-result.json`), JSON.stringify(res, null, 2));

  // envelope measurement
  let env = null;
  try {
    const tape = JSON.parse(fs.readFileSync(tapePath, 'utf8'));
    const entries = tape.inputLog?.entries || [];
    const last = entries.length ? entries[entries.length - 1].tick : null;
    env = {
      durationTicks: tape.inputLog?.durationTicks ?? null,
      lastEntryTick: last,
      entries: entries.length,
      bytes: fs.statSync(tapePath).size,
      eventLogHash: tape.outcome?.eventLogHash ?? tape.eventLogHash ?? null,
    };
  } catch {}
  res.envelope = env;
  fs.writeFileSync(path.join(DIR, `${label}-result.json`), JSON.stringify(res, null, 2));

  // intermediate-results law: best-so-far
  const outPath = path.join(DIR, 'gauntlet-outcome.json');
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(outPath, 'utf8')); } catch {}
  const scored = /^attempt-/.test(label);
  const rank = o => o ? [o.secured ? 1 : 0, o.waves || 0, o.timeMs || 0, o.gold || 0] : [0, 0, 0, 0];
  const better = (a, b) => { const A = rank(a), B = rank(b); for (let i = 0; i < 4; i++) { if (A[i] !== B[i]) return A[i] > B[i]; } return false; };
  const prevOutcome = prev ? { secured: prev.secured, waves: prev.waves, timeMs: prev.timeMs, gold: prev.gold } : null;
  const runsSoFar = (prev?.runsSoFar || 0) + 1;
  const scoredAttempts = (prev?.scoredAttempts || 0) + (scored ? 1 : 0);
  if (!prev || better(outcome, prevOutcome)) {
    fs.writeFileSync(outPath, JSON.stringify({
      ...(outcome || {}), tape: tapePath, scored, runsSoFar, scoredAttempts,
      worldModel: WORLD_MODEL, envelope: env, label,
    }, null, 2));
  } else {
    fs.writeFileSync(outPath, JSON.stringify({ ...prev, runsSoFar, scoredAttempts }, null, 2));
  }
  console.log(JSON.stringify({ label, code, views: viewCount, outcome, env }));
});
