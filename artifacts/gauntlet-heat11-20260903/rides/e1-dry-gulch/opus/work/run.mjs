import { ride } from './drive.mjs';
import { makePolicy, CLAIM } from './controller.mjs';
import { writeFileSync, readFileSync, existsSync } from 'node:fs';

const WS = '/tmp/heat11-5e7a7c0b/artifacts/heat11/opus/e1-dry-gulch';
const OUT = `${WS}/gauntlet-outcome.json`;

const name = process.argv[2] ?? 'tune-1';
const variant = process.argv[3] ?? 'a';
const scored = process.argv[4] === 'scored';

// Fort geometry: tight ring on the claim (gen-3: clustering cuts the repair sweep).
const V = {
  a: {
    turretSlots: [{ x: -7, z: 12 }, { x: 7, z: 12 }, { x: 0, z: 5 }, { x: 0, z: 19 }],
    beaconSlots: [{ x: -4, z: 8 }, { x: 4, z: 16 }, { x: -4, z: 16 }, { x: 4, z: 8 }, { x: -11, z: 12 }, { x: 11, z: 12 }],
    buildOrder: [
      { kind: 'turret' }, { kind: 'beacon' }, { kind: 'turret' }, { kind: 'beacon' },
      { kind: 'turret' }, { kind: 'beacon' }, { kind: 'turret' }, { kind: 'beacon' },
      { kind: 'beacon' }, { kind: 'beacon' },
    ],
    upgradePrefs: ['tinkers_plating', 'heavy_spark', 'double_tap_coil'],
    repairPct: 60,
    harvestMaxDist: Infinity,
  },
};
V.b = { ...V.a, upgradePrefs: ['heavy_spark', 'double_tap_coil', 'tinkers_plating'] };
V.c = { ...V.a, harvestMaxDist: 20 };
V.d = { ...V.a, blast: true };

const cfg = { ...V[variant], homePos: CLAIM };
const policy = makePolicy(cfg);
const tape = `${WS}/${name}-tape.json`;

const r = await ride({ policy, tape, logName: `${name}.jsonl` });
const o = r.outcome ?? { secured: false, note: 'no outcome line', stderr: r.stderr.slice(-800) };

console.log('OUTCOME', JSON.stringify(o));
for (const t of policy.trace) console.log(JSON.stringify(t));
if (r.stderr.includes('rejected')) console.log('REJECTS', r.stderr.split('\n').filter((l) => l.includes('rejected')).slice(0, 8).join('\n'));

// THE INTERMEDIATE-RESULTS LAW: best outcome so far, after every run.
let state = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : null;
const runsSoFar = (state?.runsSoFar ?? 0) + 1;
const scoredAttempts = (state?.scoredAttempts ?? 0) + (scored ? 1 : 0);
const better = !state || (o.secured && !state.secured)
  || (!!o.secured === !!state.secured && ((o.waves ?? 0) > (state.waves ?? 0)
    || ((o.waves ?? 0) === (state.waves ?? 0) && (o.timeMs ?? 0) > (state.timeMs ?? 0))));
const base = better ? { ...o, tape, scored } : { ...state };
delete base.runsSoFar; delete base.scoredAttempts; delete base.worldModel;
writeFileSync(OUT, JSON.stringify({
  ...base, runsSoFar, scoredAttempts, worldModel: 'sim-import',
}, null, 2));
console.log('WROTE', OUT, 'better=' + better);
