// s1608 — test:ledger-guards as the LAST act (s1301 law). The drain battery ran on the
// MERGED tree, which by definition PRECEDES the bookkeeping commits, so every guard that
// reads goals.json / BACKLOG.md / law surfaces evaluated the board as it was BEFORE this
// fire wrote its own rows. Re-run now that they exist.
import { execSync } from 'node:child_process'
const t0 = Date.now()
try {
  const out = execSync('npm run test:ledger-guards', {
    cwd: '/Users/robin/Claude/Projects/Gold Rush',
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  console.log(out.slice(-4000))
  console.log(`\nrc=0 in ${((Date.now() - t0) / 1000).toFixed(1)}s`)
} catch (e) {
  console.log((e.stdout || '').slice(-7000))
  console.log('STDERR tail:', (e.stderr || '').slice(-2500))
  console.log(`\nrc=${e.status} in ${((Date.now() - t0) / 1000).toFixed(1)}s`)
}
