import { readFileSync } from 'node:fs'
const g = JSON.parse(readFileSync('/Users/robin/Claude/Projects/Gold Rush/tasks/goals.json', 'utf8'))
console.log('top keys:', Object.keys(g).join(','))
const hits = []
const walk = (n) => {
  if (n && typeof n === 'object') {
    if (!Array.isArray(n)) {
      const blob = JSON.stringify(n).slice(0, 0) // no-op
      if (typeof n.taskFile === 'string' && /rung-honest-gate-v2/.test(n.taskFile)) hits.push(n)
      else if (typeof n.id === 'string' && /rung-honest-gate-v2/.test(n.id)) hits.push(n)
    }
    for (const v of Object.values(n)) walk(v)
  }
}
walk(g)
console.log('hits:', hits.length)
for (const h of hits) {
  for (const [k, v] of Object.entries(h)) console.log(`  ${k}: ${String(v).slice(0, 220)}`)
  console.log('---')
}
