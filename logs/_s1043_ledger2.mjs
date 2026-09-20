import fs from 'node:fs'

const hash = process.argv[2]

// ---- goals.json ----
const gp = 'tasks/goals.json'
const g = JSON.parse(fs.readFileSync(gp, 'utf8'))
let hits = 0
const walk = (n) => {
  if (Array.isArray(n)) return n.forEach(walk)
  if (!n || typeof n !== 'object') return
  if (n.id === 'tl-03-window-3-quiet-wire-honesty') {
    n.status = 'merged'
    n.mergeHash = hash
    n.attempts = 1
    n.note = `AUTHORED, RUN AND DRAINED INSIDE ONE FIRE (s1043): the defect was found by a live probe at ~13:00Z, queued at 20:00:29 local, picked up by the runner in ~30s, finished in ~3min, drained as ${hash}. +61/-11 across the two scripts; liveStats.ts READ for the wording, never edited (verified by diff). A healthy-but-empty endpoint and a down endpoint no longer share a line: EMPTY_LINE is byte-identical to shipped Window 2, and render() checks validPayload BEFORE empty so an unusable answer still earns the quiet line. F-1043-1 closed with a typed StatsEndpointReadError caught in its own branch before the fetch, reporting a distinct stderr operator diagnostic while stdout stays paste-safe at exit 0. Gates: tsc clean, build green (1.08s), harness PASS incl. new invalid-shape + endpoint-diagnostic cases, m1-01 boot 8/8 desktop+mobile zero-console. ALL THREE RIDERS discharged by the drain's OWN runs: (1) the LIVE before/after flip against the real endpoint - 'the wire is quiet.' at a30661bf became 'the office opens with the first assay.' on merged main, same endpoint, same fire, so real behaviour changed rather than just an assertion; (2) the mutation control shown RED ('empty office is not a quiet wire', actual vs expected printed) then restored byte-exact; (3) the firewall verified by diff. Review reviews/tl-03-window-3-quiet-wire-honesty.md. F-1043-2(b) (allTime:0) remains OPEN on the owner's desk and is explicitly not this slice's business.`
    delete n.taskFile
    hits++
  }
  for (const v of Object.values(n)) if (v && typeof v === 'object') walk(v)
}
walk(g)
if (hits !== 1) throw new Error(`expected exactly 1 leaf, found ${hits}`)
fs.writeFileSync(gp, `${JSON.stringify(g, null, 2)}\n`)
console.log(`goals.json: tl-03-window-3-quiet-wire-honesty -> merged ${hash}`)

// ---- BACKLOG ----
const bp = 'tasks/BACKLOG.md'
let b = fs.readFileSync(bp, 'utf8')
const before = b
const anchor = '**NOT in scope, deliberately: F-1043-2(b)** (the `allTime:0` zero-tallies question — crosses `functions/` + deploy state, owner\'s desk).'
if (!b.includes(anchor)) throw new Error('NEXT-RUNG anchor not found')

const SHIP = ` ✅ **SHIPPED s1043 — SAME FIRE THAT AUTHORED IT, AND SAME FIRE THAT FOUND THE DEFECT.** Drained lane/m3 \`428c01d5\` → main \`${hash}\`, review \`reviews/tl-03-window-3-quiet-wire-honesty.md\`. Timeline, because the tightness is the point: live probe found the defect ~13:00Z → master authored + queued 20:00:29 local → runner picked it up in **~30 seconds** → finished in **~3 minutes** → drained. **+61/−11, two scripts, and \`liveStats.ts\` was READ for the wording and never edited** (verified by \`git diff --stat 2c5ad61f lane/m3\` = exactly those two files; base was the merge-base with main unmoved on both paths ⇒ byte-exact path-scoped land, no 3-way). \`EMPTY_LINE\` is **byte-identical to shipped Window 2**, and \`render()\` checks \`validPayload\` **before** \`empty\` so an *unusable* answer still earns the quiet line rather than being narrated as "no assays yet" (the safe direction, and the ordering the master specified). **F-1043-1 closed with a typed error rather than a comment:** \`StatsEndpointReadError\` is caught in its **own branch before the fetch** and reports \`ticker-stats: could not read STATS_ENDPOINT from src/encyclopedia/liveStats.ts\` on **stderr**, while stdout stays paste-safe at **exit 0** — a drafting fire is still never blocked, it just stops being lied to. Gates: tsc clean · build green (1.08s) · harness PASS incl. the **new invalid-shape + endpoint-diagnostic cases** · m1-01 boot **8/8** desktop+mobile zero-console. **ALL THREE RIDERS DISCHARGED BY THE DRAIN'S OWN RUNS:** ① **the LIVE before/after flip** — I ran BOTH versions against the real endpoint (\`git show a30661bf:scripts/ticker-stats.mjs\`): \`the wire is quiet.\` → **\`the office opens with the first assay.\`**, same endpoint, same fire, ~30 min apart ⇒ **real behaviour changed, not just an assertion**; ② **the mutation control shown RED** (\`AssertionError: empty office is not a quiet wire\`, actual/expected printed) then restored byte-exact; ③ **the firewall verified by diff.** No new findings. **F-1043-2(b) (\`allTime:0\`) stays OPEN on the owner's desk** — the runner said so honestly too (*"Zero tallies still cannot explain why no assays were recorded"*). No gazette + no deploy (drafting tooling, zero player-visible change, zero \`src/\`).`

b = b.replace(anchor, anchor + SHIP)
if (b === before) throw new Error('BACKLOG unchanged — refusing to write')
fs.writeFileSync(bp, b)
console.log('BACKLOG.md: corrective ship line appended')
