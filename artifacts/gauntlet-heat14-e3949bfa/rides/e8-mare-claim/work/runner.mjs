// Node runner: spawns gr-sim, drives a controller module, logs every view,
// writes gauntlet-outcome.json + all three envelope axes on every child exit.
// (This arena refuses shell redirection and compound cd; timeout is not on macOS.)
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa';
const WS = path.join(ROOT, 'artifacts/heat14/opus/e8-mare-claim');
const CONTRACT = 'e8-mare-claim';
const SEED = 'e8-mare-claim-01';

const label = process.argv[2] || 'probe';
const ctrlPath = process.argv[3] || null; // null => --policy idle
const tape = path.join(WS, `${label}-tape.json`);

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (!ctrlPath) args.push('--policy', 'idle');

let controller = null;
if (ctrlPath) {
  const m = await import(ctrlPath.startsWith('/') ? ctrlPath : path.join(WS, ctrlPath));
  controller = m.default || m.decide;
}

const child = spawn('node', args, { cwd: ROOT, stdio: ['pipe', 'pipe', 'pipe'] });
const views = [];
const rows = [];
let outcome = null;
let buf = '';
let firstView = null;

function log(v) {
  const n = v.now || {};
  const air = n.air || {};
  const reg = air.regolith || {};
  const suit = air.suit || {};
  rows.push({
    t: +(n.timers?.runSeconds ?? 0).toFixed(2),
    w: n.wave,
    gold: n.gold,
    pan: n.score?.goldPanned,
    stolen: n.score?.goldStolen,
    hp: n.hero?.hp != null ? +n.hero.hp.toFixed(1) : null,
    mx: n.hero?.maxHp,
    hx: n.hero?.x != null ? +n.hero.x.toFixed(1) : null,
    hz: n.hero?.z != null ? +n.hero.z.toFixed(1) : null,
    px: n.prospector?.x != null ? +n.prospector.x.toFixed(1) : null,
    pz: n.prospector?.z != null ? +n.prospector.z.toFixed(1) : null,
    suit: suit.seconds != null ? +suit.seconds.toFixed(1) : null,
    dome: suit.inDome ?? null,
    empty: suit.empty ?? null,
    worked: Array.isArray(reg.worked) ? reg.worked.length : reg.worked,
    req: reg.required,
    cw: reg.creditedThisWindow,
    win: reg.window,
    bp: reg.breathlessPans,
    done: reg.complete,
    alive: n.threats?.alive,
    wr: n.threats?.wreckers,
    th: n.threats?.thieves,
    works: n.works?.standing,
    wrecked: n.works?.wrecked,
    kinds: n.works?.byKind ? JSON.stringify(n.works.byKind) : null,
  });
}

function writeOutcome() {
  let env = null;
  try {
    const tp = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const entries = tp.inputLog?.entries || [];
    const last = entries.length ? Math.max(...entries.map(e => e.t ?? e.tick ?? 0)) : 0;
    env = {
      durationTicks: tp.inputLog?.durationTicks,
      lastEntryTick: last,
      entries: entries.length,
      bytes: fs.statSync(tape).size,
      tapeHash: tp.eventLogHash || tp.meta?.eventLogHash || null,
    };
  } catch (e) { env = { error: String(e.message) }; }
  const best = { ...(outcome || {}), tape, scored: label.startsWith('attempt'), label, envelope: env };
  fs.writeFileSync(path.join(WS, `${label}-summary.json`), JSON.stringify({ outcome, env, rows }, null, 1));
  // promote into gauntlet-outcome.json if better (secured beats unsecured, then waves, then gold)
  const gp = path.join(WS, 'gauntlet-outcome.json');
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(gp, 'utf8')); } catch {}
  const rank = o => [o?.secured ? 1 : 0, o?.waves ?? 0, o?.gold ?? 0];
  const better = !prev || rank(best).join(',') >= rank(prev).join(',') ||
    (rank(best)[0] > rank(prev)[0]) ||
    (rank(best)[0] === rank(prev)[0] && (rank(best)[1] > rank(prev)[1] ||
      (rank(best)[1] === rank(prev)[1] && rank(best)[2] >= rank(prev)[2])));
  const runs = (prev?.runsSoFar || 0) + 1;
  const scored = (prev?.scoredAttempts || 0) + (label.startsWith('attempt') ? 1 : 0);
  const row = better ? { ...best, runsSoFar: runs, scoredAttempts: scored, worldModel: 'sim-import' }
                     : { ...prev, runsSoFar: runs, scoredAttempts: scored };
  fs.writeFileSync(gp, JSON.stringify(row, null, 1));
  console.log('ENVELOPE', JSON.stringify(env));
  console.log('OUTCOME', JSON.stringify(outcome));
  // compact table
  console.log('t   w gold pan hp    hx,hz    px,pz   suit dome wk/req cw bp alive works kinds');
  for (const r of rows) {
    console.log(`${r.t} w${r.w} g${r.gold} p${r.pan} hp${r.hp}/${r.mx} h(${r.hx},${r.hz}) P(${r.px},${r.pz}) s${r.suit} d${r.dome} ${r.worked}/${r.req} cw${r.cw} win${r.win} bp${r.bp} a${r.alive} wr${r.wr}/th${r.th} W${r.works}/${r.wrecked} ${r.kinds}`);
  }
}

child.stdout.on('data', d => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i); buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let obj; try { obj = JSON.parse(line); } catch { continue; }
    if (obj.schema === 'goldrush.view.v1') {
      if (!firstView) { firstView = obj; fs.writeFileSync(path.join(WS, `${label}-view0.json`), JSON.stringify(obj, null, 1)); }
      views.push(obj); log(obj);
      if (controller) {
        const out = controller(obj, views);
        child.stdin.write(out === null ? '\n' : JSON.stringify(out) + '\n');
      }
    } else if (obj.secured !== undefined || obj.endReason !== undefined) {
      outcome = obj;
    }
  }
});
child.stderr.on('data', d => { const s = d.toString(); if (/reject/i.test(s)) console.error('STDERR', s.slice(0, 500)); });
child.on('exit', () => { writeOutcome(); });
