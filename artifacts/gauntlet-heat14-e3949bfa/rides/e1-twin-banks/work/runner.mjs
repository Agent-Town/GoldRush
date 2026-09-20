#!/usr/bin/env node
// Heat 14 runner — spawn gr-sim, drive a controller, log every view, write
// gauntlet-outcome.json + all three envelope axes on every child exit.
// (Standing equipment since gen 45: this arena refuses shell redirection.)
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WS = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa/artifacts/heat14/opus/e1-twin-banks';
const REPO = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa';
const CONTRACT = 'e1-twin-banks';
const SEED = 'e1-twin-banks-01';

const label = process.argv[2] || 'probe';
const ctrlPath = process.argv[3] || null;   // null => --policy idle
const tape = path.join(WS, `${label}-tape.json`);
const viewLog = path.join(WS, `${label}-views.jsonl`);

let makeController = null;
if (ctrlPath) makeController = (await import(path.join(WS, ctrlPath))).default;

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (!ctrlPath) args.push('--policy', 'idle');

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
const vlog = fs.createWriteStream(viewLog);
const rows = [];
let buf = '';
let outcome = null;
let nviews = 0;
const ctrl = makeController ? makeController() : null;

child.stdout.on('data', (chunk) => {
  buf += chunk.toString();
  let nl;
  while ((nl = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, nl); buf = buf.slice(nl + 1);
    if (!line.trim()) continue;
    let msg; try { msg = JSON.parse(line); } catch { continue; }
    if (msg.schema === 'goldrush.view.v1') {
      nviews++;
      vlog.write(JSON.stringify(msg) + '\n');
      const n = msg.now || {};
      rows.push({
        v: nviews, t: +(n.timers?.runSeconds ?? n.timers?.simTimeSeconds ?? 0).toFixed(1),
        w: n.wave, gold: n.gold, pan: n.score?.goldPanned, stolen: n.score?.goldStolen,
        hp: n.hero?.hp != null ? +n.hero.hp.toFixed(1) : null, mx: n.hero?.maxHp,
        hx: n.hero?.x != null ? +n.hero.x.toFixed(1) : null, hz: n.hero?.z != null ? +n.hero.z.toFixed(1) : null,
        st: n.works?.standing, wr: n.works?.wrecked,
        kinds: n.works?.byKind ? JSON.stringify(n.works.byKind) : null,
        tiers: n.works?.entries ? n.works.entries.map(e => `${e.id}:${e.tier ?? '?'}${e.wrecked ? 'X' : ''}`).join(',') : null,
        al: n.threats?.alive, wk: n.threats?.wreckers, th: n.threats?.thieves,
        ps: n.pendingSecure ? 1 : 0, po: n.pendingOffer ? n.pendingOffer.length : 0,
        cap: ctrl?.diag?.cap ?? null, rate: ctrl?.diag?.rate ?? null, phase: ctrl?.diag?.phase ?? null,
      });
      if (ctrl) {
        let reply;
        try { reply = ctrl.respond(msg); } catch (e) { console.error('CTRL ERROR', e); reply = '\n'; }
        child.stdin.write(reply);
      }
    } else if (msg.secured !== undefined || msg.eventLogHash) {
      outcome = msg;
    }
  }
});

let stderrTail = '';
child.stderr.on('data', (c) => { stderrTail = (stderrTail + c.toString()).slice(-4000); });

child.on('exit', (code) => {
  vlog.end();
  fs.writeFileSync(path.join(WS, `${label}-rows.json`), JSON.stringify(rows, null, 0));
  // envelope
  let env = {};
  try {
    const t = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const entries = t.inputLog?.entries ?? [];
    const last = entries.length ? entries[entries.length - 1] : null;
    env = {
      durationTicks: t.inputLog?.durationTicks ?? null,
      lastEntryTick: last ? (last.t ?? last.tick ?? null) : null,
      entries: entries.length,
      bytes: fs.statSync(tape).size,
      tapeHash: t.eventLogHash ?? t.meta?.eventLogHash ?? null,
    };
  } catch (e) { env = { error: String(e) }; }
  const summary = { label, code, outcome, views: nviews, envelope: env, stderrTail: stderrTail.slice(-600) };
  fs.writeFileSync(path.join(WS, `${label}-summary.json`), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify({ label, code, outcome, views: nviews, envelope: env }, null, 1));
  if (rows.length) {
    const keys = ['v', 't', 'w', 'gold', 'pan', 'stolen', 'hp', 'st', 'wr', 'al', 'wk', 'th', 'cap', 'rate', 'phase'];
    console.log(keys.join('\t'));
    const step = Math.max(1, Math.ceil(rows.length / 34));
    for (let i = 0; i < rows.length; i += step) console.log(keys.map(k => rows[i][k]).join('\t'));
    const L = rows[rows.length - 1];
    console.log('LAST', JSON.stringify(L));
    console.log('KINDS', L.kinds, '| TIERS', L.tiers);
  }
  if (stderrTail.includes('rejected')) console.log('STDERR-TAIL:', stderrTail.slice(-900));

  // intermediate-results law: promote best-so-far
  const outPath = path.join(WS, 'gauntlet-outcome.json');
  let best = null;
  try { best = JSON.parse(fs.readFileSync(outPath, 'utf8')); } catch { }
  const runsSoFar = (best?.runsSoFar ?? 0) + 1;
  const scored = /^attempt-/.test(label);
  const scoredAttempts = (best?.scoredAttempts ?? 0) + (scored ? 1 : 0);
  const better = (a, b) => {
    if (!b) return true;
    if ((a?.secured ? 1 : 0) !== (b.secured ? 1 : 0)) return (a?.secured ? 1 : 0) > (b.secured ? 1 : 0);
    if ((a?.waves ?? 0) !== (b.waves ?? 0)) return (a?.waves ?? 0) > (b.waves ?? 0);
    return (a?.gold ?? 0) >= (b.gold ?? 0);
  };
  const prevOutcome = best ? { secured: best.secured, waves: best.waves, gold: best.gold } : null;
  const row = (outcome && better(outcome, prevOutcome))
    ? { ...outcome, tape, scored, worldModel: 'sim-import' }
    : (best ? { ...best } : { ...(outcome || {}), tape, scored, worldModel: 'sim-import' });
  row.runsSoFar = runsSoFar; row.scoredAttempts = scoredAttempts; row.worldModel = 'sim-import';
  row.envelope = (row.tape === tape) ? env : (best?.envelope ?? env);
  fs.writeFileSync(outPath, JSON.stringify(row, null, 2));
});
