import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { createServer } from 'vite';
import engineEra from '../assets/engine-era.json' with { type: 'json' };

test('rob\'s v1 live reel is retained but reported as unverifiable legacy', () => {
  const fixturePath = 'scripts/fixtures/assay/rob-the-claim-reel.json';
  const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'));
  const run = spawnSync(process.execPath, [
    'scripts/assay-replay.mjs',
    fixturePath,
  ], { cwd: process.cwd(), encoding: 'utf8', timeout: 120_000 });
  assert.equal(run.status, 0, run.stderr);
  const lines = run.stdout.trim().split('\n');
  assert.equal(lines.length, 1, run.stdout);
  const result = JSON.parse(lines[0]);
  assert.deepEqual(result, { status: 'unverifiable-legacy' });
  assert.equal(fixture.eventLogHash, 'fnv1a32:f6390382');
});

/**
 * THE BROWSER ARM READS THE PURSE HELD (F-2464-4, owner ruling 2026-09-06, verbatim: "fix the board
 * and tape gold issue"). Every other test in this file rides the HEADLESS arm, because that is the
 * only arm a banked reel can reach: `assay-replay.mjs` routes an `agent_orders` reel to
 * `assay-replay-agent.mjs`, and the browser arm below it is reached only by a browser recording.
 *
 * THIS IS A SOURCE PIN AND SAYS SO. A replay fixture for the browser arm is not producible today
 * and the reason is structural, not effort: a browser reel replays through a FIXED boot
 * (`?debug&assayReplay&replay=…`) that re-applies no `setBalance`, no `grantGold` and no
 * `teleport`, so any recording able to separate the purse held from the run's lifetime panning
 * within a short ride diverges on replay and its hash — the thing the worker actually compares —
 * would not reproduce. Every browser-shaped tape already on disk is an idle probe stamped to a
 * retired engine that panned and held zero, which cannot separate the two meanings even in
 * principle. So the BEHAVIOURAL proof for the browser door lives in `scripts/board-tape-gold.test.mjs`,
 * which rides a real browser run to its secure tick and reads what the door POSTS; this test only
 * refuses the two-token regression that would put the other quantity back into the instrument.
 */
test('the browser arm of the assay instrument reports the purse held, not lifetime panning', () => {
  // Comment lines are stripped first: the prose beside the cure names the rejected quantity, and a
  // guard that reads its own explanation as a violation would be unmaintainable.
  const instrument = readFileSync('scripts/assay-replay.mjs', 'utf8')
    .split('\n').filter((line) => !line.trim().startsWith('//')).join('\n');
  assert.match(instrument, /gold: Math\.floor\(diagnostics\.economy\.gold\),/,
    'the browser arm no longer reports the purse held at the replayed terminal tick');
  assert.doesNotMatch(instrument, /economy\.summary\.panned/,
    'the browser arm is reading lifetime panning again, so a browser reel and an agent reel would be assayed by two different meanings');
});

test('the round-2 corpus hash remains byte-for-byte pinned', () => {
  const tape = JSON.parse(readFileSync('artifacts/assay-e2e-20260822/round2/tape-secure-verb.json', 'utf8'));
  assert.equal(tape.eventLogHash, 'fnv1a32:ba8fdc3e');
});

/**
 * RE-STATED 2026-09-07 (`rider-parity-grammar-stage3` B, ADR-005). This test asserted that a
 * pre-era engine-stamped agent tape still replays. It no longer can, and the reason is the ruling:
 * its plan names `HOLD`, and the door has no such verb. MEASURED, not assumed — every banked agent
 * tape on disk carries one of the three retired verbs (57 heat-12, all of heat 5 and 5b, the whole
 * assay-e2e round-2 corpus), so there is no surviving tape this test could be re-pointed at. The
 * live replay path is still measured, by the test below that GENERATES a tape from the current door
 * and replays it.
 *
 * What is asserted instead is the retirement itself, at the layer a BANKED tape meets it:
 * `validateRunTape` (`src/replay/AgentTapeReplay.ts:67`) refuses the whole tape before a tick runs,
 * so the assayer answers `malformed tape` and exits non-zero. A live rider meets the same
 * retirement one layer later, at submission, with the named message
 * (`scripts/rider-parity-retirement.test.mjs`).
 *
 * RETENTION LAW (CLAUDE.md 4.10b): the tape is NOT deleted, edited or re-recorded. Its recorded
 * identity is kept here so the history survives its retirement — heat 5b, e2-hill-mine,
 * winning-tape.json, which replayed to a well-formed fnv1a32 hash until this ruling landed.
 */
