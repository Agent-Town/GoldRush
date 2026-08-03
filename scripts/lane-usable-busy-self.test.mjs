// s1418 — F-1418-1: a lane pre-flight must not STOP on its own dispatch.
//
// `lane-runner-v3.sh:131` writes `tasks/running/<slot>.pid` IN ORDER TO DISPATCH a run. So a
// master pre-flight that asks `lane-usable.mjs <slot>` and STOPs on BUSY is, when it can see
// that file at all, refusing on its own reflection. s1417's f1417-3 was the first master to
// say "from the repo root" — the one clarification that lets it see the file — and it STOPped
// in 30,378 tokens with zero edits. The other 8 masters with the same pre-flight survived only
// because `tasks/running/` is UNTRACKED and therefore absent from every lane worktree.
//
// This guard pins BOTH directions, because the fix has a destructive failure mode: reporting a
// FOREIGN runner as not-busy would let a fire refill an occupied lane and `reset --hard` over
// live runner output. The first draft of `ancestors()` did exactly that — it pushed pid 1
// (an ancestor of every process) into the chain, so any pidfile read as "my own dispatcher".
// That bug was caught by running the probe, not by reading the code; hence these cases.
import { strict as assert } from 'node:assert'
import test from 'node:test'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isSlotBusy } from './lane-usable.mjs'

const script = fileURLToPath(new URL('./lane-usable.mjs', import.meta.url))

const ppid = (pid) => {
  const out = execFileSync('ps', ['-o', 'ppid=', '-p', String(pid)], { encoding: 'utf8' }).trim()
  return Number.parseInt(out, 10)
}

test('no pidfile: the slot is free', () => {
  assert.equal(isSlotBusy(() => null), false)
  assert.equal(isSlotBusy(() => undefined), false)
})

test('our OWN dispatcher does not count as busy (the F-1418-1 cure)', () => {
  // The pidfile holds the pid of the subshell that launched us: our direct parent.
  assert.equal(isSlotBusy(() => String(ppid(process.pid))), false)
  // ...and a grandparent, since codex sits between the subshell and this process.
  const gp = ppid(ppid(process.pid))
  if (gp > 1) assert.equal(isSlotBusy(() => String(gp)), false)
})

test('a FOREIGN runner IS busy — the direction that must never regress', () => {
  // A live process that is not an ancestor of ours. Our own child is the cheapest such proof.
  const child = execFileSync('sh', ['-c', 'sleep 5 >/dev/null 2>&1 & echo $!'], { encoding: 'utf8' }).trim()
  assert.ok(Number.parseInt(child, 10) > 1)
  assert.equal(isSlotBusy(() => child), true)
})

test('pid 1 is an ancestor of EVERY process and must still read busy', () => {
  // The first draft returned false here, which is the destructive direction.
  assert.equal(isSlotBusy(() => '1'), true)
})

test('fail safe: anything we cannot establish reads busy', () => {
  assert.equal(isSlotBusy(() => 'garbage'), true)
  assert.equal(isSlotBusy(() => ''), true)
  assert.equal(isSlotBusy(() => '0'), true)
  assert.equal(isSlotBusy(() => '-4'), true)
})

test('an unrelated pid that is merely NUMERIC is not trusted', () => {
  // A pid that does not exist at all: not our ancestor, so the slot reads held.
  assert.equal(isSlotBusy(() => '999999'), true)
})

test('bookkeeping reassurance narrows only when tasks are behind', (t) => {
  const repo = mkdtempSync(join(tmpdir(), 'lane-usable-ledger-'))
  t.after(() => rmSync(repo, { recursive: true, force: true }))
  const git = (args) => execFileSync('git', args, { cwd: repo, encoding: 'utf8' })

  git(['init', '-b', 'main'])
  git(['config', 'user.name', 'Lane Usable Guard'])
  git(['config', 'user.email', 'lane-usable@example.invalid'])
  mkdirSync(join(repo, 'tasks'))
  writeFileSync(join(repo, 'tasks/BACKLOG.md'), 'base\n')
  git(['add', '.'])
  git(['commit', '-m', 'base'])
  const ledgerBase = git(['rev-parse', 'HEAD']).trim()

  writeFileSync(join(repo, 'tasks/BACKLOG.md'), 'base\nnew finding\n')
  git(['commit', '-am', 'ledger update'])
  const docsBase = git(['rev-parse', 'HEAD']).trim()
  mkdirSync(join(repo, 'docs'))
  writeFileSync(join(repo, 'docs/note.md'), 'bookkeeping only\n')
  git(['add', '.'])
  git(['commit', '-m', 'docs update'])

  git(['branch', 'tmp-ledger-drift', ledgerBase])
  git(['branch', 'tmp-no-ledger-drift', docsBase])
  mkdirSync(join(repo, 'worktrees'))
  git(['worktree', 'add', join(repo, 'worktrees/tmp-ledger-slot'), 'tmp-ledger-drift'])
  git(['worktree', 'add', join(repo, 'worktrees/tmp-no-ledger-slot'), 'tmp-no-ledger-drift'])

  const ledger = execFileSync('node', [script, 'tmp-ledger-drift'], { cwd: repo, encoding: 'utf8' })
  assert.match(ledger, /ledger drift: 1 file\(s\) main has moved that this lane lacks:/)
  assert.match(ledger, /tasks\/BACKLOG\.md/)
  assert.match(ledger, /READ-FIRST cites the ledger BY CONTENT will fail its grep in this lane/)
  assert.doesNotMatch(ledger, /nothing here can stop a task running/)

  const noLedger = execFileSync('node', [script, 'tmp-no-ledger-drift'], { cwd: repo, encoding: 'utf8' })
  assert.match(
    noLedger,
    /byte-identical to main\. The gap is bookkeeping only — nothing here can stop a task running\./,
  )
  assert.doesNotMatch(noLedger, /ledger drift:/)
})
