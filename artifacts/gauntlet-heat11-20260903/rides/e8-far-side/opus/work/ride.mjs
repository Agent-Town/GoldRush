// Gold Rush gauntlet heat 11 — e8-far-side — Claude Opus 5, generation 34.
// Author: the rider. worldModel: sim-import.
//
// THE MAP, IN THREE FACTS (all read off the view / source before writing an order):
//  1. No `twist.secureWave` => Balance.run.secureWave = 20 (600 s), ceiling 22, and the FLAT
//     18000-tick reel envelope. So the secure boundary is answered with a BLANK LINE
//     (gr-sim.mjs:243 returns without recording an entry) => durationTicks 18000, admissible.
//  2. `probeRecoveryZones` + `twist.probePlayback` are BOTH declared, so ProbeRecovery arms and
//     HeadlessContractSim.ts:1188 pins the run UNSECURABLE until the probe is out of the ground.
//     recoverProbe() reads the PROSPECTOR's position; CONTEXT_ACTION does not travel.
//  3. The loss stake (0,-36) sits INSIDE build zone `far-side-landing-yard` (x -24..24,
//     z -48..-30). Turret range 16. That is the pocket; nothing needs to leave it but the errand.

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WORK = '/private/tmp/heat11-b118c4d2/artifacts/heat11/opus/e8-far-side';
const REPO = '/private/tmp/heat11-b118c4d2';

const tag = process.argv[2] || 'tune-x';
const CROSS_WAVE = Number(process.argv[3] ?? 7);
const SCORED = process.argv[4] === 'scored';
const tapePath = path.join(WORK, `${tag}-tape.json`);

// ---------------------------------------------------------------------------
// Geometry. More candidates than slots (gen-10/14: a ladder that cannot skip a
// refused coordinate is a ladder that can lose the run to one number).
// ---------------------------------------------------------------------------
const TURRETS = [
  { x: 0, z: -31 }, { x: -9, z: -31 }, { x: 9, z: -31 }, { x: 0, z: -41 },
  { x: -14, z: -33 }, { x: 14, z: -33 }, { x: -9, z: -41 }, { x: 9, z: -41 },
];
const BEACONS = [
  { x: -5, z: -33 }, { x: 5, z: -33 }, { x: -5, z: -39 }, { x: 5, z: -39 },
  { x: -13, z: -37 }, { x: 13, z: -37 }, { x: 0, z: -44 }, { x: -16, z: -30 },
  { x: 16, z: -30 }, { x: 0, z: -47 },
];
const PALISADES = [
  { x: -3, z: -30 }, { x: 3, z: -30 }, { x: -12, z: -30 }, { x: 12, z: -30 },
  { x: -7, z: -30 }, { x: 7, z: -30 }, { x: -18, z: -32 }, { x: 18, z: -32 },
];
const COSTS = { turret: [50, 70, 95, 125], sentry_beacon: [25, 35, 45, 55, 75, 95], palisade: [10, 10, 10, 10, 10, 10, 10, 10] };
const CAPS = { turret: 4, sentry_beacon: 6, palisade: 8 };

// The crater: x -14..14, z 38..52, with REACH 2.2 slack. Stand well inside it.
const CRATER = { x: 0, z: 44 };

// ---------------------------------------------------------------------------
// Upgrade scorer. Never take offer[0] (gen-11 secured at 4 HP doing exactly that;
// gen-14's scorer took maxHp 100 -> 175 for free). Plating first, then damage.
// ---------------------------------------------------------------------------
function scoreUpgrade(o) {
  const s = `${o.id} ${o.name} ${o.effectText || ''}`.toLowerCase();
  let v = 0;
  if (/plating|health|max hp|maxhp|vitality|tough|armor|armour/.test(s)) v += 100;
  if (/heal|regen|mend/.test(s)) v += 40;
  if (/damage|spark|coil|tap|power|impact/.test(s)) v += 30;
  if (/rate|speed|reload|cadence/.test(s)) v += 20;
  if (/range|reach/.test(s)) v += 12;
  if (/gold|pan|seam|income/.test(s)) v += 5;
  return v;
}

