// Runner: spawn gr-sim, drive a controller, log every view, write gauntlet-outcome.json on exit.
// Intermediate-results law: a truthful row exists on disk from the first run onward.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DIR = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa/artifacts/heat14/opus/e8-eclipse';
const REPO = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa';
const CONTRACT = 'e8-eclipse';
const SEED = 'e8-eclipse-01';

const label = process.argv[2] || 'probe';
const ctrlPath = process.argv[3] || null;   // null => --policy idle
const tape = path.join(DIR, `${label}-tape.json`);

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (!ctrlPath) args.push('--policy', 'idle');

let ctrl = null;
if (ctrlPath) {
  const mod = await import(ctrlPath);
  ctrl = mod.makeController();
}

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });

const views = [];
const rows = [];
let outcome = null;
let buf = '';
let stderrBuf = '';

child.stderr.on('data', d => { stderrBuf += d.toString(); });

function compact(v) {
  const n = v.now || {};
  const air = n.air || {};
  const reg = air.regolith || {};
  const ecl = air.eclipse || {};
  const sc = n.score || {};
  const th = n.threats || {};
  const w = n.works || {};
  return {
    t: +(n.timers?.runSeconds ?? 0).toFixed(1),
    wave: n.wave,
    gold: n.gold,
    pan: sc.goldPanned,
    stole: sc.goldStolen,
    hp: n.hero ? +(n.hero.hp).toFixed(1) : null,
    mx: n.hero?.maxHp,
    hx: n.hero ? +(n.hero.x).toFixed(1) : null,
    hz: n.hero ? +(n.hero.z).toFixed(1) : null,
    px: n.prospector ? +(n.prospector.x).toFixed(1) : null,
    pz: n.prospector ? +(n.prospector.z).toFixed(1) : null,
    alive: th.alive, wr: th.wreckers, thv: th.thieves,
    stand: w.standing, wreck: w.wrecked,
    kinds: w.byKind ? JSON.stringify(w.byKind) : null,
    suit: air.suit ? +(air.suit.seconds).toFixed(1) : null,
    inDome: air.suit ? air.suit.inDome : null,
    body: air.suit ? air.suit.body : null,
    worked: reg.worked ? (Array.isArray(reg.worked) ? reg.worked.length : reg.worked) : null,
    req: reg.required,
    win: reg.window,
    cw: reg.creditedThisWindow,
    bp: reg.breathlessPans,
    done: reg.complete,
    eclArr: ecl.arrived, eclAt: ecl.arrivedAtWave, eclAfter: ecl.groundsWorkedAfter, eclReq: ecl.requiredAfter,
    off: n.pendingOffer ? n.pendingOffer.map(o => o.id).join(',') : null,
    sec: n.pendingSecure ? 1 : 0,
    seams: (n.seams || []).map(s => `${s.id}@${s.anchorIndex}${s.active ? '' : 'X'}`).join(' '),
  };
}

function writeOutcome() {
  let env = null;
  try {
    const tp = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const ents = tp.inputLog?.entries || [];
    env = {
      durationTicks: tp.inputLog?.durationTicks,
      lastEntryTick: ents.length ? ents[ents.length - 1].t : null,
      entries: ents.length,
      bytes: fs.statSync(tape).size,
      defaultedSecure: tp.outcome?.defaultedSecure,
      defaultedPicks: tp.outcome?.defaultedPicks,
      tapeHash: tp.meta?.eventLogHash || tp.eventLogHash,
    };
  } catch (e) { env = { error: String(e.message) }; }

  fs.writeFileSync(path.join(DIR, `${label}-summary.json`), JSON.stringify({ outcome, envelope: env, rows }, null, 1));

  // promote into gauntlet-outcome.json if best so far
  const gp = path.join(DIR, 'gauntlet-outcome.json');
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(gp, 'utf8')); } catch {}
  const runsSoFar = (prev?.runsSoFar || 0) + 1;
  const scoredAttempts = (prev?.scoredAttempts || 0) + (label.startsWith('attempt') ? 1 : 0);
  const better = !prev || !prev.secured
    ? true
    : (outcome?.secured && (outcome.waves > (prev.waves || 0) ||
       (outcome.waves === prev.waves && (outcome.gold || 0) >= (prev.gold || 0))));
  const base = better && outcome ? { ...outcome, tape, scored: label.startsWith('attempt') } : {
    ...prev, tape: prev?.tape, scored: prev?.scored,
  };
  fs.writeFileSync(gp, JSON.stringify({
    ...base, runsSoFar, scoredAttempts,
    worldModel: 'sim-import',
    envelope: better ? env : prev?.envelope,
  }, null, 1));
  console.log('OUTCOME', JSON.stringify(outcome));
  console.log('ENVELOPE', JSON.stringify(env));
}

child.stdout.on('data', d => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i); buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let obj;
    try { obj = JSON.parse(line); } catch { continue; }
    if (obj.schema === 'goldrush.view.v1') {
      views.push(obj);
      rows.push(compact(obj));
      if (ctrl) {
        const out = ctrl.respond(obj);
        child.stdin.write(out === null ? '\n' : JSON.stringify(out) + '\n');
      }
    } else if (obj.secured !== undefined || obj.endReason !== undefined) {
      outcome = obj;
    }
  }
});

child.on('exit', (code) => {
  fs.writeFileSync(path.join(DIR, `${label}-views.json`), JSON.stringify(views.slice(0, 3), null, 1));
  fs.writeFileSync(path.join(DIR, `${label}-rows.json`), JSON.stringify(rows, null, 1));
  fs.writeFileSync(path.join(DIR, `${label}-stderr.txt`), stderrBuf.slice(-4000));
  writeOutcome();
  console.log('EXIT', code, 'views', views.length);
  // print a compact table tail
  const keys = ['t','wave','gold','pan','hp','hx','hz','px','pz','alive','stand','wreck','suit','inDome','worked','cw','bp','done','eclArr'];
  console.log(keys.join('\t'));
  for (const r of rows) console.log(keys.map(k => r[k]).join('\t'));
});
