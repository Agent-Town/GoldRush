#!/usr/bin/env node

/**
 * THE BISECT INSTRUMENT — replays one reel through the assayer's own seam against an ARBITRARY
 * checkout of the engine, so the same probe can be pointed at every commit in a bisect without
 * the probe itself becoming a variable.
 *
 * It is `scripts/assay-replay-agent.mjs`'s `replayAgentTape` with two differences, both of them
 * measurement-only: the vite root is a parameter (the detached worktree under test), and the
 * session is stepped by hand so a run that never terminates can still be described — where it
 * stood at the end, and at which wave it stopped moving. Nothing about the run is changed: the
 * same module, the same `AgentTapeReplaySession`, the same order stream, the same terminal test.
 *
 * Usage: node artifacts/relay-rush-replays-again/probe.mjs <repoRoot> <reel> [snapshotEvery] [stepCap]
 *
 * <reel> is a tape file, a `{reel}` wrapper, or a county `submission.json` — the three shapes the
 * reels are banked in — so it can be pointed straight at a tracked ride's own evidence:
 *   artifacts/gauntlet-heat11-20260903/rides/e7-relay-rush/opus/work/attempt-1-tape.json  (retired)
 *   artifacts/gauntlet-heat12-20260905/rides/e7-relay-rush/submission.json                (secures)
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createServer } from 'vite';

const targetRoot = path.resolve(process.argv[2] ?? '.');
const reelPath = path.resolve(process.argv[3] ?? 'artifacts/gauntlet-heat11-20260903/rides/e7-relay-rush/opus/work/attempt-1-tape.json');
const snapshotEvery = Number(process.argv[4] ?? 1800);
// A bisect only needs to know whether the run is still alive well past the tape; the seam's own
// full ceiling is used for the verdict runs. `0` means "the seam's ceiling, verbatim".
const stepCapArg = Number(process.argv[5] ?? 0);

function installLocationShim(tape) {
  const location = new URL('http://gr-sim.local/');
  location.searchParams.set('debug', '');
  location.searchParams.set('contract', tape.contract);
  location.searchParams.set('seed', tape.seed);
  globalThis.location = location;
  globalThis.window = { location };
}

const payload = JSON.parse(await readFile(reelPath, 'utf8'));
const tape = payload?.reel ?? payload?.tape ?? payload;
installLocationShim(tape);

const vite = await createServer({
  root: targetRoot,
  appType: 'custom',
  logLevel: 'silent',
  server: { middlewareMode: true, watch: null },
});
const quiet = { log: console.log, info: console.info, debug: console.debug, warn: console.warn };
console.log = console.info = console.debug = console.warn = () => undefined;

const report = { root: targetRoot, ok: false };
try {
  const module = await vite.ssrLoadModule('/src/replay/AgentTapeReplay.ts');
  const session = new module.AgentTapeReplaySession(tape);
  // The seam's own ceiling, verbatim: `replayAgentTape` runs while
  // `steps < durationTicks + FROZEN_STEP_ALLOWANCE` (`src/replay/AgentTapeReplay.ts:16,48`).
  const seamCeiling = session.durationTicks + 18_000;
  const ceiling = stepCapArg > 0 ? Math.min(stepCapArg, seamCeiling) : seamCeiling;
  report.seamCeiling = seamCeiling;
  report.ceiling = ceiling;
  const trail = [];
  let steps = 0;
  const firstWaveTick = new Map();
  // TS `private` is a compile-time fence only; the sim object is reachable for read-only
  // instrumentation. Reading the wave counter costs nothing, where snapshot() rebuilds the
  // whole census and cannot be afforded 36,000 times.
  const waveOf = () => session.sim?.waves?.diagnostics?.wave ?? -1;
  while (!session.complete && steps < ceiling) {
    if (steps % snapshotEvery === 0) {
      const snap = session.snapshot();
      trail.push({
        step: steps,
        tick: snap.tick,
        wave: snap.wave,
        t: Math.round(snap.timeAlive * 100) / 100,
        gold: Math.round(snap.gold),
        heroHp: Math.round(snap.hero.hp * 10) / 10,
        heroMaxHp: snap.hero.maxHp,
        enemies: snap.enemies.filter((e) => e.alive).length,
      });
    }
    const wave = waveOf();
    if (!firstWaveTick.has(wave)) firstWaveTick.set(wave, session.tick);
    session.advanceOneTick();
    steps += 1;
  }
  const final = session.snapshot();
  report.steps = steps;
  report.complete = session.complete;
  report.final = {
    tick: final.tick,
    wave: final.wave,
    t: Math.round(final.timeAlive * 100) / 100,
    gold: Math.round(final.gold),
    heroHp: Math.round(final.hero.hp * 10) / 10,
    heroMaxHp: final.hero.maxHp,
    heroAlive: final.hero.alive,
    enemies: final.enemies.filter((e) => e.alive).length,
    seams: final.seams.length,
    works: final.works.length,
  };
  report.waveFirstTick = [...firstWaveTick.entries()].map(([wave, tick]) => ({ wave, tick }));
  report.trail = trail;
  try {
    report.result = session.result();
    report.ok = true;
    report.verdict = report.result.outcome.secured ? 'SECURES' : 'ENDS-UNSECURED';
  } catch (error) {
    report.resultError = error instanceof Error ? error.message : String(error);
    report.verdict = ceiling < seamCeiling ? 'ALIVE-AT-CAP' : 'ALIVE-AT-SEAM-CEILING';
  }
} catch (error) {
  report.bootError = error instanceof Error ? `${error.message}` : String(error);
} finally {
  Object.assign(console, quiet);
  await vite.close();
}
process.stdout.write(`${JSON.stringify(report)}\n`);
