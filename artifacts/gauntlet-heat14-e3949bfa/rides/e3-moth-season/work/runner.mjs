// Runner: spawn gr-sim, drive a controller module, log every view, write outcome + envelope on exit.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WS = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa';
const OUT = path.join(WS, 'artifacts/heat14/opus/e3-moth-season');
const CONTRACT = 'e3-moth-season';
const SEED = 'e3-moth-season-01';

const label = process.argv[2] || 'probe';
const ctrlPath = process.argv[3] || null; // null = --policy idle

const tape = path.join(OUT, `${label}-tape.json`);
const viewLog = path.join(OUT, `${label}-views.jsonl`);
const summaryPath = path.join(OUT, `${label}-summary.json`);
fs.rmSync(viewLog, { force: true });

let ctrl = null;
if (ctrlPath) ctrl = (await import(ctrlPath)).default;

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--difficulty', 'trail', '--tape', tape];
if (!ctrl) args.push('--policy', 'idle');

const child = spawn('node', args, { cwd: WS, stdio: ['pipe', 'pipe', 'pipe'] });

let buf = '';
let outcome = null;
let nViews = 0;
const rows = [];
let stderrTail = [];

child.stderr.on('data', d => { stderrTail.push(String(d)); if (stderrTail.length > 40) stderrTail.shift(); });

child.stdout.on('data', chunk => {
  buf += chunk;
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i); buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg.schema === 'goldrush.view.v1') {
      nViews++;
      fs.appendFileSync(viewLog, JSON.stringify(msg) + '\n');
      const n = msg.now || {};
      rows.push({
        v: nViews, t: +(n.timers?.runSeconds ?? 0).toFixed(2), w: n.wave,
        gold: n.gold, pan: n.score?.goldPanned, stolen: n.score?.goldStolen,
        hp: n.hero?.hp != null ? +n.hero.hp.toFixed(1) : null, mx: n.hero?.maxHp,
        hx: n.hero?.x != null ? +n.hero.x.toFixed(1) : null, hz: n.hero?.z != null ? +n.hero.z.toFixed(1) : null,
        alive: n.threats?.alive, wr: n.threats?.wreckers, th: n.threats?.thieves,
        st: n.works?.standing, wk: n.works?.wrecked,
        cc: n.canyonConnect ? `${n.canyonConnect.powered}/${n.canyonConnect.required}${n.canyonConnect.complete ? 'C' : ''}` : null,
        kinds: n.works?.byKind ? JSON.stringify(n.works.byKind) : null,
        sec: n.pendingSecure ? 1 : 0, off: n.pendingOffer ? n.pendingOffer.length : 0,
      });
      if (ctrl) {
        let reply;
        try { reply = ctrl(msg, nViews); } catch (e) { reply = null; console.error('CTRL ERROR', e.stack); }
        if (reply === null || reply === undefined) child.stdin.write('\n');
        else child.stdin.write(JSON.stringify(reply) + '\n');
      }
    } else if (msg.secured !== undefined || msg.endReason !== undefined) {
      outcome = msg;
    }
  }
});

child.on('exit', code => {
  // envelope
  let env = null;
  try {
    const tp = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const entries = tp.inputLog?.entries || [];
    const last = entries.length ? Math.max(...entries.map(e => e.t ?? e.tick ?? 0)) : 0;
    env = {
      durationTicks: tp.inputLog?.durationTicks,
      lastEntryTick: last,
      entries: entries.length,
      bytes: fs.statSync(tape).size,
      eventLogHash: tp.meta?.eventLogHash ?? tp.eventLogHash ?? null,
    };
  } catch (e) { env = { error: String(e.message) }; }

  const summary = { label, code, outcome, envelope: env, views: nViews, tape, stderrTail: stderrTail.slice(-6) };
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

  // compact table
  const keys = ['v', 't', 'w', 'gold', 'pan', 'hp', 'mx', 'hx', 'hz', 'alive', 'wr', 'st', 'wk', 'cc', 'sec', 'off'];
  const tbl = rows.map(r => keys.map(k => `${k}=${r[k]}`).join(' ')).join('\n');
  fs.writeFileSync(path.join(OUT, `${label}-table.txt`), tbl + '\n\nKINDS:\n' + rows.map(r => `${r.v} ${r.kinds}`).join('\n'));

  console.log(JSON.stringify({ label, code, outcome, envelope: env, views: nViews }, null, 1));
  console.log('--- last rows ---');
  console.log(rows.slice(-6).map(r => keys.map(k => `${k}=${r[k]}`).join(' ')).join('\n'));
  if (code !== 0) console.log('STDERR:', stderrTail.slice(-4).join(''));
});
