/**
 * dry-board-advisory-prescription-guard.test.mjs — F-2365-1 (s2365)
 *
 * THE FINDING. `dry-board-probe.mjs` closes EVERY run — including the happy path —
 * with an ALWAYS-ON advisory naming a SECOND instrument a fire must also ask before
 * the word DRY is earned:
 *
 *     Advisory: this reads tasks/done/ only. A lane branch can hold unabsorbed
 *     content with no done-move at all — ask `node scripts/lane-usable.mjs --all` too.
 *
 * §2F of `scripts/fire.md` is the surface a fire reads AT THAT EXACT MOMENT — it is
 * the section that decides whether a fire may declare the board dry and exit. Measured
 * s2365: the command `node scripts/lane-usable.mjs --all` appeared NOWHERE in
 * `scripts/fire.md`, not in §2F and not anywhere else in the file. §2E prescribes
 * `lane-usable`, but its trigger is keyed on "BEFORE ANY REFILL" — and a dry board
 * with zero fire-authorable candidates performs no refill, so the only prescription
 * for the lane check is STRUCTURALLY UNABLE to fire exactly when it is the only thing
 * left to check. That is F-2343-1's shape (a reactive clause with no trigger in the
 * state that needs it), and it is the FIFTH instance of this factory's most-repeated
 * finding: the cure exists, in a working tool, and no surface a fire reads at the
 * moment it applies carries it (F-2153-1, F-2204-1, F-2350-1, F-2360-1).
 *
 * WHY THE OBVIOUS NEEDLE IS THE WRONG ONE, and this is the load-bearing design note:
 * the bare token `lane-usable` ALREADY appeared in §2F four times when this guard was
 * written — every one of them incidental prose, one of them F-2207-1 saying in so many
 * words "an instrument §2F does not prescribe". A guard keyed on the bare token would
 * therefore have passed GREEN on the very defect it exists to catch, and certified it.
 * The needle is the RUNNABLE COMMAND the tool itself prints, which is what separates a
 * prescription from a mention.
 *
 * The subject set is DERIVED FROM THE TOOL, never transcribed here: whatever commands
 * the advisory names, the law must prescribe. If someone changes the tool's advice,
 * this guard starts asking about the new advice in the same commit — and if the
 * advisory is deleted or moved, the subject set empties and this guard REFUSES rather
 * than passing vacuously (F-2217-1: an empty subject set is the shape of good news in
 * every instrument on this board).
 *
 * NO RED GUARD IS PROPOSED FOR THE BOARD ITSELF, and the restraint is measured rather
 * than lazy: a lane being ahead of main is a LAWFUL, routine state (it is simply
 * undrained work), so a guard reding on it would fire during ordinary correct
 * operation and be excused into uselessness inside a week — F-1460-1, the
 * `cross-engine` fate. The cure is a triage READ in the law, exactly as §2.0c
 * concluded for the runner check and F-2357-1 for the evidence sinks. What IS
 * mechanisable, and all this guard claims, is that the law and the tool agree.
 */

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

const HERE = import.meta.dirname;
const PROBE = path.join(HERE, 'dry-board-probe.mjs');
const LAW = path.join(HERE, 'fire.md');

// §2F's boundaries, by CONTENT rather than by coordinate — the coordinate drifts.
const SECTION_OPEN = 'F. **Nothing to do**';
const SECTION_CLOSE = '## 3. Gate protocol';

/**
 * The advisory region of the probe, located STRUCTURALLY: everything the tool
 * prints after its last verdict branch and before it exits. Deliberately not
 * keyed on the word "Advisory" — that is prose and prose gets reworded, whereas
 * "after the verdict, before the exit" is what ALWAYS-ON actually means.
 */
function advisoryRegion(src) {
  const lastVerdict = src.lastIndexOf('✅ DRY');
  const exit = src.indexOf('process.exit(exitCodeFor', lastVerdict);
  if (lastVerdict < 0 || exit < 0) return null;
  return src.slice(lastVerdict, exit);
}

