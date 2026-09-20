// hero-move-verb: the Relay Valley runner. Adapted line for line from
// `artifacts/relay-valley-winnable/run.mjs` (same wire, same seed, same contract) so the grit
// baseline is comparable to the kiting arm, writing into this slice's own artifact directory.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const WS = path.join(REPO, 'artifacts/hero-move-verb/relay');
const CONTRACT = 'e7-relay-valley';
const SEED = 'e7-relay-valley-01';

fs.mkdirSync(WS, { recursive: true });

const label = process.argv[2] || 'probe';
const controllerPath = process.argv[3] || null;
const tape = path.join(WS, `${label}-tape.json`);

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (!controllerPath) args.push('--policy', 'idle');

const controller = controllerPath ? (await import(path.resolve(controllerPath))).default : null;
const child = spawn(process.execPath, args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });

let buf = '';
let outcome = null;
let views = 0;
let lastView = null;
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
      views += 1;
      lastView = obj;
      if (controller) {
        let reply;
        try { reply = controller(obj); } catch (e) { console.error('CONTROLLER THREW', e); reply = []; }
        if (reply === null) child.stdin.write('\n');
        else child.stdin.write(JSON.stringify(reply) + '\n');
      }
    } else if (obj.secured !== undefined) {
      outcome = obj;
    }
  }
});

child.on('close', (code) => {
  fs.writeFileSync(path.join(WS, `${label}-stderr.txt`), stderr.slice(-8000));
  const res = {
    label, exit: code, views, outcome,
    heroMaxHp: lastView?.now?.hero?.maxHp ?? null,
    kite: { on: process.env.GR_KITE !== '0', hp: process.env.GR_KITE_HP ?? '0.6', legs: process.env.GR_KITE_LEGS ?? '4' },
  };
  fs.writeFileSync(path.join(WS, `${label}-result.json`), JSON.stringify(res, null, 2));
  console.log(JSON.stringify(res));
});
