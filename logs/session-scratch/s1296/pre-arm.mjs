// s1296 — PRE-arm control for the gz-h1-newsie red seen in the drift-v3 adjacent battery.
//
// The slice touches ONE file, e2e/gazette-welcome.spec.ts, and the red is in a DIFFERENT spec
// file, so a control-flow guarantee already exonerates it. This adds the measurement anyway,
// because the ledger's asymmetry makes it cheap and one-directional: a red on the PRE arm (main
// WITHOUT the slice) CANNOT have been caused by the slice. A green PRE arm proves nothing either
// way at a documented 42.1% base rate — so this can only ever exonerate, never convict, and that
// is stated up front rather than discovered afterwards.
//
// Arms set and asserted by ABSOLUTE BLOB HASH (F-1295-1), interleaved, --workers=1, scratch port.
import { spawn, spawnSync } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import { loadavg } from 'node:os'

const WT = '/Users/robin/Claude/Projects/gr-s1296-gate'
const OUT = '/Users/robin/Claude/Projects/Gold Rush/logs/session-scratch/s1296'
const PORT = 5244
const BASE = `http://127.0.0.1:${PORT}`
const SUBJECT = 'e2e/gazette-welcome.spec.ts'
const SPEC = 'e2e/gz-h1-newsie.spec.ts'
const POST_BLOB = '6076480e6dfb78b64b91f5e12b0e671037218e8e' // lane/m4 — slice applied
const PRE_BLOB = '7c0d0016a4d8990521b3f5164fe723c18d4268c1' // main — slice absent

mkdirSync(OUT, { recursive: true })
const git = (args) => spawnSync('git', args, { cwd: WT, encoding: 'utf8' })

const setArm = (arm) => {
  git(['checkout', arm === 'PRE' ? 'main' : 'lane/m4', '--', SUBJECT])
  const now = spawnSync('git', ['hash-object', SUBJECT], { cwd: WT, encoding: 'utf8' }).stdout.trim()
  const want = arm === 'PRE' ? PRE_BLOB : POST_BLOB
  if (now !== want) throw new Error(`ARM MISMATCH: wanted ${arm} (${want}) got ${now}`)
}

const srv = spawn('npx', ['vite', '--host', '127.0.0.1', '--port', String(PORT), '--strictPort'], {
  cwd: WT, stdio: ['ignore', 'pipe', 'pipe'],
})
let srvLog = ''
srv.stdout.on('data', (d) => { srvLog += d })
srv.stderr.on('data', (d) => { srvLog += d })

const waitUp = async () => {
  for (let i = 0; i < 80; i += 1) {
    try { const r = await fetch(BASE); if (r.ok) return true } catch { /* not up */ }
    await new Promise((r) => setTimeout(r, 500))
  }
  return false
}

const runOnce = (arm, round) => {
  setArm(arm)
  const before = loadavg()[0]
  const t = Date.now()
  const r = spawnSync('npx', ['playwright', 'test', SPEC, '--project=desktop-chrome', '--project=mobile-chrome', '--workers=1', '--reporter=line'], {
    cwd: WT, encoding: 'utf8', env: { ...process.env, GR_CAPTURE_BASE_URL: BASE, GR_CAPTURE_EXTERNAL_SERVER: '1' }, maxBuffer: 64 * 1024 * 1024,
  })
  const out = `${r.stdout ?? ''}${r.stderr ?? ''}`
  writeFileSync(`${OUT}/prearm-${arm}-r${round}.log`, out)
  const reds = out.split('\n').filter((l) => /^\s+\d+\) /.test(l)).map((l) => l.trim())
  const rec = out.match(/Received: "(.*)"/)?.[1] ?? null
  return { arm, round, rc: r.status, wall: (Date.now() - t) / 1000, reds: reds.length, titles: reds, received: rec, load: `${before.toFixed(2)}→${loadavg()[0].toFixed(2)}` }
}

const main = async () => {
  if (!await waitUp()) { console.error(`SERVER FAILED\n${srvLog}`); srv.kill(); process.exit(1) }
  console.log(`server up on ${PORT}  PRE=${PRE_BLOB.slice(0, 8)} POST=${POST_BLOB.slice(0, 8)}\n`)
  const results = []
  // interleaved, round 2 order-reversed
  for (const [round, order] of [[1, ['PRE', 'POST']], [2, ['POST', 'PRE']]]) {
    for (const arm of order) {
      const r = runOnce(arm, round)
      results.push(r)
      console.log(`${arm} r${round}: rc=${r.rc} reds=${r.reds} ${r.wall.toFixed(1)}s load ${r.load}${r.received ? `  Received "${r.received}"` : ''}`)
      for (const t of r.titles) console.log(`    ✘ ${t}`)
    }
  }
  setArm('POST') // leave the gate tree in the merged arm
  writeFileSync(`${OUT}/prearm-results.json`, JSON.stringify(results, null, 2))
  const pre = results.filter((r) => r.arm === 'PRE')
  const post = results.filter((r) => r.arm === 'POST')
  console.log(`\nPRE  reds ${pre.reduce((a, r) => a + r.reds, 0)} / ${pre.length * 2} instances`)
  console.log(`POST reds ${post.reduce((a, r) => a + r.reds, 0)} / ${post.length * 2} instances`)
  srv.kill()
  process.exit(0)
}
main()
