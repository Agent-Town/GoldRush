// s1590 refill scan: which goal leaves are still `queued` but sit in no queue directory?
// Those are the refill candidates the ladders already sanctioned.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'

const g = JSON.parse(readFileSync('tasks/goals.json', 'utf8'))
const slots = ['main', 'lane-a', 'lane-b', 'lane-c', 'lane-d', 'art']
const inQueue = new Set()
for (const s of slots) {
  const d = `tasks/queue/${s}`
  if (existsSync(d)) for (const f of readdirSync(d)) inQueue.add(f)
}
const done = existsSync('tasks/done') ? readdirSync('tasks/done') : []

const out = []
const walk = (n) => {
  if (Array.isArray(n)) return n.forEach(walk)
  if (n && typeof n === 'object') {
    if (n.id && n.status === 'queued' && n.taskFile) out.push(n)
    Object.values(n).forEach(walk)
  }
}
walk(g)

for (const leaf of out) {
  const queued = inQueue.has(leaf.taskFile)
  const ranBefore = done.some((f) => f.endsWith(leaf.taskFile))
  const path = `tasks/${leaf.taskFile}`
  const exists = existsSync(path)
  const age = exists ? ((Date.now() - statSync(path).mtimeMs) / 86400000).toFixed(1) : 'n/a'
  console.log(
    [
      queued ? 'IN-QUEUE ' : ranBefore ? 'RAN-BEFORE' : 'READY    ',
      exists ? '' : 'MISSING-MASTER ',
      `age=${age}d`,
      leaf.id,
      `(${leaf.taskFile})`,
    ].join(' '),
  )
}
console.log(`\ntotal queued leaves: ${out.length}`)
