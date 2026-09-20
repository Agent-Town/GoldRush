// Node runner: spawns gr-sim, drives the controller, logs every view, and writes
// gauntlet-outcome.json + all three envelope axes on EVERY child exit (the
// intermediate-results law, made automatic). This arena refuses shell redirection.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createController } from './controller.mjs';

const DIR = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa';
const OUT = path.join(DIR, 'artifacts/heat14/opus/e7-relay-rush');
const CONTRACT = 'e7-relay-rush', SEED = 'e7-relay-rush-01';
const WORLD_MODEL = 'sim-import';

const label = process.argv[2] ?? 'probe';
const idle = process.argv.includes('--idle');
const tape = path.join(OUT, `${label}-tape.json`);
const viewLog = path.join(OUT, `${label}-views.jsonl`);

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (idle) args.push('--policy=idle');

const child = spawn('node', args, { cwd: DIR, stdio: ['pipe', 'pipe', 'pipe'] });
const rows = [];
const decide = idle ? null : createController((r) => { rows.push(r); console.log(JSON.stringify(r)); });
let buf = '', outcome = null, views = 0, submits = 0, blanks = 0;
const vlog = fs.createWriteStream(viewLog);

child.stdout.on('data', (chunk) => {
  buf += chunk.toString();
  let nl;
  while ((nl = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, nl); buf = buf.slice(nl + 1);
    if (!line.trim()) continue;
    let msg; try { msg = JSON.parse(line); } catch { continue; }
    if (msg.schema === 'goldrush.view.v1') {
      views += 1; vlog.write(line + '\n');
      if (!decide) continue;
      let orders = null;
      try { orders = decide(msg); } catch (e) { console.error('controller threw:', e); orders = []; }
      if (orders === null) { blanks += 1; child.stdin.write('\n'); }
      else { submits += 1; child.stdin.write(JSON.stringify(orders) + '\n'); }
    } else if (msg.secured !== undefined || msg.endReason !== undefined) {
      outcome = msg;
    }
  }
});
child.stderr.on('data', (d) => { const s = d.toString(); if (/rejected/i.test(s)) console.error('STDERR', s.trim().slice(0, 400)); });

child.on('exit', (code) => {
  vlog.end();
  const env = {};
  try {
    const tp = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const entries = tp.inputLog?.entries ?? [];
    const last = entries.length ? entries[entries.length - 1] : null;
    env.durationTicks = tp.inputLog?.durationTicks ?? null;
    env.lastEntryTick = last ? (last.t ?? last.tick ?? null) : null;
    env.entries = entries.length;
    env.bytes = fs.statSync(tape).size;
    env.tapeHash = tp.eventLogHash ?? tp.meta?.eventLogHash ?? null;
  } catch (e) { env.error = String(e.message ?? e); }

  const summary = {
    label, exitCode: code, outcome, envelope: env,
    views, submits, blanks, worldModel: WORLD_MODEL, tape,
  };
  fs.writeFileSync(path.join(OUT, `${label}-summary.json`), JSON.stringify(summary, null, 2));
  fs.writeFileSync(path.join(OUT, `${label}-table.json`), JSON.stringify(rows, null, 1));

  // best-so-far promotion into gauntlet-outcome.json
  const gp = path.join(OUT, 'gauntlet-outcome.json');
  let prev = null; try { prev = JSON.parse(fs.readFileSync(gp, 'utf8')); } catch {}
  const runsSoFar = (prev?.runsSoFar ?? 0) + 1;
  const scoredAttempts = (prev?.scoredAttempts ?? 0) + (label.startsWith('attempt') ? 1 : 0);
  const better = !prev || (outcome?.secured && !prev.secured)
    || (!!outcome?.secured === !!prev.secured && (outcome?.waves ?? -1) > (prev.waves ?? -1))
    || (!!outcome?.secured === !!prev.secured && (outcome?.waves ?? -1) === (prev.waves ?? -1)
        && (outcome?.gold ?? -1) >= (prev.gold ?? -1));
  const row = better && outcome
    ? { ...outcome, tape, scored: label.startsWith('attempt'), envelope: env }
    : { ...prev };
  row.runsSoFar = runsSoFar; row.scoredAttempts = scoredAttempts; row.worldModel = WORLD_MODEL;
  fs.writeFileSync(gp, JSON.stringify(row, null, 2));
  console.log('=== OUTCOME ===', JSON.stringify(outcome));
  console.log('=== ENVELOPE ===', JSON.stringify(env));
});
