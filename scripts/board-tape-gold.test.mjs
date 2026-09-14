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
// WHAT THIS GUARD PINS. Each current-grammar recording is replayed through the seam the assay worker actually spawns
// (`scripts/assay-replay.mjs`, which routes an `agent_orders` tape to the headless engine that
// wrote it). All three local recordings banked at the secure tick, so the secure tick IS the terminal tick and the
// snapshot must equal the declared score EXACTLY — the condition that lets the county's
// score-equals-snapshot comparator be load-bearing instead of decorative.
//
// THE NON-VACUITY CONTROL. Each fixture also carries the panned figure the pre-cure snapshot
// reported. Reverting the sim's snapshot line puts that number back and reds both the equality and
// the control, so this guard cannot pass by agreeing with itself.
//
// ─────────────────────────────────────────────────────────────────────────────────────────────
// THE SECOND DOOR (F-2464-4, same owner ruling, added 2026-09-06). The arms above measure the
// HEADLESS door. The arm at the bottom measures the BROWSER door — the one a human rides — because
// after the cure above the two doors meant different things by `score.gold`: the browser submitted
// `summarizeLog(...).panned` (`Game.ts` `recordRunScore`, `runTapeOutcome`, the `run_secured`
// handler, `RunManager.secureRun`) while the headless door submitted the purse held. Agent rows
// would have published held and human rows panning, on one board.
//
// That arm is a RECORDING, not a replay, and deliberately so. A banked browser reel cannot be the
// fixture: the browser instrument is reached only by a reel whose engine stamp the CURRENT era
// registry admits (`LanternController.usesLanternWorker` → `replayEraRefusal`), and no such reel
// exists on disk — every browser-shaped tape in `artifacts/` is an idle probe stamped to a retired
// engine, panning and holding zero, which cannot separate the two meanings even in principle. So
// this arm rides a real browser run to its secure tick and reads what the door actually POSTS,
// which is the claim the finding is about. Its non-vacuity control is measured in the same run
// rather than banked: gold is granted mid-run so the purse held and the lifetime panning CANNOT be
// the same integer, and the guard asserts they differ before asserting which one was published.
//
// NOTHING LEAVES THIS MACHINE. `https://agenttown.app/api/standings` is intercepted by the page
// route below and fulfilled locally; the live county is never contacted.

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const currentGrammarDir = path.join(root, 'artifacts/board-tape-gold/current-grammar');
const fixtureManifest = JSON.parse(readFileSync(path.join(currentGrammarDir, 'manifest.json'), 'utf8'));

/**
 * Fresh local recordings made after ADR-005 removed positioning verbs. `pannedAtSecure` is the
 * run's measured lifetime panning at the secure tick and is here only so a revert reds.
 */
const FIXTURES = fixtureManifest.fixtures;

