import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { NODE_ENGINE_CANDIDATES, installedNodeEngines } from './cross-engine-skip.mjs';

// F-2321-1 (s2321). scripts/cross-engine-skip.mjs owns the question "may the cross-engine
// determinism guard run HERE?", and scripts/cross-engine-skip.test.mjs pins BOTH directions of that
// decision. But `crossEngineSkipReason(env, interpreterCount)` takes the count as an ARGUMENT, and
// until this guard shipped each consumer computed that argument for itself from its own verbatim
// copy of the candidate list. That is F-2209-1's rule one level out: extracting a decision to make
// it testable creates a new untested seam, and here the seam is the argument, not the call site.
// The existing guard fabricates its counts, so it is structurally incapable of noticing that the
// two consumers had drifted apart — or that an nvm upgrade had quietly left them both with one
// engine, which SKIPS, which keeps every battery in the repo green while the determinism property
// stops being tested at all.
//
// WHAT THIS ASSERTS, and deliberately what it does NOT:
//  - both consumers read their engine list FROM the shared module (structural, cheap, decidable);
//  - the shared resolver really filters by existence, so a candidate that is not installed is not
//    handed to a spawn as a path that will ENOENT;
//  - both consumers see the SAME count, because that count is the argument the ruling turns on.
// It does NOT assert how many engines are installed. That is a property of the disk, not of the
// repo, and a guard that reds when a developer has one Node installed would be excused into
// uselessness inside a week (F-1460-1, the `cross-engine` label's own fate).

const CONSUMERS = ['gr-sim.test.mjs', 'wave-scaling-cross-engine.test.mjs'];
const sourceOf = (name) => readFileSync(fileURLToPath(new URL(`./${name}`, import.meta.url)), 'utf8');

test('both cross-engine consumers read the engine list from the shared module', () => {
  for (const name of CONSUMERS) {
    const source = sourceOf(name);
    assert.match(
      source,
      /import \{[^}]*installedNodeEngines[^}]*\} from '\.\/cross-engine-skip\.mjs'/,
      `${name} must import installedNodeEngines from cross-engine-skip.mjs`,
    );
    assert.match(source, /installedNodeEngines\(\)/, `${name} must CALL installedNodeEngines`);
  }
});

test('no consumer keeps a private copy of an engine path', () => {
  // The duplication F-2321-1 cured was literally this string, twice. If it comes back, the two
  // files can drift without any existing guard noticing.
  for (const name of CONSUMERS) {
    assert.doesNotMatch(
      sourceOf(name),
      /nvm\/versions\/node/,
      `${name} hardcodes an nvm engine path again — the list belongs in cross-engine-skip.mjs`,
    );
  }
});

test('the shared resolver drops candidates that are not installed', () => {
  // Exercised through a FABRICATED candidate list, not the real one. On a machine where both real
  // candidates happen to be installed the filter has no observable effect, so asserting only the
  // happy path would be an arm no defect can reach (s2226). An unfiltered list would hand a
  // non-existent path to spawn(), whose ENOENT reads as a failure of the SIM rather than of the box.
  const absent = '/definitely/not/an/installed/node/binary';
  const real = NODE_ENGINE_CANDIDATES[0];
  assert.deepEqual(installedNodeEngines([absent]), [], 'an absent candidate must be dropped');
  assert.deepEqual(installedNodeEngines([real, absent]), [real], 'filtering must preserve order');
  assert.deepEqual(installedNodeEngines([]), [], 'an empty candidate list resolves empty');
});

test('the declared candidate list can still support a cross-engine comparison', () => {
  assert.ok(NODE_ENGINE_CANDIDATES.length >= 2, 'a cross-engine guard needs at least two candidates');
  const installed = installedNodeEngines();
  assert.ok(Array.isArray(installed), 'installedNodeEngines must return an array');
  assert.ok(installed.length <= NODE_ENGINE_CANDIDATES.length, 'resolution cannot invent engines');
  for (const engine of installed) {
    assert.ok(NODE_ENGINE_CANDIDATES.includes(engine), `${engine} is not a declared candidate`);
    assert.ok(readFileSync(engine).length > 0, `${engine} was returned but is not readable`);
  }
});

test('both consumers see the same engine count — it is the argument the ruling turns on', () => {
  // crossEngineSkipReason's `interpreterCount < 2` arm decides whether the whole determinism
  // property is exercised. Two consumers reading two different numbers is the drift this cures.
  const shared = installedNodeEngines().length;
  assert.equal(installedNodeEngines().length, shared, 'resolution must be stable across calls');
  for (const name of CONSUMERS) {
    assert.doesNotMatch(
      sourceOf(name),
      /\.filter\(existsSync\)/,
      `${name} still filters its own engine list — it must take the shared count`,
    );
  }
});
