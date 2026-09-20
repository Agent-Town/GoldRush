// Runner: spawns gr-sim, drives a controller, logs every view, writes gauntlet-outcome.json on exit.
// No shell redirection (blocked in this arena). Intermediate-results law is automatic here.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DIR = '/private/tmp/heat12-038cc280/artifacts/heat12/opus/e8-far-side';
const REPO = '/private/tmp/heat12-038cc280';
const WORLD_MODEL = 'sim-import';

const label = process.argv[2] || 'probe-idle';
const ctrlPath = process.argv[3] || null; // null => --policy idle
const tape = path.join(DIR, `${label}-tape.json`);
const viewLog = path.join(DIR, `${label}-views.jsonl`);

let controller = null;
if (ctrlPath) controller = (await import(ctrlPath)).default;

const args = ['scripts/gr-sim.mjs', '--contract', 'e8-far-side', '--seed', 'e8-far-side-01', '--tape', tape];
if (!ctrlPath) args.push('--policy', 'idle');

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
const vlog = fs.createWriteStream(viewLog);
let buf = '';
let outcome = null;
let views = 0;
const state = {};
let stderrTail = '';

child.stderr.on('data', (d) => { stderrTail = (stderrTail + d.toString()).slice(-4000); });

child.stdout.on('data', (chunk) => {
  buf += chunk.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i);
    buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let obj;
    try { obj = JSON.parse(line); } catch { continue; }
    if (obj && obj.schema && obj.now) {
      views += 1;
      vlog.write(JSON.stringify({ v: views, t: obj.now.timers?.runSeconds, now: obj.now }) + '\n');
      if (controller) {
        let orders;
        try { orders = controller(obj, state, views); } catch (e) { orders = []; console.error('CTRL ERR', e); }
        // null => blank line (gr-sim records no entry: saves ticks + bytes)
        child.stdin.write(orders === null ? '\n' : JSON.stringify(orders) + '\n');
      }
    } else if (obj && typeof obj.secured === 'boolean') {
      outcome = obj;
    }
  }
});

function envelope() {
  try {
    const t = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const il = t.inputLog || {};
    const entries = il.entries || [];
    const last = entries.length ? entries[entries.length - 1].tick : null;
    return {
      durationTicks: il.durationTicks,
      lastEntryTick: last,
      entries: entries.length,
      bytes: fs.statSync(tape).size,
      tapeHash: t.eventLogHash || (t.outcome && t.outcome.eventLogHash) || null,
    };
  } catch { return null; }
}

child.on('exit', (code) => {
  vlog.end();
  const env = envelope();
  const rec = {
    label, code, outcome, envelope: env, views,
    stderrTail: stderrTail.slice(-600),
    notes: state.notes || null,
  };
  fs.writeFileSync(path.join(DIR, `${label}-result.json`), JSON.stringify(rec, null, 2));

  // best-so-far gauntlet-outcome.json
  const outPath = path.join(DIR, 'gauntlet-outcome.json');
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(outPath, 'utf8')); } catch {}
  const runsSoFar = (prev?.runsSoFar || 0) + 1;
  const scored = /^attempt-/.test(label);
  const scoredAttempts = (prev?.scoredAttempts || 0) + (scored ? 1 : 0);
  const better = !prev || (outcome && (
    (outcome.secured === true && prev.secured !== true) ||
    (outcome.secured === prev.secured && (outcome.waves || 0) > (prev.waves || 0))
  ));
  const body = better && outcome
    ? { ...outcome, tape, scored }
    : { ...prev, tape: prev?.tape, scored: prev?.scored };
  fs.writeFileSync(outPath, JSON.stringify({
    ...body, runsSoFar, scoredAttempts, worldModel: WORLD_MODEL,
    envelope: better ? env : prev?.envelope,
  }, null, 2));
  console.log(label, 'code', code, JSON.stringify(outcome), 'env', JSON.stringify(env), 'views', views);
});
