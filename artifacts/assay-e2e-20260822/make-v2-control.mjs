#!/usr/bin/env node

/**
 * THE V2 CONTROL — isolates the version stamp from everything else.
 *
 * `scripts/gr-sim.mjs` hand-builds its tape with a hardcoded `version: 1` and no `runStart`
 * (`gr-sim.mjs:246-277`), while both the assay worker (`assay-worker.mjs:80`) and the replay
 * instrument (`assay-replay.mjs:23`) refuse a v1 tape outright. So a run through the public
 * headless door can never be verified, whatever it played.
 *
 * This script asks the ONE question that decides how big the cure is: with the version stamp
 * corrected and a TRUTHFUL `runStart` attached, does the replay reproduce the recorded
 * `eventLogHash`? If yes, the door needs a version bump plus the run-birth capture the browser
 * recorder already performs, and nothing more.
 *
 * The `runStart` written here is not invented. `RunTape.ts:119` defaults a header without one to
 * exactly `{ meta: freshMetaProgress(), research: freshResearchState(meta) }`, and gr-sim boots a
 * virgin profile with no RunManager and no saved progression — so a fresh runStart is a true
 * statement about the run, computed here from the same two functions rather than typed by hand.
 *
 * Usage: node artifacts/assay-e2e-20260822/make-v2-control.mjs <in-v1.json> <out-v2.json>
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const [inPath, outPath] = process.argv.slice(2);
if (!inPath || !outPath) { console.error('usage: make-v2-control.mjs <in-v1.json> <out-v2.json>'); process.exit(2); }

const root = fileURLToPath(new URL('../..', import.meta.url));
const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
try {
  const { freshMetaProgress } = await vite.ssrLoadModule('/src/game/MetaProgress.ts');
  const { freshResearchState } = await vite.ssrLoadModule('/src/meta/ResearchTree.ts');
  const { RUN_TAPE_VERSION } = await vite.ssrLoadModule('/src/game/RunTape.ts');

  const tape = JSON.parse(readFileSync(inPath, 'utf8'));
  if (tape.version !== 1) throw new Error(`expected a v1 tape, found version ${tape.version}`);

  const meta = freshMetaProgress();
  const research = freshResearchState(meta);

  // Key order matters only for the inputLog hash, which is untouched; the header is rebuilt in the
  // recorder's own field order so the control reads like a tape the game itself would have written.
  const v2 = {
    version: RUN_TAPE_VERSION,
    id: tape.id,
    createdAt: tape.createdAt,
    kept: tape.kept,
    contract: tape.contract,
    seed: tape.seed,
    difficulty: tape.difficulty,
    simVersion: tape.simVersion,
    runStart: { meta, research },
    inputLog: tape.inputLog,
    eventLogHash: tape.eventLogHash,
    outcome: tape.outcome,
  };

  writeFileSync(outPath, `${JSON.stringify(v2, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify({
    version: v2.version,
    id: v2.id,
    runStart: v2.runStart,
    minifiedBytes: Buffer.byteLength(JSON.stringify(v2)),
    eventLogHash: v2.eventLogHash,
  }, null, 2)}\n`);
} finally {
  await vite.close();
}
