import fs from 'node:fs'

const bp = 'tasks/BACKLOG.md'
let b = fs.readFileSync(bp, 'utf8')
const before = b

const anchor = "## OWNER'S DESK\n"
if (!b.includes(anchor)) throw new Error("OWNER'S DESK anchor not found")

const ITEM = `📊 **THE ASSAY OFFICE IS ALIVE AND EMPTY — every window of "see it being alive immediately" currently renders ZERO (F-1043-2(b), s1043 2026-07-25, MEASURED).** The spine you ordered on 2026-07-09 is now **structurally complete** — all three windows shipped (site section s261, in-game Claim Ledger page s753, and the Ticker quoting tool s1043 \`5227409f\`) — and the endpoint is **healthy**: I probed it directly, \`GET https://gold-rush-3in.pages.dev/api/stats\` → **HTTP 200**, \`{"ok":true,"empty":true,"stats":{"runs":{"today":0,"sevenDays":0,"allTime":0}}}\`. The KV binding fix landed 5 days ago (\`41d8e1ae\`/\`47c5fb20\`) and the payload shape is exactly right. **But the count is zero, all-time.** Two possible causes and I did NOT guess between them: either **(a)** nobody has played the *deployed* Pages build since the binding was fixed (the family may be playing local/release builds, which never beacon to production), or **(b)** run-end beacons are reaching the worker but not being persisted/counted. **THE ASK — one word, and it decides who does what:** say **"check"** and an attended session traces the ingest path end-to-end (open the deployed build, finish one run, watch the KV write, then re-read \`/api/stats\`) — this is ~15 minutes and settles (a) vs (b) for good; or say **"expected"** if you already know the family only plays local builds, in which case the spine is working perfectly and the zeros are honest, and I will record that so no future fire re-raises this. **Why a fire did not just do it:** tracing it crosses \`functions/\` + live deploy state and would mean either playing the game as you or poking production — §7.3 owner-decision territory, not fire scope. *(Recommendation: **"check"** — a statistics page that has never once shown a non-zero number is indistinguishable from a broken one, and you asked to "see it being alive". The measurement above is the cheap half; the other half needs one real run against the deployed build.)* Related and already handled without you: **F-1043-2(a)** — the new Ticker tool reported that healthy-but-empty endpoint as *"the wire is quiet."* (i.e. as if it were **down**), because the authoring master ordered the two states to share one line while the two shipped windows keep them apart. Corrective authored + queued the same fire (\`lane-a-tl-03-window-3-quiet-wire-honesty\`); **no ruling needed from you** — it just matches the wording Windows 1 and 2 already use.\n`

b = b.replace(anchor, anchor + ITEM)
if (b === before) throw new Error('BACKLOG unchanged — refusing to write')
fs.writeFileSync(bp, b)
console.log("BACKLOG.md: F-1043-2(b) added at the top of OWNER'S DESK")
