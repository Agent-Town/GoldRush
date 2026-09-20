#!/usr/bin/env node
// Gen 107 runner — spawns gr-sim, drives a controller module, logs every view to JSONL,
// and writes gauntlet-outcome.json + all three envelope axes on EVERY child exit.
// (The intermediate-results law, made automatic. This arena refuses shell redirection.)
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const REPO = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa';
const WS = path.join(REPO, 'artifacts/heat14/opus/e7-echo-canyon');
const CONTRACT = 'e7-echo-canyon';
const SEED = 'e7-echo-canyon-01';

const label = process.argv[2] || 'tune-1';
const ctrlPath = process.argv[3] || path.join(WS, 'controller.mjs');
const tape = path.join(WS, `${label}-tape.json`);
const viewLog = path.join(WS, `${label}-views.jsonl`);

const { makeController } = await import(ctrlPath + `?v=${Date.now()}`);
const ctrl = makeController();

const child = spawn('node', ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape], {
  cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'],
});

let buf = '';
let outcome = null;
const rows = [];
const vlog = fs.createWriteStream(viewLog);
let views = 0, submits = 0, blanks = 0;

child.stderr.on('data', (d) => {
  const s = d.toString();
  if (/rejected/i.test(s)) process.stdout.write('STDERR-REJECT: ' + s.slice(0, 400) + '\n');
});

child.stdout.on('data', (d) => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i).trim();
    buf = buf.slice(i + 1);
    if (!line) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg.schema === 'goldrush.view.v1') {
      views++;
      vlog.write(JSON.stringify(msg) + '\n');
      const now = msg.now || {};
      const row = {
        v: views,
        t: +(now.timers?.runSeconds ?? 0).toFixed(2),
        w: now.wave,
        gold: now.gold,
        pan: now.score?.goldPanned,
        stole: now.score?.goldStolen,
        hp: now.hero?.hp == null ? null : +now.hero.hp.toFixed(1),
        mx: now.hero?.maxHp,
        hx: now.hero?.x == null ? null : +now.hero.x.toFixed(1),
        hz: now.hero?.z == null ? null : +now.hero.z.toFixed(1),
        alive: now.threats?.alive,
        wr: now.threats?.wreckers,
        th: now.threats?.thieves,
        std: now.works?.standing,
        wk: now.works?.wrecked,
        kinds: now.works?.byKind,
        pb: now.playbookUse ? {
          met: now.playbookUse.objectiveMet, obj: now.playbookUse.objective,
          uses: now.playbookUse.uses, run: now.playbookUse.runningProgram,
          ref: now.playbookUse.refusals, last: now.playbookUse.last,
        } : undefined,
        bm: now.broadcastMirror ? {
          rec: now.broadcastMirror.recordedUses, fielded: now.broadcastMirror.squadsFielded,
          bodies: now.broadcastMirror.bodiesFielded, pend: now.broadcastMirror.pending,
          maxRep: now.broadcastMirror.maxRepeat,
        } : undefined,
        sec: now.pendingSecure ? true : undefined,
        off: now.pendingOffer ? now.pendingOffer.map((o) => o.id) : undefined,
      };
      rows.push(row);
      let orders;
      try { orders = ctrl.decide(msg, row); } catch (e) {
        process.stdout.write('CTRL-THROW: ' + (e && e.stack || e) + '\n');
        orders = null;
      }
      if (orders === null || orders === undefined) { blanks++; child.stdin.write('\n'); }
      else { submits++; child.stdin.write(JSON.stringify(orders) + '\n'); }
    } else if (msg.secured !== undefined || msg.endReason !== undefined) {
      outcome = msg;
    }
  }
});

function envelope() {
  try {
    const tp = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const il = tp.inputLog || {};
    const entries = il.entries || [];
    const last = entries.length ? Math.max(...entries.map((e) => e.t ?? e.tick ?? 0)) : 0;
    const bytes = fs.statSync(tape).size;
    // runTapeEnvelopeForContract: 16KiB + maxEntries*160 + maxOrderEntries*(2400-160)
    const maxTicks = Math.max(18000, 18000);
    const maxEntries = Math.floor(maxTicks / 5) + 1;
    const ceiling = 16 * 1024 + maxEntries * 160 + maxEntries * (2400 - 160);
    return { durationTicks: il.durationTicks, lastEntryTick: last, entries: entries.length,
      maxEntries, bytes, byteCeiling: ceiling, eventLogHash: tp.outcome?.eventLogHash ?? tp.eventLogHash };
  } catch (e) { return { error: String(e) }; }
}

function writeOut() {
  const env = envelope();
  const summary = { label, outcome, envelope: env, views, submits, blanks,
    tape: path.basename(tape), lastRows: rows.slice(-6) };
  fs.writeFileSync(path.join(WS, `${label}-summary.json`), JSON.stringify(summary, null, 1));
  fs.writeFileSync(path.join(WS, `${label}-rows.json`), JSON.stringify(rows, null, 0));
  // Promote into gauntlet-outcome.json if this is the best so far (or the first).
  const outPath = path.join(WS, 'gauntlet-outcome.json');
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(outPath, 'utf8')); } catch { }
  const runsSoFar = (prev?.runsSoFar ?? 0) + 1;
  const scored = /^attempt-/.test(label);
  const scoredAttempts = (prev?.scoredAttempts ?? 0) + (scored ? 1 : 0);
  const better = !prev || !prev.secured && (outcome?.secured || (outcome?.waves ?? 0) > (prev.waves ?? 0));
  const base = better && outcome ? {
    ...outcome, tape: path.relative(WS, tape) === path.basename(tape) ? tape : tape,
  } : { ...prev };
  delete base.runsSoFar; delete base.scoredAttempts; delete base.worldModel; delete base.scored;
  fs.writeFileSync(outPath, JSON.stringify({
    ...base, tape: better && outcome ? tape : (prev?.tape ?? tape),
    scored: better && outcome ? scored : (prev?.scored ?? false),
    runsSoFar, scoredAttempts, worldModel: 'sim-import',
    envelope: better && outcome ? env : (prev?.envelope ?? env),
  }, null, 1));
  process.stdout.write('\n=== ' + label + ' ===\n' + JSON.stringify(summary.outcome) + '\n' +
    'ENV ' + JSON.stringify(env) + '\nviews=' + views + ' submits=' + submits + ' blanks=' + blanks + '\n');
}

child.on('close', (code) => { vlog.end(); writeOut(); process.stdout.write('rc=' + code + '\n'); });
