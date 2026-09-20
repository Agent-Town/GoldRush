#!/usr/bin/env node
// Gen-131 runner: spawn gr-sim, drive a controller, log every view, write outcome + envelope on exit.
// Shell here refuses redirection/compound cd (16 heats running), so the runner IS the harness.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WS = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa/artifacts/heat14/opus/e5-stillwater';
const REPO = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa';
const CONTRACT = 'e5-stillwater';
const SEED = 'e5-stillwater-01';

const label = process.argv[2] || 'probe';
const ctrlPath = process.argv[3] || null;   // controller module, or null for --policy idle
const tape = path.join(WS, `${label}-tape.json`);
const viewLog = path.join(WS, `${label}-views.jsonl`);

let controller = null;
if (ctrlPath) {
  const mod = await import(path.isAbsolute(ctrlPath) ? ctrlPath : path.join(WS, ctrlPath));
  controller = mod.default ?? mod.controller;
}

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (!controller) args.push('--policy', 'idle');

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
fs.writeFileSync(viewLog, '');

let buf = '';
let outcome = null;
const rows = [];
let nViews = 0;
const state = {};

child.stdout.on('data', (d) => {
  buf += d.toString();
  let nl;
  while ((nl = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, nl).trim();
    buf = buf.slice(nl + 1);
    if (!line) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg.schema === 'goldrush.view.v1') {
      nViews++;
      fs.appendFileSync(viewLog, JSON.stringify(msg) + '\n');
      const n = msg.now || {};
      const dw = n.deepwater || {};
      const nh = dw.noiseHunt || {};
      rows.push({
        v: nViews, t: +(((n.timers?.runSeconds) ?? (msg.appendLog?.at?.(-1)?.atMs ?? 0) / 1000)).toFixed(1),
        w: n.wave, g: n.gold, pan: n.score?.goldPanned, stol: n.score?.goldStolen,
        hp: n.hero?.hp != null ? +n.hero.hp.toFixed(0) : null, mx: n.hero?.maxHp,
        hx: n.hero?.x != null ? +n.hero.x.toFixed(1) : null, hz: n.hero?.z != null ? +n.hero.z.toFixed(1) : null,
        al: n.threats?.alive, anchor: dw.anchor,
        trail: nh.trail?.target ?? null, strikes: nh.trail?.strikes ?? null,
        decks: (nh.decks || []).map(d => `${d.padId}:${d.integrity}`).join(','),
        fires: dw.arsenal?.fires?.harpoonBallista ?? null,
        sec: n.pendingSecure ? 1 : 0,
      });
      if (controller) {
        let orders;
        try { orders = controller(msg, state); } catch (e) { orders = { line: '\n', note: 'ctrl-throw ' + e.message }; }
        const out = typeof orders === 'string' ? orders : (orders.line ?? JSON.stringify(orders.orders ?? orders) + '\n');
        child.stdin.write(out);
      }
    } else if (msg.secured !== undefined || msg.endReason !== undefined) {
      outcome = msg;
    }
  }
});

let stderrBuf = '';
child.stderr.on('data', (d) => { stderrBuf += d.toString(); });

child.on('close', (code) => {
  // envelope: all three axes, measured from the tape + the contract's own envelope function
  let env = null;
  try {
    const tp = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const entries = tp.inputLog?.entries ?? [];
    const lastTick = entries.length ? Math.max(...entries.map(e => e.t ?? e.tick ?? 0)) : 0;
    env = {
      durationTicks: tp.inputLog?.durationTicks ?? null,
      lastEntryTick: lastTick,
      entries: entries.length,
      bytes: fs.statSync(tape).size,
    };
  } catch (e) { env = { error: e.message }; }

  const summary = { label, outcome, env, views: nViews, stderrTail: stderrBuf.slice(-800) };
  fs.writeFileSync(path.join(WS, `${label}-summary.json`), JSON.stringify(summary, null, 2));
  fs.writeFileSync(path.join(WS, `${label}-rows.json`), JSON.stringify(rows, null, 2));

  console.log('=== ' + label + ' rc=' + code + ' ===');
  console.log('OUTCOME', JSON.stringify(outcome));
  console.log('ENVELOPE', JSON.stringify(env));
  const show = rows.length > 26 ? [...rows.slice(0, 13), { v: '...' }, ...rows.slice(-13)] : rows;
  for (const r of show) console.log(JSON.stringify(r));
  if (stderrBuf.trim()) console.log('STDERR_TAIL', stderrBuf.slice(-500));
});
