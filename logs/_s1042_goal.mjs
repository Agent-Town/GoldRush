// s1042: GOAL REGISTRATION LAW — the authored master gets its leaf in the same commit.
// TL-03 Window 3 sits with its siblings (assay-golive = Window-2 enabler, assay-ledger-page = Window 2)
// under factory-infra, matching the shape of the leaves already there.
import fs from 'node:fs'
const p = 'tasks/goals.json'
const g = JSON.parse(fs.readFileSync(p, 'utf8'))
const fi = g.goals.find((x) => x.id === 'factory-infra')
if (!fi) throw new Error('factory-infra goal missing — refusing to guess')
if (fi.tasks.some((t) => t.id === 'tl-03-window-3')) throw new Error('leaf already present — refusing to duplicate')

const idx = fi.tasks.findIndex((t) => t.id === 'assay-ledger-page')
const leaf = {
  id: 'tl-03-window-3',
  title:
    'TL-03 Window 3 — the Ticker/Gazette quotes /api/stats for real numbers (last open window of the owner-ordered Assay Office spine; drafting tool only, publication stays owner-only)',
  status: 'authored-banked',
  taskFile: 'lane-a-tl-03-window-3-ticker-stats.md',
  note:
    'FIRE-AUTHORED s1042 from specs/accounts/README.md:29,32 (slice marked fire-authorable). BANKED, NOT QUEUED: a Codex run on lane-a would have injected CPU load into the LIVE lane-c repair-dwell timing verification, which measures a ~150ms transient with a ~100ms poller. Queue it once tasks/running/lane-c.pid is gone.',
}
fi.tasks.splice(idx < 0 ? fi.tasks.length : idx + 1, 0, leaf)
fs.writeFileSync(p, JSON.stringify(g, null, 2) + '\n')
console.log('leaf tl-03-window-3 registered under factory-infra at index', (idx < 0 ? fi.tasks.length : idx + 1))
