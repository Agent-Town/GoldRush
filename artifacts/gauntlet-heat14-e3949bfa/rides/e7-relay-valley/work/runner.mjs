// Gen 109 runner: spawn gr-sim, drive a controller, log every view, write
// gauntlet-outcome.json + all three envelope axes on EVERY child exit.
// (Notebook: "the runner before the probe" — this arena refuses shell
// redirection and compound cd, and `timeout` is not on macOS.)
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WS = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa/artifacts/heat14/opus/e7-relay-valley';
const REPO = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa';
const CONTRACT = 'e7-relay-valley';
const SEED = 'e7-relay-valley-01';

const label = process.argv[2] || 'tune-1';
const mode = process.argv[3] || 'ctrl'; // 'idle' or 'ctrl'
const tape = path.join(WS, `${label}-tape.json`);
const logPath = path.join(WS, `${label}-views.jsonl`);

let controller = null;
if (mode !== 'idle') controller = (await import(path.join(WS, 'controller.mjs'))).default;

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (mode === 'idle') args.push('--policy=idle');

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
const logFd = fs.openSync(logPath, 'w');

let buf = '';
let outcome = null;
let views = 0;
const rows = [];
const ctx = controller ? controller.newState() : null;

child.stdout.on('data', (chunk) => {
  buf += chunk.toString();
  let nl;
  while ((nl = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, nl).trim();
    buf = buf.slice(nl + 1);
    if (!line) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg && msg.schema === 'goldrush.view.v1') {
      views += 1;
      fs.writeSync(logFd, JSON.stringify(msg) + '\n');
      const n = msg.now || {};
      rows.push({
        v: views, t: +(n.timers?.runSeconds ?? 0).toFixed(2), w: n.wave,
        gold: n.gold, pan: n.score?.goldPanned, stolen: n.score?.goldStolen,
        hp: n.hero ? +n.hero.hp.toFixed(1) : null, mx: n.hero?.maxHp,
        hx: n.hero ? +n.hero.x.toFixed(1) : null, hz: n.hero ? +n.hero.z.toFixed(1) : null,
        alive: n.threats?.alive, wr: n.threats?.wreckers, th: n.threats?.thieves,
        st: n.works?.standing, wk: n.works?.wrecked,
        kinds: JSON.stringify(n.works?.byKind || {}),
        met: n.playbookUse?.objectiveMet, lit: JSON.stringify(n.playbookUse?.relaysLitByProgram || []),
        prog: n.playbookUse?.runningProgram ?? null, uses: n.playbookUse?.uses,
        off: n.pendingOffer ? n.pendingOffer.map((o) => o.id).join('|') : null,
        sec: !!n.pendingSecure,
      });
      if (controller) {
        const reply = controller.decide(msg, ctx);
        child.stdin.write(reply === null ? '\n' : JSON.stringify(reply) + '\n');
      }
      continue;
    }
    if (msg && typeof msg.secured === 'boolean') { outcome = msg; fs.writeSync(logFd, JSON.stringify({ OUTCOME: msg }) + '\n'); }
  }
});

let stderrTail = '';
child.stderr.on('data', (c) => { stderrTail = (stderrTail + c.toString()).slice(-4000); });

function envelope() {
  try {
    const t = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const il = t.inputLog || {};
    const entries = il.entries || [];
    const last = entries.length ? entries[entries.length - 1] : null;
    const lastTick = last ? (last.t ?? last.tick ?? null) : null;
    return {
      durationTicks: il.durationTicks ?? null,
      lastEntryTick: lastTick,
      entries: entries.length,
      bytes: fs.statSync(tape).size,
      tapeHash: t.meta?.eventLogHash ?? t.eventLogHash ?? null,
      defaultedSecure: t.outcome?.defaultedSecure ?? null,
      defaultedPicks: t.outcome?.defaultedPicks ?? null,
    };
  } catch (e) { return { error: e.message }; }
}

child.on('exit', (code) => {
  fs.closeSync(logFd);
  const env = envelope();
  const summary = { label, mode, code, views, outcome, envelope: env, stderrTail: stderrTail.slice(-600) };
  fs.writeFileSync(path.join(WS, `${label}-summary.json`), JSON.stringify(summary, null, 2));
  // compact table
  const hdr = 'v t w gold pan stolen hp/mx hx,hz alive wr/th st/wk met lit prog kinds';
  const tbl = [hdr].concat(rows.map((r) => `${r.v} ${r.t} w${r.w} g${r.gold} p${r.pan} s${r.stolen} ${r.hp}/${r.mx} ${r.hx},${r.hz} a${r.alive} ${r.wr}/${r.th} ${r.st}/${r.wk} ${r.met} ${r.lit} ${r.prog} ${r.kinds}${r.off ? ' OFFER:' + r.off : ''}${r.sec ? ' SECURE' : ''}`)).join('\n');
  fs.writeFileSync(path.join(WS, `${label}-table.txt`), tbl);

  // INTERMEDIATE-RESULTS LAW: promote best-so-far outcome unconditionally.
  const outPath = path.join(WS, 'gauntlet-outcome.json');
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(outPath, 'utf8')); } catch { /* first run */ }
  const runsSoFar = (prev?.runsSoFar ?? 0) + 1;
  const scoredAttempts = (prev?.scoredAttempts ?? 0) + (/^attempt-/.test(label) ? 1 : 0);
  const rank = (o) => (!o ? -1 : (o.secured ? 1e9 : 0) + (o.waves ?? 0) * 1000 + (o.gold ?? 0));
  const better = !prev || rank(outcome) >= rank(prev.outcome ?? prev);
  const row = better
    ? { outcome, tape, scored: /^attempt-/.test(label), runsSoFar, scoredAttempts, worldModel: 'sim-import', envelope: env, label }
    : { ...prev, runsSoFar, scoredAttempts };
  fs.writeFileSync(outPath, JSON.stringify(row, null, 2));
  console.log(JSON.stringify({ label, code, views, outcome, envelope: env }, null, 1));
  if (stderrTail) console.log('STDERR TAIL:', stderrTail.slice(-500));
});
