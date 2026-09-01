// F-2225-1 (s2225) — THE ANCHOR TARGET IS A SECOND CORPUS, AND IT DECIDES EVERY VERDICT.
//
// `attended-owed-audit.mjs` resolves OPEN vs LANDED by reading the item's `target:` file with a
// bare repo-relative path. F-2220-1 declared the ITEM corpus; this one was never declared and
// never tree-checked, so in a LINKED WORKTREE the tool answers from a frozen copy of the law
// surface while asking a question about MAIN.
//
// Ground truth in arms 1-2: the attended cure HAS landed on main, so the correct verdict is a
// DEFECT at rc=1 in BARE mode -- which is exactly how `test:ledger-guards` invokes this tool.
// Pre-cure, the stale arm returned OPEN at rc=0, byte-identical to a genuinely clean board.
//
// THE FIXTURES ARE THE TRANSFERABLE HALF (s2223's rule, and it bit this fire): a staleness
// fixture must plant its ground truth in the corpus that ACTUALLY goes stale -- here the TARGET
// file, not the item dir, which is byte-identical in both trees exactly as it is on the live
// board. And the reverse control must be a SEPARATE repo whose `main` never carried the anchor:
// the first draft of this proof built its control by copying the landed repo and reverting only
// the working file, so `main:` still held the anchor and the control would have reded.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath } from 'node:url'

const AUDIT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'attended-owed-audit.mjs')
const ANCHOR = 'CUSTODY — NEVER PLACE CONTENT YOU HAVE NOT'
const roots = []

function git(args, cwd) {
  execFileSync('git', args, { cwd, maxBuffer: 1 << 26, stdio: 'pipe' })
}

// Builds a repo whose item targets `.claude/skills/drain/SKILL.md`, plus a linked worktree
// branched BEFORE `landed` is applied to main. Returns { repo, worktree }.
function fixture({ landed }) {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 's2225-'))
  roots.push(base)
  const repo = path.join(base, 'repo')
  fs.mkdirSync(path.join(repo, 'tasks/attended-owed'), { recursive: true })
  fs.mkdirSync(path.join(repo, '.claude/skills/drain'), { recursive: true })
  git(['init', '-q', '-b', 'main'], repo)
  git(['config', 'user.email', 'f@x'], repo)
  git(['config', 'user.name', 'fire'], repo)
  fs.writeFileSync(
    path.join(repo, 'tasks/attended-owed/001-probe.md'),
    `target: .claude/skills/drain/SKILL.md\nanchor: ${ANCHOR}\nwhy: probe\nopened: s2225 2026-08-23\n\n---\nbody\n`,
  )
  const bare = '# drain skill\nnothing yet\n'
  fs.writeFileSync(path.join(repo, '.claude/skills/drain/SKILL.md'), bare)
  git(['add', '-A'], repo)
  git(['commit', '-qm', 'base'], repo)

  const worktree = path.join(base, 'lane')
  git(['worktree', 'add', '-q', '-b', 'lane/probe', worktree], repo)

  if (landed) {
    fs.writeFileSync(
      path.join(repo, '.claude/skills/drain/SKILL.md'),
      `# drain skill\n\n## ${ANCHOR} DECIDED TO MERGE INTO MAIN\ndone\n`,
    )
    git(['add', '-A'], repo)
    git(['commit', '-qm', 'attended: land the custody rule'], repo)
  }
  return { repo, worktree }
}

function run(cwd, args = []) {
  const r = spawnSync('node', [AUDIT, ...args], { timeout: 240_000, killSignal: 'SIGKILL', cwd, encoding: 'utf8' })
  const out = `${r.stdout || ''}${r.stderr || ''}`
  // F-2215-1: a control whose failure mode is silence cannot be told from the silence it
  // measures. Assert the arm PRODUCED something before believing what it says.
  assert.ok(out.length > 0, `arm produced no output at all (rc=${r.status})`)
  return { rc: r.status, out }
}

