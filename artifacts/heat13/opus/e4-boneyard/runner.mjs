// Runner: spawns gr-sim, drives a controller module, logs every view, writes outcome + envelope.
// Shell redirection is refused in this arena, so everything goes through node.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const REPO = '/private/tmp/heat13-569a41f9';
const DIR = '/private/tmp/heat13-569a41f9/artifacts/heat13/opus/e4-boneyard';
const CONTRACT = 'e4-boneyard';
const SEED = 'e4-boneyard-01';

const label = process.argv[2] || 'probe';
const mode = process.argv[3] || 'idle'; // 'idle' | controller filename
const tape = path.join(DIR, `${label}-tape.json`);
const viewLog = path.join(DIR, `${label}-views.jsonl`);

let control = null;
if (mode !== 'idle') {
  const mod = await import(path.join(DIR, mode) + `?v=${Date.now()}`);
  control = mod.default;
}

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (mode === 'idle') args.push('--policy=idle');

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });

const viewFd = fs.openSync(viewLog, 'w');
let buf = '';
let lastLine = null;
let viewCount = 0;
let stderrTail = '';
const table = [];

child.stderr.on('data', (d) => { stderrTail = (stderrTail + d.toString()).slice(-4000); });

child.stdout.on('data', (d) => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i);
    buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    lastLine = line;
    let obj;
    try { obj = JSON.parse(line); } catch { continue; }
    if (obj && obj.schema === 'goldrush.view.v1') {
      viewCount += 1;
      fs.writeSync(viewFd, line + '\n');
      let reply = null;
      try { reply = control ? control(obj, table) : null; } catch (e) {
        console.error('CONTROLLER THREW', e && e.stack || e);
        reply = null;
      }
      if (control) {
        if (reply === null || reply === undefined) child.stdin.write('\n');
        else child.stdin.write(JSON.stringify(reply) + '\n');
      }
    }
  }
});

child.on('exit', (code) => {
  fs.closeSync(viewFd);
  let outcome = null;
  try { outcome = JSON.parse(lastLine); } catch { /* ignore */ }
  const env = envelope(tape);
  const summary = {
    label, exit: code, views: viewCount,
    outcome, envelope: env,
    stderrTail: stderrTail.slice(-1200),
  };
  fs.writeFileSync(path.join(DIR, `${label}-summary.json`), JSON.stringify(summary, null, 2));
  if (table.length) fs.writeFileSync(path.join(DIR, `${label}-table.json`), JSON.stringify(table, null, 1));
  console.log(JSON.stringify({ label, exit: code, views: viewCount, outcome, envelope: env }, null, 1));
  if (stderrTail.trim()) console.log('STDERR TAIL:\n' + stderrTail.slice(-800));
});

function envelope(p) {
  try {
    const raw = fs.readFileSync(p, 'utf8');
    const t = JSON.parse(raw);
    const entries = t.inputLog?.entries ?? [];
    const ticks = entries.map((e) => (e.t ?? e.tick ?? 0));
    return {
      bytes: Buffer.byteLength(raw),
      entries: entries.length,
      durationTicks: t.inputLog?.durationTicks ?? t.durationTicks ?? null,
      lastEntryTick: ticks.length ? Math.max(...ticks) : null,
      eventLogHash: t.eventLogHash ?? t.meta?.eventLogHash ?? null,
    };
  } catch (e) { return { error: String(e) }; }
}