for (const { ride, tape: tapeFile, declared, pannedAtSecure, retiredInEra, retiredReason } of FIXTURES) {
  // maps-campaign-land-era6 (2026-09-14): a fixture the manifest marks `retiredInEra` rode an earlier era and
  // cannot install on the current engine; it is SKIPPED with its reason, never re-stamped (F-MAPL-4).
  test(`${ride}: the standing's gold is the purse held at the secure tick`, { timeout: 240_000, skip: retiredInEra ? `retired in era ${retiredInEra}: ${retiredReason}` : false }, () => {
    const tape = JSON.parse(readFileSync(path.join(currentGrammarDir, tapeFile), 'utf8'));
    const replay = seam(tape);

    // The reel still replays: this guard measures gold, never whether a tape verifies.
    assert.equal(replay.eventLogHash, tape.eventLogHash, 'the reel no longer replays to its own hash');
    assert.equal(replay.engine, 'headless-contract-sim', 'an agent reel must be assayed by the engine that wrote it');
    assert.deepEqual(
      { secured: tape.outcome.secured, waves: tape.outcome.waves, gold: tape.outcome.gold, timeAlive: tape.outcome.timeAlive },
      declared,
      'the recording no longer carries the declared score',
    );
    assert.deepEqual(replay.outcome, declared, 'the replayed outcome no longer matches the declared score');

    // THE FINDING. All three banked, so the secure tick and the terminal tick are one instant and
    // the snapshot the county publishes must BE the score the rider declared.
    assert.deepEqual(replay.securedSnapshot, { waves: declared.waves, gold: declared.gold, timeAlive: declared.timeAlive },
      'the secure snapshot and the declared score disagree at one tick');
    assert.notEqual(replay.securedSnapshot.gold, pannedAtSecure,
      `the snapshot is reporting lifetime panning (${pannedAtSecure}) again, not the purse held at the secure tick`);

    assert.equal(fixtureManifest.liveVerifiedSlip, null, 'local fixtures must not pretend to have a live county verdict');
  });
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// THE BROWSER DOOR (F-2464-4). Storage keys are literals because this file is plain node and the
// game's constants are TypeScript; each is cited so a rename is findable:
//   `src/game/ProfileStorage.ts:20`, `src/telemetry/payload.ts:3`, `:5`.
const PROFILE_KEY = 'gr.profile.v2';
const TELEMETRY_OPT_IN_KEY = 'gr.telemetry.optIn.v1';
const TELEMETRY_DEV_SEND_KEY = 'gr.telemetry.devSend.v1';
const STANDINGS_ORIGIN = 'https://agenttown.app';
// A bench seed for `the-claim`; `submitCountyStanding` refuses a pinned seed that is not one
// (`assets/contracts/bench-seeds.json`).
const BENCH_SEED = 'e1-the-claim-01';
// The run PANS at least this much and then SPENDS a beacon, so the purse held ends BELOW the run's
// lifetime panning — the same direction as the live defect (the Mare Claim banked 60 held against
// 1180 panned). A run that never spends holds exactly what it panned and could not tell the two
// meanings apart.
const PAN_TARGET = 30;
// EVIDENCE IS WRITTEN ONLY WHEN IT IS ASKED FOR (F-RRR-5, cured 2026-09-07 by `spec-hygiene-batch`;
// F-HMV-2's class). This guard used to write `artifacts/browser-door-held-gold/browser-submission.json`
// unconditionally, and that file's `measuredAt` is a fresh ISO stamp on every run — pure noise over a
// TRACKED file, which is exactly the churn F-1229-1 named for `test:accounts`/`test:mp`. Those two
// honour GR_GUARD_NO_ARTIFACT (opt-OUT, set by scripts/run-guards.mjs); this one is opt-IN instead, so
// that the quiet default is the clean tree and no runner has to remember a flag to keep it. Set
// GR_REFRESH_EVIDENCE=1 to refresh the committed submission; otherwise it lands in the gitignored
// test-results/evidence/ under the same name.
const EVIDENCE = path.join(root, process.env.GR_REFRESH_EVIDENCE === '1'
  ? 'artifacts/browser-door-held-gold'
  : 'test-results/evidence/browser-door-held-gold');

test("the browser door submits the purse held at the secure tick, not the run's lifetime panning", { timeout: 300_000 }, async () => {
  const vite = await createServer({
    root,
    logLevel: 'silent',
    server: { host: '127.0.0.1', port: 0 },
  });
  await vite.listen();
  const base = vite.resolvedUrls?.local?.[0]?.replace(/\/$/, '') ?? `http://127.0.0.1:${vite.config.server.port}`;
  const browser = await chromium.launch({ headless: true, channel: 'chromium' });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('console', (message) => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
    page.on('pageerror', (error) => errors.push(`page: ${error.message}`));

    await page.addInitScript(({ profileKey, optInKey, devSendKey }) => {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem(profileKey, JSON.stringify({
        version: 2,
        activeId: 'browser-door-held-gold',
        profiles: [{
          id: 'browser-door-held-gold',
          name: 'Browser Door Held Gold',
          createdAt: 1,
          updatedAt: 1,
          difficultyPreset: 'trail',
          hintsSeen: ['story:first-contract'],
        }],
      }));
      localStorage.setItem(optInKey, '1');
      localStorage.setItem(devSendKey, '1');
    }, { profileKey: PROFILE_KEY, optInKey: TELEMETRY_OPT_IN_KEY, devSendKey: TELEMETRY_DEV_SEND_KEY });

    // THE LIVE COUNTY IS NEVER CONTACTED: the POST is captured here and answered locally.
    const posts = [];
    await page.route(`${STANDINGS_ORIGIN}/api/standings**`, async (route) => {
      if (route.request().method() === 'POST') posts.push(JSON.parse(route.request().postData() ?? '{}'));
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true,"stored":true,"rank":1}' });
    });
    await page.route('**/api/telemetry', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }));

    await page.goto(`${base}/?debug&nolevel&seed=${BENCH_SEED}`, { waitUntil: 'load', timeout: 120_000 });
    await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 5, undefined, { timeout: 120_000 });

    // The sim clock is driven by hand from here on, exactly as `e2e/tape-01-run-tape.spec.ts` drives
    // it, so the setup below cannot race the wave scheduler.
    await page.evaluate(() => {
      window.__GR_TEST__.setManualSim(true);
      window.__GR_TEST__.setBalance('enemy.contactDamage', 0);
      window.__GR_TEST__.clearScores();
      window.__GR_TEST__.resetRun();
      window.__GR_TEST__.setManualSim(true);
    });

    // ① PAN. Stand on the nearest live seam and channel until the run has really panned gold.
    await page.evaluate(() => {
      const hero = window.__THREE_GAME_DIAGNOSTICS__.heroPos;
      const [nearest] = window.__THREE_GAME_DIAGNOSTICS__.harvest.activeNodes
        .filter((entry) => entry.active)
        .sort((a, b) => (a.position.x - hero.x) ** 2 + (a.position.z - hero.z) ** 2
          - ((b.position.x - hero.x) ** 2 + (b.position.z - hero.z) ** 2));
      if (!nearest) throw new Error('no live seam to pan');
      window.__GR_TEST__.teleport(nearest.position.x, nearest.position.z);
    });
    await advanceUntil(page, (target) => window.__THREE_GAME_DIAGNOSTICS__.economy.summary.panned >= target, 2, 40,
      'the run never panned; the two gold meanings would coincide', PAN_TARGET);

    // ② SPEND. Step off the seam (the build ghost is overlap-invalid on a node) and buy a beacon, so
    // the purse held drops below the lifetime panning and the guard below has two distinct numbers.
    await page.evaluate(() => window.__GR_TEST__.teleport(3, 12));
    await advanceUntil(page, () => window.__THREE_GAME_DIAGNOSTICS__.harvest.channeling === false, 0.5, 20,
      'the hero kept channelling after stepping off the seam');
    await page.evaluate(() => window.__GR_TEST__.setBuildMode(true));
    await advanceUntil(page, () => window.__THREE_GAME_DIAGNOSTICS__.build.ghostValid === true, 0.5, 20,
      'the build ghost never became valid');
    assert.equal(await page.evaluate(() => window.__GR_TEST__.placeBeacon()), true, 'the beacon would not place');
    await advanceUntil(page, () => window.__THREE_GAME_DIAGNOSTICS__.economy.summary.spent > 0, 0.5, 20,
      'the beacon cost nothing, so the purse held still equals the lifetime panning');

    // ③ SECURE. The wave acceleration `e2e/assay-auto-tape.spec.ts` uses to reach the secure wave.
    await page.evaluate(() => {
      window.__GR_TEST__.setBalance('waves.waveInterval', 0.35);
      window.__GR_TEST__.setBalance('waves.trickleInterval', 9999);
      window.__GR_TEST__.setBalance('waves.pulseBase', 1);
      window.__GR_TEST__.setBalance('waves.pulsePerWave', 0);
      window.__GR_TEST__.setBalance('waves.pulsesPerWave', 1);
      window.__GR_TEST__.setBalance('waves.edgesPerPulse', 1);
      window.__GR_TEST__.setManualSim(false);
    });

    // The secure overlay pauses the sim, so the numbers read here ARE the secure tick's.
    await page.waitForSelector('[data-testid="claim-secured"]', { timeout: 120_000 });
    const atSecure = await page.evaluate(() => {
      const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
      return {
        held: Math.floor(diagnostics.economy.gold),
        panned: Math.floor(diagnostics.economy.summary.panned),
        snapshot: diagnostics.run.securedSnapshot,
        wave: Math.floor(diagnostics.wave),
      };
    });

    await page.click('[data-testid="bank-secured-claim"]');
    await waitFor(() => posts.length > 0, 60_000, 'the browser door never posted a standing');
    const posted = posts[0];

    // THE NON-VACUITY CONTROL, measured in this very run: unless the two quantities differ, every
    // assertion below would pass under either meaning and this guard would prove nothing.
    assert.notEqual(atSecure.held, atSecure.panned,
      `held (${atSecure.held}) and panned (${atSecure.panned}) coincided, so this run cannot tell the two meanings apart`);

    // THE FINDING. What the door PUBLISHES is the purse held.
    assert.equal(posted.score.gold, atSecure.held, 'the browser door submitted a gold that is not the purse held at the secure tick');
    assert.notEqual(posted.score.gold, atSecure.panned, 'the browser door is submitting lifetime panning again');

    // The reel it attaches DECLARES the same number, so the assayer's outcome comparison means one
    // thing on both doors, and the snapshot the instrument reads agrees with the score at one tick —
    // which is what makes `securedSnapshotMismatch` load-bearing rather than decorative.
    assert.equal(posted.tape?.outcome?.gold, atSecure.held, 'the attached reel declares a different gold than the submitted score');
    assert.deepEqual(atSecure.snapshot, { waves: posted.score.waves, gold: atSecure.held, timeAlive: posted.score.timeAlive },
      'the secure snapshot and the submitted score disagree at one tick');

    assert.deepEqual(errors, [], 'the run raised console or page errors');

    mkdirSync(EVIDENCE, { recursive: true });
    writeFileSync(path.join(EVIDENCE, 'browser-submission.json'), `${JSON.stringify({
      measuredAt: new Date().toISOString(),
      contract: 'the-claim',
      seed: BENCH_SEED,
      panTarget: PAN_TARGET,
      atSecure,
      submitted: {
        score: posted.score,
        tapeOutcome: posted.tape?.outcome ?? null,
        eventLogHash: posted.tape?.eventLogHash ?? null,
      },
    }, null, 2)}\n`);
  } finally {
    await browser.close();
    await vite.close();
  }
});

async function waitFor(predicate, timeoutMs, message) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(message);
}

/** Steps the hand-driven sim clock until the page-side predicate holds, or fails with its reason. */
async function advanceUntil(page, predicate, seconds, steps, message, argument) {
  for (let step = 0; step < steps; step += 1) {
    if (await page.evaluate(predicate, argument)) return;
    await page.evaluate((advance) => window.__GR_TEST__.advanceSim(advance), seconds);
  }
  if (await page.evaluate(predicate, argument)) return;
  throw new Error(message);
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
