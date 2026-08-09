// s1608 — is F-1501-3 (the 527.89 MB retention hole) visible to the open-findings census?
// Uses the guard's OWN scan(), never a retyped regex.
import { readFileSync } from 'node:fs'
import { scan } from './findings-state-guard.mjs'

const text = readFileSync('tasks/BACKLOG.md', 'utf8')
const res = scan(text)
console.log('typeof:', typeof res, '| ctor:', res?.constructor?.name)
if (res instanceof Map) {
  console.log('Map size:', res.size)
  console.log('has F-1501-3:', res.has('F-1501-3'), '->', JSON.stringify(res.get('F-1501-3')))
  // controls: an id we KNOW is open, and one we know is closed
  for (const id of ['F-1536-2', 'F-1601-1', 'F-1607-1', 'F-1608-1']) {
    console.log(`  control ${id}: has=${res.has(id)} ->`, JSON.stringify(res.get(id)))
  }
} else {
  console.log(JSON.stringify(res).slice(0, 600))
}
