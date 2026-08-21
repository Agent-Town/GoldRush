/**
 * function-cors-allowlist.test.mjs — every deployed worker that keeps a CORS
 * allowlist must admit both agenttown origins.
 *
 * WHY THIS EXISTS (F-2118-1, measured s2118). The assertion below already existed,
 * as `e2e/release-base-path.spec.ts`'s second test — and it ran NOWHERE. That spec
 * is one of the three `claimedByAnotherConfig` members `playwright.config.ts`
 * removes from the default gate, and F-2117-1 measured its owning config
 * (`playwright.release-base.config.ts`) to have NO CALLER: no npm script, no shell
 * script, no gate invokes it. So the only guard of five deployed functions'
 * allowlist was collected by a harness nothing runs. Re-verified s2118 against the
 * live tree: `npx playwright test --list` names `release-base-path` ZERO times.
 *
 * WHAT MOVING IT REVEALED, WHICH IS WHY THIS IS NOT A COPY-PASTE. The stranded
 * assertion iterated a HARDCODED list of five paths — _accounts, _bugs,
 * _multiplayer, stats, telemetry. The tree has SEVEN files declaring
 * ALLOWED_ORIGINS: those five plus `redeem.ts` and `standings.ts`, which are
 * structurally identical (same `new Set([...])` at the top, same
 * `ALLOWED_ORIGINS.has(origin) || ...` test at the response site) and are ROUTES
 * rather than shared modules, where three of the five named ones are `_`-prefixed
 * modules Pages never routes. So the guard was 5 of 7 while it read as complete,
 * and 0 of 7 in effect. A hardcoded list of what the tree already knows is a
 * defect waiting for the next file.
 *
 * THEREFORE THE DENOMINATOR IS DERIVED, NOT LISTED. Subject = every file under
 * functions/ that declares ALLOWED_ORIGINS. That closes the add-a-function hole
 * the hardcoded list had, and opens a different one: a file can leave the subject
 * set by deleting its declaration, which would silently exempt it rather than red.
 * The FLOOR closes that direction — 7 declarers today, and a drop reds. Both
 * directions are asserted because a cure measured only from the side that
 * motivated it is a hypothesis (s1301).
 *
 * PROVEN BY MANUFACTURING THE DEFECT, not by a green (the s1299/s1300 standard):
 * a passing guard never executes its violation path. Both arms were reproduced on
 * the live tree s2118 and reverted byte-identical — see the F-2118-1 row.
 *
 * WHY ALWAYS-ON RATHER THAN A `functions/**` PATH RULE, on the site-contract
 * precedent (F-1230-1): the drift this guards is two-sided. A `functions/**` rule
 * catches an edit that drops an origin, but the origins are a DEPLOY fact — the
 * domain the game is served from — and the direction where `src/app/GameApi.ts` or
 * a Pages project moves while the untouched workers keep the old allowlist is the
 * one a path rule keyed on functions/ cannot see. It costs milliseconds. Do not
 * "tidy" it into PATH_RULES.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { subjectFiles } from './lib/subject-tree.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// floor 22 matches worker-type-coverage.test.mjs — the same walk over the same tree.
const SUBJECT = { dir: 'functions', ext: '.ts', floor: 22 };

// Measured s2118: _accounts, _bugs, _multiplayer, redeem, standings, stats, telemetry.
const DECLARER_FLOOR = 7;

const REQUIRED_ORIGINS = ["'https://agenttown.app'", "'https://www.agenttown.app'"];

function declarers() {
  return subjectFiles(ROOT, SUBJECT)
    .sort()
    .map((file) => ({ path: relative(ROOT, file), source: readFileSync(file, 'utf8') }))
    .filter((file) => file.source.includes('ALLOWED_ORIGINS = new Set('));
}

test('every worker CORS allowlist admits both agenttown origins', () => {
  const missing = declarers().flatMap(({ path, source }) =>
    REQUIRED_ORIGINS.filter((origin) => !source.includes(origin)).map((origin) => `${path} lacks ${origin}`),
  );
  assert.deepEqual(missing, [], `worker allowlists missing an agenttown origin:\n  ${missing.join('\n  ')}`);
});

test('no worker leaves the allowlist subject by deleting its declaration', () => {
  const found = declarers().map(({ path }) => path);
  assert.ok(
    found.length >= DECLARER_FLOOR,
    `expected >=${DECLARER_FLOOR} functions/ files declaring ALLOWED_ORIGINS, found ${found.length}:\n  ${found.join('\n  ')}\n` +
      'A file that drops its declaration leaves this guard\'s subject set silently. If a route genuinely ' +
      'no longer needs an allowlist, lower DECLARER_FLOOR deliberately in the same commit and say why.',
  );
});
