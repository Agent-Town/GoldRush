#!/usr/bin/env node
// Gen 69 runner: spawn gr-sim, drive a controller, log every view, write outcome on every exit.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WS = '/private/tmp/heat13-569a41f9/artifacts/heat13/opus/e8-eclipse';
const REPO = '/private/tmp/heat13-569a41f9';
const CONTRACT = 'e8-eclipse';
const SEED = 'e8-eclipse-01';
const WORLD_MODEL = 'sim-import';

const label = process.argv[2] || 'probe-idle';
const ctrlName = process.argv[3] || null; // null => --policy idle
const tape = path.join(WS, `${label}-tape.json`);
const viewLog = path.join(WS, `${label}-views.jsonl`);

let controller = null;
if (ctrlName) controller = (await import(path.join(WS, ctrlName))).default;

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (!ctrlName) args.push('--policy', 'idle');

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
const vlog = fs.createWriteStream(viewLog);
let buf = '';
let outcome = null;
let nViews = 0;
let nSubmits = 0;
const rows = [];
let ctx = {};

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
      nViews++;
      vlog.write(line + '\n');
      const n = msg.now || {};
      const air = n.air || {};
      const row = {
        v: nViews, t: +(n.timers?.runSeconds ?? 0).toFixed(1), w: n.wave,
        hp: n.hero ? +(n.hero.hp).toFixed(1) : null, mx: n.hero?.maxHp,
        hx: n.hero ? +(n.hero.x).toFixed(1) : null, hz: n.hero ? +(n.hero.z).toFixed(1) : null,
        px: n.prospector ? +(n.prospector.x).toFixed(1) : null, pz: n.prospector ? +(n.prospector.z).toFixed(1) : null,
        g: n.gold, pan: n.score?.goldPanned, alive: n.threats?.alive,
        wk: n.works?.standing, wr: n.works?.wrecked,
        suit: air.suit ? +(air.suit.seconds).toFixed(1) : null,
        dome: air.suit ? air.suit.inDome : undefined,
        worked: air.regolith ? air.regolith.worked?.length : null,
        req: air.regolith?.required,
        win: air.regolith?.window, cw: air.regolith?.creditedThisWindow,
        bp: air.regolith?.breathlessPans,
        ecl: air.eclipse ? air.eclipse.arrived : null,
        after: air.eclipse?.groundsWorkedAfter, ra: air.eclipse?.requiredAfter,
        domes: air.domes ? air.domes.map(d => `${d.id.slice(-4)}:${d.air}${d.breached ? 'B' : ''}`).join(',') : null,
        cmpl: air.regolith?.complete,
        ps: !!n.pendingSecure, po: n.pendingOffer ? n.pendingOffer.length : 0,
      };
      rows.push(row);
      if (nViews === 1) {
        fs.writeFileSync(path.join(WS, `${label}-view0.json`), JSON.stringify(msg, null, 1));
      }
      if (controller) {
        let out;
        try { out = controller(msg, ctx); } catch (e) { console.error('CTRL ERR', e.stack); out = null; }
        if (out === null || out === undefined) { child.stdin.write('\n'); }
        else {
          for (const o of out) for (const k of ['pos', 'where']) {
            if (o[k] && (!Number.isFinite(o[k].x) || !Number.isFinite(o[k].z))) {
              console.error('NON-FINITE ORDER', JSON.stringify(o)); out = out.filter(y => y !== o);
            }
          }
          nSubmits++;
          child.stdin.write(JSON.stringify(out) + '\n');
        }
      }
    } else if (msg.secured !== undefined || msg.waves !== undefined) {
      outcome = msg;
    }
  }
});
let stderrTail = '';
child.stderr.on('data', (d) => { stderrTail = (stderrTail + d.toString()).slice(-4000); });

child.on('close', (code) => {
  vlog.end();
  fs.writeFileSync(path.join(WS, `${label}-rows.json`), JSON.stringify(rows, null, 0));
  fs.writeFileSync(path.join(WS, `${label}-stderr.txt`), stderrTail);
  console.log('exit', code, 'views', nViews, 'submits', nSubmits);
  console.log('OUTCOME', JSON.stringify(outcome));
  // envelope
  try {
    const tp = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const il = tp.inputLog || {};
    const entries = il.entries || [];
    const lastT = entries.length ? entries[entries.length - 1].t ?? entries[entries.length - 1].tick : null;
    const bytes = fs.statSync(tape).size;
    console.log('ENVELOPE durationTicks=', il.durationTicks, 'lastEntryTick=', lastT, 'entries=', entries.length, 'bytes=', bytes);
  } catch (e) { console.log('tape read fail', e.message); }
  // print compact table
  const keys = ['v', 't', 'w', 'hp', 'hx', 'hz', 'px', 'pz', 'g', 'pan', 'alive', 'wk', 'wr', 'suit', 'dome', 'worked', 'cw', 'bp', 'ecl', 'after', 'cmpl'];
  const step = Math.max(1, Math.ceil(rows.length / 45));
  for (let i = 0; i < rows.length; i += step) {
    console.log(keys.map(k => `${k}=${rows[i][k]}`).join(' '));
  }
  if (rows.length) console.log('LAST', JSON.stringify(rows[rows.length - 1]));
  // intermediate results law
  writeOutcome(outcome, tape, label);
});

function writeOutcome(oc, tapePath, lbl) {
  const f = path.join(WS, 'gauntlet-outcome.json');
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(f, 'utf8')); } catch {}
  const runsSoFar = (prev?.runsSoFar || 0) + 1;
  const scoredAttempts = (prev?.scoredAttempts || 0) + (lbl.startsWith('attempt') ? 1 : 0);
  const better = !prev || !prev.secured && (oc?.secured || (oc?.waves || 0) > (prev.waves || 0));
  const base = better && oc ? { ...oc, tape: tapePath, scored: lbl.startsWith('attempt') } : {
    secured: prev?.secured, waves: prev?.waves, timeMs: prev?.timeMs, gold: prev?.gold,
    kills: prev?.kills, calls: prev?.calls, eventLogHash: prev?.eventLogHash,
    endReason: prev?.endReason, tape: prev?.tape, scored: prev?.scored,
  };
  fs.writeFileSync(f, JSON.stringify({ ...base, runsSoFar, scoredAttempts, worldModel: WORLD_MODEL, lastRun: lbl }, null, 1));
}
