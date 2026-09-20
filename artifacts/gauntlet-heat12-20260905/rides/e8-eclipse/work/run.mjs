// Node runner: spawn gr-sim, drive the controller, log every view, and write
// gauntlet-outcome.json on EVERY child exit (the intermediate-results law, made automatic).
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { makeController } from './controller.mjs';

const DIR = '/private/tmp/heat12-038cc280/artifacts/heat12/opus/e8-eclipse';
const REPO = '/private/tmp/heat12-038cc280';
const label = process.argv[2] || 'tune-1';
const scored = process.argv[3] === 'scored';
const tape = path.join(DIR, `${label}-tape.json`);
const WORLD_MODEL = 'sim-import';

const decide = makeController();
const views = [];
let outcome = null;
let buf = '';

const child = spawn('node', [
  'scripts/gr-sim.mjs', '--contract', 'e8-eclipse', '--seed', 'e8-eclipse-01',
  '--difficulty', 'trail', '--tape', tape,
], { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });

let stderr = '';
child.stderr.on('data', (d) => { stderr += d.toString(); });

child.stdout.on('data', (chunk) => {
  buf += chunk.toString();
  let nl;
  while ((nl = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, nl);
    buf = buf.slice(nl + 1);
    if (!line.trim()) continue;
    let obj;
    try { obj = JSON.parse(line); } catch { continue; }
    if (obj.schema) {
      const n = obj.now;
      const air = n.air || {};
      views.push({
        t: n.timers.runSeconds, wave: n.wave, hp: n.hero.hp, maxHp: n.hero.maxHp, lvl: n.hero.level,
        gold: n.gold, panned: n.score.goldPanned, alive: n.threats.alive,
        works: n.works.byKind, wrecked: n.works.wrecked,
        suit: air.suit && air.suit.seconds, inDome: air.suit && air.suit.inDome,
        worked: air.regolith && air.regolith.worked, breathless: air.regolith && air.regolith.breathlessPans,
        ecl: air.eclipse ? { a: air.eclipse.arrived, w: air.eclipse.arrivedAtWave, after: air.eclipse.groundsWorkedAfter, req: air.eclipse.requiredAfter, off: air.eclipse.offline.length } : null,
        prospector: n.prospector,
      });
      let orders;
      try { orders = decide(obj); } catch (e) { console.error('CONTROLLER ERROR', e); orders = []; }
      child.stdin.write(orders === null ? '\n' : JSON.stringify(orders) + '\n');
    } else if (obj.secured !== undefined) {
      outcome = obj;
    }
  }
});

child.on('close', (code) => {
  fs.writeFileSync(path.join(DIR, `${label}-views.json`), JSON.stringify(views, null, 1));
  if (stderr.trim()) fs.writeFileSync(path.join(DIR, `${label}-stderr.txt`), stderr.slice(-4000));
  let env = null;
  try {
    const t = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const il = t.inputLog || {};
    env = {
      durationTicks: il.durationTicks,
      entries: (il.entries || []).length,
      lastEntryTick: (il.entries || []).length ? il.entries[il.entries.length - 1].tick : null,
      bytes: fs.statSync(tape).size,
    };
  } catch { /* no tape */ }
  const last = views[views.length - 1] || {};
  console.log(label, 'rc', code, JSON.stringify(outcome));
  console.log('ENVELOPE', JSON.stringify(env));
  console.log('LAST', JSON.stringify(last));

  // best-so-far
  const outPath = path.join(DIR, 'gauntlet-outcome.json');
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(outPath, 'utf8')); } catch { /* first run */ }
  const runs = (prev && prev.runsSoFar ? prev.runsSoFar : 1) + (prev ? 1 : 0);
  const scoredN = (prev && prev.scoredAttempts ? prev.scoredAttempts : 0) + (scored ? 1 : 0);
  const better = !prev || !prev.secured
    ? true
    : outcome && outcome.secured && (outcome.waves > (prev.waves || 0));
  const row = (outcome && better)
    ? { ...outcome, tape, scored, runsSoFar: runs, scoredAttempts: scoredN, worldModel: WORLD_MODEL, envelope: env }
    : { ...prev, runsSoFar: runs, scoredAttempts: scoredN };
  fs.writeFileSync(outPath, JSON.stringify(row, null, 1));
});
