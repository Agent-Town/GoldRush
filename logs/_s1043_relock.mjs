import fs from 'node:fs'
const p = 'STATUS.md'
const L = fs.readFileSync(p, 'utf8').split('\n')
if (!L[0].startsWith('Last updated:') || !L[0].includes('s1043 handoff')) {
  throw new Error('line-1 is not my own s1043 handoff — refusing: ' + L[0].slice(0, 120))
}
fs.writeFileSync('logs/_s1043_handoff_v1.txt', L[0] + '\n')
L[0] = `ACTIVE ${process.argv[2]} (s1043 fire, RE-TAKEN) — the honesty corrective finished 4 minutes after I handed off saying it was live (verification has a shelf life, again): draining lane-a tl-03-window-3-quiet-wire-honesty as drain #2, riders = the live before/after flip, the scope-5d control shown RED, and liveStats.ts read-not-edited`
fs.writeFileSync(p, L.join('\n'))
console.log('re-locked; v1 handoff line stashed to logs/_s1043_handoff_v1.txt')
