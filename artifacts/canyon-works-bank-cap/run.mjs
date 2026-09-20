// Drives one gr-sim ride of e3-canyon-works through a scripted policy and writes the tape,
// the per-turn view log and the outcome. Adapted from heat 12's own runner
// (`artifacts/gauntlet-heat12-20260905/rides/e3-canyon-works/work/run.mjs`) so the two rides are
// read the same way; the only changes are repo-relative paths and a wider recorded row.
//
//   node artifacts/canyon-works-bank-cap/run.mjs <controller.mjs|idle> <tape-name.json> [seed]
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const REPO = path.resolve(DIR, '..', '..');
const CONTRACT = 'e3-canyon-works';

const ctrlArg = process.argv[2];
const tapeName = process.argv[3] || 'probe-tape.json';
const SEED = process.argv[4] || 'e3-canyon-works-01';
const tape = path.join(DIR, tapeName);

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
let ctrl = null;
if (ctrlArg === 'idle') args.push('--policy=idle');
else ctrl = (await import(path.resolve(DIR, ctrlArg))).default;

const child = spawn(process.execPath, args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
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
      if (!firstView) {
        firstView = msg;
        fs.writeFileSync(path.join(DIR, `view0-${tapeName.replace(/\.json$/, '')}.json`), JSON.stringify(msg, null, 1));
      }
      const n = msg.now;
      viewLog.push({
        t: +(n.timers?.runSeconds ?? 0).toFixed(2), w: n.wave, gold: n.gold,
        pan: n.score?.goldPanned, spent: n.score?.goldSpent,
        hp: +(n.hero?.hp ?? 0).toFixed(1), lvl: n.hero?.level,
        alive: n.threats?.alive, wr: n.threats?.wreckers,
        works: n.works?.standing, wrecked: n.works?.wrecked,
        beacons: n.works?.byKind?.sentry_beacon,
        cc: n.canyonConnect ? `${n.canyonConnect.powered}/${n.canyonConnect.required} c=${n.canyonConnect.complete} f=${n.canyonConnect.failed}` : null,
        pros: n.prospector ? `${n.prospector.x?.toFixed(0)},${n.prospector.z?.toFixed(0)}` : null,
        offer: n.pendingOffer ? n.pendingOffer.map((o) => o.id).join('|') : null,
        sec: !!n.pendingSecure,
      });
      if (ctrl) {
        let orders;
        try { orders = ctrl(msg, viewLog); } catch (e) { orders = null; console.error('CTRL ERR', e.message); }
        if (orders === null || orders === undefined) child.stdin.write('\n');
        else child.stdin.write(`${JSON.stringify(orders)}\n`);
      }
    } else if (msg.secured !== undefined || msg.waves !== undefined) {
      outcome = msg;
    }
  }
});
let errBuf = '';
child.stderr.on('data', (d) => { errBuf += d.toString(); });

child.on('close', () => {
  const stem = tapeName.replace(/\.json$/, '');
  fs.writeFileSync(path.join(DIR, `viewlog-${stem}.json`), JSON.stringify(viewLog, null, 0));
  const rej = errBuf.split('\n').filter((l) => l.includes('rejected')).slice(0, 8);
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
  const summary = { seed: SEED, outcome, env, views: viewLog.length, rejected: rej, wall: ((Date.now() - t0) / 1000).toFixed(1) };
  fs.writeFileSync(path.join(DIR, `last-run-${stem}.json`), JSON.stringify(summary, null, 1));
  console.log(JSON.stringify(summary, null, 1));
  const latch = viewLog.find((r) => r.cc && r.cc.includes('c=true'));
  console.log('LATCH', latch ? JSON.stringify(latch) : 'never completed');
  console.log('TAIL', JSON.stringify(viewLog.slice(-4)));
});
