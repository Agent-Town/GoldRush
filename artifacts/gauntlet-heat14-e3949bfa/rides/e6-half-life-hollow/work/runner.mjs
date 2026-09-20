#!/usr/bin/env node
// Generation 118 runner — spawn gr-sim, drive a controller, log every view,
// write gauntlet-outcome.json + all three envelope axes on every child exit.
// (This arena refuses shell redirection and compound `cd`; the runner is the
// only way the intermediate-results law gets satisfied automatically.)
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WS = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa/artifacts/heat14/opus/e6-half-life-hollow';
const REPO = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa';
const CONTRACT = 'e6-half-life-hollow';
const SEED = 'e6-half-life-hollow-01';

const label = process.argv[2] || 'probe';
const ctrlPath = process.argv[3] || null;   // null => --policy idle
const tape = path.join(WS, `${label}-tape.json`);
const viewLog = path.join(WS, `${label}-views.jsonl`);

let controller = null;
if (ctrlPath) controller = (await import(ctrlPath)).default;

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (!controller) args.push('--policy', 'idle');

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
const vlog = fs.createWriteStream(viewLog);

let buf = '';
let outcome = null;
const rows = [];
let views = 0, submits = 0;
const t0 = Date.now();

child.stdout.on('data', (chunk) => {
  buf += chunk.toString();
  let nl;
  while ((nl = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, nl).trim();
    buf = buf.slice(nl + 1);
    if (!line) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg.schema === 'goldrush.view.v1') {
      views++;
      const n = msg.now || {};
      const row = {
        v: views,
        t: +(((n.timers?.runSeconds) ?? (n.timers?.simTimeSeconds) ?? 0)).toFixed(2),
        w: n.wave,
        gold: n.gold,
        pan: n.score?.goldPanned,
        stole: n.score?.goldStolen,
        hp: n.hero?.hp, mx: n.hero?.maxHp,
        hx: n.hero?.x != null ? +n.hero.x.toFixed(1) : null,
        hz: n.hero?.z != null ? +n.hero.z.toFixed(1) : null,
        alive: n.threats?.alive, wr: n.threats?.wreckers, th: n.threats?.thieves,
        stand: n.works?.standing, wrk: n.works?.wrecked,
        byKind: n.works?.byKind,
        stage: n.hollowCrossing?.stage,
        route: n.hollowCrossing?.routeId,
        rad: n.hollowCrossing?.radiationDamageDealt,
        exh: n.atomic?.exhausted ?? n.atomic?.wrangle?.active?.filter?.((a) => a.exhausted)?.length,
        pen: n.atomic?.wrangle?.pen?.total ?? n.atomic?.wrangle?.pen?.machines,
        penGold: n.atomic?.wrangle?.pen?.incomeGranted,
        offer: n.pendingOffer ? n.pendingOffer.map((o) => o.id).join('|') : null,
        sec: n.pendingSecure ? 1 : 0,
        fails: (n.orders || []).filter((o) => o.status === 'failed').length,
      };
      rows.push(row);
      vlog.write(JSON.stringify({ row, view: views <= 2 ? msg : undefined }) + '\n');
      if (views <= 2) fs.writeFileSync(path.join(WS, `${label}-view${views}.json`), JSON.stringify(msg, null, 1));
      if (controller) {
        const out = controller(msg, { views });
        if (out === null || out === undefined) { child.stdin.write('\n'); }
        else { child.stdin.write(JSON.stringify(out) + '\n'); submits++; }
      }
    } else if (msg.secured !== undefined || msg.endReason !== undefined) {
      outcome = msg;
    }
  }
});

let errbuf = '';
child.stderr.on('data', (c) => { errbuf += c.toString(); });

child.on('close', (code) => {
  vlog.end();
  const wall = ((Date.now() - t0) / 1000).toFixed(1);
  // --- envelope: all three axes, measured off the reel that exists ---
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
      tapeHeaderHash: tp.eventLogHash ?? tp.meta?.eventLogHash,
    };
  } catch (e) { env = { error: e.message }; }

  const summary = { label, code, wall, views, submits, outcome, env,
    lastRows: rows.slice(-6), firstRows: rows.slice(0, 4),
    stderrTail: errbuf.slice(-600) };
  fs.writeFileSync(path.join(WS, `${label}-summary.json`), JSON.stringify(summary, null, 1));
  fs.writeFileSync(path.join(WS, `${label}-rows.json`), JSON.stringify(rows, null, 0));

  // --- INTERMEDIATE-RESULTS LAW: promote best-so-far after EVERY run ---
  promote(label, outcome, tape, env);

  console.log(JSON.stringify({ label, code, wall, views, submits, outcome, env }, null, 1));
});

function promote(lbl, oc, tapePath, env) {
  const p = path.join(WS, 'gauntlet-outcome.json');
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(p, 'utf8')); } catch {}
  const runs = (prev?.runsSoFar || 0) + 1;
  const scored = /^attempt-/.test(lbl);
  const scoredAttempts = (prev?.scoredAttempts || 0) + (scored ? 1 : 0);
  const better = (a, b) => {
    if (!b) return true;
    if ((a?.secured ? 1 : 0) !== (b?.secured ? 1 : 0)) return (a?.secured ? 1 : 0) > (b?.secured ? 1 : 0);
    if ((a?.waves || 0) !== (b?.waves || 0)) return (a?.waves || 0) > (b?.waves || 0);
    return (a?.gold || 0) >= (b?.gold || 0);
  };
  const take = better(oc, prev?.__oc);
  const row = take
    ? { ...oc, tape: tapePath, scored, envelope: env }
    : { ...prev?.__oc, tape: prev?.tape, scored: prev?.scored, envelope: prev?.envelope };
  fs.writeFileSync(p, JSON.stringify({
    ...row,
    runsSoFar: runs,
    scoredAttempts,
    worldModel: 'sim-import',
    __oc: take ? oc : prev?.__oc,
  }, null, 1));
}
