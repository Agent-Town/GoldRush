// Gold Rush heat-14 runner — generation 126.
// Spawns gr-sim, drives a controller module, logs every view, and writes
// gauntlet-outcome.json + all three envelope axes on EVERY child exit.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const HERE = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa/artifacts/heat14/opus/e3-fairground';
const REPO = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa';
const CONTRACT = 'e3-fairground';
const SEED = 'e3-fairground-01';

const args = process.argv.slice(2);
const label = args[0] ?? 'probe';
const ctrlPath = args[1] ?? null;   // null => --policy idle

const tape = path.join(HERE, `${label}-tape.json`);
const viewLog = path.join(HERE, `${label}-views.jsonl`);
fs.writeFileSync(viewLog, '');

let decide = null;
if (ctrlPath) {
  const mod = await import(pathToFileURL(path.resolve(HERE, ctrlPath)).href);
  decide = mod.decide;
}

const simArgs = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (!ctrlPath) simArgs.push('--policy', 'idle');

const child = spawn('node', simArgs, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });

const state = {};
let buf = '';
let outcome = null;
const rows = [];

child.stdout.on('data', (chunk) => {
  buf += chunk.toString();
  let nl;
  while ((nl = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, nl);
    buf = buf.slice(nl + 1);
    if (!line.trim()) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg.schema === 'goldrush.view.v1') {
      fs.appendFileSync(viewLog, line + '\n');
      rows.push(compact(msg));
      if (decide) {
        let reply;
        try { reply = decide(msg, state); } catch (e) { reply = '\n'; console.error('CTRL ERR', e.message, e.stack); }
        child.stdin.write(typeof reply === 'string' ? reply : JSON.stringify(reply) + '\n');
      }
    } else if (msg.secured !== undefined || msg.endReason !== undefined) {
      outcome = msg;
    }
  }
});

const errChunks = [];
child.stderr.on('data', (c) => { const s = c.toString(); errChunks.push(s); });

child.on('exit', (code) => {
  const errText = errChunks.join('');
  const rejects = (errText.match(/gr-sim rejected orders: [^\n]*/g) ?? []).slice(0, 8);
  const summary = { label, code, outcome, views: rows.length, rejects };

  // Envelope: all three axes, measured off the reel that exists.
  let env = null;
  try {
    const t = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const entries = t.inputLog?.entries ?? [];
    const lastTick = entries.length ? Math.max(...entries.map((e) => e.t ?? e.tick ?? 0)) : 0;
    env = {
      durationTicks: t.inputLog?.durationTicks,
      lastEntryTick: lastTick,
      entries: entries.length,
      bytes: fs.statSync(tape).size,
      eventLogHash: t.outcome?.eventLogHash ?? t.eventLogHash,
    };
  } catch (e) { env = { err: e.message }; }
  summary.envelope = env;

  fs.writeFileSync(path.join(HERE, `${label}-summary.json`), JSON.stringify(summary, null, 1));
  console.log('ROWS');
  for (const r of rows) console.log(r);
  console.log('OUTCOME', JSON.stringify(outcome));
  console.log('ENVELOPE', JSON.stringify(env));
  if (rejects.length) console.log('REJECTS', rejects.join(' | '));

  // Intermediate-results law: promote the best-so-far row automatically.
  try {
    const outFile = path.join(HERE, 'gauntlet-outcome.json');
    let best = null;
    try { best = JSON.parse(fs.readFileSync(outFile, 'utf8')); } catch {}
    const runsSoFar = (best?.runsSoFar ?? 0) + 1;
    const scored = /^attempt-/.test(label);
    const scoredAttempts = (best?.scoredAttempts ?? 0) + (scored ? 1 : 0);
    const better = !best || !best.secured
      ? (outcome?.secured ? true : (outcome?.waves ?? 0) > (best?.waves ?? -1))
      : false;
    const row = better && outcome
      ? { ...outcome, tape, scored }
      : { ...(best ?? {}) };
    row.runsSoFar = runsSoFar;
    row.scoredAttempts = scoredAttempts;
    row.worldModel = 'sim-import';
    fs.writeFileSync(outFile, JSON.stringify(row, null, 1));
  } catch (e) { console.log('outcome-file err', e.message); }
});

function compact(v) {
  const n = v.now ?? {};
  const f = n.fairground ?? {};
  const fl = f.flocks ?? {};
  const cross = (fl.flocks ?? []).map((x) => `${x.crossings}${x.phase[0]}`).join('/');
  const w = n.works ?? {};
  return [
    `t=${(n.timers?.runSeconds ?? v.now?.timers?.simTimeSeconds ?? 0).toFixed?.(1) ?? '?'}`,
    `w${n.wave ?? '?'}`,
    `hp=${Math.round(n.hero?.hp ?? 0)}/${n.hero?.maxHp ?? 0}`,
    `@${(n.hero?.x ?? 0).toFixed(0)},${(n.hero?.z ?? 0).toFixed(0)}`,
    `g=${n.gold ?? 0}`,
    `pan=${n.score?.goldPanned ?? 0}`,
    `wk=${w.standing ?? 0}/${w.wrecked ?? 0}`,
    `al=${n.threats?.alive ?? 0}`,
    `whl=${f.wheel?.hp ?? '-'}${f.wheel?.spinning === false ? 'STOP' : ''}`,
    `x=${cross}`,
    `allX=${f.objective?.allCrossed ?? '-'}`,
  ].join(' ');
}
