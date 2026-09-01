#!/usr/bin/env node
// s2244 — F-2244-1. `anchorOnMain` returns THREE values and the F-2225-1 cross-check
// tested `=== 'landed-on-main'`, so 'unverifiable' ("the cross-check could not run")
// swept onto the same branch as 'absent-on-main' ("it ran; the answer is no").
//
// GROUND TRUTH in the defect arm: the cure HAS landed on main and this frozen tree
// does not carry it, so the correct verdict is a cross-check that says so. Pre-cure
// the item printed a plain ⏳ OPEN at rc=0 — BYTE-IDENTICAL on stdout and rc to a
// genuinely clean board — while the banner above had already promised "Verdicts
// below are cross-checked against main". An affirmative promise of a comparison
// that never happened (F-2221-1's polarity, F-2243-1's mechanism).
//
// Only `git show` is sabotaged, by a PATH shim that delegates every other git call
// to the real binary. That is the faithful shape of F-2212-1's load/spawn trigger,
// and it leaves `anchorTree()` — which asks `git rev-parse` — answering perfectly,
// so the banner still makes its promise. A shim that broke git wholesale would
// prove nothing, because then everything is loud.
//
// TEETH — each over-general cure is caught by exactly the reverse control built for
// it, and no arm is decoration (s2226: every arm reds in at least one variant):
//   refusing on 'unverifiable' in BARE mode        -> arm 4
//   declaring from ANY tree, not just a frozen one -> arms 5 and 6
//   collapsing strict 2 into 1                     -> arm 3
//   declaring only on failure, never the happy path-> arm 8
//   swallowing the 'landed-on-main' branch         -> arm 7

import test, { after } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPTS = path.dirname(fileURLToPath(import.meta.url))
const AUDIT = path.join(SCRIPTS, 'attended-owed-audit.mjs')
const ANCHOR = 'CUSTODY — NEVER PLACE CONTENT YOU HAVE NOT DECIDED TO MERGE'
const fixtures = []
after(() => fixtures.forEach((dir) => fs.rmSync(dir, { recursive: true, force: true })))

const git = (args, cwd) => execFileSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 1 << 26, stdio: 'pipe' })

// A repo whose linked worktree branches BEFORE the cure lands, so the two trees
// genuinely diverge (s2223: a staleness fixture must plant its ground truth in a
// corpus that actually goes stale).
function board({ landedOnMain = true, withWorktree = true, git: isRepo = true } = {}) {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 's2244-')))
  fixtures.push(root)
  const item = (dir) => {
    const d = path.join(dir, 'tasks', 'attended-owed')
    fs.mkdirSync(d, { recursive: true })
    fs.writeFileSync(path.join(d, '001-custody.md'),
      `target: lawsurface.md\nanchor: ${ANCHOR}\nwhy: fixture\nopened: s2244 2026-08-23\nkind: ACTION\n\n---\n\nbody\n`)
  }
  if (!isRepo) {
    fs.writeFileSync(path.join(root, 'lawsurface.md'), '# no anchor here\n')
    item(root)
    return { root, tree: root }
  }
  git(['init', '-q', '-b', 'main'], root)
  git(['config', 'user.email', 'f@x'], root)
  git(['config', 'user.name', 'fire'], root)
  fs.writeFileSync(path.join(root, 'lawsurface.md'), '# drain skill\n\nsome prose\n')
  git(['add', 'lawsurface.md'], root)
  git(['commit', '-qm', 'base'], root)

  let tree = root
  if (withWorktree) {
    tree = path.join(root, 'wt')
    git(['worktree', 'add', '-q', '-b', 'lane', tree], root)
  }
  if (landedOnMain) {
    fs.writeFileSync(path.join(root, 'lawsurface.md'), `# drain skill\n\n§0 ${ANCHOR}\n`)
    git(['add', 'lawsurface.md'], root)
    git(['commit', '-qm', 'the cure lands on main'], root)
  }
  item(tree)
  return { root, tree }
}

// Fails `git show` only; every other subcommand reaches the real binary.
function sabotageShow(root) {
  const dir = path.join(root, 'shim')
  fs.mkdirSync(dir, { recursive: true })
  const real = execFileSync('which', ['git'], { encoding: 'utf8' }).trim()
  fs.writeFileSync(path.join(dir, 'git'),
    `#!/bin/sh\nif [ "$1" = "show" ]; then echo "fatal: sabotaged" >&2; exit 128; fi\nexec ${real} "$@"\n`)
  fs.chmodSync(path.join(dir, 'git'), 0o755)
  return dir
}

