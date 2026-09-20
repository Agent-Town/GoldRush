// s1590: the goal tree indexes a minority of masters (57.2% carry no leaf, F-1538-1), so a dry
// leaf-scan is NOT a dry board. Sweep tasks/*.md for masters that have never been dispatched.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'

const masters = readdirSync('tasks').filter((f) => f.endsWith('.md') && f !== 'BACKLOG.md')
const done = existsSync('tasks/done') ? readdirSync('tasks/done') : []
const failed = existsSync('tasks/failed') ? readdirSync('tasks/failed') : []
const running = existsSync('tasks/running') ? readdirSync('tasks/running') : []
const backlog = readFileSync('tasks/BACKLOG.md', 'utf8')
const goals = readFileSync('tasks/goals.json', 'utf8')

const seen = (name) =>
  done.some((f) => f.endsWith(name)) ||
  failed.some((f) => f.endsWith(name)) ||
  running.some((f) => f.endsWith(name))

const candidates = []
for (const m of masters) {
  if (seen(m)) continue
  const registered = goals.includes(JSON.stringify(m))
  const mentioned = backlog.includes(m)
  const age = ((Date.now() - statSync(`tasks/${m}`).mtimeMs) / 86400000).toFixed(1)
  candidates.push({ m, registered, mentioned, age: Number(age) })
}
candidates.sort((a, b) => a.age - b.age)
for (const c of candidates) {
  console.log(
    `${String(c.age).padStart(6)}d  leaf=${c.registered ? 'Y' : 'n'} backlog=${c.mentioned ? 'Y' : 'n'}  ${c.m}`,
  )
}
console.log(`\n${candidates.length} never-dispatched master(s) of ${masters.length} in tasks/`)
