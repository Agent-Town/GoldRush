#!/usr/bin/env node

/**
 * THE PICNIC OPENING MEASURE — when the first machine arrives, when the first thing takes damage,
 * and when the run ends, at one-TICK grain instead of one-WAVE grain.
 *
 * `scripts/gr-sim.mjs` prints THE VIEW once per turn (a whole wave, or a surprise), which is far
 * too coarse to answer "is the first thirty seconds survivable for a player who reads the card".
 * This driver runs the SAME sim `--policy=idle` runs — `new HeadlessContractSim({ contractId, seed })`,
 * never `submitOrders`, no `admissionProbe` seam — but steps it with `advanceOneTick()` and reads
 * `currentTurn()` every tick.
 *
 * ⚠️ THE CONTROL THAT MAKES THE NUMBERS TRUSTWORTHY: the terminal `eventLogHash` printed by the
 * `idle` arm must equal the canonical floor in `assets/contracts/null-floors.json`
 * (`e6-picnic-01: fnv1a32:c26f77d5`, `e6-picnic-02: fnv1a32:a649be29`). If reading the view every
 * tick perturbed the run, that hash would move and every timing below would belong to a different
 * run than the one the floors pin. Checked automatically; printed as `hashMatchesFloor`.
 *
 * ⚠️ F-E6PA-2 (`reviews/e6-picnic-admission.md` §7): `src/world/Terrain.ts:78` binds
 * `ACTIVE_CONTRACT` at MODULE LOAD off `globalThis.location`. A probe that does not set
 * `?contract=<id>` measures this manifest on The Claim's terrain, silently. Set below, before any
 * game module is imported, exactly as `scripts/gr-sim.mjs:36-38` does.
 *
 * Arms:
 *   --arm idle       submits nothing, ever — the null floor, at tick grain.
 *   --arm opening    the MINIMAL human opening: pan the nearest seam, then fence each sandwich with
 *                    a 10-gold palisade as soon as the gold exists. Nothing else — no turrets, no
 *                    captures, no upgrades. This is the floor of "the player read the card".
 *
 * Usage: node artifacts/e6-picnic/opening-measure.mjs [--seed e6-picnic-01] [--arm idle|opening]
 *                                                     [--max-seconds 120] [--trace]
 * Prints one JSON summary on stdout; a per-event trace on stderr with --trace.
 */

import { readFileSync } from 'node:fs';
import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const valueOf = (flag) => { const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : undefined; };
const seed = valueOf('--seed') ?? 'e6-picnic-01';
const contractId = valueOf('--contract') ?? 'e6-picnic';
const arm = valueOf('--arm') ?? 'idle';
const maxSeconds = Number(valueOf('--max-seconds') ?? 130);
const trace = args.includes('--trace');

const ROOT = fileURLToPath(new URL('../..', import.meta.url));

const location = new URL('http://gr-sim.local/');
location.searchParams.set('debug', '');
location.searchParams.set('contract', contractId);
location.searchParams.set('seed', seed);
globalThis.location = location;
globalThis.window = { location };

const originalLog = console.log;
console.log = console.info = console.debug = () => undefined;

const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');

const HOLD_RADIUS = 3;
const PALISADE = 10;
const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

const sim = new HeadlessContractSim({ contractId, seed });
const view0 = sim.currentTurn().view;
const stakes = (view0.now.atomic?.picnicHold ?? []).map(({ id, position }) => ({ id, x: position.x, z: position.z }));

const marks = {
  firstSpawnAt: null,          // first tick with a live threat on the board
  firstStakePressureAt: null,  // first tick any sandwich's hold timer leaves 0 (lunch under threat)
  firstHeroDamageAt: null,     // first tick hero hp drops below its opening hp
  firstBuildAt: null,          // first tick a work is standing (opening arm)
  stakeClaimedAt: {},          // per sandwich, the tick it was taken for good
  endAt: null,
  endWave: null,
  endHeroHp: null,
  endReason: null,
};
const openingHp = view0.now.hero.hp;
let prevWorks = 0;
const memo = { stagedFor: null };

