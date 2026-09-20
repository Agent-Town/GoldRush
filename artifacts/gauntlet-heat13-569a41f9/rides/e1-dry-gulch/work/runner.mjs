// Gauntlet runner — heat 13, e1-dry-gulch, generation 81.
// Spawns gr-sim, drives a controller module, logs every view, and writes
// gauntlet-outcome.json + all three envelope axes on every child exit.
// (Notebook: "the runner before the probe" — this arena refuses shell redirection.)
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WS = '/private/tmp/heat13-569a41f9/artifacts/heat13/opus/e1-dry-gulch';
const REPO = '/private/tmp/heat13-569a41f9';
const CONTRACT = 'e1-dry-gulch';
const SEED = 'e1-dry-gulch-01';

const name = process.argv[2] || 'probe-idle';
const ctrlPath = process.argv[3] || null; // null => --policy=idle
const worldModel = 'sim-import';

const tape = path.join(WS, `${name}-tape.json`);
const viewLog = path.join(WS, `${name}-views.jsonl`);
fs.writeFileSync(viewLog, '');

let controller = null;
if (ctrlPath) {
  const mod = await import(ctrlPath.startsWith('/') ? ctrlPath : path.join(WS, ctrlPath));
  controller = mod.default ?? mod.controller;
}

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (!controller) args.push('--policy=idle');

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });

let buf = '';
let outcome = null;
const views = [];
let stderrTail = [];

child.stderr.on('data', (d) => {
  const s = String(d);
  for (const l of s.split('\n')) if (l.trim()) stderrTail.push(l.trim());
  if (stderrTail.length > 60) stderrTail = stderrTail.slice(-60);
});

child.stdout.on('data', (chunk) => {
  buf += String(chunk);
  let nl;
  while ((nl = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, nl);
    buf = buf.slice(nl + 1);
    if (!line.trim()) continue;
    let obj;
    try { obj = JSON.parse(line); } catch { continue; }
    if (obj.schema === 'goldrush.view.v1') {
      views.push(obj);
      fs.appendFileSync(viewLog, JSON.stringify(compact(obj)) + '\n');
      if (controller) {
        let out;
        try { out = controller(obj, views.length - 1, views); }
        catch (e) { console.error('CONTROLLER THREW', e); out = null; }
        if (out === null || out === undefined) child.stdin.write('\n');
        else child.stdin.write(JSON.stringify(out) + '\n');
      }
    } else if (obj.secured !== undefined || obj.waves !== undefined) {
      outcome = obj;
    }
  }
});

function compact(v) {
  const n = v.now || {};
  return {
    t: n.timers?.runSeconds,
    wave: n.wave,
    gold: n.gold,
    pan: n.score?.goldPanned,
    stolen: n.score?.goldStolen,
    hp: n.hero?.hp, maxHp: n.hero?.maxHp,
    hx: n.hero?.x, hz: n.hero?.z,
    px: n.prospector?.x, pz: n.prospector?.z,
    alive: n.threats?.alive, wreck: n.threats?.wreckers, thief: n.threats?.thieves,
    byKind: n.works?.byKind, standing: n.works?.standing, wrecked: n.works?.wrecked,
    tiers: (n.works?.entries || []).map((e) => `${e.id}:${e.index}:t${e.tier}${e.wrecked ? 'W' : ''}`),
    seams: (n.seams || []).map((s) => `${s.id}@${s.anchorIndex}${s.active ? '' : '!'}:${s.x},${s.z}:${s.remaining}`),
    offer: (n.pendingOffer || []).map((o) => o.id),
    pendingSecure: n.pendingSecure ? true : undefined,
    orderFails: (n.orders || []).filter((o) => o.status === 'failed').map((o) => `${o.order?.verb}:${(o.reason || '').slice(0, 46)}`),
    ordersActive: (n.orders || []).filter((o) => o.status === 'active').map((o) => o.order?.verb),
  };
}

child.on('exit', (code) => {
  const summary = { name, code, outcome, views: views.length, stderrTail: stderrTail.slice(-8) };
  // envelope axes, read off the tape that exists
  try {
    const t = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const entries = t.inputLog?.entries || [];
    const lastEntryTick = entries.length ? Math.max(...entries.map((e) => e.t ?? e.tick ?? 0)) : 0;
    summary.envelope = {
      durationTicks: t.inputLog?.durationTicks,
      lastEntryTick,
      entries: entries.length,
      bytes: fs.statSync(tape).size,
      tapeHash: t.eventLogHash ?? t.meta?.eventLogHash,
    };
  } catch (e) { summary.envelope = { error: e.message }; }
  fs.writeFileSync(path.join(WS, `${name}-summary.json`), JSON.stringify(summary, null, 1));
  console.log(JSON.stringify(summary, null, 1));

  // INTERMEDIATE-RESULTS LAW: promote into gauntlet-outcome.json if this is best-so-far.
  const outPath = path.join(WS, 'gauntlet-outcome.json');
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(outPath, 'utf8')); } catch { }
  const runsSoFar = (prev?.runsSoFar ?? 0) + 1;
  const scoredAttempts = (prev?.scoredAttempts ?? 0) + (name.startsWith('attempt') ? 1 : 0);
  const better = (a, b) => {
    if (!b) return true;
    if (!!a?.secured !== !!b.secured) return !!a?.secured;
    if ((a?.waves ?? 0) !== (b.waves ?? 0)) return (a?.waves ?? 0) > (b.waves ?? 0);
    if ((a?.gold ?? 0) !== (b.gold ?? 0)) return (a?.gold ?? 0) > (b.gold ?? 0);
    return (a?.timeMs ?? 0) >= (b.timeMs ?? 0);
  };
  const takeNew = outcome && better(outcome, prev?.outcome);
  const row = takeNew
    ? { ...outcome, outcome, tape, scored: name.startsWith('attempt'), worldModel }
    : { ...(prev || {}), };
  row.runsSoFar = runsSoFar;
  row.scoredAttempts = scoredAttempts;
  row.worldModel = worldModel;
  if (takeNew) { row.tape = tape; row.scored = name.startsWith('attempt'); row.envelope = summary.envelope; }
  fs.writeFileSync(outPath, JSON.stringify(row, null, 1));
});
