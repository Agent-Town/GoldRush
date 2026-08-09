#!/usr/bin/env node
// s1595 — the narrow arm, RE-AIMED at the sub-class where it is a FACT and not a
// judgement: DISPATCH rows.
//
// A dispatch row is `🔧 **<slug>** \`tasks/<file>.md\` (<slot>) — ...`. Unlike a
// finding row, it does not describe a problem — it ADVERTISES A QUEUEABLE MASTER
// BY PATH. So the question has a yes/no answer with no interpretation in it:
//
//   does the HEADER invite dispatch, while the TAIL says the master already
//   shipped at a hash that is an ancestor of main, AND the master file still
//   sits in tasks/ where a fire can `cp` it?
//
// That conjunction is Mistake #8 armed and loaded (the 824k flail: Codex
// re-deriving an already-merged diff). It is the arm worth having.
import { readFileSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const HEADER_CHARS = 260
const CLOSURE_VERBS = ['SHIPPED', 'MERGED', 'DRAINED', 'CLOSED', 'DONE', 'LANDED', 'ABSORBED', 'SUPERSEDED', 'WITHDRAWN', 'REJECTED', 'CURED']
const DISPATCH_WORDS = ['AWAITING DISPATCH', 'FIRE-AUTHORED', 'READY-FOR-DISPATCH', 'READY FOR DISPATCH', 'QUEUE IT', 'AWAITING A LANE', 'UNQUEUED']

const cache = new Map()
function onMain(h) {
  if (cache.has(h)) return cache.get(h)
  let ok = false
  try { execFileSync('git', ['merge-base', '--is-ancestor', h, 'main'], { stdio: 'ignore' }); ok = true } catch {}
  cache.set(h, ok); return ok
}

const lines = readFileSync('tasks/BACKLOG.md', 'utf8').split('\n')
let dispatchRows = 0, headerInvites = 0
const hits = []

for (let i = 0; i < lines.length; i++) {
  const body = lines[i].replace(/^-\s*/, '')
  // A dispatch row names a task file by path in backticks. WIDENED s1595 after
  // varying the pattern: the original required `**slug** \`tasks/x.md\`` and saw
  // only 15 rows, while 322 rows cite a tasks/*.md path in backticks at all. The
  // cp-able path is the load-bearing part, not the slug's position — so key on
  // the path and take whatever bolded slug the row happens to carry.
  const pm = body.match(/`(tasks\/[^`]+\.md)`/)
  if (!pm) continue
  const taskPath = pm[1]
  const slug = (body.match(/\*\*`?([A-Za-z0-9][A-Za-z0-9-]*)`?\*\*/) || [, '?'])[1]
  dispatchRows++

  const header = body.slice(0, HEADER_CHARS).toUpperCase()
  const invites = DISPATCH_WORDS.some(w => header.includes(w))
  const declares = CLOSURE_VERBS.some(v => header.includes(v))
  if (!invites || declares) continue
  headerInvites++

  const tail = body.slice(HEADER_CHARS)
  const cm = /\b(SHIPPED|MERGED|DRAINED|CLOSED)\b[^.!?]{0,60}?\b([0-9a-f]{7,40})\b/i.exec(tail)
  if (!cm) continue
  if (!onMain(cm[2])) continue

  hits.push({
    line: i + 1, slug, taskPath,
    fileStillThere: existsSync(taskPath),
    hash: cm[2], ctx: cm[0].slice(0, 80),
    header: body.slice(0, 190),
  })
}

console.log(`DENOMINATOR: ${dispatchRows} dispatch rows (naming a tasks/*.md by path)`)
console.log(`  ${headerInvites} whose header INVITES dispatch and declares no closure`)
console.log(`  ${hits.length} of those shipped at a hash that is an ancestor of main  <-- ARMED\n`)

for (const h of hits) {
  console.log(`--- ${h.slug}  (BACKLOG.md:${h.line})`)
  console.log(`    header : ${h.header}`)
  console.log(`    tail   : "${h.ctx}"  [on main]`)
  console.log(`    master : ${h.taskPath}  ${h.fileStillThere ? '*** STILL ON DISK — cp-able ***' : '(absent)'}`)
  console.log('')
}
