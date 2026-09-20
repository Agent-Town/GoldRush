// Node runner: spawn gr-sim, drive a controller, log every view, write outcome + envelope on exit.
// Usage: node runner.mjs <controller.mjs> <tag>
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DIR = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa/artifacts/heat14/opus/e10-ember-shore';
const REPO = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa';
const CONTRACT = 'e10-ember-shore';
const SEED = 'e10-ember-shore-01';

const ctrlPath = process.argv[2];
const tag = process.argv[3] || 'run';
const idle = process.argv[4] === 'idle';

const tape = path.join(DIR, `${tag}-tape.json`);
const logPath = path.join(DIR, `${tag}-views.jsonl`);
const tablePath = path.join(DIR, `${tag}-table.txt`);
const sumPath = path.join(DIR, `${tag}-summary.json`);

let ctrl = null;
if (!idle) {
  const mod = await import(path.isAbsolute(ctrlPath) ? 'file://' + ctrlPath + '?t=' + Date.now()
    : 'file://' + path.resolve(process.cwd(), ctrlPath) + '?t=' + Date.now());
  ctrl = mod.default ?? mod.controller;
}

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (idle) args.push('--policy', 'idle');

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });

const logFd = fs.openSync(logPath, 'w');
const rows = [];
let buf = '';
let outcome = null;
let views = 0;

child.stdout.on('data', (d) => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i); buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let obj;
    try { obj = JSON.parse(line); } catch { continue; }
    if (obj.schema === 'goldrush.view.v1') {
      views++;
      fs.writeSync(logFd, JSON.stringify(obj) + '\n');
      try { rows.push(summarise(obj)); } catch (e) { rows.push({ err: String(e) }); }
      if (!idle) {
        let out;
        try { out = ctrl(obj); } catch (e) { out = { line: '\n', note: 'CTRL ERROR ' + e.stack }; rows[rows.length-1].err = String(e); }
        const payload = (typeof out === 'string') ? out : out.line;
        if (out && out.note) rows[rows.length-1].note = out.note;
        child.stdin.write(payload.endsWith('\n') ? payload : payload + '\n');
      }
    } else {
      outcome = obj;
    }
  }
});

let stderrTail = '';
child.stderr.on('data', (d) => { stderrTail = (stderrTail + d.toString()).slice(-4000); });

function n(v, d = 1) { return (typeof v === 'number' && Number.isFinite(v)) ? Number(v.toFixed(d)) : v; }

function summarise(v) {
  const now = v.now || {};
  const es = now.emberShore || {};
  const pr = es.preserve || {};
  const sq = now.squall || es.squall || {};
  const w = now.works || {};
  return {
    t: n((now.timers?.runSeconds ?? now.timers?.simTimeSeconds ?? 0)),
    wave: now.wave,
    gold: now.gold,
    pan: now.score?.goldPanned,
    stolen: now.score?.goldStolen,
    warmth: n(pr.warmth ?? es.warmth ?? pr.hp),
    alight: pr.alight ?? es.alight,
    squalls: pr.fullSquallsSurvived ?? es.fullSquallsSurvived,
    phase: sq.phase,
    nextIn: n(sq.nextPhaseInSeconds),
    hp: n(now.hero?.hp), maxHp: n(now.hero?.maxHp),
    hx: n(now.hero?.x), hz: n(now.hero?.z),
    px: n(now.prospector?.x), pz: n(now.prospector?.z),
    alive: now.threats?.alive, wr: now.threats?.wreckers, th: now.threats?.thieves,
    works: w.standing, wrecked: w.wrecked,
    byKind: w.byKind ? JSON.stringify(w.byKind) : undefined,
    seams: (now.seams || []).filter(s => s.active !== false).map(s => `${s.id}@${s.anchorIndex}`).join(','),
    offer: now.pendingOffer ? now.pendingOffer.map(o => o.id).join('|') : undefined,
    psec: now.pendingSecure ? 'YES' : undefined,
    fails: (now.orders || []).filter(o => o.status === 'failed').map(o => `${o.order?.verb}:${(o.reason || '').slice(0, 40)}`).slice(0, 4).join(' ; '),
  };
}

child.on('exit', (code) => {
  fs.closeSync(logFd);
  // table
  const keys = ['t','wave','gold','pan','warmth','alight','squalls','phase','nextIn','hp','hx','hz','px','pz','alive','works','wrecked','psec','offer','note','fails'];
  const lines = [keys.join('\t')];
  for (const r of rows) lines.push(keys.map(k => (r[k] === undefined ? '' : String(r[k]))).join('\t'));
  fs.writeFileSync(tablePath, lines.join('\n'));

  // envelope
  let env = null;
  try {
    const tp = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const entries = tp.inputLog?.entries || [];
    const lastTick = entries.length ? Math.max(...entries.map(e => e.t ?? e.tick ?? 0)) : 0;
    env = {
      durationTicks: tp.inputLog?.durationTicks,
      lastEntryTick: lastTick,
      entries: entries.length,
      bytes: fs.statSync(tape).size,
      headerHash: tp.meta?.eventLogHash ?? tp.eventLogHash ?? tp.outcome?.eventLogHash,
    };
  } catch (e) { env = { err: String(e) }; }

  const sum = { tag, code, views, outcome, envelope: env, stderrTail: stderrTail.slice(-800) };
  fs.writeFileSync(sumPath, JSON.stringify(sum, null, 1));
  console.log(JSON.stringify({ tag, code, views, outcome, envelope: env }, null, 1));
  if (stderrTail) console.log('STDERR_TAIL:', stderrTail.slice(-600));
});
