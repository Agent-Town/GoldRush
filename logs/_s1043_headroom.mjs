// s1043 drain evidence: measure the 140-char cap's real headroom, since the length guard
// shares the THROW path with the deny-list guard (an over-long line kills the tool rather
// than degrading to the quiet-wire line). Answers "at what tally does this bite?" with a
// number instead of a guess.
import { render, UnsafeTickerCopyError } from '../scripts/ticker-stats.mjs'

const fx = (n) => ({
  ok: true,
  empty: false,
  stats: {
    runs: { today: n, sevenDays: n, allTime: n },
    deepestWave: n,
    medianDurationBucket: '3-5m',
    durationHistogram: { lt1m: n, '1-3m': n, '3-5m': n, '5-10m': n, '10-20m': n, '20mplus': n },
    busiestContract: { id: 'e1-dry-gulch', runs: n },
    tierSplit: { FULL: n, BALANCED: n, LITE: n },
    deviceSplit: { desktop: n, mobile: n, tablet: n },
    frameP95ByDevice: {
      desktop: { lt16: n, '16-25': n, '25-33': n, '33-50': n, '50plus': n },
      mobile: { lt16: n, '16-25': n, '25-33': n, '33-50': n, '50plus': n },
      tablet: { lt16: n, '16-25': n, '25-33': n, '33-50': n, '50plus': n },
    },
    frameP95Global: { lt16: n, '16-25': n, '25-33': n, '33-50': n, '50plus': n },
    wavesHistogram: { '0-4': n, '5-9': n, '10-19': n, '20-29': n, '30-39': n, '40plus': n },
    updatedAt: '2026-07-09T09:00:00.000Z',
  },
})

// longest line at the fixture's own scale
const base = render(fx(42)).split('\n')
const longest = base.reduce((a, b) => (b.length > a.length ? b : a))
console.log(`longest line at count=42: ${longest.length} chars`)
console.log(`  "${longest}"`)

// walk the per-bucket count up until the guard trips
for (const n of [42, 999, 9_999, 99_999, 999_999, 9_999_999, 99_999_999]) {
  try {
    const lines = render(fx(n)).split('\n')
    const max = Math.max(...lines.map((l) => l.length))
    console.log(`count=${String(n).padStart(9)} -> longest ${max} chars, guard OK`)
  } catch (e) {
    const kind = e instanceof UnsafeTickerCopyError ? 'UnsafeTickerCopyError' : e.constructor.name
    console.log(`count=${String(n).padStart(9)} -> THROWS ${kind}: ${e.message}`)
    break
  }
}
