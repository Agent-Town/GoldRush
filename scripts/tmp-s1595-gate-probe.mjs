#!/usr/bin/env node
// s1595 — does the EXISTING pre-queue gate already refuse the five masters my
// banner sweep flagged? If it does, F-1595-1's severity claim is overstated and
// must be corrected in the row rather than left standing.
import { execFileSync } from 'node:child_process'

const MASTERS = [
  'tasks/lane-b-f1592-3-battery-frame-supply.md',
  'tasks/lane-b-f1591-1-frame-supply-cliff.md',
  'tasks/lane-b-f1589-4-dep-reoptimize-stall.md',
  'tasks/lane-d-f1522-1-dispatch-lane-safety.md',
  'tasks/lane-e3-voltage-socket.md',
]

for (const m of MASTERS) {
  let out = '', rc = 0
  try {
    out = execFileSync('node', ['scripts/drain-block-check.mjs', '--strict', '--queue', m], { encoding: 'utf8' })
  } catch (e) {
    out = (e.stdout || '') + (e.stderr || ''); rc = e.status
  }
  const verdict = (out.match(/⛔[^\n]*/) || out.match(/[✓?][^\n]*/) || ['(no verdict line)'])[0]
  console.log(`rc=${rc}  ${m}`)
  console.log(`      ${verdict.trim().slice(0, 120)}`)
}
