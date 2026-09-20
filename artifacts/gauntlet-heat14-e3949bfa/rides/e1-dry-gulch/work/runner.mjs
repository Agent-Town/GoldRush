#!/usr/bin/env node
// Gauntlet runner: spawns gr-sim, drives a controller module, logs every view,
// writes gauntlet-outcome.json + envelope axes on every child exit.
// Usage: node runner.mjs <controllerPath|idle> <tapeName> [--label X]
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../../../..');
const CONTRACT = 'e1-dry-gulch';
const SEED = 'e1-dry-gulch-01';

const ctrlArg = process.argv[2] || 'idle';
const tapeName = process.argv[3] || 'probe-idle.json';
const tapePath = path.join(HERE, tapeName);
const logPath = tapePath.replace(/\.json$/, '-views.jsonl');
const sumPath = tapePath.replace(/\.json$/, '-summary.json');

let controller = null;
if (ctrlArg !== 'idle') {
  controller = (await import(path.resolve(HERE, ctrlArg))).default;
}

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED,
  '--difficulty', 'trail', '--tape', tapePath];
if (ctrlArg === 'idle') args.push('--policy=idle');

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });

const viewLog = fs.createWriteStream(logPath);
let buf = '';
let outcome = null;
const rows = [];
let viewN = 0;
let ctrlErr = null;

child.stdout.on('data', (d) => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i); buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg.schema === 'goldrush.view.v1') {
      viewN++;
      viewLog.write(JSON.stringify({ n: viewN, view: msg }) + '\n');
      const n = msg.now || {};
      rows.push({
        n: viewN, t: +(n.timers?.runSeconds ?? 0).toFixed(2), w: n.wave,
        gold: n.gold, pan: n.score?.goldPanned, stolen: n.score?.goldStolen,
        hp: n.hero?.hp != null ? +n.hero.hp.toFixed(1) : null, mhp: n.hero?.maxHp,
        hx: n.hero?.x != null ? +n.hero.x.toFixed(1) : null,
        hz: n.hero?.z != null ? +n.hero.z.toFixed(1) : null,
        alive: n.threats?.alive, wr: n.threats?.wreckers, th: n.threats?.thieves,
        stand: n.works?.standing, wrk: n.works?.wrecked,
        kinds: n.works?.byKind, offer: n.pendingOffer ? n.pendingOffer.length : 0,
        sec: n.pendingSecure ? 1 : 0,
      });
      if (controller) {
        let reply;
        try { reply = controller(msg, viewN); }
        catch (e) { ctrlErr = String(e && e.stack || e); reply = '\n'; }
        if (reply === null || reply === undefined) reply = '\n';
        const text = typeof reply === 'string' ? reply : JSON.stringify(reply) + '\n';
        child.stdin.write(text.endsWith('\n') ? text : text + '\n');
      }
    } else if (msg.secured !== undefined || msg.endReason !== undefined) {
      outcome = msg;
    }
  }
});

let stderrTail = [];
child.stderr.on('data', (d) => {
  const s = d.toString();
  for (const l of s.split('\n')) if (l.trim()) { stderrTail.push(l); if (stderrTail.length > 60) stderrTail.shift(); }
});

child.on('exit', (code) => {
  viewLog.end();
  // envelope
  let env = {};
  try {
    const tape = JSON.parse(fs.readFileSync(tapePath, 'utf8'));
    const il = tape.inputLog || {};
    const entries = il.entries || [];
    const lastT = entries.length ? entries[entries.length - 1].t : null;
    env = {
      durationTicks: il.durationTicks,
      lastEntryTick: lastT,
      entries: entries.length,
      bytes: fs.statSync(tapePath).size,
      eventLogHash: tape.outcome?.eventLogHash || tape.meta?.eventLogHash || null,
    };
  } catch (e) { env = { error: String(e.message) }; }

  const summary = { label: tapeName, code, outcome, envelope: env, views: viewN, ctrlErr, stderrTail: stderrTail.slice(-12) };
  fs.writeFileSync(sumPath, JSON.stringify(summary, null, 1));

  // compact table
  const tbl = rows.map(r => `${String(r.n).padStart(3)} t=${String(r.t).padStart(6)} w${String(r.w).padStart(2)} g=${String(r.gold).padStart(4)} pan=${String(r.pan).padStart(5)} hp=${String(r.hp).padStart(5)}/${r.mhp} hero=(${r.hx},${r.hz}) alv=${String(r.alive).padStart(2)} wr=${r.wr} th=${r.th} st=${r.stand} wk=${r.wrk} ${JSON.stringify(r.kinds || {})}${r.offer ? ' OFFER' : ''}${r.sec ? ' SECURE' : ''}`).join('\n');
  fs.writeFileSync(tapePath.replace(/\.json$/, '-table.txt'), tbl);

  console.log(JSON.stringify({ code, outcome, envelope: env, views: viewN, ctrlErr }, null, 1));
  console.log('--- last rows ---');
  console.log(rows.slice(-6).map(r => JSON.stringify(r)).join('\n'));
  if (ctrlErr) console.log('CTRL ERROR: ' + ctrlErr);
  if (stderrTail.length) console.log('--- stderr tail ---\n' + stderrTail.slice(-8).join('\n'));
});
