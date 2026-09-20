// F-1294-2 TRUE control arm — s1295.
//
// WHY THIS REPLACES THE FIRST HARNESS: my first attempt applied the slice to main's tree and
// aborted with ARM MISMATCH, because `git checkout lane/e2-arsenal -- <4 paths>` produced ZERO
// change. Cause (F-1295-1): the slice content was ALREADY on main — swept there at 16:59 by
// 3058fca5 "rehearsal round 2 launched", a concurrent attended commit whose broad `git add`
// swallowed the four paths s1294 had checked out into main's working tree in order to gate them.
// So both of my arms were the same tree and there was no control at all.
//
// The correct arms are therefore PRE-SWEEP vs POST-SWEEP, not main vs lane:
//   POST = current main (contains the slice)
//   PRE  = current main with the four slice paths reverted to 00e4c074 (3058fca5's parent)
//
// Run in a DETACHED WORKTREE, never main's tree: a concurrent writer is live on main right now
// (spec commits at 17:20 and 17:26, after my lock), and dirtying main's tree is precisely what
// caused F-1295-1 in the first place. Interleaved per spec, both rounds order-reversed,
// --workers=1 on every run (fire.md §3.1), load sampled around each run.
import { spawn, spawnSync } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import { loadavg } from 'node:os'

const WT = '/Users/robin/Claude/Projects/gr-s1295-control'
const PORT = 5241
const BASE = `http://127.0.0.1:${PORT}`
const OUT = '/Users/robin/Claude/Projects/Gold Rush/logs/session-scratch/s1295'
const PRE_REF = '00e4c074' // 3058fca5^ — main immediately before the sweep
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
const git = (args) => spawnSync('git', args, { cwd: WT, encoding: 'utf8' })

// Arm control by blob identity, not by dirtiness — unambiguous in both directions.
const postBlob = git(['rev-parse', `HEAD:${SLICE_PATHS[0]}`]).stdout.trim()
const preBlob = git(['rev-parse', `${PRE_REF}:${SLICE_PATHS[0]}`]).stdout.trim()
if (postBlob === preBlob) { console.error('ABORT: PRE and POST blobs identical — wrong PRE_REF'); process.exit(2) }
console.log(`worktree ${WT}\nPOST blob ${postBlob}\nPRE  blob ${preBlob}\nport ${PORT}\n`)

const setArm = (arm) => {
  git(['checkout', arm === 'PRE' ? PRE_REF : 'HEAD', '--', ...SLICE_PATHS])
  const now = spawnSync('git', ['hash-object', SLICE_PATHS[0]], { cwd: WT, encoding: 'utf8' }).stdout.trim()
  const want = arm === 'PRE' ? preBlob : postBlob
  if (now !== want) throw new Error(`ARM MISMATCH: wanted ${arm} (${want}) got ${now}`)
}

const server = spawn('npx', ['vite', '--host', '127.0.0.1', '--port', String(PORT), '--strictPort'], {
  cwd: WT, stdio: ['ignore', 'pipe', 'pipe'],
})
let serverLog = ''
server.stdout.on('data', d => { serverLog += d })
server.stderr.on('data', d => { serverLog += d })
const cleanup = () => { try { server.kill('SIGTERM') } catch {} }
process.on('exit', cleanup)
process.on('SIGINT', () => { cleanup(); process.exit(130) })

const waitForServer = async () => {
  for (let i = 0; i < 90; i++) {
    try { const r = await fetch(BASE, { signal: AbortSignal.timeout(2000) }); if (r.ok) return true } catch {}
    await new Promise(r => setTimeout(r, 1000))
  }
  return false
}

const results = []
const runSpec = (spec, arm) => {
  const load0 = loadavg()[0]
  const t0 = Date.now()
  const r = spawnSync('npx', ['playwright', 'test', spec, '--project=desktop-chrome', '--workers=1', '--reporter=line'], {
    cwd: WT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, GR_CAPTURE_EXTERNAL_SERVER: '1', GR_CAPTURE_BASE_URL: BASE },
  })
  const secs = Number(((Date.now() - t0) / 1000).toFixed(1))
  const out = (r.stdout || '') + (r.stderr || '')
  const passed = /(\d+) passed/.exec(out), failed = /(\d+) failed/.exec(out)
  const reasons = [...out.matchAll(/^\s*\d+\)\s+\[.*?\]\s+›\s+(.*)$/gm)].map(m => m[1].trim())
  const rec = {
    spec: spec.replace('e2e/', ''), arm, rc: r.status, secs,
    load0: Number(load0.toFixed(2)), load1: Number(loadavg()[0].toFixed(2)),
    passed: passed ? Number(passed[1]) : 0, failed: failed ? Number(failed[1]) : 0, reasons,
  }
  console.log(`  ${arm.padEnd(4)} ${rec.spec.padEnd(34)} rc=${rec.rc} ${rec.passed}p/${rec.failed}f ${secs}s load ${rec.load0}->${rec.load1}`)
  if (rec.reasons.length) for (const x of rec.reasons) console.log(`         FAIL: ${x}`)
  writeFileSync(`${OUT}/true-${rec.spec}-${arm}-${results.length}.log`, out)
  results.push(rec)
}

if (!(await waitForServer())) { console.error('ABORT: server down\n' + serverLog.slice(-2000)); process.exit(3) }
console.log('dev server up.\n')

console.log('ROUND 1 (PRE first):')
for (const spec of SPECS) { for (const arm of ['PRE', 'POST']) { setArm(arm); runSpec(spec, arm) } }
console.log('\nROUND 2 (POST first — cancels order effects):')
for (const spec of SPECS) { for (const arm of ['POST', 'PRE']) { setArm(arm); runSpec(spec, arm) } }
setArm('POST')

console.log('\n================ VERDICT ================')
let armDependent = false
for (const spec of SPECS.map(s => s.replace('e2e/', ''))) {
  const pre = results.filter(r => r.spec === spec && r.arm === 'PRE')
  const post = results.filter(r => r.spec === spec && r.arm === 'POST')
  const pf = pre.filter(r => r.rc !== 0).length, qf = post.filter(r => r.rc !== 0).length
  if (pf !== qf) armDependent = true
  console.log(`${spec.padEnd(34)} PRE ${pf}/${pre.length} red · POST ${qf}/${post.length} red · ${pf === qf ? 'EQUAL' : '*** ARM-DEPENDENT ***'}`)
}
console.log(armDependent
  ? '\n=> ARM-DEPENDENT — the slice is implicated. Revert it from main.'
  : '\n=> ARMS EQUAL — reds are not the slice. F-1294-2 gate satisfied.')
writeFileSync(`${OUT}/f1294-2-true-results.json`, JSON.stringify({ preRef: PRE_REF, preBlob, postBlob, results, armDependent }, null, 2))