function run(cwd, { args = [], shim = null } = {}) {
  const env = { ...process.env }
  if (shim) env.PATH = `${shim}:${env.PATH}`
  const r = spawnSync('node', [AUDIT, ...args], { timeout: 240_000, killSignal: 'SIGKILL', cwd, encoding: 'utf8', env })
  const out = (r.stdout || '') + (r.stderr || '')
  // s2227: assert the arm REACHED a verdict, not merely that it produced bytes.
  // A crash and a skip both produce output; neither is a measurement.
  assert.match(out, /attended-owed: (DEFECTS|OPEN ITEMS|CLEAN)/,
    `arm never reached a verdict line (rc=${r.status})`)
  return { rc: r.status, out }
}

test('1. THE DEFECT: a frozen tree whose cross-check could not run must SAY SO, not print plain OPEN', () => {
  const b = board({ landedOnMain: true })
  const { rc, out } = run(b.tree, { shim: sabotageShow(b.root) })
  assert.match(out, /UNCROSS-CHECKED/,
    'the cross-check went silent while the banner promised it ran — that must be declared')
  assert.doesNotMatch(out, /⏳ OPEN/,
    'an uncross-checked item must not masquerade as a plainly-OPEN one')
  assert.equal(rc, 0, 'declaring is not refusing: bare mode must stay green')
})

test('2. the uncross-checked arm is NOT byte-identical to a genuinely clean board', () => {
  const bad = board({ landedOnMain: true })
  const a = run(bad.tree, { shim: sabotageShow(bad.root) })
  const good = board({ landedOnMain: false })
  const c = run(good.tree)
  assert.notEqual(a.out, c.out,
    'a run that could not answer must be distinguishable from one that answered "no"')
  assert.match(c.out, /⏳ OPEN/, 'control validity: the clean board really did reach a plain OPEN')
})

test('3. --strict separates 2 ("could not answer") from 1 ("answered, and refuses")', () => {
  const b = board({ landedOnMain: true })
  const { rc } = run(b.tree, { args: ['--strict'], shim: sabotageShow(b.root) })
  assert.equal(rc, 2, 'an incomplete answer must not wear the same code as a known-open item')

  const clean = board({ landedOnMain: false })
  assert.equal(run(clean.tree, { args: ['--strict'] }).rc, 1,
    'control: a plainly-OPEN item still reds --strict with 1')
})

test('4. REVERSE CONTROL: an uncross-checked item must NOT red BARE mode', () => {
  // The over-general cure. `test:ledger-guards` invokes this tool bare, and
  // 'unverifiable' is LAWFUL in the common cases (no main ref, no such path on
  // main yet). Refusing here reds ordinary work and gets excused into uselessness
  // inside a week — F-1460-1, the `cross-engine` fate.
  const b = board({ landedOnMain: true })
  const { rc, out } = run(b.tree, { shim: sabotageShow(b.root) })
  assert.equal(rc, 0)
  assert.doesNotMatch(out, /DEFECTS/, 'an unanswerable cross-check is not a fire-fixable defect')
})

test('5. REVERSE CONTROL: a non-git fixture root stays silent and green', () => {
  // Every legacy fixture in this family builds a bare mkdtemp root, where git exit
  // 128 is lawful. Declaring there would red them all.
  const b = board({ git: false })
  const { rc, out } = run(b.tree)
  assert.equal(rc, 0)
  assert.doesNotMatch(out, /UNCROSS-CHECKED/)
  assert.match(out, /⏳ OPEN/, 'control validity: the arm really did classify the item')
})

test('6. REVERSE CONTROL: from the MAIN worktree the cross-check is inert — do not declare', () => {
  // On main the local file and main's blob are the same tree, so an unanswerable
  // cross-check hides nothing. Declaring here would be the noise that decays a
  // declaration into a formality.
  const b = board({ landedOnMain: false, withWorktree: false })
  const { rc, out } = run(b.tree, { shim: sabotageShow(b.root) })
  assert.equal(rc, 0)
  assert.doesNotMatch(out, /UNCROSS-CHECKED/)
  assert.match(out, /⏳ OPEN/)
})

test('7. the landed-on-main branch still fires: a healthy frozen tree reds STALE-TREE-OPEN', () => {
  const b = board({ landedOnMain: true })
  const { rc, out } = run(b.tree)
  assert.match(out, /STALE-TREE-OPEN/, 'the F-2225-1 cure must survive this one')
  assert.equal(rc, 1)
  assert.doesNotMatch(out, /UNCROSS-CHECKED/, 'a cross-check that ANSWERED must not be called silent')
})

test('8. the count is declared on the happy path too (F-2208-1)', () => {
  // A declaration that appears only on failure re-creates the ambiguity it removes.
  const b = board({ landedOnMain: false })
  assert.match(run(b.tree).out, /0 uncross-checked/)
})
