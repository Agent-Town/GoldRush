#!/usr/bin/env node
// Gold Rush heat-14 runner — generation 117, e6-glow-mesa.
// Spawns gr-sim, drives a controller module, logs every view to JSONL,
// and writes gauntlet-outcome.json + all three envelope axes on EVERY child exit.
// (This arena refuses shell redirection and compound `cd`; `timeout` is not on macOS.)
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(DIR, '../../../..');
const CONTRACT = 'e6-glow-mesa';
const SEED = 'e6-glow-mesa-01';

const label = process.argv[2] || 'probe';
const ctrlName = process.argv[3] || null;   // controller module in DIR, or null => --policy idle
const tapePath = path.join(DIR, `${label}-tape.json`);
const logPath = path.join(DIR, `${label}-views.jsonl`);
const OUTCOME = path.join(DIR, 'gauntlet-outcome.json');
const STATE = path.join(DIR, 'runs-state.json');

let ctrl = null;
if (ctrlName) ctrl = (await import(path.join(DIR, ctrlName))).default;

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tapePath];
if (!ctrl) args.push('--policy', 'idle');

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });

const logFd = fs.openSync(logPath, 'w');
let buf = '';
let views = 0, submissions = 0, blanks = 0;
let outcomeLine = null;
const rows = [];
let stderrTail = '';

child.stderr.on('data', (d) => { stderrTail = (stderrTail + d.toString()).slice(-4000); });

child.stdout.on('data', (d) => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i); buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg.schema === 'goldrush.view.v1') {
      views++;
      fs.writeSync(logFd, JSON.stringify(msg) + '\n');
      rows.push(compact(msg));
      if (ctrl) {
        let out;
        try { out = ctrl(msg, { views }); }
        catch (e) { out = null; console.error('CTRL THREW', e.stack); }
        if (out === null || out === undefined) { child.stdin.write('\n'); blanks++; }
        else { child.stdin.write(JSON.stringify(out) + '\n'); submissions++; }
      }
    } else if (msg.secured !== undefined || msg.endReason !== undefined) {
      outcomeLine = msg;
    }
  }
});

child.on('exit', (code) => {
  fs.closeSync(logFd);
  const env = envelope(tapePath);
  const summary = { label, code, views, submissions, blanks, outcome: outcomeLine, envelope: env };
  fs.writeFileSync(path.join(DIR, `${label}-summary.json`), JSON.stringify(summary, null, 2));

  // ---- INTERMEDIATE-RESULTS LAW: promote best-so-far on EVERY exit ----
  let st = { runs: 0, scored: 0, best: null };
  try { st = JSON.parse(fs.readFileSync(STATE, 'utf8')); } catch {}
  st.runs = (st.runs || 0) + 1;
  if (/^attempt-/.test(label)) st.scored = (st.scored || 0) + 1;
  const cand = { label, tape: tapePath, outcome: outcomeLine, scored: /^attempt-/.test(label) };
  if (better(cand, st.best)) st.best = cand;
  fs.writeFileSync(STATE, JSON.stringify(st, null, 2));

  const b = st.best || cand;
  const o = b.outcome || {};
  fs.writeFileSync(OUTCOME, JSON.stringify({
    ...o,
    tape: b.tape,
    scored: !!b.scored,
    runsSoFar: st.runs,
    scoredAttempts: st.scored || 0,
    worldModel: 'sim-import',
  }, null, 2));

  console.log(`[${label}] exit=${code} views=${views} subs=${submissions} blanks=${blanks}`);
  console.log('OUTCOME', JSON.stringify(outcomeLine));
  console.log('ENVELOPE', JSON.stringify(env));
  console.log('TABLE');
  for (const r of rows) console.log(r);
  if (stderrTail.trim()) console.log('STDERR_TAIL\n' + stderrTail.split('\n').slice(-12).join('\n'));
});

// waves DESC, gold DESC, then faster time (the door's published order for secured claims)
function better(a, b) {
  if (!b || !b.outcome) return true;
  if (!a.outcome) return false;
  const A = a.outcome, B = b.outcome;
  if (!!A.secured !== !!B.secured) return !!A.secured;
  if ((A.waves || 0) !== (B.waves || 0)) return (A.waves || 0) > (B.waves || 0);
  if ((A.gold || 0) !== (B.gold || 0)) return (A.gold || 0) > (B.gold || 0);
  if (A.secured) return (A.timeMs || 0) < (B.timeMs || 0);
  return (A.timeMs || 0) > (B.timeMs || 0);
}

function envelope(tp) {
  try {
    const t = JSON.parse(fs.readFileSync(tp, 'utf8'));
    const il = t.inputLog || {};
    const entries = il.entries || [];
    const bytes = fs.statSync(tp).size;
    const lastTick = entries.length ? Math.max(...entries.map((e) => e.t ?? e.tick ?? 0)) : 0;
    return { durationTicks: il.durationTicks, lastEntryTick: lastTick, entries: entries.length, bytes };
  } catch (e) { return { error: e.message }; }
}

function compact(v) {
  const n = v.now || {};
  const at = n.atomic || {};
  const w = at.wrangle || {};
  const boss = at.homemakerBoss || {};
  const works = n.works || {};
  const s = n.score || {};
  const t = n.timers || {};
  const seams = (n.seams || []).filter((x) => x.active !== false && Number.isFinite(x.x))
    .map((x) => `${x.id}@${x.anchorIndex}`).join(',');
  return [
    `t=${(t.runSeconds ?? t.simTimeSeconds ?? 0).toFixed(1)}`,
    `w=${n.wave}`,
    `hp=${Math.round((n.hero?.hp ?? 0) * 10) / 10}/${n.hero?.maxHp}`,
    `hero=${fmt(n.hero?.x)},${fmt(n.hero?.z)}`,
    `gold=${n.gold}`,
    `pan=${s.goldPanned ?? '-'}`,
    `alive=${n.threats?.alive}`,
    `works=${works.standing ?? '-'}/${works.wrecked ?? '-'}`,
    `byKind=${JSON.stringify(works.byKind || {})}`,
    `exh=${at.exhausted ?? w.exhausted ?? '-'}`,
    `pen=${w.pen?.total ?? '-'}`,
    `penGold=${w.pen?.incomeGranted ?? '-'}`,
    `act=${boss.act ?? '-'}`,
    `live=${JSON.stringify(boss.liveComponents ?? boss.components ?? '-')}`,
    `seams=${seams}`,
    n.pendingOffer ? `OFFER=${n.pendingOffer.map((o) => o.id).join('|')}` : '',
    n.pendingSecure ? 'PENDING_SECURE' : '',
  ].filter(Boolean).join(' ');
}
function fmt(x) { return Number.isFinite(x) ? x.toFixed(1) : '?'; }
