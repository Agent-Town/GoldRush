/**
 * bash-leg-misuse-code-guard.test.mjs — s2307 / F-2307-1.
 *
 * WHAT WENT WRONG: `test:ledger-guards` chains six bash legs. Three of them
 * (main-lock-gate-guard, janitor-request-rejection, lane-dispatch-safety-guard)
 * refuse an unreadable subject with `MISUSE: cannot read <path>` and exit 2 —
 * the "could not answer" vs "answered, and the answer refuses" convention that
 * drain-block-check, dry-board-probe, master-shipped-classifier, review-evidence-audit
 * and nul-audit all carry. The other three (codex-client-floor, runner-restart-recipe,
 * runner-commit-decoupling-guard) fell straight into a `bash -n` check, so an ABSENT
 * subject was reported as "lane-runner-v3.sh does not parse" at exit 1 — a diagnosis
 * that accuses the wrong subject and collapses the 2-vs-1 distinction. The corpus
 * already held the correct pattern, in the same battery; these three had not adopted it.
 *
 * Measured s2307 before the cure: all six failed LOUD on an absent subject (so this was
 * never a false green), but three of six named the wrong cause at the wrong exit code.
 *
 * WHAT THIS ASSERTS, in order of how much it matters:
 *   1. BEHAVIOUR — every bash leg, run at a root where its subjects are absent, exits 2
 *      and says MISUSE. This is the claim; it is checked by MANUFACTURING the state, not
 *      by grepping for the precondition's text.
 *   2. REVERSE CONTROL — a subject that is PRESENT and genuinely unparseable must still
 *      exit 1 and still say "does not parse". The over-general cure (collapse everything
 *      to 2) passes arm 1 and is caught only here.
 *   3. REVERSE CONTROL — a healthy board prints no MISUSE at all, so the precondition
 *      cannot decay into a banner that fires on ordinary work (F-1460-1).
 *   4. DERIVED SUBJECT SET — the legs come from package.json's own test:ledger-guards
 *      chain, so a leg ADDED is covered automatically. UNIONED WITH A CONTRACT FLOOR so a
 *      leg REMOVED reds BY NAME (s2306/F-2306-1: derivation alone is a mirror, not a check).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

/** The floor: legs known to exist when this guard was written. A removal reds by name. */
const CONTRACT_FLOOR = [
  'main-lock-gate-guard.test.sh',
  'janitor-request-rejection.test.sh',
  'lane-dispatch-safety-guard.test.sh',
  'codex-client-floor.test.sh',
  'runner-restart-recipe.test.sh',
  'runner-commit-decoupling-guard.test.sh',
];

/** DERIVED: the bash legs the battery actually chains, read from package.json itself. */
function derivedLegs() {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const chain = pkg.scripts?.['test:ledger-guards'];
  assert.ok(chain, 'test:ledger-guards is not defined in package.json');
  // `bash scripts/<name>.test.sh` — scripts/ only; foundry/kit/test-init.sh scaffolds a
  // new factory rather than auditing this one, and carries no subject to be absent.
  return [...chain.matchAll(/bash\s+scripts\/([\w.-]+\.test\.sh)/g)].map((m) => m[1]);
}

const LEGS = derivedLegs();

function runLeg(script, cwd) {
  const r = spawnSync('bash', [script], { cwd, encoding: 'utf8', timeout: 300000 });
  return { status: r.status, text: (r.stdout || '') + (r.stderr || '') };
}

/** A root containing ONLY the leg — every subject it reads is absent. */
function rootWithAbsentSubjects(leg) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 's2307-absent-'));
  fs.mkdirSync(path.join(dir, 'scripts'), { recursive: true });
  const dest = path.join(dir, 'scripts', leg);
  fs.copyFileSync(path.join(ROOT, 'scripts', leg), dest);
  return { dir, dest };
}

test('the derived leg set covers the contract floor (a leg removed reds by name)', () => {
  for (const leg of CONTRACT_FLOOR) {
    assert.ok(LEGS.includes(leg), `${leg} is no longer chained in test:ledger-guards`);
  }
  assert.ok(LEGS.length >= CONTRACT_FLOOR.length, 'derivation returned fewer legs than the floor');
});

test('every bash leg refuses an ABSENT subject with MISUSE and exit 2', () => {
  const wrong = [];
  for (const leg of LEGS) {
    const { dir, dest } = rootWithAbsentSubjects(leg);
    try {
      const r = runLeg(dest, dir);
      // assert the arm really ran before believing what it says (F-2215-1)
      assert.ok(r.text.length > 0, `${leg}: defect arm produced nothing — control invalid`);
      if (r.status !== 2 || !/MISUSE: cannot read/.test(r.text)) {
        wrong.push(`${leg}: rc=${r.status} text=${JSON.stringify(r.text.trim().slice(0, 120))}`);
      }
      assert.ok(
        !/does not parse/.test(r.text),
        `${leg}: an absent subject is reported as a PARSE failure — wrong subject accused`,
      );
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
  assert.deepEqual(wrong, [], `legs that do not use MISUSE/exit 2 for an absent subject:\n${wrong.join('\n')}`);
});

test('REVERSE CONTROL: a PRESENT but unparseable subject still exits 1 and still says "does not parse"', () => {
  // Collapsing "could not answer" into "answered, and the answer refuses" — or the reverse —
  // passes the arm above. Only this arm separates them.
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 's2307-unparseable-'));
  try {
    fs.mkdirSync(path.join(dir, 'scripts'), { recursive: true });
    for (const f of ['lane-runner-v3.sh', 'start-lane-runner.sh', 'health-watch.sh', 'runner-processes.sh']) {
      fs.copyFileSync(path.join(ROOT, 'scripts', f), path.join(dir, 'scripts', f));
    }
    const leg = 'codex-client-floor.test.sh';
    fs.copyFileSync(path.join(ROOT, 'scripts', leg), path.join(dir, 'scripts', leg));
    const runner = path.join(dir, 'scripts', 'lane-runner-v3.sh');
    fs.writeFileSync(runner, `${fs.readFileSync(runner, 'utf8')}\nif then fi(( \n`);

    const r = runLeg(path.join(dir, 'scripts', leg), dir);
    assert.ok(r.text.length > 0, 'reverse-control arm produced nothing — control invalid');
    assert.equal(r.status, 1, 'a real syntax error must stay exit 1, not become a MISUSE 2');
    assert.match(r.text, /does not parse/, 'a real syntax error must still be diagnosed as one');
    assert.ok(!/MISUSE: cannot read/.test(r.text), 'a readable-but-broken subject is not a MISUSE');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('REVERSE CONTROL: a healthy board prints no MISUSE (the precondition cannot decay into a banner)', () => {
  // Cheapest leg on a healthy root; a precondition that fired on ordinary work would be
  // excused into uselessness inside a week (F-1460-1).
  const r = runLeg(path.join(ROOT, 'scripts', 'codex-client-floor.test.sh'), ROOT);
  assert.ok(r.text.length > 0, 'happy-path arm produced nothing — control invalid');
  assert.equal(r.status, 0, 'the live board must be green');
  assert.ok(!/MISUSE/.test(r.text), 'MISUSE printed on a healthy board');
});
