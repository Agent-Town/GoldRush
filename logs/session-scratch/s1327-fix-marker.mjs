import { readFileSync, writeFileSync } from 'node:fs'

const p = 'tasks/BACKLOG.md'
let L = readFileSync(p, 'utf8').split('\n')

// 1. Re-mark F-1327-1 from 🔴 to 🟡 so the census can actually see it.
const i = L.findIndex((l) => l.startsWith('🔴 **F-1327-1'))
if (i === -1) throw new Error('F-1327-1 🔴 row not found — refusing to guess')
L[i] = L[i].replace(/^🔴 /, '🟡 ')
// Keep the severity claim that the marker used to carry, now in words.
L[i] = L[i].replace(
  '(s1327, MEASURED WHILE THE RUN WAS LIVE',
  '(s1327, BLOCKING-CLASS, MEASURED WHILE THE RUN WAS LIVE',
)

const f3 = '🟡 **F-1327-3 (s1327, PROVEN BY MANUFACTURING THE DEFECT IN BOTH DIRECTIONS — THE FINDINGS CENSUS IS BLIND TO 27 OF THE 29 MARKERS THE LEDGER ACTUALLY USES, INCLUDING EVERY 🔴).** `scripts/findings-state-guard.mjs:64` reads `if (!lead.startsWith(\'🟡\') && !lead.startsWith(\'✅\') && !struck && !bulletClosed) continue;` — so a row is only a *declaration* if it leads with 🟡 or ✅. **Measured on the live ledger: of 387 rows matching `<marker> **F-…`, only 182 lead with ✅ (125) or 🟡 (57). The other 205 rows, across 27 distinct markers, are skipped entirely — 🔻 33, 🔴 27, 🔺 25, 🟠 18, 🟢 14, ✍️ 13, 🔬 12, 🚨 11, 🔵 10, and 18 more.** ✅ **PROVEN BY CONTROL, not by reading the line — a passing guard never executes its violation path, so its green says nothing about its red.** `logs/session-scratch/s1327-marker-blindness-probe.mjs` builds a synthetic `--root` declaring one F-ID **both** ✅-closed and open, and varies only the open row’s marker: **🟡 → `double-state=1`, rc=1, CAUGHT** · **🔴 / 🟠 / 🔵 / 🚨 / 🔺 → `double-state=0`, rc=0, MISSED.** The 🟡 arm proves the harness works, so the five misses are the guard’s vocabulary and not a broken probe. ⚠️ **This is the exact hazard the guard exists to stop, re-entering through the marker column:** a 🔴 row saying *still owed* and a ✅ row saying *shipped* can coexist forever, and the census will report `double-state: 0` — the same "half-retired ledger entry is worse than none" shape as F-1307-3, which named 🔵/🟠 but measured neither the count nor 🔴. **🔴 is the one that matters most: it is the marker reached for when a finding is serious** (F-1314-1 and F-1315-1 are both 🔴 and both genuinely open today). 🪞 **The finding caught itself, which is the cheapest possible demonstration:** I filed F-1327-1 above as 🔴 because it is blocking-class, and it was invisible to the census the moment I wrote it. It is 🟡 now, with the severity moved into words. ⓘ **The guard’s header is honest about this** — *"zero here means zero in that narrow vocabulary, not a clean ledger"* — but nobody had ever measured how narrow, and 47% coverage is not what a reader assumes from a PASS. ➡️ **CURE (fire-authorable, but it is a triage job, not a one-line widen): treat ANY leading marker as a declaration, keep the 90-character subject zone untouched, and expect ~205 newly-visible rows to need triage** — some will be genuine double-states, others legitimate pointers/re-statements (🔺 owner-desk rows in particular re-cite findings declared elsewhere, so widening naively would mint false conflicts, which is precisely why the zone must not be widened at the same time). **Do it as its own slice with the delta reviewed row by row; do not fold it into an unrelated drain.** 💡 *Reusable shape: **a guard’s vocabulary is a denominator.** This one reports three confident integers and a PASS, and every one of them is scoped to a marker set no reader sees. When a guard is green, ask what it declined to look at — and prove the answer by making it red on purpose.*'

const anchor = L.findIndex((l) => l.startsWith('🟡 **F-1327-2'))
if (anchor === -1) throw new Error('anchor F-1327-2 not found')
L.splice(anchor + 1, 0, '', f3)

writeFileSync(p, L.join('\n'))
console.log('F-1327-1 re-marked 🔴 -> 🟡 at line ' + (i + 1))
console.log('F-1327-3 filed after F-1327-2 (line ' + (anchor + 1) + ')')
