// ONE GOLD NUMBER PER STANDING — the tape, the assayer and the board (F-2464-2, owner ruling
// 2026-09-06, verbatim: "fix the board and tape gold issue").
//
// THE DEFECT. `HeadlessContractSim` reports two numbers a reader could call "the run's gold":
// `outcome().gold` is `round(economy.gold)`, the purse actually held, and it is what the tape
// declares and what the worker's outcome comparison verifies. The secure-event snapshot used to
// report `event.summary.goldPanned` — the run's LIFETIME panning — and the county publishes THAT
// over the row (`functions/api/standings.ts`, the verdict path). So the board printed a figure no
// rider had. Measured on these three heat-12 reels before the cure: the Mare Claim banked 60 held
// against 1180 panned, Moth Season 200 against 530, Relay Rush 200 against 870 (F-HEAT12-5, and
// `artifacts/board-tape-gold/` carries the replays).
//
// ONE HONEST CORRECTION TO THAT CITATION (F-2464-5, measured here 2026-09-06). Relay Rush's row
// was stored and never assayed (`verdict-slip.json` still reads `assay: pending`, F-HEAT12-4), so
// no snapshot was ever written over it — its board gold is still the 200 it submitted. The third
// row the county actually rewrote to 870 is Echo Canyon, exactly as `matrix.md` says: replayed
// here it banks 200 held against 870 panned and its slip is `verified fnv1a32:8007b47d`. Both
// reels pan 870; only one of them was published at it. Relay Rush is kept as a fixture anyway
// because it is the third reel this task was given, and because a stored-but-unassayed row is the
// case where the cure must change nothing.
//
// WHY HELD IS THE MEANING, and not by taste: `outcome().gold` sits inside the event-log hash
// (`final.base` in `HeadlessContractSim.outcome()`), so teaching the tape to declare panning
// instead would move every pinned hash in the repo. Panned could never be the agreed number; held
// can be, and now is.
//
// WHAT THIS GUARD PINS. Each reel is replayed through the seam the assay worker actually spawns
// (`scripts/assay-replay.mjs`, which routes an `agent_orders` tape to the headless engine that
// wrote it). All three banked at the secure tick, so the secure tick IS the terminal tick and the
// snapshot must equal the declared score EXACTLY — the condition that lets the county's
// score-equals-snapshot comparator be load-bearing instead of decorative.
//
// THE NON-VACUITY CONTROL. Each fixture also carries the panned figure the pre-cure snapshot
// reported. Reverting the sim's snapshot line puts that number back and reds both the equality and
// the control, so this guard cannot pass by agreeing with itself.

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rides = path.join(root, 'artifacts/gauntlet-heat12-20260905/rides');

/**
 * The three heat-12 reels F-HEAT12-5 named. `pannedAtSecure` is what the snapshot reported BEFORE
 * this cure — the run's lifetime panning at the secure tick — and is here only so a revert reds.
 */
const FIXTURES = [
  { ride: 'e8-mare-claim', pannedAtSecure: 1_180 },
  { ride: 'e3-moth-season', pannedAtSecure: 530 },
  { ride: 'e7-relay-rush', pannedAtSecure: 870 },
];

for (const { ride, pannedAtSecure } of FIXTURES) {
  test(`${ride}: the standing's gold is the purse held at the secure tick`, { timeout: 240_000 }, () => {
    const submission = JSON.parse(readFileSync(path.join(rides, ride, 'submission.json'), 'utf8'));
    const declared = {
      secured: submission.score.secured,
      waves: submission.score.waves,
      gold: submission.score.gold,
      timeAlive: submission.score.timeAlive,
    };
    const replay = seam(submission.tape);

    // The reel still replays: this guard measures gold, never whether a tape verifies.
    assert.equal(replay.eventLogHash, submission.tape.eventLogHash, 'the reel no longer replays to its own hash');
    assert.equal(replay.engine, 'headless-contract-sim', 'an agent reel must be assayed by the engine that wrote it');
    assert.deepEqual(replay.outcome, declared, 'the replayed outcome no longer matches the declared score');

    // THE FINDING. All three banked, so the secure tick and the terminal tick are one instant and
    // the snapshot the county publishes must BE the score the rider declared.
    assert.deepEqual(replay.securedSnapshot, { waves: declared.waves, gold: declared.gold, timeAlive: declared.timeAlive },
      'the secure snapshot and the declared score disagree at one tick');
    assert.notEqual(replay.securedSnapshot.gold, pannedAtSecure,
      `the snapshot is reporting lifetime panning (${pannedAtSecure}) again, not the purse held at the secure tick`);

    // Where the county issued a slip, the hash this guard replayed is the hash the county assayed,
    // so the numbers above are about the live row and not about a lookalike.
    const slip = JSON.parse(readFileSync(path.join(rides, ride, 'verdict-slip.json'), 'utf8'));
    if (slip.assay === 'verified') {
      assert.equal(slip.assayHash, replay.eventLogHash, 'the live slip assayed a different reel than this fixture');
    }
  });
}

/** The assay seam the worker spawns, run exactly as `scripts/assay-worker.mjs` runs it. */
function seam(tape) {
  const directory = mkdtempSync(path.join(tmpdir(), 'board-tape-gold-'));
  try {
    const reelPath = path.join(directory, 'reel.json');
    writeFileSync(reelPath, JSON.stringify(tape));
    const run = spawnSync(process.execPath, ['scripts/assay-replay.mjs', reelPath], {
      cwd: root,
      encoding: 'utf8',
      timeout: 200_000,
    });
    assert.equal(run.status, 0, run.stderr);
    return JSON.parse(run.stdout.trim());
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
