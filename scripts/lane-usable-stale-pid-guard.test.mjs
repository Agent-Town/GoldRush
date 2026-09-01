// F-2366-1 — a lane's BUSY verdict must distinguish a LIVE runner from a CRASHED-RUNNER CORPSE.
//
// THE DEFECT this guards: `isSlotBusy` established WHO holds the slot and never asked whether
// that holder is ALIVE. A dead pid is finite, positive and not one of our ancestors, so it hit
// the same `return true` a live foreign runner does, and the report printed the same
// "a runner holds this slot — leave it alone". `lane-runner-v3.sh` — the pidfile's WRITER, and
// therefore the authority — disagrees: its poll loop tests `kill -0`, salvages a dead run to
// tasks/failed/CRASHED-* and removes the pidfile. Two readers of one file, one right answer.
//
// ⚠️ THE REVERSE CONTROL IS THE ONE THAT MATTERS, and it is why arms 4-7 exist at all.
// The obvious "cure" — treating a stale holder as NOT busy, so the lane reads USABLE — is the
// DESTRUCTIVE direction: it lets a fire refill an occupied lane and `reset --hard` over live
// output (Mistake #2, the Reset Massacre). It also gives the WRONG answer at the only moment
// it fires: a dead holder means the RUNNER is dead, so "refill freely" queues a master into a
// lane nothing can consume (F-2343-1). The cure therefore DECLARES and does not CLEAR, and
// these arms pin that: staleness must be VISIBLE and must NOT move the verdict.
//
// EPERM is the subtle one: it means the process EXISTS and is merely not ours. Reading it as
// gone is the destructive direction, so only ESRCH — positive proof of absence — is 'stale'.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync, spawnSync, spawn } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { slotHolder, isSlotBusy, pidLiveness } from './lane-usable.mjs'

const CLI = fileURLToPath(new URL('./lane-usable.mjs', import.meta.url))

// ---- deterministic pids -------------------------------------------------------------------
// A pid we KNOW is gone: spawn a child, let it exit, keep its number. A pid we KNOW is up: a
// child we hold open. Both are asserted before use — a control whose failure mode is silence
// cannot be told from the silence it measures (F-2215-1).
function deadPid() {
  // BOUNDED (s2430, F-2429-2). This is the single most wedge-shaped spawn in the battery: the
  // child's ENTIRE body is `process.exit(0)`, and F-2429-1 measured the wedge as a deadlock inside
  // node's own platform teardown ON `process.exit()` — so this fixture is the exact shape whose
  // corpses were autopsied. Unbounded it would hang `spawnSync` forever, and because `spawnSync`
  // blocks the event loop, `--test-timeout` could never fire. The bound cannot fire on lawful work:
  // this child does nothing but exit.
  const r = spawnSync(process.execPath, ['-e', 'process.exit(0)'], { timeout: 240_000, killSignal: 'SIGKILL' })
  return r.pid
}
function isGone(pid) {
  try {
    process.kill(pid, 0)
    return false
  } catch (e) {
    return e.code === 'ESRCH'
  }
}

// A stand-in for our own dispatcher: slotHolder discounts only pids in OUR ancestor chain.
const selfChainPid = process.ppid

test('CONTROL VALIDITY — the fixture really mints a gone pid and a live pid', () => {
  const dead = deadPid()
  assert.equal(isGone(dead), true, 'minted pid is not actually gone — every arm below is vacuous')
  assert.equal(isGone(process.pid), false, 'our own pid reads as gone — probe is broken')
})

test('arm 1 — a GONE holder is classified stale', () => {
  const dead = deadPid()
  assert.equal(isGone(dead), true)
  assert.equal(slotHolder(() => String(dead), process.pid), 'stale')
})

test('arm 2 — a LIVE foreign holder is classified live', () => {
  // our own pid is alive and is NOT in our ancestor chain, so it stands in for a foreign runner
  assert.equal(slotHolder(() => String(process.pid), process.pid), 'live')
})

test('arm 3 — stale and live are DISTINGUISHABLE (the defect itself)', () => {
  const dead = deadPid()
  assert.equal(isGone(dead), true)
  const a = slotHolder(() => String(dead), process.pid)
  const b = slotHolder(() => String(process.pid), process.pid)
  assert.notEqual(a, b, 'a crashed corpse and a live runner classify the same — F-2366-1 is back')
})

test('arm 4 — REVERSE CONTROL: a stale holder is still BUSY (never USABLE)', () => {
  const dead = deadPid()
  assert.equal(isGone(dead), true)
  assert.equal(
    isSlotBusy(() => String(dead), process.pid),
    true,
    'a stale holder cleared the slot — this is the Reset Massacre direction',
  )
})

test('arm 5 — REVERSE CONTROL: EPERM is LIVE, not stale; ESRCH is the ONLY proof of absence', () => {
  const raising = (code) => () => {
    const e = new Error(code)
    e.code = code
    throw e
  }
  // EPERM means the process EXISTS and is merely not ours. Calling that gone is destructive.
  assert.equal(pidLiveness(424242, raising('EPERM')), 'live')
  // ESRCH is the only positive proof of absence.
  assert.equal(pidLiveness(424242, raising('ESRCH')), 'stale')
  // anything else is un-answerable, and must fail safe rather than guess either way
  assert.equal(pidLiveness(424242, raising('EINVAL')), 'unverifiable')
  // and the whole classification must carry that through to BUSY
  assert.equal(slotHolder(() => '424242', process.pid, (p) => pidLiveness(p, raising('EPERM'))), 'live')
})

