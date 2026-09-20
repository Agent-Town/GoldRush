// Gauntlet runner: spawns gr-sim, drives a controller module, logs every view,
// writes gauntlet-outcome.json + envelope axes on every child exit.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WS = '/tmp/heat13-569a41f9/artifacts/heat13/opus/e3-fairground';
const REPO = '/private/tmp/heat13-569a41f9';
const CONTRACT = 'e3-fairground';
const SEED = 'e3-fairground-01';

const label = process.argv[2] || 'probe';
const ctrlName = process.argv[3] || null; // null => --policy idle
const scored = process.argv[4] === 'scored';

const tape = path.join(WS, `${label}-tape.json`);
const logPath = path.join(WS, `${label}-views.jsonl`);
fs.writeFileSync(logPath, '');

let controller = null;
if (ctrlName) {
  const mod = await import(path.join(WS, ctrlName));
  controller = mod.default;
}

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (!ctrlName) args.push('--policy', 'idle');

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
let buf = '';
let outcome = null;
let nView = 0;
let stderr = '';
child.stderr.on('data', (d) => { stderr += d.toString(); });

child.stdout.on('data', (chunk) => {
  buf += chunk.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i);
    buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg.outcome || msg.secured !== undefined) { outcome = msg; continue; }
    if (!msg.now) { continue; }
    nView++;
    fs.appendFileSync(logPath, JSON.stringify(compact(msg)) + '\n');
    if (controller) {
      let reply;
      try { reply = controller(msg, nView); } catch (e) { reply = '[]'; fs.appendFileSync(logPath, JSON.stringify({ ERR: String(e && e.stack) }) + '\n'); }
      if (reply === null || reply === undefined) child.stdin.write('\n');
      else child.stdin.write(JSON.stringify(reply) + '\n');
    }
  }
});

function compact(v) {
  const n = v.now;
  const f = n.fairground || {};
  const fl = (n.fairground && n.fairground.flocks) || {};
  return {
    t: n.timers?.runSeconds, w: n.wave,
    hp: n.hero?.hp, mhp: n.hero?.maxHp, hx: r(n.hero?.x), hz: r(n.hero?.z),
    px: r(n.prospector?.x), pz: r(n.prospector?.z),
    gold: n.gold, pan: n.score?.goldPanned,
    alive: n.threats?.alive, wr: n.threats?.wreckers,
    works: n.works?.byKind, standing: n.works?.standing, wrecked: n.works?.wrecked,
    wheel: f.wheel ? { hp: f.wheel.hp, spin: f.wheel.spinning } : undefined, obj: n.fairground && n.fairground.objective,
    flocks: fl.flocks ? fl.flocks.map(x => `${x.id}:${x.phase}:${x.crossings}:${x.frights}@${r(x.x)},${r(x.z)}`) : undefined,
    allCrossed: fl.allCrossed,
    night: fl.night,
    pendingSecure: !!n.pendingSecure, offer: n.pendingOffer ? n.pendingOffer.map(o => o.id || o) : undefined,
    orders: (n.orders || []).filter(o => o.status === 'failed').map(o => `${o.order?.verb}:${o.reason}`).slice(0, 6),
    seams: (n.seams || []).map(s => `${s.id}:${s.active ? 1 : 0}:${r(s.x)},${r(s.z)}`),
  };
}
function r(x) { return typeof x === 'number' ? Math.round(x * 10) / 10 : x; }

child.on('exit', (code) => {
  const summary = { label, code, outcome, views: nView, scored, stderrTail: stderr.slice(-800) };
  // envelope
  try {
    const t = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const il = t.inputLog || {};
    const entries = il.entries || [];
    const last = entries.length ? entries[entries.length - 1] : null;
    summary.envelope = {
      durationTicks: il.durationTicks,
      lastEntryTick: last ? (last.t ?? last.tick) : null,
      entries: entries.length,
      bytes: fs.statSync(tape).size,
      eventLogHash: t.eventLogHash || t.header?.eventLogHash,
    };
  } catch (e) { summary.envelope = { err: String(e) }; }
  fs.writeFileSync(path.join(WS, `${label}-summary.json`), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
});
