// Heat 12 — e7-dead-band runner. Spawns gr-sim, drives a controller over the NDJSON door,
// logs every view, and writes gauntlet-outcome.json on EVERY child exit (intermediate-results law).
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DIR = '/private/tmp/heat12-038cc280/artifacts/heat12/opus/e7-dead-band';
const REPO = '/private/tmp/heat12-038cc280';
const CONTRACT = 'e7-dead-band';
const SEED = 'e7-dead-band-01';
const WORLD_MODEL = 'sim-import';

const args = process.argv.slice(2);
const label = args[0] ?? 'probe';
const ctrlName = args[1] ?? 'idle';

const tapePath = path.join(DIR, `${label}-tape.json`);
const viewsPath = path.join(DIR, `${label}-views.jsonl`);

const controllers = {};

// ---------------------------------------------------------------------------
// ctrl-v1 : gen-27 skeleton + the one E7 order this map's secure is latched on.
// ---------------------------------------------------------------------------
controllers['v1'] = () => {
  const state = {
    playbookAsked: false,
    blacklist: new Set(),
    lastSig: null,
    views: 0,
  };

  // Ladder: turrets first (57 dps @ r16) then beacons. Emitted as a plan-time-affordable,
  // non-decreasing price prefix so a cheap rung can never starve an expensive one.
  const LADDER = [
    { what: 'turret', n: 4 },
    { what: 'sentry_beacon', n: 6 },
  ];

  const scoreUpgrade = (u) => {
    const s = `${u.id} ${u.name ?? ''} ${u.effectText ?? ''}`.toLowerCase();
    let v = 0;
    if (/plating|max health|maximum health|toughness|armor|armour/.test(s)) v += 100;
    if (/dressing|heal|regen|mend|recover/.test(s)) v += 80;
    if (/damage|spark|coil|tap|power|dps/.test(s)) v += 40;
    if (/fire rate|rate of fire|attack speed|reload/.test(s)) v += 35;
    if (/range|reach/.test(s)) v += 15;
    if (/blast|charge/.test(s)) v += 12;
    if (/gold|luck|pan|seam|prospector/.test(s)) v += 2;
    return v;
  };

  return (view) => {
    state.views += 1;
    const now = view.now ?? {};
    const sp = view.stablePrefix ?? {};

    // Secure boundary: answer with a BLANK LINE. gr-sim records no entry, the configured
    // `bank` default fires, and durationTicks stays inside the contract envelope.
    if (now.pendingSecure) return null;

    // Refusal blacklist, fed by the view's own order records (gen-35).
    for (const rec of now.orders ?? []) {
      const o = rec?.order ?? {};
      if (rec?.status === 'failed' && o.verb === 'BUILD' && o.where) {
        const r = String(rec.reason ?? '');
        if (/out_of_zone|collision|UNREACHABLE|outside buildable/i.test(r)) {
          state.blacklist.add(`${o.what}@${o.where.x},${o.where.z}`);
        }
      }
    }

    const orders = [];

    // 1. Draft first — REPLACE semantics mean the pick must own the array's head.
    const offer = now.pendingOffer;
    if (Array.isArray(offer) && offer.length) {
      const best = [...offer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
      orders.push({ verb: 'PICK_UPGRADE', id: best.id });
    }

    // 2. THE CONTRACT. Dead Band's objective is `refusal`: signalSuppression refuses every
    //    PLAYBOOK_USE and the COUNTED refusal is what opens the secure. The suppression gate is
    //    checked before NOTHING_RECORDED (HeadlessContractSim.usePlaybook:2823), so this works on
    //    view 0 with nothing demonstrated. One use is enough; the counter never decrements.
    const pb = now.playbookUse;
    const met = pb?.objectiveMet === true
      || (pb?.refusals?.suppressed ?? 0) > 0
      || (now.signalSuppression?.refusals?.playbooks ?? 0) > 0;
    if (!met) {
      orders.push({ verb: 'PLAYBOOK_USE', name: `dead-band-${state.views}` });
      state.playbookAsked = true;
    }

    // 3. One build ladder, price-ordered, only rungs already affordable at plan time.
    const byKind = now.works?.byKind ?? {};
    const entries = now.works?.entries ?? [];
    const buildables = sp.mechanics?.buildables ?? [];
    const costOf = (what, idx) => {
      const b = buildables.find((x) => x.id === what);
      const costs = b?.costs ?? [];
      if (idx < costs.length) return costs[idx];
      const last = costs[costs.length - 1] ?? 50;
      return Math.ceil((last * 1.3) / 5) * 5;
    };
    const CANDS = {
      turret: [
        { x: 0, z: 4 }, { x: -8, z: 4 }, { x: 8, z: 4 }, { x: 0, z: -4 },
        { x: -14, z: 2 }, { x: 14, z: 2 }, { x: -6, z: -8 }, { x: 6, z: -8 },
        { x: 0, z: 10 }, { x: -16, z: -6 }, { x: 16, z: -6 }, { x: 0, z: -12 },
      ],
      sentry_beacon: [
        { x: -4, z: 2 }, { x: 4, z: 2 }, { x: -4, z: -2 }, { x: 4, z: -2 },
        { x: 0, z: 6 }, { x: 0, z: -6 }, { x: -10, z: 0 }, { x: 10, z: 0 },
        { x: -2, z: 8 }, { x: 2, z: 8 }, { x: -12, z: 6 }, { x: 12, z: 6 },
      ],
    };
    const occupied = new Set(entries.map((e) => `${Math.round(e.position?.x ?? 1e9)},${Math.round(e.position?.z ?? 1e9)}`));

    let gold = now.gold ?? 0;
    let lastPrice = 0;
    outer: for (const rung of LADDER) {
      const have = byKind[rung.what] ?? 0;
      for (let i = have; i < rung.n; i += 1) {
        const price = costOf(rung.what, i);
        if (price < lastPrice) break outer;      // non-decreasing prefix (gen-9)
        if (price > gold) break outer;           // plan-time affordability (gen-28)
        const spot = (CANDS[rung.what] ?? []).find(
          (p) => !state.blacklist.has(`${rung.what}@${p.x},${p.z}`)
            && !occupied.has(`${Math.round(p.x)},${Math.round(p.z)}`),
        );
        if (!spot) break;
        occupied.add(`${Math.round(spot.x)},${Math.round(spot.z)}`);
        orders.push({ verb: 'BUILD', what: rung.what, where: spot, when: { goldGte: price } });
        gold -= price;
        lastPrice = price;
      }
    }

    // 3b. THE SINK. tune-1 finished its ladder at wave 9 and then pinned 200 gold for eleven
    //     waves with `goldPanned` frozen at 870 — a dead purse (gen-39). The only sink on this
    //     board is the turret tier: 150 for x1.4 damage x1.18 fire rate (x1.65 dps). Beacons have
    //     no tier row and tier 3 (300) is above the 200 cap, so this is the whole remaining spend.
    //     `CONTEXT_ACTION` does NOT travel, so it needs a MOVE_TO in front of it, and it must be
    //     plan-time affordable or the record is consumed on a wasted trip.
    const TIER_COST = [0, 150, 300];
    const upgradable = entries
      .filter((e) => e.id === 'turret' && !e.wrecked && Number.isFinite(e.index))
      .map((e) => ({ e, next: TIER_COST[Math.max(1, e.tier ?? 1)] }))
      .filter((c) => Number.isFinite(c.next) && c.next > 0 && c.next <= (now.gold ?? 0))
      .sort((a, b) => (a.e.tier ?? 1) - (b.e.tier ?? 1));
    if (upgradable.length) {
      const { e } = upgradable[0];
      orders.push({ verb: 'MOVE_TO', pos: { x: e.position.x, z: e.position.z } });
      orders.push({ verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: 'turret', index: e.index } });
    }

    // 4. Free supplementary damage.
    if ((now.blastReadyInMs ?? 1) === 0 && now.hero) {
      orders.push({ verb: 'BLAST_AT', pos: { x: Math.round(now.hero.x ?? 0), z: Math.round((now.hero.z ?? 0) + 4) } });
    }

    // 5. The worker: stack HARVEST on the nearest live seams. Chain by mutual distance so the
    //    chain never becomes a commute generator (gen-15/38).
    const claim = { x: now.hero?.x ?? 0, z: now.hero?.z ?? 0 };
    const live = (now.seams ?? []).filter((s) => s.active);
    const d = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
    live.sort((a, b) => d(a, claim) - d(b, claim));
    const near = live.filter((s) => live.length === 0 || d(s, live[0]) <= 26);
    const chain = near.length ? near : live;
    const room = 32 - orders.length - 1;
    if (chain.length && room > 0) {
      for (let i = 0; i < room; i += 1) orders.push({ verb: 'HARVEST', seam: chain[i % chain.length].id });
    }

    // 6. Terminal anchor that can never be filtered away — an empty array is a WIPE (gen-42).
    orders.push({ verb: 'HOLD', pos: { x: chain[0]?.x ?? claim.x, z: chain[0]?.z ?? claim.z } });

    // Byte budget (reel_too_large): resubmit only when the plan actually changes.
    const sig = JSON.stringify(orders.map((o) => [
      o.verb, o.what, o.where?.x, o.where?.z, o.pos?.x, o.pos?.z, o.seam, o.id, o.target?.index,
    ]));
    if (sig === state.lastSig && !offer) return null;
    state.lastSig = sig;
    return orders.slice(0, 32);
  };
};

