// Node runner: spawns gr-sim, drives a controller module, logs every view, writes
// gauntlet-outcome.json + envelope axes on every child exit. (Shell redirection is
// refused in this arena; the runner is how the intermediate-results law gets satisfied.)
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DIR = '/private/tmp/heat13-569a41f9/artifacts/heat13/opus/e8-low-orbit';
const REPO = '/private/tmp/heat13-569a41f9';
const CONTRACT = 'e8-low-orbit';
const SEED = 'e8-low-orbit-01';

const label = process.argv[2] || 'probe';
const ctrlPath = process.argv[3] || null;
const tape = path.join(DIR, `${label}-tape.json`);
const viewLog = path.join(DIR, `${label}-views.jsonl`);

const controller = ctrlPath ? (await import(ctrlPath)).default : null;

fs.writeFileSync(viewLog, '');
const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (!controller) args.push('--policy', 'idle');

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
let buf = '';
let stderr = '';
let outcome = null;
const rows = [];
let viewCount = 0;

child.stderr.on('data', (d) => { stderr += d.toString(); });

child.stdout.on('data', (chunk) => {
  buf += chunk.toString();
  let idx;
  while ((idx = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, idx);
    buf = buf.slice(idx + 1);
    if (!line.trim()) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg.schema === 'goldrush.view.v1') {
      viewCount += 1;
      fs.appendFileSync(viewLog, JSON.stringify(msg) + '\n');
      if (controller) {
        let reply;
        try { reply = controller(msg, rows); } catch (e) {
          fs.appendFileSync(viewLog, JSON.stringify({ controllerError: String(e && e.stack || e) }) + '\n');
          reply = null;
        }
        if (reply === null || reply === undefined) child.stdin.write('\n');
        else child.stdin.write(JSON.stringify(reply) + '\n');
      }
    } else {
      outcome = msg;
    }
  }
});

child.on('close', (code) => {
  const result = { label, code, viewCount, outcome, stderrTail: stderr.slice(-1500) };
  // envelope axes
  let env = {};
  try {
    const t = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const entries = t.inputLog?.entries ?? [];
    const ticks = t.inputLog?.durationTicks ?? null;
    const last = entries.length ? entries[entries.length - 1] : null;
    env = {
      durationTicks: ticks,
      entries: entries.length,
      lastEntryTick: last ? (last.t ?? last.tick ?? null) : null,
      bytes: fs.statSync(tape).size,
    };
  } catch (e) { env = { error: String(e) }; }
  result.envelope = env;
  fs.writeFileSync(path.join(DIR, `${label}-result.json`), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
  if (rows.length) fs.writeFileSync(path.join(DIR, `${label}-table.json`), JSON.stringify(rows, null, 1));

  // intermediate-results law: best-so-far outcome file
  const outPath = path.join(DIR, 'gauntlet-outcome.json');
  let best = null;
  try { best = JSON.parse(fs.readFileSync(outPath, 'utf8')); } catch { best = null; }
  const runsSoFar = (best?.runsSoFar ?? 0) + 1;
  const scoredAttempts = (best?.scoredAttempts ?? 0) + (label.startsWith('attempt') ? 1 : 0);
  const better = (a, b) => {
    if (!b) return true;
    if ((a?.secured ?? false) !== (b?.secured ?? false)) return a?.secured ? true : false;
    if ((a?.waves ?? 0) !== (b?.waves ?? 0)) return (a?.waves ?? 0) > (b?.waves ?? 0);
    return (a?.timeMs ?? 0) > (b?.timeMs ?? 0);
  };
  const prevOutcome = best?._outcome ?? null;
  const useNew = better(outcome, prevOutcome);
  const row = useNew
    ? { ...outcome, tape, scored: label.startsWith('attempt'), _outcome: outcome, envelope: env }
    : { ...best };
  row.runsSoFar = runsSoFar;
  row.scoredAttempts = scoredAttempts;
  row.worldModel = 'sim-import';
  fs.writeFileSync(outPath, JSON.stringify(row, null, 2));
});