/**
 * Every RUNNABLE command the region names, in any idiom this factory prescribes.
 *
 * F-2423-1 (s2423). This selector used to read /`(node scripts\/…\.mjs[^`]*)`/ —
 * ONE idiom — while the header three paragraphs up promises something strictly
 * wider: "whatever commands the advisory names, the law must prescribe... this
 * guard starts asking about the new advice in the same commit". A promise about
 * advice THAT DOES NOT EXIST YET cannot be kept by a detector that can only see
 * the one spelling in front of it.
 *
 * PROVEN BY MANUFACTURING, two fixtures differing ONLY in idiom, each mutation
 * asserted to land inside the always-on region before anything was believed:
 *   defect  — advisory also names `bash scripts/health-watch.sh status`, which
 *             §2F does NOT carry  -> guard 8/8 PASS, rc=0 (all arms RAN; this is
 *             a false green, not a construction refusal)
 *   control — the SAME advice written as `node scripts/health-probe.mjs --status`
 *             -> arm 4 REDS naming the command, rc=1
 * Three bytes of idiom decided whether F-2365-1's own cure could see its own defect.
 *
 * NOT widened to "any backticked span", and the restraint is measured rather than
 * stylistic: the advisory prose also backticks PATHS (`tasks/done/`), and arm 4
 * would then demand §2F prescribe a directory — a false accusation, which is how
 * a guard gets excused into uselessness (F-1460-1). The key is a leading command
 * VERB PLUS A SPACE, drawn from the families §2.0d censuses in the law surfaces
 * (`bash scripts/*.sh`, `npm run test:*`) plus the node/npx/git forms fires run.
 * The trailing space is load-bearing: it keeps `node_modules` from reading as a
 * `node` invocation.
 */
const COMMAND_VERBS = ['node', 'bash', 'npm', 'npx', 'git'];

function commandsIn(region) {
  const out = new Set();
  const re = new RegExp('`((?:' + COMMAND_VERBS.join('|') + ') [^`]*)`', 'g');
  let m;
  while ((m = re.exec(region))) out.add(m[1].trim());
  return [...out];
}

/**
 * The bare tool name inside a command, for arm 5's premise check — `null` when
 * the command names no script at all (`npm run test:ledger-guards`). Returning
 * null rather than throwing is deliberate: the old arm did `.match(...)[1]` and
 * would have died on the very idioms this cure exists to admit, turning a
 * widened selector into a crash instead of a verdict.
 */
function bareToolName(cmd) {
  const m = cmd.match(/scripts\/([A-Za-z0-9._-]+?)\.(?:mjs|js|sh)\b/);
  return m ? m[1] : null;
}

function lawSection() {
  const t = fs.readFileSync(LAW, 'utf8');
  const i = t.indexOf(SECTION_OPEN);
  const j = t.indexOf(SECTION_CLOSE, i);
  return i < 0 || j < 0 ? null : t.slice(i, j);
}

const SRC = fs.readFileSync(PROBE, 'utf8');
const REGION = advisoryRegion(SRC);
const COMMANDS = REGION === null ? [] : commandsIn(REGION);

// ---------------------------------------------------------------------------
// 1-3: the instrument must be able to ANSWER before its answer means anything.
// Each of these refuses rather than passing vacuously.
// ---------------------------------------------------------------------------

test('1. the probe advisory region is locatable — else this guard cannot answer', () => {
  assert.notEqual(
    REGION,
    null,
    'dry-board-probe.mjs no longer has a "last verdict -> exit" region. Re-anchor this guard; do NOT delete it.',
  );
  assert.ok(REGION.length > 0, 'advisory region is empty');
});

test('2. the advisory names at least one runnable command — an empty subject set REFUSES', () => {
  // F-2217-1. Zero subjects drives every assertion below to vacuous success, and
  // a `for` loop over nothing registers no assertions and reports green. If the
  // advisory is ever deleted or moved out of the always-on region, this is the
  // arm that says so instead of the suite quietly certifying an empty question.
  assert.ok(
    COMMANDS.length > 0,
    'the advisory names no runnable command; either it was removed (a REGRESSION of F-2365-1) or it moved out of the always-on region',
  );
});

