import fs from 'node:fs'

const gp = 'tasks/goals.json'
const g = JSON.parse(fs.readFileSync(gp, 'utf8'))

const leaf = {
  id: 'tl-03-window-3-quiet-wire-honesty',
  title: 'F-1043-2(a)/F-1043-1: "the wire is quiet" must mean the wire IS quiet — split empty-office from down-endpoint in the Ticker quoting tool, matching Window 2\'s shipped wording',
  status: 'queued',
  taskFile: 'lane-a-tl-03-window-3-quiet-wire-honesty.md',
  attempts: 0,
  note: 'FIRE-AUTHORED s1043 from its own drain review (reviews/tl-03-window-3-ticker-stats.md, F-1043-2(a) + F-1043-1). The AUTHORING fire\'s defect, not the runner\'s: s1042 scope 3 ordered the graceful-empty state to share the failure line, and the runner obeyed exactly, harness case included. Measured at the drain: GET /api/stats answers HTTP 200 {ok:true, empty:true, runs.allTime:0} while the tool prints "the wire is quiet." — a healthy endpoint reported as down, which invites a drafting fire to write "no news" on a day the office simply has no assays yet. Windows 1 and 2 both keep the two states apart in the spine\'s ratified wording (src/encyclopedia/liveStats.ts: empty -> "the office opens with the first assay.", non-ok -> "the wire is quiet."), so this is a divergence to end, not a design fork. Scope also closes F-1043-1 (a renamed endpoint constant currently degrades to the quiet-wire line) via a stderr operator diagnostic while keeping stdout paste-safe and exit 0. Acceptance evidence is observable TODAY: the live run must flip from "the wire is quiet." to "the office opens with the first assay.", plus a mandatory scope-5d mutation control (re-introduce the defect -> harness must go RED). Firewall: the two scripts only; liveStats.ts is READ for wording, never edited. NOT in scope and deliberately so: F-1043-2(b), the allTime:0 zero-tallies question, which crosses functions/ + deploy state and sits on the owner\'s desk.',
}

let parent = null
const walk = (n) => {
  if (Array.isArray(n)) return n.forEach(walk)
  if (!n || typeof n !== 'object') return
  if (Array.isArray(n.tasks) && n.tasks.some((t) => t && t.id === 'tl-03-window-3')) parent = n
  for (const v of Object.values(n)) if (v && typeof v === 'object') walk(v)
}
walk(g)
if (!parent) throw new Error('could not find the subgoal holding tl-03-window-3')
if (parent.tasks.some((t) => t.id === leaf.id)) throw new Error('leaf already registered')

const at = parent.tasks.findIndex((t) => t.id === 'tl-03-window-3')
parent.tasks.splice(at + 1, 0, leaf)
fs.writeFileSync(gp, `${JSON.stringify(g, null, 2)}\n`)
console.log(`registered ${leaf.id} under subgoal "${parent.id}" (after tl-03-window-3), status queued`)
