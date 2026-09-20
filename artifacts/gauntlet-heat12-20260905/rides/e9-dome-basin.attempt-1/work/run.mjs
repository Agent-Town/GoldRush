// Runner: spawn gr-sim, drive it with a controller module, log everything, write outcome file.
// usage: node run.mjs <tag> [controller.mjs]   (no controller => --policy=idle)
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const W = '/tmp/heat12-038cc280/artifacts/heat12/opus/e9-dome-basin';
const REPO = '/tmp/heat12-038cc280';
const CONTRACT = 'e9-dome-basin';
const SEED = 'e9-dome-basin-01';

const tag = process.argv[2];
const ctrlPath = process.argv[3];
if (!tag) { console.error('need tag'); process.exit(2); }

const tape = path.join(W, `${tag}-tape.json`);
const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
let controller = null;
if (ctrlPath) {
  const mod = await import(path.resolve(ctrlPath) + `?v=${Date.now()}`);
  controller = mod.default ?? mod.controller;
} else {
  args.push('--policy=idle');
}

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
let buf = '';
let stderr = '';
const views = [];
let outcome = null;
let state = { tag };
let viewCount = 0;

child.stderr.on('data', (d) => { stderr += d.toString(); });

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
      viewCount++;
      views.push(obj);
      if (controller) {
        let out;
        try { out = controller(obj, state, viewCount); }
        catch (e) { out = []; state.ctrlError = String(e && e.stack || e); }
        if (out === null || out === undefined) out = [];
        if (out === 'BLANK') child.stdin.write('\n');
        else child.stdin.write(JSON.stringify(out) + '\n');
      }
    } else if (obj.secured !== undefined || obj.eventLogHash !== undefined) {
      outcome = obj;
    }
  }
});

child.on('close', (code) => {
  const summary = {
    tag, exitCode: code, outcome, views: views.length,
    ctrlError: state.ctrlError ?? null,
    stderrTail: stderr.split('\n').slice(-6).join('\n'),
  };
  fs.writeFileSync(path.join(W, `${tag}-summary.json`), JSON.stringify(summary, null, 1));
  // compact view log
  const compact = views.map((v) => {
    const n = v.now;
    return {
      t: +(v.now.timers?.simSeconds ?? v.now.timers?.elapsedSeconds ?? 0),
      wave: n.wave, gold: n.gold, hp: n.hero?.hp, maxHp: n.hero?.maxHp, lvl: n.hero?.level,
      alive: n.threats?.alive, spawned: n.threats?.spawnedTotal, killed: n.threats?.defeatedTotal,
      prosp: n.prospector ? [Math.round(n.prospector.x*10)/10, Math.round(n.prospector.z*10)/10] : null,
      works: n.works?.byKind, wrecked: n.works?.wrecked,
      seams: (n.seams||[]).filter(s=>s.active).map(s=>`${s.id}@${Math.round(s.x)},${Math.round(s.z)}:${s.remaining}`),
      offer: (n.pendingOffer||[]).map(o=>o.id),
      pendingSecure: n.pendingSecure ?? null,
      goldPanned: n.score?.goldPanned,
      orderFail: (n.orders||[]).filter(o=>o.status==='failed').map(o=>`${o.order?.verb}:${o.reason||''}`).slice(0,5),
    };
  });
  fs.writeFileSync(path.join(W, `${tag}-views.json`), JSON.stringify(compact, null, 0));
  if (views.length) fs.writeFileSync(path.join(W, `${tag}-view0.json`), JSON.stringify(views[0], null, 1));
  if (views.length > 1) fs.writeFileSync(path.join(W, `${tag}-viewlast.json`), JSON.stringify(views[views.length-1], null, 1));

  // tape envelope measurement
  let env = null;
  try {
    const tp = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const entries = tp.inputLog?.entries ?? [];
    env = {
      durationTicks: tp.inputLog?.durationTicks ?? tp.durationTicks ?? null,
      entries: entries.length,
      lastEntryTick: entries.length ? entries[entries.length-1].t : null,
      bytes: fs.statSync(tape).size,
      maxTicks: 18002, maxEntries: 3601, maxTapeBytes: 16384 + 3601*160,
    };
    env.admissible = env.durationTicks <= env.maxTicks && env.entries <= env.maxEntries && env.bytes <= env.maxTapeBytes;
  } catch (e) { env = { error: String(e) }; }
  summary.envelope = env;
  fs.writeFileSync(path.join(W, `${tag}-summary.json`), JSON.stringify(summary, null, 1));

  console.log(JSON.stringify({ tag, code, outcome, views: views.length, env, ctrlError: summary.ctrlError }));
});
