// Gen 132 runner: spawn gr-sim, drive a controller, log every view, write outcome + envelope.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WS = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa/artifacts/heat14/opus/e8-low-orbit';
const REPO = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa';

const label = process.argv[2];               // e.g. probe-idle / tune-1 / attempt-1
const ctrlPath = process.argv[3] || null;    // controller module path (absolute) or 'idle'
const tape = path.join(WS, `${label}-tape.json`);
const logPath = path.join(WS, `${label}-views.jsonl`);
const tblPath = path.join(WS, `${label}-table.txt`);

const args = ['scripts/gr-sim.mjs', '--contract', 'e8-low-orbit', '--seed', 'e8-low-orbit-01',
  '--difficulty', 'trail', '--tape', tape];
if (ctrlPath === 'idle') args.push('--policy', 'idle');

const ctrl = ctrlPath && ctrlPath !== 'idle' ? (await import(ctrlPath)).default : null;

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
let buf = '';
let outcome = null;
const table = [];
const logFd = fs.openSync(logPath, 'w');
let n = 0;

child.stdout.on('data', (d) => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i); buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let msg; try { msg = JSON.parse(line); } catch { continue; }
    if (msg.schema === 'goldrush.view.v1') {
      n += 1;
      fs.writeSync(logFd, JSON.stringify(msg) + '\n');
      const now = msg.now || {};
      const air = now.air || {};
      const cr = air.crossing || {};
      const s = air.suit || {};
      const lo = now.lowOrbit || {};
      table.push([
        `v${n}`, `t=${(now.timers?.runSeconds ?? 0).toFixed(1)}`, `w${now.wave ?? 0}`,
        `g=${now.gold ?? 0}`, `pan=${now.score?.goldPanned ?? 0}`, `stol=${now.score?.goldStolen ?? 0}`,
        `hp=${(now.hero?.hp ?? 0).toFixed(0)}/${now.hero?.maxHp ?? 0}`,
        `h=(${(now.hero?.x ?? 0).toFixed(1)},${(now.hero?.z ?? 0).toFixed(1)})`,
        `p=(${(now.prospector?.x ?? 0).toFixed(1)},${(now.prospector?.z ?? 0).toFixed(1)})`,
        `suit=${s.seconds ?? '-'}`, `dome=${s.inDome ?? 'VAC'}`,
        `cred=${cr.credited ?? '-'}/${cr.required ?? '-'}`, `win=${cr.window ?? '-'}`,
        `cw=${cr.creditedThisWindow ?? '-'}`, `reach=${(cr.reached || []).length}`,
        `breathless=${cr.breathlessEntries ?? '-'}`,
        `works=${now.works?.standing ?? 0}/${now.works?.wrecked ?? 0}`,
        `alive=${now.threats?.alive ?? 0}`, `drift=${lo.driftSteps ?? '-'}`,
      ].join(' '));
      if (ctrl) {
        let reply;
        try { reply = ctrl(msg, n); } catch (e) { reply = '\n'; table.push(`CTRL-ERR ${e.message}`); }
        child.stdin.write(typeof reply === 'string' ? reply : JSON.stringify(reply) + '\n');
      }
    } else if (msg.secured !== undefined) {
      outcome = msg;
    }
  }
});
let err = '';
child.stderr.on('data', (d) => { err += d.toString(); });

child.on('exit', (code) => {
  fs.closeSync(logFd);
  fs.writeFileSync(tblPath, table.join('\n') + '\n');
  let env = {};
  try {
    const t = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const entries = t.inputLog?.entries || [];
    const lastTick = entries.length ? Math.max(...entries.map((e) => e.t ?? e.tick ?? 0)) : 0;
    env = {
      durationTicks: t.inputLog?.durationTicks,
      lastEntryTick: lastTick,
      entries: entries.length,
      bytes: fs.statSync(tape).size,
      tapeHash: t.eventLogHash || t.meta?.eventLogHash,
    };
  } catch (e) { env = { err: e.message }; }
  const row = { label, outcome, envelope: env, views: n, exit: code, stderrTail: err.slice(-800) };
  fs.writeFileSync(path.join(WS, `${label}-summary.json`), JSON.stringify(row, null, 2));
  console.log(JSON.stringify(row, null, 2));
});
