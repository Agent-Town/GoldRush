// Runner: spawns gr-sim, drives it with a controller module, writes tape + outcome + view log.
// Adapted from artifacts/gauntlet-heat12-20260905/rides/e7-relay-valley.attempt-1/work/run.mjs
// (same wire, same seed, same contract) so the baseline is comparable line for line.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const WS = path.join(REPO, 'artifacts/relay-valley-winnable/work');
const CONTRACT = 'e7-relay-valley';
const SEED = 'e7-relay-valley-01';

fs.mkdirSync(WS, { recursive: true });

const label = process.argv[2] || 'probe';
const controllerPath = process.argv[3] || null;
const tape = path.join(WS, `${label}-tape.json`);
const viewLog = path.join(WS, `${label}-views.jsonl`);

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (!controllerPath) args.push('--policy', 'idle');

const controller = controllerPath ? (await import(path.resolve(controllerPath))).default : null;

const child = spawn(process.execPath, args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });

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
});
