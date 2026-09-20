// Gold Rush gauntlet runner — heat 14, generation 112, e9-devils-alley.
// Spawns gr-sim, drives a controller module, logs every view, and writes
// gauntlet-outcome.json + all three envelope axes on EVERY child exit.
// (This arena refuses shell redirection and compound `cd`; `timeout` is not on macOS.
//  The runner is the only way the intermediate-results law gets satisfied here.)
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WS = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa';
const OUT = path.join(WS, 'artifacts/heat14/opus/e9-devils-alley');
const CONTRACT = 'e9-devils-alley';
const SEED = 'e9-devils-alley-01';

const label = process.argv[2] || 'probe';
const ctrlPath = process.argv[3] || null; // null => --policy idle
const tape = path.join(OUT, `${label}-tape.json`);
const viewLog = path.join(OUT, `${label}-views.jsonl`);
const summary = path.join(OUT, `${label}-summary.json`);

let controller = null;
if (ctrlPath) controller = (await import(path.join(OUT, ctrlPath))).default;

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (!controller) args.push('--policy', 'idle');

const child = spawn('node', args, { cwd: WS, stdio: ['pipe', 'pipe', 'pipe'] });
fs.writeFileSync(viewLog, '');

let buf = '';
let outcome = null;
const rows = [];
let nView = 0;
let stderrTail = [];

function envelope() {
  try {
    const t = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const il = t.inputLog || {};
    const entries = il.entries || [];
    const last = entries.length ? entries[entries.length - 1] : null;
    return {
      bytes: fs.statSync(tape).size,
      entries: entries.length,
      durationTicks: il.durationTicks,
      lastEntryTick: last ? (last.t ?? last.tick) : null,
      tapeHash: t.eventLogHash ?? t.meta?.eventLogHash ?? null,
    };
  } catch (e) { return { error: String(e.message || e) }; }
}

function writeAll(final) {
  const env = envelope();
  const s = { label, tape, outcome, views: nView, envelope: env, rows: rows.slice(-400), stderrTail: stderrTail.slice(-8) };
  fs.writeFileSync(summary, JSON.stringify(s, null, 1));
  // intermediate-results law: best-so-far into gauntlet-outcome.json
  const gp = path.join(OUT, 'gauntlet-outcome.json');
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(gp, 'utf8')); } catch {}
  const runsSoFar = (prev?.runsSoFar || 0) + (final ? 1 : 0);
  const scoredAttempts = (prev?.scoredAttempts || 0) + (final && /^attempt-/.test(label) ? 1 : 0);
  const better = (a, b) => {
    if (!a) return false; if (!b) return true;
    if (!!a.secured !== !!b.secured) return !!a.secured;
    if ((a.waves || 0) !== (b.waves || 0)) return (a.waves || 0) > (b.waves || 0);
    if ((a.gold || 0) !== (b.gold || 0)) return (a.gold || 0) > (b.gold || 0);
    return (a.timeMs || 0) >= (b.timeMs || 0);
  };
  const keepNew = final && outcome && better(outcome, prev?.outcomeRaw || null);
  const row = keepNew || !prev ? {
    ...(outcome || {}),
    outcomeRaw: outcome,
    tape,
    scored: /^attempt-/.test(label),
    envelope: env,
  } : prev;
  fs.writeFileSync(gp, JSON.stringify({
    ...row,
    runsSoFar, scoredAttempts,
    worldModel: 'sim-import',
  }, null, 1));
}

child.stderr.on('data', (d) => { stderrTail.push(String(d).trim().slice(0, 400)); });

child.stdout.on('data', (d) => {
  buf += String(d);
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i); buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let msg; try { msg = JSON.parse(line); } catch { continue; }
    if (msg.schema === 'goldrush.view.v1') {
      nView++;
      fs.appendFileSync(viewLog, JSON.stringify(msg) + '\n');
      const n = msg.now || {};
      rows.push({
        v: nView, t: +(((n.timers?.runSeconds) ?? (n.timers?.simTimeSeconds) ?? 0)).toFixed(2), w: n.wave,
        g: n.gold, pan: n.score?.goldPanned, stolen: n.score?.goldStolen,
        hp: n.hero ? +(n.hero.hp).toFixed(1) : null, mx: n.hero?.maxHp,
        hx: n.hero ? +(n.hero.x ?? 0).toFixed(1) : null, hz: n.hero ? +(n.hero.z ?? 0).toFixed(1) : null,
        al: n.threats?.alive, wr: n.threats?.wreckers, th: n.threats?.thieves,
        st: n.works?.standing, wk: n.works?.wrecked,
        kinds: n.works?.byKind ? JSON.stringify(n.works.byKind) : null,
        off: n.pendingOffer ? n.pendingOffer.map(o => o.id).join(',') : null,
        sec: n.pendingSecure ? 1 : 0,
        fails: (n.orders || []).filter(o => o.status === 'failed').map(o => `${o.order?.verb}:${(o.reason || '').slice(0, 40)}`).slice(0, 3),
      });
      if (nView % 10 === 0) writeAll(false);
      if (controller) {
        let arr;
        try { arr = controller(msg, nView); } catch (e) { stderrTail.push('CTRL ERR ' + e.stack); arr = null; }
        if (arr === null) child.stdin.write('\n');
        else child.stdin.write(JSON.stringify(arr) + '\n');
      }
    } else if (msg.secured !== undefined || msg.endReason !== undefined) {
      outcome = msg;
    }
  }
});

child.on('close', (code) => {
  writeAll(true);
  const e = envelope();
  console.log('== ' + label + ' exit ' + code + ' views ' + nView);
  console.log('OUTCOME', JSON.stringify(outcome));
  console.log('ENVELOPE', JSON.stringify(e));
  console.log('stderr:', stderrTail.slice(-4).join(' | ').slice(0, 600));
  const step = Math.max(1, Math.floor(rows.length / 34));
  for (let i = 0; i < rows.length; i += step) console.log(JSON.stringify(rows[i]));
  if (rows.length) console.log('LAST', JSON.stringify(rows[rows.length - 1]));
});
