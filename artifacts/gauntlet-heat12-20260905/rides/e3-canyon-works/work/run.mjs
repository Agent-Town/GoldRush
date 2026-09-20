// Runner: spawns gr-sim, drives a controller module, logs every view, writes outcome.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DIR = '/private/tmp/heat12-038cc280/artifacts/heat12/opus/e3-canyon-works';
const REPO = '/private/tmp/heat12-038cc280';
const CONTRACT = 'e3-canyon-works';
const SEED = 'e3-canyon-works-01';

const ctrlPath = process.argv[2];           // controller module path, or 'idle'
const tapeName = process.argv[3] || 'probe-tape.json';
const tape = path.join(DIR, tapeName);

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
let ctrl = null;
if (ctrlPath === 'idle') args.push('--policy=idle');
else ctrl = (await import(ctrlPath)).default;

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
const viewLog = [];
let outcome = null;
let buf = '';
let firstView = null;
const t0 = Date.now();

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
      if (!firstView) { firstView = msg; fs.writeFileSync(path.join(DIR, 'view0.json'), JSON.stringify(msg, null, 1)); }
      const n = msg.now;
      viewLog.push({
        t: +(n.timers?.runSeconds ?? 0).toFixed(2), w: n.wave, gold: n.gold,
        pan: n.score?.goldPanned, hp: +(n.hero?.hp ?? 0).toFixed(1), maxHp: n.hero?.maxHp,
        lvl: n.hero?.level,
        alive: n.threats?.alive, wr: n.threats?.wreckers,
        works: n.works?.standing, wrecked: n.works?.wrecked,
        cc: n.canyonConnect ? `${n.canyonConnect.powered}/${n.canyonConnect.required} c=${n.canyonConnect.complete} f=${n.canyonConnect.failed}` : null,
        pros: n.prospector ? `${n.prospector.x?.toFixed(0)},${n.prospector.z?.toFixed(0)}` : null,
        offer: n.pendingOffer ? n.pendingOffer.map(o => o.id).join('|') : null,
        sec: !!n.pendingSecure,
        boss: n.boss ? JSON.stringify(n.boss) : undefined,
      });
      if (ctrl) {
        let orders;
        try { orders = ctrl(msg, viewLog); } catch (e) { orders = null; console.error('CTRL ERR', e.message); }
        if (orders === null || orders === undefined) child.stdin.write('\n');
        else child.stdin.write(JSON.stringify(orders) + '\n');
      }
    } else if (msg.secured !== undefined || msg.waves !== undefined) {
      outcome = msg;
    }
  }
});
let errBuf = '';
child.stderr.on('data', d => { errBuf += d.toString(); });

child.on('close', () => {
  fs.writeFileSync(path.join(DIR, 'viewlog-' + tapeName.replace(/\.json$/, '') + '.json'), JSON.stringify(viewLog, null, 0));
  const rej = errBuf.split('\n').filter(l => l.includes('rejected')).slice(0, 8);
  let env = {};
  try {
    const tp = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const entries = tp.inputLog?.entries ?? [];
    env = {
      durationTicks: tp.inputLog?.durationTicks,
      lastEntryTick: entries.length ? entries[entries.length - 1].tick : null,
      entries: entries.length,
      bytes: fs.statSync(tape).size,
    };
  } catch {}
  const summary = { outcome, env, views: viewLog.length, rejected: rej, wall: ((Date.now() - t0) / 1000).toFixed(1) };
  fs.writeFileSync(path.join(DIR, 'last-run.json'), JSON.stringify(summary, null, 1));
  console.log(JSON.stringify(summary, null, 1));
  console.log('TAIL', JSON.stringify(viewLog.slice(-6)));
});
