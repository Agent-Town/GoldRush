// Node runner: spawns gr-sim, drives a controller, logs every view, writes gauntlet-outcome.json on exit.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WS = '/tmp/heat12-038cc280/artifacts/heat12/opus/e4-gusher-county';
const REPO = '/tmp/heat12-038cc280';
const CONTRACT = 'e4-gusher-county';
const SEED = 'e4-gusher-county-01';
const WORLD_MODEL = 'sim-import';

export async function ride({ name, controller, policyIdle = false, scored = false }) {
  const tape = path.join(WS, `${name}-tape.json`);
  const viewLog = path.join(WS, `${name}-views.jsonl`);
  const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
  if (policyIdle) args.push('--policy=idle');
  const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
  const vs = fs.createWriteStream(viewLog);
  let buf = '';
  let outcome = null;
  const views = [];
  let stderr = '';
  child.stderr.on('data', d => { stderr += d.toString(); });
  child.stdout.on('data', chunk => {
    buf += chunk.toString();
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i).trim();
      buf = buf.slice(i + 1);
      if (!line) continue;
      let obj;
      try { obj = JSON.parse(line); } catch { continue; }
      if (obj && obj.schema === 'goldrush.view.v1') {
        views.push(obj);
        vs.write(JSON.stringify(obj) + '\n');
        if (!policyIdle) {
          let reply;
          try { reply = controller(obj, views); } catch (e) { reply = '[]'; console.error('CTRL ERR', e); }
          if (reply === null || reply === undefined) reply = '\n';
          if (typeof reply !== 'string') reply = JSON.stringify(reply) + '\n';
          if (!reply.endsWith('\n')) reply += '\n';
          child.stdin.write(reply);
        }
      } else if (obj && typeof obj.secured === 'boolean') {
        outcome = obj;
      }
    }
  });
  const code = await new Promise(res => child.on('close', res));
  vs.end();
  fs.writeFileSync(path.join(WS, `${name}-stderr.txt`), stderr);

  // envelope
  let env = {};
  try {
    const t = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const entries = t.inputLog?.entries || [];
    env = {
      durationTicks: t.inputLog?.durationTicks,
      lastEntryTick: entries.length ? entries[entries.length - 1].tick : null,
      entries: entries.length,
      bytes: fs.statSync(tape).size,
      tapeHash: t.eventLogHash || t.meta?.eventLogHash,
    };
  } catch {}
  const rec = { name, code, outcome, env, views: views.length, scored, tape };
  fs.writeFileSync(path.join(WS, `${name}-summary.json`), JSON.stringify(rec, null, 2));
  updateBest(rec);
  return { ...rec, viewsArr: views };
}

const STATE = path.join(WS, '.runs.json');
function updateBest(rec) {
  let st = { runs: [], scored: 0 };
  try { st = JSON.parse(fs.readFileSync(STATE, 'utf8')); } catch {}
  st.runs.push({ name: rec.name, outcome: rec.outcome, env: rec.env, scored: rec.scored, tape: rec.tape });
  if (rec.scored) st.scored += 1;
  fs.writeFileSync(STATE, JSON.stringify(st, null, 2));
  const rank = r => {
    const o = r.outcome || {};
    return [o.secured ? 1 : 0, o.waves || 0, o.timeMs || 0, o.gold || 0];
  };
  let best = st.runs[0];
  for (const r of st.runs) {
    const a = rank(r), b = rank(best);
    for (let i = 0; i < a.length; i++) { if (a[i] !== b[i]) { if (a[i] > b[i]) best = r; break; } }
  }
  const out = {
    ...(best.outcome || {}),
    tape: best.tape,
    scored: !!best.scored,
    runsSoFar: st.runs.length,
    scoredAttempts: st.scored,
    worldModel: WORLD_MODEL,
    envelope: best.env,
  };
  fs.writeFileSync(path.join(WS, 'gauntlet-outcome.json'), JSON.stringify(out, null, 2));
}
