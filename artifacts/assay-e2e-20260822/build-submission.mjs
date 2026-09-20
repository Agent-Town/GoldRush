#!/usr/bin/env node

/**
 * Builds the county standing for the assay end-to-end (2026-08-22), field by field, against the
 * handler's OWN validation in `functions/api/standings.ts` rather than against the door document's
 * example. The rules this file obeys, each read from that source:
 *
 *  - `POST_KEYS` is a closed set: any extra key fails `bad_payload`.
 *  - `score.secured` must be literally `true`, and `tapeMatchesScore` cross-checks secured / waves
 *    / timeAlive / gold against the tape's own outcome — so the score is READ OFF the tape, never
 *    retyped by hand.
 *  - `inputLogHash` must equal `sha256(JSON.stringify(tape.inputLog))` computed on the PARSED
 *    object, so the tape is embedded as parsed JSON and key order rides through untouched.
 *  - `seedMode: 'bench'` demands the seed be listed for the contract in `bench-seeds.json` AND an
 *    explicit difficulty (a defaulted difficulty is refused).
 *  - A declared `harness` must carry a `harnessVersion` (`validateStack`).
 *
 * Usage: node artifacts/assay-e2e-20260822/build-submission.mjs <tape.json> <out.json>
 */

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const [tapePath, outPath, profileArg, anonSeedArg] = process.argv.slice(2);
if (!tapePath || !outPath) { console.error('usage: build-submission.mjs <tape.json> <out.json> [profileName] [anonSeed]'); process.exit(2); }
const profileName = profileArg ?? 'Assay E2E Probe';
const anonSeed = anonSeedArg ?? 'attended-e2e-20260822';

const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const tapeText = readFileSync(tapePath, 'utf8');
const tape = JSON.parse(tapeText);

const commit = execFileSync('git', ['rev-parse', '--short=12', 'HEAD'], { encoding: 'utf8' }).trim();
const proverDigest = sha256(readFileSync(new URL('./claim-prover.mjs', import.meta.url))).slice(0, 12);

const submission = {
  contractId: tape.contract,
  epochId: 'epoch-1-frontier',
  score: {
    secured: true,
    waves: tape.outcome.waves,
    timeAlive: tape.outcome.timeAlive,
    gold: tape.outcome.gold,
    // The headless outcome reports no banked base value, so the standing declares none.
    baseValue: 0,
  },
  profileName,
  // 32 hex from an honest, stable string — this is a named factory probe, not a person.
  anonId: sha256(anonSeed).slice(0, 32),
  difficulty: tape.difficulty,
  seed: tape.seed,
  seedMode: 'bench',
  seedHash: sha256(tape.seed),
  inputLogHash: sha256(JSON.stringify(tape.inputLog)),
  stack: {
    // HONESTY LAWS: the rider is a hand-authored deterministic policy, so the whole of the setup
    // that can affect play is the prover file — content-addressed below. No inference ran during
    // the ride, which is why `calls` is 0 and the token fields are omitted rather than guessed.
    model: 'anthropic/claude-opus-5',
    harness: 'goldrush-attended-assay-e2e',
    harnessVersion: commit,
    config: `artifacts/assay-e2e-20260822/claim-prover.mjs@sha256:${proverDigest}`,
    calls: 0,
  },
  tape,
};

writeFileSync(outPath, `${JSON.stringify(submission)}\n`);
process.stdout.write(`${JSON.stringify({
  bytes: Buffer.byteLength(JSON.stringify(submission)),
  contractId: submission.contractId,
  anonId: submission.anonId,
  seedHash: submission.seedHash,
  inputLogHash: submission.inputLogHash,
  tapeId: tape.id,
  tapeVersion: tape.version,
  tapeEventLogHash: tape.eventLogHash,
  score: submission.score,
}, null, 2)}\n`);
