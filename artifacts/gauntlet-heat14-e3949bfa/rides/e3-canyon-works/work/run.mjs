// Node runner: spawn gr-sim, drive a controller, log every view, write gauntlet-outcome.json on exit.
// (this arena refuses shell redirection / compound cd; the runner is the only way the
//  intermediate-results law gets satisfied automatically.)
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DIR = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa';
const OUT = path.join(DIR, 'artifacts/heat14/opus/e3-canyon-works');
const CONTRACT = 'e3-canyon-works';
const SEED = 'e3-canyon-works-01';

const label = process.argv[2] || 'probe';
const ctrlPath = process.argv[3] || null;   // null => --policy idle
const tape = path.join(OUT, `${label}-tape.json`);
const viewlog = path.join(OUT, `${label}-views.jsonl`);

let ctrl = null;
if (ctrlPath) ctrl = (await import(ctrlPath)).default;

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (!ctrl) args.push('--policy', 'idle');

const child = spawn('node', args, { cwd: DIR, stdio: ['pipe', 'pipe', 'pipe'] });

let buf = '';
let outcome = null;
const rows = [];
const vs = fs.createWriteStream(viewlog);
let nviews = 0;

child.stdout.on('data', (d) => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i); buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let msg; try { msg = JSON.parse(line); } catch { continue; }
    if (msg.schema === 'goldrush.view.v1') {
      nviews++;
      vs.write(line + '\n');
      const n = msg.now || {};
      rows.push({
        v: nviews, t: +(n.timers?.runSeconds ?? 0).toFixed(1), w: n.wave,
        gold: n.gold, pan: n.score?.goldPanned, stolen: n.score?.goldStolen,
        hp: n.hero?.hp != null ? +n.hero.hp.toFixed(1) : null, mx: n.hero?.maxHp,
        hx: n.hero?.x != null ? +n.hero.x.toFixed(1) : null, hz: n.hero?.z != null ? +n.hero.z.toFixed(1) : null,
        px: n.prospector?.x != null ? +n.prospector.x.toFixed(1) : null, pz: n.prospector?.z != null ? +n.prospector.z.toFixed(1) : null,
        alive: n.threats?.alive, wr: n.threats?.wreckers,
        stand: n.works?.standing, wrk: n.works?.wrecked,
        bk: JSON.stringify(n.works?.byKind || {}),
        cc: n.canyonConnect ? `${n.canyonConnect.powered}/${n.canyonConnect.required}${n.canyonConnect.complete ? 'C' : ''}${n.canyonConnect.failed ? 'F' : ''}` : null,
        ps: !!n.pendingSecure, po: !!n.pendingOffer,
      });
      let reply;
      try { reply = ctrl ? ctrl(msg, nviews) : null; } catch (e) { console.error('CTRL ERR', e); reply = '\n'; }
      if (reply !== null && reply !== undefined) {
        child.stdin.write(typeof reply === 'string' ? reply : JSON.stringify(reply) + '\n');
      }
    } else if (msg.secured !== undefined || msg.waves !== undefined) {
      outcome = msg;
    }
  }
});

let err = '';
child.stderr.on('data', (d) => { err += d.toString(); });

child.on('exit', (code) => {
  vs.end();
  // compact per-view table
  const tbl = rows.map(r => `v${r.v} t=${r.t} w=${r.w} g=${r.gold} pan=${r.pan} hp=${r.hp}/${r.mx} hero=(${r.hx},${r.hz}) pro=(${r.px},${r.pz}) alive=${r.alive} wr=${r.wr} works=${r.stand}/${r.wrk} ${r.bk} cc=${r.cc}${r.ps ? ' PS' : ''}${r.po ? ' PO' : ''}`).join('\n');
  fs.writeFileSync(path.join(OUT, `${label}-table.txt`), tbl);
  const errTail = err.split('\n').filter(l => l.trim()).slice(-25).join('\n');
  fs.writeFileSync(path.join(OUT, `${label}-stderr.txt`), err.slice(-40000));

  // envelope
  let env = {};
  try {
    const t = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const entries = t.inputLog?.entries || [];
    const last = entries.length ? entries[entries.length - 1] : null;
    env = {
      durationTicks: t.inputLog?.durationTicks,
      lastEntryTick: last ? (last.t ?? last.tick) : null,
      entries: entries.length,
      bytes: fs.statSync(tape).size,
    };
  } catch (e) { env = { err: String(e) }; }

  const summary = { label, code, outcome, views: nviews, envelope: env, errTail };
  fs.writeFileSync(path.join(OUT, `${label}-summary.json`), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify({ label, code, outcome, views: nviews, envelope: env }, null, 1));
  console.log('--- last rows ---');
  console.log(rows.slice(-6).map(r => `v${r.v} t=${r.t} w=${r.w} g=${r.gold} pan=${r.pan} hp=${r.hp}/${r.mx} alive=${r.alive} works=${r.stand}/${r.wrk} cc=${r.cc}`).join('\n'));
  if (errTail) { console.log('--- stderr tail ---'); console.log(errTail.slice(0, 3000)); }

  // intermediate-results law: promote best-so-far
  try {
    const gpath = path.join(OUT, 'gauntlet-outcome.json');
    let prev = null;
    try { prev = JSON.parse(fs.readFileSync(gpath, 'utf8')); } catch {}
    const runs = (prev?.runsSoFar || 0) + 1;
    const better = !prev || !prev.secured
      ? (outcome ? (!prev || outcome.secured || (outcome.waves ?? 0) >= (prev.waves ?? -1)) : false)
      : (outcome?.secured && (outcome.waves ?? 0) > (prev.waves ?? 0));
    const base = better && outcome ? { ...outcome, tape } : (prev ? { ...prev } : {});
    fs.writeFileSync(gpath, JSON.stringify({
      ...base,
      tape: base.tape || tape,
      scored: base.scored ?? false,
      runsSoFar: runs,
      scoredAttempts: prev?.scoredAttempts || 0,
      worldModel: 'sim-import',
    }, null, 2));
  } catch (e) { console.error('outcome write failed', e); }
});
