import fs from 'node:fs'
const p = 'STATUS.md'
const L = fs.readFileSync(p, 'utf8').split('\n')
const stamp = process.argv[2]
L[0] = `ACTIVE ${stamp} (s1043 fire) — drain lane-a TL-03 Window 3 (ticker-stats quoting tool, lane/m3 tip 46146b0b, additive +243/2 new files) with s1042's two named riders: prove scope 5d's poisoned-fixture guard actually THROWS, and check scope 2's shared-endpoint finding was REPORTED not silently fixed`
fs.writeFileSync(p, L.join('\n'))
console.log('line1 ->', L[0])
