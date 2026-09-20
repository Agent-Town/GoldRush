// Gold Rush heat-14 runner — gen 121, e10-last-claim.
// Spawns gr-sim, drives a controller module, logs every view to JSONL,
// writes gauntlet-outcome.json + all three envelope axes on EVERY child exit.
// (Shell redirection and compound `cd` are refused in this arena; timeout(1) is not on macOS.)
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DIR = path.dirname(new URL(import.meta.url).pathname);
const REPO = path.resolve(DIR, '../../../..');
const CONTRACT = 'e10-last-claim';
const SEED = 'gold-rush';

const label = process.argv[2] || 'probe';
const ctrlPath = process.argv[3] || null;   // null => --policy=idle
const tapePath = path.join(DIR, `${label}-tape.json`);
const logPath = path.join(DIR, `${label}-views.jsonl`);
const sumPath = path.join(DIR, `${label}-summary.json`);
const OUTCOME = path.join(DIR, 'gauntlet-outcome.json');

const WORLD_MODEL = 'sim-import';

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tapePath];
if (!ctrlPath) args.push('--policy=idle');

let controller = null;
if (ctrlPath) {
  const mod = await import(path.join(DIR, ctrlPath));
  controller = mod.default ?? mod.controller;
}

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
const logFd = fs.openSync(logPath, 'w');
let stdoutBuf = '';
let stderrTail = [];
let views = 0;
let outcomeLine = null;
const rows = [];

function compactRow(v) {
  const n = v.now || {};
  return {
    i: views,
    t: +(n.timers?.runSeconds ?? 0).toFixed(2),
    w: n.wave,
    gold: n.gold,
    pan: n.score?.goldPanned,
    stolen: n.score?.goldStolen,
    hp: n.hero?.hp != null ? +n.hero.hp.toFixed(1) : null,
    mhp: n.hero?.maxHp,
    hx: n.hero?.x != null ? +n.hero.x.toFixed(1) : null,
    hz: n.hero?.z != null ? +n.hero.z.toFixed(1) : null,
    pvhp: n.preserve?.hp != null ? +n.preserve.hp.toFixed(1) : null,
    pvalive: n.preserve?.alive,
    alive: n.threats?.alive,
    wr: n.threats?.wreckers,
    th: n.threats?.thieves,
    stand: n.works?.standing,
    wrecked: n.works?.wrecked,
    byKind: n.works?.byKind,
    offer: n.pendingOffer ? n.pendingOffer.map(o => o.id) : null,
    psec: n.pendingSecure ? true : undefined,
    fails: (n.orders || []).filter(o => o.status === 'failed').map(o => `${o.order?.verb}:${o.reason || ''}`).slice(0, 6),
  };
}

child.stdout.on('data', (chunk) => {
  stdoutBuf += chunk.toString();
  let idx;
  while ((idx = stdoutBuf.indexOf('\n')) >= 0) {
    const line = stdoutBuf.slice(0, idx);
    stdoutBuf = stdoutBuf.slice(idx + 1);
    if (!line.trim()) continue;
    let obj;
    try { obj = JSON.parse(line); } catch { continue; }
    if (obj.schema === 'goldrush.view.v1') {
      views++;
      fs.writeSync(logFd, line + '\n');
      const row = compactRow(obj);
      rows.push(row);
      if (controller) {
        let reply;
        try { reply = controller(obj, row); } catch (e) { reply = null; console.error('CTRL THREW', e); }
        // reply === null/undefined => blank line (records no tape entry, cannot be rejected)
        child.stdin.write(reply == null ? '\n' : JSON.stringify(reply) + '\n');
      }
    } else if (obj.secured !== undefined || obj.waves !== undefined) {
      outcomeLine = obj;
    }
  }
});

child.stderr.on('data', (c) => {
  const s = c.toString();
  for (const l of s.split('\n')) if (l.trim()) { stderrTail.push(l); if (stderrTail.length > 40) stderrTail.shift(); }
});

function envelope() {
  try {
    const tape = JSON.parse(fs.readFileSync(tapePath, 'utf8'));
    const il = tape.inputLog || {};
    const entries = il.entries || [];
    const bytes = fs.statSync(tapePath).size;
    const lastTick = entries.length ? Math.max(...entries.map(e => e.t ?? e.tick ?? 0)) : 0;
    return {
      durationTicks: il.durationTicks,
      lastEntryTick: lastTick,
      entries: entries.length,
      bytes,
      tapeHash: tape.eventLogHash ?? tape.meta?.eventLogHash ?? null,
      defaultedSecure: outcomeLine?.defaultedSecure,
      defaultedPicks: outcomeLine?.defaultedPicks,
    };
  } catch (e) { return { error: String(e) }; }
}

child.on('exit', (code) => {
  fs.closeSync(logFd);
  const env = envelope();
  const summary = { label, rc: code, outcome: outcomeLine, envelope: env, views, tape: tapePath, stderrTail: stderrTail.slice(-12) };
  fs.writeFileSync(sumPath, JSON.stringify(summary, null, 1));
  fs.writeFileSync(path.join(DIR, `${label}-rows.json`), JSON.stringify(rows, null, 0));

  // INTERMEDIATE-RESULTS LAW: (over)write best-so-far after EVERY run, including failures.
  let best = null;
  try { best = JSON.parse(fs.readFileSync(OUTCOME, 'utf8')); } catch {}
  const runsSoFar = (best?.runsSoFar ?? 0) + 1;
  const scored = /^attempt-/.test(label);
  const scoredAttempts = (best?.scoredAttempts ?? 0) + (scored ? 1 : 0);
  const cur = outcomeLine || { secured: false, waves: 0, timeMs: 0, gold: 0, calls: 0 };
  // Rank: secured first, then waves, then preserve hp is not in the outcome line, then timeMs.
  const better = !best || (!!cur.secured !== !!best.secured ? !!cur.secured
    : (cur.waves ?? 0) !== (best.waves ?? 0) ? (cur.waves ?? 0) > (best.waves ?? 0)
    : (cur.timeMs ?? 0) >= (best.timeMs ?? 0));
  const row = better
    ? { ...cur, tape: tapePath, scored, worldModel: WORLD_MODEL }
    : { ...best };
  row.runsSoFar = runsSoFar;
  row.scoredAttempts = scoredAttempts;
  row.worldModel = WORLD_MODEL;
  row.envelope = better ? env : best?.envelope;
  fs.writeFileSync(OUTCOME, JSON.stringify(row, null, 1));

  console.log(JSON.stringify({ label, rc: code, outcome: outcomeLine, envelope: env, views }, null, 1));
  const tail = rows.slice(-4);
  console.log('LAST ROWS', JSON.stringify(tail));
});
