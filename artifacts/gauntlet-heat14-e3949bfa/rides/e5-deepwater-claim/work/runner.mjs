// Gold Rush heat-14 runner — generation 114, e5-deepwater-claim
// Spawns gr-sim, drives a controller, logs every view, writes gauntlet-outcome.json
// and all three envelope axes on EVERY child exit (the intermediate-results law).
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const REPO = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa';
const WS = path.join(REPO, 'artifacts/heat14/opus/e5-deepwater-claim');
const CONTRACT = 'e5-deepwater-claim';
const SEED = 'e5-deepwater-claim-01';

const label = process.argv[2] || 'probe';
const ctrlPath = process.argv[3] || null;   // null => --policy idle
const tape = path.join(WS, `${label}-tape.json`);
const viewLog = path.join(WS, `${label}-views.jsonl`);

let controller = null;
if (ctrlPath) {
  const mod = await import(path.isAbsolute(ctrlPath) ? ctrlPath : path.join(WS, ctrlPath));
  controller = mod.default ?? mod.controller;
}

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (!controller) args.push('--policy', 'idle');

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });

const rows = [];
let outcomeLine = null;
let buf = '';
let viewCount = 0;
const state = {};   // controller scratch space, persists across views

fs.writeFileSync(viewLog, '');

function compact(v) {
  const n = v.now || {};
  const dw = n.deepwater || {};
  const boss = dw.dredgeQueenBoss || {};
  const r = {
    i: viewCount,
    t: +(((n.timers && n.timers.runSeconds) ?? (v.tSeconds ?? 0))).toFixed(3),
    w: n.wave,
    gold: n.gold,
    pan: n.score && n.score.goldPanned,
    stolen: n.score && n.score.goldStolen,
    kills: n.score && n.score.kills,
    hp: n.hero && +(n.hero.hp ?? 0).toFixed(1),
    maxHp: n.hero && n.hero.maxHp,
    hx: n.hero && n.hero.x != null ? +n.hero.x.toFixed(1) : null,
    hz: n.hero && n.hero.z != null ? +n.hero.z.toFixed(1) : null,
    px: n.prospector && n.prospector.x != null ? +n.prospector.x.toFixed(1) : null,
    pz: n.prospector && n.prospector.z != null ? +n.prospector.z.toFixed(1) : null,
    alive: n.threats && n.threats.alive,
    wreck: n.threats && n.threats.wreckers,
    thief: n.threats && n.threats.thieves,
    works: n.works && n.works.standing,
    wrecked: n.works && n.works.wrecked,
    // boss block
    act: boss.act,
    lock: boss.act2Locked,
    live: boss.liveComponents,
    anchor: boss.anchor,
    claws: boss.clawCycles,
    repos: boss.repositions,
    hulk: boss.hulkPresent,
    quit: boss.crewQuit,
    offer: n.pendingOffer ? n.pendingOffer.map(o => o.id).join('|') : null,
    sec: n.pendingSecure ? JSON.stringify(n.pendingSecure) : null,
  };
  return r;
}

function writeOutcome() {
  // envelope: measure all three axes off the tape that exists
  let env = { ok: false };
  try {
    const tp = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const il = tp.inputLog || {};
    const entries = il.entries || [];
    const lastTick = entries.length ? Math.max(...entries.map(e => e.t ?? e.tick ?? 0)) : 0;
    env = {
      ok: true,
      durationTicks: il.durationTicks,
      lastEntryTick: lastTick,
      entries: entries.length,
      bytes: fs.statSync(tape).size,
      tapeHash: tp.eventLogHash ?? (tp.meta && tp.meta.eventLogHash),
    };
  } catch (e) { env.err = e.message; }

  const best = { label, tape, env, outcome: outcomeLine, views: rows.length };
  fs.writeFileSync(path.join(WS, `${label}-summary.json`), JSON.stringify(best, null, 2));

  // promote into gauntlet-outcome.json if better than what is there
  const outPath = path.join(WS, 'gauntlet-outcome.json');
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(outPath, 'utf8')); } catch {}
  const oc = outcomeLine ? JSON.parse(outcomeLine) : null;
  const runsSoFar = (prev && prev.runsSoFar ? prev.runsSoFar : 0) + 1;
  const scored = /^attempt-/.test(label);
  const scoredAttempts = (prev && prev.scoredAttempts ? prev.scoredAttempts : 0) + (scored ? 1 : 0);

  const better = (() => {
    if (!oc) return false;
    if (!prev || !prev.secured) return true;
    if (oc.secured && !prev.secured) return true;
    if (!oc.secured && prev.secured) return false;
    if ((oc.waves ?? 0) !== (prev.waves ?? 0)) return (oc.waves ?? 0) > (prev.waves ?? 0);
    return (oc.gold ?? 0) >= (prev.gold ?? 0);
  })();

  const row = better || !prev
    ? { ...(oc || {}), tape, scored, runsSoFar, scoredAttempts, worldModel: 'sim-import', envelope: env }
    : { ...prev, runsSoFar, scoredAttempts };
  fs.writeFileSync(outPath, JSON.stringify(row, null, 2));

  // compact table
  const cols = ['i','t','w','gold','pan','kills','hp','hx','hz','px','pz','alive','act','lock','live','anchor','claws','repos','quit'];
  const lines = [cols.join('\t'), ...rows.map(r => cols.map(c => r[c] ?? '').join('\t'))];
  fs.writeFileSync(path.join(WS, `${label}-table.tsv`), lines.join('\n'));
  console.log(`[runner:${label}] views=${rows.length} env=${JSON.stringify(env)}`);
  console.log(`[runner:${label}] outcome=${outcomeLine}`);
}

child.stdout.on('data', chunk => {
  buf += chunk.toString();
  let idx;
  while ((idx = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, idx); buf = buf.slice(idx + 1);
    if (!line.trim()) continue;
    let obj;
    try { obj = JSON.parse(line); } catch { continue; }
    if (obj.schema === 'goldrush.view.v1') {
      viewCount++;
      fs.appendFileSync(viewLog, line + '\n');
      const r = compact(obj); rows.push(r);
      if (controller) {
        let orders;
        try { orders = controller(obj, state, r); }
        catch (e) { console.error('[controller ERR]', e.stack); orders = null; }
        // null/undefined => blank line (records no entry, cannot be rejected)
        child.stdin.write(orders == null ? '\n' : JSON.stringify(orders) + '\n');
      }
    } else if (obj.secured !== undefined || obj.endReason !== undefined) {
      outcomeLine = line;
    }
  }
});

let errbuf = '';
child.stderr.on('data', d => { errbuf += d.toString(); });

child.on('exit', code => {
  fs.writeFileSync(path.join(WS, `${label}-stderr.log`), errbuf);
  writeOutcome();
  process.exit(0);
});
