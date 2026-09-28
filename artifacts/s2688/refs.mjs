// s2688: per landing, its review file(s) and whether the gazette queue already cites it.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
const gz = fs.readFileSync('marketing/outbox/gazette-queue.md', 'utf8')
for (const h of ['dd5c74b97', 'c582dda25', '647337be2', '1920cfbbe', '0bfb168ea', '960cbb249', '3f5bc0456']) {
  const files = execFileSync('git', ['show', '--pretty=format:', '--name-only', '-m', '--first-parent', h], { encoding: 'utf8' })
    .split('\n').filter((f) => f.startsWith('reviews/') && f.endsWith('.md'))
  console.log(`${h} reviews=${files.join(',')} gazette-cites=${gz.split(h).length - 1}`)
}
