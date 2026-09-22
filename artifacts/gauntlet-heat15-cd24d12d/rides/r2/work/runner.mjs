// heat15 opus r2 runner — e5-regatta
// Spawns gr-sim, drives a controller module, logs every view, and writes
// gauntlet-outcome.json + all three envelope axes on EVERY child exit.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DIR = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/wt-heat15-arena';
const OUT = path.join(DIR, 'artifacts/heat15/opus/r2');

const label = process.argv[2] || 'probe';
const ctrlPath = process.argv[3] || null;   // absolute or relative to OUT
const tape = path.join(OUT, `${label}-tape.json`);

const args = ['scripts/gr-sim.mjs', '--contract', 'e5-regatta', '--seed', 'e5-regatta-01',
  '--difficulty', 'trail', '--tape', tape];
if (!ctrlPath) args.push('--policy=idle');

let ctrl = null;
if (ctrlPath) {
  const p = path.isAbsolute(ctrlPath) ? ctrlPath : path.join(OUT, ctrlPath);
  ctrl = (await import(p)).default;
}

const views = [];
const log = [];
const child = spawn('node', args, { cwd: DIR, stdio: ['pipe', 'pipe', 'pipe'] });

let buf = '';
let outcome = null;
let stderrTail = [];

function envelope() {
  try {
    const t = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const il = t.inputLog || {};
    const entries = il.entries || [];
    const lastTick = entries.length ? Math.max(...entries.map(e => e.t ?? e.tick ?? 0)) : 0;
    return {
      durationTicks: il.durationTicks,
      lastEntryTick: lastTick,
      entries: entries.length,
      bytes: fs.statSync(tape).size,
      tapeHash: t.meta?.eventLogHash ?? t.eventLogHash ?? null,
      viewVersion: t.meta?.viewVersion ?? null,
    };
  } catch (e) { return { error: String(e.message) }; }
}

function writeOutcome() {
  const env = envelope();
  const row = {
    ...(outcome || { secured: false, note: 'no outcome line' }),
    tape,
    scored: label.startsWith('attempt'),
    label,
    runsSoFar: Number(process.env.RUNS_SO_FAR || 0),
    scoredAttempts: Number(process.env.SCORED_ATTEMPTS || 0),
    worldModel: 'sim-import',
    envelope: env,
  };
  fs.writeFileSync(path.join(OUT, `${label}-summary.json`), JSON.stringify(row, null, 2));
  fs.writeFileSync(path.join(OUT, `${label}-viewlog.json`), JSON.stringify(log, null, 1));
  // promote to gauntlet-outcome.json unless a better row already sits there
  const gPath = path.join(OUT, 'gauntlet-outcome.json');
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(gPath, 'utf8')); } catch {}
  const better = !prev
    || (row.secured && !prev.secured)
    || (row.secured === prev.secured && (row.waves ?? 0) > (prev.waves ?? 0))
    || (row.secured === prev.secured && (row.waves ?? 0) === (prev.waves ?? 0) && (row.gold ?? 0) > (prev.gold ?? 0));
  if (better) fs.writeFileSync(gPath, JSON.stringify(row, null, 2));
  console.log('ENVELOPE', JSON.stringify(env));
  console.log('OUTCOME ', JSON.stringify(outcome));
}

child.stderr.on('data', d => { stderrTail.push(String(d)); if (stderrTail.length > 40) stderrTail.shift(); });

child.stdout.on('data', chunk => {
  buf += chunk;
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i); buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let msg; try { msg = JSON.parse(line); } catch { continue; }
    if (msg.schema === 'goldrush.view.v1') {
      views.push(msg);
      if (views.length === 1) fs.writeFileSync(path.join(OUT, `${label}-view0.json`), JSON.stringify(msg, null, 1));
      const n = msg.now || {};
      const r = n.regatta || {};
      const b = r.boat || {};
      log.push({
        v: views.length, t: n.timers?.runSeconds, wave: n.wave, gold: n.gold,
        pan: n.score?.goldPanned, stolen: n.score?.goldStolen,
        hp: n.hero?.hp, hx: n.hero?.x, hz: n.hero?.z,
        aboard: b.aboard, bx: b.x, bz: b.z, spd: b.speed,
        next: r.nextBuoy?.id ?? r.nextBuoy ?? null,
        passed: (r.buoysPassed || []).map(p => `${p.id ?? p}@${p.atSeconds ?? '?'}`),
        state: r.state, fin: r.finished, forf: r.forfeited,
        alive: n.threats?.alive,
        seams: (n.seams || []).map(s => `${s.id}:${s.active}:${s.x},${s.z}`),
        offer: (n.pendingOffer || []).map(o => o.id),
        secure: n.pendingSecure ? 'PENDING' : null,
        orders: (n.orders || []).map(o => `${o.order?.verb ?? o.verb}:${o.status}${o.reason ? '(' + o.reason + ')' : ''}`),
      });
      if (ctrl) {
        let arr;
        try { arr = ctrl(msg, log); } catch (e) { console.log('CTRL THREW', e.stack); arr = null; }
        if (arr === null || arr === undefined) child.stdin.write('\n');
        else child.stdin.write(JSON.stringify(arr) + '\n');
      } else {
        child.stdin.write('\n');
      }
    } else if (msg.secured !== undefined || msg.eventLogHash) {
      outcome = msg;
    }
  }
});

child.on('close', code => {
  console.log(`child exit ${code}; views=${views.length}`);
  if (stderrTail.length) console.log('STDERR TAIL:', stderrTail.join('').split('\n').filter(Boolean).slice(-8).join(' | '));
  writeOutcome();
  const tail = log.slice(-6);
  for (const row of tail) console.log('V', JSON.stringify(row));
});
