// Gold Rush heat-14 runner — spawns gr-sim, drives a controller, logs every view,
// writes gauntlet-outcome.json + envelope axes on every child exit.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WS = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa';
const OUT = path.join(WS, 'artifacts/heat14/opus/e2-incline');
const CONTRACT = 'e2-incline';
const SEED = 'e2-incline-01';

const label = process.argv[2] || 'probe';
const ctrlPath = process.argv[3] || null; // null => --policy idle
const tape = path.join(OUT, `${label}-tape.json`);

let controller = null;
if (ctrlPath) {
  const mod = await import(ctrlPath.startsWith('/') ? ctrlPath : path.join(OUT, ctrlPath));
  controller = mod.default ?? mod.controller;
}

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (!ctrlPath) args.push('--policy', 'idle');

const child = spawn('node', args, { cwd: WS, stdio: ['pipe', 'pipe', 'pipe'] });

const viewLog = [];
let outcome = null;
let buf = '';
let stderrBuf = '';
const t0 = Date.now();

child.stderr.on('data', (d) => { stderrBuf += d.toString(); });

function compact(v) {
  const n = v.now || {};
  return {
    t: n.timers?.runSeconds,
    w: n.wave,
    gold: n.gold,
    pan: n.score?.goldPanned,
    stolen: n.score?.goldStolen,
    hp: n.hero?.hp, maxHp: n.hero?.maxHp,
    hx: n.hero?.x, hz: n.hero?.z,
    px: n.prospector?.x, pz: n.prospector?.z,
    alive: n.threats?.alive, wr: n.threats?.wreckers, th: n.threats?.thieves,
    works: n.works?.standing, wrecked: n.works?.wrecked,
    byKind: n.works?.byKind,
    tiers: (n.works?.entries || []).map((e) => `${e.id}:${e.index}:t${e.tier}${e.wrecked ? 'W' : ''}`).join(','),
    offer: n.pendingOffer ? n.pendingOffer.map((o) => o.id).join('|') : null,
    pendingSecure: n.pendingSecure ? JSON.stringify(n.pendingSecure) : null,
    orders: (n.orders || []).map((o) => `${o.order?.verb || o.verb}:${o.status}${o.reason ? '(' + String(o.reason).slice(0, 40) + ')' : ''}`).join(' '),
    boss: n.boss ? JSON.stringify(n.boss) : undefined,
  };
}

function writeOutcome() {
  const summary = { label, tape, outcome, views: viewLog.length, wallMs: Date.now() - t0 };
  fs.writeFileSync(path.join(OUT, `${label}-summary.json`), JSON.stringify(summary, null, 1));
  fs.writeFileSync(path.join(OUT, `${label}-views.json`), JSON.stringify(viewLog.map(compact), null, 0));
  // envelope
  let env = null;
  try {
    const tp = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const entries = tp.inputLog?.entries || [];
    const lastTick = entries.length ? Math.max(...entries.map((e) => e.t ?? e.tick ?? 0)) : 0;
    env = {
      durationTicks: tp.inputLog?.durationTicks,
      lastEntryTick: lastTick,
      entries: entries.length,
      bytes: fs.statSync(tape).size,
      eventLogHash: tp.outcome?.eventLogHash ?? tp.eventLogHash,
      tapeHash: tp.meta?.eventLogHash,
    };
  } catch (e) { env = { error: String(e) }; }
  summary.envelope = env;
  fs.writeFileSync(path.join(OUT, `${label}-summary.json`), JSON.stringify(summary, null, 1));
  console.log('OUTCOME', JSON.stringify(outcome));
  console.log('ENVELOPE', JSON.stringify(env));
  console.log('VIEWS', viewLog.length, 'wallS', ((Date.now() - t0) / 1000).toFixed(1));
  if (stderrBuf.trim()) console.log('STDERR_TAIL', stderrBuf.slice(-1500));
  return summary;
}

child.stdout.on('data', (chunk) => {
  buf += chunk.toString();
  let idx;
  while ((idx = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, idx); buf = buf.slice(idx + 1);
    if (!line.trim()) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg.schema === 'goldrush.view.v1') {
      viewLog.push(msg);
      if (controller) {
        let reply;
        try { reply = controller(msg, viewLog); } catch (e) { console.log('CTRL_ERR', String(e && e.stack)); reply = '\n'; }
        if (reply === null || reply === undefined || reply === '\n') child.stdin.write('\n');
        else child.stdin.write(JSON.stringify(reply) + '\n');
      }
    } else if (msg.secured !== undefined || msg.endReason !== undefined) {
      outcome = msg;
    }
  }
});

child.on('close', () => { writeOutcome(); });
