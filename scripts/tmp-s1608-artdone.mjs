// s1608 — prefix the ART done-move with the runner's own commit (the ART slot commits its
// own output, so its "merge hash" is that runner commit, not a fire merge).
import { renameSync, existsSync } from 'node:fs'
const D = '/Users/robin/Claude/Projects/Gold Rush/tasks/done'
const src = `${D}/20260810-005819-f1608-1-eight-winds-two-row-composite.md`
const dst = `${D}/drained-6c780b621-20260810-005819-f1608-1-eight-winds-two-row-composite.md`
if (existsSync(src)) {
  renameSync(src, dst)
  console.log('prefixed ->', dst.split('/').pop())
} else console.log('already prefixed or absent')
