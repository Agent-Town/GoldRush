/**
 * F-2350-2 — the runner-restart EMERGENCY MESSAGE cited four coordinates that had rotted.
 *
 * WHY THIS EXISTS (s2350)
 * -----------------------
 * `scripts/start-lane-runner.sh` is the script fire.md §2.0b names as the ONLY lawful
 * way to restart a dead runner, and its refusal message is read at exactly one moment:
 * a fire is staring at a stuck factory and deciding whether to `rmdir tasks/.runner.lock`.
 * §2.0b calls that rmdir the action that yields TWO runners on the same queues.
 *
 * The message's ADVICE was correct. Its CITATIONS had rotted:
 *
 *     cited                       landed on (measured s2350)
 *     lane-runner-v3.sh:120-129   commit_lane_delta's pathspec-delta body
 *     ":20"                       a BLANK LINE
 *     "trap at :135"              a LANE_RUNNER_COMMIT_PROBE comment
 *
 * The real lock block is :145-158 and the trap is :161. s2343 re-based THESE SAME FOUR
 * coordinates in fire.md §2.0b (+26 lines, and it said so in its own clause) and this
 * file — which carries the same four — was never touched.
 *
 * WHY NO EXISTING INSTRUMENT COULD SEE IT, AND WHY THAT IS NOT AN OVERSIGHT
 * ------------------------------------------------------------------------
 * `law-pointer-guard` scans the six files in `law-surfaces.mjs`; a shell script is not
 * one. `source-pointer-guard` (F-2338-1) DOES scan scripts/, and it deliberately checks
 * only SAME-FILE citations, because a cross-file pointer's ground truth is "what a human
 * meant" — it counts and names them instead. Its own header uses `lane-runner-v3.sh:59`
 * as the example of that bucket. So this defect sat in a bucket the corpus had already
 * measured, declared uncheckable, and honestly reported: 4 cross-file citations, unchecked.
 *
 * THE CURE IS THE REPO'S OWN STANDING RULE — cite the CODE, the coordinate drifts. The
 * message now quotes distinctive LITERALS from lane-runner-v3.sh instead of line numbers,
 * which moves with the code by construction. That converts a cross-file pointer from
 * "uncheckable" into "checkable", which is the only reason a guard is possible here.
 *
 * SEVERITY, STATED HONESTLY AND NOT INFLATED: this is a human-read message. Nothing
 * greened or redded on it, no verdict was wrong, and no runner was mis-restarted. What
 * earns it a cure is DIRECTION plus MOMENT — a fire that follows the citation to check
 * the "do NOT rmdir" claim lands on unrelated code, and is pushed toward distrusting
 * correct advice at the one moment acting on it wrongly compounds an outage.
 *
 * NO GENERAL CROSS-FILE MECHANISM IS PROPOSED, AND THE RESTRAINT IS MEASURED RATHER THAN
 * LAZY: the whole cross-file bucket is FOUR citations repo-wide (source-pointer-guard,
 * s2350). A mechanism for a population of four, whose ground truth is usually a human's
 * intent, is the kind of guard that cries wolf and gets routed around (F-1460-1, the
 * `cross-engine` fate). This guard is narrow on purpose: it protects the one file where
 * the harm is acute, using the one ground truth that is decidable — a verbatim literal.
 *
 * Every red arm below was proven by manufacturing the defect on scratch copies.
 * Arms 5 and 6 are REVERSE CONTROLS.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const HELPER = path.join(HERE, 'start-lane-runner.sh');
const RUNNER = path.join(HERE, 'lane-runner-v3.sh');

/**
 * The literals start-lane-runner.sh quotes FROM lane-runner-v3.sh.
 *
 * Hand-maintained, and the list cannot go silently vacuous: `citedAnchors` asserts the
 * helper still cites every one of them, so dropping a citation reds rather than shrinking
 * the checked set to nothing (the failure mode `law-surfaces.mjs` warns about).
 */
const ANCHORS = ['stale lock self-healed', 'another instance running', 'Remove if stale.'];

