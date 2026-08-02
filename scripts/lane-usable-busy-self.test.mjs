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
import { isSlotBusy } from './lane-usable.mjs'

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
