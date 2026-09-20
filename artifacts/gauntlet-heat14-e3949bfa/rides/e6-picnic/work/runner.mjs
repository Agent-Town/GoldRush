#!/usr/bin/env node
// Gold Rush gauntlet runner — spawns gr-sim, drives a controller, logs every view,
// writes gauntlet-outcome.json + all three envelope axes on every child exit.
// (This arena refuses shell redirection and compound `cd`; the runner is the cure.)
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DIR = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa';
const WS = path.join(DIR, 'artifacts/heat14/opus/e6-picnic');
const CONTRACT = 'e6-picnic';
const SEED = 'e6-picnic-01';

const label = process.argv[2] || 'probe';
const ctrlPath = process.argv[3] || null; // null => --policy idle
const tape = path.join(WS, `${label}-tape.json`);

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (!ctrlPath) args.push('--policy', 'idle');

let controller = null;
if (ctrlPath) {
  const mod = await import(`file://${path.join(WS, ctrlPath)}?v=${Date.now()}`);
  controller = mod.default ?? mod.controller;
}

const child = spawn('node', args, { cwd: DIR, stdio: ['pipe', 'pipe', 'pipe'] });

const views = [];
const rows = [];
let outcome = null;
let buf = '';
let stderr = '';
let viewN = 0;

child.stderr.on('data', (d) => { stderr += d.toString(); });

function compact(now, wave) {
  const w = now.works || {};
  const sc = now.score || {};
  const th = now.threats || {};
  const pic = (now.atomic && now.atomic.picnicHold) || null;
  const wr = (now.atomic && now.atomic.wrangle) || null;
  return {
    v: viewN,
    t: +(((now.timers && (now.timers.runSeconds ?? now.timers.simTimeSeconds)) ?? 0)).toFixed(2),
    wave,
    gold: now.gold,
    pan: sc.goldPanned ?? 0,
    stolen: sc.goldStolen ?? 0,
    hp: now.hero ? +now.hero.hp.toFixed(1) : null,
    maxHp: now.hero ? now.hero.maxHp : null,
    hx: now.hero ? +now.hero.x.toFixed(1) : null,
    hz: now.hero ? +now.hero.z.toFixed(1) : null,
    alive: th.alive ?? 0,
    wreckers: th.wreckers ?? 0,
    thieves: th.thieves ?? 0,
    standing: w.standing ?? 0,
    wrecked: w.wrecked ?? 0,
    byKind: w.byKind ? JSON.stringify(w.byKind) : '{}',
    stakes: pic ? pic.map((s) => `${s.id.slice(9, 12)}:${s.claimed ? 'X' : (s.contested ? 'C' : '.')}${s.timer ? s.timer.toFixed(1) : ''}`).join(' ') : '',
    pen: wr ? (wr.pen ? wr.pen.total : 0) : 0,
    penGold: wr ? (wr.pen ? wr.pen.incomeGranted : 0) : 0,
    exh: (now.atomic && now.atomic.exhausted) ?? 0,
    offer: now.pendingOffer ? now.pendingOffer.map((o) => o.id).join(',') : '',
  };
}

async function onLine(line) {
  if (!line.trim()) return;
  let obj;
  try { obj = JSON.parse(line); } catch { return; }
  if (obj.schema === 'goldrush.view.v1') {
    viewN += 1;
    const now = obj.now || {};
    views.push(obj);
    const row = compact(now, now.wave);
    rows.push(row);
    let orders;
    try {
      orders = controller ? controller(obj, { viewN, rows }) : null;
    } catch (e) {
      stderr += `\nCONTROLLER THREW: ${e.stack}\n`;
      orders = [];
    }
    if (controller) {
      if (orders === null || orders === undefined) child.stdin.write('\n');
      else child.stdin.write(JSON.stringify(orders) + '\n');
    }
  } else if (obj.secured !== undefined || obj.endReason !== undefined) {
    outcome = obj;
  }
}

child.stdout.on('data', (d) => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i);
    buf = buf.slice(i + 1);
    onLine(line);
  }
});

child.on('close', () => {
  if (buf.trim()) onLine(buf);
  const summary = { label, outcome, views: viewN, rows };
  fs.writeFileSync(path.join(WS, `${label}-log.json`), JSON.stringify(summary, null, 1));
  fs.writeFileSync(path.join(WS, `${label}-stderr.txt`), stderr.slice(-8000));

  // envelope, all three axes, from the function's own rule
  let env = null;
  try {
    const t = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const il = t.inputLog || {};
    const entries = il.entries || [];
    const bytes = fs.statSync(tape).size;
    const lastTick = entries.length ? Math.max(...entries.map((e) => e.t ?? e.tick ?? 0)) : 0;
    env = {
      durationTicks: il.durationTicks,
      lastEntryTick: lastTick,
      entries: entries.length,
      bytes,
      tapeHash: t.eventLogHash ?? (t.meta && t.meta.eventLogHash) ?? null,
    };
  } catch (e) { env = { error: String(e) }; }

  const best = { label, tape, env };
  fs.writeFileSync(path.join(WS, `${label}-summary.json`), JSON.stringify(best, null, 1));

  // table
  const cols = ['v', 't', 'wave', 'gold', 'pan', 'hp', 'hx', 'hz', 'alive', 'standing', 'wrecked', 'stakes', 'pen', 'penGold', 'exh', 'byKind'];
  const lines = [cols.join('\t')];
  for (const r of rows) lines.push(cols.map((c) => r[c]).join('\t'));
  fs.writeFileSync(path.join(WS, `${label}-table.tsv`), lines.join('\n'));

  console.log(JSON.stringify({ label, outcome, views: viewN, env }, null, 1));
});
