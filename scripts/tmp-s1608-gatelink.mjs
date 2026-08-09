// s1608 — wire node_modules into the detached gate worktree (sibling worktrees use a
// symlink into main's install; a fresh npm ci would cost minutes for nothing).
import { symlinkSync, existsSync } from 'node:fs'
const ROOT = '/Users/robin/Claude/Projects/Gold Rush'
const dest = `${ROOT}/gate-s1608/node_modules`
if (existsSync(dest)) console.log('already present')
else {
  symlinkSync(`${ROOT}/node_modules`, dest, 'dir')
  console.log('symlinked ->', dest)
}
console.log('playwright present:', existsSync(`${dest}/.bin/playwright`))
console.log('tsc present:', existsSync(`${dest}/.bin/tsc`))
