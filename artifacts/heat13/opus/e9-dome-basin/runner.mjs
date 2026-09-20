// heat13 gen79 runner — spawn gr-sim, drive a controller, log every view,
// write gauntlet-outcome.json + all three envelope axes on EVERY child exit.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DIR = '/private/tmp/heat13-569a41f9/artifacts/heat13/opus/e9-dome-basin';
const REPO = '/private/tmp/heat13-569a41f9';
const CONTRACT = 'e9-dome-basin';
const SEED = 'e9-dome-basin-01';

export async function ride({ label, controller, idle = false }) {
  const tape = path.join(DIR, `${label}-tape.json`);
  const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
  if (idle) args.push('--policy=idle');

  const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
  const views = [];
  const rows = [];
  let outcome = null;
  let buf = '';
  const state = { blacklist: new Set(), tries: new Map(), placed: [], log: rows };

  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (chunk) => {
    buf += chunk;
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i).trim();
      buf = buf.slice(i + 1);
      if (!line) continue;
      let msg;
      try { msg = JSON.parse(line); } catch { continue; }
      if (msg.schema === 'goldrush.view.v1') {
        views.push(msg);
        const n = msg.now || {};
        rows.push({
          v: views.length, t: +(n.timers?.runSeconds ?? 0).toFixed(1), w: n.wave,
          hp: n.hero ? +(n.hero.hp).toFixed(1) : null, mx: n.hero?.maxHp,
          hx: n.hero ? +(n.hero.x ?? 0).toFixed(1) : null, hz: n.hero ? +(n.hero.z ?? 0).toFixed(1) : null,
          g: n.gold, pan: n.score?.goldPanned, alive: n.threats?.alive,
          wr: n.threats?.wreckers, th: n.threats?.thieves,
          st: n.works?.standing, wk: n.works?.wrecked,
          kinds: JSON.stringify(n.works?.byKind || {}),
          offer: n.pendingOffer ? n.pendingOffer.map(o => o.id).join(',') : '',
          sec: n.pendingSecure ? 1 : 0,
          fails: (n.orders || []).filter(o => o.status === 'failed').map(o => `${o.order?.verb}:${o.reason || ''}`).slice(0, 3).join('|'),
        });
        if (!idle) {
          let orders = null;
          try { orders = controller(msg, state); } catch (e) { rows.push({ err: String(e && e.stack || e) }); }
          child.stdin.write(orders === null ? '\n' : JSON.stringify(orders) + '\n');
        }
      } else if (msg.secured !== undefined || msg.endReason !== undefined) {
        outcome = msg;
      }
    }
  });
  let stderr = '';
  child.stderr.on('data', (d) => { stderr += d; });

  await new Promise((res) => child.on('close', res));

  // envelope axes, measured off the reel that now exists
  let env = null;
  try {
    const tp = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const entries = tp.inputLog?.entries || [];
    const ticks = tp.inputLog?.durationTicks;
    const lastT = entries.length ? entries[entries.length - 1].t : null;
    env = { durationTicks: ticks, lastEntryTick: lastT, entries: entries.length, bytes: fs.statSync(tape).size };
  } catch { /* no tape */ }

  fs.writeFileSync(path.join(DIR, `${label}-views.json`), JSON.stringify(rows, null, 0));
  const summary = { label, tape, outcome, env, views: views.length, stderrTail: stderr.slice(-400) };
  fs.writeFileSync(path.join(DIR, `${label}-summary.json`), JSON.stringify(summary, null, 1));
  promote(label, tape, outcome, env);
  return { views, rows, outcome, env, state, tape };
}

// ---- intermediate-results law: rewrite gauntlet-outcome.json after EVERY run ----
const WORLD_MODEL = 'sim-import';
let runsSoFar = 0, scoredAttempts = 0, best = null;
export function noteScored() { scoredAttempts += 1; }
function rank(o) {
  if (!o) return [-1, -1, -1];
  return [o.secured ? 1 : 0, o.waves || 0, o.gold || 0];
}
function promote(label, tape, outcome, env) {
  runsSoFar += 1;
  const cand = { label, tape, outcome, env };
  const a = rank(outcome), b = rank(best && best.outcome);
  if (!best || a[0] > b[0] || (a[0] === b[0] && (a[1] > b[1] || (a[1] === b[1] && a[2] >= b[2])))) best = cand;
  writeOutcome();
}
export function writeOutcome(extra = {}) {
  const o = (best && best.outcome) || {};
  const row = {
    ...o,
    tape: best ? best.tape : null,
    scored: /^attempt/.test(best?.label || ''),
    runsSoFar, scoredAttempts,
    worldModel: WORLD_MODEL,
    envelope: best ? best.env : null,
    ...extra,
  };
  fs.writeFileSync(path.join(DIR, 'gauntlet-outcome.json'), JSON.stringify(row, null, 1));
}