test('arm 6 — an unparseable pidfile stays unverifiable and BUSY', () => {
  assert.equal(slotHolder(() => 'unreadable', process.pid), 'unverifiable')
  assert.equal(isSlotBusy(() => 'unreadable', process.pid), true)
})

test('arm 7 — isSlotBusy is UNCHANGED for none/self (no pidfile, own dispatcher)', () => {
  assert.equal(slotHolder(() => null, process.pid), 'none')
  assert.equal(isSlotBusy(() => null, process.pid), false)
  assert.equal(slotHolder(() => String(selfChainPid), process.pid), 'self')
  assert.equal(isSlotBusy(() => String(selfChainPid), process.pid), false)
})

// ---- the SEAM: the classification must reach STDOUT -----------------------------------------
// F-2209-1/F-2210-1: extracting a decision creates a new untested seam at the CALL SITE, and a
// tool whose default mode is advisory has its real interface on stdout. These arms drive the
// REAL CLI against an isolated scratch repo — never the live tasks/running/, because writing a
// pidfile there would make the production runner salvage and clean a slot.
function fixture() {
  const root = mkdtempSync(join(tmpdir(), 's2366-lane-'))
  const repo = join(root, 'repo')
  mkdirSync(repo)
  const g = (args, cwd = repo) => execFileSync('git', args, { cwd, encoding: 'utf8' })
  g(['init', '-q', '-b', 'main'])
  g(['config', 'user.email', 'guard@example.com'])
  g(['config', 'user.name', 'guard'])
  writeFileSync(join(repo, 'seed.txt'), 'seed\n')
  g(['add', 'seed.txt'])
  g(['commit', '-qm', 'seed'])
  g(['worktree', 'add', '-q', '-b', 'lane/x', join(repo, 'worktrees', 'lane-x')])
  mkdirSync(join(repo, 'tasks', 'running'), { recursive: true })
  return { root, repo }
}
function runCli(repo, args) {
  const r = spawnSync(process.execPath, [CLI, ...args], { timeout: 240_000, killSignal: 'SIGKILL', cwd: repo, encoding: 'utf8' })
  return { rc: r.status, out: r.stdout || '' }
}
// A live process that is a SIBLING of the CLI we spawn, never one of its ancestors — otherwise
// slotHolder correctly reports 'self' and the arm measures nothing.
function spawnLiveSibling() {
  return spawn(process.execPath, ['-e', 'setTimeout(() => {}, 120000)'], { stdio: 'ignore' })
}

test('arm 8 — a STALE holder is named on stdout as a crashed-runner corpse', () => {
  const { root, repo } = fixture()
  try {
    const dead = deadPid()
    assert.equal(isGone(dead), true)
    writeFileSync(join(repo, 'tasks', 'running', 'lane-x.pid'), String(dead))
    const { rc, out } = runCli(repo, ['lane-x'])
    assert.ok(out.length > 0, 'CLI produced nothing — arm is vacuous')
    assert.match(out, /=> BUSY/, 'a held slot must still read BUSY')
    assert.match(out, /CRASHED-RUNNER CORPSE/, 'the corpse is not named on stdout')
    assert.match(out, /runner :/, 'the reader is not routed to the runner check (§2.0c)')
    assert.equal(rc, 2, 'BUSY must keep its exit code')
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('arm 9 — a LIVE holder also declares its cause, and does NOT claim a corpse', () => {
  const { root, repo } = fixture()
  // A live pid that is NOT in the spawned CLI's ancestor chain — a SIBLING, not our own pid.
  // (Using process.pid here reads as 'self', because the CLI's parent IS this test process;
  // that first draft asserted nothing and is why this comment exists.)
  const held = spawnLiveSibling()
  try {
    assert.equal(isGone(held.pid), false, 'sibling is not alive — arm is vacuous')
    writeFileSync(join(repo, 'tasks', 'running', 'lane-x.pid'), String(held.pid))
    const { rc, out } = runCli(repo, ['lane-x'])
    assert.ok(out.length > 0, 'CLI produced nothing — arm is vacuous')
    assert.match(out, /=> BUSY/)
    // F-2208-1: the declaration prints on the ORDINARY cause too, or its absence is ambiguous
    assert.match(out, /holder pid is ALIVE/, 'the ordinary BUSY cause is undeclared')
    assert.doesNotMatch(out, /CRASHED-RUNNER CORPSE/, 'a live runner was reported as a corpse')
    assert.equal(rc, 2)
  } finally {
    held.kill()
    rmSync(root, { recursive: true, force: true })
  }
})

test('arm 10 — with NO pidfile the lane is not BUSY and declares no holder', () => {
  const { root, repo } = fixture()
  try {
    const { out } = runCli(repo, ['lane-x'])
    assert.ok(out.length > 0, 'CLI produced nothing — arm is vacuous')
    assert.doesNotMatch(out, /=> BUSY/, 'an unheld lane read BUSY')
    assert.doesNotMatch(out, /holder pid/, 'a holder was declared where none exists')
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
