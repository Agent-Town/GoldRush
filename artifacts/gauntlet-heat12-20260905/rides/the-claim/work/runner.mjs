// runner.mjs — spawn gr-sim, drive a controller, log every view, write the outcome file on every exit.
// Usage: node runner.mjs <controllerFile|idle> <tapePath> [scored]
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WS = '/tmp/heat12-038cc280/artifacts/heat12/opus/the-claim';
const REPO = '/private/tmp/heat12-038cc280';
const CONTRACT = 'the-claim';
const SEED = 'e1-the-claim-01';
const WORLD_MODEL = 'sim-import';

const ctrlArg = process.argv[2];
const tapePath = process.argv[3];
const scored = process.argv[4] === 'scored';
const tag = path.basename(tapePath).replace(/\.json$/, '');

let controller = null;
if (ctrlArg !== 'idle') {
  const mod = await import(ctrlArg + '?t=' + Date.now());
  controller = mod.default ?? mod.controller;
}

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tapePath];
if (ctrlArg === 'idle') args.push('--policy=idle');

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });

const viewLog = [];
let outcome = null;
let buf = '';
let stderrBuf = '';
let viewCount = 0;
let state = {};

child.stderr.on('data', (d) => { stderrBuf += d.toString(); });

child.stdout.on('data', (d) => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i);
    buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let obj;
    try { obj = JSON.parse(line); } catch { continue; }
    if (obj.schema === 'goldrush.view.v1') {
      viewCount++;
      viewLog.push(obj);
      if (controller) {
        let out;
        try { out = controller(obj, state, viewCount); } catch (e) {
          console.error('CONTROLLER THREW', e);
          out = null;
        }
        if (out === null || out === undefined) child.stdin.write('\n');
        else child.stdin.write(JSON.stringify(out) + '\n');
      }
    } else if (obj.secured !== undefined || obj.endReason !== undefined) {
      outcome = obj;
    }
  }
});

child.on('exit', (code) => {
  // per-view compact log
  const rows = viewLog.map((v) => {
    const n = v.now || {};
    return {
      t: +(n.timers?.runSeconds ?? 0).toFixed(2),
      w: n.wave,
      gold: n.gold,
      pan: n.score?.goldPanned,
      hp: n.hero?.hp ? +n.hero.hp.toFixed(1) : n.hero?.hp,
      maxHp: n.hero?.maxHp,
      lvl: n.hero?.level,
      alive: n.threats?.alive,
      wrk: n.works?.byKind,
      wrecked: n.works?.wrecked,
      offer: n.pendingOffer ? n.pendingOffer.map((o) => o.id) : undefined,
      secure: n.pendingSecure ? true : undefined,
      fails: (n.orders || []).filter((o) => o.status === 'failed').map((o) => (o.order?.verb || o.verb) + ':' + (o.reason || o.detail || '')),
    };
  });
  fs.writeFileSync(path.join(WS, tag + '.views.json'), JSON.stringify(rows, null, 0));
  fs.writeFileSync(path.join(WS, tag + '.stderr.txt'), stderrBuf.slice(-8000));

  // envelope measurement off the tape
  let env = null;
  try {
    const tp = JSON.parse(fs.readFileSync(tapePath, 'utf8'));
    const entries = tp.inputLog?.entries || [];
    env = {
      durationTicks: tp.inputLog?.durationTicks,
      lastEntryTick: entries.length ? entries[entries.length - 1].tick : null,
      entries: entries.length,
      bytes: fs.statSync(tapePath).size,
      tapeHash: tp.meta?.eventLogHash || tp.eventLogHash,
    };
  } catch { /* no tape */ }

  console.log(JSON.stringify({ tag, code, outcome, env, views: viewCount }, null, 2));

  // ---- INTERMEDIATE-RESULTS LAW: (over)write best-so-far ----
  const outPath = path.join(WS, 'gauntlet-outcome.json');
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(outPath, 'utf8')); } catch { }
  const runsSoFar = (prev?.runsSoFar ?? 0) + 1;
  const scoredAttempts = (prev?.scoredAttempts ?? 0) + (scored ? 1 : 0);
  const better = (a, b) => {
    if (!b) return true;
    if ((a?.secured ? 1 : 0) !== (b?.secured ? 1 : 0)) return (a?.secured ? 1 : 0) > (b?.secured ? 1 : 0);
    if ((a?.waves ?? 0) !== (b?.waves ?? 0)) return (a?.waves ?? 0) > (b?.waves ?? 0);
    if ((a?.gold ?? 0) !== (b?.gold ?? 0)) return (a?.gold ?? 0) > (b?.gold ?? 0);
    return (a?.timeMs ?? 0) > (b?.timeMs ?? 0);
  };
  const prevScore = prev ? { secured: prev.secured, waves: prev.waves, gold: prev.gold, timeMs: prev.timeMs } : null;
  let row;
  if (outcome && better(outcome, prevScore)) {
    row = { ...outcome, tape: tapePath, scored, runsSoFar, scoredAttempts, worldModel: WORLD_MODEL, envelope: env };
  } else if (prev) {
    row = { ...prev, runsSoFar, scoredAttempts };
  } else {
    row = { secured: false, note: 'no outcome line', tape: tapePath, scored, runsSoFar, scoredAttempts, worldModel: WORLD_MODEL };
  }
  fs.writeFileSync(outPath, JSON.stringify(row, null, 2));
});