test('pre-era engine-stamped agent tapes are retired: the assayer refuses their plans', () => {
  const run = spawnSync(process.execPath, ['scripts/assay-replay.mjs', 'artifacts/gauntlet-heat5b-20260825/e2-hill-mine/winning-tape.json'],
    { cwd: process.cwd(), encoding: 'utf8', timeout: 120_000 });
  assert.notEqual(run.status, 0, 'a tape naming a retired verb must not replay');
  assert.match(run.stderr, /assay replay failed: malformed tape/);
  const tape = JSON.parse(readFileSync('artifacts/gauntlet-heat5b-20260825/e2-hill-mine/winning-tape.json', 'utf8'));
  const verbs = new Set(tape.inputLog.entries.flatMap(({ a }) => a.flatMap(({ orders }) => (orders ?? []).map(({ verb }) => verb))));
  assert.ok(verbs.has('HOLD'), 'the tape still carries the retired verb it was retired for (nothing was edited)');
});

/**
 * RE-STATED 2026-09-07 (`rider-parity-grammar-stage3` B, ADR-005), having been RE-DERIVED hours
 * earlier in the same task's A0. Both movements are recorded here, because the second supersedes
 * the first and a reader who sees only the end state cannot tell that the tape's behaviour was
 * measured before it was retired.
 *
 * A0 (stage 2's bounded `REPAIR_UNDER`): the tape's hash did NOT move and could not —
 * `agentOrdersEventLogHash` (`src/game/RunTape.ts:319`) hashes the tape's submissions alone. Its
 * OUTCOME moved, and one change explained all four numbers: the search is now bounded to
 * `Balance.sparkRig.range` (10) from the acting body and takes the nearest match, so the tape's 64
 * `REPAIR_UNDER` orders stopped sending the Prospector across the map. Measured on this tree:
 *   fnv1a32:53d07e8d, { secured: false, waves: 16, gold: 27, timeAlive: 508.967 }, 15269 ticks
 *     -> fnv1a32:53d07e8d, { secured: false, waves: 17, gold: 38, timeAlive: 538.4 }, 16152 ticks.
 *
 * B (the removal): the tape carries 32 `HOLD` orders, so it no longer replays AT ALL.
 * `validateRunTape` refuses the whole tape and the assayer answers `malformed tape`. The
 * libm-divergence question this tape was banked for is not answered by a canonical replay any
 * more; it is answered by the record above and by the tape itself, which is kept byte-for-byte
 * (RETENTION LAW, CLAUDE.md 4.10b). Its row in
 * `artifacts/rider-parity-grammar/retirement-ledger.json` is the same retirement in the ledger's
 * own words.
 */
test('the hill-mine libm divergence tape is retired, and the tape it was measured from is kept', () => {
  const path = 'artifacts/gauntlet-heat5-20260824/e2-hill-mine/winning-tape.json';
  const run = spawnSync(process.execPath, ['scripts/assay-replay.mjs', path],
    { cwd: process.cwd(), encoding: 'utf8', timeout: 240_000 });
  assert.notEqual(run.status, 0, 'a tape naming a retired verb must not replay');
  assert.match(run.stderr, /assay replay failed: malformed tape/);
  // The tape is unedited: same recorded outcome, same retired verb, same 64 REPAIR_UNDER orders.
  const tape = JSON.parse(readFileSync(path, 'utf8'));
  assert.equal(tape.eventLogHash, 'fnv1a32:017e4c97');
  const orders = tape.inputLog.entries.flatMap(({ a }) => a.flatMap(({ orders: submitted }) => submitted ?? []));
  assert.equal(orders.filter(({ verb }) => verb === 'HOLD').length, 32);
  assert.equal(orders.filter(({ verb }) => verb === 'REPAIR_UNDER').length, 64);
});

/**
 * THE DOOR TAPE, END TO END (F-ASSAY-E2E-1/2/3, 2026-08-22). Before this test the public headless
 * door was unverifiable by construction and nothing said so: gr-sim stamped `version: 1` while the
 * worker refused anything but v2, an explicit boundary answer built a tape the county returned 400
 * for, and no test replayed a tape the door itself had produced. The run below is generated here
 * rather than pinned as a fixture, so it measures the CURRENT writer against the CURRENT seam and
 * cannot quietly agree with itself while both drift.
 */
