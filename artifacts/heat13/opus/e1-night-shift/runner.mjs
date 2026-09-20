// Gen-76 runner: spawn gr-sim, drive a controller, log every view, write outcome on exit.
// Shell redirection is refused in this arena; the runner is the only reliable transport.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WS = '/private/tmp/heat13-569a41f9/artifacts/heat13/opus/e1-night-shift';
const REPO = '/private/tmp/heat13-569a41f9';
const CONTRACT = 'e1-night-shift';
const SEED = 'e1-night-shift-01';

export async function ride({ label, controller, idle = false }) {
  const tape = path.join(WS, `${label}-tape.json`);
  const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
  if (idle) args.push('--policy=idle');
  const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
  const rows = [];
  let outcome = null;
  let buf = '';
  let stderr = '';
  child.stderr.on('data', (d) => { stderr += d.toString(); });

  const done = new Promise((resolve) => child.on('close', resolve));

  child.stdout.on('data', (d) => {
    buf += d.toString();
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i);
      buf = buf.slice(i + 1);
      if (!line.trim()) continue;
      let obj;
      try { obj = JSON.parse(line); } catch { continue; }
      if (obj.schema === 'goldrush.view.v1') {
        const now = obj.now || {};
        rows.push({
          t: +(now.timers?.runSeconds ?? now.timers?.simTimeSeconds ?? 0).toFixed?.(1) || 0,
          w: now.wave, hp: now.hero?.hp, mhp: now.hero?.maxHp, lvl: now.hero?.level,
          hx: now.hero?.x, hz: now.hero?.z,
          g: now.gold, pan: now.score?.goldPanned,
          works: now.works?.standing ?? (now.works?.entries || []).length,
          wr: now.works?.wrecked, alive: now.threats?.alive,
          byKind: now.works?.byKind,
        });
        if (!idle) {
          const orders = controller(obj, rows);
          if (orders === null || orders === undefined) child.stdin.write('\n');
          else child.stdin.write(JSON.stringify(orders) + '\n');
        }
      } else if (obj.secured !== undefined || obj.endReason !== undefined) {
        outcome = obj;
      }
    }
  });

  await done;

  // envelope
  let env = {};
  try {
    const tp = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const entries = tp.inputLog?.entries || [];
    const ticks = entries.map((e) => e.t ?? e.tick ?? 0);
    env = {
      durationTicks: tp.inputLog?.durationTicks,
      lastEntryTick: ticks.length ? Math.max(...ticks) : null,
      entries: entries.length,
      bytes: fs.statSync(tape).size,
    };
  } catch (e) { env = { err: e.message }; }

  const summary = { label, tape, outcome, env, views: rows.length, stderrTail: stderr.slice(-400) };
  fs.writeFileSync(path.join(WS, `${label}-summary.json`), JSON.stringify(summary, null, 1));
  fs.writeFileSync(path.join(WS, `${label}-views.json`), JSON.stringify(rows, null, 0));
  promote(summary);
  return summary;
}

// Intermediate-results law: (over)write gauntlet-outcome.json with the BEST so far, every run.
function promote(s) {
  const f = path.join(WS, 'gauntlet-outcome.json');
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(f, 'utf8')); } catch {}
  const runs = (prev?.runsSoFar ?? 0) + 1;
  const scoredAttempts = (prev?.scoredAttempts ?? 0) + (/^attempt-/.test(s.label) ? 1 : 0);
  const o = s.outcome || {};
  const better = !prev || !prev.secured
    ? (o.secured || !prev || (o.waves ?? 0) > (prev.waves ?? -1) ||
       ((o.waves ?? 0) === (prev.waves ?? -1) && (o.timeMs ?? 0) / 1000 > (prev.timeAlive ?? -1)))
    : false;
  const base = better ? {
    ...o,
    timeAlive: o.timeMs !== undefined ? o.timeMs / 1000 : undefined,
    tape: s.tape,
    scored: /^attempt-/.test(s.label),
    envelope: s.env,
  } : { ...prev };
  fs.writeFileSync(f, JSON.stringify({
    ...base,
    runsSoFar: runs,
    scoredAttempts,
    worldModel: 'sim-import',
  }, null, 1));
}
