// Heat 15 runner — spawns gr-sim, drives a controller module, logs every view,
// writes gauntlet-outcome.json plus all three envelope axes on every child exit.
// Shell redirection is refused in this arena, so the runner does the plumbing.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const REPO = path.resolve(HERE, '../../../..');
const OUT = HERE;

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const flag = (k) => args.includes('--' + k);

const CONTRACT = opt('contract', 'e5-regatta');
const SEED = opt('seed', 'e5-regatta-01');
const LABEL = opt('label', 'probe');
const CTRL = opt('ctrl', null);
const IDLE = flag('idle');

const tapePath = path.join(OUT, `${LABEL}-tape.json`);
const logPath = path.join(OUT, `${LABEL}-views.jsonl`);
const sumPath = path.join(OUT, `${LABEL}-summary.json`);

const simArgs = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tapePath];
if (IDLE) simArgs.push('--policy=idle');

let controller = null;
if (CTRL) controller = (await import(path.resolve(HERE, CTRL))).default;

const child = spawn('node', simArgs, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
const logStream = fs.createWriteStream(logPath, { flags: 'w' });

let buf = '';
let outcome = null;
const rows = [];
let viewCount = 0;
let stderrTail = [];

function envelope() {
  try {
    const tape = JSON.parse(fs.readFileSync(tapePath, 'utf8'));
    const entries = tape.inputLog?.entries ?? [];
    const lastTick = entries.length ? Math.max(...entries.map((e) => e.t ?? e.tick ?? 0)) : 0;
    return {
      durationTicks: tape.inputLog?.durationTicks ?? null,
      lastEntryTick: lastTick,
      entries: entries.length,
      bytes: fs.statSync(tapePath).size,
      tapeEventLogHash: tape.eventLogHash ?? tape.outcome?.eventLogHash ?? null,
      viewVersion: tape.meta?.viewVersion ?? null,
    };
  } catch { return null; }
}

function writeSummary(extra = {}) {
  const s = { label: LABEL, contract: CONTRACT, seed: SEED, outcome, envelope: envelope(), views: viewCount, rows, ...extra };
  fs.writeFileSync(sumPath, JSON.stringify(s, null, 1));
  return s;
}

function compact(view) {
  const n = view.now ?? {};
  const r = n.regatta ?? {};
  const b = r.boat ?? {};
  const race = r.race ?? r;
  return {
    t: +(n.timers?.runSeconds ?? n.timers?.simTimeSeconds ?? 0).toFixed(2),
    wave: n.wave,
    gold: n.gold,
    pan: n.score?.goldPanned,
    hp: n.hero?.hp, hx: +(n.hero?.x ?? 0).toFixed(2), hz: +(n.hero?.z ?? 0).toFixed(2),
    bx: b.x !== undefined ? +b.x.toFixed(2) : null, bz: b.z !== undefined ? +b.z.toFixed(2) : null,
    spd: b.speed !== undefined ? +b.speed.toFixed(3) : null,
    hdg: b.heading !== undefined ? +b.heading.toFixed(3) : null,
    aboard: b.aboard ?? null,
    nextBuoy: race.nextBuoy?.id ?? null,
    passed: (race.buoysPassed ?? race.gatesPassed ?? []).map((g) => `${g.id}@${(g.passedAt ?? g.at ?? 0).toFixed?.(1) ?? g.passedAt}`),
    state: race.state ?? null, fin: race.finished ?? null, forf: race.forfeited ?? null,
    alive: n.threats?.alive,
    seams: (n.seams ?? []).filter((s) => s.active).map((s) => s.id),
    orders: (n.orders ?? []).map((o) => `${o.order?.verb ?? o.verb}:${o.status}${o.reason ? '(' + String(o.reason).slice(0, 46) + ')' : ''}`),
    offer: n.pendingOffer ? n.pendingOffer.map((o) => o.id) : null,
    secure: n.pendingSecure ? 'PENDING' : null,
  };
}

child.stderr.on('data', (d) => { stderrTail.push(String(d)); if (stderrTail.length > 40) stderrTail.shift(); });

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
      viewCount += 1;
      logStream.write(JSON.stringify(msg) + '\n');
      const row = compact(msg);
      rows.push(row);
      if (!IDLE && controller) {
        let reply;
        try { reply = controller(msg, rows); } catch (e) { reply = { blank: true, note: 'controller threw: ' + e.message }; }
        if (reply && reply.blank) child.stdin.write('\n');
        else child.stdin.write(JSON.stringify(reply.orders ?? reply) + '\n');
        row.sent = reply && reply.blank ? 'BLANK' : (reply.orders ?? reply).map((o) => o.verb + (o.pos ? `(${o.pos.x},${o.pos.z})` : o.seam ? `:${o.seam}` : ''));
      }
      if (viewCount % 10 === 0) writeSummary();
    } else if (msg.secured !== undefined || msg.waves !== undefined) {
      outcome = msg;
      logStream.write(JSON.stringify({ outcome: msg }) + '\n');
    }
  }
});

child.on('exit', (code) => {
  logStream.end();
  const s = writeSummary({ exitCode: code, stderrTail: stderrTail.slice(-6) });
  console.log('=== ' + LABEL + ' exit ' + code + ' views=' + viewCount);
  console.log('OUTCOME ' + JSON.stringify(outcome));
  console.log('ENVELOPE ' + JSON.stringify(s.envelope));
  const last = rows.slice(-3);
  for (const r of last) console.log('LAST ' + JSON.stringify(r));
  // intermediate-results law: promote to gauntlet-outcome.json when this run is the best so far
  try {
    const gp = path.join(OUT, 'gauntlet-outcome.json');
    let prev = null;
    try { prev = JSON.parse(fs.readFileSync(gp, 'utf8')); } catch {}
    const better = !prev || (outcome?.secured && !prev.secured)
      || (!!outcome?.secured === !!prev.secured && (outcome?.waves ?? -1) > (prev.waves ?? -1));
    if (better && outcome) {
      fs.writeFileSync(gp, JSON.stringify({
        ...outcome,
        tape: tapePath,
        scored: false,
        runsSoFar: (prev?.runsSoFar ?? 0) + 1,
        scoredAttempts: prev?.scoredAttempts ?? 0,
        worldModel: 'sim-import',
        envelope: s.envelope,
      }, null, 1));
    } else if (prev) {
      prev.runsSoFar = (prev.runsSoFar ?? 0) + 1;
      fs.writeFileSync(gp, JSON.stringify(prev, null, 1));
    }
  } catch (e) { console.log('outcome promote failed: ' + e.message); }
});