/** The MINIMAL opening, in the public grammar only: pan, then one palisade per live sandwich. */
function minimalOpeningOrders(now) {
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
  const standing = (now.works.entries ?? []).filter((entry) => !entry.wrecked && entry.hp > 0);
  const hold = new Map((now.atomic?.picnicHold ?? []).map((entry) => [entry.id, entry]));
  const live = stakes.filter((stake) => hold.get(stake.id)?.claimed !== true);
  const open = live
    .filter((stake) => !standing.some((entry) => distance(entry.position, stake) <= HOLD_RADIUS))
    .sort((l, r) => (hold.get(r.id)?.timer ?? 0) - (hold.get(l.id)?.timer ?? 0)
      || distance(now.prospector, l) - distance(now.prospector, r));
  const seams = now.seams.filter((entry) => entry.active && entry.remaining > 0);
  const panNear = (place) => {
    if (seams.length === 0) return [];
    const seam = seams.reduce((near, entry) => (distance(place, entry) < distance(place, near) ? entry : near));
    return Array.from({ length: 8 }, () => ({ verb: 'HARVEST', seam: seam.id }));
  };
  if (open.length === 0) return panNear(now.prospector);
  const target = open[0];
  if (now.gold >= PALISADE) {
    const pad = { x: target.x, z: target.z };
    const key = `palisade@${pad.x},${pad.z}`;
    if (memo.stagedFor !== key) { memo.stagedFor = key; return [{ verb: 'HOLD', pos: pad }]; }
    if (distance(now.prospector, pad) > 2) return [{ verb: 'HOLD', pos: pad }];
    return [{ verb: 'BUILD', what: 'palisade', where: pad, when: { goldGte: PALISADE } }, { verb: 'HOLD', pos: pad }];
  }
  const towards = panNear(target);
  return towards.length > 0 ? towards : [{ verb: 'HOLD', pos: { x: target.x, z: target.z } }];
}

const maxTicks = Math.ceil(maxSeconds * 30);
let lastOrderWave = -1;
let lastOrderAt = -1;
for (let tick = 0; tick < maxTicks && !sim.isTerminal; tick += 1) {
  if (arm === 'opening') {
    // A rider answers at turn boundaries; a human acts continuously. Re-issuing the standing
    // program every simulated second is the closest honest analogue and costs one `calls` each.
    const nowPre = sim.currentTurn().view.now;
    if (nowPre.wave !== lastOrderWave || sim.replayTick - lastOrderAt >= 30) {
      lastOrderWave = nowPre.wave;
      lastOrderAt = sim.replayTick;
      sim.submitOrders(minimalOpeningOrders(nowPre));
    }
  }
  sim.advanceOneTick();
  const turn = sim.currentTurn();
  const now = turn.view.now;
  const at = Number((sim.replayTick / 30).toFixed(3));
  if (marks.firstSpawnAt === null && now.threats.alive > 0) {
    marks.firstSpawnAt = at;
    if (trace) process.stderr.write(`t=${at}s FIRST SPAWN alive=${now.threats.alive}\n`);
  }
  const hold = now.atomic?.picnicHold ?? [];
  for (const stake of hold) {
    if (marks.firstStakePressureAt === null && stake.timer > 0) {
      marks.firstStakePressureAt = at;
      if (trace) process.stderr.write(`t=${at}s FIRST STAKE PRESSURE ${stake.id}\n`);
    }
    if (stake.claimed && marks.stakeClaimedAt[stake.id] === undefined) {
      marks.stakeClaimedAt[stake.id] = at;
      if (trace) process.stderr.write(`t=${at}s CLAIMED ${stake.id}\n`);
    }
  }
  if (marks.firstHeroDamageAt === null && now.hero.hp < openingHp) {
    marks.firstHeroDamageAt = at;
    if (trace) process.stderr.write(`t=${at}s FIRST HERO DAMAGE hp=${now.hero.hp}\n`);
  }
  const works = (now.works.entries ?? []).filter((entry) => !entry.wrecked && entry.hp > 0).length;
  if (works > prevWorks) {
    if (marks.firstBuildAt === null) marks.firstBuildAt = at;
    if (trace) process.stderr.write(`t=${at}s BUILD works=${works} gold=${now.gold}\n`);
    prevWorks = works;
  } else if (works < prevWorks) {
    if (trace) process.stderr.write(`t=${at}s WORK LOST works=${works}\n`);
    prevWorks = works;
  }
  if (sim.isTerminal) {
    marks.endAt = at;
    marks.endWave = now.wave;
    marks.endHeroHp = now.hero.hp;
    marks.endReason = hold.length > 0 && hold.every((stake) => stake.claimed)
      ? 'stakes-all-lost'
      : now.hero.hp <= 0 ? 'hero-down' : 'other';
  }
}

const outcome = sim.isTerminal ? sim.outcome() : null;
const floors = JSON.parse(readFileSync(new URL('../../assets/contracts/null-floors.json', import.meta.url), 'utf8'));
const floor = floors.floors[contractId]?.[seed] ?? null;

Object.assign(console, { log: originalLog });
process.stdout.write(`${JSON.stringify({
  contractId,
  seed,
  arm,
  openingHeroHp: openingHp,
  stakes,
  ...marks,
  outcome,
  floor,
  hashMatchesFloor: arm === 'idle' && outcome && floor ? outcome.eventLogHash === floor.eventLogHash : null,
}, null, 2)}\n`);
await vite.close();
