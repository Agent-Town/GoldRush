// s1296 gate battery for drift-v3 (gazette-welcome-drift-observation-frame-v3).
//
// Runs in a DETACHED WORKTREE (F-1295-1 cure, adopted s1295): main's tree is never dirtied with
// foreign content, so a concurrent attended broad `git add` cannot ship a slice past its verdict.
// Arm identity asserted by ABSOLUTE BLOB HASH before any run, never by `git status` cleanliness.
// --workers=1 on every playwright command (fire.md §3.1 / F-1270-1). Scratch port, own vite
// (GR_CAPTURE_EXTERNAL_SERVER=1) so the managed 5188 server cannot collide with a lane run
// (Mistake #12).
import { spawn, spawnSync } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import { loadavg } from 'node:os'

const WT = '/Users/robin/Claude/Projects/gr-s1296-gate'
const OUT = '/Users/robin/Claude/Projects/Gold Rush/logs/session-scratch/s1296'
const PORT = Number(process.env.GR_S1296_PORT ?? 5243)
const BASE = `http://127.0.0.1:${PORT}`
const LANE_BLOB = '6076480e6dfb78b64b91f5e12b0e671037218e8e'

const SPECS = process.argv.slice(2)
if (!SPECS.length) { console.error('usage: gate.mjs <spec...>'); process.exit(2) }

mkdirSync(OUT, { recursive: true })

// ARM CHECK — absolute value, not a relationship.
const observed = spawnSync('git', ['hash-object', 'e2e/gazette-welcome.spec.ts'], { cwd: WT, encoding: 'utf8' }).stdout.trim()
if (observed !== LANE_BLOB) {
  console.error(`ARM MISMATCH: wanted lane blob ${LANE_BLOB}, tree has ${observed}`)
  process.exit(2)
}
console.log(`arm OK — subject blob ${observed} (== lane/m4)`)

const srv = spawn('npx', ['vite', '--host', '127.0.0.1', '--port', String(PORT), '--strictPort'], {
  cwd: WT, stdio: ['ignore', 'pipe', 'pipe'],
})
let srvLog = ''
srv.stdout.on('data', (d) => { srvLog += d })
srv.stderr.on('data', (d) => { srvLog += d })

const waitUp = async () => {
  for (let i = 0; i < 80; i += 1) {
    try { const r = await fetch(BASE); if (r.ok) return true } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 500))
  }
  return false
}

const run = (spec) => {
  const t = Date.now()
  const before = loadavg()[0]
  const r = spawnSync('npx', [
    'playwright', 'test', spec,
    '--project=desktop-chrome', '--project=mobile-chrome',
    '--workers=1', '--reporter=line',
    ...(process.env.GR_S1296_REPEAT ? [`--repeat-each=${process.env.GR_S1296_REPEAT}`] : []),
  ], { cwd: WT, encoding: 'utf8', env: { ...process.env, GR_CAPTURE_BASE_URL: BASE, GR_CAPTURE_EXTERNAL_SERVER: '1' }, maxBuffer: 64 * 1024 * 1024 })
  const out = `${r.stdout ?? ''}${r.stderr ?? ''}`
  const wall = (Date.now() - t) / 1000
  writeFileSync(`${OUT}/${spec.replace(/[/.]/g, '_')}.log`, out)
  const workers = out.match(/Running \d+ tests? using \d+ workers?/)?.[0] ?? '(no Running line)'
  const tally = out.split('\n').filter((l) => /^\s*\d+ (passed|failed|flaky|skipped)/.test(l)).join(' | ')
  const fails = out.split('\n').filter((l) => /^\s+\d+\) /.test(l)).map((l) => l.trim())
  return { spec, rc: r.status, wall, workers, tally, fails, load: `${before.toFixed(2)}→${loadavg()[0].toFixed(2)}` }
}

const main = async () => {
  if (!await waitUp()) { console.error(`SERVER FAILED\n${srvLog}`); srv.kill(); process.exit(1) }
  writeFileSync(`${OUT}/vite.log`, srvLog)
  console.log(`server up on ${PORT}\n`)
  const results = []
  for (const spec of SPECS) {
    const r = run(spec)
    results.push(r)
    console.log(`${r.rc === 0 ? 'PASS' : 'RED '} rc=${r.rc}  ${r.wall.toFixed(1)}s  load ${r.load}  ${spec}`)
    console.log(`      ${r.workers}  ::  ${r.tally}`)
    for (const f of r.fails) console.log(`      ✘ ${f}`)
  }
  writeFileSync(`${OUT}/results.json`, JSON.stringify(results, null, 2))
  srv.kill()
  const red = results.filter((r) => r.rc !== 0)
  console.log(`\n=== ${results.length - red.length}/${results.length} specs green ===`)
  process.exit(0)
}
main()
