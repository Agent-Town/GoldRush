// Heat 12 runner: spawns gr-sim, drives a controller module, logs every view,
// writes gauntlet-outcome.json on EVERY child exit (intermediate-results law).
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DIR = '/private/tmp/heat12-038cc280/artifacts/heat12/opus/e8-low-orbit';
const REPO = '/private/tmp/heat12-038cc280';
const CONTRACT = 'e8-low-orbit';
const SEED = 'e8-low-orbit-01';
const WORLD_MODEL = 'sim-import';

const label = process.argv[2] || 'probe';
const ctrlPath = process.argv[3] || null;   // null => idle policy
const tape = path.join(DIR, `${label}-tape.json`);
const viewLog = path.join(DIR, `${label}-views.jsonl`);

let mk = null;
if (ctrlPath) {
  const mod = await import(ctrlPath + `?v=${Date.now()}`);
  mk = mod.makeController;
}

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (!ctrlPath) args.push('--policy', 'idle');

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
const vlog = fs.createWriteStream(viewLog);
let buf = '';
let outcome = null;
let nViews = 0;
const ctrl = mk ? mk() : null;

child.stdout.on('data', (d) => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i);
    buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg.schema === 'goldrush.view.v1') {
      nViews++;
      vlog.write(JSON.stringify({ n: nViews, t: msg.now?.timers?.runSeconds, view: msg }) + '\n');
      if (ctrl) {
        let reply;
        try { reply = ctrl.decide(msg); } catch (e) { reply = '\n'; console.error('CTRL ERR', e); }
        if (reply === null || reply === undefined) reply = '\n';
        const out = (typeof reply === 'string') ? reply : JSON.stringify(reply) + '\n';
        child.stdin.write(out);
      }
    } else {
      outcome = msg;
      vlog.write(JSON.stringify({ outcome: msg }) + '\n');
    }
  }
});

let errbuf = '';
child.stderr.on('data', (d) => { errbuf += d.toString(); });

child.on('exit', (code) => {
  vlog.end();
  fs.writeFileSync(path.join(DIR, `${label}.err`), errbuf);
  // envelope measurement off the tape
  let env = {};
  try {
    const t = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const entries = t.inputLog?.entries || [];
    const last = entries.length ? entries[entries.length - 1] : null;
    env = {
      durationTicks: t.inputLog?.durationTicks,
      entries: entries.length,
      lastEntryTick: last ? (last.tick ?? last.atTick) : null,
      bytes: fs.statSync(tape).size,
      tapeHash: t.meta?.eventLogHash ?? t.eventLogHash ?? null,
    };
  } catch (e) { env = { error: String(e) }; }

  const rec = {
    label, code, outcome, envelope: env, views: nViews,
    at: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(DIR, `${label}-result.json`), JSON.stringify(rec, null, 2));

  // ---- intermediate-results law: best-so-far outcome file ----
  const ledgerPath = path.join(DIR, 'runs-ledger.json');
  let ledger = [];
  try { ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8')); } catch {}
  ledger.push(rec);
  fs.writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2));

  const scoredNames = ledger.filter(r => /^attempt-/.test(r.label));
  const best = ledger.slice().sort((a, b) => {
    const A = a.outcome || {}, B = b.outcome || {};
    if (!!B.secured - !!A.secured) return !!B.secured - !!A.secured;
    if ((B.waves | 0) !== (A.waves | 0)) return (B.waves | 0) - (A.waves | 0);
    return (B.timeMs || 0) - (A.timeMs || 0);
  })[0];

  const o = best?.outcome || {};
  const outObj = {
    ...o,
    tape: path.join(DIR, `${best.label}-tape.json`),
    scored: /^attempt-/.test(best.label),
    runsSoFar: ledger.length,
    scoredAttempts: scoredNames.length,
    worldModel: WORLD_MODEL,
    envelope: best.envelope,
    note: `best-so-far = ${best.label}`,
  };
  fs.writeFileSync(path.join(DIR, 'gauntlet-outcome.json'), JSON.stringify(outObj, null, 2));

  console.log(JSON.stringify({ label, code, outcome, envelope: env, views: nViews }));
  if (errbuf) console.log('STDERR-TAIL:', errbuf.slice(-600));
});