// ---------------------------------------------------------------------------
// Controller. Pure function of the view + a small carried state.
// ---------------------------------------------------------------------------
function makeController() {
  const state = { phase: 'fort', blacklist: new Set(), recoverTries: 0, crossedAt: null, log: [] };

  function occupied(entries, cand) {
    return entries.some((e) => Math.hypot(e.position.x - cand.x, e.position.z - cand.z) < 2.0);
  }

  // Emit only rungs affordable AT PLAN TIME, suffix-gated so one trip spends the whole
  // batch and nothing fires at an arbitrary later tick (gen-17/28).
  function ladder(now) {
    const out = [];
    const entries = (now.works && now.works.entries) || [];
    const byKind = (now.works && now.works.byKind) || {};
    let purse = now.gold;
    const plan = [];
    for (const kind of ['turret', 'sentry_beacon', 'palisade']) {
      const have = byKind[kind] || 0;
      const cands = kind === 'turret' ? TURRETS : kind === 'sentry_beacon' ? BEACONS : PALISADES;
      for (let i = have; i < CAPS[kind]; i++) {
        const price = COSTS[kind][Math.min(i, COSTS[kind].length - 1)];
        if (price > purse) break;
        const spot = cands.find((c) => !state.blacklist.has(`${kind}@${c.x},${c.z}`) && !occupied(entries, c));
        if (!spot) break;
        plan.push({ kind, spot, price });
        purse -= price;
        // Reserve the spot within this batch so two rungs never name one coordinate.
        entries.push({ position: { x: spot.x, z: spot.z } });
      }
    }
    // Suffix-sum gate: rung i waits until the whole remaining batch is funded.
    let suffix = 0;
    const gates = plan.map((p) => (suffix += p.price));
    for (let i = 0; i < plan.length; i++) {
      const gate = gates[gates.length - 1] - (i > 0 ? gates[i - 1] : 0);
      out.push({ verb: 'BUILD', what: plan[i].kind, where: plan[i].spot, when: { goldGte: Math.max(0, Math.min(1000000, gate)) } });
    }
    return out;
  }

  function harvestTail(now, room) {
    const live = (now.seams || []).filter((s) => s.active && Number.isFinite(s.x) && Number.isFinite(s.z));
    if (!live.length || room <= 0) return [];
    const p = now.prospector || { x: 0, z: -36 };
    live.sort((a, b) => Math.hypot(a.x - p.x, a.z - p.z) - Math.hypot(b.x - p.x, b.z - p.z));
    const out = [];
    // Seams here are 14-16 wu out and deplete at capacity 30: stack the nearest, then
    // fall through to the second so a depleted seam never idles the tail (gen-9/15).
    for (let i = 0; i < room; i++) out.push({ verb: 'HARVEST', seam: live[Math.min(i % 3 === 2 ? 1 : 0, live.length - 1)].id });
    return out;
  }

  return function decide(view) {
    const now = view.now;
    const orders = [];

    // 1. The draft owns the tick and REPLACE semantics wipe everything else, so it goes first
    //    and every other order is resent under it (gen-5).
    if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
      const best = [...now.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
      orders.push({ verb: 'PICK_UPGRADE', id: best.id });
    }

    const pr = now.probeRecovery || {};
    const p = now.prospector || { x: 0, z: -36 };
    const inCrater = Math.abs(p.x) <= 14 + 2.2 && p.z >= 38 - 2.2 && p.z <= 52 + 2.2;

    // 2. THE ERRAND. HeadlessContractSim:1188 refuses a secure at ANY wave while the probe is
    //    buried, so this is not optional and it is not a score decision.
    if (pr.declared && !pr.recovered) {
      const ladderDone = ((now.works && now.works.byKind && now.works.byKind.turret) || 0) >= 4;
      if (state.phase === 'fort' && (now.wave >= CROSS_WAVE || ladderDone)) state.phase = 'cross';

      if (state.phase === 'cross') {
        if (inCrater) {
          // Fires from where the Prospector stands, on the next tick; it does not travel.
          orders.push({ verb: 'CONTEXT_ACTION', action: 'recover' });
          state.recoverTries++;
        }
        orders.push({ verb: 'MOVE_TO', pos: CRATER });
        orders.push({ verb: 'HOLD', pos: CRATER });
        state.log.push(`w${now.wave} cross p=(${p.x.toFixed(1)},${p.z.toFixed(1)}) inCrater=${inCrater}`);
        return orders.slice(0, 32);
      }
    }
    if (pr.recovered && state.phase === 'cross') {
      state.phase = 'fort';
      state.crossedAt = now.wave;
      state.log.push(`w${now.wave} RECOVERED after ${state.recoverTries} tries`);
    }

    // 3. The fort ladder, then the economy tail.
    for (const o of ladder(now)) orders.push(o);
    const room = 32 - orders.length;
    for (const o of harvestTail(now, room)) orders.push(o);
    return orders.slice(0, 32);
  };
}

