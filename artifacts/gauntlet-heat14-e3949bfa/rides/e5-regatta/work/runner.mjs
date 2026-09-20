// Gold Rush heat-14 runner — gen 116, e5-regatta.
// Spawns gr-sim, drives a controller module, logs every view, writes gauntlet-outcome.json
// and all three envelope axes on every child exit (the intermediate-results law, automatic).
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa';
const WS = path.join(ROOT, 'artifacts/heat14/opus/e5-regatta');
const CONTRACT = 'e5-regatta';
const SEED = 'e5-regatta-01';

const label = process.argv[2] || 'probe';
const ctrlPath = process.argv[3] || null;   // null => --policy idle
const worldModel = 'sim-import';

const tape = path.join(WS, `${label}-tape.json`);
const viewLog = path.join(WS, `${label}-views.jsonl`);
fs.writeFileSync(viewLog, '');

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (!ctrlPath) args.push('--policy', 'idle');

const controller = ctrlPath ? (await import(ctrlPath)).default : null;

const child = spawn('node', args, { cwd: ROOT, stdio: ['pipe', 'pipe', 'pipe'] });
let buf = '';
let outcome = null;
const rows = [];
let nView = 0;

child.stderr.on('data', (d) => {
  const s = String(d);
  if (/rejected|Error|error/.test(s)) process.stdout.write('[stderr] ' + s.slice(0, 400) + '\n');
});

function row(v) {
  const n = v.now || {};
  const dw = n.deepwater || {};
  const race = dw.race || {};
  return {
    i: nView, t: +(n.timers?.runSeconds ?? n.timers?.simTimeSeconds ?? 0).toFixed(2),
    w: n.wave, gold: n.gold, pan: n.score?.goldPanned, stolen: n.score?.goldStolen,
    hp: n.hero?.hp, mx: n.hero?.maxHp, hx: +(n.hero?.x ?? 0).toFixed(1), hz: +(n.hero?.z ?? 0).toFixed(1),
    alive: n.threats?.alive, wr: n.threats?.wreckers, th: n.threats?.thieves,
    kills: n.score?.kills,
    gate: race.nextGate?.id ?? null, passed: (race.gatesPassed || []).length, fin: race.finished,
    works: n.works?.standing, wrecked: n.works?.wrecked,
    pads: (dw.pads || []).filter((p) => p.occupied).map((p) => p.id).join('+'),
    anchor: dw.anchor?.id,
    seams: (n.seams || []).filter((s) => s.active).map((s) => `${s.id}@${s.anchorIndex}`).join(','),
    offer: (n.pendingOffer || []).map((o) => o.id).join(','),
    sec: !!n.pendingSecure,
    ord: (n.orders || []).slice(0, 6).map((o) => `${o.order?.verb || o.verb}:${o.status}${o.reason ? '(' + String(o.reason).slice(0, 34) + ')' : ''}`).join(' | '),
  };
}

child.stdout.on('data', (d) => {
  buf += String(d);
  let idx;
  while ((idx = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, idx); buf = buf.slice(idx + 1);
    if (!line.trim()) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg.schema === 'goldrush.view.v1') {
      fs.appendFileSync(viewLog, line + '\n');
      const r = row(msg); rows.push(r); nView++;
      if (controller) {
        const out = controller(msg, nView - 1);
        child.stdin.write((out === null || out === undefined ? '' : JSON.stringify(out)) + '\n');
      } else {
        child.stdin.write('\n');
      }
    } else if (msg.secured !== undefined || msg.waves !== undefined) {
      outcome = msg;
    }
  }
});

child.on('exit', (code) => {
  try { child.stdin.end(); } catch {}
  const summary = { label, code, outcome, views: nView };
  fs.writeFileSync(path.join(WS, `${label}-summary.json`), JSON.stringify(summary, null, 1));
  fs.writeFileSync(path.join(WS, `${label}-rows.json`), JSON.stringify(rows, null, 0));

  // envelope, read off the tape + the source function
  let env = null;
  try {
    const t = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const entries = t.inputLog?.entries || [];
    const lastTick = entries.length ? Math.max(...entries.map((e) => e.t ?? e.tick ?? 0)) : 0;
    env = {
      durationTicks: t.inputLog?.durationTicks,
      lastEntryTick: lastTick,
      entries: entries.length,
      bytes: fs.statSync(tape).size,
      eventLogHash: t.outcome?.eventLogHash ?? t.eventLogHash ?? null,
    };
  } catch (e) { env = { err: String(e).slice(0, 120) }; }
  fs.writeFileSync(path.join(WS, `${label}-envelope.json`), JSON.stringify(env, null, 1));

  // intermediate-results law: best so far
  const outPath = path.join(WS, 'gauntlet-outcome.json');
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(outPath, 'utf8')); } catch {}
  const runsSoFar = (prev?.runsSoFar ?? 0) + 1;
  const scored = /^attempt-/.test(label);
  const scoredAttempts = (prev?.scoredAttempts ?? 0) + (scored ? 1 : 0);
  const better = !prev || !prev.secured
    ? true
    : (outcome?.secured && ((outcome.waves ?? 0) > (prev.waves ?? 0)
        || ((outcome.waves ?? 0) === (prev.waves ?? 0) && (outcome.gold ?? 0) >= (prev.gold ?? 0))));
  const best = better && outcome ? { ...outcome, tape, scored } : { ...prev };
  fs.writeFileSync(outPath, JSON.stringify({
    ...best, runsSoFar, scoredAttempts, worldModel,
  }, null, 1));

  console.log('EXIT', code, JSON.stringify(outcome));
  console.log('ENV', JSON.stringify(env));
  const show = rows.filter((_, i) => i % Math.max(1, Math.ceil(rows.length / 34)) === 0 || i === rows.length - 1);
  for (const r of show) console.log(JSON.stringify(r));
});
