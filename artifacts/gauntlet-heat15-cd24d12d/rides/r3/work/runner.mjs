// Heat 15 ride 3 runner — generation 136.
// Spawns gr-sim, drives a controller, logs every view, and writes gauntlet-outcome.json
// plus all three envelope axes on EVERY child exit (the intermediate-results law, automatic).
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const HERE = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/wt-heat15-arena';
const OUT = `${HERE}/artifacts/heat15/opus/r3`;

const label = process.argv[2] || 'tune-1';
const ctrlPath = process.argv[3] || `${OUT}/ctrl-v1.mjs`;
const tape = `${OUT}/${label}-tape.json`;
const logPath = `${OUT}/${label}-views.jsonl`;
writeFileSync(logPath, '');

const { makeController } = await import(ctrlPath);
const controller = makeController();

const args = [
  'scripts/gr-sim.mjs',
  '--contract', 'e5-regatta',
  '--seed', 'e5-regatta-01',
  '--difficulty', 'trail',
  '--tape', tape,
];
const child = spawn('node', args, { cwd: HERE, stdio: ['pipe', 'pipe', 'pipe'] });

let buf = '';
let views = 0;
let submissions = 0;
let outcome = null;
const rows = [];
const stderrTail = [];

child.stderr.on('data', (d) => {
  const s = String(d);
  for (const line of s.split('\n')) if (line.trim()) stderrTail.push(line.trim());
  while (stderrTail.length > 40) stderrTail.shift();
});

child.stdout.on('data', (d) => {
  buf += String(d);
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i);
    buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg && msg.schema === 'goldrush.view.v1') {
      views += 1;
      const now = msg.now || {};
      const r = now.regatta || {};
      const b = r.boat || {};
      const row = {
        v: views,
        t: +(now.timers?.runSeconds ?? 0).toFixed(3),
        wave: now.wave,
        gold: now.gold,
        pan: now.score?.goldPanned,
        hp: now.hero?.hp,
        hx: now.hero?.x != null ? +now.hero.x.toFixed(2) : null,
        hz: now.hero?.z != null ? +now.hero.z.toFixed(2) : null,
        bx: b.x != null ? +b.x.toFixed(4) : null,
        bz: b.z != null ? +b.z.toFixed(4) : null,
        spd: b.speed != null ? +b.speed.toFixed(4) : null,
        hdg: b.heading != null ? +b.heading.toFixed(4) : null,
        aboard: b.aboard ?? null,
        next: r.nextBuoy?.id ?? null,
        passed: (r.buoysPassed || []).map((g) => `${g.id}@${g.atSeconds}`),
        state: r.state ?? null,
        fin: r.finished ?? null,
        forf: r.forfeited ?? null,
        alive: now.threats?.alive,
        works: now.works?.byKind,
        offer: (now.pendingOffer || []).map((o) => o.id),
        secure: now.pendingSecure ? JSON.stringify(now.pendingSecure) : null,
        fails: (now.orders || []).filter((o) => o.status === 'failed')
          .map((o) => `${o.order?.verb}:${o.reason ?? ''}`),
      };
      rows.push(row);
      appendFileSync(logPath, JSON.stringify({ row, rawRegatta: views <= 2 ? r : undefined }) + '\n');
      console.log(`v${row.v} t=${row.t} w=${row.wave} g=${row.gold}/${row.pan} b=(${row.bx},${row.bz}) spd=${row.spd} ab=${row.aboard} next=${row.next} st=${row.state} passed=${row.passed.length} fails=${row.fails.join('|')}`);
      let orders;
      try { orders = controller(msg, row); } catch (e) { console.log('CTRL ERROR', e.message); orders = null; }
      if (orders === null || orders === undefined) {
        child.stdin.write('\n');
      } else {
        const bad = JSON.stringify(orders).includes('null');
        if (bad) { console.log('REFUSING TO SEND non-finite array'); child.stdin.write('\n'); }
        else { submissions += 1; child.stdin.write(JSON.stringify(orders) + '\n'); }
      }
    } else if (msg && (msg.secured !== undefined || msg.waves !== undefined)) {
      outcome = msg;
    }
  }
});

child.on('exit', (code) => {
  const env = {};
  try {
    const t = require(tape);
    const il = t.inputLog || {};
    const entries = il.entries || [];
    const lastTick = entries.length ? Math.max(...entries.map((e) => e.t ?? e.tick ?? 0)) : null;
    env.durationTicks = il.durationTicks ?? null;
    env.lastEntryTick = lastTick;
    env.entryCount = entries.length;
    env.bytes = readFileSync(tape).length;
    env.tapeHash = t.eventLogHash ?? t.meta?.eventLogHash ?? null;
  } catch (e) { env.error = e.message; }
  const summary = {
    label, code, outcome, env, views, submissions,
    lastRows: rows.slice(-6),
    stderrTail: stderrTail.slice(-12),
  };
  writeFileSync(`${OUT}/${label}-summary.json`, JSON.stringify(summary, null, 2));
  console.log('OUTCOME', JSON.stringify(outcome));
  console.log('ENVELOPE', JSON.stringify(env));

  // Intermediate-results law: (over)write the best-so-far row on EVERY exit.
  const secured = !!(outcome && outcome.secured);
  let best = null;
  try { best = require(`${OUT}/gauntlet-outcome.json`); } catch { best = null; }
  const better = !best || (secured && !best.secured)
    || (secured === !!best.secured && (outcome?.waves ?? 0) > (best.waves ?? 0));
  if (better) {
    writeFileSync(`${OUT}/gauntlet-outcome.json`, JSON.stringify({
      ...(outcome || {}),
      tape,
      scored: false,
      runsSoFar: 'see report',
      scoredAttempts: 0,
      worldModel: 'sim-import',
      envelope: env,
    }, null, 2));
  }
});
