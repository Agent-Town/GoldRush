// F-1294-2 control arm — s1295.
//
// GATE (reviews/agent-rung-honest-gate-v2.md): re-run three adjacent specs on BOTH arms
// (clean main + merged tree), --workers=1, same hour. All green or equally red => merge the
// slice unchanged. Any arm-dependent difference => the first real finding against the slice.
//
// s1294 declined to run this because the box was not idle and BLOCK arms would be measured under
// different load (the F-1285-2 unmatched-arms confound). This harness answers that by INTERLEAVING
// at the spec level — each control/merged pair runs back-to-back, minutes apart, so load drift is
// shared-mode noise rather than an arm confound — and by running the pair order FORWARD then
// REVERSED, so any residual order effect cancels. Load average is sampled before every run and
// recorded, so the arms can be checked for comparability after the fact instead of assumed.
//
// Decisive asymmetry worth stating: a red on CLEAN MAIN cannot have been caused by the slice.
// Heavy load therefore raises the chance of a decisive exoneration; it does not spoil the measure.
import { spawn, spawnSync } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import { loadavg } from 'node:os'

const PORT = 5237
const BASE = `http://127.0.0.1:${PORT}`
const OUT = 'logs/session-scratch/s1295'
const SLICE_PATHS = [
  'src/agent/PermissionLadder.ts',
  'src/agent/ToolSurface.ts',
  'e2e/m4-01-tool-surface.spec.ts',
  'e2e/m4-05-agent-closeout.spec.ts',
]
const SPECS = [
  'e2e/ap-standing-orders.spec.ts',
  'e2e/ss-01-beats.spec.ts',
  'e2e/trail-guide-beat-priority.spec.ts',
]

mkdirSync(OUT, { recursive: true })
const sh = (cmd, args, opts = {}) => spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, ...opts })

// ---- preconditions -------------------------------------------------------
const head = sh('git', ['rev-parse', 'HEAD']).stdout.trim()
const dirty = sh('git', ['status', '--porcelain', '--', ...SLICE_PATHS]).stdout.trim()
if (dirty) { console.error('ABORT: slice paths dirty at start:\n' + dirty); process.exit(2) }
console.log(`main HEAD ${head}\nslice paths clean. port ${PORT}\n`)

const applySlice = () => sh('git', ['checkout', 'lane/e2-arsenal', '--', ...SLICE_PATHS])
const revertSlice = () => sh('git', ['checkout', 'HEAD', '--', ...SLICE_PATHS])

const sliceState = () => {
  const d = sh('git', ['status', '--porcelain', '--', ...SLICE_PATHS]).stdout.trim()
  return d ? 'MERGED' : 'CONTROL'
}

// ---- dev server ----------------------------------------------------------
const server = spawn('npx', ['vite', '--host', '127.0.0.1', '--port', String(PORT), '--strictPort'], {
  stdio: ['ignore', 'pipe', 'pipe'],
})
let serverLog = ''
server.stdout.on('data', d => { serverLog += d })
server.stderr.on('data', d => { serverLog += d })

const waitForServer = async () => {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(BASE, { signal: AbortSignal.timeout(2000) })
      if (r.ok) return true
    } catch { /* not up yet */ }
    await new Promise(r => setTimeout(r, 1000))
  }
  return false
}

const cleanup = () => {
  try { server.kill('SIGTERM') } catch {}
  revertSlice()
}
process.on('exit', cleanup)
process.on('SIGINT', () => { cleanup(); process.exit(130) })

// ---- one measurement -----------------------------------------------------
const runSpec = (spec, arm) => {
  const actual = sliceState()
  if (actual !== arm) throw new Error(`ARM MISMATCH: wanted ${arm}, tree is ${actual}`)
  const load0 = loadavg()[0]
  const t0 = Date.now()
  const r = sh('npx', ['playwright', 'test', spec, '--project=desktop-chrome', '--workers=1', '--reporter=line'], {
    env: { ...process.env, GR_CAPTURE_EXTERNAL_SERVER: '1', GR_CAPTURE_BASE_URL: BASE },
  })
  const secs = ((Date.now() - t0) / 1000).toFixed(1)
  const out = (r.stdout || '') + (r.stderr || '')
  const passed = /(\d+) passed/.exec(out)
  const failed = /(\d+) failed/.exec(out)
  // capture the failing test titles + the first reason line for each
  const reasons = [...out.matchAll(/^\s*\d+\)\s+\[.*?\]\s+›\s+(.*)$/gm)].map(m => m[1].trim())
  const rec = {
    spec: spec.replace('e2e/', ''), arm, rc: r.status, secs: Number(secs),
    load0: Number(load0.toFixed(2)), load1: Number(loadavg()[0].toFixed(2)),
    passed: passed ? Number(passed[1]) : 0,
    failed: failed ? Number(failed[1]) : 0,
    reasons,
  }
  console.log(`  ${arm.padEnd(7)} ${rec.spec.padEnd(34)} rc=${rec.rc} ${rec.passed}p/${rec.failed}f ${secs}s load ${rec.load0}->${rec.load1}`)
  writeFileSync(`${OUT}/raw-${rec.spec}-${arm}-${Date.now()}.log`, out)
  return rec
}

// ---- main ----------------------------------------------------------------
const results = []
const doPair = (spec, order) => {
  for (const arm of order) {
    if (arm === 'MERGED') applySlice(); else revertSlice()
    results.push(runSpec(spec, arm))
  }
  revertSlice()
}

if (!(await waitForServer())) {
  console.error('ABORT: dev server never came up on ' + BASE + '\n' + serverLog.slice(-2000))
  process.exit(3)
}
console.log('dev server up.\n')

console.log('ROUND 1 (control first):')
for (const spec of SPECS) doPair(spec, ['CONTROL', 'MERGED'])
console.log('\nROUND 2 (merged first — cancels order effects):')
for (const spec of SPECS) doPair(spec, ['MERGED', 'CONTROL'])

// ---- verdict -------------------------------------------------------------
console.log('\n================ VERDICT ================')
let anyArmDependent = false
for (const spec of SPECS.map(s => s.replace('e2e/', ''))) {
  const c = results.filter(r => r.spec === spec && r.arm === 'CONTROL')
  const m = results.filter(r => r.spec === spec && r.arm === 'MERGED')
  const cFail = c.filter(r => r.rc !== 0).length, mFail = m.filter(r => r.rc !== 0).length
  const same = cFail === mFail
  if (!same) anyArmDependent = true
  console.log(`${spec.padEnd(34)} control ${cFail}/${c.length} red · merged ${mFail}/${m.length} red · ${same ? 'EQUAL' : '*** ARM-DEPENDENT ***'}`)
}
console.log(anyArmDependent
  ? '\n=> ARM-DEPENDENT DIFFERENCE FOUND — real finding against the slice. DO NOT MERGE.'
  : '\n=> ARMS EQUAL — gate satisfied, slice exonerated on these three specs.')

writeFileSync(`${OUT}/f1294-2-control-results.json`, JSON.stringify({
  head, port: PORT, slicePaths: SLICE_PATHS, results, anyArmDependent,
}, null, 2))
console.log(`\nfinal slice-path state: ${sliceState()} (must be CONTROL)`)
