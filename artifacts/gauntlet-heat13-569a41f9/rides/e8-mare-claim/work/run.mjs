#!/usr/bin/env node
// Heat 13 runner — spawns gr-sim, drives a controller module, logs every view,
// writes gauntlet-outcome.json on EVERY child exit (the intermediate-results law).
import { spawn } from 'node:child_process';
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '../../../..');
const CONTRACT = 'e8-mare-claim';
const SEED = 'e8-mare-claim-01';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };
const label = opt('label', 'tune-1');
const ctrlPath = opt('ctrl', resolve(HERE, 'ctrl.mjs'));
const idle = args.includes('--idle');
const tape = resolve(HERE, `${label}-tape.json`);

const ctrl = idle ? null : (await import(`${ctrlPath}?v=${Date.now()}`)).default;

const simArgs = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (idle) simArgs.push('--policy=idle');

const child = spawn('node', simArgs, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
const viewLog = [];
const rows = [];
let outcome = null;
let buf = '';
let n = 0;
const state = {};

child.stderr.on('data', (d) => { const s = String(d); if (/rejected|refused/i.test(s)) process.stderr.write(`[SIM] ${s}`); });

child.stdout.on('data', (chunk) => {
  buf += chunk;
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i); buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let obj; try { obj = JSON.parse(line); } catch { continue; }
    if (obj.schema === 'goldrush.view.v1') { handleView(obj); } else { outcome = obj; }
  }
});

function handleView(view) {
  n += 1;
  const now = view.now;
  viewLog.push(now);
  const air = now.air || {};
  rows.push({
    n, t: +(now.timers?.runSeconds ?? 0).toFixed(2), w: now.wave, gold: now.gold,
    pan: now.score?.goldPanned, hp: +(now.hero?.hp ?? 0).toFixed(1), mx: now.hero?.maxHp,
    hx: +(now.hero?.x ?? 0).toFixed(1), hz: +(now.hero?.z ?? 0).toFixed(1),
    px: +(now.prospector?.x ?? 0).toFixed(1), pz: +(now.prospector?.z ?? 0).toFixed(1),
    alive: now.threats?.alive, works: now.works?.standing, wr: now.works?.wrecked,
    suit: air.suit ? +air.suit.seconds.toFixed(1) : null,
    inDome: air.suit ? air.suit.inDome : null,
    worked: air.regolith ? (air.regolith.worked || []).length : null,
    req: air.regolith ? air.regolith.required : null,
    win: air.regolith ? air.regolith.window : null,
    done: air.regolith ? air.regolith.complete : null,
    ps: !!now.pendingSecure, po: now.pendingOffer ? now.pendingOffer.length : 0,
  });
  if (view.terminal) return;
  let orders;
  try { orders = ctrl(view, state); } catch (e) { process.stderr.write(`CTRL ERROR: ${e.stack}\n`); orders = null; }
  child.stdin.write(orders === null ? '\n' : `${JSON.stringify(orders)}\n`);
}

child.on('close', () => {
  try { child.stdin.end(); } catch {}
  const env = envelope();
  const rec = { label, outcome, envelope: env, views: n };
  writeFileSync(resolve(HERE, `${label}-log.json`), JSON.stringify({ rows, outcome, envelope: env }, null, 1));
  writeFileSync(resolve(HERE, `${label}-views.json`), JSON.stringify(viewLog));
  console.log(JSON.stringify(rec));
  console.table(rows.filter((r, i) => i % Math.max(1, Math.ceil(rows.length / 40)) === 0 || r.done || r.ps));
  promote(rec);
});

function envelope() {
  if (!existsSync(tape)) return null;
  const raw = readFileSync(tape, 'utf8');
  const t = JSON.parse(raw);
  const entries = t.inputLog?.entries ?? [];
  const maxTicks = 18000; // twist.clockTicks
  return {
    bytes: Buffer.byteLength(raw), byteCeiling: 16 * 1024 + Math.ceil(maxTicks / 5) * 160,
    durationTicks: t.inputLog?.durationTicks, tickCeiling: maxTicks + 2,
    entries: entries.length, lastEntryTick: entries.length ? entries[entries.length - 1].t : null,
    eventLogHash: t.eventLogHash ?? t.meta?.eventLogHash,
  };
}

function promote(rec) {
  const p = resolve(HERE, 'gauntlet-outcome.json');
  const cur = existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null;
  const runs = (cur?.runsSoFar ?? 0) + 1;
  const scored = /^attempt-/.test(label);
  const scoredAttempts = (cur?.scoredAttempts ?? 0) + (scored ? 1 : 0);
  const better = (a, b) => {
    if (!b) return true;
    if (!!a.secured !== !!b.secured) return a.secured;
    if (a.waves !== b.waves) return a.waves > b.waves;
    return (a.gold ?? 0) > (b.gold ?? 0);
  };
  const keepOld = cur && cur.outcomeLine && !better(rec.outcome ?? {}, cur.outcomeLine);
  const out = keepOld
    ? { ...cur, runsSoFar: runs, scoredAttempts }
    : {
        ...(rec.outcome ?? {}),
        outcomeLine: rec.outcome,
        tape: `${HERE}/${label}-tape.json`,
        scored, runsSoFar: runs, scoredAttempts,
        worldModel: 'sim-import',
        envelope: rec.envelope,
      };
  writeFileSync(p, JSON.stringify(out, null, 1));
}
