#!/usr/bin/env node
// Runner: spawns gr-sim, drives a controller module, logs every view, writes gauntlet-outcome.json
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WS = '/private/tmp/heat13-569a41f9/artifacts/heat13/opus/e4-gusher-county';
const REPO = '/private/tmp/heat13-569a41f9';
const CONTRACT = 'e4-gusher-county';
const SEED = 'e4-gusher-county-01';
const WORLD_MODEL = 'sim-import';

const label = process.argv[2] || 'probe';
const ctrlPath = process.argv[3] || null;   // controller module path, or 'idle'
const tape = path.join(WS, `${label}-tape.json`);
const viewLog = path.join(WS, `${label}-views.jsonl`);

let controller = null;
if (ctrlPath && ctrlPath !== 'idle') {
  controller = (await import(ctrlPath + `?v=${Date.now()}`)).default;
}

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (ctrlPath === 'idle') args.push('--policy=idle');

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
const vlog = fs.createWriteStream(viewLog);
let buf = '';
let outcome = null;
let views = 0;
const table = [];

child.stdout.on('data', (d) => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i); buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let msg; try { msg = JSON.parse(line); } catch { continue; }
    if (msg.schema === 'goldrush.view.v1') {
      views++;
      vlog.write(JSON.stringify(msg) + '\n');
      if (controller) {
        let out;
        try { out = controller(msg, table); } catch (e) {
          console.error('CTRL ERROR', e.stack); out = '\n';
        }
        if (out === null || out === undefined) out = '\n';
        const payload = typeof out === 'string' ? out : JSON.stringify(out) + '\n';
        // finiteness guard
        if (typeof out !== 'string') {
          const bad = JSON.stringify(out).match(/null|NaN|Infinity/);
          if (bad) console.error('!! NON-FINITE IN ARRAY:', JSON.stringify(out).slice(0, 400));
        }
        child.stdin.write(payload);
      }
    } else if (msg.secured !== undefined || msg.endReason !== undefined) {
      outcome = msg;
    }
  }
});

let stderrTail = '';
child.stderr.on('data', (d) => { stderrTail = (stderrTail + d.toString()).slice(-4000); });

child.on('exit', (code) => {
  vlog.end();
  const res = { label, code, views, outcome, stderrTail: stderrTail.slice(-1500) };
  fs.writeFileSync(path.join(WS, `${label}-summary.json`), JSON.stringify(res, null, 1));
  // envelope
  let env = {};
  try {
    const t = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const entries = t.inputLog?.entries || [];
    const lastTick = entries.length ? Math.max(...entries.map(e => e.t ?? e.tick ?? 0)) : 0;
    env = {
      durationTicks: t.inputLog?.durationTicks,
      lastEntryTick: lastTick,
      entries: entries.length,
      bytes: fs.statSync(tape).size,
    };
  } catch (e) { env = { err: String(e) }; }
  console.log('ENVELOPE', JSON.stringify(env));
  console.log('OUTCOME', JSON.stringify(outcome));
  console.log('TABLE');
  for (const r of table) console.log(r);
  // promote outcome file if better
  promote(outcome, tape, env);
});

function promote(oc, tapePath, env) {
  const f = path.join(WS, 'gauntlet-outcome.json');
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(f, 'utf8')); } catch {}
  const runs = (prev?.runsSoFar || 0) + 1;
  const scored = /^attempt-/.test(label);
  const scoredN = (prev?.scoredAttempts || 0) + (scored ? 1 : 0);
  const better = !prev || !prev.secured
    ? true
    : false;
  const cand = { ...(oc || {}), tape: tapePath, scored, envelope: env };
  let out;
  if (!prev) out = cand;
  else if (prev.secured && !oc?.secured) out = { ...prev };
  else if (!prev.secured && oc?.secured) out = cand;
  else if (prev.secured && oc?.secured) out = scored ? cand : { ...prev };
  else {
    // neither secured: prefer more waves then more time
    const better2 = (oc?.waves || 0) > (prev.waves || 0)
      || ((oc?.waves || 0) === (prev.waves || 0) && (oc?.timeMs || 0) > (prev.timeMs || 0));
    out = better2 ? cand : { ...prev };
  }
  out.runsSoFar = runs;
  out.scoredAttempts = scoredN;
  out.worldModel = WORLD_MODEL;
  fs.writeFileSync(f, JSON.stringify(out, null, 1));
}
