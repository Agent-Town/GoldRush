// Gen-128 runner: spawn gr-sim, drive a controller, log every view, write
// gauntlet-outcome.json + all three envelope axes on every child exit.
// (The arena refuses shell redirection; the runner is the intermediate-results law.)
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WS = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa/artifacts/heat14/opus/e4-dust-flats';
const REPO = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa';
const CONTRACT = 'e4-dust-flats';
const SEED = 'e4-dust-flats-01';

const label = process.argv[2] || 'probe';
const ctrlPath = process.argv[3] || null;   // null => --policy idle
const tape = path.join(WS, `${label}-tape.json`);
const viewLog = path.join(WS, `${label}-views.jsonl`);

let controller = null;
if (ctrlPath) {
  const mod = await import(path.isAbsolute(ctrlPath) ? ctrlPath : path.join(WS, ctrlPath));
  controller = mod.default || mod.decide;
}

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (!controller) args.push('--policy', 'idle');

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });

let buf = '';
let outcome = null;
const rows = [];
const vs = fs.createWriteStream(viewLog);
let n = 0;

child.stdout.on('data', (d) => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i); buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let j; try { j = JSON.parse(line); } catch { continue; }
    if (j.schema === 'goldrush.view.v1') {
      n++;
      vs.write(JSON.stringify(j) + '\n');
      const now = j.now || {};
      const row = {
        v: n, t: +((now.timers?.runSeconds ?? now.timers?.simTimeSeconds ?? 0)).toFixed(2),
        w: now.wave, gold: now.gold,
        pan: now.score?.goldPanned, stole: now.score?.goldStolen,
        hp: now.hero?.hp != null ? +now.hero.hp.toFixed(1) : null,
        mx: now.hero?.maxHp, hx: now.hero?.x != null ? +now.hero.x.toFixed(1) : null,
        hz: now.hero?.z != null ? +now.hero.z.toFixed(1) : null,
        alive: now.threats?.alive, wr: now.threats?.wreckers, th: now.threats?.thieves,
        stand: now.works?.standing, wrk: now.works?.wrecked,
        kinds: now.works?.byKind ? JSON.stringify(now.works.byKind) : null,
        tiers: now.works?.entries ? now.works.entries.filter(e => (e.tier ?? 1) > 1).length : 0,
        arr: now.motor?.objective?.arrived, fuel: now.motor?.fuel?.drawn,
        tar: now.motor?.fuel?.tar, stored: now.motor?.fuel?.stored,
        graded: now.motor?.roads?.corridors?.filter(c => c.graded).map(c => c.id).join('|'),
        veh: now.motor?.vehicle ? `${now.motor.vehicle.state}@${(now.motor.vehicle.x ?? 0).toFixed(0)},${(now.motor.vehicle.z ?? 0).toFixed(0)}` : null,
        wx: now.motor?.weather?.phase,
        offer: now.pendingOffer ? now.pendingOffer.map(o => o.id).join(',') : null,
        sec: now.pendingSecure ? 'SECURE' : null,
        fails: (now.orders || []).filter(o => o.status === 'failed').map(o => `${o.order?.verb}:${o.reason || ''}`).slice(0, 4).join(' ; '),
      };
      rows.push(row);
      if (controller) {
        let arr;
        try { arr = controller(j, n); } catch (e) { console.error('CTRL ERR', e.message); arr = null; }
        child.stdin.write(arr === null ? '\n' : JSON.stringify(arr) + '\n');
      }
    } else if (j.secured !== undefined || j.waves !== undefined) {
      outcome = j;
    }
  }
});
let err = '';
child.stderr.on('data', (d) => { err += d.toString(); });

child.on('close', (code) => {
  vs.end();
  // compact per-view table
  const hdr = Object.keys(rows[0] || { v: 1 });
  const lines = [hdr.join('\t')].concat(rows.map(r => hdr.map(k => r[k] === null || r[k] === undefined ? '' : r[k]).join('\t')));
  fs.writeFileSync(path.join(WS, `${label}-table.tsv`), lines.join('\n'));

  // envelope: ticks, entries, bytes — all three axes, read off the tape that exists
  let env = null;
  try {
    const tp = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const entries = tp.inputLog?.entries || [];
    const lastTick = entries.length ? Math.max(...entries.map(e => e.t ?? e.tick ?? 0)) : 0;
    env = {
      durationTicks: tp.inputLog?.durationTicks,
      lastEntryTick: lastTick,
      entries: entries.length,
      bytes: fs.statSync(tape).size,
      tapeHash: tp.eventLogHash || tp.meta?.eventLogHash || tp.header?.eventLogHash,
    };
  } catch { }

  const summary = { label, code, outcome, env, views: n, stderrTail: err.slice(-600) };
  fs.writeFileSync(path.join(WS, `${label}-summary.json`), JSON.stringify(summary, null, 2));

  // INTERMEDIATE-RESULTS LAW: promote best-so-far after EVERY run
  const OUT = path.join(WS, 'gauntlet-outcome.json');
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(OUT, 'utf8')); } catch { }
  const runsSoFar = (prev?.runsSoFar || 0) + 1;
  const scoredAttempts = (prev?.scoredAttempts || 0) + (label.startsWith('attempt') ? 1 : 0);
  const better = !prev || !prev.secured ||
    (outcome?.secured && (outcome.waves > (prev.waves || 0) ||
      (outcome.waves === prev.waves && (outcome.gold || 0) > (prev.gold || 0))));
  const base = (outcome?.secured && better) || !prev
    ? { ...outcome, tape, scored: label.startsWith('attempt') }
    : { ...prev };
  fs.writeFileSync(OUT, JSON.stringify({
    ...base, runsSoFar, scoredAttempts, worldModel: 'sim-import', envelope: env,
  }, null, 2));

  console.log(JSON.stringify(summary.outcome));
  console.log('ENV', JSON.stringify(env));
  console.log('VIEWS', n, 'code', code);
  if (err) console.log('STDERR', err.slice(-400));
});
