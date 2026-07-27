// s1146 drain gate: run a spec list on BOTH projects against a scratch-port server.
// Owns its own vite child so it can stop it by HANDLE, never by a pid read earlier
// (the s1136 near-miss law). Scratch port keeps 5188 free for the lane runners.
import { spawn, spawnSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'

const PORT = Number(process.env.GATE_PORT || 5261)
const BASE = `http://127.0.0.1:${PORT}`
const SPECS = process.argv.slice(2)
if (!SPECS.length) { console.error('usage: node tmp-s1146-gate.mjs <spec...>'); process.exit(2) }

const server = spawn('npx', ['vite', '--host', '127.0.0.1', '--port', String(PORT), '--strictPort'], {
  stdio: 'ignore', detached: false,
})

const wait = async () => {
  for (let i = 0; i < 60; i++) {
    try { const r = await fetch(BASE); if (r.ok) return true } catch {}
    await new Promise((r) => setTimeout(r, 500))
  }
  return false
}

const out = []
let overall = 0
try {
  if (!await wait()) { console.error(`server never came up on ${PORT}`); server.kill('SIGTERM'); process.exit(3) }
  console.log(`server up on ${BASE}`)

  for (const project of ['desktop-chrome', 'mobile-chrome']) {
    const started = Date.now()
    const r = spawnSync('npx', ['playwright', 'test', ...SPECS, `--project=${project}`, '--workers=1', '--reporter=list'], {
      encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
      env: { ...process.env, GR_CAPTURE_EXTERNAL_SERVER: '1', GR_CAPTURE_BASE_URL: BASE },
      timeout: 30 * 60 * 1000,
    })
    const secs = ((Date.now() - started) / 1000).toFixed(1)
    const text = `${r.stdout ?? ''}\n${r.stderr ?? ''}`
    if (r.status !== 0) overall = 1
    // summary line + every failure's first line
    const summary = (text.match(/^\s*\d+ (passed|failed|flaky|skipped).*$/gm) || []).join(' | ')
    const fails = (text.match(/^\s*\d+\) .*$/gm) || [])
    const atLines = (text.match(/^\s+at .*spec\.ts:\d+:\d+$/gm) || [])
    out.push(`\n${'='.repeat(70)}\nPROJECT ${project}  rc=${r.status}  ${secs}s\n${'='.repeat(70)}\n${text}`)
    console.log(`\n--- ${project}: rc=${r.status} (${secs}s)`)
    console.log(`    ${summary || '(no summary line)'}`)
    fails.forEach((f) => console.log(`    FAIL ${f.trim().slice(0, 150)}`))
  }
} finally {
  server.kill('SIGTERM')
  writeFileSync('artifacts/s1146-drain-gate.txt', out.join('\n'))
  console.log('\nfull output -> artifacts/s1146-drain-gate.txt')
}
process.exit(overall)
