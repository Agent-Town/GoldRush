// Runner: spawns gr-sim with a controller module, writes outcome file after every run.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const WS = path.dirname(new URL(import.meta.url).pathname);
const REPO = path.resolve(WS, '../../../..');
const CONTRACT = 'e8-mare-claim';
const SEED = 'e8-mare-claim-01';

const label = process.argv[2] || 'probe';           // e.g. tune-1, attempt-1
const controllerPath = process.argv[3] || null;      // null => idle
const tapePath = path.join(WS, `${label}-tape.json`);
const logPath = path.join(WS, `${label}-views.ndjson`);

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tapePath];
if (!controllerPath) args.push('--policy=idle');

let decide = null;
if (controllerPath) {
  const mod = await import(path.resolve(WS, controllerPath) + `?t=${Date.now()}`);
  decide = mod.decide;
}

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
const rl = readline.createInterface({ input: child.stdout });
const logStream = fs.createWriteStream(logPath);
let outcome = null;
let views = 0;
let errBuf = '';
child.stderr.on('data', (d) => { errBuf += d.toString(); });

const state = {};

for await (const line of rl) {
  logStream.write(line + '\n');
  let obj;
  try { obj = JSON.parse(line); } catch { continue; }
  if (obj.schema === 'goldrush.view.v1') {
    views++;
    if (decide) {
      let reply;
      try { reply = decide(obj, state, views); } catch (e) { console.error('controller threw', e); reply = []; }
      if (reply === null || reply === undefined) child.stdin.write('\n');
      else child.stdin.write(JSON.stringify(reply) + '\n');
    }
  } else if (obj.secured !== undefined) {
    outcome = obj;
  }
}
logStream.end();
await new Promise((r) => child.on('close', r));

fs.writeFileSync(path.join(WS, `${label}-stderr.log`), errBuf);

// tape stats
let tapeStats = {};
try {
  const t = JSON.parse(fs.readFileSync(tapePath, 'utf8'));
  const entries = t.inputLog?.entries || [];
  const last = entries.length ? entries[entries.length - 1].tick : null;
  tapeStats = {
    durationTicks: t.inputLog?.durationTicks,
    entries: entries.length,
    lastEntryTick: last,
    bytes: fs.statSync(tapePath).size,
  };
} catch (e) { tapeStats = { error: String(e) }; }

console.log(JSON.stringify({ label, views, outcome, tapeStats }, null, 1));

// --- intermediate results law: write best-so-far outcome file ---
const outFile = path.join(WS, 'gauntlet-outcome.json');
const ledgerFile = path.join(WS, 'runs-ledger.json');
let ledger = [];
try { ledger = JSON.parse(fs.readFileSync(ledgerFile, 'utf8')); } catch {}
ledger.push({ label, tape: tapePath, outcome, tapeStats, scored: /^attempt-/.test(label) });
fs.writeFileSync(ledgerFile, JSON.stringify(ledger, null, 1));

const score = (r) => {
  const o = r.outcome || {};
  return [o.secured ? 1 : 0, o.waves || 0, o.timeMs || 0, o.gold || 0];
};
let best = ledger[0];
for (const r of ledger) {
  const a = score(r), b = score(best);
  for (let i = 0; i < a.length; i++) { if (a[i] !== b[i]) { if (a[i] > b[i]) best = r; break; } }
}
const scoredAttempts = ledger.filter((r) => r.scored).length;
fs.writeFileSync(outFile, JSON.stringify({
  ...(best.outcome || {}),
  tape: best.tape,
  scored: best.scored,
  runsSoFar: ledger.length,
  scoredAttempts,
  worldModel: 'sim-import',
  tapeStats: best.tapeStats,
  note: 'best-so-far; see runs-ledger.json',
}, null, 1));
