#!/usr/bin/env node
// Runner: spawns gr-sim, drives a controller module, logs every view, writes
// gauntlet-outcome.json on EVERY child exit (intermediate-results law).
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WS = '/private/tmp/heat13-569a41f9/artifacts/heat13/opus/e5-stillwater';
const REPO = '/private/tmp/heat13-569a41f9';
const CONTRACT = 'e5-stillwater';
const SEED = 'e5-stillwater-01';
const WORLD_MODEL = 'sim-import';

const label = process.argv[2] || 'probe-idle';
const ctrlPath = process.argv[3] || null; // null => --policy idle

const tapePath = path.join(WS, `${label}-tape.json`);
const logPath = path.join(WS, `${label}-views.jsonl`);

let controller = null;
if (ctrlPath) {
  const mod = await import(`file://${path.resolve(ctrlPath)}?v=${Date.now()}`);
  controller = mod.default || mod.controller;
}

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tapePath];
if (!ctrlPath) args.push('--policy', 'idle');

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });

const logFd = fs.openSync(logPath, 'w');
let buf = '';
let lastOutcome = null;
let viewCount = 0;
let state = {};
let submissions = 0;

child.stdout.on('data', (chunk) => {
  buf += chunk.toString();
  let idx;
  while ((idx = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, idx);
    buf = buf.slice(idx + 1);
    if (!line.trim()) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg.schema === 'goldrush.view.v1') {
      viewCount++;
      fs.writeSync(logFd, JSON.stringify({ v: viewCount, now: msg.now, pendingOffer: msg.now?.pendingOffer, pendingSecure: msg.now?.pendingSecure }) + '\n');
      if (viewCount === 1) fs.writeFileSync(path.join(WS, `${label}-view0.json`), JSON.stringify(msg, null, 2));
      if (controller) {
        let out;
        try { out = controller(msg, state); } catch (e) {
          fs.writeSync(logFd, JSON.stringify({ v: viewCount, controllerError: String(e && e.stack || e) }) + '\n');
          out = null;
        }
        if (out === null || out === undefined) {
          child.stdin.write('\n');
        } else {
          submissions++;
          child.stdin.write(JSON.stringify(out) + '\n');
        }
      }
    } else if (msg.secured !== undefined || msg.endReason !== undefined) {
      lastOutcome = msg;
      fs.writeSync(logFd, JSON.stringify({ outcome: msg }) + '\n');
    }
  }
});

let stderrBuf = '';
child.stderr.on('data', (c) => { stderrBuf += c.toString(); });

child.on('exit', (code) => {
  fs.closeSync(logFd);
  fs.writeFileSync(path.join(WS, `${label}-stderr.txt`), stderrBuf);
  const summary = { label, code, viewCount, submissions, outcome: lastOutcome };
  // envelope
  let env = null;
  try {
    const tape = JSON.parse(fs.readFileSync(tapePath, 'utf8'));
    const entries = tape.inputLog?.entries || [];
    const bytes = fs.statSync(tapePath).size;
    const lastTick = entries.length ? entries[entries.length - 1].tick : null;
    env = {
      durationTicks: tape.inputLog?.durationTicks,
      lastEntryTick: lastTick,
      entries: entries.length,
      bytes,
      eventLogHash: tape.eventLogHash ?? tape.meta?.eventLogHash ?? null,
    };
  } catch (e) { env = { error: String(e) }; }
  summary.envelope = env;
  fs.writeFileSync(path.join(WS, `${label}-summary.json`), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary));

  // ---- intermediate-results law: keep best-so-far outcome file current ----
  const outFile = path.join(WS, 'gauntlet-outcome.json');
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(outFile, 'utf8')); } catch {}
  const runs = (prev?.runsSoFar || 0) + 1;
  const scored = /^attempt-/.test(label);
  const scoredAttempts = (prev?.scoredAttempts || 0) + (scored ? 1 : 0);
  const better = (a, b) => {
    if (!b) return true;
    if ((a?.secured ? 1 : 0) !== (b?.secured ? 1 : 0)) return (a?.secured ? 1 : 0) > (b?.secured ? 1 : 0);
    if ((a?.waves || 0) !== (b?.waves || 0)) return (a?.waves || 0) > (b?.waves || 0);
    return (a?.gold || 0) > (b?.gold || 0);
  };
  const prevOutcome = prev ? { secured: prev.secured, waves: prev.waves, gold: prev.gold } : null;
  let row;
  if (lastOutcome && better(lastOutcome, prevOutcome)) {
    row = { ...lastOutcome, tape: tapePath, scored, runsSoFar: runs, scoredAttempts, worldModel: WORLD_MODEL, envelope: env };
  } else if (prev) {
    row = { ...prev, runsSoFar: runs, scoredAttempts };
  } else {
    row = { secured: false, note: 'no outcome line', tape: tapePath, scored, runsSoFar: runs, scoredAttempts, worldModel: WORLD_MODEL, envelope: env };
  }
  fs.writeFileSync(outFile, JSON.stringify(row, null, 2));
});