// ---------------------------------------------------------------------------

const run = () => new Promise((resolve) => {
  const simArgs = [
    'scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED,
    '--difficulty', 'trail', '--tape', tapePath,
  ];
  if (ctrlName === 'idle') simArgs.push('--policy', 'idle');

  const child = spawn('node', simArgs, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
  const ctrl = ctrlName === 'idle' ? null : controllers[ctrlName]();
  const viewsOut = fs.createWriteStream(viewsPath);
  let buf = '';
  let stderr = '';
  let last = null;
  let outcome = null;

  child.stderr.on('data', (c) => { stderr += c; });
  child.stdout.on('data', (chunk) => {
    buf += chunk;
    let nl;
    while ((nl = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, nl); buf = buf.slice(nl + 1);
      if (!line.trim()) continue;
      let msg;
      try { msg = JSON.parse(line); } catch { continue; }
      viewsOut.write(line + '\n');
      if (msg.schema === 'goldrush.view.v1') {
        last = msg;
        if (ctrl) {
          const orders = ctrl(msg);
          child.stdin.write(orders === null ? '\n' : JSON.stringify(orders) + '\n');
        }
      } else if (typeof msg.secured === 'boolean') {
        outcome = msg;
      }
    }
  });

  child.on('exit', (code) => {
    viewsOut.end();
    resolve({ code, outcome, stderr, last });
  });
});

const { code, outcome, stderr, last } = await run();

// Tape admissibility: ticks, entries, bytes (three independent ceilings).
let tapeInfo = null;
try {
  const raw = fs.readFileSync(tapePath, 'utf8');
  const tape = JSON.parse(raw);
  const entries = tape.inputLog?.entries ?? [];
  tapeInfo = {
    bytes: Buffer.byteLength(raw),
    entries: entries.length,
    durationTicks: tape.inputLog?.durationTicks ?? null,
    lastEntryTick: entries.length ? entries[entries.length - 1].t : null,
  };
} catch { /* no tape */ }

const summary = { label, ctrl: ctrlName, code, outcome, tape: tapeInfo };
fs.writeFileSync(path.join(DIR, `${label}-summary.json`), JSON.stringify(summary, null, 2));

// --- Intermediate-results law: best-so-far, rewritten after EVERY run. ---
const OUT = path.join(DIR, 'gauntlet-outcome.json');
let prev = null;
try { prev = JSON.parse(fs.readFileSync(OUT, 'utf8')); } catch { /* first run */ }

const runsSoFar = (prev?.runsSoFar ?? 0) + 1;
const scored = /^attempt-/.test(label);
const scoredAttempts = (prev?.scoredAttempts ?? 0) + (scored ? 1 : 0);
const rank = (o) => o ? [o.secured ? 1 : 0, o.waves ?? 0, o.timeMs ?? 0, o.gold ?? 0] : [0, 0, 0, 0];
const better = (a, b) => { const A = rank(a), B = rank(b); for (let i = 0; i < A.length; i += 1) { if (A[i] !== B[i]) return A[i] > B[i]; } return false; };

const keepPrev = prev && !better(outcome, prev.outcomeRaw ?? prev);
const best = keepPrev
  ? { ...prev.best, tape: prev.tape, scored: prev.scored, outcomeRaw: prev.outcomeRaw }
  : { best: outcome, tape: tapePath, scored, outcomeRaw: outcome };

const chosen = keepPrev ? { outcome: prev.outcomeRaw, tape: prev.tape, scored: prev.scored, tapeInfo: prev.tapeInfo }
  : { outcome, tape: tapePath, scored, tapeInfo };

fs.writeFileSync(OUT, JSON.stringify({
  ...(chosen.outcome ?? {}),
  outcomeRaw: chosen.outcome,
  tape: chosen.tape,
  tapeInfo: chosen.tapeInfo,
  scored: chosen.scored,
  runsSoFar,
  scoredAttempts,
  worldModel: WORLD_MODEL,
  contract: CONTRACT,
  seed: SEED,
  difficulty: 'trail',
}, null, 2));

console.log(JSON.stringify({ code, outcome, tape: tapeInfo, stderrTail: stderr.slice(-400) }));
