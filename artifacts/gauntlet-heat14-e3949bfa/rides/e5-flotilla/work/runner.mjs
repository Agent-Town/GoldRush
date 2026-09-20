// Gen 115 runner: spawn gr-sim, drive a controller, log every view, write outcome on every child exit.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WS = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa/artifacts/heat14/opus/e5-flotilla';
const REPO = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa';
const CONTRACT = 'e5-flotilla';
const SEED = 'e5-flotilla-01';

const label = process.argv[2] || 'probe';
const ctrlPath = process.argv[3] || null;
const tape = path.join(WS, `${label}-tape.json`);

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (!ctrlPath) args.push('--policy=idle');

const ctrl = ctrlPath ? (await import(ctrlPath)).default : null;

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
const views = [];
const rows = [];
let outcome = null;
let buf = '';
let stderrBuf = '';

child.stderr.on('data', d => { stderrBuf += d.toString(); });

child.stdout.on('data', (d) => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i); buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let msg; try { msg = JSON.parse(line); } catch { continue; }
    if (msg.schema === 'goldrush.view.v1') {
      views.push(msg);
      const n = msg.now || {};
      rows.push({
        v: views.length - 1,
        t: +(n.timers?.runSeconds ?? n.timers?.simTimeSeconds ?? 0).toFixed(2),
        w: n.wave,
        gold: n.gold,
        pan: n.score?.goldPanned,
        stolen: n.score?.goldStolen,
        hp: n.hero?.hp, mx: n.hero?.maxHp,
        hx: n.hero?.x != null ? +n.hero.x.toFixed(1) : null,
        hz: n.hero?.z != null ? +n.hero.z.toFixed(1) : null,
        alive: n.threats?.alive, kills: n.score?.kills,
        hulls: (n.deepwater?.flotilla?.hulls || []).map(h => `${h.id.slice(0,4)}:${h.integrity}${h.straggler?'*':''}${h.lost?'X':''}`).join(' '),
        pads: (n.deepwater?.boatBuildings || []).length,
        offer: n.pendingOffer ? n.pendingOffer.map(o => o.id).join(',') : null,
        sec: n.pendingSecure ? 'SECURE' : null,
        fails: (n.orders || []).filter(o => o.status === 'failed').map(o => `${o.order?.verb}:${(o.reason||'').slice(0,26)}`).slice(0, 3).join(' | '),
      });
      if (ctrl) {
        const reply = ctrl(msg, views.length - 1, rows);
        child.stdin.write(reply === null ? '\n' : JSON.stringify(reply) + '\n');
      } else {
        // idle policy: gr-sim drives itself
      }
    } else if (msg.secured !== undefined || msg.endReason !== undefined) {
      outcome = msg;
    }
  }
});

child.on('exit', (code) => {
  const summary = { label, code, outcome, views: views.length, rows };
  fs.writeFileSync(path.join(WS, `${label}-log.json`), JSON.stringify(summary, null, 1));
  fs.writeFileSync(path.join(WS, `${label}-view0.json`), JSON.stringify(views[0] ?? null, null, 1));
  if (views.length) fs.writeFileSync(path.join(WS, `${label}-viewlast.json`), JSON.stringify(views[views.length - 1], null, 1));

  // envelope, all three axes, read off the tape that exists
  let env = null;
  try {
    const t = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const entries = t.inputLog?.entries || [];
    const lastTick = entries.length ? Math.max(...entries.map(e => e.t ?? e.tick ?? 0)) : 0;
    env = {
      durationTicks: t.inputLog?.durationTicks,
      lastEntryTick: lastTick,
      entries: entries.length,
      bytes: fs.statSync(tape).size,
      eventLogHash: t.eventLogHash ?? t.meta?.eventLogHash,
    };
  } catch (e) { env = { error: String(e).slice(0, 120) }; }

  const out = {
    ...(outcome || {}),
    tape,
    scored: label.startsWith('attempt'),
    label,
    envelope: env,
    worldModel: 'sim-import',
  };
  fs.writeFileSync(path.join(WS, `${label}-outcome.json`), JSON.stringify(out, null, 1));

  console.log('EXIT', code, JSON.stringify(outcome));
  console.log('ENVELOPE', JSON.stringify(env));
  console.log('ROWS');
  for (const r of rows) console.log(JSON.stringify(r));
  if (stderrBuf.trim()) console.log('STDERR(tail)', stderrBuf.slice(-1200));
});
