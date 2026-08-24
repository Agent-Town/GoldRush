import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { createServer } from 'vite';

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

test('the round-2 corpus hash remains byte-for-byte pinned', () => {
  const tape = JSON.parse(readFileSync('artifacts/assay-e2e-20260822/round2/tape-secure-verb.json', 'utf8'));
  assert.equal(tape.eventLogHash, 'fnv1a32:ba8fdc3e');
});

test('the hill-mine libm divergence tape has one canonical post-cure replay', () => {
  const replay = seam('artifacts/gauntlet-heat5-20260824/e2-hill-mine/winning-tape.json');
  assert.deepEqual({ eventLogHash: replay.eventLogHash, outcome: replay.outcome, ticks: replay.ticks }, {
    eventLogHash: 'fnv1a32:53d07e8d',
    outcome: { secured: false, waves: 16, gold: 27, timeAlive: 508.967 },
    ticks: 15269,
  });
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

function ordersFor(view) {
  if (view.now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
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
  orders.push({ verb: 'HOLD', pos: { x: 0, z: 12 } });
  return orders.slice(0, 32);
}

function ride(args) {
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
        if (message.schema === 'goldrush.view.v1') child.stdin.write(`${JSON.stringify(ordersFor(message))}\n`);
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
