// Node runner: spawns gr-sim, drives a controller module, logs every view, writes
// gauntlet-outcome.json + all three envelope axes on every child exit.
// Usage: node runner.mjs <label> [controllerPath|--idle]
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const WS = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa/artifacts/heat14/opus/e8-far-side';
const REPO = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa';
const CONTRACT = 'e8-far-side';
const SEED = 'e8-far-side-01';

const label = process.argv[2] || 'probe';
const ctrlArg = process.argv[3] || '--idle';
const tape = path.join(WS, `${label}-tape.json`);
const viewLog = path.join(WS, `${label}-views.jsonl`);
const tableLog = path.join(WS, `${label}-table.txt`);

let controller = null;
if (ctrlArg !== '--idle') {
  const mod = await import(path.resolve(WS, ctrlArg));
  controller = mod.default || mod.controller;
}

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (!controller) args.push('--policy=idle');

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
const rl = readline.createInterface({ input: child.stdout });

const views = [];
const rows = [];
let outcome = null;
let state = {};
let viewCount = 0;

function fmt(n, d = 1) { return typeof n === 'number' ? n.toFixed(d) : String(n); }

rl.on('line', (line) => {
  let obj;
  try { obj = JSON.parse(line); } catch { return; }
  if (obj.schema === 'goldrush.view.v1' || obj.now) {
    viewCount += 1;
    views.push(obj);
    fs.appendFileSync(viewLog, JSON.stringify(obj) + '\n');
    const n = obj.now || {};
    const air = n.air || {};
    const cr = air.crossing || {};
    const suit = air.suit || {};
    const w = n.works || {};
    const sc = n.score || {};
    const t = (n.timers && (n.timers.runSeconds ?? n.timers.simTimeSeconds)) ?? 0;
    rows.push([
      `v${viewCount}`, `t=${fmt(t)}`, `w${n.wave}`,
      `hp=${fmt(n.hero && n.hero.hp)}/${fmt(n.hero && n.hero.maxHp)}`,
      `h=(${fmt(n.hero && n.hero.x)},${fmt(n.hero && n.hero.z)})`,
      `p=(${fmt(n.prospector && n.prospector.x)},${fmt(n.prospector && n.prospector.z)})`,
      `g=${n.gold}`, `pan=${sc.goldPanned}`, `stl=${sc.goldStolen}`,
      `alive=${n.threats && n.threats.alive}`, `wr=${n.threats && n.threats.wreckers}`, `th=${n.threats && n.threats.thieves}`,
      `std=${w.standing}`, `wrk=${w.wrecked}`,
      `suit=${fmt(suit.seconds)}`, `dome=${suit.inDome ?? 'null'}`,
      `cred=${cr.credited}/${cr.required}`, `win=${cr.window}`, `cw=${cr.creditedThisWindow}`,
      `reach=${(cr.reached || []).length}`, `bl=${cr.breathlessEntries}`, `wh=${cr.windowHeldEntries}`,
      `probe=${n.probeRecovery ? n.probeRecovery.recovered : '-'}`,
    ].join(' '));
    fs.writeFileSync(tableLog, rows.join('\n'));
    if (controller) {
      try {
        const out = controller(obj, state, views);
        child.stdin.write((out === null || out === undefined ? '' : JSON.stringify(out)) + '\n');
      } catch (e) {
        fs.appendFileSync(path.join(WS, `${label}-err.txt`), String(e && e.stack) + '\n');
        child.stdin.write('\n');
      }
    }
    return;
  }
  if (obj.secured !== undefined || obj.endReason) { outcome = obj; }
});

let stderrBuf = '';
child.stderr.on('data', (d) => { stderrBuf += d.toString(); });

child.on('exit', (code) => {
  fs.writeFileSync(path.join(WS, `${label}-stderr.txt`), stderrBuf.slice(-8000));
  const env = { ticks: null, lastEntryTick: null, entries: null, bytes: null };
  try {
    const raw = fs.readFileSync(tape, 'utf8');
    env.bytes = Buffer.byteLength(raw);
    const tp = JSON.parse(raw);
    const il = tp.inputLog || {};
    env.ticks = il.durationTicks;
    const ents = il.entries || [];
    env.entries = ents.length;
    env.lastEntryTick = ents.length ? (ents[ents.length - 1].t ?? ents[ents.length - 1].tick) : null;
    env.tapeHash = (tp.meta && tp.meta.eventLogHash) || tp.eventLogHash;
  } catch (e) { env.err = e.message; }
  const summary = { label, code, outcome, envelope: env, views: viewCount, tape };
  fs.writeFileSync(path.join(WS, `${label}-summary.json`), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
  console.log('\n--- last 12 rows ---\n' + rows.slice(-12).join('\n'));
});
