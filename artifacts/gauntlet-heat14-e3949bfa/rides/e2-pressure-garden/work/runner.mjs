#!/usr/bin/env node
// Gen 101 runner: spawn gr-sim, drive a controller, log every view, write
// gauntlet-outcome.json + all three envelope axes on EVERY child exit.
// Shell redirection is refused in this arena; the runner is the only way the
// intermediate-results law gets satisfied automatically.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const WS = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa/artifacts/heat14/opus/e2-pressure-garden';
const REPO = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa';
const CONTRACT = 'e2-pressure-garden';
const SEED = 'e2-pressure-garden-01';

const label = process.argv[2] || 'probe';
const ctrlPath = process.argv[3] || null;   // null => --policy idle
const tape = path.join(WS, `${label}-tape.json`);

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (!ctrlPath) args.push('--policy', 'idle');

let controller = null;
if (ctrlPath) {
  const mod = await import(path.isAbsolute(ctrlPath) ? ctrlPath : path.join(WS, ctrlPath));
  controller = mod.default ?? mod.makeController();
}

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
const rl = readline.createInterface({ input: child.stdout });

const views = [];
const rows = [];
let outcome = null;
let stablePrefixSaved = false;
let stderrBuf = '';
child.stderr.on('data', d => { stderrBuf += d.toString(); });

function compactRow(v) {
  const n = v.now || {};
  const w = n.works || {};
  return {
    t: +(((n.timers?.runSeconds ?? n.timers?.simTimeSeconds ?? 0)) || 0).toFixed(2),
    wave: n.wave,
    gold: n.gold,
    pan: n.score?.goldPanned,
    stolen: n.score?.goldStolen,
    hp: n.hero ? +(n.hero.hp).toFixed(1) : null,
    maxHp: n.hero?.maxHp,
    hx: n.hero ? +(n.hero.x ?? 0).toFixed(1) : null,
    hz: n.hero ? +(n.hero.z ?? 0).toFixed(1) : null,
    alive: n.threats?.alive,
    wreckers: n.threats?.wreckers,
    thieves: n.threats?.thieves,
    standing: w.standing,
    wrecked: w.wrecked,
    byKind: w.byKind,
    tiers: (w.entries || []).map(e => `${e.id}:${e.index}:t${e.tier}${e.wrecked ? 'W' : ''}`).join(','),
    pendSecure: !!n.pendingSecure,
    offer: n.pendingOffer ? n.pendingOffer.map(o => o.id).join('|') : null,
    fails: (n.orders || []).filter(o => o.status === 'failed').map(o => `${o.order?.verb}:${o.reason || ''}`.slice(0, 60)).slice(0, 4),
  };
}

function envelope() {
  try {
    const t = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const il = t.inputLog || {};
    const entries = il.entries || [];
    const last = entries.length ? Math.max(...entries.map(e => e.t ?? e.tick ?? 0)) : 0;
    return {
      durationTicks: il.durationTicks,
      lastEntryTick: last,
      entries: entries.length,
      bytes: fs.statSync(tape).size,
      eventLogHash: t.eventLogHash ?? t.meta?.eventLogHash ?? null,
    };
  } catch (e) { return { error: String(e).slice(0, 120) }; }
}

function writeOut() {
  const env = envelope();
  const summary = { label, outcome, envelope: env, views: views.length };
  fs.writeFileSync(path.join(WS, `${label}-summary.json`), JSON.stringify(summary, null, 2));
  fs.writeFileSync(path.join(WS, `${label}-rows.json`), JSON.stringify(rows, null, 1));
  // best-so-far promotion
  const outFile = path.join(WS, 'gauntlet-outcome.json');
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(outFile, 'utf8')); } catch {}
  const better = !prev
    || (outcome?.secured && !prev.secured)
    || (outcome?.secured === prev.secured && (outcome?.waves ?? -1) > (prev.waves ?? -1))
    || (outcome?.secured === prev.secured && (outcome?.waves ?? -1) === (prev.waves ?? -1) && (outcome?.gold ?? -1) > (prev.gold ?? -1));
  if (better && outcome) {
    fs.writeFileSync(outFile, JSON.stringify({
      ...outcome,
      tape,
      scored: /^attempt/.test(label),
      runsSoFar: (prev?.runsSoFar ?? 0) + 1,
      scoredAttempts: (prev?.scoredAttempts ?? 0) + (/^attempt/.test(label) ? 1 : 0),
      worldModel: 'sim-import',
      envelope: env,
    }, null, 2));
  } else if (prev) {
    prev.runsSoFar = (prev.runsSoFar ?? 0) + 1;
    prev.scoredAttempts = (prev.scoredAttempts ?? 0) + (/^attempt/.test(label) ? 1 : 0);
    fs.writeFileSync(outFile, JSON.stringify(prev, null, 2));
  }
  console.log('OUTCOME', JSON.stringify(outcome));
  console.log('ENVELOPE', JSON.stringify(env));
}

rl.on('line', line => {
  const s = line.trim();
  if (!s) return;
  let obj;
  try { obj = JSON.parse(s); } catch { return; }
  if (obj.schema === 'goldrush.view.v1') {
    views.push(obj);
    if (!stablePrefixSaved) {
      fs.writeFileSync(path.join(WS, `${label}-prefix.json`), JSON.stringify(obj.stablePrefix, null, 1));
      fs.writeFileSync(path.join(WS, `${label}-view0.json`), JSON.stringify(obj, null, 1));
      stablePrefixSaved = true;
    }
    rows.push(compactRow(obj));
    if (controller) {
      const out = controller(obj, views.length - 1);
      child.stdin.write(out === null ? '\n' : JSON.stringify(out) + '\n');
    }
  } else if (obj.secured !== undefined || obj.waves !== undefined) {
    outcome = obj;
  }
});

child.on('exit', code => {
  fs.writeFileSync(path.join(WS, `${label}-stderr.txt`), stderrBuf.slice(-20000));
  writeOut();
  process.exit(0);
});
