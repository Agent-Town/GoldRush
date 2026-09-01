#!/usr/bin/env node
/**
 * gazette-scan-space-guard.test.mjs — does the GZ-01 sweep still LOOK at the public door?
 *
 * WHY THIS EXISTS (F-2345-1, s2345)
 * ---------------------------------
 * `gazette-backfill-sweep.mjs` prints "NOT cited anywhere — candidates to judge: N" and
 * every dry-board fire reports that N to the owner as the GZ-01 discharge. It is a
 * UNIVERSAL CLAIM over whatever its path filter selects, and for 16 days that filter
 * omitted `site/` — the droplet-served landing at https://agenttown.app/, the page
 * health-watch.sh probes as "the public door". Nine merges to it were skipped before
 * classification, so they could not appear as candidates and the tool read a clean 0.
 *
 * The file already carried TWO comments warning that a matcher narrower than the data
 * lies — both about HASHES. The same question was never asked of the PATHS.
 *
 * WHAT THIS GUARD ASSERTS, AND WHY EACH ARM EXISTS
 * ------------------------------------------------
 * Arms 1–3 pin the cure itself. Arms 4–6 are REVERSE CONTROLS against the over-general
 * fix (widening until everything is "player-visible" would make the sweep fire on every
 * bookkeeping merge and be excused into uselessness inside a week — F-1460-1, the
 * `cross-engine` fate, which F-1600-1 explicitly forbids for THIS tool). Arm 7 pins the
 * list as load-bearing rather than decoration. Arms 8–9 assert the DECLARATION on the
 * observable a caller actually reads — stdout — including on the emptiest happy path
 * (F-2208-1: a scan space named only on failure re-creates the ambiguity it removes;
 * F-2210-1: this tool is advisory and exits 0 always, so its real interface IS stdout).
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { PLAYER_PREFIXES, isPlayerPath } from './gazette-backfill-sweep.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const SWEEP = resolve(HERE, 'gazette-backfill-sweep.mjs')

const run = (...args) => {
  const r = execFileSync('node', [SWEEP, ...args], {
    timeout: 240_000, killSignal: 'SIGKILL',
    encoding: 'utf8',
    cwd: resolve(HERE, '..'),
    maxBuffer: 64 * 1024 * 1024,
  })
  // F-2215-1: a control whose failure mode is silence cannot be told from the silence it
  // measures. Assert the arm actually produced a report before believing what it says.
  assert.ok(r.length > 0, 'sweep produced no stdout at all — the arm did not run')
  return r
}

test('site/ is in the scan space — the public door is examined at all (F-2345-1)', () => {
  assert.ok(
    PLAYER_PREFIXES.includes('site/'),
    'site/ missing from PLAYER_PREFIXES: the landing page is invisible to GZ-01 again',
  )
})

test('a site/-only change is classified as a player path', () => {
  assert.ok(isPlayerPath('site/index.html'), 'site/index.html must be a player path')
  assert.ok(isPlayerPath('site/assay-office.js'), 'site/assay-office.js must be a player path')
  assert.ok(isPlayerPath('site/assets/gold-rush-key-art.jpg'), 'site assets must be a player path')
})

test('the original player paths still match — the cure is additive, not a replacement', () => {
  for (const f of ['src/game/Game.ts', 'assets/LEDGER.md', 'public/favicon.ico', 'functions/api/stats.js', 'index.html']) {
    assert.ok(isPlayerPath(f), `${f} must remain a player path`)
  }
})

test('REVERSE CONTROL: factory surfaces are NOT player paths', () => {
  // The over-general cure — widening until the filter admits everything — passes every
  // arm above while destroying the tool. F-1600-1 forbids exactly this for this file.
  for (const f of [
    'scripts/gazette-backfill-sweep.mjs',
    'docs/HANDOVER-2026-07-20.md',
    'tasks/BACKLOG.md',
    'reviews/sci-04.md',
    'logs/fire-20260829.log',
    'marketing/outbox/gazette-queue.md',
    'rehearsal/lib.mjs',
    'foundry/00-THE-FOUNDRY.md',
    'ops/runbook.md',
    'STATUS.md',
  ]) {
    assert.ok(!isPlayerPath(f), `${f} must NOT be a player path — that would red on every bookkeeping merge`)
  }
})

test('REVERSE CONTROL: the prefixes are anchored at the start, not matched anywhere', () => {
  assert.ok(!isPlayerPath('docs/src/notes.md'), 'a prefix appearing mid-path must not match')
  assert.ok(!isPlayerPath('tasks/site/plan.md'), 'a prefix appearing mid-path must not match')
})

test('REVERSE CONTROL: the dot in index.html is escaped', () => {
  // The regex is BUILT FROM A STRING, so an unescaped `.` silently becomes a wildcard.
  assert.ok(!isPlayerPath('indexZhtml'), 'index.html must not match indexZhtml — escape the dot')
  assert.ok(!isPlayerPath('index-html'), 'index.html must not match index-html — escape the dot')
})

test('every declared prefix is load-bearing — the list drives the predicate', () => {
  // Catches a stale parallel literal: someone adds a prefix to PLAYER_PREFIXES while the
  // regex stays hardcoded, so the declaration says one thing and the filter does another.
  for (const p of PLAYER_PREFIXES) {
    const probe = p.endsWith('/') ? `${p}probe-file.txt` : p
    assert.ok(isPlayerPath(probe), `declared prefix ${p} does not actually match ${probe}`)
  }
})

test('the scan space is DECLARED on stdout, naming every prefix', () => {
  const out = run('--since=2026-08-28')
  assert.match(out, /scan space:/, 'the report must declare its scan space')
  for (const p of PLAYER_PREFIXES) {
    assert.ok(out.includes(p), `the declared scan space omits ${p}`)
  }
})

test('the declaration prints on the emptiest happy path too (F-2208-1)', () => {
  // A window with no merges at all: every count is zero and nothing is wrong. If the scan
  // space were declared only when something looked amiss, "0 candidates" here would be
  // indistinguishable from "0 candidates I was permitted to see" — the defect itself.
  const out = run('--since=2099-01-01')
  assert.match(out, /scan space:/, 'the scan space must be declared even when the window is empty')
  assert.ok(out.includes('site/'), 'the empty-window declaration must still name site/')
  assert.match(out, /candidates to judge:\s+0/, 'an empty window should yield zero candidates')
})
