// Gen-102 runner: spawn gr-sim, drive a controller, log every view, write
// gauntlet-outcome.json + the three envelope axes on EVERY child exit.
// (Intermediate-results law, automatic. This arena refuses shell redirection.)
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WS = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa/artifacts/heat14/opus/e3-blackout-ridge';
const REPO = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa';
const CONTRACT = 'e3-blackout-ridge';
const SEED = 'e3-blackout-ridge-01';

const label = process.argv[2] || 'probe';
const ctrlPath = process.argv[3] || null; // null => --policy idle
const tape = path.join(WS, `${label}-tape.json`);
const viewLog = path.join(WS, `${label}-views.jsonl`);

let controller = null;
if (ctrlPath) controller = (await import(path.join(WS, ctrlPath))).default;

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--difficulty', 'trail', '--tape', tape];
if (!controller) args.push('--policy', 'idle');

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
fs.writeFileSync(viewLog, '');

let buf = '';
let outcome = null;
const rows = [];
let nViews = 0;
const state = {};

child.stdout.on('data', (d) => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i);
    buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg.schema === 'goldrush.view.v1') {
      nViews++;
      fs.appendFileSync(viewLog, JSON.stringify(msg) + '\n');
      const n = msg.now || {};
      const row = {
        v: nViews, t: +(n.timers?.runSeconds ?? 0).toFixed(1), w: n.wave,
        gold: n.gold, pan: n.score?.goldPanned, stol: n.score?.goldStolen,
        hp: n.hero?.hp != null ? +n.hero.hp.toFixed(1) : null, mx: n.hero?.maxHp,
        hx: n.hero?.x != null ? +n.hero.x.toFixed(1) : null, hz: n.hero?.z != null ? +n.hero.z.toFixed(1) : null,
        al: n.threats?.alive, wr: n.threats?.wreckers, th: n.threats?.thieves,
        st: n.works?.standing, wk: n.works?.wrecked,
        byKind: n.works?.byKind ? JSON.stringify(n.works.byKind) : null,
        offer: n.pendingOffer ? n.pendingOffer.map((o) => o.id).join(',') : null,
        sec: n.pendingSecure ? 1 : 0,
      };
      rows.push(row);
      let orders;
      if (controller) {
        try { orders = controller(msg, state); } catch (e) { console.error('CTRL THREW', e); orders = null; }
      } else orders = null;
      if (orders === 'BLANK') child.stdin.write('\n');
      else if (orders) child.stdin.write(JSON.stringify(orders) + '\n');
      else child.stdin.write('\n');
    } else if (msg.secured !== undefined) {
      outcome = msg;
    }
  }
});

const errChunks = [];
child.stderr.on('data', (d) => errChunks.push(d.toString()));

child.on('exit', (code) => {
  const table = rows.map((r) => Object.entries(r).filter(([, v]) => v !== null && v !== undefined).map(([k, v]) => `${k}=${v}`).join(' ')).join('\n');
  fs.writeFileSync(path.join(WS, `${label}-table.txt`), table);
  // envelope
  let env = {};
  try {
    const tp = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const il = tp.inputLog || {};
    const entries = il.entries || [];
    const lastTick = entries.length ? Math.max(...entries.map((e) => e.t ?? e.tick ?? 0)) : 0;
    env = {
      durationTicks: il.durationTicks,
      lastEntryTick: lastTick,
      entries: entries.length,
      bytes: fs.statSync(tape).size,
      tapeHash: tp.eventLogHash || tp.meta?.eventLogHash || null,
    };
  } catch (e) { env = { error: String(e) }; }
  const summary = { label, exitCode: code, views: nViews, outcome, envelope: env, tape, stderrTail: errChunks.join('').slice(-1500) };
  fs.writeFileSync(path.join(WS, `${label}-summary.json`), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify({ label, code, views: nViews, outcome, envelope: env }, null, 2));
  // promote to gauntlet-outcome.json if better (or if none exists)
  try { promote(summary); } catch (e) { console.error('promote failed', e); }
});

function promote(sum) {
  const p = path.join(WS, 'gauntlet-outcome.json');
  const bookPath = path.join(WS, 'runbook.json');
  const book = fs.existsSync(bookPath) ? JSON.parse(fs.readFileSync(bookPath, 'utf8')) : { runs: [], scored: [] };
  book.runs.push({ label, outcome: sum.outcome, envelope: sum.envelope });
  fs.writeFileSync(bookPath, JSON.stringify(book, null, 2));
  const scoredAttempts = book.runs.filter((r) => /^attempt-/.test(r.label)).length;
  // rank: secured, then waves, then gold
  const key = (o) => o ? [o.secured ? 1 : 0, o.waves || 0, o.gold || 0, o.timeMs || 0] : [0, 0, 0, 0];
  let best = null;
  for (const r of book.runs) {
    if (!r.outcome) continue;
    if (!best) { best = r; continue; }
    const a = key(r.outcome), b = key(best.outcome);
    for (let i = 0; i < a.length; i++) { if (a[i] !== b[i]) { if (a[i] > b[i]) best = r; break; } }
  }
  if (!best) return;
  const out = { ...best.outcome, tape: path.join(WS, `${best.label}-tape.json`), scored: /^attempt-/.test(best.label), runsSoFar: book.runs.length, scoredAttempts, worldModel: 'sim-import', envelope: best.envelope, label: best.label };
  fs.writeFileSync(p, JSON.stringify(out, null, 2));
}
