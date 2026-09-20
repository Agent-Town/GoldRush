import fs from 'node:fs'

// ---- goals.json: tl-03-window-3 queued -> merged ----
const gp = 'tasks/goals.json'
const g = JSON.parse(fs.readFileSync(gp, 'utf8'))
let hits = 0
const walk = (n) => {
  if (Array.isArray(n)) return n.forEach(walk)
  if (!n || typeof n !== 'object') return
  if (n.id === 'tl-03-window-3') {
    n.status = 'merged'
    n.mergeHash = process.argv[2]
    n.note = 'FIRE-AUTHORED s1042, DRAINED s1043. Additive tooling only (scripts/ticker-stats.mjs + its fixture harness, +243/2 new files, base d79e8941, no 3-way). Gates: tsc clean, build green, harness PASS, m1-01 boot 8/8 desktop+mobile zero-console. Rider discharged by the drain’s OWN mutation run: neutering guard() made the harness RED ("Missing expected rejection"), so scope 5d is not vacuous. Scope 2 held — endpoint read from liveStats.ts, no shipped surface touched. F-1043-1 (broken endpoint read degrades to the quiet-wire line) + F-1043-2 (live endpoint is 200/ok/empty with allTime:0 — Window 3 reports "the wire is quiet" for a HEALTHY wire, and the whole spine renders zero) both non-blocking, review reviews/tl-03-window-3-ticker-stats.md. TL-03 COMPLETE — all three windows shipped.'
    delete n.taskFile
    hits++
  }
  for (const v of Object.values(n)) if (v && typeof v === 'object') walk(v)
}
walk(g)
if (hits !== 1) throw new Error(`expected exactly 1 tl-03-window-3 leaf, found ${hits}`)
fs.writeFileSync(gp, `${JSON.stringify(g, null, 2)}\n`)
console.log(`goals.json: tl-03-window-3 -> merged (${hits} leaf)`)

// ---- BACKLOG.md: retire the "WINDOW 3 PENDING" wording in the same commit as the event ----
const bp = 'tasks/BACKLOG.md'
let b = fs.readFileSync(bp, 'utf8')
const before = b

const SHIP = `✅ **TL-03 WINDOW 3 SHIPPED s1043 — THE ASSAY OFFICE SPINE IS COMPLETE (all three windows).** Drained lane/m3 \`46146b0b\` → main \`${process.argv[2]}\`, review \`reviews/tl-03-window-3-ticker-stats.md\`; FIRE-AUTHORED s1042, ran first try (125k tokens, no wall). Additive tooling ONLY — \`scripts/ticker-stats.mjs\` (+157, the drafter's quoting tool: fetches the ONE endpoint, prints ≤140-char ledger-voice lines, derives nothing — no ratios/trends, per "no surface computes its own truth") + \`scripts/test-ticker-stats.mjs\` (+86, fixture-driven, zero network, mirroring \`scripts/test-stats.mjs\`). Base \`d79e8941\` = merge-base and main had never held either path ⇒ byte-exact path-scoped land, **no 3-way, no conflict surface**. Gates on merged main: tsc clean · build green · harness PASS (populated / empty / unreachable+500+garbage-JSON / poison control / shared URL / \`--json\`) · m1-01 boot **8/8** desktop+mobile zero-console (cheap proof nothing leaked into the client bundle). **BOTH s1042 riders discharged by the drain's OWN runs, not the runner's report:** ① the scope-5d guard is **not vacuous** — neutering \`guard()\` turned the harness RED (\`Missing expected rejection: poisoned contract copy trips the deny-list guard\`, exit 1), then restore returned it to +243 byte-exact; ② scope 2 **held** — \`git show --stat\` = exactly 2 new files, so the shared-endpoint question was **reported, not silently fixed** (\`statsEndpoint()\` regex-reads \`const STATS_ENDPOINT\` out of \`src/encyclopedia/liveStats.ts\`, so one source of truth with zero shipped-client change; Window 1's separate hard-code at \`site/assay-office.js:1\` stays a reported pre-existing duplication). **⚠️ F-1043-2 — THE ONE TO READ, and it is about the OWNER ORDER, not the code:** I probed the live endpoint directly — \`GET https://gold-rush-3in.pages.dev/api/stats\` → **HTTP 200**, \`{"ok":true,"empty":true,…"runs":{"today":0,"sevenDays":0,"allTime":0}}\`. So **(a)** the tool prints *"the wire is quiet."* for a **HEALTHY** wire, because scope 3 of the master ordered the graceful-empty state to share the failure line — while shipped Window 2 keeps them apart (\`empty\` → *"the office opens with the first assay."*, unreachable → *"the wire is quiet."*). **A master defect, not a runner defect**; one-line corrective owed so no drafting fire is ever told the wire is down when it is up. And **(b)** \`allTime: 0\` — the binding fix landed and the shape is right, but either nothing has been played against the deployed build since, or beacons are not being persisted. **Every window of "see it being alive immediately" currently renders zero.** Not chased (crosses \`functions/\` + deploy state = inventing scope) → OWNER'S DESK with the measurement attached. **F-1043-1 (non-blocking):** a renamed/moved endpoint constant makes \`statsEndpoint()\` throw a plain Error which the catch converts to the quiet-wire line ⇒ broken-tool and down-endpoint look identical at drafting time; mitigated today because the harness asserts the read (\`assert.match(await statsEndpoint(), …)\`) and goes red on a rename. **Non-finding retired BY MEASUREMENT (don't re-open):** the 140-char cap sharing the throw path is structurally true but practically dead — measured longest line **96 chars** at fixture counts and **132** at 99,999,999 per bucket, so it cannot trip below **1e9 runs per bucket**. No gazette item + no deploy, by the filter laws (drafting tooling, zero player-visible change, zero \`src/\`).`

// (1) the lane-a header sentence that called Window 3 pending
const h = 'Master now BANKED: `tasks/lane-a-tl-03-window-3-ticker-stats.md`.]****'
if (!b.includes(h)) throw new Error('lane-a header anchor not found')
b = b.replace(h, `${h} ${SHIP}`)

// (2) the s1042 sweep entry's GATE-MET sentence
const s = '**GATE MET AND ACTED ON IN THE SAME FIRE (s1042): the run finished mid-fire, was drained (`d79e8941`), and the master was then QUEUED to `tasks/queue/lane-a/` — lane-a is WORKING again, not dry.**'
if (!b.includes(s)) throw new Error('s1042 sweep anchor not found')
b = b.replace(s, `${s} ✅ **AND IT LANDED: drained s1043 → main \`${process.argv[2]}\` on its FIRST run — see the lane-a header for the full gate table + F-1043-1/F-1043-2. TL-03 is COMPLETE.**`)

// (3) the ladder entry at the ASSAY OFFICE spine
const l = 'Ticker/Gazette quoting the same endpoint (real numbers, never token talk).'
if (!b.includes(l)) throw new Error('ladder anchor not found')
b = b.replace(l, `Ticker/Gazette quoting the same endpoint (real numbers, never token talk) ✅ **ALL THREE WINDOWS SHIPPED — Window 3 drained s1043 \`${process.argv[2]}\`, so this ladder is COMPLETE except the F-1043-2 zero-tallies question now on the owner's desk.**`)

if (b === before) throw new Error('BACKLOG unchanged — refusing to write')
fs.writeFileSync(bp, b)
console.log('BACKLOG.md: 3 anchors updated (lane-a header, s1042 sweep entry, ASSAY OFFICE ladder)')
