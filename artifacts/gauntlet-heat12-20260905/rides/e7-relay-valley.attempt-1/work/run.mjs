// Runner: spawns gr-sim, drives it with a controller module, writes tape + outcome + view log.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WS = '/private/tmp/heat12-038cc280/artifacts/heat12/opus/e7-relay-valley';
const CONTRACT = 'e7-relay-valley';
const SEED = 'e7-relay-valley-01';

const label = process.argv[2] || 'probe';
const controllerPath = process.argv[3] || null;
const tape = path.join(WS, `${label}-tape.json`);
const viewLog = path.join(WS, `${label}-views.jsonl`);

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (!controllerPath) args.push('--policy', 'idle');

const controller = controllerPath ? (await import(controllerPath)).default : null;

const child = spawn('node', args, { cwd: '/private/tmp/heat12-038cc280', stdio: ['pipe', 'pipe', 'pipe'] });

let buf = '';
let outcome = null;
const views = [];
let stderr = '';
child.stderr.on('data', (d) => { stderr += d.toString(); });

child.stdout.on('data', (d) => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i); buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let obj;
    try { obj = JSON.parse(line); } catch { continue; }
    if (obj.schema === 'goldrush.view.v1') {
      views.push(obj);
      if (controller) {
        let reply;
        try { reply = controller(obj, views); } catch (e) { console.error('CONTROLLER THREW', e); reply = []; }
        if (reply === null) child.stdin.write('\n');
        else child.stdin.write(JSON.stringify(reply) + '\n');
      }
    } else if (obj.secured !== undefined) {
      outcome = obj;
    }
  }
});

child.on('close', (code) => {
  fs.writeFileSync(viewLog, views.map((v) => JSON.stringify(v)).join('\n'));
  fs.writeFileSync(path.join(WS, `${label}-stderr.txt`), stderr.slice(-20000));
  const res = { label, exit: code, outcome, views: views.length };
  // tape envelope check
  let env = null;
  try {
    const t = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const entries = t.inputLog?.entries ?? [];
    env = {
      durationTicks: t.inputLog?.durationTicks,
      lastEntryTick: entries.length ? entries[entries.length - 1].t : null,
      entryCount: entries.length,
      bytes: fs.statSync(tape).size,
    };
  } catch { /* no tape */ }
  res.envelope = env;
  fs.writeFileSync(path.join(WS, `${label}-result.json`), JSON.stringify(res, null, 2));
  console.log(JSON.stringify(res));

  // intermediate-results law: maintain best-so-far outcome file
  const outPath = path.join(WS, 'gauntlet-outcome.json');
  let best = null;
  try { best = JSON.parse(fs.readFileSync(outPath, 'utf8')); } catch { }
  const runsSoFar = (best?.runsSoFar ?? 0) + 1;
  const scored = /^attempt-/.test(label);
  const scoredAttempts = (best?.scoredAttempts ?? 0) + (scored ? 1 : 0);
  const better = (a, b) => {
    if (!b) return true;
    if ((a?.secured ? 1 : 0) !== (b.secured ? 1 : 0)) return (a?.secured ? 1 : 0) > (b.secured ? 1 : 0);
    if ((a?.waves ?? 0) !== (b.waves ?? 0)) return (a?.waves ?? 0) > (b.waves ?? 0);
    return (a?.gold ?? 0) >= (b.gold ?? 0);
  };
  const prevOutcome = best ? { secured: best.secured, waves: best.waves, gold: best.gold } : null;
  if (outcome && better(outcome, prevOutcome)) {
    fs.writeFileSync(outPath, JSON.stringify({
      ...outcome,
      tape,
      scored,
      runsSoFar,
      scoredAttempts,
      worldModel: 'sim-import',
      envelope: env,
    }, null, 2));
  } else if (best) {
    fs.writeFileSync(outPath, JSON.stringify({ ...best, runsSoFar, scoredAttempts }, null, 2));
  }
});
