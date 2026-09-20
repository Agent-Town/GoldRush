// Runner: spawns gr-sim, drives a controller module, logs every view, writes
// gauntlet-outcome.json on every child exit (the intermediate-results law).
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WS = '/private/tmp/heat13-569a41f9/artifacts/heat13/opus/e3-moth-season';
const REPO = '/private/tmp/heat13-569a41f9';
const CONTRACT = 'e3-moth-season';
const SEED = 'e3-moth-season-01';

const label = process.argv[2] || 'probe-1';
const ctrlPath = process.argv[3] || null; // null => --policy idle
const scored = process.argv[4] === 'scored';

const tape = path.join(WS, `${label}-tape.json`);
const viewLog = path.join(WS, `${label}-views.jsonl`);
fs.writeFileSync(viewLog, '');

let controller = null;
if (ctrlPath) {
  const mod = await import(ctrlPath + `?v=${Date.now()}`);
  controller = mod.default || mod.decide;
}

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (!ctrlPath) args.push('--policy', 'idle');

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });

let buf = '';
let outcome = null;
let views = 0;
let submissions = 0;
const state = {};
const rows = [];

child.stdout.on('data', (d) => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i).trim();
    buf = buf.slice(i + 1);
    if (!line) continue;
    let obj;
    try { obj = JSON.parse(line); } catch { continue; }
    if (obj.schema === 'goldrush.view.v1') {
      views++;
      fs.appendFileSync(viewLog, JSON.stringify(obj) + '\n');
      const n = obj.now || {};
      rows.push({
        v: views, t: +(n.timers?.runSeconds ?? 0).toFixed(1), w: n.wave,
        hp: n.hero?.hp != null ? +n.hero.hp.toFixed(1) : null, mx: n.hero?.maxHp,
        hx: n.hero?.x != null ? +n.hero.x.toFixed(1) : null,
        hz: n.hero?.z != null ? +n.hero.z.toFixed(1) : null,
        g: n.gold, pan: n.score?.goldPanned,
        st: n.works?.standing, wr: n.works?.wrecked,
        al: n.threats?.alive, wk: n.threats?.wreckers,
        cc: n.canyonConnect ? `${n.canyonConnect.powered}/${n.canyonConnect.required}${n.canyonConnect.complete ? 'C' : ''}${n.canyonConnect.failed ? 'F' : ''}` : '-',
        off: n.pendingOffer ? n.pendingOffer.length : 0,
        sec: n.pendingSecure ? 1 : 0,
      });
      if (controller) {
        let out;
        try { out = controller(obj, state); } catch (e) { console.error('CTRL ERR', e); out = '\n'; }
        if (out === null || out === undefined) out = '\n';
        const s = typeof out === 'string' ? out : JSON.stringify(out) + '\n';
        if (s.trim()) submissions++;
        child.stdin.write(s);
      }
    } else if (obj.secured !== undefined || obj.waves !== undefined) {
      outcome = obj;
    }
  }
});

let stderrTail = '';
child.stderr.on('data', (d) => { stderrTail = (stderrTail + d.toString()).slice(-4000); });

child.on('exit', (code) => {
  // per-view table
  const hdr = 'v    t      w  hp/mx    hx,hz        gold pan   st/wr al/wk cc     off sec';
  const tbl = rows.map(r => [
    String(r.v).padEnd(4), String(r.t).padEnd(6), String(r.w).padEnd(2),
    `${r.hp}/${r.mx}`.padEnd(8), `${r.hx},${r.hz}`.padEnd(12),
    String(r.g).padEnd(4), String(r.pan).padEnd(5),
    `${r.st}/${r.wr}`.padEnd(5), `${r.al}/${r.wk}`.padEnd(5),
    String(r.cc).padEnd(6), String(r.off), String(r.sec),
  ].join(' ')).join('\n');
  fs.writeFileSync(path.join(WS, `${label}-table.txt`), hdr + '\n' + tbl + '\n');

  // envelope
  let env = {};
  if (fs.existsSync(tape)) {
    const raw = fs.readFileSync(tape, 'utf8');
    const t = JSON.parse(raw);
    const entries = t.inputLog?.entries || [];
    const durationTicks = t.inputLog?.durationTicks;
    const lastEntryTick = entries.length ? entries[entries.length - 1].tick : null;
    env = { bytes: Buffer.byteLength(raw), entries: entries.length, durationTicks, lastEntryTick };
    if (durationTicks === undefined) env.WARN = 'durationTicks MISSING from inputLog';
  }

  console.log(`\n=== ${label} rc=${code} views=${views} subs=${submissions}`);
  console.log('OUTCOME:', JSON.stringify(outcome));
  console.log('ENVELOPE:', JSON.stringify(env));
  if (rows.length) console.log('LAST ROWS:\n' + hdr + '\n' + tbl.split('\n').slice(-12).join('\n'));
  if (code !== 0) console.log('STDERR TAIL:', stderrTail.slice(-1500));

  // intermediate-results law
  const opath = path.join(WS, 'gauntlet-outcome.json');
  let best = null;
  if (fs.existsSync(opath)) { try { best = JSON.parse(fs.readFileSync(opath, 'utf8')); } catch {} }
  const runsSoFar = (best?.runsSoFar || 0) + 1;
  const scoredAttempts = (best?.scoredAttempts || 0) + (scored ? 1 : 0);
  const better = !best || !best.secured
    ? (outcome ? (best?.secured ? false : true) : false)
    : false;
  const cand = {
    ...(outcome || {}),
    tape,
    scored,
    runsSoFar,
    scoredAttempts,
    worldModel: 'sim-import',
    envelope: env,
  };
  let next;
  if (!best) next = cand;
  else if (best.secured && !outcome?.secured) next = { ...best, runsSoFar, scoredAttempts };
  else if (!best.secured && outcome?.secured) next = cand;
  else if (outcome && (outcome.waves > (best.waves ?? -1) || (outcome.waves === best.waves && (outcome.timeMs ?? 0) > (best.timeMs ?? 0)))) next = cand;
  else next = { ...best, runsSoFar, scoredAttempts };
  fs.writeFileSync(opath, JSON.stringify(next, null, 2));
  console.log('WROTE gauntlet-outcome.json:', next.secured, next.waves, next.gold, next.tape);
});
