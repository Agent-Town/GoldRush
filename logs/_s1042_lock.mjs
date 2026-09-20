import fs from 'node:fs'
const p = 'STATUS.md'
const L = fs.readFileSync(p, 'utf8').split('\n')
const stamp = process.argv[2]
L[0] = `ACTIVE ${stamp} (s1042 fire) — re-probe the INHERITED dry-lane claims (lane-a/b/d) with fresh evidence per s1041's own honest limit; drain repair-dwell if lane-c lands mid-fire`
fs.writeFileSync(p, L.join('\n'))
console.log('line1 ->', L[0])