test('3. §2F of scripts/fire.md is locatable — else this guard cannot answer', () => {
  assert.notEqual(
    lawSection(),
    null,
    `could not slice §2F of scripts/fire.md between "${SECTION_OPEN}" and "${SECTION_CLOSE}" — re-anchor this guard; do NOT delete it`,
  );
});

// ---------------------------------------------------------------------------
// 4: THE FINDING.
// ---------------------------------------------------------------------------

test('4. every command the advisory names is PRESCRIBED in §2F, not merely mentioned', () => {
  const seg = lawSection();
  assert.notEqual(seg, null);
  for (const cmd of COMMANDS) {
    assert.ok(
      seg.includes(cmd),
      `§2F does not prescribe \`${cmd}\`, which dry-board-probe tells every fire to run before the word DRY is earned. `
      + 'NOTE: the bare tool NAME may well appear in §2F as prose — that is exactly why this asserts the runnable command.',
    );
  }
});

test('5. the bare tool NAME is an insufficient needle — proven against the law minus this cure', () => {
  // A REVERSE CONTROL on the guard's own selector, and the arm that keeps the
  // design note above honest instead of decorative. Asserting `cmd !== bare` is
  // a tautology and would be unreachable decoration; the load-bearing claim is
  // stronger and empirical: with the F-2365-1 clause removed, §2F STILL mentions
  // the bare tool name (incidental prose, four times when this was written) while
  // NOT carrying the runnable command. That is exactly the state a name-keyed
  // guard would have scored GREEN. If this ever reds, the incidental prose is
  // gone and the design note needs revisiting — do not "fix" it by loosening arm 4.
  const seg = lawSection();
  const cureAt = seg.indexOf('F-2365-1');
  assert.ok(cureAt >= 0, 'the F-2365-1 clause is missing from §2F — that IS the defect, see arm 4');
  const withoutCure = seg.slice(0, seg.lastIndexOf('\n', cureAt));

  let premiseChecked = 0;
  for (const cmd of COMMANDS) {
    const bare = bareToolName(cmd);
    // A command naming no script (`npm run …`) has no bare TOOL NAME, so the
    // "name is insufficient" premise is not expressible for it. Skip it — but
    // count, because a loop that skips everything registers no assertions and
    // reports green (F-2217-1), which is the exact vacuity this suite exists
    // to refuse one arm above.
    if (bare === null) continue;
    premiseChecked += 1;
    assert.ok(
      withoutCure.includes(bare),
      `§2F no longer mentions ${bare} outside the cure; the "name is insufficient" premise is now unproven`,
    );
    assert.ok(
      !withoutCure.includes(cmd),
      `§2F carried \`${cmd}\` before the cure — then F-2365-1 was never a real gap and this guard should be re-derived`,
    );
  }
  assert.ok(
    premiseChecked > 0,
    'no advisory command names a script, so this reverse control asserted NOTHING — '
    + 'the premise behind arm 4\'s needle is now unproven rather than merely unchecked',
  );
});

test('6. the selector is SCOPED to the advisory, not the whole file', () => {
  // Over-reach control. dry-board-probe resolves and names drain-block-check
  // elsewhere in its source; that is not a command the advisory asks a fire to
  // run, so requiring §2F to carry it would be a false accusation. Assert both
  // halves: the scoping excludes it, AND the file really does mention it (so the
  // exclusion is load-bearing rather than vacuously true).
  assert.ok(SRC.includes('drain-block-check'), 'fixture assumption: the probe references drain-block-check somewhere');
  assert.ok(
    !COMMANDS.some((c) => c.includes('drain-block-check')),
    'the extractor pulled a command from outside the advisory region — it is selecting on the wrong scope',
  );
});

