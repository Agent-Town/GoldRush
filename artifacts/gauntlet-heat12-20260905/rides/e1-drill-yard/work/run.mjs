#!/usr/bin/env node
// Heat 12 / generation 41 runner for e1-drill-yard.
// Owns the gr-sim child, feeds it a controller, captures every view, and
// (over)writes gauntlet-outcome.json on EVERY exit -- the intermediate-results law.
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

const REPO = '/private/tmp/heat12-038cc280';
const W = join(REPO, 'artifacts/heat12/opus/e1-drill-yard');
const CONTRACT = 'e1-drill-yard';
const SEED = 'gold-rush';
const WORLD_MODEL = 'sim-import';

const label = process.argv[2] || 'probe';
const controllerPath = process.argv[3] || null; // null => --policy=idle
const scored = process.argv[4] === 'scored';

const tape = join(W, `${label}-tape.json`);
const viewLog = join(W, `${label}-views.jsonl`);

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
let controller = null;
if (controllerPath) {
  controller = (await import(resolve(controllerPath))).default;
} else {
  args.push('--policy=idle');
}

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });

let stdoutBuf = '';
let stderrBuf = '';
const views = [];
let outcome = null;
const t0 = Date.now();

child.stderr.on('data', (d) => { stderrBuf += d.toString(); });

child.stdout.on('data', (d) => {
  stdoutBuf += d.toString();
  let nl;
  while ((nl = stdoutBuf.indexOf('\n')) >= 0) {
    const line = stdoutBuf.slice(0, nl).trim();
    stdoutBuf = stdoutBuf.slice(nl + 1);
    if (!line) continue;
    let obj;
    try { obj = JSON.parse(line); } catch { continue; }
    if (obj.schema === 'goldrush.view.v1') {
      views.push(obj);
      if (controller) {
        let orders;
        try { orders = controller(obj, views); } catch (e) {
          console.error('CONTROLLER THREW:', e.stack);
          orders = [];
        }
        // A null/undefined return means "blank line" -- free, records no entry.
        if (orders === null || orders === undefined) child.stdin.write('\n');
        else child.stdin.write(JSON.stringify(orders) + '\n');
      }
    } else if (obj.secured !== undefined) {
      outcome = obj;
    }
  }
});

child.on('close', (code) => {
  const wallS = ((Date.now() - t0) / 1000).toFixed(1);
  writeFileSync(viewLog, views.map((v) => JSON.stringify(v)).join('\n'));
  writeFileSync(join(W, `${label}.stderr.txt`), stderrBuf.slice(-20000));

  // ---- tape envelope measurement (ticks / entries / bytes), gen 26/30/35 lesson
  let env = null;
  if (existsSync(tape)) {
    const raw = readFileSync(tape);
    const t = JSON.parse(raw.toString());
    const entries = t.inputLog?.entries ?? [];
    const lastTick = entries.length ? entries[entries.length - 1].tick : null;
    env = {
      durationTicks: t.inputLog?.durationTicks ?? null,
      lastEntryTick: lastTick,
      entryCount: entries.length,
      bytes: raw.length,
    };
  }

  const rec = {
    label, scored, code, wallS, views: views.length,
    outcome, envelope: env,
    stderrTail: stderrBuf.slice(-1200),
  };
  writeFileSync(join(W, `${label}-run.json`), JSON.stringify(rec, null, 2));

  // ---- intermediate-results law: keep gauntlet-outcome.json current
  const statePath = join(W, 'runner-state.json');
  const state = existsSync(statePath)
    ? JSON.parse(readFileSync(statePath, 'utf8'))
    : { runsSoFar: 0, scoredAttempts: 0, best: null };
  state.runsSoFar += 1;
  if (scored) state.scoredAttempts += 1;

  const scoreOf = (o) => o ? [o.secured ? 1 : 0, o.waves ?? 0, o.gold ?? 0, o.timeMs ?? 0] : [0, 0, 0, 0];
  const better = (a, b) => {
    const A = scoreOf(a), B = scoreOf(b);
    for (let i = 0; i < A.length; i++) { if (A[i] !== B[i]) return A[i] > B[i]; }
    return false;
  };
  if (outcome && (!state.best || better(outcome, state.best.outcome))) {
    state.best = { outcome, tape, scored, label, envelope: env };
  }
  writeFileSync(statePath, JSON.stringify(state, null, 2));

  const b = state.best;
  writeFileSync(join(W, 'gauntlet-outcome.json'), JSON.stringify({
    ...(b ? b.outcome : {}),
    tape: b ? b.tape : null,
    scored: b ? b.scored : false,
    runsSoFar: state.runsSoFar,
    scoredAttempts: state.scoredAttempts,
    worldModel: WORLD_MODEL,
    envelope: b ? b.envelope : null,
  }, null, 2));

  console.log(`[${label}] rc=${code} wall=${wallS}s views=${views.length}`);
  console.log('outcome:', JSON.stringify(outcome));
  console.log('envelope:', JSON.stringify(env));
  if (!outcome) console.log('stderr tail:', stderrBuf.slice(-800));
});
