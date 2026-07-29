/**
 * script-tree-parse.test.mjs — every executable file in the factory's OWN
 * machinery must at minimum PARSE.
 *
 * WHY THIS EXISTS (F-1232-1, measured s1232):
 * `run-guards.mjs`'s header says of its eight guards: "These cover `scripts/**`
 * and the worker code, which tsc does NOT type check". The first half of that
 * sentence was not true. tsconfig `include` is ["src","e2e","playwright.config.ts"],
 * so `npx tsc --noEmit` never reads scripts/ at all, and `vite build` does not
 * bundle it either -- exactly as the header says. But the eight guards do not
 * close that hole; they only LOOK like they do. `test:node-guards` is a hand-
 * written list of 19 test files. Walking the import graph out of those 19 plus
 * the other guard entrypoints reaches 31 of the 174 scripts/*.mjs in the tree.
 * The other 143 are read by no guard, and 56 of those are live machinery --
 * referenced by shell scripts, package.json, or the .claude skills and the fire
 * law: art-staging-audit.mjs, drain-block-check.mjs, extract-alpha.mjs,
 * status-line1.mjs, assert-release-build.mjs, the whole anim-pass-* art chain.
 *
 * MEASURED BEFORE WRITING THIS, TWO ARMS:
 *   Arm A -- a hard SyntaxError ("if (true) { const x = 1;", unclosed) planted in
 *   scripts/art-staging-audit.mjs, a script the ART-SLOT LAW obliges every
 *   art-touching fire to run: `npx tsc --noEmit` rc=0, `npm run build` rc=0,
 *   `node scripts/run-guards.mjs` rc=0, 8/8 PASS. The break was invisible to
 *   every gate the factory has.
 *   Arm B -- the same class of break (an unterminated `if`) in
 *   scripts/deploy-site.sh: CAUGHT, test:deploy-site-contract RED, 7/8.
 *
 * ARM B IS THE INSTRUCTIVE ONE, AND IT IS WHY THIS GUARD IS SHAPED THE WAY IT IS.
 * deploy-site.sh is covered only because a contract test EXECUTES it in a temp
 * repo. Coverage in scripts/ is a side effect of execution, never of parsing.
 * So the rule that decides whether a script is gated is not "is it important"
 * -- art-staging-audit.mjs is mandated by law and was ungated -- it is "does
 * some test happen to run it". Nothing ran those 56. A parse check is the one
 * gate that does not care whether anybody remembered to invoke the file, which
 * is precisely the property the hand-written 19-file roster lacks.
 *
 * WHAT THIS DELIBERATELY DOES NOT CLAIM. Parsing is the floor, not the ceiling:
 * this cannot see a wrong flag, a bad path, or a logic error, and it is not a
 * substitute for a contract test for any script that has one. It closes exactly
 * one hole -- a file that cannot run AT ALL reaching main green -- for the whole
 * tree at once, instead of one more name on a list that has to be remembered.
 * The `_s*`/`tmp-*` one-shot session scripts are INCLUDED on purpose: they are
 * history under the RETENTION LAW, they cost ~4ms each, and an exclusion list is
 * the same rot-prone hand-maintained roster this guard exists to replace.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

// Resolved from this file, never from cwd -- guards in this repo are required to
// be cwd-invariant (scripts/collection-guards-cwd-invariance.test.mjs).
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function walk(dir, predicate, acc = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      walk(full, predicate, acc);
    } else if (entry.isFile() && predicate(entry.name)) {
      acc.push(full);
    }
  }
  return acc;
}

// Bounded concurrency: 174 serial `node --check` spawns measured 4.3s, which is
// real money on a gate that runs on every drain. A pool of 8 brings the whole
// tree under a second without changing a single verdict.
async function parseAll(files, cmd, args) {
  const failures = [];
  let next = 0;
  const workers = Array.from({ length: 8 }, async () => {
    while (next < files.length) {
      const file = files[next++];
      const stderr = await new Promise((resolve) => {
        const child = spawn(cmd, [...args, file], { stdio: ['ignore', 'ignore', 'pipe'] });
        let buf = '';
        child.stderr.on('data', (d) => {
          buf += d;
        });
        child.on('error', (e) => resolve(`could not spawn ${cmd}: ${e.message}`));
        child.on('close', (code) => resolve(code === 0 ? null : buf.trim()));
      });
      if (stderr !== null) {
        const line = stderr.split('\n').find((l) => /Error|error/.test(l)) ?? stderr.split('\n')[0];
        failures.push(`${relative(ROOT, file)} :: ${line.trim()}`);
      }
    }
  });
  await Promise.all(workers);
  return failures.sort();
}

// The subject trees, and the floor under each one's file count. The floors are
// the point: a walk that silently returns nothing PASSES every parse check ever
// written (a probe that executes nothing reports zero), so the count is what
// makes the green mean something. Each floor sits below the measured count at
// s1232 -- scripts 174/23, rehearsal 25, foundry 1/5 -- far enough that ordinary
// churn never trips it, far enough above zero that a broken walk or a moved
// directory does. Table-driven on purpose: adding a tree is one line, and the
// roster cannot drift out of sync with itself the way a hand-written list of
// test-file names can.
const SUBJECTS = [
  { dir: 'scripts', ext: '.mjs', floor: 120, cmd: 'node', args: ['--check'] },
  { dir: 'scripts', ext: '.sh', floor: 15, cmd: 'bash', args: ['-n'] },
  // s1230 and s1231 both named rehearsal/ as an unaudited residual of this same
  // class; it is the harness the rehearsal rig runs from and tsc never reads it.
  { dir: 'rehearsal', ext: '.mjs', floor: 15, cmd: 'node', args: ['--check'] },
  // foundry/kit is the "adopt this" starter kit -- code we hand to other people,
  // so a break here ships broken to someone else's first day. s1230 counted this
  // tree as "1 file"; it is 1 .mjs AND 5 .sh.
  { dir: 'foundry', ext: '.mjs', floor: 1, cmd: 'node', args: ['--check'] },
  { dir: 'foundry', ext: '.sh', floor: 5, cmd: 'bash', args: ['-n'] },
];

for (const subject of SUBJECTS) {
  test(`every ${subject.dir}/**/*${subject.ext} parses`, async () => {
    const dir = join(ROOT, subject.dir);
    let exists = true;
    try {
      statSync(dir);
    } catch {
      exists = false;
    }
    // Absence must be loud. A subject that vanishes should force a deliberate
    // retirement of its row, not quietly stop being checked.
    assert.ok(exists, `${subject.dir}/ is missing — this guard names it as a subject; retire its row deliberately, do not let it pass by absence`);

    const files = walk(dir, (n) => n.endsWith(subject.ext));
    assert.ok(
      files.length >= subject.floor,
      `expected >=${subject.floor} ${subject.dir}/**/*${subject.ext}, walked ${files.length} — the walk or the tree moved`,
    );

    const failures = await parseAll(files, subject.cmd, subject.args);
    assert.deepEqual(
      failures,
      [],
      `${subject.dir}/**/*${subject.ext} that do not parse:\n  ${failures.join('\n  ')}`,
    );
  });
}