// ---------------------------------------------------------------------------
// Driver: NDJSON transport + the intermediate-results law on every child exit.
// ---------------------------------------------------------------------------
const decide = makeController();
const child = spawn('node', [
  'scripts/gr-sim.mjs', '--contract', 'e8-far-side', '--seed', 'e8-far-side-01',
  '--difficulty', 'trail', '--tape', tapePath,
], { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });

let buf = '';
let outcome = null;
let views = 0;
let blanks = 0;
const trace = [];

child.stdout.on('data', (d) => {
  buf += d.toString();
  let nl;
  while ((nl = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, nl).trim();
    buf = buf.slice(nl + 1);
    if (!line) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg.schema === 'goldrush.view.v1') {
      views++;
      const n = msg.now;
      trace.push({
        v: views, wave: n.wave, hp: n.hero && n.hero.hp, maxHp: n.hero && n.hero.maxHp,
        gold: n.gold, alive: n.threats && n.threats.alive,
        works: n.works && n.works.byKind, wrecked: n.works && n.works.wrecked,
        prosp: n.prospector, recovered: n.probeRecovery && n.probeRecovery.recovered,
        pendingSecure: !!n.pendingSecure,
      });
      // THE ENVELOPE. A secureWave-silent contract gets a flat 18000-tick reel envelope, and an
      // order recorded ON the terminal tick reports durationTicks 18001 => reel_duration_exceeded.
      // A blank line lets the configured `bank` default fire WITHOUT recording an entry.
      if (n.pendingSecure) { blanks++; child.stdin.write('\n'); continue; }
      child.stdin.write(JSON.stringify(decide(msg)) + '\n');
    } else if (msg.secured !== undefined) {
      outcome = msg;
    }
  }
});

let errBuf = '';
child.stderr.on('data', (d) => { errBuf += d.toString(); });

child.on('close', () => {
  fs.writeFileSync(path.join(WORK, `${tag}-trace.json`), JSON.stringify(trace, null, 1));
  const last = trace[trace.length - 1] || {};
  const summary = {
    tag, outcome, views, blankSecureAnswers: blanks, crossWave: CROSS_WAVE,
    finalHp: last.hp, finalWorks: last.works, recovered: last.recovered,
  };
  fs.writeFileSync(path.join(WORK, `${tag}-summary.json`), JSON.stringify(summary, null, 1));

  // Reel admissibility: the four numbers, measured off the tape, every run (gen-31).
  let env = null;
  try {
    const t = JSON.parse(fs.readFileSync(tapePath, 'utf8'));
    const entries = (t.inputLog && t.inputLog.entries) || [];
    env = {
      durationTicks: t.inputLog && t.inputLog.durationTicks,
      entries: entries.length,
      lastEntryTick: entries.length ? entries[entries.length - 1].tick : null,
      bytes: fs.statSync(tapePath).size,
    };
  } catch { /* no tape on a crash */ }

  // THE INTERMEDIATE-RESULTS LAW: best-so-far, after EVERY run, before any analysis.
  const outPath = path.join(WORK, 'gauntlet-outcome.json');
  let best = null;
  try { best = JSON.parse(fs.readFileSync(outPath, 'utf8')); } catch { /* first run */ }
  const runsSoFar = (best && best.runsSoFar ? best.runsSoFar : 0) + 1;
  const scoredAttempts = (best && best.scoredAttempts ? best.scoredAttempts : 0) + (SCORED ? 1 : 0);
  const better = !best || !best.secured
    ? (outcome ? (!best || !best.secured || outcome.secured) : false)
    : false;
  const row = better && outcome
    ? { ...outcome, tape: tapePath, scored: SCORED, envelope: env }
    : (best || {});
  fs.writeFileSync(outPath, JSON.stringify({
    ...row, runsSoFar, scoredAttempts, worldModel: 'sim-import',
  }, null, 1));

  console.log('OUTCOME', JSON.stringify(outcome));
  console.log('ENVELOPE', JSON.stringify(env));
  console.log('views', views, 'blankSecure', blanks, 'recovered', last.recovered, 'finalHp', last.hp, 'works', JSON.stringify(last.works));
  const st = errBuf.trim().split('\n').filter((l) => /reject/i.test(l)).slice(0, 4);
  if (st.length) console.log('REJECTS', st.join(' | '));
});