test('6b. the selector reads EVERY prescribed idiom, not only the one in front of it', () => {
  // F-2423-1, the regression lock. The header promises "whatever commands the
  // advisory names"; before this arm the selector matched `node scripts/*.mjs`
  // alone, so an advisory that ALSO named a bash or npm command kept a non-empty
  // subject set (arm 2 satisfied), passed arm 4 on the command it COULD see, and
  // certified the law as carrying advice the law did not carry. Measured on
  // relocated fixtures differing only in idiom: bash form -> 8/8 green, rc=0;
  // .mjs form -> arm 4 red, rc=1.
  //
  // Asserted against a SYNTHETIC region, not the live one: today's advisory names
  // exactly one .mjs command, so keying this on the live text would make the arm
  // pass for the wrong reason and rot into decoration the day the advisory changes.
  const synthetic = [
    'ask `node scripts/lane-usable.mjs --all` too',
    'and `bash scripts/health-watch.sh status`',
    'and `npm run test:ledger-guards`',
    'but not `tasks/done/`, which is a path and not a command',
  ].join('\n');
  const found = commandsIn(synthetic);

  assert.ok(found.includes('bash scripts/health-watch.sh status'), 'the selector cannot see a `bash` command');
  assert.ok(found.includes('npm run test:ledger-guards'), 'the selector cannot see an `npm` command');
  assert.ok(found.includes('node scripts/lane-usable.mjs --all'), 'the selector lost the `node` idiom it always had');
  // Over-reach half: a backticked PATH must NOT become a command §2F is required
  // to prescribe. Widening the needle must not turn arm 4 into a false accusation.
  assert.ok(
    !found.some((c) => c.includes('tasks/done/')),
    'the selector pulled a backticked PATH in as a command — arm 4 would now make a false accusation',
  );
  // And the trailing-space half of the verb key, which is what keeps `node_modules`
  // from reading as a `node` invocation.
  assert.equal(commandsIn('see `node_modules/foo` for detail').length, 0, '`node_modules` read as a command');
});

// ---------------------------------------------------------------------------
// 7-8: ALWAYS-ON, proven where a caller stands.
//
// F-2208-1: a declaration that appears only on failure re-creates the very
// ambiguity it removes. F-2210-1: in advisory mode — the mode §2F prescribes —
// the exit code is constant 0, so stdout IS the whole interface; a source-only
// assertion tests the half nobody reads.
// ---------------------------------------------------------------------------

function cliFixture(t, verdict) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'dry-advisory-guard-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'tasks', 'done'), { recursive: true });
  // A prefixed file fixes the derived convention start; the bare-dated one is the subject.
  fs.writeFileSync(path.join(root, 'tasks', 'done', 'noop-s1033-20260725-140651-anchor.md'), 'x\n');
  fs.writeFileSync(path.join(root, 'tasks', 'done', '20260801-010101-subject.md'), 'x\n');
  fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
  fs.writeFileSync(path.join(root, 'scripts', 'drain-block-check.mjs'), `console.log(${JSON.stringify(verdict)});\n`);
  return root;
}

function runProbe(root) {
  try {
    return { rc: 0, out: execFileSync('node', [PROBE], { timeout: 240_000, killSignal: 'SIGKILL', cwd: root, encoding: 'utf8', stdio: 'pipe' }) };
  } catch (e) {
    return { rc: e.status, out: (e.stdout ?? '') + (e.stderr ?? '') };
  }
}

test('7. the advisory is printed on the DRY path — the one where a fire stops reading', (t) => {
  const { out } = runProbe(cliFixture(t, '✅ CLEAR — subject.md [leaf] status="merged"'));
  assert.ok(out.length > 0, 'control validity (F-2215-1): the probe produced nothing, so this arm measured nothing');
  assert.ok(out.includes('The word is earned'), 'fixture did not reach the DRY verdict');
  for (const cmd of COMMANDS) {
    assert.ok(out.includes(cmd), `the DRY path does not print \`${cmd}\` — the follow-up is not always-on`);
  }
});

test('8. the advisory is printed on a NOT-DRY path too — it is not verdict-conditional', (t) => {
  const { out } = runProbe(cliFixture(t, '✅ CLEAR — subject.md [leaf] status="queued"'));
  assert.ok(out.length > 0, 'control validity (F-2215-1): the probe produced nothing, so this arm measured nothing');
  assert.ok(out.includes('NOT DRY'), 'fixture did not reach the NOT-DRY verdict');
  for (const cmd of COMMANDS) {
    assert.ok(out.includes(cmd), `the NOT-DRY path does not print \`${cmd}\``);
  }
});
