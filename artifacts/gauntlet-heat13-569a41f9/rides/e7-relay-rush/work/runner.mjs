// heat13 opus e7-relay-rush runner: spawns gr-sim, drives a controller module,
// logs every view, writes gauntlet-outcome.json on every child exit (intermediate-results law).
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WS = '/private/tmp/heat13-569a41f9/artifacts/heat13/opus/e7-relay-rush';
const REPO = '/private/tmp/heat13-569a41f9';
const CONTRACT = 'e7-relay-rush';
const SEED = 'e7-relay-rush-01';
const WORLD_MODEL = 'sim-import';

const label = process.argv[2] || 'probe';
const ctrlPath = process.argv[3] || null;
const tape = path.join(WS, `${label}-tape.json`);
const viewLog = path.join(WS, `${label}-views.jsonl`);

const ctrl = ctrlPath ? await import(ctrlPath) : null;
const state = ctrl?.makeState ? ctrl.makeState() : {};

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (!ctrl) args.push('--policy=idle');

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
const vlog = fs.createWriteStream(viewLog);
let buf = '';
let outcome = null;
let views = 0;
const rows = [];

child.stdout.on('data', (chunk) => {
  buf += chunk.toString();
  let nl;
  while ((nl = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, nl);
    buf = buf.slice(nl + 1);
    if (!line.trim()) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg.schema === 'goldrush.view.v1') {
      views += 1;
      vlog.write(JSON.stringify(msg) + '\n');
      const n = msg.now || {};
      rows.push({
        v: views, t: n.timers?.runSeconds, w: n.wave, gold: n.gold,
        pan: n.score?.goldPanned, hp: n.hero?.hp, mx: n.hero?.maxHp,
        hx: n.hero?.x, hz: n.hero?.z,
        px: n.prospector?.x, pz: n.prospector?.z,
        alive: n.threats?.alive, works: n.works?.standing, wr: n.works?.wrecked,
        pbo: n.playbookUse?.objectiveMet, pbr: n.playbookUse?.runningProgram,
        pbs: n.playbookUse?.programSuspensions, pbu: n.playbookUse?.uses,
        pbref: n.playbookUse ? JSON.stringify(n.playbookUse.refusals) : undefined,
        lit: n.interferenceFront?.litCount, fa: n.interferenceFront?.frontsArrived,
        cx: n.interferenceFront?.centerX, dr: n.interferenceFront?.deadlineResolved,
        ifm: n.interferenceFront?.objectiveMet,
        sec: n.pendingSecure ? 1 : 0, off: n.pendingOffer ? n.pendingOffer.length : 0,
      });
      if (ctrl) {
        let reply;
        try { reply = ctrl.decide(msg, state); }
        catch (e) { console.error('CTRL ERROR', e); reply = '\n'; }
        child.stdin.write(reply === null || reply === undefined ? '\n'
          : (typeof reply === 'string' ? reply : JSON.stringify(reply) + '\n'));
      }
    } else if (msg.secured !== undefined) {
      outcome = msg;
    }
  }
});

let errBuf = '';
child.stderr.on('data', (c) => { errBuf += c.toString(); });

child.on('exit', (code) => {
  vlog.end();
  fs.writeFileSync(path.join(WS, `${label}-rows.json`), JSON.stringify(rows, null, 0));
  fs.writeFileSync(path.join(WS, `${label}-stderr.txt`), errBuf.slice(-40000));
  const env = envelope(tape);
  const rec = { label, outcome, views, envelope: env, tape };
  fs.writeFileSync(path.join(WS, `${label}-summary.json`), JSON.stringify(rec, null, 2));
  console.log('EXIT', code, JSON.stringify(outcome));
  console.log('ENVELOPE', JSON.stringify(env));
  console.log('VIEWS', views);
  console.log('TAIL', JSON.stringify(rows.slice(-6)));
  promote(rec);
});

function envelope(p) {
  try {
    const t = JSON.parse(fs.readFileSync(p, 'utf8'));
    const entries = t.inputLog?.entries ?? [];
    return {
      durationTicks: t.inputLog?.durationTicks,
      lastEntryTick: entries.length ? entries[entries.length - 1].t : null,
      entries: entries.length,
      bytes: fs.statSync(p).size,
      eventLogHash: t.outcome?.eventLogHash ?? t.eventLogHash ?? null,
    };
  } catch (e) { return { error: String(e) }; }
}

function promote(rec) {
  const outPath = path.join(WS, 'gauntlet-outcome.json');
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(outPath, 'utf8')); } catch {}
  const runsSoFar = (prev?.runsSoFar ?? 0) + 1;
  const scored = /^attempt-/.test(rec.label);
  const scoredAttempts = (prev?.scoredAttempts ?? 0) + (scored ? 1 : 0);
  const o = rec.outcome;
  const better = !prev || !prev.secured || (o && o.secured && rank(o) >= rank(prev));
  const base = (o && better)
    ? { ...o, tape: rec.tape, scored, envelope: rec.envelope }
    : { ...prev };
  base.runsSoFar = runsSoFar;
  base.scoredAttempts = scoredAttempts;
  base.worldModel = WORLD_MODEL;
  fs.writeFileSync(outPath, JSON.stringify(base, null, 2));
}
function rank(o) { return (o.secured ? 1e9 : 0) + (o.waves ?? 0) * 1000 + (o.gold ?? 0); }