test('a securing door tape carries its start, its boundary answer, and replays to its own hash', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'gold-rush-assay-door-'));
  try {
    const tapePath = join(directory, 'door-tape.json');
    const outcome = await ride(['--contract', 'the-claim', '--seed', 'e1-the-claim-02', '--tape', tapePath]);
    assert.equal(outcome.secured, true, JSON.stringify(outcome));
    const tape = JSON.parse(readFileSync(tapePath, 'utf8'));

    // F-ASSAY-E2E-1: the door writes the version the assayer accepts, and declares what it booted
    // under. gr-sim rides a virgin profile, so the truthful declaration is the fresh one.
    assert.equal(tape.version, 2);
    assert.equal(typeof tape.meta?.buildId, 'string', 'the door records which checkout built its tape');
    assert.match(tape.meta?.engineHash, /^[a-f0-9]{64}$/, 'the door records the engine content it ran');
    assert.equal(tape.meta?.era, engineEra.era, 'the door records the announced engine era');
    assert.deepEqual(tape.runStart.meta, { version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: 0 } });
    assert.deepEqual(tape.runStart.research.taken, []);
    assert.equal(tape.runStart.research.version, 1);

    // F-ASSAY-E2E-2: the boundary answer. A CHANGE DETECTOR — the rider answers the instant the
    // secure window opens, which is the terminal instant of the sim clock, so its entry sits one
    // tick past the elapsed count. That entry is the whole finding: it used to make the county
    // answer HTTP 400 `bad_payload`, and only silence could be submitted.
    const last = tape.inputLog.entries.at(-1);
    assert.deepEqual(last.a.at(-1).orders, [{ verb: 'SECURE_CHOICE', choice: 'bank' }]);
    assert.equal(last.t, Math.round(tape.outcome.timeAlive * 30), 'the boundary answer lands at the terminal instant');
    assert.ok(last.t < tape.inputLog.durationTicks, 'and the declared duration makes it a legal entry');
    assert.ok(await countyAccepts(tape), 'the county validator accepts the tape the door wrote');

    // F-ASSAY-E2E-3: the claim reproduces through the seam the worker runs.
    const replay = seam(tapePath);
    assert.equal(replay.eventLogHash, tape.eventLogHash);
    assert.deepEqual(replay.outcome, {
      secured: tape.outcome.secured,
      waves: tape.outcome.waves,
      gold: tape.outcome.gold,
      timeAlive: tape.outcome.timeAlive,
    });

    // ...and only the recorded stream reproduces it. Drop the boundary answer and the run still
    // secures on its own default clock, but the accepted order stream is a different stream and
    // says so — which is the whole anti-fabrication value of the hash.
    const tamperedPath = join(directory, 'tampered.json');
    writeFileSync(tamperedPath, JSON.stringify({
      ...tape,
      inputLog: { ...tape.inputLog, entries: tape.inputLog.entries.slice(0, -1) },
    }));
    assert.notEqual(seam(tamperedPath).eventLogHash, tape.eventLogHash);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('an overtime replay returns the immutable secure-event snapshot and the later final outcome', { timeout: 240_000 }, async () => {
  const directory = mkdtempSync(join(tmpdir(), 'gold-rush-assay-overtime-'));
  try {
    const tapePath = join(directory, 'overtime-tape.json');
    const outcome = await ride(['--contract', 'the-claim', '--seed', 'e1-the-claim-02', '--overtime', '--tape', tapePath], 'rush');
    const replay = seam(tapePath);
    assert.equal(outcome.secured, true);
    assert.deepEqual(replay.outcome, {
      secured: outcome.secured,
      waves: outcome.waves,
      gold: outcome.gold,
      timeAlive: outcome.timeMs / 1000,
    });
    assert.equal(replay.securedSnapshot.waves, 10);
    // 290 until 2026-09-06 (F-2464-2, owner ruling "fix the board and tape gold issue"). That was
    // this run's LIFETIME PANNING at the secure tick; the county publishes this snapshot over the
    // row, so the board printed a number no rider had. The snapshot now reports the purse actually
    // HELD at that tick — the same quantity `outcome().gold` reports, and the only one that can
    // agree with it, since `outcome().gold` is inside the event-log hash. 290 is what this rider
    // had PANNED by wave 10; 6 is what it still HELD when the claim was secured.
    // 6 -> 15 (rider-parity-grammar-stage3 B, ADR-005): this ride is GENERATED by the policy
    // below, whose plan used to end with HOLD at the claim and now ends with MOVE_HERO at the same
    // point. The hero takes the post the Prospector used to be pinned to, so the run banks a
    // different purse at the same wave. Everything the test is ABOUT is unchanged: the snapshot is
    // still the immutable secure-tick reading, still the purse HELD rather than lifetime panning,
    // and still different from the later final outcome.
    assert.equal(replay.securedSnapshot.gold, 15);
    assert.equal(Math.round(replay.securedSnapshot.timeAlive), 300);
    assert.ok(replay.outcome.waves > replay.securedSnapshot.waves);
    assert.notEqual(replay.outcome.gold, replay.securedSnapshot.gold);
    assert.ok(replay.outcome.timeAlive > replay.securedSnapshot.timeAlive);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

/** The assay seam the worker spawns, run exactly as `scripts/assay-worker.mjs` runs it. */
function seam(tapePath) {
  const run = spawnSync(process.execPath, ['scripts/assay-replay.mjs', tapePath], {
    cwd: process.cwd(),
    encoding: 'utf8',
    timeout: 240_000,
  });
  assert.equal(run.status, 0, run.stderr);
  return JSON.parse(run.stdout.trim());
}

async function countyAccepts(tape) {
  const vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
  try {
    const { validateTape } = await vite.ssrLoadModule('/functions/api/standings.ts');
    return validateTape(tape, tape.contract, tape.seed, tape.difficulty) !== null;
  } finally {
    await vite.close();
  }
}

/**
 * A minimal securing rider through the PLAIN public door — the same shape
 * `scripts/gr-sim.test.mjs` rides `the-claim` with, answering `bank` at the boundary so the tape
 * carries the terminal-instant order this suite is about.
 */
const FORT = {
  sentry_beacon: { at: [{ x: 0, z: 13 }, { x: 0, z: 11 }, { x: 3, z: 12 }, { x: -3, z: 12 }, { x: 0, z: 15 }, { x: 0, z: 9 }], cost: [25, 35, 45, 55, 75, 95] },
  turret: { at: [{ x: 4, z: 14 }, { x: -4, z: 14 }, { x: 4, z: 10 }, { x: -4, z: 10 }], cost: [50, 70, 95, 125] },
};

function ordersFor(view, secureChoice = 'bank') {
  if (view.now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: secureChoice }];
  if (view.now.pendingOffer?.[0]) return [{ verb: 'PICK_UPGRADE', id: view.now.pendingOffer[0].id }];
  const orders = [];
  for (const [kind, plan] of Object.entries(FORT)) {
    for (let index = view.now.works.byKind[kind] ?? 0; index < plan.at.length; index += 1) {
      orders.push({ verb: 'BUILD', what: kind, where: plan.at[index], when: { goldGte: plan.cost[index] } });
    }
  }
  for (const seam of view.now.seams.filter(({ active, remaining }) => active && remaining > 0)) {
    for (let count = 0; count < 4; count += 1) orders.push({ verb: 'HARVEST', seam: seam.id });
  }
  if (view.now.works.hp > 0 && view.now.works.hp < view.now.works.maxHp * 0.6) orders.push({ verb: 'REPAIR_UNDER', pct: 80 });
  // ADR-005 stage 3: was HOLD at the claim, a verb the door no longer knows. The hero takes the
  // post and the Prospector drifts to it.
  orders.push({ verb: 'MOVE_HERO', pos: { x: 0, z: 12 } });
  return orders.slice(0, 32);
}

function ride(args, secureChoice = 'bank') {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['scripts/gr-sim.mjs', ...args], { cwd: process.cwd(), stdio: ['pipe', 'pipe', 'pipe'] });
    const timer = setTimeout(() => child.kill('SIGKILL'), 240_000);
    let buffer = '';
    let stderr = '';
    let outcome;
    child.stdout.on('data', (chunk) => {
      buffer += chunk;
      let newline;
      while ((newline = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, newline);
        buffer = buffer.slice(newline + 1);
        if (!line) continue;
        const message = JSON.parse(line);
        if (message.schema === 'goldrush.view.v1') child.stdin.write(`${JSON.stringify(ordersFor(message, secureChoice))}\n`);
        else outcome = message;
      }
    });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code !== 0) reject(new Error(stderr));
      else resolve(outcome);
    });
  });
}
