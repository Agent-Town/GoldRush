// runner: spawn gr-sim, drive it with a controller, write tape + outcome file after EVERY run.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WS = '/private/tmp/heat11-b118c4d2/artifacts/heat11/opus/e8-eclipse';
const REPO = '/private/tmp/heat11-b118c4d2';
const OUT = path.join(WS, 'gauntlet-outcome.json');
const WORLD_MODEL = 'sim-import';

const tapeName = process.argv[2] || 'probe.json';
const ctrlName = process.argv[3] || 'idle';
const scored = process.argv[4] === 'scored';
const tapePath = path.join(WS, tapeName);

let controller = null;
if (ctrlName !== 'idle') {
  controller = (await import(path.join(WS, ctrlName))).default;
}

const args = ['scripts/gr-sim.mjs', '--contract', 'e8-eclipse', '--seed', 'e8-eclipse-01',
  '--difficulty', 'trail', '--tape', tapePath];
if (ctrlName === 'idle') args.push('--policy', 'idle');

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
let buf = '';
const views = [];
let outcome = null;
let err = '';
child.stderr.on('data', d => { err += d.toString(); });

child.stdout.on('data', d => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i); buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let obj; try { obj = JSON.parse(line); } catch { continue; }
    if (obj.schema && obj.schema.startsWith('goldrush.view')) {
      views.push(obj);
      if (controller) {
        const reply = controller(obj, views);
        if (reply === null) { child.stdin.write('\n'); }
        else child.stdin.write(JSON.stringify(reply) + '\n');
      }
    } else if (obj.secured !== undefined) {
      outcome = obj;
    }
  }
});

child.on('close', code => {
  fs.writeFileSync(path.join(WS, tapeName.replace(/\.json$/, '') + '-views.json'), JSON.stringify(views));
  fs.writeFileSync(path.join(WS, tapeName.replace(/\.json$/, '') + '-stderr.txt'), err.slice(-4000));
  let ticks = null, lastTick = null, entries = null;
  try {
    const t = JSON.parse(fs.readFileSync(tapePath, 'utf8'));
    ticks = t.inputLog?.durationTicks;
    entries = t.inputLog?.entries?.length;
    lastTick = t.inputLog?.entries?.length ? t.inputLog.entries[t.inputLog.entries.length - 1].tick : null;
  } catch {}
  const summary = { rc: code, outcome, tape: tapePath, scored, durationTicks: ticks, lastEntryTick: lastTick, entries, views: views.length };
  console.log(JSON.stringify(summary));
  // intermediate-results law: keep best-so-far on disk
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(OUT, 'utf8')); } catch {}
  const runsSoFar = (prev?.runsSoFar || 0) + 1;
  const scoredAttempts = (prev?.scoredAttempts || 0) + (scored ? 1 : 0);
  const better = (a, b) => {
    if (!b) return true;
    if ((a?.secured ? 1 : 0) !== (b?.secured ? 1 : 0)) return (a?.secured ? 1 : 0) > (b?.secured ? 1 : 0);
    if ((a?.waves || 0) !== (b?.waves || 0)) return (a?.waves || 0) > (b?.waves || 0);
    return (a?.timeMs || 0) >= (b?.timeMs || 0);
  };
  const prevOutcome = prev ? { secured: prev.secured, waves: prev.waves, timeMs: prev.timeMs } : null;
  if (outcome && better(outcome, prevOutcome)) {
    fs.writeFileSync(OUT, JSON.stringify({ ...outcome, tape: tapePath, scored, runsSoFar, scoredAttempts, worldModel: WORLD_MODEL, durationTicks: ticks, lastEntryTick: lastTick }, null, 2));
  } else if (prev) {
    fs.writeFileSync(OUT, JSON.stringify({ ...prev, runsSoFar, scoredAttempts }, null, 2));
  } else {
    fs.writeFileSync(OUT, JSON.stringify({ secured: false, note: 'no outcome line', tape: tapePath, scored, runsSoFar, scoredAttempts, worldModel: WORLD_MODEL }, null, 2));
  }
});
