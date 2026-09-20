// Gen 125 runner: spawn gr-sim, drive a controller, log every view, write outcome on exit.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WS = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa/artifacts/heat14/opus/e2-trestle';
const REPO = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa';
const CONTRACT = 'e2-trestle';
const SEED = 'e2-trestle-01';

const label = process.argv[2] || 'probe';
const ctrlPath = process.argv[3] || null;   // null => --policy idle
const tape = path.join(WS, `${label}-tape.json`);

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--difficulty', 'trail', '--tape', tape];
if (!ctrlPath) args.push('--policy', 'idle');

let controller = null;
if (ctrlPath) {
  const mod = await import(ctrlPath.startsWith('/') ? ctrlPath : path.join(WS, ctrlPath));
  controller = mod.default ?? mod.controller;
}

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
const views = [];
const rows = [];
let outcome = null;
let buf = '';
let stderrBuf = '';

child.stderr.on('data', d => { stderrBuf += d.toString(); });

function row(now, v) {
  const s = now.score || {};
  const w = now.works || {};
  return {
    t: +(((now.timers?.runSeconds ?? now.timers?.simTimeSeconds ?? 0)) || 0).toFixed(2),
    wave: now.wave,
    gold: now.gold,
    pan: s.goldPanned, stolen: s.goldStolen, kills: s.kills,
    hp: now.hero ? +(now.hero.hp).toFixed(1) : null,
    maxHp: now.hero?.maxHp,
    hx: now.hero ? +now.hero.x.toFixed(1) : null,
    hz: now.hero ? +now.hero.z.toFixed(1) : null,
    alive: now.threats?.alive, wr: now.threats?.wreckers, th: now.threats?.thieves,
    standing: w.standing, wrecked: w.wrecked,
    byKind: w.byKind,
    tiers: (w.entries || []).filter(e => (e.tier ?? 1) > 1).length,
  };
}

function writeOutcome() {
  const envelope = tapeEnvelope();
  const best = {
    ...(outcome || {}),
    tape,
    scored: label.startsWith('attempt'),
    runsSoFar: readRuns() + 1,
    scoredAttempts: readScored() + (label.startsWith('attempt') ? 1 : 0),
    worldModel: 'sim-import',
    envelope,
    label,
  };
  fs.writeFileSync(path.join(WS, `${label}-summary.json`), JSON.stringify({ outcome, envelope, rows }, null, 1));
  fs.writeFileSync(path.join(WS, `${label}-rows.json`), JSON.stringify(rows, null, 0));
  // best-so-far promotion
  const outPath = path.join(WS, 'gauntlet-outcome.json');
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(outPath, 'utf8')); } catch {}
  const better = !prev || (best.secured && !prev.secured) ||
    (!!best.secured === !!prev.secured && ((best.waves ?? 0) > (prev.waves ?? 0) ||
      ((best.waves ?? 0) === (prev.waves ?? 0) && (best.timeMs ?? 0) > (prev.timeMs ?? 0))));
  const merged = better ? best : { ...prev, runsSoFar: best.runsSoFar, scoredAttempts: best.scoredAttempts };
  fs.writeFileSync(outPath, JSON.stringify(merged, null, 1));
  console.log('OUTCOME', JSON.stringify(outcome));
  console.log('ENVELOPE', JSON.stringify(envelope));
}
function readRuns() { try { return JSON.parse(fs.readFileSync(path.join(WS, 'gauntlet-outcome.json'), 'utf8')).runsSoFar || 0; } catch { return 0; } }
function readScored() { try { return JSON.parse(fs.readFileSync(path.join(WS, 'gauntlet-outcome.json'), 'utf8')).scoredAttempts || 0; } catch { return 0; } }

function tapeEnvelope() {
  try {
    const t = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const il = t.inputLog || {};
    const entries = il.entries || [];
    const lastEntryTick = entries.length ? Math.max(...entries.map(e => e.t ?? e.tick ?? 0)) : 0;
    const bytes = fs.statSync(tape).size;
    return { durationTicks: il.durationTicks, lastEntryTick, entries: entries.length, bytes };
  } catch (e) { return { err: e.message }; }
}

child.stdout.on('data', chunk => {
  buf += chunk.toString();
  let idx;
  while ((idx = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, idx); buf = buf.slice(idx + 1);
    if (!line.trim()) continue;
    let msg; try { msg = JSON.parse(line); } catch { continue; }
    if (msg.schema === 'goldrush.view.v1') {
      views.push(msg);
      if (msg.now) rows.push(row(msg.now, msg));
      if (controller) {
        let reply;
        try { reply = controller(msg, views.length - 1); }
        catch (e) { console.error('CTRL ERR', e.stack); reply = ''; }
        if (reply === null || reply === undefined || reply === '') child.stdin.write('\n');
        else child.stdin.write(JSON.stringify(reply) + '\n');
      }
    } else if (msg.secured !== undefined || msg.endReason !== undefined) {
      outcome = msg;
    }
  }
});

child.on('exit', code => {
  writeOutcome();
  const tail = stderrBuf.split('\n').filter(l => l.trim()).slice(-6).join('\n');
  if (tail) console.log('STDERR TAIL:\n' + tail);
  console.log('ROWS', rows.length);
  process.exit(0);
});
