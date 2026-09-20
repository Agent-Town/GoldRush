// Runner: spawns gr-sim, drives a controller module, logs every view, writes
// gauntlet-outcome.json on EVERY child exit (the intermediate-results law).
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import fs from 'node:fs';
import path from 'node:path';

const REPO = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa';
const WS = `${REPO}/artifacts/heat14/opus/the-claim`;
const CONTRACT = 'the-claim';
const SEED = 'e1-the-claim-01';

const args = process.argv.slice(2);
const label = args[0] || 'probe-idle';
const ctrlPath = args[1] || null; // omit => idle
const tape = `${WS}/${label}-tape.json`;
const logPath = `${WS}/${label}-views.jsonl`;

const simArgs = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (!ctrlPath) simArgs.push('--policy=idle');

let controller = null;
if (ctrlPath) {
  const mod = await import(ctrlPath.startsWith('/') ? ctrlPath : `${WS}/${ctrlPath}`);
  controller = mod.makeController();
}

const child = spawn('node', simArgs, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
const rl = createInterface({ input: child.stdout, crlfDelay: Infinity });
const logFd = fs.openSync(logPath, 'w');
let stderrTail = '';
child.stderr.on('data', (d) => { stderrTail = (stderrTail + d.toString()).slice(-4000); });

const rows = [];
let outcome = null;
let views = 0;

for await (const line of rl) {
  if (!line.trim()) continue;
  let obj;
  try { obj = JSON.parse(line); } catch { continue; }
  if (obj.schema === 'goldrush.view.v1') {
    views += 1;
    fs.writeSync(logFd, JSON.stringify(obj) + '\n');
    const n = obj.now;
    const row = {
      v: views,
      t: +(n.timers?.runSeconds ?? n.timers?.simTimeSeconds ?? 0).toFixed?.(2) || n.timers?.runSeconds,
      wave: n.wave,
      gold: n.gold,
      pan: n.score?.goldPanned,
      hp: n.hero?.hp, maxHp: n.hero?.maxHp,
      hx: n.hero?.x != null ? +n.hero.x.toFixed(1) : null,
      hz: n.hero?.z != null ? +n.hero.z.toFixed(1) : null,
      alive: n.threats?.alive, wr: n.threats?.wreckers, th: n.threats?.thieves,
      st: n.works?.standing, wk: n.works?.wrecked,
      byKind: n.works?.byKind,
      offer: n.pendingOffer ? n.pendingOffer.map((o) => o.id).join(',') : null,
      sec: n.pendingSecure ? 'PENDING' : null,
    };
    rows.push(row);
    if (controller) {
      let out;
      try { out = controller.decide(obj, rows); } catch (e) {
        console.error('CONTROLLER THREW', e);
        out = '\n';
      }
      child.stdin.write(typeof out === 'string' ? out : JSON.stringify(out) + '\n');
    }
    continue;
  }
  if (obj.secured !== undefined || obj.waves !== undefined) outcome = obj;
}

await new Promise((res) => child.on('close', res));
fs.closeSync(logFd);

// ---- envelope axes, measured off the reel that now exists
let env = null;
if (fs.existsSync(tape)) {
  const raw = fs.readFileSync(tape, 'utf8');
  const t = JSON.parse(raw);
  const entries = t.inputLog?.entries ?? [];
  const ticks = entries.map((e) => e.t ?? e.tick ?? 0);
  env = {
    bytes: Buffer.byteLength(raw),
    entries: entries.length,
    durationTicks: t.inputLog?.durationTicks ?? t.durationTicks ?? null,
    lastEntryTick: ticks.length ? Math.max(...ticks) : null,
    eventLogHash: t.outcome?.eventLogHash ?? t.eventLogHash ?? null,
    era: t.meta?.engineEra ?? t.engineEra ?? null,
  };
}

const summary = { label, tape, views, outcome, env, stderrTail: stderrTail.slice(-600) };
fs.writeFileSync(`${WS}/${label}-summary.json`, JSON.stringify(summary, null, 1));
fs.writeFileSync(`${WS}/${label}-rows.json`, JSON.stringify(rows, null, 0));

// ---- best-so-far promotion (intermediate-results law)
const OUT = `${WS}/gauntlet-outcome.json`;
const runsLog = `${WS}/runs.json`;
const prior = fs.existsSync(runsLog) ? JSON.parse(fs.readFileSync(runsLog, 'utf8')) : [];
prior.push({ label, tape, outcome, env });
fs.writeFileSync(runsLog, JSON.stringify(prior, null, 1));
const scoredAttempts = prior.filter((r) => /^attempt-/.test(r.label)).length;
const key = (r) => [r.outcome?.secured ? 1 : 0, r.outcome?.waves ?? 0, r.outcome?.gold ?? 0, r.outcome?.timeMs ?? 0];
const best = prior.slice().sort((a, b) => {
  const ka = key(a), kb = key(b);
  for (let i = 0; i < ka.length; i++) if (kb[i] !== ka[i]) return kb[i] - ka[i];
  return 0;
})[0];
fs.writeFileSync(OUT, JSON.stringify({
  ...(best.outcome ?? {}),
  tape: best.tape,
  scored: /^attempt-/.test(best.label),
  runsSoFar: prior.length,
  scoredAttempts,
  worldModel: 'sim-import',
  envelope: best.env,
}, null, 1));

console.log(JSON.stringify(summary.outcome));
console.log('ENV', JSON.stringify(env));
console.log('ROWS');
for (const r of rows) console.log(JSON.stringify(r));