process.on('exit', () => {
  for (const r of roots) fs.rmSync(r, { recursive: true, force: true })
})

test('1. root, cure landed on main: LANDED-NOT-ARCHIVED at rc=1 (legacy behaviour intact)', () => {
  const { repo } = fixture({ landed: true })
  const { rc, out } = run(repo)
  assert.match(out, /LANDED-NOT-ARCHIVED/)
  assert.equal(rc, 1)
})

test('2. THE DEFECT: linked worktree, stale target, main carries the anchor -> reds, not OPEN', () => {
  const { worktree } = fixture({ landed: true })
  const { rc, out } = run(worktree)
  assert.match(out, /STALE-TREE-OPEN/)
  assert.equal(rc, 1, 'a frozen checkout must not green the gate main would red')
  assert.doesNotMatch(out, /⏳ OPEN/, 'the stale item must not also be counted as plainly OPEN')
})

test('3. REVERSE CONTROL: nothing landed anywhere -> plain OPEN at rc=0, no false red', () => {
  const { repo } = fixture({ landed: false })
  const { rc, out } = run(repo)
  assert.match(out, /⏳ OPEN/)
  assert.doesNotMatch(out, /STALE-TREE-OPEN/)
  assert.equal(rc, 0)
})

test('4. REVERSE CONTROL: a linked worktree whose main ALSO lacks the anchor must not red', () => {
  // Being a worktree is LAWFUL for this tool -- §3.0b mandates gating in a detached one, so a
  // blanket linked-worktree refusal would red the prescribed drain gate (F-1460-1's fate).
  const { worktree } = fixture({ landed: false })
  const { rc, out } = run(worktree)
  assert.match(out, /⏳ OPEN/)
  assert.doesNotMatch(out, /STALE-TREE-OPEN/)
  assert.equal(rc, 0)
})

test('5. the declaration names the tree on the happy path too (F-2208-1)', () => {
  const { repo } = fixture({ landed: false })
  assert.match(run(repo).out, /anchor targets read from: the main worktree/)
})

test('6. the declaration names a LINKED WORKTREE as the cause, breaking byte-identity', () => {
  const landedTree = fixture({ landed: true }).worktree
  const cleanRepo = fixture({ landed: false }).repo
  const a = run(landedTree)
  const b = run(cleanRepo)
  assert.match(a.out, /LINKED WORKTREE/)
  assert.notEqual(a.out, b.out, 'a stale tree and a clean board must not be byte-identical')
})

test('7. a non-git fixture root is LAWFUL: git exit 128 must not refuse or crash', () => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 's2225-nogit-'))
  roots.push(base)
  fs.mkdirSync(path.join(base, 'tasks/attended-owed'), { recursive: true })
  fs.mkdirSync(path.join(base, '.claude/skills/drain'), { recursive: true })
  fs.writeFileSync(
    path.join(base, 'tasks/attended-owed/001-probe.md'),
    `target: .claude/skills/drain/SKILL.md\nanchor: ${ANCHOR}\nwhy: probe\nopened: s2225\n\n---\nbody\n`,
  )
  fs.writeFileSync(path.join(base, '.claude/skills/drain/SKILL.md'), '# drain skill\nnothing\n')
  const { rc, out } = run(base)
  assert.match(out, /⏳ OPEN/)
  assert.equal(rc, 0)
  assert.doesNotMatch(out, /UNVERIFIABLE/)
})

test('8. --strict still reds a plain OPEN, and the stale arm reds in BARE mode', () => {
  const clean = fixture({ landed: false }).repo
  assert.equal(run(clean, ['--strict']).rc, 1)
  assert.equal(run(clean).rc, 0)
  // bare mode is what test:ledger-guards uses -- the defect must not need --strict to surface
  assert.equal(run(fixture({ landed: true }).worktree).rc, 1)
})