/** Bare `<file>:NNN` / `at :NNN` coordinates — the shape that rots. */
const COORD_PATTERNS = [/lane-runner-v3\.sh:\d+/g, /\bat :\d+/g];

const count = (haystack, needle) => haystack.split(needle).length - 1;

/** Pure check, so the manufactured-defect arms can run it against scratch text. */
function findings(helperText, runnerText) {
  const out = [];
  for (const re of COORD_PATTERNS) {
    for (const m of helperText.matchAll(re)) out.push({ kind: 'bare-coordinate', detail: m[0] });
  }
  for (const a of ANCHORS) {
    const inRunner = count(runnerText, a);
    if (inRunner !== 1) out.push({ kind: 'anchor-unresolved', detail: `${a} (${inRunner}x in runner)` });
    if (count(helperText, a) < 1) out.push({ kind: 'anchor-uncited', detail: a });
  }
  return out;
}

const helper = fs.readFileSync(HELPER, 'utf8');
const runner = fs.readFileSync(RUNNER, 'utf8');

// Corpus declaration (F-2208-1): a checked set of zero must never look like a pass.
test('corpus is non-empty and both subjects were really read', () => {
  assert.ok(helper.length > 500, `helper read ${helper.length} B`);
  assert.ok(runner.length > 500, `runner read ${runner.length} B`);
  assert.equal(ANCHORS.length, 3);
});

test('arm 1 — the helper carries no bare lane-runner-v3.sh:NNN coordinate', () => {
  const bad = findings(helper, runner).filter((f) => f.kind === 'bare-coordinate');
  assert.deepEqual(bad, [], `bare coordinates rot silently: ${JSON.stringify(bad)}`);
});

test('arm 2 — every cited anchor resolves EXACTLY ONCE in lane-runner-v3.sh', () => {
  const bad = findings(helper, runner).filter((f) => f.kind === 'anchor-unresolved');
  assert.deepEqual(bad, [], `citation no longer lands: ${JSON.stringify(bad)}`);
});

test('arm 3 — the helper still CITES every anchor (the list cannot go vacuous)', () => {
  const bad = findings(helper, runner).filter((f) => f.kind === 'anchor-uncited');
  assert.deepEqual(bad, [], `anchor list drifted out of the helper: ${JSON.stringify(bad)}`);
});

test('arm 4 — the live pair is clean end to end', () => {
  assert.deepEqual(findings(helper, runner), []);
});

// ---- manufactured defects: each must red, or the arm above is decoration ----

test('arm 5 — restoring the pre-cure coordinate reds arm 1 and NOTHING else', () => {
  const rotted = helper.replace(
    "(it logs 'stale lock self-healed')",
    '(lane-runner-v3.sh:120-129)',
  );
  assert.notEqual(rotted, helper, 'variant must actually differ — a no-op edit proves nothing');
  const f = findings(rotted, runner);
  assert.ok(
    f.some((x) => x.kind === 'bare-coordinate'),
    'the pre-cure text must be caught',
  );
  // and the anchor arms must stay green: the literal survives elsewhere in the comment
  assert.deepEqual(f.filter((x) => x.kind === 'anchor-unresolved'), []);
});

test('arm 6 — renaming the runner message reds arm 2 (the cross-file rot this cures)', () => {
  const renamed = runner.replace('stale lock self-healed', 'stale lock recovered');
  assert.notEqual(renamed, runner, 'variant must actually differ');
  const f = findings(helper, renamed);
  assert.ok(
    f.some((x) => x.kind === 'anchor-unresolved' && x.detail.startsWith('stale lock self-healed')),
    'a renamed literal must be caught, not silently tolerated',
  );
});

test('arm 7 — REVERSE CONTROL: dropping a citation from the helper reds arm 3, not arm 2', () => {
  const stripped = helper.split('Remove if stale.').join('Remove if stale ');
  assert.notEqual(stripped, helper, 'variant must actually differ');
  const f = findings(stripped, runner);
  assert.ok(f.some((x) => x.kind === 'anchor-uncited' && x.detail === 'Remove if stale.'));
  assert.deepEqual(f.filter((x) => x.kind === 'anchor-unresolved'), []);
});
