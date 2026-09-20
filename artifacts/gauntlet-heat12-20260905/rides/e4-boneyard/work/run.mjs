// Runner: spawns gr-sim, drives a controller module, logs every view, writes gauntlet-outcome.json.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DIR = '/tmp/heat12-038cc280/artifacts/heat12/opus/e4-boneyard';
const REPO = '/tmp/heat12-038cc280';
const WORLD_MODEL = 'sim-import';

const args = process.argv.slice(2);
const label = args[0];                 // e.g. probe-idle, tune-1, attempt-1
const ctrlPath = args[1] || null;      // controller module path (null => --policy idle)
const scored = args.includes('--scored');

const tape = path.join(DIR, `${label}-tape.json`);
const viewLog = path.join(DIR, `${label}-views.jsonl`);
fs.writeFileSync(viewLog, '');

const simArgs = ['scripts/gr-sim.mjs', '--contract', 'e4-boneyard', '--seed', 'e4-boneyard-01', '--tape', tape];
if (!ctrlPath) simArgs.push('--policy', 'idle');

const ctrl = ctrlPath ? (await import(ctrlPath)).default : null;

const child = spawn('node', simArgs, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
let buf = '';
let outcome = null;
let views = 0;
const errChunks = [];
child.stderr.on('data', d => errChunks.push(d.toString()));

child.stdout.on('data', d => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i); buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let obj;
    try { obj = JSON.parse(line); } catch { continue; }
    if (obj.schema === 'goldrush.view.v1') {
      views++;
      fs.appendFileSync(viewLog, JSON.stringify({ n: views, now: obj.now, sp: views === 1 ? obj.stablePrefix : undefined, almanac: views === 1 ? obj.almanac : undefined, appendTail: (obj.appendLog || []).slice(-1) }) + '\n');
      if (ctrl) {
        let out;
        try { out = ctrl(obj, views); } catch (e) { out = { blank: true, err: String(e) }; }
        if (out && out.blank) child.stdin.write('\n');
        else child.stdin.write(JSON.stringify(out) + '\n');
      }
    } else if (obj.secured !== undefined || obj.endReason !== undefined) {
      outcome = obj;
    }
  }
});

child.on('close', code => {
  const res = { label, code, views, outcome, stderrTail: errChunks.join('').slice(-1200) };
  fs.writeFileSync(path.join(DIR, `${label}-result.json`), JSON.stringify(res, null, 2));
  // envelope
  let env = null;
  try {
    const t = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const entries = t.inputLog?.entries || [];
    env = {
      durationTicks: t.inputLog?.durationTicks,
      lastEntryTick: entries.length ? entries[entries.length - 1].tick : null,
      entries: entries.length,
      bytes: fs.statSync(tape).size,
    };
  } catch {}
  res.envelope = env;
  fs.writeFileSync(path.join(DIR, `${label}-result.json`), JSON.stringify(res, null, 2));

  // intermediate-results law: best-so-far
  const outPath = path.join(DIR, 'gauntlet-outcome.json');
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(outPath, 'utf8')); } catch {}
  const runsSoFar = (prev?.runsSoFar || 0) + 1;
  const scoredAttempts = (prev?.scoredAttempts || 0) + (scored ? 1 : 0);
  const better = !prev || (outcome && outcome.secured && !prev.secured)
    || (outcome && (!!outcome.secured === !!prev.secured) && (outcome.waves || 0) > (prev.waves || 0));
  const row = better && outcome
    ? { ...outcome, tape, scored, runsSoFar, scoredAttempts, worldModel: WORLD_MODEL, envelope: env }
    : { ...prev, runsSoFar, scoredAttempts, worldModel: WORLD_MODEL };
  fs.writeFileSync(outPath, JSON.stringify(row, null, 2));
  console.log(JSON.stringify({ label, code, views, outcome, envelope: env, stderrTail: res.stderrTail.slice(-400) }, null, 2));
});
